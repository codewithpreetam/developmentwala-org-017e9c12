
-- Broaden candidate-owned policies to match either users.user_id storage form (email or uuid).
DROP POLICY IF EXISTS "Candidates manage own profile" ON public.candidate_profiles;
CREATE POLICY "Candidates manage own profile" ON public.candidate_profiles FOR ALL TO authenticated
  USING (
    user_id = auth.uid()::text
    OR user_id IN (SELECT user_id FROM public.users WHERE id = auth.uid())
    OR public.is_admin()
  )
  WITH CHECK (
    user_id = auth.uid()::text
    OR user_id IN (SELECT user_id FROM public.users WHERE id = auth.uid())
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Candidates manage own education" ON public.candidate_education;
CREATE POLICY "Candidates manage own education" ON public.candidate_education FOR ALL TO authenticated
  USING (
    user_id = auth.uid()::text
    OR user_id IN (SELECT user_id FROM public.users WHERE id = auth.uid())
    OR public.is_admin()
  )
  WITH CHECK (
    user_id = auth.uid()::text
    OR user_id IN (SELECT user_id FROM public.users WHERE id = auth.uid())
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Candidates manage own experience" ON public.candidate_experience;
CREATE POLICY "Candidates manage own experience" ON public.candidate_experience FOR ALL TO authenticated
  USING (
    user_id = auth.uid()::text
    OR user_id IN (SELECT user_id FROM public.users WHERE id = auth.uid())
    OR public.is_admin()
  )
  WITH CHECK (
    user_id = auth.uid()::text
    OR user_id IN (SELECT user_id FROM public.users WHERE id = auth.uid())
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Candidates manage own social media" ON public.candidate_social_media;
CREATE POLICY "Candidates manage own social media" ON public.candidate_social_media FOR ALL TO authenticated
  USING (
    user_id = auth.uid()::text
    OR user_id IN (SELECT user_id FROM public.users WHERE id = auth.uid())
    OR public.is_admin()
  )
  WITH CHECK (
    user_id = auth.uid()::text
    OR user_id IN (SELECT user_id FROM public.users WHERE id = auth.uid())
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Candidates manage own applied jobs" ON public.applied_jobs;
CREATE POLICY "Candidates manage own applied jobs" ON public.applied_jobs FOR ALL TO authenticated
  USING (
    user_id = auth.uid()::text
    OR user_id IN (SELECT user_id FROM public.users WHERE id = auth.uid())
    OR public.is_admin()
  )
  WITH CHECK (
    user_id = auth.uid()::text
    OR user_id IN (SELECT user_id FROM public.users WHERE id = auth.uid())
    OR public.is_admin()
  );
