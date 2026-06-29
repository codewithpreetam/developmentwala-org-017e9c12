
CREATE POLICY "Employers read applications to their listings"
  ON public.applications FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = applications.opportunity_id AND j.employer_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.internships i WHERE i.id::text = applications.opportunity_id::text AND i.employer_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.fellowships f WHERE f.id::text = applications.opportunity_id::text AND f.employer_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.scholarships s WHERE s.id::text = applications.opportunity_id::text AND s.employer_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.grants g WHERE g.id = applications.opportunity_id AND g.employer_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.events e WHERE e.id = applications.opportunity_id AND e.owner_id = auth.uid())
  );

CREATE POLICY "Employers update applications to their listings"
  ON public.applications FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = applications.opportunity_id AND j.employer_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.internships i WHERE i.id::text = applications.opportunity_id::text AND i.employer_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.fellowships f WHERE f.id::text = applications.opportunity_id::text AND f.employer_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.scholarships s WHERE s.id::text = applications.opportunity_id::text AND s.employer_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.grants g WHERE g.id = applications.opportunity_id AND g.employer_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.events e WHERE e.id = applications.opportunity_id AND e.owner_id = auth.uid())
  );
