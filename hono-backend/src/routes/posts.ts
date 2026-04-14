import { Hono } from 'hono'
import { query } from '../db.ts'
import { authService } from '../services/authService.ts'

const posts = new Hono()

// giggidy
posts.get('/', async (c) => {
    const rows = await query(`
    SELECT 
      p.*,
      e.first_name,
      e.last_name,
      (select count(*) from comments c where c.post_id = p.id) as comment_count,
      (SELECT COUNT(*) from reactions r where r.post_id = p.id) As reaction_count
    from posts p
    join employees e on p.author_id = e.id
    ORDER by p.pinned DESC, p.created_at DESC
  `)

    return c.json(rows)
})

// announce
posts.post('/', authService, async (c) => {
    const { title, content } = await c.req.json()
    const user = c.get('user')

    await query(`
    INSERT INTO posts (title, content, author_id, created_at)
    VALUES (?, ?, ?, NOW())
  `, [title, content, user.id])

    return c.json({ success: true })
})

//commenbt
// comments for post id
posts.get('/:id/comments', async (c) => {
    const id = c.req.param('id')

    const rows = await query(`
    SELECT 
      c.*,
      e.first_name,
      e.last_name
    FROM comments c
    JOIN employees e ON c.author_id = e.id
    WHERE c.post_id = ?
    ORDER BY c.created_at ASC
  `, [id])

    return c.json(rows)
})

// psot comment
posts.post('/:id/comments', authService, async (c) => {
    const postId = c.req.param('id')
    const { content, parent_id } = await c.req.json()
    const user = c.get('user')

    await query(`
    INSERT INTO comments 
    (post_id, content, parent_comment_id, author_id, created_at)
    VALUES (?, ?, ?, ?, NOW())
  `, [postId, content, parent_id || null, user.id])

    return c.json({ success: true })
})

// likejs

posts.post('/:id/react', authService, async (c) => {
    const postId = c.req.param('id')
    const { type } = await c.req.json()
    const user = c.get('user')

    const existing: any = await query(`
    SELECT * FROM reactions
    WHERE post_id = ? AND employee_id = ?
  `, [postId, user.id])

    if (existing.length) {
        await query(`DELETE FROM reactions WHERE id = ?`, [existing[0].id])
        return c.json({ removed: true })
    }

    await query(`
    INSERT INTO reactions (post_id, employee_id, type, created_at)
    VALUES (?, ?, ?, NOW())
  `, [postId, user.id, type || 'like'])

    return c.json({ added: true })
})

export default posts