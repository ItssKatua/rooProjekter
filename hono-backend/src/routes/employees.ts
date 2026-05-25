import { Hono } from 'hono'
import { query } from '../db.ts'
import { authService } from '../services/authService.ts'

const employees = new Hono()


// current user profile
employees.get('/me', authService, async (c) => {
  const user = c.get('user')

  const rows: any = await query(
    `SELECT e.id,
            e.first_name,
            e.last_name,
            e.email,
            e.status,

            d.name AS department,
            d.id AS department_id,
            CONCAT(m.first_name, ' ', m.last_name) AS manager_name,
            m.id AS manager_id,

            GROUP_CONCAT(DISTINCT r.name ORDER BY r.name SEPARATOR ',') AS roles
     FROM employees e

     LEFT JOIN employees m ON e.manager_id = m.id
     LEFT JOIN departments d ON e.department_id = d.id
     LEFT JOIN employee_roles er ON e.id = er.employee_id
     LEFT JOIN roles r ON er.role_id = r.id
     WHERE e.id = ?
     GROUP BY e.id`,
    [user.id]
  )

  const me = rows[0]
  if (!me) return c.json({ error: 'Not found' }, 404)
  me.roles = me.roles ? me.roles.split(',') : []
  return c.json(me)
})

employees.patch('/me', authService, async (c) => {
  const user = c.get('user')
  const { first_name, last_name, status } = await c.req.json()

  const updates: string[] = []
  const params: any[] = []

  if (first_name) { updates.push('first_name = ?'); params.push(first_name) }
  if (last_name) { updates.push('last_name = ?'); params.push(last_name) }
  if (status) { updates.push('status = ?'); params.push(status) }

  if (updates.length === 0) return c.json({ error: 'Nothing to update' }, 400)

  params.push(user.id)
  await query(`UPDATE employees SET ${updates.join(', ')} WHERE id = ?`, params)
  return c.json({ success: true })
})


// get all emplkyeds
employees.get('/', authService, async (c) => {
  const rows: any = await query(
    `SELECT e.id, e.first_name, e.last_name, e.email, e.status,
            d.name AS department,
            GROUP_CONCAT(DISTINCT r.name ORDER BY r.name SEPARATOR ',') AS roles
     FROM employees e
     LEFT JOIN departments d ON e.department_id = d.id
     LEFT JOIN employee_roles er ON e.id = er.employee_id
     LEFT JOIN roles r ON er.role_id = r.id
     WHERE e.is_active = 1
     GROUP BY e.id
     ORDER BY e.last_name, e.first_name`
  )
  rows.forEach((r: any) => { r.roles = r.roles ? r.roles.split(',') : [] })
  return c.json(rows)
})

// roles of emploey
employees.get('/departments', authService, async (c) => {
  const rows = await query(`SELECT * FROM departments ORDER BY name`)
  return c.json(rows)
})

employees.get('/roles', authService, async (c) => {
  const rows = await query(`SELECT * FROM roles ORDER BY name`)
  return c.json(rows)
})



async function requireAdmin(c: any, next: any) {
  const user = c.get('user')
  const roles: any = await query(
    `SELECT r.name FROM employee_roles er JOIN roles r ON er.role_id = r.id WHERE er.employee_id = ?`,
    [user.id]
  )
  const isAdmin = roles.some((r: any) => r.name === 'admin')
  if (!isAdmin) return c.json({ error: 'Forbidden' }, 403)
  await next()
}

employees.get('/admin/all', authService, requireAdmin, async (c) => {
  const rows: any = await query(
    `SELECT e.id, e.first_name, e.last_name, e.email, e.status, e.is_active, e.created_at,
            d.name AS department, d.id AS department_id,
            GROUP_CONCAT(DISTINCT r.name ORDER BY r.name SEPARATOR ',') AS roles,
            GROUP_CONCAT(DISTINCT r.id ORDER BY r.id SEPARATOR ',') AS role_ids
     FROM employees e
     LEFT JOIN departments d ON e.department_id = d.id
     LEFT JOIN employee_roles er ON e.id = er.employee_id
     LEFT JOIN roles r ON er.role_id = r.id
     GROUP BY e.id
     ORDER BY e.last_name, e.first_name`
  )
  rows.forEach((r: any) => {
    r.roles = r.roles ? r.roles.split(',') : []
    r.role_ids = r.role_ids ? r.role_ids.split(',').map(Number) : []
  })
  return c.json(rows)
})

employees.patch('/admin/:id', authService, requireAdmin, async (c) => {
  const id = c.req.param('id')
  const { first_name, last_name, email, department_id, role_ids } = await c.req.json()

  if (first_name || last_name || email || department_id !== undefined) {
    const updates: string[] = []
    const params: any[] = []
    if (first_name) { updates.push('first_name = ?'); params.push(first_name) }
    if (last_name) { updates.push('last_name = ?'); params.push(last_name) }
    if (email) { updates.push('email = ?'); params.push(email) }
    if (department_id !== undefined) { updates.push('department_id = ?'); params.push(department_id || null) }
    if (updates.length > 0) {
      params.push(id)
      await query(`UPDATE employees SET ${updates.join(', ')} WHERE id = ?`, params)
    }
  }

  if (role_ids !== undefined) {
    await query(`DELETE FROM employee_roles WHERE employee_id = ?`, [id])
    for (const rid of role_ids) {
      await query(`INSERT INTO employee_roles (employee_id, role_id) VALUES (?, ?)`, [id, rid])
    }
  }
  const admin = c.get('user')
  await query(
    `INSERT INTO activity_logs (employee_id, action, endpoint, method, ip_address, created_at)
     VALUES (?, ?, ?, ?, ?, NOW())`,
    [admin.id, `Admin #${admin.id} updated employee #${id}`, `/employees/admin/${id}`, 'PATCH', c.req.header('x-forwarded-for') || 'unknown']
  ).catch(() => { })

  return c.json({ success: true })
})

employees.post('/admin/:id/logout', authService, requireAdmin, async (c) => {
  const id = c.req.param('id')
  await query(`UPDATE employees SET status = 'offline' WHERE id = ?`, [id])
  const admin = c.get('user')
  await query(
    `INSERT INTO activity_logs (employee_id, action, endpoint, method, ip_address, created_at)
     VALUES (?, ?, ?, ?, ?, NOW())`,
    [admin.id, `Admin #${admin.id} logged out employee #${id}`, `/employees/admin/${id}/logout`, 'POST', 'unknown']
  ).catch(() => { })
  return c.json({ success: true })
})

employees.delete('/admin/:id', authService, requireAdmin, async (c) => {
  const id = c.req.param('id')
  await query(`DELETE FROM reactions WHERE employee_id = ?`, [id])
  await query(`DELETE FROM comments WHERE author_id = ?`, [id])
  await query(`DELETE FROM posts WHERE author_id = ?`, [id])
  await query(`DELETE FROM dm_participants WHERE employee_id = ?`, [id])
  await query(`DELETE FROM dm_messages WHERE sender_id = ?`, [id])
  await query(`DELETE FROM employee_roles WHERE employee_id = ?`, [id])
  await query(`DELETE FROM activity_logs WHERE employee_id = ?`, [id])
  await query(`DELETE FROM employees WHERE id = ?`, [id])
  return c.json({ success: true })
})

employees.get('/admin/:id/logs', authService, requireAdmin, async (c) => {
  const id = c.req.param('id')
  const rows = await query(
    `SELECT * FROM activity_logs WHERE employee_id = ? ORDER BY created_at DESC LIMIT 100`,
    [id]
  )
  return c.json(rows)
})

export default employees