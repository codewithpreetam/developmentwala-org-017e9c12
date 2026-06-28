-- DevelopmentWala schema extensions (run after NGO.sql import)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Users: verification, employer verification, hashed passwords
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS verification_token text,
  ADD COLUMN IF NOT EXISTS verification_expires timestamptz,
  ADD COLUMN IF NOT EXISTS employer_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS employer_verification_status text DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS password_hash text;

UPDATE public.users SET email_verified = true WHERE email_verified IS NULL OR email_verified = false;

-- Applications: polymorphic opportunities + application payload
ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS opportunity_type text DEFAULT 'job',
  ADD COLUMN IF NOT EXISTS opportunity_id uuid,
  ADD COLUMN IF NOT EXISTS cover_letter text,
  ADD COLUMN IF NOT EXISTS cv_url text,
  ADD COLUMN IF NOT EXISTS employer_notes text;

UPDATE public.applications
SET opportunity_id = job_id, opportunity_type = 'job'
WHERE opportunity_id IS NULL;

-- Allow applications to non-job opportunity types (drop jobs-only FK)
ALTER TABLE public.applications DROP CONSTRAINT IF EXISTS applications_job_id_fkey;
ALTER TABLE public.applications ALTER COLUMN job_id DROP NOT NULL;

-- Generic saved opportunities (all types)
CREATE TABLE IF NOT EXISTS public.saved_opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id varchar(50) NOT NULL,
  opportunity_type text NOT NULL,
  opportunity_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, opportunity_type, opportunity_id)
);

-- Blog
CREATE TABLE IF NOT EXISTS public.blog_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  content text,
  excerpt text,
  featured_image text,
  categories text[] DEFAULT '{}',
  tags text,
  status text DEFAULT 'draft',
  meta_title text,
  meta_description text,
  author_name text,
  read_time integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Site settings (single-row JSON document)
CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz DEFAULT now()
);

INSERT INTO public.site_settings (settings)
SELECT '{}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.site_settings LIMIT 1);

-- Contact messages
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  email text NOT NULL,
  subject text,
  message text NOT NULL,
  status text DEFAULT 'new',
  created_at timestamptz DEFAULT now()
);

-- Email subscriptions / job alerts
CREATE TABLE IF NOT EXISTS public.email_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  full_name text,
  user_email text,
  opportunity_types text[] DEFAULT ARRAY['job','internship','fellowship','scholarship','grant','event'],
  sector_interests text[] DEFAULT '{}',
  active boolean DEFAULT true,
  source text DEFAULT 'footer',
  created_at timestamptz DEFAULT now()
);

-- Interviews
CREATE TABLE IF NOT EXISTS public.interviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES public.applications(id) ON DELETE SET NULL,
  candidate_email text,
  employer_email text,
  opportunity_title text,
  scheduled_at timestamptz,
  duration_minutes integer DEFAULT 30,
  mode text DEFAULT 'video',
  location text,
  meeting_link text,
  status text DEFAULT 'scheduled',
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Homepage testimonials
CREATE TABLE IF NOT EXISTS public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text,
  organization text,
  quote text NOT NULL,
  avatar_url text,
  rating integer DEFAULT 5,
  featured boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

INSERT INTO public.testimonials (name, role, organization, quote, rating, sort_order)
SELECT * FROM (VALUES
  ('Priya Sharma', 'Program Manager', 'Pratham Education Foundation',
   'DevelopmentWala helped me land my dream role in education NGOs. The platform is focused and easy to use.', 5, 1),
  ('Rahul Mehta', 'Fellowship Recipient', 'Ashoka Innovators',
   'I discovered fellowship opportunities I never found on generic job boards. Highly recommend for social sector professionals.', 5, 2),
  ('Ananya Das', 'HR Lead', 'Goonj',
   'As an employer, we reach passionate candidates who genuinely care about social impact. Posting and managing applicants is seamless.', 5, 3)
) AS v(name, role, organization, quote, rating, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.testimonials LIMIT 1);

-- Email outbound queue (processed by scripts/process-email-queue.mjs)
CREATE TABLE IF NOT EXISTS public.email_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  to_email text NOT NULL,
  subject text NOT NULL,
  body_html text NOT NULL,
  status text DEFAULT 'pending',
  error text,
  created_at timestamptz DEFAULT now(),
  sent_at timestamptz
);

-- Seed blog categories + sample post
INSERT INTO public.blog_categories (name, slug, description)
SELECT * FROM (VALUES
  ('Career Advice', 'career-advice', 'Tips for building a career in the social sector'),
  ('Sector News', 'sector-news', 'News and trends in NGOs and social impact')
) AS v(name, slug, description)
WHERE NOT EXISTS (SELECT 1 FROM public.blog_categories LIMIT 1);

