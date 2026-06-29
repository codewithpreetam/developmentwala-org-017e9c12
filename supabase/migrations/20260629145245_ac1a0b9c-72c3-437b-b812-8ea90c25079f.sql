-- Allow employers to manage interviews for their own listings; candidates can read theirs
CREATE POLICY "Employers can insert their interviews" ON public.interviews
  FOR INSERT TO authenticated
  WITH CHECK (
    lower(employer_email) = lower(COALESCE((auth.jwt() ->> 'email')::text, ''))
    OR employer_id = auth.uid()
    OR public.is_admin()
  );

CREATE POLICY "Employers can update their interviews" ON public.interviews
  FOR UPDATE TO authenticated
  USING (
    lower(employer_email) = lower(COALESCE((auth.jwt() ->> 'email')::text, ''))
    OR employer_id = auth.uid()
    OR public.is_admin()
  )
  WITH CHECK (
    lower(employer_email) = lower(COALESCE((auth.jwt() ->> 'email')::text, ''))
    OR employer_id = auth.uid()
    OR public.is_admin()
  );

CREATE POLICY "Employers can delete their interviews" ON public.interviews
  FOR DELETE TO authenticated
  USING (
    lower(employer_email) = lower(COALESCE((auth.jwt() ->> 'email')::text, ''))
    OR employer_id = auth.uid()
    OR public.is_admin()
  );

CREATE POLICY "Employers and candidates can view their interviews" ON public.interviews
  FOR SELECT TO authenticated
  USING (
    lower(employer_email) = lower(COALESCE((auth.jwt() ->> 'email')::text, ''))
    OR lower(candidate_email) = lower(COALESCE((auth.jwt() ->> 'email')::text, ''))
    OR employer_id = auth.uid()
    OR candidate_id = auth.uid()
    OR public.is_admin()
  );
