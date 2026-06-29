
-- 1. is_admin now matches super_admin too
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $$
  SELECT public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin')
$$;

-- 2. Restrict public SELECT on listing tables to published/active rows only
DROP POLICY IF EXISTS "Fellowships are publicly readable" ON public.fellowships;
CREATE POLICY "Published fellowships are publicly readable"
ON public.fellowships FOR SELECT
USING (COALESCE(status, 'Published') IN ('Published','Active'));

DROP POLICY IF EXISTS "Internships are publicly readable" ON public.internships;
CREATE POLICY "Published internships are publicly readable"
ON public.internships FOR SELECT
USING (COALESCE(status, 'Published') IN ('Published','Active'));

DROP POLICY IF EXISTS "Scholarships are publicly readable" ON public.scholarships;
CREATE POLICY "Published scholarships are publicly readable"
ON public.scholarships FOR SELECT
USING (COALESCE(status, 'Published') IN ('Published','Active'));

-- 3. Revoke contact PII columns from anon role for listing tables
REVOKE SELECT (contact_email, phone) ON public.fellowships FROM anon;
REVOKE SELECT (contact_email, phone) ON public.internships FROM anon;
REVOKE SELECT (contact_email, phone) ON public.scholarships FROM anon;
