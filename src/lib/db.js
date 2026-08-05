import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

// Fallback to JSON file when MySQL is not available
const useJsonFallback = process.env.USE_JSON_DB === 'true' || !process.env.MYSQL_HOST;
let jsonData = null;

const loadJsonData = () => {
  if (!jsonData) {
    const jsonPath = path.join(process.cwd(), 'database.json');
    if (fs.existsSync(jsonPath)) {
      const data = fs.readFileSync(jsonPath, 'utf-8');
      jsonData = JSON.parse(data);
    }
  }
  return jsonData;
};

// Initialize MySQL pool only if host is available
let pool = null;
let mysqlAvailable = false;

if (!useJsonFallback && process.env.MYSQL_HOST) {
  try {
    pool = mysql.createPool({
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
    mysqlAvailable = true;
  } catch (error) {
    console.warn('MySQL pool creation failed, using JSON fallback:', error.message);
  }
}

// Generic query function with fallback
const query = async (sql, params = []) => {
  const sqlLower = sql.toLowerCase().trim();
  
  // CREATE/ALTER/INSERT/UPDATE/DELETE queries - only work with MySQL
  const isDDL = sqlLower.startsWith('create') || sqlLower.startsWith('alter') || 
                sqlLower.startsWith('insert') || sqlLower.startsWith('update') || 
                sqlLower.startsWith('delete');
  
  if (isDDL) {
    // These queries require MySQL
    if (!mysqlAvailable || !pool) {
      console.warn('DDL query skipped - MySQL not available:', sql);
      // Return dummy result for INSERT (to get insertId)
      if (sqlLower.startsWith('insert')) {
        return { insertId: Date.now() };
      }
      return [];
    }
    
    try {
      const [results] = await pool.execute(sql, params);
      return results;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }
  
  // SELECT queries - can use JSON fallback
  if (mysqlAvailable && pool) {
    try {
      const [results] = await pool.execute(sql, params);
      return results;
    } catch (error) {
      console.error('Database query error, falling back to JSON:', error.message);
      // Fall through to JSON fallback
    }
  }

  // Fallback to JSON file for SELECT queries
  const data = loadJsonData();
  if (!data) {
    throw new Error('No database available (MySQL connection failed and no JSON fallback)');
  }

  // Parse SQL to determine which table to query
  const fromMatch = sqlLower.match(/from\s+(\w+)/);
  const whereMatch = sqlLower.match(/where\s+(.+?)(?:\s+order|\s+limit|\s+group|$)/i);
  
  if (!fromMatch) {
    throw new Error('Invalid SQL query for JSON fallback');
  }
  
  const tableName = fromMatch[1];
  let results = data[tableName] || [];
  
  // Handle WHERE conditions (simple cases only)
  if (whereMatch && results.length > 0) {
    const whereClause = whereMatch[1];
    
    // Handle is_active = 1
    const isActiveMatch = whereClause.match(/is_active\s*=\s*(\d+)/);
    if (isActiveMatch) {
      const isActiveValue = parseInt(isActiveMatch[1]);
      results = results.filter(item => item.is_active === isActiveValue);
    }
    
    // Handle id = ?
    if (whereClause.includes('= ?') || whereClause.includes('=?')) {
      const paramValue = params[0];
      if (paramValue !== undefined) {
        // Try to match by id
        const idMatch = whereClause.match(/id\s*=\s*\?/);
        if (idMatch) {
          results = results.filter(item => item.id === paramValue);
        }
      }
    }
  }
  
  return results;
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