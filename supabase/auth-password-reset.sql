-- Password reset + resend verification (run after schema-extensions.sql)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS reset_token text,
  ADD COLUMN IF NOT EXISTS reset_expires timestamptz;

CREATE OR REPLACE FUNCTION public.request_password_reset(p_email text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  u users%ROWTYPE;
  v_token text;
  v_base text;
BEGIN
  SELECT * INTO u
  FROM users
  WHERE lower(trim(email)) = lower(trim(p_email))
    AND coalesce(is_active, true) = true
  LIMIT 1;

  IF FOUND THEN
    v_token := encode(gen_random_bytes(32), 'hex');
    v_base := coalesce(current_setting('app.base_url', true), 'http://localhost:5173');

    UPDATE users
    SET reset_token = v_token,
        reset_expires = now() + interval '1 hour',
        updated_at = now()
    WHERE id = u.id;

    INSERT INTO email_queue (to_email, subject, body_html)
    VALUES (
      u.email,
      'Reset your DevelopmentWala password',
      '<p>We received a request to reset your password.</p>' ||
      '<p><a href="' || v_base || '/ResetPassword?token=' || v_token || '">Reset password</a></p>' ||
      '<p>This link expires in 1 hour. If you did not request this, you can ignore this email.</p>'
    );
  END IF;

  RETURN json_build_object('success', true);
END;
$$;

REVOKE ALL ON FUNCTION public.request_password_reset(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.request_password_reset(text) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.reset_password_with_token(p_token text, p_password text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  u users%ROWTYPE;
BEGIN
  IF p_password IS NULL OR length(p_password) < 8 THEN
    RETURN json_build_object('success', false, 'error', 'Password must be at least 8 characters');
  END IF;

  SELECT * INTO u FROM users
  WHERE reset_token = p_token
    AND reset_expires > now()
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Invalid or expired reset link');
  END IF;

  UPDATE users
  SET password_hash = crypt(p_password, gen_salt('bf')),
      password = NULL,
      reset_token = NULL,
      reset_expires = NULL,
      updated_at = now()
  WHERE id = u.id;

  RETURN json_build_object('success', true, 'email', u.email);
END;
$$;

REVOKE ALL ON FUNCTION public.reset_password_with_token(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reset_password_with_token(text, text) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.resend_verification_email(p_email text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  u users%ROWTYPE;
  v_token text;
  v_base text;
BEGIN
  SELECT * INTO u
  FROM users
  WHERE lower(trim(email)) = lower(trim(p_email))
    AND coalesce(is_active, true) = true
  LIMIT 1;

  IF NOT FOUND OR coalesce(u.email_verified, false) = true OR u.role = 'super_admin' THEN
    RETURN json_build_object('success', true);
  END IF;

  v_token := encode(gen_random_bytes(32), 'hex');
  v_base := coalesce(current_setting('app.base_url', true), 'http://localhost:5173');

  UPDATE users
  SET verification_token = v_token,
      verification_expires = now() + interval '7 days',
      updated_at = now()
  WHERE id = u.id;

  INSERT INTO email_queue (to_email, subject, body_html)
  VALUES (
    u.email,
    'Verify your DevelopmentWala account',
    '<p>Click to verify your email:</p>' ||
    '<p><a href="' || v_base || '/VerifyEmail?token=' || v_token || '">Verify Email</a></p>' ||
    '<p>This link expires in 7 days.</p>'
  );

  RETURN json_build_object('success', true);
END;
$$;

REVOKE ALL ON FUNCTION public.resend_verification_email(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.resend_verification_email(text) TO anon, authenticated, service_role;
