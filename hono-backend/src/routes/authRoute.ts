import { Hono } from 'hono'
import bcrypt from 'bcrypt'
import { query } from '../db.ts'
import { signToken } from '../auth.ts'
import { log } from 'console'

const auth = new Hono()

// register
auth.post('/register', async (c) => {
  const { first_name, last_name, email, password } = await c.req.json()

  if (!first_name || !last_name || !email || !password) {
    return c.json({ error: 'All fields are required' }, 400)
  }

  const existing: any = await query(`SELECT id FROM employees WHERE email = ?`, [email])
  if (existing.length > 0) {
    return c.json({ error: 'Email already registered' }, 409)
  }

  const hashed = await bcrypt.hash(password, 14)

  const result: any = await query(
    `INSERT INTO employees (first_name, last_name, email, password_hash, is_active, created_at)
     VALUES (?, ?, ?, ?, 1, NOW())`,
    [first_name, last_name, email, hashed]
  )

  const userId = result.insertId

  const roles: any = await query(`SELECT id FROM roles WHERE name = 'employee'`)
  if (roles.length > 0) {
    await query(`INSERT INTO employee_roles (employee_id, role_id) VALUES (?, ?)`, [userId, roles[0].id])
  }

  const token = signToken({ id: userId, email })
  return c.json({ token, user: { id: userId, email, first_name, last_name } })
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


  const users: any = await query(`SELECT * FROM employees WHERE email = ?`, [email])
  const user = users[0]
  if (!user) return c.json({ error: 'User not found' }, 404)

  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) return c.json({ error: 'Invalid password' }, 401)

  const token = signToken(user)

  return c.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
    },
  })
})

auth.post('/logout', async (c) => {
  return c.json({ success: true })
})

export default auth