CREATE TABLE public.saved_jobs (
    id integer NOT NULL,
    user_id character varying(50) NOT NULL,
    job_id uuid NOT NULL,
    saved_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_jobs TO authenticated, anon, service_role;
GRANT ALL ON public.saved_jobs TO service_role;
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated access" ON public.saved_jobs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read" ON public.saved_jobs FOR SELECT TO anon USING (true);

CREATE SEQUENCE public.saved_jobs_id_seq
AS integer
START WITH 1
INCREMENT BY 1
NO MINVALUE
NO MAXVALUE
CACHE 1;