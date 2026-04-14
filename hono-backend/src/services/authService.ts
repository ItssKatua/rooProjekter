import { Context, Next } from 'hono'
import jwt from 'jsonwebtoken'

const SECRET = 'sigmaheslo'

export async function authService(c: Context, next: Next) {
  const token = c.req.header('Authorization')?.replace('Bearer ', '')

  if (!token) return c.json({ error: 'Unauthorized' }, 401)

  try {
    const user: any = jwt.verify(token, SECRET)
    c.set('user', user)
    await next()
  } catch {
    return c.json({ error: 'Invalid token' }, 401)
  }
}