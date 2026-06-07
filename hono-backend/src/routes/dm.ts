import { Hono } from 'hono'
import { upgradeWebSocket } from '@hono/node-server'
import { query } from '../db.ts'
import { authService } from '../services/authService.ts'
import { Context } from 'hono'
type WSUpgrader = typeof import('@hono/node-server').upgradeWebSocket
const dm = new Hono()

type Client = {
  ws: any
  userId: number
  name: string
}

// roomId -> connected clients
const rooms = new Map<string, Set<Client>>()

// create or get DM room
dm.post('/room', authService, async (c) => {
  const { user_id } = await c.req.json()
  const current = c.get('user')

  const existing: any = await query(
    `SELECT dr.id
     FROM dm_rooms dr
     JOIN dm_participants dp1
       ON dr.id = dp1.dm_room_id
      AND dp1.employee_id = ?
     JOIN dm_participants dp2
       ON dr.id = dp2.dm_room_id
      AND dp2.employee_id = ?`,
    [current.id, user_id]
  )

  if (existing.length > 0) {
    return c.json({
      room_id: existing[0].id,
    })
  }

  const result: any = await query(
    `INSERT INTO dm_rooms (created_at)
     VALUES (NOW())`
  )

  const roomId = result.insertId

  await query(
    `INSERT INTO dm_participants
      (dm_room_id, employee_id)
     VALUES (?, ?), (?, ?)`,
    [roomId, current.id, roomId, user_id]
  )

  return c.json({
    room_id: roomId,
  })
})

// get rooms
dm.get('/rooms', authService, async (c) => {
  const user = c.get('user')

  const rows: any = await query(
    `SELECT
        dr.id,
        e.id AS other_user_id,
        e.first_name,
        e.last_name,
        e.status,

        (
          SELECT content
          FROM dm_messages
          WHERE room_id = dr.id
          ORDER BY created_at DESC
          LIMIT 1
        ) AS last_message,

        (
          SELECT created_at
          FROM dm_messages
          WHERE room_id = dr.id
          ORDER BY created_at DESC
          LIMIT 1
        ) AS last_message_at

     FROM dm_rooms dr

     JOIN dm_participants dp
       ON dr.id = dp.dm_room_id
      AND dp.employee_id != ?

     JOIN employees e
       ON dp.employee_id = e.id

     WHERE dr.id IN (
       SELECT dm_room_id
       FROM dm_participants
       WHERE employee_id = ?
     )

     ORDER BY last_message_at DESC`,
    [user.id, user.id]
  )

  return c.json(rows)
})

// get room messages
dm.get('/:room_id/messages', authService, async (c) => {
  const roomId = c.req.param('room_id')
  const user = c.get('user')

  const check: any = await query(
    `SELECT employee_id
     FROM dm_participants
     WHERE dm_room_id = ?
       AND employee_id = ?`,
    [roomId, user.id]
  )

  if (!check.length) {
    return c.json({ error: 'Forbidden' }, 403)
  }

  const rows = await query(
    `SELECT
        m.*,
        e.first_name,
        e.last_name

     FROM dm_messages m

     JOIN employees e
       ON m.sender_id = e.id

     WHERE m.room_id = ?

     ORDER BY m.created_at ASC
     LIMIT 200`,
    [roomId]
  )

  return c.json(rows)
})

// send message via HTTP fallback
dm.post('/:room_id/messages', authService, async (c) => {
  const roomId = c.req.param('room_id')!
  const { content } = await c.req.json()
  const user = c.get('user')

  if (!content) {
    return c.json({ error: 'Content required' }, 400)
  }

  const check: any = await query(
    `SELECT employee_id
     FROM dm_participants
     WHERE dm_room_id = ?
       AND employee_id = ?`,
    [roomId, user.id]
  )

  if (!check.length) {
    return c.json({ error: 'Forbidden' }, 403)
  }

  const emp: any = await query(
    `SELECT first_name, last_name
     FROM employees
     WHERE id = ?`,
    [user.id]
  )

  const name = emp.length
    ? `${emp[0].first_name} ${emp[0].last_name}`
    : 'Unknown'

  await query(
    `INSERT INTO dm_messages
      (room_id, sender_id, content, created_at)
     VALUES (?, ?, ?, NOW())`,
    [roomId, user.id, content]
  )

  const roomClients = rooms.get(roomId)

  if (roomClients) {
    const msg = JSON.stringify({
      type: 'message',
      sender_id: user.id,
      sender_name: name,
      content,
      created_at: new Date().toISOString(),
    })

    roomClients.forEach((client) => {
      try {
        client.ws.send(msg)
      } catch { }
    })
  }

  return c.json({ success: true })
})

// websocket endpoint
dm.get(
  '/:room_id/ws',
  async (c, next) => {
    const qToken = c.req.query('token')
    if (qToken) {
      const orig = c.req.raw.headers
      const newHeaders = new Headers(orig)
      newHeaders.set('authorization', `Bearer ${qToken}`)
      Object.defineProperty(c.req.raw, 'headers', { value: newHeaders, configurable: true })
    }
    await next()
  },
  authService,
  upgradeWebSocket((c: Context) => {
    const roomId = c.req.param('room_id')!
    const user = c.get('user')

    return {
      async onOpen(_event: any, ws: any) {
        const check: any = await query(
          `SELECT employee_id
           FROM dm_participants
           WHERE dm_room_id = ?
             AND employee_id = ?`,
          [roomId, user.id]
        ).catch(() => [])

        if (!check.length) {
          ws.close(403, 'Forbidden')
          return
        }

        const emp: any = await query(
          `SELECT first_name, last_name
           FROM employees
           WHERE id = ?`,
          [user.id]
        ).catch(() => [])

        const name = emp.length
          ? `${emp[0].first_name} ${emp[0].last_name}`
          : 'Unknown'

        if (!rooms.has(roomId)) {
          rooms.set(roomId, new Set())
        }

        rooms.get(roomId)!.add({
          ws,
          userId: user.id,
          name,
        })
      },

      async onMessage(event: any, ws: any) {
        try {
          const data = JSON.parse(event.data.toString())

          if (data.type !== 'message' || !data.content) {
            return
          }

          await query(
            `INSERT INTO dm_messages
              (room_id, sender_id, content, created_at)
             VALUES (?, ?, ?, NOW())`,
            [roomId, user.id, data.content]
          )

          const roomClients = rooms.get(roomId)

          const sender = roomClients
            ? [...roomClients].find((c) => c.ws === ws)
            : null

          const msg = JSON.stringify({
            type: 'message',
            sender_id: user.id,
            sender_name: sender?.name || 'Unknown',
            content: data.content,
            created_at: new Date().toISOString(),
          })

          roomClients?.forEach((client) => {
            try {
              client.ws.send(msg)
            } catch { }
          })
        } catch (err) {
          console.error(err)
        }
      },

      onClose(_event: any, ws: any) {
        const roomClients = rooms.get(roomId)

        if (!roomClients) return

        roomClients.forEach((client) => {
          if (client.ws === ws) {
            roomClients.delete(client)
          }
        })

        if (roomClients.size === 0) {
          rooms.delete(roomId)
        }
      },
    }
  })
)

export default dm