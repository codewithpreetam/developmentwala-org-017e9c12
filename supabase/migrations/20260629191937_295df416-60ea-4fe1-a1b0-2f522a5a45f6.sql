
DROP POLICY IF EXISTS "Users update own row" ON public.users;

CREATE POLICY "Users update own row"
ON public.users
FOR UPDATE
TO authenticated
USING ((id = auth.uid()) OR public.is_admin())
WITH CHECK (
  (
    public.is_admin()
  )
  OR (
    id = auth.uid()
    AND role IS NOT DISTINCT FROM (SELECT u.role FROM public.users u WHERE u.id = auth.uid())
  )
);

-- Defense-in-depth: block role mutations via trigger as well
CREATE OR REPLACE FUNCTION public.prevent_role_self_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can change user roles';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_role_self_escalation ON public.users;
CREATE TRIGGER trg_prevent_role_self_escalation
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION public.prevent_role_self_escalation();
