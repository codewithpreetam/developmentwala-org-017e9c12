
-- =========================================================================
-- 1. Helper: admin check (uses existing has_role)
-- =========================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;

-- =========================================================================
-- 2. Fix function search_path & tighten EXECUTE on SECURITY DEFINER funcs
-- =========================================================================
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.update_updated_at_timestamp() SET search_path = public;

REVOKE ALL ON FUNCTION public.has_role(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO authenticated, service_role;

-- Convert candidate_profile_completion to SECURITY INVOKER (no admin powers needed)
CREATE OR REPLACE FUNCTION public.candidate_profile_completion(p_user_id character varying)
RETURNS integer
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $function$
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
END $function$;

REVOKE ALL ON FUNCTION public.candidate_profile_completion(character varying) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.candidate_profile_completion(character varying) TO authenticated, service_role;

-- =========================================================================
-- 3. Drop all "Allow anon read" + "Allow authenticated access" blanket policies
-- =========================================================================
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND policyname IN ('Allow anon read','Allow authenticated access','Public profiles are readable')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- =========================================================================
-- 4. PUBLIC-READ tables (opportunities, blog, settings): public SELECT, owner+admin write
-- =========================================================================

-- jobs (employer_id uuid = auth.uid())
CREATE POLICY "Jobs are publicly readable" ON public.jobs FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Employers manage own jobs" ON public.jobs FOR ALL TO authenticated
  USING (employer_id = auth.uid() OR public.is_admin())
  WITH CHECK (employer_id = auth.uid() OR public.is_admin());

CREATE POLICY "Internships are publicly readable" ON public.internships FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Employers manage own internships" ON public.internships FOR ALL TO authenticated
  USING (employer_id = auth.uid() OR public.is_admin())
  WITH CHECK (employer_id = auth.uid() OR public.is_admin());

CREATE POLICY "Fellowships are publicly readable" ON public.fellowships FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Employers manage own fellowships" ON public.fellowships FOR ALL TO authenticated
  USING (employer_id = auth.uid() OR public.is_admin())
  WITH CHECK (employer_id = auth.uid() OR public.is_admin());

CREATE POLICY "Scholarships are publicly readable" ON public.scholarships FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Employers manage own scholarships" ON public.scholarships FOR ALL TO authenticated
  USING (employer_id = auth.uid() OR public.is_admin())
  WITH CHECK (employer_id = auth.uid() OR public.is_admin());

CREATE POLICY "Grants are publicly readable" ON public.grants FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Employers manage own grants" ON public.grants FOR ALL TO authenticated
  USING (employer_id = auth.uid() OR public.is_admin())
  WITH CHECK (employer_id = auth.uid() OR public.is_admin());

-- events uses owner_id
CREATE POLICY "Events are publicly readable" ON public.events FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Owners manage own events" ON public.events FOR ALL TO authenticated
  USING (owner_id = auth.uid() OR public.is_admin())
  WITH CHECK (owner_id = auth.uid() OR public.is_admin());

-- employers: public read, admins manage
CREATE POLICY "Employers are publicly readable" ON public.employers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage employers" ON public.employers FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- expired_jobs
CREATE POLICY "Expired jobs are publicly readable" ON public.expired_jobs FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage expired jobs" ON public.expired_jobs FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- blog_posts / blog_categories / site_settings: public read, admin write
CREATE POLICY "Blog posts are publicly readable" ON public.blog_posts FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage blog posts" ON public.blog_posts FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Blog categories are publicly readable" ON public.blog_categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage blog categories" ON public.blog_categories FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Site settings are publicly readable" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage site settings" ON public.site_settings FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- testimonials: keep public if previously, also drop and recreate
DROP POLICY IF EXISTS "Allow anon read" ON public.testimonials;
DROP POLICY IF EXISTS "Allow authenticated access" ON public.testimonials;
CREATE POLICY "Testimonials are publicly readable" ON public.testimonials FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage testimonials" ON public.testimonials FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- =========================================================================
-- 5. PRIVATE tables: owner-only or admin
-- =========================================================================

-- users (id uuid = auth.uid())
CREATE POLICY "Users view own row" ON public.users FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_admin());
CREATE POLICY "Users update own row" ON public.users FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.is_admin())
  WITH CHECK (id = auth.uid() OR public.is_admin());
CREATE POLICY "Admins insert users" ON public.users FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid() OR public.is_admin());
CREATE POLICY "Admins delete users" ON public.users FOR DELETE TO authenticated
  USING (public.is_admin());

-- profiles (already had user-scoped policy + service_role); add admin SELECT
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_admin());

-- candidate_profiles (user_id varchar = auth.uid()::text)
CREATE POLICY "Candidates manage own profile" ON public.candidate_profiles FOR ALL TO authenticated
  USING (user_id = auth.uid()::text OR public.is_admin())
  WITH CHECK (user_id = auth.uid()::text OR public.is_admin());

-- candidate_profiles_setup (user_id uuid)
CREATE POLICY "Candidates manage own setup" ON public.candidate_profiles_setup FOR ALL TO authenticated
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- candidate_education / candidate_experience / candidate_social_media (user_id varchar)
CREATE POLICY "Candidates manage own education" ON public.candidate_education FOR ALL TO authenticated
  USING (user_id = auth.uid()::text OR public.is_admin())
  WITH CHECK (user_id = auth.uid()::text OR public.is_admin());

