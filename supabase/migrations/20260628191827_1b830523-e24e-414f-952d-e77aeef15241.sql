CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying(50) NOT NULL,
    email character varying(255) NOT NULL,
    first_name character varying(100),
    last_name character varying(100),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    role character varying(20),
    is_active boolean DEFAULT true,
    profile_image text
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO authenticated, anon, service_role;
GRANT ALL ON public.users TO service_role;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated access" ON public.users FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read" ON public.users FOR SELECT TO anon USING (true);