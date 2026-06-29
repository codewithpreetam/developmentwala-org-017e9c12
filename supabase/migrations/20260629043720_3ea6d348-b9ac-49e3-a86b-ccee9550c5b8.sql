
CREATE TABLE IF NOT EXISTS public.saved_opportunities (
  id BIGSERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL,
  opportunity_type VARCHAR NOT NULL,
  opportunity_id BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, opportunity_type, opportunity_id)
);
CREATE INDEX IF NOT EXISTS idx_saved_opp_user ON public.saved_opportunities(user_id);

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id BIGSERIAL PRIMARY KEY, name TEXT, email TEXT, subject TEXT, message TEXT,
  status VARCHAR DEFAULT 'new', created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.email_subscriptions (
  id BIGSERIAL PRIMARY KEY, email TEXT UNIQUE NOT NULL, user_email TEXT, full_name TEXT,
  opportunity_types TEXT[] DEFAULT ARRAY['job','internship','fellowship','scholarship','grant','event'],
  sector_interests TEXT[] DEFAULT '{}', active BOOLEAN DEFAULT true,
  source VARCHAR DEFAULT 'app', created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.email_queue (
  id BIGSERIAL PRIMARY KEY, to_email TEXT NOT NULL, subject TEXT NOT NULL, body_html TEXT,
  status VARCHAR DEFAULT 'pending', sent_at TIMESTAMP, created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.interviews (
  id BIGSERIAL PRIMARY KEY, application_id BIGINT, candidate_email TEXT, employer_email TEXT,
  opportunity_title TEXT, scheduled_at TIMESTAMPTZ, duration_minutes INTEGER DEFAULT 30,
  mode VARCHAR DEFAULT 'video', meeting_link TEXT, location TEXT,
  status VARCHAR DEFAULT 'confirmed', notes TEXT, created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.testimonials (
  id BIGSERIAL PRIMARY KEY, name TEXT, role TEXT, organization TEXT, avatar_url TEXT,
  quote TEXT, featured BOOLEAN DEFAULT false, sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.blog_categories (
  id BIGSERIAL PRIMARY KEY, name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL,
  description TEXT, created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id BIGSERIAL PRIMARY KEY, title TEXT NOT NULL, slug TEXT UNIQUE NOT NULL,
  content TEXT, excerpt TEXT, featured_image TEXT, categories TEXT[] DEFAULT '{}',
  tags TEXT, status VARCHAR DEFAULT 'draft', meta_title TEXT, meta_description TEXT,
  author_name TEXT, read_time INTEGER,
  created_at TIMESTAMP DEFAULT now(), updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.site_settings (
  id BIGSERIAL PRIMARY KEY, settings JSONB DEFAULT '{}', updated_at TIMESTAMP DEFAULT now()
);
INSERT INTO public.site_settings (settings)
  SELECT '{}'::jsonb WHERE NOT EXISTS (SELECT 1 FROM public.site_settings);

DO $$
DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'saved_opportunities','contact_messages','email_subscriptions','email_queue',
    'interviews','testimonials','blog_categories','blog_posts','site_settings'
  ])
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS "Allow authenticated access" ON public.%I', t);
    EXECUTE format('CREATE POLICY "Allow authenticated access" ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true)', t);
    EXECUTE format('DROP POLICY IF EXISTS "Allow anon read" ON public.%I', t);
    EXECUTE format('CREATE POLICY "Allow anon read" ON public.%I FOR SELECT TO anon USING (true)', t);
  END LOOP;
END $$;

DROP POLICY IF EXISTS "Allow anon insert contact" ON public.contact_messages;
CREATE POLICY "Allow anon insert contact" ON public.contact_messages FOR INSERT TO anon WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon insert subscription" ON public.email_subscriptions;
CREATE POLICY "Allow anon insert subscription" ON public.email_subscriptions FOR INSERT TO anon WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.candidate_profile_completion(p_user_id VARCHAR)
RETURNS INTEGER LANGUAGE plpgsql STABLE SET search_path = public AS $$
DECLARE
  cp public.candidate_profiles%ROWTYPE;
  setup_data JSONB;
  score INTEGER := 0;
  total INTEGER := 8;
BEGIN
  SELECT * INTO cp FROM public.candidate_profiles WHERE user_id = p_user_id LIMIT 1;
  IF FOUND THEN
    IF coalesce(cp.profile_picture_url,'') <> '' THEN score := score + 1; END IF;
    IF coalesce(cp.cv_url,'') <> '' THEN score := score + 1; END IF;
    IF coalesce(cp.skills,'') <> '' THEN score := score + 1; END IF;
    IF coalesce(cp.biography,'') <> '' THEN score := score + 1; END IF;
    IF coalesce(cp.education_level,'') <> '' THEN score := score + 1; END IF;
    IF coalesce(cp.experience_level,'') <> '' THEN score := score + 1; END IF;
  END IF;
  SELECT cps.data INTO setup_data
    FROM public.candidate_profiles_setup cps
    JOIN public.users u ON u.id = cps.user_id
    WHERE u.user_id = p_user_id
    LIMIT 1;
  IF setup_data IS NOT NULL THEN
    IF coalesce(setup_data->>'phone','') <> '' THEN score := score + 1; END IF;
    IF coalesce(setup_data->>'location','') <> '' THEN score := score + 1; END IF;
  END IF;
  RETURN LEAST(100, (score * 100) / total);
END $$;
