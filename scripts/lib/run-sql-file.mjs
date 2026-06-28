import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import pg from 'pg';

const { Pool } = pg;

export function getConnectionString() {
  return process.env.DATABASE_POOLER_URL || process.env.DATABASE_URL;
}

export function validateConnectionString(connectionString) {
  if (!connectionString) {
    throw new Error('DATABASE_URL or DATABASE_POOLER_URL is not set in .env');
  }
  if (/\[[^\]]+\]/.test(connectionString.split('@')[0] || '')) {
    throw new Error(
      'Connection string contains a bracketed password placeholder. Paste your real password from Supabase Dashboard → Database → Session pooler.'
    );
  }
}

export async function runSqlFile(sqlPath) {
  const connectionString = getConnectionString();
  validateConnectionString(connectionString);

  const sqlFile = resolve(sqlPath);
  const sql = readFileSync(sqlFile, 'utf8');
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15_000,
  });

  try {
    await pool.query(sql);
    return sqlFile;
  } catch (error) {
    if (error.code === 'ENOTFOUND' && connectionString.includes('db.') && connectionString.includes('.supabase.co')) {
      throw new Error(
        `${error.message}\n\nUse DATABASE_POOLER_URL (Session pooler URI from Supabase Dashboard) — direct db.* host is IPv6-only.`
      );
    }
    throw error;
  } finally {
    await pool.end();
  }
}
