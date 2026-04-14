import { Context, Next } from 'hono'
import jwt from 'jsonwebtoken'
import type { Variables } from '../types.ts'

const SECRET = 'sigmaheslo'

export async function authService(c: Context<{ Variables: Variables }>, next: Next) {
  const token = c.req.header('Authorization')?.replace('Bearer ', '')

  if (!token) return c.json({ error: 'Unauthorized' }, 401)

  try {
    const user: any = jwt.verify(token, SECRET) as Variables['user']
    c.set('user', user)
    await next()
  } catch {
    return c.json({ error: 'Invalid token' }, 401)
  }
}