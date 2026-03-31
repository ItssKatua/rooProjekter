import mysql from 'mysql2/promise'

export const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'kitten',
  database: 'win98_db',
  connectionLimit: 10
})