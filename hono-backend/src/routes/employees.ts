import { Hono } from 'hono'
import { query } from '../db.ts'
import { authService } from '../services/authService.ts'

const employees = new Hono()

employees.use('*', authService)

// current user profile
employees.get('/me', authService, async (c) => {
  const user = c.get('user')

  const rows: any = await query(`
    SELECT e.*, d.name AS department_name
    FROM employees e
    LEFT JOIN departments d ON e.department_id = d.id
    WHERE e.id = ?
  `, [user.id])

  return c.json(rows[0])
})

// get all emplkyeds
employees.get('/', async (c) => {
  const rows = await query(`
    SELECT e.id, e.first_name, e.last_name, e.email, d.name AS department
    FROM employees e
    LEFT JOIN departments d ON e.department_id = d.id
  `)

  return c.json(rows)
})

// roles of emploey
employees.get('/:id/roles', async (c) => {
  const id = c.req.param('id')

  const rows = await query(`
    SELECT r.name
    FROM employee_roles er
    JOIN roles r ON er.role_id = r.id
    WHERE er.employee_id = ?
  `, [id])

  return c.json(rows)
})

export default employees