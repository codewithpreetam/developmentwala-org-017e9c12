
DROP POLICY IF EXISTS "Blog posts are publicly readable" ON public.blog_posts;
CREATE POLICY "Published blog posts readable" ON public.blog_posts
  FOR SELECT TO anon, authenticated
  USING (status = 'published' OR is_admin());

-- employers: revoke broad anon SELECT, regrant non-sensitive columns
REVOKE SELECT ON public.employers FROM anon;
GRANT SELECT (
  id, name, logo, location, tags, open_positions, about, founded, company_size,
  website, social_facebook, social_twitter, social_linkedin, social_instagram,
  owner_user_id, created_at, updated_at, tagline, sector, ngo_type
) ON public.employers TO anon;

DO $$
DECLARE t text;
DECLARE cols text;
BEGIN
  FOREACH t IN ARRAY ARRAY['fellowships','internships','scholarships'] LOOP
    EXECUTE format('REVOKE SELECT ON public.%I FROM anon', t);
    SELECT string_agg(quote_ident(column_name), ', ')
      INTO cols
      FROM information_schema.columns
      WHERE table_schema='public' AND table_name=t
        AND column_name NOT IN ('contact_name','contact_email','phone');
    EXECUTE format('GRANT SELECT (%s) ON public.%I TO anon', cols, t);
  END LOOP;
END $$;

DROP POLICY IF EXISTS "Admins manage user roles insert" ON public.user_roles;
DROP POLICY IF EXISTS "Admins manage user roles update" ON public.user_roles;
DROP POLICY IF EXISTS "Admins manage user roles delete" ON public.user_roles;
CREATE POLICY "Admins manage user roles insert" ON public.user_roles
  FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "Admins manage user roles update" ON public.user_roles
  FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins manage user roles delete" ON public.user_roles
  FOR DELETE TO authenticated USING (is_admin());
