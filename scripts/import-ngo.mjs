import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { runSqlFile } from './lib/run-sql-file.mjs';

try {
  const applied = await runSqlFile('NGO.sql');
  console.log(`Imported ${applied}`);

  const setupFile = resolve('supabase/setup-api.sql');
  if (existsSync(setupFile)) {
    const setupApplied = await runSqlFile(setupFile);
    console.log(`Applied ${setupApplied}`);
  }
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
