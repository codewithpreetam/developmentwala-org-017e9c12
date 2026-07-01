
-- Revoke public access to sensitive PII columns on opportunity tables
REVOKE SELECT (contact_name, contact_email, phone) ON public.fellowships FROM anon;
REVOKE SELECT (contact_name, contact_email, phone) ON public.internships FROM anon;
REVOKE SELECT (contact_name, contact_email, phone) ON public.scholarships FROM anon;
REVOKE SELECT (email) ON public.events FROM anon;
REVOKE SELECT (user_id) ON public.expired_jobs FROM anon;

-- Ensure authenticated users retain access to these columns
GRANT SELECT (contact_name, contact_email, phone) ON public.fellowships TO authenticated;
GRANT SELECT (contact_name, contact_email, phone) ON public.internships TO authenticated;
GRANT SELECT (contact_name, contact_email, phone) ON public.scholarships TO authenticated;
GRANT SELECT (email) ON public.events TO authenticated;
GRANT SELECT (user_id) ON public.expired_jobs TO authenticated;
