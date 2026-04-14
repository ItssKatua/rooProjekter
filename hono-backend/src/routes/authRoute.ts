import { Hono } from 'hono'
import bcrypt from 'bcrypt'
import { query } from '../db.ts'
import { signToken } from '../auth.ts'

const auth = new Hono()

// register
auth.post('/register', async (c) => {
  const { username, email, password } = await c.req.json()

  const hashed = await bcrypt.hash(password, 10)

  await query(
    `INSERT INTO users (username, email, password)
     VALUES (?, ?, ?)`,
    [username, email, hashed]
  )

  return c.json({ success: true })
})

//logign
auth.post('/login', async (c) => {
  const { email, password } = await c.req.json()

  const users: any = await query(
    `SELECT * FROM users WHERE email = ?`,
    [email]
  )

  const user = users[0]
  if (!user) return c.json({ error: 'User not found' }, 404)

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) return c.json({ error: 'Invalid password' }, 401)

  const token = signToken(user)

  return c.json({ token, user })
})


export default auth