import { createClient } from '@supabase/supabase-js';

const sb = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY);

const accounts = [
  ['demo@developmentwala.org', 'DemoPass123', 'candidate'],
  ['employer@developmentwala.org', 'DemoPass123', 'employer'],
  ['admin@developmentwala.org', 'DemoPass123', 'super_admin'],
];

let failed = 0;

const jobs = await sb.from('jobs').select('id', { count: 'exact', head: true }).eq('is_active', true);
console.log(`Active jobs: ${jobs.count ?? 0}${jobs.error ? ` (${jobs.error.message})` : ''}`);
if (jobs.error) failed++;

for (const [email, password, expectedRole] of accounts) {
  const { data, error } = await sb.rpc('login_user', { p_email: email, p_password: password });
  const ok = !error && data?.role === expectedRole;
  console.log(`${ok ? 'OK' : 'FAIL'} login ${email} -> ${data?.role ?? error?.message}`);
  if (!ok) failed++;
}

const employerId = '11111111-1111-4111-8111-111111111102';
const candidateId = '11111111-1111-4111-8111-111111111101';

const employerJobs = await sb.from('jobs').select('id', { count: 'exact', head: true }).eq('employer_id', employerId);
const apps = await sb.from('applications').select('id', { count: 'exact', head: true }).eq('candidate_id', candidateId);
const notifs = await sb.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', candidateId);

console.log(`Demo employer jobs: ${employerJobs.count ?? 0}`);
console.log(`Demo candidate applications: ${apps.count ?? 0}`);
console.log(`Demo candidate notifications: ${notifs.count ?? 0}`);

if ((employerJobs.count ?? 0) < 1) failed++;
if ((apps.count ?? 0) < 1) failed++;

process.exit(failed > 0 ? 1 : 0);
