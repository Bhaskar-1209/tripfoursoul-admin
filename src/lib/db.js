import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB,
  ssl: process.env.MYSQL_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  waitForConnections: true,
  connectionLimit: 3,
  queueLimit: 0,
  connectTimeout: 15000,
  acquireTimeout: 15000,
  timeout: 15000
});

// Generic query function
const query = async (sql, params = []) => {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Generic get one
const getOne = async (table, id) => {
  const results = await query(`SELECT * FROM ${table} WHERE id = ?`, [id]);
  return results[0] || null;
};

// Generic insert
const insert = async (table, data) => {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const placeholders = keys.map(() => '?').join(', ');
  
  const result = await query(
    `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`,
    values
  );
  
  return { ...data, id: result.insertId };
};

// Generic update
const update = async (table, id, data) => {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const setClause = keys.map(key => `${key} = ?`).join(', ');
  
  await query(
    `UPDATE ${table} SET ${setClause} WHERE id = ?`,
    [...values, id]
  );
  
  return { ...data, id };
};

// Generic delete
const remove = async (table, id) => {
  await query(`DELETE FROM ${table} WHERE id = ?`, [id]);
  return true;
};

// Run SQL (for compatibility)
const run = async (sql, params = []) => {
  return await query(sql, params);
};

export default {
  query,
  get: getOne,
  insert,
  update,
  delete: remove,
  run
};