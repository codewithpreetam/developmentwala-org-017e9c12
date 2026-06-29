
-- Revoke anon access to personal contact details on public listings
REVOKE SELECT (contact_email, phone) ON public.fellowships FROM anon;
REVOKE SELECT (contact_email, phone) ON public.internships FROM anon;
REVOKE SELECT (contact_email, phone) ON public.scholarships FROM anon;

-- Lock down contact_messages and email_subscriptions writes/reads cleanly:
-- Ensure anon cannot SELECT contact_messages (admin-only via authenticated)
REVOKE SELECT ON public.contact_messages FROM anon;
-- email_subscriptions: anon should not read; subscribed users only via policy
REVOKE SELECT ON public.email_subscriptions FROM anon;

-- Shortlists: allow candidates to read their own shortlist entries
CREATE POLICY "Candidates read own shortlist entries"
  ON public.shortlists
  FOR SELECT
  TO authenticated
  USING (candidate_id = auth.uid());
