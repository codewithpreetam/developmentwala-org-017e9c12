CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role character varying(20) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE (user_id, role)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Service role can manage roles" ON public.user_roles FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE TABLE public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email character varying(255) NOT NULL,
    first_name character varying(100),
    last_name character varying(100),
    display_name character varying(255),
    avatar_url text,
    bio text,
    phone character varying(50),
    location character varying(255),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
GRANT SELECT ON public.profiles TO anon;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own profile" ON public.profiles FOR ALL TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "Public profiles are readable" ON public.profiles FOR SELECT TO anon USING (true);
CREATE POLICY "Service role can manage profiles" ON public.profiles FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
NEW.updated_at = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_timestamp() RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
NEW.updated_at = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$;

CREATE TABLE public.applications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_id uuid NOT NULL,
    candidate_id uuid NOT NULL,
    status character varying(50) NOT NULL,
    applied_at timestamp without time zone DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.applications TO authenticated, anon, service_role;
GRANT ALL ON public.applications TO service_role;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated access" ON public.applications FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read" ON public.applications FOR SELECT TO anon USING (true);

CREATE TABLE public.applied_jobs (
    id integer NOT NULL,
    user_id character varying(50) NOT NULL,
    job_id uuid NOT NULL,
    application_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(50) DEFAULT 'Applied'::character varying,
    cover_letter text,
    resume_url text,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.applied_jobs TO authenticated, anon, service_role;
GRANT ALL ON public.applied_jobs TO service_role;
ALTER TABLE public.applied_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated access" ON public.applied_jobs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read" ON public.applied_jobs FOR SELECT TO anon USING (true);

CREATE SEQUENCE public.applied_jobs_id_seq
AS integer
START WITH 1
INCREMENT BY 1
NO MINVALUE
NO MAXVALUE
CACHE 1;

CREATE TABLE public.candidate_education (
    id integer NOT NULL,
    user_id character varying(50) NOT NULL,
    institution character varying(255) NOT NULL,
    degree character varying(255) NOT NULL,
    field_of_study character varying(255),
    start_date date NOT NULL,
    end_date date,
    is_current boolean DEFAULT false,
    grade character varying(50),
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.candidate_education TO authenticated, anon, service_role;
GRANT ALL ON public.candidate_education TO service_role;
ALTER TABLE public.candidate_education ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated access" ON public.candidate_education FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read" ON public.candidate_education FOR SELECT TO anon USING (true);

CREATE SEQUENCE public.candidate_education_id_seq
AS integer
START WITH 1
INCREMENT BY 1
NO MINVALUE
NO MAXVALUE
CACHE 1;

CREATE TABLE public.candidate_experience (
    id integer NOT NULL,
    user_id character varying(50) NOT NULL,
    organisation character varying(255) NOT NULL,
    department character varying(255),
    designation character varying(255) NOT NULL,
    start_date date NOT NULL,
    end_date date,
    is_current boolean DEFAULT false,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.candidate_experience TO authenticated, anon, service_role;
GRANT ALL ON public.candidate_experience TO service_role;
ALTER TABLE public.candidate_experience ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated access" ON public.candidate_experience FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read" ON public.candidate_experience FOR SELECT TO anon USING (true);

CREATE SEQUENCE public.candidate_experience_id_seq
AS integer
START WITH 1
INCREMENT BY 1
NO MINVALUE
NO MAXVALUE
CACHE 1;

CREATE TABLE public.candidate_profiles (
    id integer NOT NULL,
    user_id character varying(50) NOT NULL,
    profile_picture_url text,
    professional_title character varying(255),
    experience_level character varying(50),
    education_level character varying(50),
    personal_website text,
    date_of_birth date,
    gender character varying(20),
    marital_status character varying(20),
    profession character varying(100),
    availability character varying(20),
    skills text,
    languages text,
    biography text,
    cv_url text,
    cv_filename character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.candidate_profiles TO authenticated, anon, service_role;
GRANT ALL ON public.candidate_profiles TO service_role;
ALTER TABLE public.candidate_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated access" ON public.candidate_profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read" ON public.candidate_profiles FOR SELECT TO anon USING (true);

CREATE SEQUENCE public.candidate_profiles_id_seq
AS integer
START WITH 1
INCREMENT BY 1
NO MINVALUE
NO MAXVALUE
CACHE 1;

CREATE TABLE public.candidate_profiles_setup (
    user_id uuid NOT NULL,
    profile_completed boolean DEFAULT false NOT NULL,
    data jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.candidate_profiles_setup TO authenticated, anon, service_role;
GRANT ALL ON public.candidate_profiles_setup TO service_role;
ALTER TABLE public.candidate_profiles_setup ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated access" ON public.candidate_profiles_setup FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read" ON public.candidate_profiles_setup FOR SELECT TO anon USING (true);

CREATE TABLE public.candidate_social_media (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying(50) NOT NULL,
    platform character varying(50) NOT NULL,
    url text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.candidate_social_media TO authenticated, anon, service_role;
GRANT ALL ON public.candidate_social_media TO service_role;
ALTER TABLE public.candidate_social_media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated access" ON public.candidate_social_media FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read" ON public.candidate_social_media FOR SELECT TO anon USING (true);

CREATE TABLE public.employer_profiles (
    user_id uuid NOT NULL,
    profile_completed boolean DEFAULT false NOT NULL,
    data jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.employer_profiles TO authenticated, anon, service_role;
GRANT ALL ON public.employer_profiles TO service_role;
ALTER TABLE public.employer_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated access" ON public.employer_profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read" ON public.employer_profiles FOR SELECT TO anon USING (true);

CREATE TABLE public.employers (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    logo character varying(255),
    location character varying(255),
    tags character varying(255),
    open_positions integer DEFAULT 0,
    about text,
    founded character varying(10),
    company_size character varying(50),
    phone character varying(30),
    email character varying(100),
    website character varying(100),
    social_facebook character varying(100),
    social_twitter character varying(100),
    social_linkedin character varying(100),
    social_instagram character varying(100)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.employers TO authenticated, anon, service_role;
GRANT ALL ON public.employers TO service_role;
ALTER TABLE public.employers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated access" ON public.employers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read" ON public.employers FOR SELECT TO anon USING (true);

CREATE TABLE public.events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying(255) NOT NULL,
    organizer character varying(255) NOT NULL,
    type character varying(100) NOT NULL,
    mode character varying(50),
    location character varying(255),
    start_date date,
    end_date date,
    link text,
    email character varying(255),
    poster_url text,
    description text,
    tags character varying(255),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    start_time character varying(20),
    end_time character varying(20),
    owner_id uuid,
    user_role character varying(50)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated, anon, service_role;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated access" ON public.events FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read" ON public.events FOR SELECT TO anon USING (true);

CREATE TABLE public.expired_jobs (
    id uuid,
    title character varying(255),
    slug character varying(255),
    description text,
    qualifications text,
    role_category character varying(100),
    employment_type character varying(50),
    experience_min integer,
    salary_currency character varying(10),
    salary_value numeric(10,2),
    salary_unit_text character varying(20),
    date_posted date,
    valid_through timestamp with time zone,
    is_active boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
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
    featured boolean
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.expired_jobs TO authenticated, anon, service_role;
GRANT ALL ON public.expired_jobs TO service_role;
ALTER TABLE public.expired_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated access" ON public.expired_jobs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read" ON public.expired_jobs FOR SELECT TO anon USING (true);

CREATE TABLE public.fellowships (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    slug character varying(255),
    description text NOT NULL,
    eligibility text NOT NULL,
    application_process text NOT NULL,
    duration character varying(100) NOT NULL,
    fellowship_type character varying(50) NOT NULL,
    field character varying(100) NOT NULL,
    country character varying(100) DEFAULT 'India'::character varying,
    state character varying(100),
    city character varying(100),
    remote boolean DEFAULT false,
    start_date date,
    deadline date,
    stipend numeric(12,2),
    stipend_unit character varying(50) DEFAULT 'Per Month'::character varying,
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
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fellowships TO authenticated, anon, service_role;
GRANT ALL ON public.fellowships TO service_role;
ALTER TABLE public.fellowships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated access" ON public.fellowships FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read" ON public.fellowships FOR SELECT TO anon USING (true);

CREATE SEQUENCE public.fellowships_id_seq
AS integer
START WITH 1
INCREMENT BY 1
NO MINVALUE
NO MAXVALUE
CACHE 1;

CREATE TABLE public.following_employers (
    id integer NOT NULL,
    user_id character varying(50) NOT NULL,
    employer_id integer NOT NULL,
    followed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.following_employers TO authenticated, anon, service_role;
GRANT ALL ON public.following_employers TO service_role;
ALTER TABLE public.following_employers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated access" ON public.following_employers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read" ON public.following_employers FOR SELECT TO anon USING (true);

CREATE SEQUENCE public.following_employers_id_seq
AS integer
START WITH 1
INCREMENT BY 1
NO MINVALUE
NO MAXVALUE
CACHE 1;

CREATE TABLE public.grants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying(255) NOT NULL,
    organization character varying(255) NOT NULL,
    type character varying(100) NOT NULL,
    sector character varying(255),
    eligible text,
    amount character varying(100),
    deadline date,
    link text,
    rfp_url text,
    description text,
    tags character varying(255),
    status character varying(50),
    featured boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    employer_id uuid
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.grants TO authenticated, anon, service_role;
GRANT ALL ON public.grants TO service_role;
ALTER TABLE public.grants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated access" ON public.grants FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read" ON public.grants FOR SELECT TO anon USING (true);