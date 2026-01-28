const { Pool } = require('pg');
const config = require('../config');

let pool = null;

function getPool() {
  if (!pool) {
    const poolConfig = config.database.connectionString
      ? {
          connectionString: config.database.connectionString,
          ssl: config.database.ssl,
          max: 10,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 10000,
        }
      : {
          host: config.database.host,
          port: config.database.port,
          user: config.database.user,
          password: config.database.password,
          database: config.database.name,
          ssl: config.database.ssl,
          max: 10,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 10000,
        };

    pool = new Pool(poolConfig);
    pool.on('error', (err) => {
      console.error('Pool error:', err.message);
    });
  }
  return pool;
}

async function query(text, params) {
  const p = getPool();
  return p.query(text, params);
}

async function checkConnection() {
  try {
    const result = await query('SELECT 1 as connected');
    return result.rows[0]?.connected === 1;
  } catch {
    return false;
  }
}

async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

module.exports = { query, getPool, checkConnection, closePool };
