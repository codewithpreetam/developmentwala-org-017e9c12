import { runSqlFile } from './lib/run-sql-file.mjs';

const sqlFile = process.argv[2] || 'supabase/setup-api.sql';

try {
  const applied = await runSqlFile(sqlFile);
  console.log(`Applied ${applied}`);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
