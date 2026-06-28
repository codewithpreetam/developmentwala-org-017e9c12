CREATE TABLE public.shortlists (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    employer_id uuid NOT NULL,
    candidate_id uuid NOT NULL,
    job_id uuid,
    created_at timestamp without time zone DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shortlists TO authenticated, anon, service_role;
GRANT ALL ON public.shortlists TO service_role;
ALTER TABLE public.shortlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated access" ON public.shortlists FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read" ON public.shortlists FOR SELECT TO anon USING (true);