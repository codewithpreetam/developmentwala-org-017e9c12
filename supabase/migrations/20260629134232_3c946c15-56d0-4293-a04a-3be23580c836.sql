
CREATE OR REPLACE FUNCTION public.is_employer_of_candidate(_candidate_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.applications a
    WHERE a.candidate_id = _candidate_id
      AND (
        EXISTS (SELECT 1 FROM public.jobs         x WHERE x.id::text = a.opportunity_id AND x.employer_id = auth.uid())
        OR EXISTS (SELECT 1 FROM public.internships  x WHERE x.id::text = a.opportunity_id AND x.employer_id = auth.uid())
        OR EXISTS (SELECT 1 FROM public.fellowships  x WHERE x.id::text = a.opportunity_id AND x.employer_id = auth.uid())
        OR EXISTS (SELECT 1 FROM public.scholarships x WHERE x.id::text = a.opportunity_id AND x.employer_id = auth.uid())
        OR EXISTS (SELECT 1 FROM public.grants       x WHERE x.id::text = a.opportunity_id AND x.employer_id = auth.uid())
        OR EXISTS (SELECT 1 FROM public.events       x WHERE x.id::text = a.opportunity_id AND x.owner_id   = auth.uid())
      )
  );
$$;

DROP POLICY IF EXISTS "Employers view their applicants" ON public.users;
CREATE POLICY "Employers view their applicants" ON public.users
  FOR SELECT
  USING (public.is_employer_of_candidate(id));
