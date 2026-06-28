CREATE SEQUENCE public.top_organisations_id_seq
AS integer
START WITH 1
INCREMENT BY 1
NO MINVALUE
NO MAXVALUE
CACHE 1;
GRANT ALL ON public.top_organisations_id_seq TO authenticated, anon, service_role;