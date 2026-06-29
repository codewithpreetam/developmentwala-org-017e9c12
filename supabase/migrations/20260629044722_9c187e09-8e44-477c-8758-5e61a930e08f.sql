
DROP POLICY IF EXISTS "Employers read applications to their listings" ON public.applications;
DROP POLICY IF EXISTS "Employers update applications to their listings" ON public.applications;
DROP INDEX IF EXISTS applications_unique_per_candidate;
DROP INDEX IF EXISTS applications_opportunity_idx;

ALTER TABLE public.applications ALTER COLUMN opportunity_id TYPE text USING opportunity_id::text;

CREATE INDEX applications_opportunity_idx ON public.applications(opportunity_type, opportunity_id);
CREATE UNIQUE INDEX applications_unique_per_candidate
  ON public.applications(candidate_id, opportunity_type, opportunity_id)
  WHERE opportunity_id IS NOT NULL;

CREATE POLICY "Employers read applications to their listings"
  ON public.applications FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.jobs j WHERE j.id::text = applications.opportunity_id AND j.employer_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.internships i WHERE i.id::text = applications.opportunity_id AND i.employer_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.fellowships f WHERE f.id::text = applications.opportunity_id AND f.employer_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.scholarships s WHERE s.id::text = applications.opportunity_id AND s.employer_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.grants g WHERE g.id::text = applications.opportunity_id AND g.employer_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.events e WHERE e.id::text = applications.opportunity_id AND e.owner_id = auth.uid())
  );

CREATE POLICY "Employers update applications to their listings"
  ON public.applications FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.jobs j WHERE j.id::text = applications.opportunity_id AND j.employer_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.internships i WHERE i.id::text = applications.opportunity_id AND i.employer_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.fellowships f WHERE f.id::text = applications.opportunity_id AND f.employer_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.scholarships s WHERE s.id::text = applications.opportunity_id AND s.employer_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.grants g WHERE g.id::text = applications.opportunity_id AND g.employer_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.events e WHERE e.id::text = applications.opportunity_id AND e.owner_id = auth.uid())
  );