INSERT INTO public.blog_posts (title, slug, excerpt, content, status, author_name, read_time, categories)
SELECT
  'How to Break Into the NGO Sector in India',
  'how-to-break-into-ngo-sector-india',
  'A practical guide for graduates and career switchers looking to work in social impact.',
  '<p>The social sector in India offers meaningful careers across education, health, environment, and more. Start by identifying your cause area, building relevant skills, and applying through focused platforms like DevelopmentWala.</p>',
  'published',
  'DevelopmentWala Team',
  5,
  ARRAY['career-advice']
WHERE NOT EXISTS (SELECT 1 FROM public.blog_posts LIMIT 1);

-- Grants for new tables
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_opportunities TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_categories TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_posts TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contact_messages TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_subscriptions TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.interviews TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.testimonials TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_queue TO anon, authenticated, service_role;

-- Registration
CREATE OR REPLACE FUNCTION public.register_user(
  p_email text,
  p_password text,
  p_first_name text,
  p_last_name text,
  p_role text DEFAULT 'candidate'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id varchar(50);
  v_token text;
  v_user users%ROWTYPE;
  v_role text;
BEGIN
  IF lower(trim(p_email)) IN (SELECT lower(email) FROM users) THEN
    RAISE EXCEPTION 'Email already registered';
  END IF;

  v_role := CASE WHEN p_role = 'employer' THEN 'employer' ELSE 'candidate' END;
  v_user_id := 'usr_' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 12);
  v_token := encode(gen_random_bytes(32), 'hex');

  INSERT INTO users (user_id, email, password, password_hash, first_name, last_name, role, email_verified, verification_token, verification_expires, employer_verification_status)
  VALUES (
    v_user_id,
    lower(trim(p_email)),
    p_password,
    crypt(p_password, gen_salt('bf')),
    p_first_name,
    p_last_name,
    v_role,
    false,
    v_token,
    now() + interval '7 days',
    CASE WHEN v_role = 'employer' THEN 'pending' ELSE 'none' END
  )
  RETURNING * INTO v_user;

  IF v_role = 'candidate' THEN
    INSERT INTO candidate_profiles (user_id) VALUES (v_user_id) ON CONFLICT DO NOTHING;
  ELSE
    INSERT INTO employer_profiles (user_id, profile_completed, data)
    VALUES (v_user.id, false, jsonb_build_object('organizationName', coalesce(p_first_name, '') || ' ' || coalesce(p_last_name, '')))
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  INSERT INTO email_queue (to_email, subject, body_html)
  VALUES (
    v_user.email,
    'Verify your DevelopmentWala account',
    '<p>Welcome to DevelopmentWala! Click to verify: <a href="' ||
    coalesce(current_setting('app.base_url', true), 'http://localhost:5173') ||
    '/VerifyEmail?token=' || v_token || '">Verify Email</a></p>'
  );

  RETURN json_build_object(
    'id', v_user.id,
    'user_id', v_user.user_id,
    'email', v_user.email,
    'first_name', v_user.first_name,
    'last_name', v_user.last_name,
    'role', v_user.role,
    'email_verified', v_user.email_verified,
    'verification_token', v_token
  );
END;
$$;

