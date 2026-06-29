
-- 1) SECURITY DEFINER -> INVOKER for is_employer_of_candidate (used only in RLS; querying user can read own jobs/applications)
CREATE OR REPLACE FUNCTION public.is_employer_of_candidate(_candidate_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path TO 'public'
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

-- 2) Lock contact_messages user-side UPDATE so only flag columns can change
DROP POLICY IF EXISTS "Users update own contact message flags" ON public.contact_messages;
CREATE POLICY "Users update own contact message flags"
ON public.contact_messages
FOR UPDATE
TO authenticated
USING (user_id IS NOT NULL AND user_id = auth.uid())
WITH CHECK (
  user_id IS NOT NULL
  AND user_id = auth.uid()
  AND name IS NOT DISTINCT FROM (SELECT name FROM public.contact_messages WHERE id = contact_messages.id)
  AND email IS NOT DISTINCT FROM (SELECT email FROM public.contact_messages WHERE id = contact_messages.id)
  AND subject IS NOT DISTINCT FROM (SELECT subject FROM public.contact_messages WHERE id = contact_messages.id)
  AND message IS NOT DISTINCT FROM (SELECT message FROM public.contact_messages WHERE id = contact_messages.id)
  AND status IS NOT DISTINCT FROM (SELECT status FROM public.contact_messages WHERE id = contact_messages.id)
  AND unread_for_admin IS NOT DISTINCT FROM (SELECT unread_for_admin FROM public.contact_messages WHERE id = contact_messages.id)
  AND last_reply_at IS NOT DISTINCT FROM (SELECT last_reply_at FROM public.contact_messages WHERE id = contact_messages.id)
  AND created_at IS NOT DISTINCT FROM (SELECT created_at FROM public.contact_messages WHERE id = contact_messages.id)
  AND user_id IS NOT DISTINCT FROM (SELECT user_id FROM public.contact_messages WHERE id = contact_messages.id)
);

-- 3) Tighten email_subscriptions SELECT: drop email-based matching (JWT email can be unverified/spoofed via metadata in some setups)
DROP POLICY IF EXISTS "Users read own subscription" ON public.email_subscriptions;
CREATE POLICY "Admins read subscriptions"
ON public.email_subscriptions
FOR SELECT
TO authenticated
USING (is_admin());

-- 4) Strengthen users update policy: keep role unchanged AND lock identifying fields for non-admins
DROP POLICY IF EXISTS "Users update own row" ON public.users;
CREATE POLICY "Users update own row"
ON public.users
FOR UPDATE
TO authenticated
USING ((id = auth.uid()) OR is_admin())
WITH CHECK (
  is_admin() OR (
    id = auth.uid()
    AND role IS NOT DISTINCT FROM (SELECT u.role  FROM public.users u WHERE u.id = auth.uid())
    AND email IS NOT DISTINCT FROM (SELECT u.email FROM public.users u WHERE u.id = auth.uid())
    AND user_id IS NOT DISTINCT FROM (SELECT u.user_id FROM public.users u WHERE u.id = auth.uid())
  )
);
