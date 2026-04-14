import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { sValidator } from '@hono/standard-validator'

import authRoute from './routes/authRoute.ts'
// import dmRoute from './routes/dm.ts'
// import employRoute from './routes/employees.ts'
// import postRoute from './routes/posts.ts'

const app = new Hono()

app.use('*', cors())

app.route('/auth', authRoute)
// app.route('/employees', employRoute)
// app.route('/posts', postRoute)
// app.route('/dm', dmRoute)

export default app


serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`)
  },
)