REVOKE ALL ON FUNCTION public.register_user(text, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.register_user(text, text, text, text, text) TO anon, authenticated, service_role;

-- Email verification
CREATE OR REPLACE FUNCTION public.verify_email_token(p_token text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  u users%ROWTYPE;
BEGIN
  SELECT * INTO u FROM users
  WHERE verification_token = p_token
    AND verification_expires > now()
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Invalid or expired token');
  END IF;

  UPDATE users
  SET email_verified = true, verification_token = null, verification_expires = null, updated_at = now()
  WHERE id = u.id;

  RETURN json_build_object('success', true, 'email', u.email);
END;
$$;

REVOKE ALL ON FUNCTION public.verify_email_token(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_email_token(text) TO anon, authenticated, service_role;

-- Update login to support bcrypt hash + legacy plaintext; require email verification
CREATE OR REPLACE FUNCTION public.login_user(p_email text, p_password text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  u users%ROWTYPE;
BEGIN
  SELECT * INTO u
  FROM users
  WHERE lower(trim(email)) = lower(trim(p_email))
    AND coalesce(is_active, true) = true
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  IF u.password_hash IS NOT NULL THEN
    IF u.password_hash != crypt(p_password, u.password_hash) THEN
      RETURN NULL;
    END IF;
  ELSIF u.password IS NULL OR u.password != p_password THEN
    RETURN NULL;
  END IF;

  IF coalesce(u.email_verified, true) = false AND u.role != 'super_admin' THEN
    RETURN json_build_object('error', 'email_not_verified', 'email', u.email);
  END IF;

  RETURN json_build_object(
    'id', u.id,
    'user_id', u.user_id,
    'email', u.email,
    'first_name', u.first_name,
    'last_name', u.last_name,
    'role', u.role,
    'profile_image', u.profile_image,
    'email_verified', coalesce(u.email_verified, true),
    'employer_verified', coalesce(u.employer_verified, false),
    'employer_verification_status', u.employer_verification_status,
    'created_at', u.created_at,
    'updated_at', u.updated_at
  );
END;
$$;

-- Employer verification (admin)
CREATE OR REPLACE FUNCTION public.set_employer_verification(p_user_id uuid, p_verified boolean)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE users
  SET employer_verified = p_verified,
      employer_verification_status = CASE WHEN p_verified THEN 'approved' ELSE 'rejected' END,
      updated_at = now()
  WHERE id = p_user_id AND role = 'employer';

  RETURN json_build_object('success', true);
END;
$$;

REVOKE ALL ON FUNCTION public.set_employer_verification(uuid, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_employer_verification(uuid, boolean) TO anon, authenticated, service_role;

-- Server-side opportunity search
CREATE OR REPLACE FUNCTION public.search_opportunities(
  p_type text DEFAULT 'job',
  p_query text DEFAULT NULL,
  p_location text DEFAULT NULL,
  p_sector text DEFAULT NULL,
  p_experience_min integer DEFAULT NULL,
  p_sort text DEFAULT 'newest',
  p_limit integer DEFAULT 20,
  p_offset integer DEFAULT 0
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  IF p_type = 'job' THEN
    SELECT coalesce(json_agg(row_to_json(t)), '[]'::json) INTO result
    FROM (
      SELECT id, title, slug, organization, city, state, country, deadline, featured, is_active,
             role_category AS sector, experience_min, salary_value, salary_currency, created_at
      FROM jobs
      WHERE is_active = true
        AND (p_query IS NULL OR title ILIKE '%' || p_query || '%' OR organization ILIKE '%' || p_query || '%' OR description ILIKE '%' || p_query || '%')
        AND (p_location IS NULL OR city ILIKE '%' || p_location || '%' OR state ILIKE '%' || p_location || '%' OR country ILIKE '%' || p_location || '%')
        AND (p_sector IS NULL OR role_category ILIKE '%' || p_sector || '%')
        AND (p_experience_min IS NULL OR experience_min >= p_experience_min)
      ORDER BY
        CASE WHEN p_sort = 'deadline' THEN deadline END ASC NULLS LAST,
        CASE WHEN p_sort = 'oldest' THEN created_at END ASC,
        created_at DESC
      LIMIT p_limit OFFSET p_offset
    ) t;
  ELSIF p_type = 'internship' THEN
    SELECT coalesce(json_agg(row_to_json(t)), '[]'::json) INTO result FROM (
      SELECT id, title, slug, organization, city, country, deadline, featured, status, field AS sector, created_at
      FROM internships WHERE status IN ('Active','active','published')
        AND (p_query IS NULL OR title ILIKE '%' || p_query || '%' OR organization ILIKE '%' || p_query || '%')
        AND (p_location IS NULL OR city ILIKE '%' || p_location || '%' OR country ILIKE '%' || p_location || '%')
      ORDER BY created_at DESC LIMIT p_limit OFFSET p_offset
    ) t;
  ELSE
    result := '[]'::json;
  END IF;
  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.search_opportunities(text, text, text, text, integer, text, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.search_opportunities(text, text, text, text, integer, text, integer, integer) TO anon, authenticated, service_role;

-- Profile completion score
CREATE OR REPLACE FUNCTION public.candidate_profile_completion(p_user_id varchar)
RETURNS integer
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE
  cp candidate_profiles%ROWTYPE;
  u users%ROWTYPE;
  score integer := 0;
BEGIN
  SELECT * INTO u FROM users WHERE user_id = p_user_id LIMIT 1;
  SELECT * INTO cp FROM candidate_profiles WHERE user_id = p_user_id LIMIT 1;
  IF u.first_name IS NOT NULL AND u.first_name != '' THEN score := score + 15; END IF;
  IF u.last_name IS NOT NULL AND u.last_name != '' THEN score := score + 10; END IF;
  IF cp.cv_url IS NOT NULL THEN score := score + 25; END IF;
  IF cp.professional_title IS NOT NULL THEN score := score + 15; END IF;
  IF cp.biography IS NOT NULL THEN score := score + 15; END IF;
  IF cp.skills IS NOT NULL THEN score := score + 10; END IF;
  IF cp.experience_level IS NOT NULL THEN score := score + 10; END IF;
  RETURN least(score, 100);
END;
$$;

GRANT EXECUTE ON FUNCTION public.candidate_profile_completion(varchar) TO anon, authenticated, service_role;