CREATE POLICY "Candidates manage own experience" ON public.candidate_experience FOR ALL TO authenticated
  USING (user_id = auth.uid()::text OR public.is_admin())
  WITH CHECK (user_id = auth.uid()::text OR public.is_admin());

CREATE POLICY "Candidates manage own social media" ON public.candidate_social_media FOR ALL TO authenticated
  USING (user_id = auth.uid()::text OR public.is_admin())
  WITH CHECK (user_id = auth.uid()::text OR public.is_admin());

-- employer_profiles (user_id uuid)
CREATE POLICY "Employers manage own profile" ON public.employer_profiles FOR ALL TO authenticated
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- applied_jobs (user_id varchar)
CREATE POLICY "Candidates manage own applied jobs" ON public.applied_jobs FOR ALL TO authenticated
  USING (user_id = auth.uid()::text OR public.is_admin())
  WITH CHECK (user_id = auth.uid()::text OR public.is_admin());
CREATE POLICY "Employers read applied jobs to own jobs" ON public.applied_jobs FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = applied_jobs.job_id AND j.employer_id = auth.uid()));

-- saved_jobs / saved_opportunities (user_id varchar)
CREATE POLICY "Users manage own saved jobs" ON public.saved_jobs FOR ALL TO authenticated
  USING (user_id = auth.uid()::text OR public.is_admin())
  WITH CHECK (user_id = auth.uid()::text OR public.is_admin());

CREATE POLICY "Users manage own saved opportunities" ON public.saved_opportunities FOR ALL TO authenticated
  USING (user_id = auth.uid()::text OR public.is_admin())
  WITH CHECK (user_id = auth.uid()::text OR public.is_admin());

-- following_employers (user_id varchar)
CREATE POLICY "Users manage own follows" ON public.following_employers FOR ALL TO authenticated
  USING (user_id = auth.uid()::text OR public.is_admin())
  WITH CHECK (user_id = auth.uid()::text OR public.is_admin());

-- job_alerts (user_id varchar)
CREATE POLICY "Users manage own job alerts" ON public.job_alerts FOR ALL TO authenticated
  USING (user_id = auth.uid()::text OR public.is_admin())
  WITH CHECK (user_id = auth.uid()::text OR public.is_admin());

-- notifications (user_id uuid)
CREATE POLICY "Users manage own notifications" ON public.notifications FOR ALL TO authenticated
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- shortlists (employer_id uuid)
CREATE POLICY "Employers manage own shortlists" ON public.shortlists FOR ALL TO authenticated
  USING (employer_id = auth.uid() OR public.is_admin())
  WITH CHECK (employer_id = auth.uid() OR public.is_admin());

-- interviews: candidate or employer email match + admin
CREATE POLICY "Interview parties read interviews" ON public.interviews FOR SELECT TO authenticated
  USING (candidate_email = auth.email() OR employer_email = auth.email() OR public.is_admin());
CREATE POLICY "Admins manage interviews" ON public.interviews FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- contact_messages: anon insert (re-add), admin read/manage
CREATE POLICY "Anyone can submit contact message" ON public.contact_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins read contact messages" ON public.contact_messages FOR SELECT TO authenticated
  USING (public.is_admin());
CREATE POLICY "Admins manage contact messages" ON public.contact_messages FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins delete contact messages" ON public.contact_messages FOR DELETE TO authenticated
  USING (public.is_admin());
-- The pre-existing "Allow anon insert contact" policy may also remain; harmless.

-- email_queue: admin only (service role bypasses RLS)
CREATE POLICY "Admins manage email queue" ON public.email_queue FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- email_subscriptions: anon insert allowed; users read own by email; admin manage
DROP POLICY IF EXISTS "Allow anon insert subscription" ON public.email_subscriptions;
CREATE POLICY "Anyone can subscribe" ON public.email_subscriptions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Users read own subscription" ON public.email_subscriptions FOR SELECT TO authenticated
  USING (user_email = auth.email() OR email = auth.email() OR public.is_admin());
CREATE POLICY "Admins manage subscriptions" ON public.email_subscriptions FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins delete subscriptions" ON public.email_subscriptions FOR DELETE TO authenticated
  USING (public.is_admin());

-- =========================================================================
-- 6. Storage: enforce per-user folder ownership on the 'uploads' bucket
-- =========================================================================
DROP POLICY IF EXISTS "uploads auth read" ON storage.objects;
DROP POLICY IF EXISTS "uploads auth insert" ON storage.objects;
DROP POLICY IF EXISTS "uploads auth update" ON storage.objects;
DROP POLICY IF EXISTS "uploads auth delete" ON storage.objects;

CREATE POLICY "uploads owner read" ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'uploads'
    AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_admin())
  );
CREATE POLICY "uploads owner insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'uploads'
    AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_admin())
  );
CREATE POLICY "uploads owner update" ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'uploads'
    AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_admin())
  )
  WITH CHECK (
    bucket_id = 'uploads'
    AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_admin())
  );
CREATE POLICY "uploads owner delete" ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'uploads'
    AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_admin())
  );
