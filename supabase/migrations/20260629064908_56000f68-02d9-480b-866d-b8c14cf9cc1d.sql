
-- Grants: hide drafts from public
DROP POLICY IF EXISTS "Grants are publicly readable" ON public.grants;
CREATE POLICY "Published grants are publicly readable" ON public.grants
  FOR SELECT USING (status IN ('Published','Active'));

-- Revoke public SELECT on contact columns (column-level)
REVOKE SELECT (contact_email, phone) ON public.fellowships FROM anon, authenticated;
REVOKE SELECT (contact_email, phone) ON public.internships FROM anon, authenticated;
REVOKE SELECT (contact_email, phone) ON public.scholarships FROM anon, authenticated;
REVOKE SELECT (email, phone) ON public.employers FROM anon, authenticated;

-- Re-grant non-sensitive columns broadly by granting SELECT on all other columns
-- (column REVOKE above is sufficient; PostgREST returns 403 only when client selects the column)

-- Owners and admins keep access via existing ALL policies (no column restriction on owner path
-- because column privileges are checked against the role, not the policy. To allow owners to
-- read their own contact columns, grant column SELECT back to authenticated via a SECURITY
-- DEFINER view is overkill; instead we keep ownership reads through the service role / admin
-- path used by dashboards). For owner self-read, expose via dedicated server functions.

-- Candidate profiles: ensure no anon access to sensitive columns
REVOKE SELECT (date_of_birth, gender, marital_status, cv_url) ON public.candidate_profiles FROM anon;

-- Ensure RLS remains enforced
ALTER TABLE public.grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fellowships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_profiles ENABLE ROW LEVEL SECURITY;
