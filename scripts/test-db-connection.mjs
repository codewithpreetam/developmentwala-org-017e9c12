import { testConnection, closePool } from '../server/db.js';

async function main() {
  try {
    const info = await testConnection();
    console.log('Connected to Supabase PostgreSQL successfully.');
    console.log(`Server time: ${info.server_time}`);
    console.log(`Version: ${info.version.split(' ').slice(0, 2).join(' ')}`);
    process.exitCode = 0;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exitCode = 1;
  } finally {
    await closePool();
  }
}

main();
