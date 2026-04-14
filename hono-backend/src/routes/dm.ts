import { Hono } from 'hono'
import { query } from '../db.ts'
import { authService } from '../services/authService.ts'

const dm = new Hono()

dm.use('*', authService)

// create room
dm.post('/room', authService, async (c) => {
  const { user_id } = await c.req.json()
  const current = c.get('user')

  const result: any = await query(`
    INSERT INTO dm_rooms (created_at)
    VALUES (NOW())
  `)

  const roomId = result.insertId

  await query(`
    INSERT INTO dm_participants (dm_room_id, employee_id)
    VALUES (?, ?), (?, ?)
  `, [roomId, current.id, roomId, user_id])

  return c.json({ room_id: roomId })
})

// list all dms
dm.get('/rooms', authService, async (c) => {
  const user = c.get('user')

  const rows = await query(`
    SELECT dr.id
    FROM dm_rooms dr
    JOIN dm_participants dp ON dr.id = dp.dm_room_id
    WHERE dp.employee_id = ?
  `, [user.id])

  return c.json(rows)
})

// get msg
dm.get('/:room_id', async (c) => {
  const roomId = c.req.param('room_id')

  const rows = await query(`
    SELECT 
      m.*,
      e.first_name,
      e.last_name
    FROM dm_messages m
    JOIN employees e ON m.sender_id = e.id
    WHERE m.room_id = ?
    ORDER BY m.created_at ASC
  `, [roomId])

  return c.json(rows)
})

// send
dm.post('/:room_id', authService, async (c) => {
  const roomId = c.req.param('room_id')
  const { content } = await c.req.json()
  const user = c.get('user')

  await query(`
    INSERT INTO dm_messages (room_id, sender_id, content, created_at)
    VALUES (?, ?, ?, NOW())
  `, [roomId, user.id, content])

  return c.json({ success: true })
})

export default dm