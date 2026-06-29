
-- 1. Switch SECURITY DEFINER helpers to SECURITY INVOKER (authenticated users can read their own user_roles row via existing policy)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean LANGUAGE sql STABLE SECURITY INVOKER SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY INVOKER SET search_path TO 'public'
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

-- 2. Replace always-true RLS policies with concrete checks or remove redundant service_role policies
DROP POLICY IF EXISTS "Service role can manage profiles" ON public.profiles;
DROP POLICY IF EXISTS "Service role can manage roles" ON public.user_roles;

DROP POLICY IF EXISTS "Allow anon insert contact" ON public.contact_messages;
DROP POLICY IF EXISTS "Anyone can submit contact message" ON public.contact_messages;
CREATE POLICY "Anyone can submit contact message" ON public.contact_messages
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    email IS NOT NULL AND length(btrim(email)) BETWEEN 3 AND 320
    AND message IS NOT NULL AND length(btrim(message)) BETWEEN 1 AND 5000
  );

DROP POLICY IF EXISTS "Anyone can subscribe" ON public.email_subscriptions;
CREATE POLICY "Anyone can subscribe" ON public.email_subscriptions
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    email IS NOT NULL AND length(btrim(email)) BETWEEN 3 AND 320
  );

-- 3. Defense-in-depth: hide sensitive demographic columns on candidate_profiles from clients
REVOKE SELECT (date_of_birth, marital_status, gender) ON public.candidate_profiles FROM anon, authenticated;

-- 4. Lock down user_roles writes: only service_role (bypasses RLS) may grant/revoke roles
REVOKE INSERT, UPDATE, DELETE ON public.user_roles FROM PUBLIC, anon, authenticated;

-- 5/6/7/9. Hide contact email + phone columns on public listings
REVOKE SELECT (email, phone) ON public.employers FROM anon, authenticated;
REVOKE SELECT (contact_email, phone) ON public.fellowships FROM anon, authenticated;
REVOKE SELECT (contact_email, phone) ON public.internships FROM anon, authenticated;
REVOKE SELECT (contact_email, phone) ON public.scholarships FROM anon, authenticated;

-- 8. Interviews: stop relying on auth.email() string match; move to auth.uid()
ALTER TABLE public.interviews
  ADD COLUMN IF NOT EXISTS candidate_id uuid,
  ADD COLUMN IF NOT EXISTS employer_id uuid;

UPDATE public.interviews i
SET candidate_id = u.id
FROM public.users u
WHERE i.candidate_id IS NULL
  AND i.candidate_email IS NOT NULL
  AND lower(btrim(u.email)) = lower(btrim(i.candidate_email));

UPDATE public.interviews i
SET employer_id = u.id
FROM public.users u
WHERE i.employer_id IS NULL
  AND i.employer_email IS NOT NULL
  AND lower(btrim(u.email)) = lower(btrim(i.employer_email));

DROP POLICY IF EXISTS "Interview parties read interviews" ON public.interviews;
CREATE POLICY "Interview parties read interviews" ON public.interviews
  FOR SELECT TO authenticated
  USING (
    candidate_id = auth.uid()
    OR employer_id = auth.uid()
    OR public.is_admin()
  );
