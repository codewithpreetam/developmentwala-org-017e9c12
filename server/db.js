import pg from 'pg';

const { Pool } = pg;

let pool;

/**
 * Server-side PostgreSQL pool. Uses DATABASE_URL from the environment.
 * Never import this from browser/Vite client code.
 */
export function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_POOLER_URL || process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is not set. Add it to your .env file.');
    }
    if (connectionString.includes('[YOUR-PASSWORD]')) {
      throw new Error('Replace [YOUR-PASSWORD] in DATABASE_URL with your Supabase database password.');
    }

    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 5,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    });
  }

  return pool;
}

export async function query(text, params) {
  const client = getPool();
  return client.query(text, params);
}

export async function testConnection() {
  const result = await query('select version() as version, now() as server_time');
  return result.rows[0];
}

export async function closePool() {
  if (pool) {
    await pool.end();
    pool = undefined;
  }
}
