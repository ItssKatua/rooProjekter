import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { upgradeWebSocket } from '@hono/node-server'

import type { Variables } from './types.ts'

import authRoute from './routes/authRoute.ts'
import dmRoute from './routes/dm.ts'
import employRoute from './routes/employees.ts'
import postRoute from './routes/posts.ts'

const app = new Hono<{ Variables: Variables }>()

app.use(
  '*',
  cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  })
)

app.route('/auth', authRoute)
app.route('/employees', employRoute)
app.route('/posts', postRoute)
app.route('/dm', dmRoute)

app.get('/health', (c) => c.json({ ok: true }))

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server running on http://localhost:${info.port}`)
  }
)

export default app