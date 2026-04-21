import { Hono } from 'hono'
import bcrypt from 'bcrypt'
import { query } from '../db.ts'
import { signToken } from '../auth.ts'
import { log } from 'console'

const auth = new Hono()

// register
auth.post('/register', async (c) => {
  const { first_name, last_name, email, password } = await c.req.json()

  const hashed = await bcrypt.hash(password, 10)

  await query(
    `INSERT INTO employees (first_name, last_name, email, password_hash)
     VALUES (?, ?, ?, ?)`,
    [first_name, last_name, email, hashed]
  )

  return c.json({ success: true })
})

//logign
auth.post('/login', async (c) => {
  const { email, password } = await c.req.json()

  //dbg
  // if (email === 'admin') {
  //   const token = signToken({
  //     id: 1,
  //     email: 'admin@local'
  //   })

  //   return c.json({
  //     token,
  //     user: { id: 1, email: 'admin@local' }
  //   })
  // }
  // :3 thats me im the admin MNJHSGSRMHCVEW theeehe


  const users: any = await query(
    `SELECT * FROM employees WHERE email = ?`,
    [email]
  )

  console.log(users);
  
  const user = users[0]
  if (!user) return c.json({ error: 'User not found' }, 401)

  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) return c.json({ error: 'Invalid password' }, 401)

  const token = signToken(user)

  return c.json({ token, user })
})


export default auth