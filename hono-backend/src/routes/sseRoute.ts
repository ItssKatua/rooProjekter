import { Hono } from 'hono'
import { authService } from '../services/authService.ts'
import { addSSEClient, removeSSEClient } from '../sse.ts'
import { randomUUID } from 'node:crypto'

const sseRoute = new Hono()

sseRoute.get('/', authService, (c) => {
  const id = randomUUID()

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()

      const client = {
        id,
        send: (data: string) => {
          controller.enqueue(encoder.encode(data))
        },
        close: () => {
          try { controller.close() } catch {}
        },
      }

      addSSEClient(client)

      // send a heartbeat comment every 25s to keep connection alive
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'))
        } catch {
          clearInterval(heartbeat)
          removeSSEClient(client)
        }
      }, 25000)

      // cleanup when connection closes
      const req = c.req.raw
      req.signal?.addEventListener('abort', () => {
        clearInterval(heartbeat)
        removeSSEClient(client)
        try { controller.close() } catch {}
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
})

export default sseRoute 