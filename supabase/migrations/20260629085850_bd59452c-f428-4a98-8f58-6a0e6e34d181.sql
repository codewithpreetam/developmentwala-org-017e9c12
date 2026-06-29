
-- 1) Extend employers (organizations) table
ALTER TABLE public.employers
  ADD COLUMN IF NOT EXISTS owner_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS tagline text,
  ADD COLUMN IF NOT EXISTS sector text,
  ADD COLUMN IF NOT EXISTS ngo_type text;

CREATE INDEX IF NOT EXISTS employers_owner_user_id_idx ON public.employers(owner_user_id);
CREATE INDEX IF NOT EXISTS employers_email_lower_idx ON public.employers(lower(email));
CREATE INDEX IF NOT EXISTS employers_name_lower_idx ON public.employers(lower(name));

DROP TRIGGER IF EXISTS employers_set_updated_at ON public.employers;
CREATE TRIGGER employers_set_updated_at
  BEFORE UPDATE ON public.employers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2) Backfill owner_user_id from email match
UPDATE public.employers e
SET owner_user_id = au.id
FROM auth.users au
WHERE e.owner_user_id IS NULL
  AND e.email IS NOT NULL
  AND lower(au.email) = lower(e.email);

-- 3) Add organization_employer_id to all opportunity tables
ALTER TABLE public.jobs          ADD COLUMN IF NOT EXISTS organization_employer_id integer REFERENCES public.employers(id) ON DELETE SET NULL;
ALTER TABLE public.internships   ADD COLUMN IF NOT EXISTS organization_employer_id integer REFERENCES public.employers(id) ON DELETE SET NULL;
ALTER TABLE public.fellowships   ADD COLUMN IF NOT EXISTS organization_employer_id integer REFERENCES public.employers(id) ON DELETE SET NULL;
ALTER TABLE public.scholarships  ADD COLUMN IF NOT EXISTS organization_employer_id integer REFERENCES public.employers(id) ON DELETE SET NULL;
ALTER TABLE public.grants        ADD COLUMN IF NOT EXISTS organization_employer_id integer REFERENCES public.employers(id) ON DELETE SET NULL;
ALTER TABLE public.events        ADD COLUMN IF NOT EXISTS organization_employer_id integer REFERENCES public.employers(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS jobs_org_employer_idx         ON public.jobs(organization_employer_id);
CREATE INDEX IF NOT EXISTS internships_org_employer_idx  ON public.internships(organization_employer_id);
CREATE INDEX IF NOT EXISTS fellowships_org_employer_idx  ON public.fellowships(organization_employer_id);
CREATE INDEX IF NOT EXISTS scholarships_org_employer_idx ON public.scholarships(organization_employer_id);
CREATE INDEX IF NOT EXISTS grants_org_employer_idx       ON public.grants(organization_employer_id);
CREATE INDEX IF NOT EXISTS events_org_employer_idx       ON public.events(organization_employer_id);

-- 4a) Backfill via employer_id (=auth user) → employers.owner_user_id
UPDATE public.jobs j         SET organization_employer_id = e.id FROM public.employers e
  WHERE j.organization_employer_id IS NULL AND j.employer_id IS NOT NULL AND e.owner_user_id = j.employer_id;
UPDATE public.internships i  SET organization_employer_id = e.id FROM public.employers e
  WHERE i.organization_employer_id IS NULL AND i.employer_id IS NOT NULL AND e.owner_user_id = i.employer_id;
UPDATE public.fellowships f  SET organization_employer_id = e.id FROM public.employers e
  WHERE f.organization_employer_id IS NULL AND f.employer_id IS NOT NULL AND e.owner_user_id = f.employer_id;
UPDATE public.scholarships s SET organization_employer_id = e.id FROM public.employers e
  WHERE s.organization_employer_id IS NULL AND s.employer_id IS NOT NULL AND e.owner_user_id = s.employer_id;
UPDATE public.grants g       SET organization_employer_id = e.id FROM public.employers e
  WHERE g.organization_employer_id IS NULL AND g.employer_id IS NOT NULL AND e.owner_user_id = g.employer_id;
UPDATE public.events ev      SET organization_employer_id = e.id FROM public.employers e
  WHERE ev.organization_employer_id IS NULL AND ev.owner_id IS NOT NULL AND e.owner_user_id = ev.owner_id;

-- 4b) Backfill by name match for the rest
UPDATE public.jobs j         SET organization_employer_id = e.id FROM public.employers e
  WHERE j.organization_employer_id IS NULL AND j.organization IS NOT NULL
    AND lower(trim(e.name)) = lower(trim(j.organization));
UPDATE public.internships i  SET organization_employer_id = e.id FROM public.employers e
  WHERE i.organization_employer_id IS NULL AND i.org_name IS NOT NULL
    AND lower(trim(e.name)) = lower(trim(i.org_name));
UPDATE public.fellowships f  SET organization_employer_id = e.id FROM public.employers e
  WHERE f.organization_employer_id IS NULL AND f.org_name IS NOT NULL
    AND lower(trim(e.name)) = lower(trim(f.org_name));
UPDATE public.scholarships s SET organization_employer_id = e.id FROM public.employers e
  WHERE s.organization_employer_id IS NULL AND s.org_name IS NOT NULL
    AND lower(trim(e.name)) = lower(trim(s.org_name));
UPDATE public.grants g       SET organization_employer_id = e.id FROM public.employers e
  WHERE g.organization_employer_id IS NULL AND g.title IS NOT NULL;  -- grants have no org name column; leave for UI to set going forward
UPDATE public.events ev      SET organization_employer_id = e.id FROM public.employers e
  WHERE ev.organization_employer_id IS NULL AND ev.organizer IS NOT NULL
    AND lower(trim(e.name)) = lower(trim(ev.organizer));

-- 5) Employers RLS: public read, owner write
DROP POLICY IF EXISTS "Public read employers"          ON public.employers;
DROP POLICY IF EXISTS "Authenticated can create own org" ON public.employers;
DROP POLICY IF EXISTS "Owner can update own org"       ON public.employers;
DROP POLICY IF EXISTS "Owner or admin can delete org"  ON public.employers;
DROP POLICY IF EXISTS "Admins manage employers"        ON public.employers;
DROP POLICY IF EXISTS "Anyone can view employers"      ON public.employers;
DROP POLICY IF EXISTS "Anyone can read employers"      ON public.employers;

ALTER TABLE public.employers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read employers" ON public.employers
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Authenticated can create own org" ON public.employers
  FOR INSERT TO authenticated
  WITH CHECK (owner_user_id = auth.uid()
              OR public.has_role(auth.uid(), 'admin')
              OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Owner can update own org" ON public.employers
  FOR UPDATE TO authenticated
  USING (owner_user_id = auth.uid()
         OR public.has_role(auth.uid(), 'admin')
         OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (owner_user_id = auth.uid()
              OR public.has_role(auth.uid(), 'admin')
              OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Owner or admin can delete org" ON public.employers
  FOR DELETE TO authenticated
  USING (owner_user_id = auth.uid()
         OR public.has_role(auth.uid(), 'admin')
         OR public.has_role(auth.uid(), 'super_admin'));

GRANT SELECT ON public.employers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.employers TO authenticated;
GRANT ALL ON public.employers TO service_role;
