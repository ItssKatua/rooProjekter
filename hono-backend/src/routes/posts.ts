import { Hono } from 'hono'
import { query } from '../db.ts'
import { authService } from '../services/authService.ts'

const posts = new Hono()

// get all posts
posts.get('/', authService, async (c) => {
  const user = c.get('user')
  const rows: any = await query(
    `SELECT
      p.*,
      e.first_name, e.last_name,
      (SELECT COUNT(*) FROM comments cm WHERE cm.post_id = p.id AND cm.parent_comment_id IS NULL) AS comment_count,
      (SELECT COUNT(*) FROM reactions r WHERE r.post_id = p.id) AS reaction_count,
      (SELECT COUNT(*) FROM reactions r WHERE r.post_id = p.id AND r.employee_id = ?) AS user_reacted
     FROM posts p
     JOIN employees e ON p.author_id = e.id
     ORDER BY p.pinned DESC, p.created_at DESC`,
    [user.id]
  )
  return c.json(rows)
})

// create post (management or admin only)
posts.post('/', authService, async (c) => {
  const user = c.get('user')

  // check role
  const roles: any = await query(
    `SELECT r.name FROM employee_roles er JOIN roles r ON er.role_id = r.id WHERE er.employee_id = ?`,
    [user.id]
  )
  const allowed = roles.some((r: any) => ['management', 'admin'].includes(r.name))
  if (!allowed) return c.json({ error: 'Forbidden' }, 403)

  const { title, content, pinned } = await c.req.json()
  if (!title || !content) return c.json({ error: 'Title and content required' }, 400)

  await query(
    `INSERT INTO posts (title, content, author_id, pinned, created_at, updated_at)
     VALUES (?, ?, ?, ?, NOW(), NOW())`,
    [title, content, user.id, pinned ? 1 : 0]
  )
  return c.json({ success: true })
})

// delete post
posts.delete('/:id', authService, async (c) => {
  const user = c.get('user')
  const id = c.req.param('id')

  const posts_: any = await query(`SELECT * FROM posts WHERE id = ?`, [id])
  const post = posts_[0]
  if (!post) return c.json({ error: 'Not found' }, 404)

  const roles: any = await query(
    `SELECT r.name FROM employee_roles er JOIN roles r ON er.role_id = r.id WHERE er.employee_id = ?`,
    [user.id]
  )
  const isPrivileged = roles.some((r: any) => ['management', 'admin'].includes(r.name))

  if (post.author_id !== user.id && !isPrivileged) {
    return c.json({ error: 'Forbidden' }, 403)
  }

  await query(`DELETE FROM reactions WHERE post_id = ?`, [id])
  await query(`DELETE FROM comments WHERE post_id = ?`, [id])
  await query(`DELETE FROM posts WHERE id = ?`, [id])
  return c.json({ success: true })
})

// get comments for a post
posts.get('/:id/comments', authService, async (c) => {
  const id = c.req.param('id')
  const rows = await query(
    `SELECT c.*, e.first_name, e.last_name
     FROM comments c
     JOIN employees e ON c.author_id = e.id
     WHERE c.post_id = ?
     ORDER BY c.created_at ASC`,
    [id]
  )
  return c.json(rows)
})

// post comment
posts.post('/:id/comments', authService, async (c) => {
  const postId = c.req.param('id')
  const { content, parent_id } = await c.req.json()
  const user = c.get('user')

  if (!content) return c.json({ error: 'Content required' }, 400)

  await query(
    `INSERT INTO comments (post_id, content, parent_comment_id, author_id, created_at, updated_at)
     VALUES (?, ?, ?, ?, NOW(), NOW())`,
    [postId, content, parent_id || null, user.id]
  )
  return c.json({ success: true })
})

// delete comment
posts.delete('/:postId/comments/:commentId', authService, async (c) => {
  const user = c.get('user')
  const commentId = c.req.param('commentId')

  const comments: any = await query(`SELECT * FROM comments WHERE id = ?`, [commentId])
  const comment = comments[0]
  if (!comment) return c.json({ error: 'Not found' }, 404)

  const roles: any = await query(
    `SELECT r.name FROM employee_roles er JOIN roles r ON er.role_id = r.id WHERE er.employee_id = ?`,
    [user.id]
  )
  const isPrivileged = roles.some((r: any) => ['management', 'admin'].includes(r.name))

  if (comment.author_id !== user.id && !isPrivileged) {
    return c.json({ error: 'Forbidden' }, 403)
  }

  await query(`DELETE FROM comments WHERE id = ?`, [commentId])
  return c.json({ success: true })
})

// react (toggle like)
posts.post('/:id/react', authService, async (c) => {
  const postId = c.req.param('id')
  const { type } = await c.req.json()
  const user = c.get('user')

  const existing: any = await query(
    `SELECT * FROM reactions WHERE post_id = ? AND employee_id = ?`,
    [postId, user.id]
  )

  if (existing.length) {
    await query(`DELETE FROM reactions WHERE id = ?`, [existing[0].id])
    return c.json({ removed: true })
  }

  await query(
    `INSERT INTO reactions (post_id, employee_id, type, created_at)
     VALUES (?, ?, ?, NOW())`,
    [postId, user.id, type || 'like']
  )
  return c.json({ added: true })
})

export default posts