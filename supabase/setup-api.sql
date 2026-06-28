-- Enable Supabase Data API access for NGO tables
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO anon, authenticated, service_role;

-- Legacy email/password login against public.users (matches NGO.sql seed data)
CREATE OR REPLACE FUNCTION public.login_user(p_email text, p_password text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  u users%ROWTYPE;
BEGIN
  SELECT * INTO u
  FROM users
  WHERE lower(trim(email)) = lower(trim(p_email))
    AND password = p_password
    AND coalesce(is_active, true) = true
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  RETURN json_build_object(
    'id', u.id,
    'user_id', u.user_id,
    'email', u.email,
    'first_name', u.first_name,
    'last_name', u.last_name,
    'role', u.role,
    'profile_image', u.profile_image,
    'created_at', u.created_at,
    'updated_at', u.updated_at
  );
END;
$$;

REVOKE ALL ON FUNCTION public.login_user(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.login_user(text, text) TO anon, authenticated, service_role;
