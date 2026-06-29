
INSERT INTO public.users (id, user_id, email, first_name, last_name, role, is_active)
VALUES
  ('11111111-1111-4111-8111-111111111101', 'demo_candidate', 'demo@developmentwala.org', 'Demo', 'Candidate', 'candidate', true),
  ('11111111-1111-4111-8111-111111111102', 'demo_employer', 'employer@developmentwala.org', 'Demo', 'Employer', 'employer', true),
  ('11111111-1111-4111-8111-111111111103', 'demo_admin', 'admin@developmentwala.org', 'Demo', 'Admin', 'super_admin', true)
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id,
  email = EXCLUDED.email,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active,
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.user_roles (user_id, role)
VALUES ('11111111-1111-4111-8111-111111111103', 'admin')
ON CONFLICT DO NOTHING;
