-- Fresh demo accounts (password for all: DemoPass123)
-- Candidate: demo@developmentwala.org
-- Employer:  employer@developmentwala.org
-- Admin:     admin@developmentwala.org

INSERT INTO users (id, user_id, password, email, first_name, last_name, role, is_active, email_verified, employer_verified)
VALUES
  ('11111111-1111-4111-8111-111111111101', 'demo_candidate', 'DemoPass123', 'demo@developmentwala.org', 'Demo', 'Candidate', 'candidate', true, true, false),
  ('11111111-1111-4111-8111-111111111102', 'demo_employer', 'DemoPass123', 'employer@developmentwala.org', 'Demo', 'Employer', 'employer', true, true, true),
  ('11111111-1111-4111-8111-111111111103', 'demo_admin', 'DemoPass123', 'admin@developmentwala.org', 'Demo', 'Admin', 'super_admin', true, true, false)
ON CONFLICT (email) DO UPDATE SET
  user_id = EXCLUDED.user_id,
  password = EXCLUDED.password,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active,
  email_verified = true,
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO employers (id, name, logo, location, tags, open_positions, about, email, website)
VALUES (
  999,
  'Development Wala Demo NGO',
  '/images/smile.png',
  'New Delhi, India',
  'Education',
  5,
  'Demo NGO organization for testing employer dashboard and job postings.',
  'employer@developmentwala.org',
  'https://developmentwala.org'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  location = EXCLUDED.location,
  tags = EXCLUDED.tags,
  about = EXCLUDED.about,
  email = EXCLUDED.email,
  website = EXCLUDED.website;

INSERT INTO employer_profiles (user_id, profile_completed, data)
VALUES (
  '11111111-1111-4111-8111-111111111102',
  true,
  '{"organizationName":"Development Wala Demo NGO","fullName":"Demo Employer","workEmail":"employer@developmentwala.org","city":"New Delhi","state":"Delhi","country":"India","organizationType":"NGO"}'::jsonb
)
ON CONFLICT (user_id) DO UPDATE SET
  profile_completed = EXCLUDED.profile_completed,
  data = EXCLUDED.data,
  updated_at = CURRENT_TIMESTAMP;

DELETE FROM candidate_profiles WHERE user_id = 'demo_candidate';
INSERT INTO candidate_profiles (user_id, professional_title, biography, skills, experience_level, education_level)
VALUES (
  'demo_candidate',
  'Social Impact Professional',
  'Demo candidate account for testing applications, saved jobs, and dashboard.',
  'Program Management, Research, M&E, Community Outreach',
  'mid',
  'masters'
);

-- Assign sample postings to demo employer
UPDATE jobs SET employer_id = '11111111-1111-4111-8111-111111111102'
WHERE id IN (SELECT id FROM jobs WHERE is_active = true ORDER BY created_at DESC LIMIT 5);

UPDATE internships SET employer_id = '11111111-1111-4111-8111-111111111102'
WHERE id IN (SELECT id FROM internships WHERE status IN ('Active', 'active') ORDER BY created_at DESC LIMIT 2);

UPDATE fellowships SET employer_id = '11111111-1111-4111-8111-111111111102'
WHERE id IN (SELECT id FROM fellowships WHERE status IN ('Active', 'active') ORDER BY created_at DESC LIMIT 2);

-- Demo candidate applications
DELETE FROM applications WHERE candidate_id = '11111111-1111-4111-8111-111111111101';
INSERT INTO applications (job_id, candidate_id, status, applied_at)
SELECT j.id, '11111111-1111-4111-8111-111111111101', 'submitted', NOW() - (n || ' days')::interval
FROM (
  SELECT id, row_number() OVER (ORDER BY created_at DESC) AS n
  FROM jobs WHERE is_active = true
  LIMIT 3
) j;

-- Demo notifications
DELETE FROM notifications WHERE user_id = '11111111-1111-4111-8111-111111111101';
INSERT INTO notifications (entity_title, details, type, user_id, read, created_at)
VALUES
  ('Application under review', 'Your application for an NGO role is being reviewed by the hiring team.', 'status_reviewing', '11111111-1111-4111-8111-111111111101', false, NOW() - interval '1 day'),
  ('Welcome to Development Wala', 'Browse 77+ active NGO jobs and track your applications from your dashboard.', 'application', '11111111-1111-4111-8111-111111111101', false, NOW() - interval '2 days');

-- Demo saved job
DELETE FROM saved_jobs WHERE user_id = 'demo_candidate';
INSERT INTO saved_jobs (user_id, job_id, saved_date)
SELECT 'demo_candidate', id, NOW()
FROM jobs WHERE is_active = true
ORDER BY created_at DESC
LIMIT 1;
