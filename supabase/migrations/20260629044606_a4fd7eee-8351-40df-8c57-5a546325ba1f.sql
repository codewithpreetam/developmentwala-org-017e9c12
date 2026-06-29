
DROP POLICY IF EXISTS "Allow anon read" ON public.applications;
DROP POLICY IF EXISTS "Allow authenticated access" ON public.applications;

CREATE POLICY "Candidates manage own applications"
  ON public.applications FOR ALL TO authenticated
  USING (auth.uid() = candidate_id)
  WITH CHECK (auth.uid() = candidate_id);
