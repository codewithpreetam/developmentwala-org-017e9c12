import { runSqlFile } from './lib/run-sql-file.mjs';

try {
  const users = await runSqlFile('supabase/seed-demo-users.sql');
  console.log(`Demo users seeded: ${users}`);
  await import('./seed-demo-homepage.mjs');
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
