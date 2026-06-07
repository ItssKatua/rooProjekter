import { Context, Next } from 'hono'
import jwt from 'jsonwebtoken'
import type { Variables } from '../types.ts'

export const JWT_SECRET = process.env.JWT_SECRET || 'sigmaheslo'

export async function authService(c: Context<{ Variables: Variables }>, next: Next) {
  const headerToken = c.req.header('Authorization')?.replace('Bearer ', '')
  const queryToken = c.req.query('token')
  const token = headerToken || queryToken

  if (!token) return c.json({ error: 'Unauthorized' }, 401)

  try {
    const user: any = jwt.verify(token, JWT_SECRET) as Variables['user']

    c.set('user', user)

    await next()
  } catch {
    return c.json({ error: 'Invalid token' }, 401)
  }
}