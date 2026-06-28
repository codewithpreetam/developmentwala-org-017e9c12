CREATE TABLE public.job_alerts (
    id integer NOT NULL,
    user_id character varying(50) NOT NULL,
    title character varying(255) NOT NULL,
    keywords text,
    location character varying(255),
    job_type character varying(100),
    experience_level character varying(100),
    salary_min numeric(10,2),
    salary_max numeric(10,2),
    frequency character varying(50) DEFAULT 'Daily'::character varying,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.job_alerts TO authenticated, anon, service_role;
GRANT ALL ON public.job_alerts TO service_role;
ALTER TABLE public.job_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated access" ON public.job_alerts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read" ON public.job_alerts FOR SELECT TO anon USING (true);

CREATE SEQUENCE public.job_alerts_id_seq
AS integer
START WITH 1
INCREMENT BY 1
NO MINVALUE
NO MAXVALUE
CACHE 1;

CREATE TABLE public.jobs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    description text NOT NULL,
    qualifications text NOT NULL,
    role_category character varying(100) NOT NULL,
    employment_type character varying(50) NOT NULL,
    experience_min integer,
    salary_currency character varying(10) NOT NULL,
    salary_value numeric(10,2),
    salary_unit_text character varying(20) NOT NULL,
    date_posted date NOT NULL,
    valid_through timestamp with time zone NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    how_to_apply text,
    organization character varying(255),
    organization_type character varying(255),
    location_id character varying(50),
    country character varying(100),
    state character varying(100),
    city character varying(100),
    pin_code character varying(20),
    street_address character varying(255),
    applylink character varying(255),
    employer_id uuid,
    user_id character varying(255),
    featured boolean DEFAULT false,
    education_required text,
    organization_logo text,
    CONSTRAINT jobs_experience_min_check CHECK ((experience_min >= 0)),
    CONSTRAINT jobs_salary_value_check CHECK ((salary_value >= (0)::numeric))
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.jobs TO authenticated, anon, service_role;
GRANT ALL ON public.jobs TO service_role;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated access" ON public.jobs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read" ON public.jobs FOR SELECT TO anon USING (true);

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    entity_title character varying(255),
    user_role character varying(50),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    read boolean DEFAULT false,
    details text,
    type character varying(50),
    entity_id uuid,
    user_id uuid
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated, anon, service_role;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated access" ON public.notifications FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read" ON public.notifications FOR SELECT TO anon USING (true);