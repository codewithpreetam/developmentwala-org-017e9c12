CREATE TABLE public.scholarships (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    slug character varying(255),
    description text NOT NULL,
    eligibility text NOT NULL,
    application_process text NOT NULL,
    benefits text NOT NULL,
    scholarship_type character varying(50) NOT NULL,
    field character varying(100) NOT NULL,
    level character varying(100) NOT NULL,
    country character varying(100) DEFAULT 'India'::character varying,
    state character varying(100),
    city character varying(100),
    remote boolean DEFAULT false,
    deadline date,
    amount numeric(12,2),
    currency character varying(10) DEFAULT 'INR'::character varying,
    org_name character varying(255) NOT NULL,
    org_website character varying(255),
    org_about text,
    contact_name character varying(100),
    contact_email character varying(255),
    phone character varying(30),
    featured boolean DEFAULT false,
    status character varying(20) DEFAULT 'Active'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    employer_id uuid
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scholarships TO authenticated, anon, service_role;
GRANT ALL ON public.scholarships TO service_role;
ALTER TABLE public.scholarships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated access" ON public.scholarships FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read" ON public.scholarships FOR SELECT TO anon USING (true);

CREATE SEQUENCE public.scholarships_id_seq
AS integer
START WITH 1
INCREMENT BY 1
NO MINVALUE
NO MAXVALUE
CACHE 1;