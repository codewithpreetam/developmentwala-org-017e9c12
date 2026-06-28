--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

--
-- Name: update_updated_at_timestamp(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE OR REPLACE FUNCTION public.update_updated_at_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_timestamp() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: applications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.applications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_id uuid NOT NULL,
    candidate_id uuid NOT NULL,
    status character varying(50) NOT NULL,
    applied_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.applications OWNER TO postgres;

--
-- Name: applied_jobs; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.applied_jobs OWNER TO postgres;

--
-- Name: applied_jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.applied_jobs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.applied_jobs_id_seq OWNER TO postgres;

--
-- Name: applied_jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.applied_jobs_id_seq OWNED BY public.applied_jobs.id;


--
-- Name: candidate_education; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.candidate_education OWNER TO postgres;

--
-- Name: candidate_education_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.candidate_education_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.candidate_education_id_seq OWNER TO postgres;

--
-- Name: candidate_education_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.candidate_education_id_seq OWNED BY public.candidate_education.id;


--
-- Name: candidate_experience; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.candidate_experience OWNER TO postgres;

--
-- Name: candidate_experience_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.candidate_experience_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.candidate_experience_id_seq OWNER TO postgres;

--
-- Name: candidate_experience_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.candidate_experience_id_seq OWNED BY public.candidate_experience.id;


--
-- Name: candidate_profiles; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.candidate_profiles OWNER TO postgres;

--
-- Name: candidate_profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.candidate_profiles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.candidate_profiles_id_seq OWNER TO postgres;

--
-- Name: candidate_profiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.candidate_profiles_id_seq OWNED BY public.candidate_profiles.id;


--
-- Name: candidate_profiles_setup; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.candidate_profiles_setup (
    user_id uuid NOT NULL,
    profile_completed boolean DEFAULT false NOT NULL,
    data jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.candidate_profiles_setup OWNER TO postgres;

--
-- Name: candidate_social_media; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.candidate_social_media (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying(50) NOT NULL,
    platform character varying(50) NOT NULL,
    url text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.candidate_social_media OWNER TO postgres;

--
-- Name: employer_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employer_profiles (
    user_id uuid NOT NULL,
    profile_completed boolean DEFAULT false NOT NULL,
    data jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.employer_profiles OWNER TO postgres;

--
-- Name: employers; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.employers OWNER TO postgres;

--
-- Name: events; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.events OWNER TO postgres;

--
-- Name: expired_jobs; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.expired_jobs OWNER TO postgres;

--
-- Name: fellowships; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.fellowships OWNER TO postgres;

--
-- Name: fellowships_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.fellowships_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.fellowships_id_seq OWNER TO postgres;

--
-- Name: fellowships_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.fellowships_id_seq OWNED BY public.fellowships.id;


--
-- Name: following_employers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.following_employers (
    id integer NOT NULL,
    user_id character varying(50) NOT NULL,
    employer_id integer NOT NULL,
    followed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.following_employers OWNER TO postgres;

--
-- Name: following_employers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.following_employers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.following_employers_id_seq OWNER TO postgres;

--
-- Name: following_employers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.following_employers_id_seq OWNED BY public.following_employers.id;


--
-- Name: grants; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.grants OWNER TO postgres;

--
-- Name: internships; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.internships (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    slug character varying(255),
    description text NOT NULL,
    eligibility text NOT NULL,
    application_process text NOT NULL,
    duration character varying(100) NOT NULL,
    internship_type character varying(50) NOT NULL,
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
    apply_link text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    employer_id uuid
);


ALTER TABLE public.internships OWNER TO postgres;

--
-- Name: internships_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.internships_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.internships_id_seq OWNER TO postgres;

--
-- Name: internships_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.internships_id_seq OWNED BY public.internships.id;


--
-- Name: job_alerts; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.job_alerts OWNER TO postgres;

--
-- Name: job_alerts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.job_alerts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.job_alerts_id_seq OWNER TO postgres;

--
-- Name: job_alerts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.job_alerts_id_seq OWNED BY public.job_alerts.id;


--
-- Name: jobs; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.jobs OWNER TO postgres;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: saved_jobs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.saved_jobs (
    id integer NOT NULL,
    user_id character varying(50) NOT NULL,
    job_id uuid NOT NULL,
    saved_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.saved_jobs OWNER TO postgres;

--
-- Name: saved_jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.saved_jobs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.saved_jobs_id_seq OWNER TO postgres;

--
-- Name: saved_jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.saved_jobs_id_seq OWNED BY public.saved_jobs.id;


--
-- Name: scholarships; Type: TABLE; Schema: public; Owner: postgres
--

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


ALTER TABLE public.scholarships OWNER TO postgres;

--
-- Name: scholarships_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.scholarships_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.scholarships_id_seq OWNER TO postgres;

--
-- Name: scholarships_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.scholarships_id_seq OWNED BY public.scholarships.id;


--
-- Name: shortlists; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shortlists (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    employer_id uuid NOT NULL,
    candidate_id uuid NOT NULL,
    job_id uuid,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.shortlists OWNER TO postgres;

--
-- Name: top_organisations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.top_organisations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.top_organisations_id_seq OWNER TO postgres;

--
-- Name: top_organisations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.top_organisations_id_seq OWNED BY public.employers.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying(50) NOT NULL,
    password character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    first_name character varying(100),
    last_name character varying(100),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    role character varying(20),
    is_active boolean DEFAULT true,
    profile_image text
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: applied_jobs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applied_jobs ALTER COLUMN id SET DEFAULT nextval('public.applied_jobs_id_seq'::regclass);


--
-- Name: candidate_education id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidate_education ALTER COLUMN id SET DEFAULT nextval('public.candidate_education_id_seq'::regclass);


--
-- Name: candidate_experience id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidate_experience ALTER COLUMN id SET DEFAULT nextval('public.candidate_experience_id_seq'::regclass);


--
-- Name: candidate_profiles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidate_profiles ALTER COLUMN id SET DEFAULT nextval('public.candidate_profiles_id_seq'::regclass);


--
-- Name: employers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employers ALTER COLUMN id SET DEFAULT nextval('public.top_organisations_id_seq'::regclass);


--
-- Name: fellowships id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fellowships ALTER COLUMN id SET DEFAULT nextval('public.fellowships_id_seq'::regclass);


--
-- Name: following_employers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.following_employers ALTER COLUMN id SET DEFAULT nextval('public.following_employers_id_seq'::regclass);


--
-- Name: internships id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.internships ALTER COLUMN id SET DEFAULT nextval('public.internships_id_seq'::regclass);


--
-- Name: job_alerts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_alerts ALTER COLUMN id SET DEFAULT nextval('public.job_alerts_id_seq'::regclass);


--
-- Name: saved_jobs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saved_jobs ALTER COLUMN id SET DEFAULT nextval('public.saved_jobs_id_seq'::regclass);


--
-- Name: scholarships id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scholarships ALTER COLUMN id SET DEFAULT nextval('public.scholarships_id_seq'::regclass);


--
-- Data for Name: applications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.applications (id, job_id, candidate_id, status, applied_at) FROM stdin;
5ff26284-56e6-43d2-b44a-65f0b1cb4ba8	1a416b9c-c5d7-45f9-a587-b196188fcf34	7b6d7b54-3794-43f6-8ed1-45159a8c0160	submitted	2025-08-25 21:57:29.207598
4fddfd3c-6fe5-4101-bd52-0de4199b0431	38bd3575-42f0-4c9a-8b1c-5323ca0c027c	daf01176-a437-42c3-8841-a63885685fcc	submitted	2026-04-07 23:44:47.85384
33443067-2560-4763-a018-77f35a041792	38bd3575-42f0-4c9a-8b1c-5323ca0c027c	0a97935e-2381-43e9-ab4c-de4d0a182a41	submitted	2026-04-07 23:58:31.504179
\.


--
-- Data for Name: applied_jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.applied_jobs (id, user_id, job_id, application_date, status, cover_letter, resume_url, notes, created_at, updated_at) FROM stdin;
6	7b6d7b54-3794-43f6-8ed1-45159a8c0160	f1a383d3-f1b6-462d-973b-a8687fa948e0	2025-08-25 21:38:34.597482	Applied	Applied via internal portal for job f1a383d3-f1b6-462d-973b-a8687fa948e0	\N	Applied via internal portal	2025-08-25 21:56:47.7409	2025-08-25 21:56:47.7409
7	7b6d7b54-3794-43f6-8ed1-45159a8c0160	1a416b9c-c5d7-45f9-a587-b196188fcf34	2025-08-25 21:57:29.207598	Applied	\N	\N	\N	2025-08-25 21:57:29.207598	2025-08-25 21:57:29.207598
9	daf01176-a437-42c3-8841-a63885685fcc	38bd3575-42f0-4c9a-8b1c-5323ca0c027c	2026-04-07 23:44:47.85384	Applied	Interested in this position	\N	Applied from recommendations	2026-04-07 23:44:47.85384	2026-04-07 23:44:47.85384
10	0a97935e-2381-43e9-ab4c-de4d0a182a41	38bd3575-42f0-4c9a-8b1c-5323ca0c027c	2026-04-07 23:58:31.504179	Applied	Interested in this position	\N	Applied from recommendations	2026-04-07 23:58:31.504179	2026-04-07 23:58:31.504179
\.


--
-- Data for Name: candidate_education; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.candidate_education (id, user_id, institution, degree, field_of_study, start_date, end_date, is_current, grade, description, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: candidate_experience; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.candidate_experience (id, user_id, organisation, department, designation, start_date, end_date, is_current, description, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: candidate_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.candidate_profiles (id, user_id, profile_picture_url, professional_title, experience_level, education_level, personal_website, date_of_birth, gender, marital_status, profession, availability, skills, languages, biography, cv_url, cv_filename, created_at, updated_at) FROM stdin;
1	7dccfe22-6024-4f7e-97e4-1c4d7f8aae9b	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	/uploads/cv/7dccfe22-6024-4f7e-97e4-1c4d7f8aae9b/cv_1775672303115.pdf	cv_1775672303115.pdf	2026-04-08 23:48:23.409859	2026-04-08 23:48:27.885109
\.


--
-- Data for Name: candidate_profiles_setup; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.candidate_profiles_setup (user_id, profile_completed, data, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: candidate_social_media; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.candidate_social_media (id, user_id, platform, url, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: employer_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employer_profiles (user_id, profile_completed, data, created_at, updated_at) FROM stdin;
0a97935e-2381-43e9-ab4c-de4d0a182a41	t	{"city": "Ranchi", "state": "Jharkhand", "country": "India", "logoUrl": "/uploads/employers/0a97935e-2381-43e9-ab4c-de4d0a182a41/logo_1775580107713.webp", "fullName": "Subhash Tech", "workEmail": "subhash87@example.com", "websiteUrl": "http://localhost:3000/", "zipPinCode": "834001", "acceptTerms": true, "fullAddress": "Bhursabad", "phoneNumber": "12345678922", "acceptPrivacy": true, "certificateUrl": "/uploads/employers/0a97935e-2381-43e9-ab4c-de4d0a182a41/certificate_1775580108494.pdf", "roleDesignation": "TL", "organizationName": "Subhash Tech", "organizationType": "NGO", "numberOfEmployees": "1-10", "emailNotifications": true, "linkedinProfileUrl": "http://localhost:3000/", "registrationNumber": "765786737373", "allowDirectMessages": true, "legitimateOrgConfirmed": true, "newsletterSubscription": true, "organizationLinkedinPageUrl": "http://localhost:3000/"}	2026-04-07 22:11:49.303833+05:30	2026-04-07 22:11:49.303833+05:30
\.


--
-- Data for Name: employers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employers (id, name, logo, location, tags, open_positions, about, founded, company_size, phone, email, website, social_facebook, social_twitter, social_linkedin, social_instagram) FROM stdin;
1	LeadTech	/images/leadtech.png	Bangalore, India	Consulting	7	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
2	Watershed Organisation Trust (WOTR)	/images/wotr.png	Pune, India	Water Management	5	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
3	Smile Foundation	/images/smile.png	Delhi, India	Child Welfare	8	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
4	Goonj	/images/goonj.png	Delhi, India	Disaster Relief	4	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
5	Pratham	/images/pratham.png	Mumbai, India	Education	10	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
6	HelpAge India	/images/helpage.png	Chennai, India	Elderly Care	3	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
7	CRY	/images/cry.png	Kolkata, India	Child Rights	6	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
8	Akshaya Patra	/images/akshayapatra.png	Bangalore, India	Nutrition	9	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
9	Teach For India	/images/tfi.png	Pune, India	Education	12	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
10	SEWA	/images/sewa.png	Ahmedabad, India	Women Empowerment	5	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
11	Oxfam India	/images/oxfam.png	Delhi, India	Poverty Alleviation	7	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
12	CARE India	/images/care.png	Patna, India	Healthcare	6	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
13	Save the Children	/images/stc.png	Gurgaon, India	Child Welfare	8	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
15	Greenpeace India	/images/greenpeace.png	Bangalore, India	Environment	5	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
16	Room to Read	/images/roomtoread.png	New Delhi, India	Literacy	3	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
17	Magic Bus	/images/magicbus.png	Mumbai, India	Youth Development	6	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
18	Plan India	/images/planindia.png	Delhi, India	Child Development	7	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
19	Sightsavers India	/images/sightsavers.png	Lucknow, India	Disability	2	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
20	GiveIndia	/images/giveindia.png	Mumbai, India	Fundraising	9	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
14	ActionAid India	/images/actionaid.png	Bangalore, India	Human Rights	4	Moody’s Corporation, often referred to as Moody’s, is an American business and financial services company. It is the holding company for Moody’s Investors Service (MIS), an American credit rating agency, and Moody’s Analytics (MA), an American provider of financial analysis software and services.	1995	50-80	123 444 ***	medium@apus.com	envafo.com	https://facebook.com/moody	https://twitter.com/moody	https://linkedin.com/company/moody	https://instagram.com/moody
\.


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.events (id, title, organizer, type, mode, location, start_date, end_date, link, email, poster_url, description, tags, created_at, updated_at, start_time, end_time, owner_id, user_role) FROM stdin;
086dc32e-ba4a-4251-9e49-22329287ed2f	Women in Tech Summit	Tech4Women	Seminar	Offline	Bangalore, India	2024-09-15	2024-09-15	https://example.com/event3	info@tech4women.org	\N	A one-day seminar focused on empowering women in technology. Sessions include leadership workshops, coding bootcamps, and career guidance.	women,technology,seminar	2025-07-07 19:48:41.150078+05:30	2025-07-07 19:48:41.150078+05:30	9:30 AM	4:00 PM	\N	\N
22fcb073-7c53-4fd6-bb66-90ecae9c142d	Rural Development Workshop	Local Impact Fund	Workshop	Offline	Patna, Bihar	2024-11-20	2024-11-21	https://localimpact.org/workshop	workshops@localimpact.org	/images/wa.jpg	A two-day hands-on workshop for NGOs working in rural development. Topics include sustainable agriculture, water management, and community mobilization.\\n\\nIncludes field visits and practical demonstrations.	rural, development, workshop	2025-07-07 01:12:46.085686+05:30	2025-07-07 01:12:46.085686+05:30	9:30 AM	4:00 PM	\N	\N
31e2d6fd-f1a9-4e6f-98d8-11bc148d78dd	Women in Tech Summit	STEM4Her Foundation	Seminar	Hybrid	Bangalore, India	2024-09-15	2024-09-15	https://stem4her.org/summit	contact@stem4her.org	/images/undraw_hiring_8szx.svg	A one-day seminar focused on empowering women in technology. Sessions include leadership workshops, coding bootcamps, and career guidance.\\n\\nOpen to students, professionals, and organizations supporting gender equality in STEM.	women, technology, seminar	2025-07-07 01:12:46.085686+05:30	2025-07-07 01:12:46.085686+05:30	9:30 AM	4:00 PM	\N	\N
887625a2-7748-4e9d-b4b6-032029df7e47	Climate Action Webinar	Green Future Org	Webinar	Online		2024-10-05	2024-10-05	https://greenfuture.org/webinar	events@greenfuture.org	/images/premium-services.svg	Join experts from around the world to discuss innovative solutions for climate change. The webinar will feature case studies, Q&A sessions, and opportunities for collaboration.\\n\\nFree registration for all participants.	climate, environment, webinar	2025-07-07 01:12:46.085686+05:30	2025-07-07 01:12:46.085686+05:30	9:30 AM	4:00 PM	\N	\N
c1a1d01c-9c38-448d-a9e8-d4563d22b64c	National NGO Conference 2024	India Social Forum	Conference	Offline	New Delhi, India	2024-08-10	2024-08-12	https://ngoconf2024.org	info@ngoconf2024.org	/images/pexels-zhuhehuai-716276.jpg	A three-day conference bringing together NGOs, donors, and policymakers to discuss the future of social impact in India.\\n\\nKeynote speakers, panel discussions, and networking sessions will be held. Participants will have the opportunity to present their work and collaborate on new initiatives.	NGO, conference, social impact	2025-07-07 01:12:46.085686+05:30	2025-07-07 01:12:46.085686+05:30	9:30 AM	4:00 PM	\N	\N
0e0e27fb-3046-469b-9c09-661018a83a9d	National Conference on Inclusive Education	Teach for Change	Conference	Offline	New Delhi, Delhi	2025-08-10	2025-08-12	https://teachforchange.org/inclusive-education2025	events@teachforchange.org	https://example.org/images/events/inclusive-education.jpg	A 3-day conference bringing educators, NGOs, and policy makers to discuss strategies for inclusive and equitable education in India.	education, inclusion, policy	2025-07-31 20:23:19.846+05:30	2025-07-31 20:23:19.846+05:30	\N	\N	\N	\N
623f8e36-ffd6-49c7-8fa5-77adc82d2b6c	Women in Climate Leadership Workshop	GreenFuture Alliance	Workshop	Hybrid	Bangalore, Karnataka	2025-09-05	2025-09-06	https://greenfuture.org/climate-leadership	climate@greenfuture.org	https://example.org/images/events/climate-leadership.jpg	A hybrid workshop highlighting the role of women leaders in driving climate action across rural and urban regions.	climate, women empowerment, leadership	2025-07-31 20:23:19.977+05:30	2025-07-31 20:23:19.977+05:30	\N	\N	\N	\N
7a3f233f-73cd-4abd-a768-af5dcf7259e8	Mental Health & Youth Wellbeing Summit	Mind Matters India	Summit	Online		2025-08-28	2025-08-29	https://mindmatters.org/mentalhealthsummit	info@mindmatters.org	https://example.org/images/events/mental-health-summit.jpg	Online summit focusing on adolescent mental health, stress management and community-based interventions.	mental health, youth, wellbeing	2025-07-31 20:23:19.979+05:30	2025-07-31 20:23:19.979+05:30	\N	\N	\N	\N
d90d7f62-0904-489c-a4e0-701e25205019	NGO Digital Tools Bootcamp	Tech4Impact	Training	Online		2025-09-15	2025-09-17	https://tech4impact.org/bootcamp2025	trainings@tech4impact.org	https://example.org/images/events/digital-tools.jpg	A 3-day bootcamp teaching small and medium NGOs how to use digital tools for monitoring, communication, and donor reporting.	ICT4D, NGO, digital tools	2025-07-31 20:23:19.98+05:30	2025-07-31 20:23:19.98+05:30	\N	\N	\N	\N
056fc776-3a33-46cf-b23f-5ca92347dcca	Community WASH Innovation Challenge	WaterWorks India	Hackathon	Offline	Ahmedabad, Gujarat	2025-08-20	2025-08-21	https://waterworksindia.org/washchallenge	wash@waterworksindia.org	https://example.org/images/events/wash-challenge.jpg	A 2-day hackathon inviting young innovators and social workers to create scalable water and sanitation solutions.	WASH, innovation, community development	2025-07-31 20:23:19.981+05:30	2025-07-31 20:23:19.981+05:30	\N	\N	\N	\N
12a4495a-39ec-4fd5-9989-b57d315b4e32	Livelihoods & Microenterprise Forum	Grameen Udyog	Seminar	Hybrid	Ranchi, Jharkhand	2025-08-22	2025-08-23	https://grameenudyog.org/forum2025	info@grameenudyog.org	https://example.org/images/events/livelihoods-forum.jpg	Engaging panel discussions and success stories from rural microenterprises empowering marginalized communities.	livelihoods, microenterprise, rural development	2025-07-31 20:23:19.981+05:30	2025-07-31 20:23:19.981+05:30	\N	\N	\N	\N
31d7d1cc-af7a-4296-b1b3-4583186a2a31	Urban Governance & Advocacy Dialogue	Civic Rights India	Panel Discussion	Offline	Mumbai, Maharashtra	2025-09-02	2025-09-02	https://civicrightsindia.org/urbanadvocacy	contact@civicrightsindia.org	https://example.org/images/events/urban-governance.jpg	A dialogue among civil society groups, activists, and policymakers to address the future of inclusive urban governance.	urban, governance, advocacy	2025-07-31 20:23:19.982+05:30	2025-07-31 20:23:19.982+05:30	\N	\N	\N	\N
3ee4018d-7708-4682-b491-9691b33bc5e3	Rights of Persons with Disabilities Expo	Enable India	Exhibition	Offline	Hyderabad, Telangana	2025-08-18	2025-08-19	https://enableindia.org/rpwdexpo2025	events@enableindia.org	https://example.org/images/events/disability-expo.jpg	An exhibition showcasing innovations, resources, and stories of empowerment for persons with disabilities.	disability, inclusion, accessibility	2025-07-31 20:23:19.982+05:30	2025-07-31 20:23:19.982+05:30	\N	\N	\N	\N
465eba4a-b8b3-44c5-a2b1-79e07f7dbe15	Fundraising for Impact: Virtual Masterclass	Social Impact School	Masterclass	Online		2025-09-12	2025-09-12	https://socialimpactschool.org/fundraisingmasterclass	masterclass@socialimpactschool.org	https://example.org/images/events/fundraising.jpg	Learn proven fundraising strategies from sector experts and build donor-ready proposals in this interactive masterclass.	fundraising, CSR, impact	2025-07-31 20:23:19.983+05:30	2025-07-31 20:23:19.983+05:30	\N	\N	\N	\N
b5562524-53f6-4de6-9963-ffccad08dd11	South Asia Gender Equity Summit	Women for Justice Network	Summit	Hybrid	Kolkata, West Bengal	2025-09-20	2025-09-21	https://wfjnetwork.org/gender2025	events@wfjnetwork.org	https://example.org/images/events/gender-equity.jpg	A high-impact summit engaging gender activists and researchers from across South Asia to drive policy change.	gender, women empowerment, equity	2025-07-31 20:23:19.985+05:30	2025-07-31 20:23:19.985+05:30	\N	\N	\N	\N
98dbf8c3-1729-4e1a-855d-37fa51426650	EVENTT	EVENTT	Conference	Online	Ranchi	2026-11-10	2026-12-10	http://localhost:3000/	demo@example.com	/uploads/events/cb1e08b4-c87e-4bcb-809d-e8b1e2a9b666/event_1775484403927.jpg	EVENTT	education	2026-04-06 18:11:36.796893+05:30	2026-04-06 19:36:44.594807+05:30	\N	\N	cb1e08b4-c87e-4bcb-809d-e8b1e2a9b666	super_admin
\.


--
-- Data for Name: expired_jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.expired_jobs (id, title, slug, description, qualifications, role_category, employment_type, experience_min, salary_currency, salary_value, salary_unit_text, date_posted, valid_through, is_active, created_at, updated_at, how_to_apply, organization, organization_type, location_id, country, state, city, pin_code, street_address, applylink, employer_id, user_id, featured) FROM stdin;
\.


--
-- Data for Name: fellowships; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fellowships (id, title, slug, description, eligibility, application_process, duration, fellowship_type, field, country, state, city, remote, start_date, deadline, stipend, stipend_unit, currency, org_name, org_website, org_about, contact_name, contact_email, phone, featured, status, created_at, updated_at, employer_id) FROM stdin;
2	Public Health Innovation Fellow	public-health-innovation-fellow-lucknow-uttar-pradesh	Lead innovative health projects focusing on rural healthcare access and disease prevention.	Postgraduates in Public Health or Medicine with at least 1 year of experience.	Submit a detailed project proposal and CV via the application link.	6 months	In-person	Health	India	Uttar Pradesh	Lucknow	f	\N	2025-08-15	25000.00	Per Month	INR	Health for All Foundation	https://healthforall.org	A leading NGO dedicated to improving healthcare access across India.	Dr. Anil Sharma	anil.sharma@healthforall.org	9876543210	t	Active	2025-07-31 20:45:21.175749	2025-07-31 20:45:21.175749	\N
3	Rural Empowerment Fellow	rural-empowerment-fellow-jaipur-rajasthan	Develop and implement sustainable livelihood programs in rural communities.	Graduates in Rural Development or Agriculture with leadership skills.	Apply with CV and a 500-word essay on rural development.	8 months	Hybrid	Rural Development	India	Rajasthan	Jaipur	t	\N	2025-09-15	20000.00	Per Month	INR	Rural Rise Initiative	https://ruralrise.org	Focused on uplifting rural economies through sustainable practices.	Ms. Priya Mehta	priya.mehta@ruralrise.org	8765432109	f	Active	2025-07-31 20:46:58.642894	2025-07-31 20:46:58.642894	\N
4	Gender Justice Fellow	gender-justice-fellow-mumbai-maharashtra	Advocate for gender equality through policy research and community engagement.	Postgraduates in Gender Studies or Law with advocacy experience.	Submit resume and a policy brief via the application link.	7 months	Remote	Gender & Women Empowerment	India	Maharashtra	Mumbai	t	\N	2025-08-31	23000.00	Per Month	INR	Women’s Empowerment Network	https://womempower.org	Promoting gender equality and women’s rights across India.	Ms. Sunita Desai	sunita.desai@womempower.org	7654321098	t	Active	2025-07-31 20:48:48.034732	2025-07-31 20:48:48.034732	\N
5	Child Rights Advocate Fellow	child-rights-advocate-fellow-chennai-tamil-nadu	Work on child protection policies and support legal aid for children.	Law graduates or social workers with child rights knowledge.	Apply with CV and a case study via the link.	6 months	In-person	Child Rights & Protection	India	Tamil Nadu	Chennai	f	\N	2025-09-25	24000.00	Per Month	INR	ChildAid India	https://childaid.org	Dedicated to protecting and promoting children’s rights.	Mr. Ravi Kumar	ravi.kumar@childaid.org	6543210987	f	Active	2025-07-31 20:50:53.26268	2025-07-31 20:50:53.26268	\N
6	Climate Action Fellow	climate-action-fellow-kochi-kerala	Lead initiatives on climate change mitigation and environmental education.	Environmental Science graduates with project management skills.	Submit CV and an environmental plan via the application link.	9 months	In-person	Environment & Climate Change	India	Kerala	Kochi	f	\N	2025-10-15	22000.00	Per Month	INR	Green Earth Collective	https://greenearth.org	Working towards a sustainable and green future.	Ms. Lakshmi Nair	lakshmi.nair@greenearth.org	5432109876	t	Active	2025-07-31 20:52:32.312665	2025-07-31 20:52:32.312665	\N
7	Inclusion Fellow	inclusion-fellow-new-delhi-delhi	Develop inclusive programs for people with disabilities in educational settings.	Special Education or Social Work graduates with field experience.	Apply with resume and a proposal on inclusion.	6 months	Hybrid	Disability & Inclusion	India	Delhi	New Delhi	t	\N	2025-09-05	23000.00	Per Month	INR	Inclusive Futures	https://inclusivefutures.org	Advocating for disability inclusion and accessibility.	Mr. Vikram Singh	vikram.singh@inclusivefutures.org	4321098765	f	Active	2025-07-31 20:54:03.179933	2025-07-31 20:54:03.179933	\N
8	Fundraising Strategy Fellow	fundraising-strategy-fellow-kolkata-west-bengal	Design and execute fundraising strategies for community development projects.	Business or Marketing graduates with fundraising experience.	Submit portfolio and application via the link.	7 months	Remote	Fundraising & Partnerships	India	West Bengal	Kolkata	t	\N	2025-09-30	25000.00	Per Month	INR	Fundraise India	https://fundraiseindia.org	Supporting NGOs with innovative fundraising solutions.	Ms. Anjali Roy	anjali.roy@fundraiseindia.org	3210987654	t	Active	2025-07-31 20:55:28.414859	2025-07-31 20:55:28.414859	\N
9	Impact Assessment Fellow	impact-assessment-fellow-ahmedabad-gujarat	Conduct impact evaluations for development programs across India.	Statistics or Development Studies graduates with research skills.	Apply with CV and a sample analysis via the link.	8 months	In-person	Monitoring & Evaluation (M&E)	India	Gujarat	Ahmedabad	f	\N	2025-10-25	24000.00	Per Month	INR	Impact Metrics	https://impactmetrics.org	Specializing in program evaluation and impact analysis.	Mr. Sanjay Patel	sanjay.patel@impactmetrics.org	2109876543	f	Active	2025-07-31 20:57:02.437251	2025-07-31 20:57:02.437251	\N
10	Media Advocacy Fellow	media-advocacy-fellow-bangalore-karnataka	Create media campaigns to raise awareness on social issues.	Journalism or Media Studies graduates with content creation skills.	Submit portfolio and application via the link.	6 months	Remote	Communications & Media	India	Karnataka	Bangalore	t	\N	2025-08-25	22000.00	Per Month	INR	Media for Change	https://mediaforchange.org	Using media to drive social and environmental change.	Ms. Neha Reddy	neha.reddy@mediaforchange.org	1098765432	t	Active	2025-07-31 20:58:25.024258	2025-07-31 20:58:25.024258	\N
11	Urban Planning Fellow	urban-planning-fellow-hyderabad-telangana	Develop strategies for sustainable urban development and infrastructure.	Urban Planning or Architecture graduates with design experience.	Apply with CV and a project proposal via the link.	9 months	In-person	Urban Development	India	Telangana	Hyderabad	f	\N	2025-10-05	26000.00	Per Month	INR	City Futures Initiative	https://cityfutures.org	Focused on sustainable urban growth and planning.	Mr. Arjun Rao	arjun.rao@cityfutures.org	0987654321	f	Active	2025-07-31 20:59:42.115374	2025-07-31 20:59:42.115374	\N
22	Public Health Innovation Fellow	public-health-innovation-fellow	Lead innovative health projects focusing on rural healthcare access and disease prevention.	Postgraduates in Public Health or Medicine with at least 1 year of experience.	Submit a detailed project proposal and CV via the application link.	6 months	In-person	Health	India	Uttar Pradesh	Lucknow	f	2025-09-01	2025-08-15	25000.00	Per Month	INR	Health for All Foundation	https://healthforall.org	A leading NGO dedicated to improving healthcare access across India.	Dr. Anil Sharma	anil.sharma@healthforall.org	9876543210	t	Active	2025-08-01 19:28:31.04464	2025-08-01 19:28:31.04464	\N
23	Rural Empowerment Fellow	rural-empowerment-fellow	Develop and implement sustainable livelihood programs in rural communities.	Graduates in Rural Development or Agriculture with leadership skills.	Apply with CV and a 500-word essay on rural development.	8 months	Hybrid	Rural Development	India	Rajasthan	Jaipur	t	2025-10-01	2025-09-15	20000.00	Per Month	INR	Rural Rise Initiative	https://ruralrise.org	Focused on uplifting rural economies through sustainable practices.	Ms. Priya Mehta	priya.mehta@ruralrise.org	8765432109	f	Active	2025-08-01 19:28:31.053832	2025-08-01 19:28:31.053832	\N
24	Gender Justice Fellow	gender-justice-fellow	Advocate for gender equality through policy research and community engagement.	Postgraduates in Gender Studies or Law with advocacy experience.	Submit resume and a policy brief via the application link.	7 months	Remote	Gender & Women Empowerment	India	Maharashtra	Mumbai	t	2025-09-15	2025-08-31	23000.00	Per Month	INR	Women's Empowerment Network	https://womempower.org	Promoting gender equality and women's rights across India.	Ms. Sunita Desai	sunita.desai@womempower.org	7654321098	t	Active	2025-08-01 19:28:31.055127	2025-08-01 19:28:31.055127	\N
25	Child Rights Advocate Fellow	child-rights-advocate-fellow	Work on child protection policies and support legal aid for children.	Law graduates or social workers with child rights knowledge.	Apply with CV and a case study via the link.	6 months	In-person	Child Rights & Protection	India	Tamil Nadu	Chennai	f	2025-10-10	2025-09-25	24000.00	Per Month	INR	ChildAid India	https://childaid.org	Dedicated to protecting and promoting children's rights.	Mr. Ravi Kumar	ravi.kumar@childaid.org	6543210987	f	Active	2025-08-01 19:28:31.056236	2025-08-01 19:28:31.056236	\N
26	Climate Action Fellow	climate-action-fellow	Lead initiatives on climate change mitigation and environmental education.	Environmental Science graduates with project management skills.	Submit CV and an environmental plan via the application link.	9 months	In-person	Environment & Climate Change	India	Kerala	Kochi	f	2025-11-01	2025-10-15	22000.00	Per Month	INR	Green Earth Collective	https://greenearth.org	Working towards a sustainable and green future.	Ms. Lakshmi Nair	lakshmi.nair@greenearth.org	5432109876	t	Active	2025-08-01 19:28:31.060039	2025-08-01 19:28:31.060039	\N
27	Inclusion Fellow	inclusion-fellow	Develop inclusive programs for people with disabilities in educational settings.	Special Education or Social Work graduates with field experience.	Apply with resume and a proposal on inclusion.	6 months	Hybrid	Disability & Inclusion	India	Delhi	New Delhi	t	2025-09-20	2025-09-05	23000.00	Per Month	INR	Inclusive Futures	https://inclusivefutures.org	Advocating for disability inclusion and accessibility.	Mr. Vikram Singh	vikram.singh@inclusivefutures.org	4321098765	f	Active	2025-08-01 19:28:31.061295	2025-08-01 19:28:31.061295	\N
28	Fundraising Strategy Fellow	fundraising-strategy-fellow	Design and execute fundraising strategies for community development projects.	Business or Marketing graduates with fundraising experience.	Submit portfolio and application via the link.	7 months	Remote	Fundraising & Partnerships	India	West Bengal	Kolkata	t	2025-10-15	2025-09-30	25000.00	Per Month	INR	Fundraise India	https://fundraiseindia.org	Supporting NGOs with innovative fundraising solutions.	Ms. Anjali Roy	anjali.roy@fundraiseindia.org	3210987654	t	Active	2025-08-01 19:28:31.062189	2025-08-01 19:28:31.062189	\N
29	Impact Assessment Fellow	impact-assessment-fellow	Conduct impact evaluations for development programs across India.	Statistics or Development Studies graduates with research skills.	Apply with CV and a sample analysis via the link.	8 months	In-person	Monitoring & Evaluation (M&E)	India	Gujarat	Ahmedabad	f	2025-11-10	2025-10-25	24000.00	Per Month	INR	Impact Metrics	https://impactmetrics.org	Specializing in program evaluation and impact analysis.	Mr. Sanjay Patel	sanjay.patel@impactmetrics.org	2109876543	f	Active	2025-08-01 19:28:31.062968	2025-08-01 19:28:31.062968	\N
30	Media Advocacy Fellow	media-advocacy-fellow	Create media campaigns to raise awareness on social issues.	Journalism or Media Studies graduates with content creation skills.	Submit portfolio and application via the link.	6 months	Remote	Communications & Media	India	Karnataka	Bangalore	t	2025-09-10	2025-08-25	22000.00	Per Month	INR	Media for Change	https://mediaforchange.org	Using media to drive social and environmental change.	Ms. Neha Reddy	neha.reddy@mediaforchange.org	1098765432	t	Active	2025-08-01 19:28:31.063862	2025-08-01 19:28:31.063862	\N
31	Urban Planning Fellow	urban-planning-fellow	Develop strategies for sustainable urban development and infrastructure.	Urban Planning or Architecture graduates with design experience.	Apply with CV and a project proposal via the link.	9 months	In-person	Urban Development	India	Telangana	Hyderabad	f	2025-10-20	2025-10-05	26000.00	Per Month	INR	City Futures Initiative	https://cityfutures.org	Focused on sustainable urban growth and planning.	Mr. Arjun Rao	arjun.rao@cityfutures.org	0987654321	f	Active	2025-08-01 19:28:31.065642	2025-08-01 19:28:31.065642	\N
32	TESTfellow	testfellow-pune-mumbai	TESTfellow	TESTfellow	TESTfellow	4	Full-time	IT	India	Mumbai	Pune	t	\N	2026-12-10	56464446.00	Per Month	INR	INTERNSHIP	https://developmentwala.com/	TESTfellow	TESTfellow	sdfsdf@gmail.com	7061444969	t	Active	2026-04-06 19:49:13.578053	2026-04-06 19:57:28.299267	\N
\.


--
-- Data for Name: following_employers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.following_employers (id, user_id, employer_id, followed_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: grants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.grants (id, title, organization, type, sector, eligible, amount, deadline, link, rfp_url, description, tags, status, featured, created_at, updated_at, employer_id) FROM stdin;
b0f0ca76-a153-4daf-906b-5a7d800c2612	Climate Action Grant	Green Future Org	Grant	Environment / Climate Change	NGOs, Social Enterprises	₹15,00,000	2024-12-31	https://greenfuture.org/grants	\N	Supporting innovative projects addressing climate change and environmental sustainability. Open to NGOs and social enterprises.\\n\\nThis grant aims to empower organizations that are developing scalable solutions for reducing carbon emissions, promoting renewable energy, and enhancing community resilience to climate impacts. Applicants are encouraged to present detailed project plans, expected outcomes, and long-term sustainability strategies.\\n\\nSelected projects will receive funding, mentorship, and opportunities to showcase their work at international climate forums. Reporting and impact assessment are required at the end of the grant period.	climate, sustainability, environment	Published	t	2025-07-07 01:13:00.269089+05:30	2025-07-07 01:13:00.269089+05:30	\N
e85048b9-feb6-4fe1-8b64-996316016aa8	Global Health Research Fund	HealthGlobal Institute	Grant	Health	Individuals, Organizations	₹8,00,000	2025-01-15	https://healthglobal.org/fund	\N	Funding for researchers working on solutions to global health challenges and disease prevention. Open to individuals and organizations.\\n\\nThe fund supports innovative research in infectious diseases, vaccine development, and health systems strengthening. Priority will be given to projects with a clear path to implementation and measurable health outcomes.\\n\\nGrantees will have access to a global network of health professionals and may be invited to present findings at the annual HealthGlobal Summit. Progress reports are required every six months.	health, research, global	Published	f	2025-07-07 01:13:00.269089+05:30	2025-07-07 01:13:00.269089+05:30	\N
33b67ecd-376c-4ae5-9045-43f241e5c252	Women in STEM Scholarship	STEM4Her Foundation	Proposal	Gender Equality / Women Empowerment	Students, Early-career Professionals	₹2,00,000	2025-02-28	https://stem4her.org/scholarship	\N	Supporting women pursuing degrees in science, technology, engineering, and mathematics fields. Open to students and early-career professionals.\\n\\nThe scholarship covers tuition, research expenses, and participation in STEM conferences. Applicants should demonstrate academic excellence, leadership potential, and a commitment to advancing women in STEM.\\n\\nRecipients will join the STEM4Her alumni network and receive mentorship from leading women scientists and engineers. A final report on academic progress is required.	women, STEM, scholarship	Published	t	2025-07-07 01:13:00.269089+05:30	2025-07-07 01:13:00.269089+05:30	\N
124bcf58-4b17-4429-b035-80c6af5b284b	Community Development Grant	Local Impact Fund	Grant	Livelihoods / Skill Development	Grassroots Organizations	₹5,00,000	2025-05-10	https://localimpact.org/grants	\N	Grants for grassroots organizations working on community development, education, and health initiatives.\\n\\nProjects may include building schools, improving access to clean water, or launching health awareness campaigns. Preference will be given to organizations with strong community ties and a track record of successful project delivery.\\n\\nGrant recipients are expected to submit quarterly updates and a final impact report at the end of the funding period.	community, development, education	Published	f	2025-07-07 01:13:00.269089+05:30	2025-07-07 01:13:00.269089+05:30	\N
28598fe7-4ba1-4b4c-8386-cac6482da6ec	EWDIto	TEST	Proposal	Education	test	234234	4343-03-29	https://www.apple.com/in/store?afid=p240%7Cgo~cmp-11116556120~adg-179254536873~ad-758844117495_kwd-10778630~dev-c~ext-~prd-~mca-~nt-search&cid=aos-in-kwgo-brand--	\N	4343443	ASDASDA	Draft	f	2025-07-09 08:34:51.783294+05:30	2025-07-09 08:36:33.604127+05:30	cb1e08b4-c87e-4bcb-809d-e8b1e2a9b666
992f7997-cbcc-4b1e-8ef0-530ff61d2417	test1	TEST	Proposal	Education	test	234234	4343-03-30	https://www.apple.com/in/store?afid=p240%7Cgo~cmp-11116556120~adg-179254536873~ad-758844117495_kwd-10778630~dev-c~ext-~prd-~mca-~nt-search&cid=aos-in-kwgo-brand--	\N	4343443	ASDASDA	Draft	f	2025-07-09 06:50:54.918179+05:30	2025-07-09 08:36:40.602344+05:30	cb1e08b4-c87e-4bcb-809d-e8b1e2a9b666
6cf663b4-4763-4b32-9008-cc3d5fe75174	test-ppost	TEST	Proposal	Education	adasd	123123123	1111-11-11	https://www.apple.com/in/store?afid=p240%7Cgo~cmp-11116556120~adg-179254536873~ad-758844117495_kwd-10778630~dev-c~ext-~prd-~mca-~nt-search&cid=aos-in-kwgo-brand--	\N	asdasdas	asdasdas	Draft	f	2025-07-09 08:37:07.81487+05:30	2025-07-09 08:37:07.81487+05:30	cb1e08b4-c87e-4bcb-809d-e8b1e2a9b666
d26a9395-fdcd-42c7-b07c-b53ba061f030	TEst2	TEST	Proposal	Education	asdas	3423423	2025-07-12	https://www.apple.com/in/store?afid=p240%7Cgo~cmp-11116556120~adg-179254536873~ad-758844117495_kwd-10778630~dev-c~ext-~prd-~mca-~nt-search&cid=aos-in-kwgo-brand--	\N	adasdas	ASDASDA	Draft	f	2025-07-09 08:39:29.34087+05:30	2025-07-09 08:39:29.34087+05:30	cb1e08b4-c87e-4bcb-809d-e8b1e2a9b666
4a263747-98ef-4437-a654-4509a7aa5cbf	Test2	asdasd	Proposal	Environment / Climate Change	asdasda	4234234	2025-07-13	https://www.apple.com/in/store?afid=p240%7Cgo~cmp-11116556120~adg-179254536873~ad-758844117495_kwd-10778630~dev-c~ext-~prd-~mca-~nt-search&cid=aos-in-kwgo-brand--	\N	asdasd	asdasd	Draft	f	2025-07-09 08:42:02.207638+05:30	2025-07-09 08:42:02.207638+05:30	cb1e08b4-c87e-4bcb-809d-e8b1e2a9b666
759daa0e-07eb-44d2-ac57-442a3c453cb2	G-emp-edit12	asdfasfasdf	Proposal	Education	afasdfasdf	234524234	2025-07-09	https://www.apple.com/in/store?afid=p240%7Cgo~cmp-11116556120~adg-179254536873~ad-758844117495_kwd-10778630~dev-c~ext-~prd-~mca-~nt-search&cid=aos-in-kwgo-brand--	\N	asdfawdf	asdfasdf	Draft	f	2025-07-09 09:16:44.863679+05:30	2025-07-09 09:18:56.500174+05:30	de9ba50f-cb0c-44df-8306-ed2c06fb8df1
09234f5a-7649-4d0d-b25a-8245575298ba	Rural Health Initiative Grant	Health for All Foundation	Project Grant	Health	NGOs, Healthcare Startups	₹10,00,000	2025-08-15	https://healthforall.org/grants	\N	Funding to improve healthcare access in rural India through mobile clinics and training programs.	health, rural, healthcare	Active	t	2025-07-31 20:20:41.437+05:30	2025-07-31 20:20:41.437+05:30	\N
93f5fa05-aeb7-4e16-84e1-5071ea72a712	Women Empowerment Fund	Women’s Empowerment Network	Capacity Building Grant	Gender & Women Empowerment	NGOs, Women’s Groups	USD 50,000	2025-09-01	https://womempower.org/funds	\N	Support for programs enhancing women’s education and economic independence.	women, empowerment, education	Active	f	2025-07-31 20:20:41.507+05:30	2025-07-31 20:20:41.507+05:30	\N
c30c7354-2403-4e86-8ad5-d42771054961	Climate Action Seed Grant	Green Earth Collective	Innovation Grant	Environment & Climate Change	Environmental NGOs, Startups	₹7,50,000	2025-09-20	https://greenearth.org/grants	\N	Funding for innovative projects to combat climate change and promote sustainability.	climate, environment, innovation	Active	t	2025-07-31 20:20:41.508+05:30	2025-07-31 20:20:41.508+05:30	\N
651153fd-e3cb-488f-b177-462ae97cc413	Child Welfare Support Grant	ChildAid India	Program Grant	Child Rights & Protection	NGOs, Child Welfare Organizations	₹8,00,000	2025-08-25	https://childaid.org/grants	\N	Support for initiatives protecting children’s rights and providing education.	child, welfare, education	Active	f	2025-07-31 20:20:41.509+05:30	2025-07-31 20:20:41.509+05:30	\N
ac01cbc8-4b85-4bda-b53c-4328468f3090	Rural Development Innovation Fund	Rural Rise Initiative	Research Grant	Rural Development	Research Institutions, NGOs	₹6,00,000	2025-10-01	https://ruralrise.org/funds	\N	Funding for research on sustainable rural development solutions.	rural, development, research	Active	t	2025-07-31 20:20:41.511+05:30	2025-07-31 20:20:41.511+05:30	\N
fdc040e1-c3cf-4226-b16c-6b761cd39c16	Inclusive Education Grant	Inclusive Futures	Capacity Building Grant	Disability & Inclusion	Educational NGOs, Special Schools	USD 30,000	2025-09-10	https://inclusivefutures.org/grants	\N	Support for inclusive education programs for students with disabilities.	inclusion, education, disability	Active	f	2025-07-31 20:20:41.513+05:30	2025-07-31 20:20:41.513+05:30	\N
e87a3385-7a17-439b-a23f-db15ec84b0fa	Tech for Good Grant	Tech for Good	Innovation Grant	Technology for Development (ICT4D)	Tech Startups, NGOs	₹9,00,000	2025-08-30	https://techforgood.org/grants	\N	Funding for technology-driven solutions to social challenges.	tech, innovation, development	Active	t	2025-07-31 20:20:41.514+05:30	2025-07-31 20:20:41.514+05:30	\N
75c842f1-811d-4e0b-a597-326f233f9567	Urban Sustainability Fund	City Futures Initiative	Project Grant	Urban Development	Urban Planning NGOs, Municipalities	₹12,00,000	2025-10-15	https://cityfutures.org/funds	\N	Support for sustainable urban planning and infrastructure projects.	urban, sustainability, planning	Active	f	2025-07-31 20:20:41.515+05:30	2025-07-31 20:20:41.515+05:30	\N
f700a25a-c6bb-415f-ac2b-76bd821d75e5	Media for Change Grant	Media for Change	Capacity Building Grant	Communications & Media	Media NGOs, Journalists	USD 25,000	2025-09-05	https://mediaforchange.org/grants	\N	Funding to enhance media campaigns on social and environmental issues.	media, communication, social	Active	t	2025-07-31 20:20:41.515+05:30	2025-07-31 20:20:41.515+05:30	\N
6c82f251-5e19-4150-8598-227d126471b3	Disaster Relief Fund	Disaster Management Alliance	Emergency Grant	Disaster Management	NGOs, Relief Organizations	₹15,00,000	2025-08-20	https://disasteralliance.org/grants	\N	Support for immediate relief and recovery after natural disasters.	disaster, relief, emergency	Active	f	2025-07-31 20:20:41.516+05:30	2025-07-31 20:20:41.516+05:30	\N
fc7b4662-1566-4fd9-b697-6c76c0ab87e4	Youth Leadership Grant	Youth Empowerment Trust	Program Grant	Capacity Building & Training	Youth Organizations, NGOs	₹5,50,000	2025-09-25	https://youthempower.org/funds	\N	Funding to develop leadership and training programs for youth.	youth, leadership, training	Active	t	2025-07-31 20:20:41.517+05:30	2025-07-31 20:20:41.517+05:30	\N
027fd658-c2ec-40b3-b206-00f2fb372600	Water Sanitation Grant	WASH India	Project Grant	WASH (Water, Sanitation & Hygiene)	NGOs, Community Groups	USD 40,000	2025-10-10	https://washindia.org/grants	\N	Support for clean water and sanitation projects in underserved areas.	water, sanitation, hygiene	Active	f	2025-07-31 20:20:41.518+05:30	2025-07-31 20:20:41.518+05:30	\N
6e7ac1cc-d308-42cf-af0a-fdd3966cf8cb	Mental Health Awareness Fund	Mind Matters India	Research Grant	Mental Health & Wellbeing	Research Institutions, NGOs	₹7,00,000	2025-09-15	https://mindmatters.org/grants	\N	Funding for research and awareness programs on mental health.	mental health, awareness, research	Active	t	2025-07-31 20:20:41.519+05:30	2025-07-31 20:20:41.519+05:30	\N
2a0cdba3-0658-45be-bcc6-0c320f17ee77	Governance Innovation Grant	Governance Watch	Innovation Grant	Governance & Advocacy	NGOs, Policy Think Tanks	₹8,50,000	2025-10-05	https://governancewatch.org/funds	\N	Support for innovative governance and advocacy initiatives.	governance, advocacy, innovation	Active	f	2025-07-31 20:20:41.52+05:30	2025-07-31 20:20:41.52+05:30	\N
35195df9-9e51-42f3-b8b8-de32f332e4f6	Corporate Social Responsibility Fund	CSR India Alliance	Partnership Grant	Corporate Social Responsibility (CSR)	NGOs, Corporate Partners	USD 60,000	2025-09-30	https://csrindia.org/grants	\N	Funding for CSR projects focusing on community development.	csr, community, partnership	Active	t	2025-07-31 20:20:41.521+05:30	2025-07-31 20:20:41.521+05:30	\N
4295e110-4c9d-4269-b751-44128104a6b0	TEST	TEST	Proposal	Education	Start	65464646	2026-10-01	http://localhost:3000/	\N	TEST	education	Published	t	2026-04-04 04:10:50.339361+05:30	2026-04-04 04:10:50.339361+05:30	cb1e08b4-c87e-4bcb-809d-e8b1e2a9b666
a6f4abe9-daf2-4fad-9e11-decc5208f2c2	GRANTTT	GRANTTT	Proposal	Health	GRANTTT	65464646	2026-11-10	http://localhost:3000/	\N	GRANTTT	education	Published	t	2026-04-06 18:02:10.195237+05:30	2026-04-06 18:06:30.842346+05:30	cb1e08b4-c87e-4bcb-809d-e8b1e2a9b666
\.


--
-- Data for Name: internships; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.internships (id, title, slug, description, eligibility, application_process, duration, internship_type, field, country, state, city, remote, start_date, deadline, stipend, stipend_unit, currency, org_name, org_website, org_about, contact_name, contact_email, phone, featured, status, apply_link, created_at, updated_at, employer_id) FROM stdin;
1	TEST-intern	test-intern-asdfasdf-karnataka	asdfasdf	asdfasd	fasdfasd	34	Full-time	aasdfasdf	India	Karnataka	asdfasdf	t	2025-07-16	2025-07-18	4324234.00	Per Year	INR	ASDFASDF	asdf	fasd	asdfasdf	sdfa@gma.com	46354635345	t	Active		2025-07-16 20:44:32.968188	2025-07-16 20:44:32.968188	\N
22	Community Health Educator	community-health-educator	Join us to promote health awareness in rural areas, conducting workshops and health camps to educate communities on sanitation and disease prevention.	Undergraduate or postgraduate students in Public Health, Nursing, or related fields with good communication skills.	Submit your resume and a cover letter via the application link. Shortlisted candidates will be interviewed online.	2 months	In-person	Health	India	Uttar Pradesh	Lucknow	f	2025-09-01	2025-08-15	8000.00	Per Month	INR	Health for All Foundation	https://healthforall.org	A leading NGO dedicated to improving healthcare access across India.	Dr. Anil Sharma	anil.sharma@healthforall.org	9876543210	t	Active	https://ngohiring.com/apply/community-health-educator	2025-07-31 14:46:56.179	2025-07-31 14:46:56.179	\N
23	Rural Development Coordinator	rural-development-coordinator	Assist in implementing sustainable farming techniques and community development projects in remote villages.	Students in Agriculture, Rural Development, or Social Work with an interest in rural upliftment.	Apply online with your CV and a statement of purpose. Interviews will be conducted via Zoom.	3 months	Hybrid	Rural Development	India	Rajasthan	Jaipur	t	2025-10-01	2025-09-15	6000.00	Per Month	INR	Rural Rise Initiative	https://ruralrise.org	Focused on uplifting rural economies through sustainable practices.	Ms. Priya Mehta	priya.mehta@ruralrise.org	8765432109	f	Active	https://ngohiring.com/apply/rural-development-coordinator	2025-07-31 14:46:56.182	2025-07-31 14:46:56.182	\N
24	Gender Equality Advocate	gender-equality-advocate	Work on campaigns to empower women and promote gender equality in urban and rural settings.	Students in Gender Studies, Sociology, or Law with a passion for advocacy.	Send your resume and a 500-word essay on gender equality to the application link.	2.5 months	Remote	Gender & Women Empowerment	India	Maharashtra	Mumbai	t	2025-09-15	2025-08-31	7000.00	Per Month	INR	Women's Empowerment Network	https://womempower.org	Promoting gender equality and women's rights across India.	Ms. Sunita Desai	sunita.desai@womempower.org	7654321098	t	Active	https://ngohiring.com/apply/gender-equality-advocate	2025-07-31 14:46:56.184	2025-07-31 14:46:56.184	\N
25	Child Protection Officer	child-protection-officer	Support programs to safeguard children's rights and provide counseling in underserved areas.	Students in Social Work, Psychology, or Child Development with empathy and patience.	Submit your application form and references via the link. Interviews will follow.	2 months	In-person	Child Rights & Protection	India	Tamil Nadu	Chennai	f	2025-10-10	2025-09-25	7500.00	Per Month	INR	ChildAid India	https://childaid.org	Dedicated to protecting and promoting children's rights.	Mr. Ravi Kumar	ravi.kumar@childaid.org	6543210987	f	Active	https://ngohiring.com/apply/child-protection-officer	2025-07-31 14:46:56.185	2025-07-31 14:46:56.185	\N
26	Environmental Campaigner	environmental-campaigner	Engage in tree plantation drives and awareness campaigns on climate change.	Students in Environmental Science or related fields with an interest in conservation.	Apply with your resume and a short video pitch via the application link.	3 months	In-person	Environment & Climate Change	India	Kerala	Kochi	f	2025-11-01	2025-10-15	6500.00	Per Month	INR	Green Earth Collective	https://greenearth.org	Working towards a sustainable and green future.	Ms. Lakshmi Nair	lakshmi.nair@greenearth.org	5432109876	t	Active	https://ngohiring.com/apply/environmental-campaigner	2025-07-31 14:46:56.187	2025-07-31 14:46:56.187	\N
27	Disability Inclusion Assistant	disability-inclusion-assistant	Assist in creating inclusive programs for people with disabilities in urban centers.	Students in Special Education or Social Work with knowledge of accessibility issues.	Submit your CV and a case study on inclusion via the application link.	2 months	Hybrid	Disability & Inclusion	India	Delhi	New Delhi	t	2025-09-20	2025-09-05	7000.00	Per Month	INR	Inclusive Futures	https://inclusivefutures.org	Advocating for disability inclusion and accessibility.	Mr. Vikram Singh	vikram.singh@inclusivefutures.org	4321098765	f	Active	https://ngohiring.com/apply/disability-inclusion-assistant	2025-07-31 14:46:56.189	2025-07-31 14:46:56.189	\N
28	Fundraising Assistant	fundraising-assistant	Help organize fundraising events and draft grant proposals for community projects.	Students in Marketing, Business, or Nonprofit Management with creative skills.	Send your portfolio and application via the link. Interview to follow.	2.5 months	Remote	Fundraising & Partnerships	India	West Bengal	Kolkata	t	2025-10-15	2025-09-30	8000.00	Per Month	INR	Fundraise India	https://fundraiseindia.org	Supporting NGOs with innovative fundraising solutions.	Ms. Anjali Roy	anjali.roy@fundraiseindia.org	3210987654	t	Active	https://ngohiring.com/apply/fundraising-assistant	2025-07-31 14:46:56.191	2025-07-31 14:46:56.191	\N
29	Monitoring & Evaluation Intern	monitoring-evaluation-intern	Support data collection and impact assessment for ongoing development projects.	Students in Statistics, Development Studies, or Data Analysis.	Apply with your resume and a sample report via the application link.	3 months	In-person	Monitoring & Evaluation (M&E)	India	Gujarat	Ahmedabad	f	2025-11-10	2025-10-25	7500.00	Per Month	INR	Impact Metrics	https://impactmetrics.org	Specializing in program evaluation and impact analysis.	Mr. Sanjay Patel	sanjay.patel@impactmetrics.org	2109876543	f	Active	https://ngohiring.com/apply/monitoring-evaluation-intern	2025-07-31 14:46:56.192	2025-07-31 14:46:56.192	\N
30	Communications Intern	communications-intern	Assist in creating social media content and press releases for awareness campaigns.	Students in Journalism, Media Studies, or Digital Marketing.	Submit your portfolio and application via the link. Interview required.	2 months	Remote	Communications & Media	India	Karnataka	Bangalore	t	2025-09-10	2025-08-25	7000.00	Per Month	INR	Media for Change	https://mediaforchange.org	Using media to drive social and environmental change.	Ms. Neha Reddy	neha.reddy@mediaforchange.org	1098765432	t	Active	https://ngohiring.com/apply/communications-intern	2025-07-31 14:46:56.193	2025-07-31 14:46:56.193	\N
31	Urban Development Assistant	urban-development-assistant	Work on urban planning projects to improve infrastructure and living conditions in cities.	Students in Urban Planning, Architecture, or Civil Engineering.	Apply with your CV and a project proposal via the application link.	3 months	In-person	Urban Development	India	Telangana	Hyderabad	f	2025-10-20	2025-10-05	8500.00	Per Month	INR	City Futures Initiative	https://cityfutures.org	Focused on sustainable urban growth and planning.	Mr. Arjun Rao	arjun.rao@cityfutures.org	0987654321	f	Active	https://ngohiring.com/apply/urban-development-assistant	2025-07-31 14:46:56.195	2025-07-31 14:46:56.195	\N
32	TESTintern	testintern-pune-mumbai	skdafhkjsadhfjk	kjhekjfhskjhdfkjh	kjhqkjfhkdjshfkjh	4	Full-time	lksadfhksdhf	India	Mumbai	Pune	f	2026-10-11	2026-11-11	56464446.00	Per Month	INR	sdkjvnksjdznv	sdknksdnfk	dsfsdf	sdfsdfsd	sdfsdf@gmail.com	7061444969	t	Active	lk;zv	2026-04-03 18:44:49.227448	2026-04-03 18:44:49.227448	\N
33	ddsfgsdfgsd	ddsfgsdfgsd-pune-mumbai	fgsdfgsdf	gsdf	gsdfgsd	fgdsfg	Full-time	fg	India	Mumbai	Pune	t	2222-02-22	2222-02-22	53737.00	Per Month	INR	asdasd	asd	asdasd	sdfsdfsd	sdfsdf@gmail.com	7061444969	t	Active	http://localhost:3000/	2026-04-03 18:46:17.407629	2026-04-03 18:46:17.407629	\N
34	INternship	internship-pune-mumbai	INTERNSHIP	INTERNSHIP	INTERNSHIP	4	Full-time	IT	India	Mumbai	Pune	t	2026-11-09	2026-12-09	56464446.00	Per Month	INR	INTERNSHIP	https://developmentwala.com/	INTERNSHIP	INTERNSHIP	sdfsdf@gmail.com	7061444969	t	Closed	https://developmentwala.com/	2026-04-06 16:31:10.312229	2026-04-06 16:31:10.312229	\N
\.


--
-- Data for Name: job_alerts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.job_alerts (id, user_id, title, keywords, location, job_type, experience_level, salary_min, salary_max, frequency, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.jobs (id, title, slug, description, qualifications, role_category, employment_type, experience_min, salary_currency, salary_value, salary_unit_text, date_posted, valid_through, is_active, created_at, updated_at, how_to_apply, organization, organization_type, location_id, country, state, city, pin_code, street_address, applylink, employer_id, user_id, featured, education_required, organization_logo) FROM stdin;
04d7015e-d00a-43a9-85e0-ea52be9e03c9	Legal Counsel – Human Rights	legal-counsel-human-rights	Represent marginalized communities in cases related to human rights violations.	LLB or LLM with litigation experience	Human Rights	Full-time	5	INR	800000.00	YEAR	2025-07-26	2025-09-01 00:00:00+05:30	t	2025-07-31 19:54:28.513+05:30	2025-07-31 19:54:28.513+05:30	Apply at legal@justiceforall.org	Justice For All	Legal aid nonprofit	\N	India	Delhi	New Delhi	110001	Connaught Place	https://example.org/jobs/legal-counsel-human-rights	\N	\N	f	\N	\N
d48fd3eb-04d7-49df-adb9-317a72bd54df	Program Manager – Human Rights Education	program-manager-human-rights-education	Design and lead human rights education programs in schools and colleges.	Master’s in Human Rights/Education	Human Rights	Full-time	4	INR	750000.00	YEAR	2025-07-25	2025-08-25 00:00:00+05:30	t	2025-07-31 19:54:28.516+05:30	2025-07-31 19:54:28.516+05:30	Email resume and samples to hr@awareindia.org	Aware India	Education and awareness NGO	\N	India	West Bengal	Kolkata	700001	Park Street	https://example.org/jobs/program-manager-human-rights-education	\N	\N	f	\N	\N
832cf90a-45d2-44d4-80b4-1d77c53be6a0	Campaign Officer – Human Rights	campaign-officer-human-rights	Run digital and on-ground advocacy campaigns on civil liberties.	Any graduate with experience in campaigns or advocacy	Human Rights	Full-time	2	INR	480000.00	YEAR	2025-07-24	2025-08-20 00:00:00+05:30	t	2025-07-31 19:54:28.517+05:30	2025-07-31 19:54:28.517+05:30	Send cover letter to media@libertyvoice.in	Liberty Voice Foundation	Rights-based media nonprofit	\N	India	Maharashtra	Mumbai	400001	Churchgate	https://example.org/jobs/campaign-officer-human-rights	\N	\N	f	\N	\N
0309ec53-021c-44fe-923a-c82ed3759de5	Counselor – School Mental Health Program	counselor-school-mental-health	Provide individual and group counseling to school children and train teachers in basic mental health support.	MA in Psychology or MSW with counseling experience	Mental Health & Wellbeing	Full-time	2	INR	400000.00	YEAR	2025-07-27	2025-08-27 00:00:00+05:30	t	2025-07-31 19:54:28.519+05:30	2025-07-31 19:54:28.519+05:30	Email your CV to mentalhealth@mindmatters.org	Mind Matters Foundation	Mental health nonprofit focused on schools	\N	India	Karnataka	Bangalore	560029	Indiranagar	https://example.org/jobs/counselor-school-mental-health	\N	\N	f	\N	\N
ef0eb15e-4260-4ef8-876d-fd3e160cb2df	Community Mental Health Facilitator	community-mental-health-facilitator	Conduct awareness sessions and support group therapy in rural blocks.	Bachelor’s in Social Work/Psychology or related field	Mental Health & Wellbeing	Contractual	1	INR	25000.00	MONTH	2025-07-25	2025-08-30 00:00:00+05:30	t	2025-07-31 19:54:28.521+05:30	2025-07-31 19:54:28.521+05:30	Send CV to mhcare@reachout.org	ReachOut Trust	Rural mental health initiative	\N	India	Bihar	Patna	800001	Fraser Road	https://example.org/jobs/community-mental-health-facilitator	\N	\N	f	\N	\N
0154c216-b5bd-40c8-8fee-aaf88dbc305e	Psychiatric Social Worker	psychiatric-social-worker	Support psychiatric rehabilitation of patients in a mental health facility.	MSW with specialization in Psychiatry	Mental Health & Wellbeing	Full-time	3	INR	500000.00	YEAR	2025-07-23	2025-09-01 00:00:00+05:30	t	2025-07-31 19:54:28.523+05:30	2025-07-31 19:54:28.523+05:30	Apply at careers@healingminds.in	Healing Minds Centre	Clinical mental health NGO	\N	India	Tamil Nadu	Chennai	600006	Kilpauk	https://example.org/jobs/psychiatric-social-worker	\N	\N	f	\N	\N
c4473b00-d213-47f0-a165-e80507456cc5	Mental Health Helpline Executive	mental-health-helpline-executive	Respond to distress calls and provide basic counseling support and referrals.	Graduation with basic counseling training	Mental Health & Wellbeing	Shift-based	1	INR	22000.00	MONTH	2025-07-21	2025-08-25 00:00:00+05:30	t	2025-07-31 19:54:28.524+05:30	2025-07-31 19:54:28.524+05:30	Submit your profile to helpline@youarenotalone.org	You Are Not Alone	National mental health helpline	\N	India	Delhi	New Delhi	110049	Green Park	https://example.org/jobs/mental-health-helpline-executive	\N	\N	f	\N	\N
925665c2-fe57-4a3f-98db-0c2b99bf5be0	Disaster Response Coordinator	disaster-response-coordinator	Coordinate emergency response efforts during natural disasters across high-risk districts.	Master's in Disaster Management, Social Work, or relevant field	Disaster Management	Full-time	4	INR	750000.00	YEAR	2025-07-27	2025-08-31 00:00:00+05:30	t	2025-07-31 19:54:28.526+05:30	2025-07-31 19:54:28.526+05:30	Send resume to disaster@rapidrelief.in	Rapid Relief Network	National disaster response NGO	\N	India	Assam	Guwahati	781001	Rehabari	https://example.org/jobs/disaster-response-coordinator	\N	\N	f	\N	\N
65a1537d-efaa-4e05-a5bf-98e1d6aff4ee	Emergency Logistics Officer	emergency-logistics-officer	Ensure smooth transportation and supply chain of relief materials during emergencies.	Diploma or degree in Supply Chain/Logistics or Management	Disaster Management	Full-time	2	INR	420000.00	YEAR	2025-07-26	2025-08-28 00:00:00+05:30	t	2025-07-31 19:54:28.529+05:30	2025-07-31 19:54:28.529+05:30	Apply via logistics@relieflink.org	ReliefLink India	Emergency response logistics NGO	\N	India	Uttarakhand	Dehradun	248001	Rajpur Road	https://example.org/jobs/emergency-logistics-officer	\N	\N	f	\N	\N
1ba37873-3396-47ab-92b7-e79ed8069b4b	Disaster Risk Reduction (DRR) Officer	drr-officer	Lead community-level disaster preparedness and mitigation training activities.	Master’s in DRR, Social Work or Environmental Science	Disaster Management	Full-time	3	INR	600000.00	YEAR	2025-07-25	2025-09-01 00:00:00+05:30	t	2025-07-31 19:54:28.531+05:30	2025-07-31 19:54:28.531+05:30	Send your CV and cover letter to drrofficer@safeindia.org	Safe India Foundation	Preparedness and resilience-focused nonprofit	\N	India	Andhra Pradesh	Visakhapatnam	530001	Dabagardens	https://example.org/jobs/drr-officer	\N	\N	f	\N	\N
831a0c3a-fefb-443b-a5d8-9b58fa6d1317	Community First Responder Trainer	community-first-responder-trainer	Train youth and SHG members to act as first responders in emergencies and disaster situations.	Diploma in First Aid/Paramedical/Community Development	Disaster Management	Part-time	2	INR	20000.00	MONTH	2025-07-24	2025-08-30 00:00:00+05:30	t	2025-07-31 19:54:28.534+05:30	2025-07-31 19:54:28.534+05:30	Apply at firstaid@redshield.org	Red Shield Volunteers	Volunteer-based disaster training group	\N	India	West Bengal	Siliguri	734001	Sevoke Road	https://example.org/jobs/community-first-responder-trainer	\N	\N	f	\N	\N
5359fa4b-7c09-4de4-8b2d-43d5130264b2	Policy Advocacy Manager	policy-advocacy-manager	Lead advocacy campaigns with state and national governments to influence policy in education and health.	Master's in Public Policy, Law, or Political Science	Governance & Advocacy	Full-time	5	INR	850000.00	YEAR	2025-07-27	2025-08-30 00:00:00+05:30	t	2025-07-31 19:54:28.536+05:30	2025-07-31 19:54:28.536+05:30	Apply with CV and writing samples to policy@impactvoice.org	Impact Voice Foundation	Policy advocacy NGO	\N	India	Delhi	New Delhi	110002	Bahadur Shah Zafar Marg	https://example.org/jobs/policy-advocacy-manager	\N	\N	f	\N	\N
bfb64255-852d-4bda-bfd0-5759ee5f817c	Democratic Governance Coordinator	democratic-governance-coordinator	Facilitate citizen participation in local governance through RTI, ward meetings, and social audits.	MSW or related development degree	Governance & Advocacy	Full-time	3	INR	550000.00	YEAR	2025-07-26	2025-08-25 00:00:00+05:30	t	2025-07-31 19:54:28.537+05:30	2025-07-31 19:54:28.537+05:30	Submit resume to governance@prajanet.in	Praja Network	Local governance-focused NGO	\N	India	Maharashtra	Pune	411001	Shivajinagar	https://example.org/jobs/democratic-governance-coordinator	\N	\N	f	\N	\N
7096dad3-84c0-4433-98eb-e50c965e7bb2	Program Coordinator – Education Initiatives	program-coordinator-education-initiatives	We are seeking a motivated and experienced Program Coordinator to manage and implement our community-based education programs across rural districts of Uttar Pradesh.	Bachelor's or Master’s in Education/Social Work	Education	Full-time	2	INR	480000.00	YEAR	2025-07-27	2025-08-15 00:00:00+05:30	t	2025-07-31 19:54:28.43+05:30	2025-07-31 19:54:28.43+05:30	Please send your updated CV and a short cover letter to careers@example.org with the subject line “Program Coordinator – Education”.	EduReach Foundation	EduReach Foundation is a non-profit working to bridge the education gap in rural India through innovative learning programs and teacher support.	\N	India	Uttar Pradesh	Lucknow	226010	56 A, Gomti Nagar Extension	https://example.org/jobs/program-coordinator-education-initiatives	\N	\N	f	\N	\N
764c951d-3375-42e5-b6b6-90f5a4a8d5f6	Learning Facilitator – Bridge Schools	learning-facilitator-bridge-schools	Facilitate learning sessions for out-of-school children in low-income communities using activity-based methods.	Graduation in any stream, preferably B.Ed	Education	Part-time	1	INR	15000.00	MONTH	2025-07-25	2025-08-20 00:00:00+05:30	t	2025-07-31 19:54:28.433+05:30	2025-07-31 19:54:28.433+05:30	Apply online at our portal or email resume to hr@bridgeschools.org	Bridge Schools Network	A grassroots education NGO working across slum clusters in Delhi NCR.	\N	India	Delhi	New Delhi	110008	B-45, Patel Nagar	https://example.org/jobs/learning-facilitator-bridge-schools	\N	\N	f	\N	\N
ae8e6001-b861-4c17-a2f3-ef4ff890dc11	Curriculum Designer – Foundational Literacy	curriculum-designer-foundational-literacy	Design foundational literacy curriculum for early-grade learners under our national mission.	M.Ed or equivalent in curriculum design	Education	Contractual	3	INR	900000.00	YEAR	2025-07-26	2025-08-30 00:00:00+05:30	t	2025-07-31 19:54:28.436+05:30	2025-07-31 19:54:28.436+05:30	Share your portfolio and CV to curriculum@learninglabs.org	Learning Labs India	An EdTech nonprofit focused on literacy and numeracy tools for underserved schools.	\N	India	Karnataka	Bengaluru	560037	Plot 12, Whitefield	https://example.org/jobs/curriculum-designer-foundational-literacy	\N	\N	f	\N	\N
663a8b74-05e8-49f1-bbc6-8b7a4252e54e	Education Fellow – Tribal Schools	education-fellow-tribal-schools	Join our 1-year fellowship to support tribal school teachers and design contextual learning modules in Jharkhand.	Graduate with interest in rural education	Education	Fellowship	0	INR	20000.00	MONTH	2025-07-20	2025-08-10 00:00:00+05:30	t	2025-07-31 19:54:28.438+05:30	2025-07-31 19:54:28.438+05:30	Apply at www.tribaledfellowship.org/apply	TribalEd Initiative	TribalEd works to improve education outcomes for indigenous children through fellowships and research.	\N	India	Jharkhand	Ranchi	834002	Block 3, Ashok Nagar	https://example.org/jobs/education-fellow-tribal-schools	\N	\N	f	\N	\N
b4f91e74-b080-4131-bb6c-0e65cf954055	Project Officer – Maternal Health	project-officer-maternal-health	Responsible for implementing maternal health interventions across block-level PHCs.	Master's in Public Health / Nursing	Health	Full-time	2	INR	500000.00	YEAR	2025-07-27	2025-08-20 00:00:00+05:30	t	2025-07-31 19:54:28.44+05:30	2025-07-31 19:54:28.44+05:30	Email your application to jobs@healthaccess.org	Health Access Foundation	A public health NGO supporting reproductive health and rights in underserved areas.	\N	India	Madhya Pradesh	Bhopal	462001	124, Arera Colony	https://example.org/jobs/project-officer-maternal-health	\N	\N	f	\N	\N
2502a0ad-3d13-4dc1-add8-00b4db13aba4	Field Nurse – Community Clinics	field-nurse-community-clinics	Deliver primary health care services at mobile clinics across 3 villages in Assam.	Diploma in Nursing (GNM/ANM)	Health	Contractual	1	INR	18000.00	MONTH	2025-07-24	2025-08-14 00:00:00+05:30	t	2025-07-31 19:54:28.443+05:30	2025-07-31 19:54:28.443+05:30	Apply on our site: communityhealth.ngo/careers	Community Health on Wheels	Mobile primary healthcare services for remote tribal regions.	\N	India	Assam	Tezpur	784001	Health Base Camp, Sonitpur	https://example.org/jobs/field-nurse-community-clinics	\N	\N	f	\N	\N
9c0e00d0-edea-403b-87c5-e9382e1f0b07	Mental Health Counsellor – Urban Slums	mental-health-counsellor-urban-slums	Provide counselling services to adolescents and women in high-stress urban neighborhoods.	MA Psychology / MSW	Health	Part-time	1	INR	25000.00	MONTH	2025-07-23	2025-08-18 00:00:00+05:30	t	2025-07-31 19:54:28.445+05:30	2025-07-31 19:54:28.445+05:30	Send resume to urbanmindcare@example.org	Urban MindCare Trust	NGO providing accessible mental health and trauma services in cities.	\N	India	Maharashtra	Mumbai	400017	205, Dharavi Lane 3	https://example.org/jobs/mental-health-counsellor-urban-slums	\N	\N	f	\N	\N
dd27045d-02f3-47a5-a778-7050f13d9fcf	Health Systems Research Associate	health-systems-research-associate	Support research and analysis on health system strengthening across rural states.	MPH/PhD in Public Health or related field	Health	Consultant / Freelance	3	INR	1200000.00	YEAR	2025-07-26	2025-08-22 00:00:00+05:30	t	2025-07-31 19:54:28.446+05:30	2025-07-31 19:54:28.446+05:30	Submit CV and writing samples to research@nhpi.org	National Health Policy Institute	Independent health research institution supporting policy design and implementation.	\N	India	Delhi	New Delhi	110001	A-2, Chanakyapuri	https://example.org/jobs/health-systems-research-associate	\N	\N	f	\N	\N
0b283f83-ade1-49a3-b747-f60b9b247ebf	Livelihood Officer – Rural SHG Support	livelihood-officer-rural-shg-support	Coordinate and support Self-Help Groups (SHGs) for income-generating activities in rural Bihar.	MSW / MBA in Rural Development	Livelihoods	Full-time	2	INR	420000.00	YEAR	2025-07-27	2025-08-17 00:00:00+05:30	t	2025-07-31 19:54:28.449+05:30	2025-07-31 19:54:28.449+05:30	Email your CV to livelihoods@gramvikas.org	Gram Vikas Kendra	Non-profit focused on promoting women-led SHGs and rural enterprise in East India.	\N	India	Bihar	Patna	800001	27, Boring Road	https://example.org/jobs/livelihood-officer-rural-shg-support	\N	\N	f	\N	\N
48badd3f-8ff0-497c-af96-393f62776072	Enterprise Development Specialist	enterprise-development-specialist	Mentor rural entrepreneurs and help scale up micro-enterprises in the handloom and food processing sectors.	MBA / PGDM with focus on Entrepreneurship	Livelihoods	Consultant / Freelance	3	INR	750000.00	YEAR	2025-07-25	2025-08-20 00:00:00+05:30	t	2025-07-31 19:54:28.452+05:30	2025-07-31 19:54:28.452+05:30	Apply at jobs@udaanfoundation.org	Udaan Foundation	Supports livelihood innovations and skill training in tribal and backward areas.	\N	India	Chhattisgarh	Raipur	492001	Plot 9, Civil Lines	https://example.org/jobs/enterprise-development-specialist	\N	\N	f	\N	\N
c1b88e35-0758-42d1-8457-5101b492a8ce	Skill Trainer – Tailoring & Crafts	skill-trainer-tailoring-crafts	Train adolescent girls in tailoring and local crafts to promote economic independence.	Diploma in Tailoring or Artisan Training	Livelihoods	Part-time	1	INR	18000.00	MONTH	2025-07-22	2025-08-12 00:00:00+05:30	t	2025-07-31 19:54:28.454+05:30	2025-07-31 19:54:28.454+05:30	Walk-in interviews every Friday or apply at careers@sewajyoti.in	Sewa Jyoti Trust	Women empowerment NGO with skill development centers across Rajasthan.	\N	India	Rajasthan	Jaipur	302003	Block 2, Malviya Nagar	https://example.org/jobs/skill-trainer-tailoring-crafts	\N	\N	f	\N	\N
0dbf1975-01fa-4c1b-8077-9aaed4d8936f	FPO Field Coordinator – Farmer Support	fpo-field-coordinator-farmer-support	Work with Farmer Producer Organizations to enhance productivity and market access.	B.Sc Agriculture or MSW with rural field experience	Livelihoods	Contractual	2	INR	30000.00	MONTH	2025-07-20	2025-08-10 00:00:00+05:30	t	2025-07-31 19:54:28.457+05:30	2025-07-31 19:54:28.457+05:30	Email resume to agritech@greenroots.org	GreenRoots Collective	Supports farmers and FPOs with technical and market interventions.	\N	India	Maharashtra	Nagpur	440015	Yavatmal Road, Plot 6	https://example.org/jobs/fpo-field-coordinator-farmer-support	\N	\N	f	\N	\N
63536b5f-2224-417a-ae70-383df446b411	Program Manager – Women’s Leadership	program-manager-womens-leadership	Lead women’s political participation and grassroots leadership programs across 3 districts.	MSW / Gender Studies	Gender & Women Empowerment	Full-time	5	INR	900000.00	YEAR	2025-07-26	2025-08-21 00:00:00+05:30	t	2025-07-31 19:54:28.458+05:30	2025-07-31 19:54:28.458+05:30	Submit your resume to womenlead@udayfoundation.org	Uday Foundation	Working to empower women leaders through rights-based and advocacy programs.	\N	India	Odisha	Bhubaneswar	751003	Kalinga Marg, Block B	https://example.org/jobs/program-manager-womens-leadership	\N	\N	f	\N	\N
5c803224-1512-40ff-ac24-e69392a41bf9	Gender Trainer – Community Workshops	gender-trainer-community-workshops	Facilitate workshops with rural men and women on gender equality, rights, and agency.	Experience in community facilitation or MSW	Gender & Women Empowerment	Consultant / Freelance	3	INR	45000.00	MONTH	2025-07-25	2025-08-18 00:00:00+05:30	t	2025-07-31 19:54:28.461+05:30	2025-07-31 19:54:28.461+05:30	Send expression of interest to genderunit@janchetna.org	Jan Chetna Collective	Grassroots gender and justice organization in Central India.	\N	India	Madhya Pradesh	Jabalpur	482002	3rd Floor, Samta Complex	https://example.org/jobs/gender-trainer-community-workshops	\N	\N	f	\N	\N
168e52c7-b5fd-4896-bbf6-32c003ccd601	Helpline Counsellor – Gender-Based Violence	helpline-counsellor-gbv	Provide telephonic counselling and legal aid referrals for GBV survivors.	MA Psychology / MSW with GBV experience	Gender & Women Empowerment	Part-time	2	INR	22000.00	MONTH	2025-07-23	2025-08-13 00:00:00+05:30	t	2025-07-31 19:54:28.463+05:30	2025-07-31 19:54:28.463+05:30	Apply at womenhelpline.in/apply	Sakhi Suraksha Helpline	Emergency helpline and support service for women in crisis.	\N	India	Kerala	Kochi	682025	MG Road, Tower A	https://example.org/jobs/helpline-counsellor-gbv	\N	\N	f	\N	\N
fc0a1333-b5de-470d-8af2-8c0abe5443e9	Intern – Women in Tech Program	intern-women-in-tech	Support curriculum delivery and mentorship programs for girls pursuing careers in technology.	Bachelor’s student in any stream	Gender & Women Empowerment	Internship	0	INR	8000.00	MONTH	2025-07-22	2025-08-10 00:00:00+05:30	t	2025-07-31 19:54:28.465+05:30	2025-07-31 19:54:28.465+05:30	Send resume to careers@techshakti.org	Tech Shakti Network	Pan-India initiative to close the gender gap in STEM fields.	\N	India	Telangana	Hyderabad	500033	Plot 5, HITEC City	https://example.org/jobs/intern-women-in-tech	\N	\N	f	\N	\N
38bc1b3a-4fe8-4190-9042-8792ebec4790	Inclusive Education Facilitator	inclusive-education-facilitator	Facilitate learning and classroom support for children with disabilities in mainstream schools.	B.Ed in Special Education or Diploma in Inclusive Education	Disability & Inclusion	Full-time	2	INR	360000.00	YEAR	2025-07-27	2025-08-20 00:00:00+05:30	t	2025-07-31 19:54:28.468+05:30	2025-07-31 19:54:28.468+05:30	Email resume to inclusion@navchetna.org	Navchetna Trust	Promotes inclusive education and community-based rehabilitation.	\N	India	Delhi	New Delhi	110092	Laxmi Nagar, Block D	https://example.org/jobs/inclusive-education-facilitator	\N	\N	f	\N	\N
5e197525-ae07-486f-abd3-ffbba8f68095	Sign Language Interpreter – Outreach Events	sign-language-interpreter-outreach	Interpret during events and community sessions for the hearing-impaired.	ISL Certification or Experience in Indian Sign Language	Disability & Inclusion	Contractual	1	INR	25000.00	MONTH	2025-07-25	2025-08-15 00:00:00+05:30	t	2025-07-31 19:54:28.47+05:30	2025-07-31 19:54:28.47+05:30	Apply with your credentials at outreach@accessibleworld.org	Accessible World Foundation	Organization advocating for accessibility and inclusion.	\N	India	Tamil Nadu	Chennai	600006	Dr. Radhakrishnan Salai	https://example.org/jobs/sign-language-interpreter-outreach	\N	\N	f	\N	\N
0af4532c-52ec-4554-a806-43f022f52076	Disability Rights Advocate – Legal & Policy	disability-rights-advocate-legal-policy	Engage in legal advocacy and strategic litigation related to rights of persons with disabilities.	LLB / LLM with disability rights experience	Disability & Inclusion	Full-time	3	INR	600000.00	YEAR	2025-07-24	2025-08-18 00:00:00+05:30	t	2025-07-31 19:54:28.472+05:30	2025-07-31 19:54:28.472+05:30	Apply via www.rightsforall.in/jobs	Rights for All	Legal advocacy NGO for marginalized communities and persons with disabilities.	\N	India	Karnataka	Bangalore	560001	MG Road, Sector 1	https://example.org/jobs/disability-rights-advocate-legal-policy	\N	\N	f	\N	\N
5dbae04a-9df3-4742-b19f-800d3a6723f5	Accessibility Auditor – Public Spaces	accessibility-auditor-public-spaces	Conduct accessibility audits of public infrastructure, schools, and health centers.	Bachelor’s in Architecture/Civil or Accessibility Certification	Disability & Inclusion	Consultant / Freelance	2	INR	50000.00	MONTH	2025-07-22	2025-08-12 00:00:00+05:30	t	2025-07-31 19:54:28.475+05:30	2025-07-31 19:54:28.475+05:30	Send your portfolio to audit@inclusiveinfra.org	Inclusive Infrastructure India	Specializes in accessible design and infrastructure consulting.	\N	India	Punjab	Amritsar	143001	Golden Avenue, Block E	https://example.org/jobs/accessibility-auditor-public-spaces	\N	\N	f	\N	\N
00e6f30c-d054-4653-beae-729ee4db5d1c	Fundraising Executive – Individual Donors	fundraising-executive-individual-donors	Lead donor acquisition and relationship building with individuals and HNIs.	MBA / PG in Development Management or Marketing	Fundraising & Partnerships	Full-time	3	INR	720000.00	YEAR	2025-07-27	2025-08-25 00:00:00+05:30	t	2025-07-31 19:54:28.476+05:30	2025-07-31 19:54:28.476+05:30	Apply at peoplefirst@changeindia.org	Change India Trust	Working across India in health, education, and child protection programs.	\N	India	Maharashtra	Mumbai	400013	Fort Area, Sector 9	https://example.org/jobs/fundraising-executive-individual-donors	\N	\N	f	\N	\N
1ac510bf-355a-4a6a-8eb3-7d5f81974c0c	Partnerships Officer – CSR & Foundations	partnerships-officer-csr-foundations	Develop partnerships and prepare proposals for CSR and institutional funders.	PG in Social Work, Development, or Communication	Fundraising & Partnerships	Full-time	4	INR	850000.00	YEAR	2025-07-26	2025-08-20 00:00:00+05:30	t	2025-07-31 19:54:28.48+05:30	2025-07-31 19:54:28.48+05:30	Email your cover letter and resume to csr@samarpan.org	Samarpan Development Foundation	National NGO in livelihoods and adolescent development.	\N	India	Gujarat	Ahmedabad	380006	Paldi Road, Navrangpura	https://example.org/jobs/partnerships-officer-csr-foundations	\N	\N	f	\N	\N
76d28e39-671c-427f-95b9-ea0ccbd2aebc	Donor Engagement Intern	donor-engagement-intern	Assist the fundraising team with communications, data management, and event planning.	Currently pursuing graduation in any stream	Fundraising & Partnerships	Internship	0	INR	10000.00	MONTH	2025-07-24	2025-08-14 00:00:00+05:30	t	2025-07-31 19:54:28.481+05:30	2025-07-31 19:54:28.481+05:30	Submit form at www.supportcause.org/internship	Support Cause India	Crowdfunding platform for medical and social causes.	\N	India	West Bengal	Kolkata	700016	Park Street Area	https://example.org/jobs/donor-engagement-intern	\N	\N	f	\N	\N
ffbae152-bb57-4a34-bb32-2dbdbbff4db3	Strategic Fundraising Advisor	strategic-fundraising-advisor	Guide NGO partners in fundraising strategy, donor engagement, and resource mobilization.	Development Consultant with fundraising track record	Fundraising & Partnerships	Consultant / Freelance	7	INR	100000.00	MONTH	2025-07-23	2025-08-18 00:00:00+05:30	t	2025-07-31 19:54:28.483+05:30	2025-07-31 19:54:28.483+05:30	Email consulting@impacthub.org	Impact Hub Network	Social impact consultancy and accelerator for NGOs.	\N	India	Goa	Panaji	403001	Campal Industrial Estate	https://example.org/jobs/strategic-fundraising-advisor	\N	\N	f	\N	\N
e6702b07-6b03-4dda-bd3e-d3d369d3ce56	Digital Communications Officer	digital-communications-officer	Create, manage, and analyze digital content for campaigns and donor communication.	Bachelor’s in Mass Communication / PR / Journalism	Communications & Media	Full-time	2	INR	500000.00	YEAR	2025-07-27	2025-08-20 00:00:00+05:30	t	2025-07-31 19:54:28.486+05:30	2025-07-31 19:54:28.486+05:30	Apply via comms@voiceforchange.org	Voice for Change	Advocacy NGO focusing on youth participation and rights.	\N	India	Delhi	New Delhi	110003	Lodhi Road	https://example.org/jobs/digital-communications-officer	\N	\N	f	\N	\N
188638a2-8f71-4f73-ad34-a078086d085e	Media and Outreach Manager	media-outreach-manager	Develop media strategies and engage with print, digital and broadcast journalists.	PG in Communications or Development Studies	Communications & Media	Full-time	4	INR	750000.00	YEAR	2025-07-25	2025-08-15 00:00:00+05:30	t	2025-07-31 19:54:28.487+05:30	2025-07-31 19:54:28.487+05:30	Submit resume at media@awareindia.org	Aware India Foundation	Nonprofit focused on women’s empowerment and awareness campaigns.	\N	India	Madhya Pradesh	Bhopal	462001	MP Nagar Zone 2	https://example.org/jobs/media-outreach-manager	\N	\N	f	\N	\N
96f80295-ff6a-4444-b977-8f3e01777d27	Storytelling Fellow – Grassroots Impact	storytelling-fellow-grassroots-impact	Travel to field sites and document inspiring impact stories through blogs and video.	Photography, Writing, and Editing Skills	Communications & Media	Fellowship	1	INR	20000.00	MONTH	2025-07-24	2025-08-14 00:00:00+05:30	t	2025-07-31 19:54:28.489+05:30	2025-07-31 19:54:28.489+05:30	Apply at storytelling@groundchange.org	GroundChange Collective	Fellowship program promoting changemakers’ stories.	\N	India	Odisha	Bhubaneswar	751002	Kharavela Nagar	https://example.org/jobs/storytelling-fellow-grassroots-impact	\N	\N	f	\N	\N
378f2048-d99d-4f7b-a0c7-b85c2b0aa020	Content Strategist – Development Communications	content-strategist-development-comms	Develop content strategy for awareness, education, and campaign initiatives.	PG in Communications, Journalism or English	Communications & Media	Consultant / Freelance	5	INR	60000.00	MONTH	2025-07-23	2025-08-16 00:00:00+05:30	t	2025-07-31 19:54:28.491+05:30	2025-07-31 19:54:28.491+05:30	Email portfolio to content@devmedia.org	DevMedia Studio	Creative agency serving nonprofit and development sector clients.	\N	India	Kerala	Thiruvananthapuram	695014	Vellayambalam Road	https://example.org/jobs/content-strategist-development-comms	\N	\N	f	\N	\N
cd2ea0d2-0252-43b2-a8a8-24d6dc0a0b61	ICT4D Project Manager	ict4d-project-manager	Lead and implement ICT4D projects to improve rural service delivery.	Engineering/IT with development experience	Technology for Development (ICT4D)	Full-time	5	INR	900000.00	YEAR	2025-07-26	2025-08-25 00:00:00+05:30	t	2025-07-31 19:54:28.493+05:30	2025-07-31 19:54:28.493+05:30	Apply at techlead@smartearth.org	Smart Earth India	Tech-for-good nonprofit working with rural local bodies.	\N	India	Telangana	Hyderabad	500081	Gachibowli Road	https://example.org/jobs/ict4d-project-manager	\N	\N	f	\N	\N
c2939933-a362-4865-9434-8349c65f3b10	Rural Program Associate	rural-program-associate	Support implementation of integrated rural development programs in tribal regions.	Graduate in Rural Development or Social Work	Rural Development	Full-time	2	INR	400000.00	YEAR	2025-07-27	2025-08-25 00:00:00+05:30	t	2025-07-31 19:54:28.495+05:30	2025-07-31 19:54:28.495+05:30	Apply at hr@gramvikas.in	Gram Vikas	Nonprofit working with tribal and rural communities.	\N	India	Odisha	Ganjam	761001	Village Road	https://example.org/jobs/rural-program-associate	\N	\N	f	\N	\N
75f5eb15-2b14-4814-b6f3-f5030d584873	Livelihood Coordinator – Rural Women	livelihood-coordinator-rural-women	Coordinate skill training and microenterprise development for rural women.	PG Diploma in Rural Management	Rural Development	Full-time	3	INR	550000.00	YEAR	2025-07-27	2025-08-28 00:00:00+05:30	t	2025-07-31 19:54:28.498+05:30	2025-07-31 19:54:28.498+05:30	Send CV to livelihoods@sewafoundation.org	SEWA Foundation	Grassroots women’s cooperative network.	\N	India	Gujarat	Ahmedabad	380015	Maninagar	https://example.org/jobs/livelihood-coordinator-rural-women	\N	\N	f	\N	\N
c76a1c4b-1ec1-4fbe-bec1-6cb2dc90903c	Agriculture Extension Officer	agriculture-extension-officer	Promote sustainable farming practices among smallholder farmers.	BSc Agriculture or related field	Rural Development	Full-time	2	INR	420000.00	YEAR	2025-07-26	2025-08-30 00:00:00+05:30	t	2025-07-31 19:54:28.499+05:30	2025-07-31 19:54:28.499+05:30	Email your resume to jobs@agrireach.org	AgriReach	NGO promoting eco-friendly agriculture.	\N	India	Maharashtra	Wardha	442001	Wardha Road	https://example.org/jobs/agriculture-extension-officer	\N	\N	f	\N	\N
a65ce7e7-d6d6-45a1-844e-2a2f590b9bc0	Village Development Officer	village-development-officer	Act as a liaison between local panchayats and NGO for holistic rural development programs.	Graduate with rural fieldwork experience	Rural Development	Full-time	1	INR	300000.00	YEAR	2025-07-25	2025-08-29 00:00:00+05:30	t	2025-07-31 19:54:28.501+05:30	2025-07-31 19:54:28.501+05:30	Apply via rural@samuday.org	Samuday Vikas Trust	Grassroots NGO working in eastern India.	\N	India	Bihar	Muzaffarpur	842001	Main Block Road	https://example.org/jobs/village-development-officer	\N	\N	f	\N	\N
42567a4a-9da0-4989-aff6-9699229200e5	Urban Resilience Specialist	urban-resilience-specialist	Design and support urban resilience and climate action planning in slum areas.	Masters in Urban Planning/Environment	Urban Development	Full-time	5	INR	950000.00	YEAR	2025-07-27	2025-08-31 00:00:00+05:30	t	2025-07-31 19:54:28.503+05:30	2025-07-31 19:54:28.503+05:30	Submit application to urbanclimate@citycare.org	CityCare Foundation	Nonprofit supporting inclusive urban development.	\N	India	Karnataka	Bangalore	560070	Jayanagar 9th Block	https://example.org/jobs/urban-resilience-specialist	\N	\N	f	\N	\N
3f801c8b-b4ad-4ad3-bcb4-215df3e7ac53	WASH Program Officer	wash-program-officer	Implement water and sanitation projects in underserved communities.	Degree in Environmental Science / Civil Engineering	WASH (Water, Sanitation & Hygiene)	Full-time	2	INR	480000.00	YEAR	2025-07-27	2025-09-01 00:00:00+05:30	t	2025-07-31 19:54:28.505+05:30	2025-07-31 19:54:28.505+05:30	Email CV to wash@jaljeevan.org	Jal Jeevan Sansthan	NGO working on clean water access.	\N	India	Rajasthan	Jaipur	302017	Mansarovar	https://example.org/jobs/wash-program-officer	\N	\N	f	\N	\N
1184e6fc-e974-4828-92bd-9aea6cdf36e6	Hygiene Promotion Specialist	hygiene-promotion-specialist	Design and execute hygiene awareness campaigns in rural and urban slums.	Degree in Public Health, Social Work, or equivalent	WASH (Water, Sanitation & Hygiene)	Contractual	3	INR	30000.00	MONTH	2025-07-20	2025-08-30 00:00:00+05:30	t	2025-07-31 19:54:28.507+05:30	2025-07-31 19:54:28.507+05:30	Send portfolio to careers@cleanlife.org	CleanLife Foundation	WASH-focused nonprofit.	\N	India	Odisha	Bhubaneswar	751001	Master Canteen Road	https://example.org/jobs/hygiene-promotion-specialist	\N	\N	f	\N	\N
4b1f46d1-dda6-48d6-88ff-f779dc8228d4	WASH Project Engineer	wash-project-engineer	Lead engineering design and implementation of sanitation systems in tribal areas.	B.Tech in Civil/Environmental Engineering	WASH (Water, Sanitation & Hygiene)	Full-time	4	INR	550000.00	YEAR	2025-07-18	2025-09-10 00:00:00+05:30	t	2025-07-31 19:54:28.509+05:30	2025-07-31 19:54:28.509+05:30	Submit documents to engineer@swachhbharat.org	Swachh Bharat Abhiyan Trust	Govt-supported NGO for sanitation projects.	\N	India	Chhattisgarh	Raipur	492001	Pandri Market	https://example.org/jobs/wash-project-engineer	\N	\N	f	\N	\N
29ee4f33-2419-444e-833a-6658da2090c2	Community WASH Facilitator	community-wash-facilitator	Train SHGs and school students on water conservation and hygiene practices.	10+2 with experience in community mobilization	WASH (Water, Sanitation & Hygiene)	Part-time	1	INR	18000.00	MONTH	2025-07-22	2025-08-20 00:00:00+05:30	t	2025-07-31 19:54:28.511+05:30	2025-07-31 19:54:28.511+05:30	Send bio-data to water@jalchetna.org	Jal Chetna Kendra	Local NGO promoting water security.	\N	India	Madhya Pradesh	Indore	452001	MG Road	https://example.org/jobs/community-wash-facilitator	\N	\N	f	\N	\N
f15aa5ac-1724-405c-8aff-90c5427b193c	Human Rights Field Investigator	human-rights-field-investigator	Investigate and document human rights violations in conflict-affected areas.	Law/Social Sciences degree	Human Rights	Full-time	3	INR	600000.00	YEAR	2025-07-27	2025-08-31 00:00:00+05:30	t	2025-07-31 19:54:28.512+05:30	2025-07-31 19:54:28.512+05:30	Email detailed CV to recruit@rightwatch.in	Rights Watch India	Human rights advocacy NGO	\N	India	Jammu and Kashmir	Srinagar	190001	Residency Road	https://example.org/jobs/human-rights-field-investigator	\N	\N	f	\N	\N
74cc868e-6737-4c18-90f7-d894180bb3ca	Youth Engagement Officer – Civic Advocacy	youth-engagement-officer-civic-advocacy	Design civic engagement programs for young people on rights, responsibilities, and democratic values.	Bachelor's in Social Sciences or equivalent experience	Governance & Advocacy	Full-time	2	INR	400000.00	YEAR	2025-07-25	2025-09-01 00:00:00+05:30	t	2025-07-31 19:54:28.54+05:30	2025-07-31 19:54:28.54+05:30	Send profile to youth@civilchangemakers.in	Civil ChangeMakers	Youth and civic action group	\N	India	Telangana	Hyderabad	500001	Abids	https://example.org/jobs/youth-engagement-officer-civic-advocacy	\N	\N	f	\N	\N
108a0183-4878-40f4-b138-56adf14871e1	RTI & Legal Awareness Facilitator	rti-legal-awareness-facilitator	Conduct training workshops on Right to Information, public grievance redressal and basic legal literacy.	Any graduate with understanding of RTI Act or legal processes	Governance & Advocacy	Contractual	1	INR	30000.00	MONTH	2025-07-24	2025-08-30 00:00:00+05:30	t	2025-07-31 19:54:28.541+05:30	2025-07-31 19:54:28.541+05:30	Email your interest to legal@janchetna.org	Jan Chetna Trust	Legal empowerment NGO	\N	India	Rajasthan	Jaipur	302001	MI Road	https://example.org/jobs/rti-legal-awareness-facilitator	\N	\N	f	\N	\N
4d3240f7-70a3-4ed9-b9a1-92ac1a002f68	Training and Development Manager	training-development-manager	Lead the training strategy for field teams and partners in thematic areas such as health, education, and WASH.	Master’s in Social Work, Development Studies, or Education	Capacity Building & Training	Full-time	5	INR	800000.00	YEAR	2025-07-27	2025-09-01 00:00:00+05:30	t	2025-07-31 19:54:28.542+05:30	2025-07-31 19:54:28.542+05:30	Apply at hr@learningimpact.org with subject: Training Manager	Learning Impact Foundation	Capacity building and training organization	\N	India	Delhi	New Delhi	110003	Lodhi Colony	https://example.org/jobs/training-development-manager	\N	\N	f	\N	\N
2f3945fb-4229-4a16-8ed6-1ea150b626a5	Field Trainer – Livelihood Projects	field-trainer-livelihood	Conduct skills-based training for SHG members and youth on enterprise development and market linkage.	Graduation in any discipline; experience in community-based training essential	Capacity Building & Training	Full-time	2	INR	350000.00	YEAR	2025-07-25	2025-08-30 00:00:00+05:30	t	2025-07-31 19:54:28.543+05:30	2025-07-31 19:54:28.543+05:30	Send application to training@ujjivanshakti.org	Ujjivan Shakti	Livelihood and SHG support NGO	\N	India	Jharkhand	Ranchi	834001	Main Road	https://example.org/jobs/field-trainer-livelihood	\N	\N	f	\N	\N
6e548230-37f6-4b87-97e3-5235df5729da	Master Trainer – Gender Sensitization	master-trainer-gender	Design and deliver training modules on gender sensitization for community leaders and government officials.	Postgraduate in Gender Studies, Sociology, or related fields	Capacity Building & Training	Full-time	4	INR	600000.00	YEAR	2025-07-24	2025-08-31 00:00:00+05:30	t	2025-07-31 19:54:28.544+05:30	2025-07-31 19:54:28.544+05:30	Apply to careers@genderequal.org with your CV and cover letter	Gender Equal India	Gender and training-focused NGO	\N	India	Madhya Pradesh	Bhopal	462002	MP Nagar	https://example.org/jobs/master-trainer-gender	\N	\N	f	\N	\N
1b914d04-481a-4c01-b5ec-6b7676451986	Training Content Developer	training-content-developer	Create engaging training modules, manuals, and visual aids for grassroots capacity building.	Bachelor’s or above in Education, Development Communication, or Instructional Design	Capacity Building & Training	Part-time	2	INR	30000.00	MONTH	2025-07-22	2025-08-28 00:00:00+05:30	t	2025-07-31 19:54:28.546+05:30	2025-07-31 19:54:28.546+05:30	Send samples of previous work to content@capbuild.org	CapBuild Alliance	Training and content development NGO	\N	India	Tamil Nadu	Madurai	625001	KK Nagar	https://example.org/jobs/training-content-developer	\N	\N	f	\N	\N
c6bf56d3-12f7-4408-97d3-3d367356d879	Volunteer Engagement Officer	volunteer-engagement-officer	Design, coordinate and evaluate volunteer programs and outreach activities to boost participation across all states.	Graduate in Social Work or HR, with 2+ years of experience in managing volunteers	Volunteer Management	Full-time	3	INR	500000.00	YEAR	2025-07-27	2025-08-30 00:00:00+05:30	t	2025-07-31 19:54:28.548+05:30	2025-07-31 19:54:28.548+05:30	Email CV to volunteer@changeindia.org	Change India Foundation	Pan-India volunteer-based NGO	\N	India	Delhi	New Delhi	110011	Connaught Place	https://example.org/jobs/volunteer-engagement-officer	\N	\N	f	\N	\N
27fb857d-a64e-4331-af8c-4024eff3fa01	Campus Volunteer Coordinator	campus-volunteer-coordinator	Develop university partnerships and manage student volunteer programs in urban centers.	Bachelor’s in Sociology, Youth Work, or Education	Volunteer Management	Full-time	2	INR	420000.00	YEAR	2025-07-26	2025-09-01 00:00:00+05:30	t	2025-07-31 19:54:28.549+05:30	2025-07-31 19:54:28.549+05:30	Submit application at campus@youngleaders.org	Young Leaders Collective	Youth and volunteerism nonprofit	\N	India	Maharashtra	Mumbai	400001	Churchgate	https://example.org/jobs/campus-volunteer-coordinator	\N	\N	f	\N	\N
80e29559-e014-4681-83e4-2ea23bb68409	Volunteer Mobilization Associate	volunteer-mobilization-associate	Mobilize and onboard volunteers for health and education field programs in rural districts.	Any graduate with experience in community mobilization	Volunteer Management	Full-time	1	INR	300000.00	YEAR	2025-07-24	2025-08-31 00:00:00+05:30	t	2025-07-31 19:54:28.551+05:30	2025-07-31 19:54:28.551+05:30	Send resume to mobilize@gramconnect.org	GramConnect Foundation	Rural development NGO	\N	India	Bihar	Patna	800001	Fraser Road	https://example.org/jobs/volunteer-mobilization-associate	\N	\N	f	\N	\N
fca9b210-2322-474a-a7ad-ba2b568adc5d	Volunteer Support & Retention Executive	volunteer-support-retention-executive	Develop recognition programs and provide consistent communication to ensure volunteer retention and motivation.	Diploma/graduate in Communications, Psychology or HR preferred	Volunteer Management	Part-time	2	INR	25000.00	MONTH	2025-07-22	2025-08-25 00:00:00+05:30	t	2025-07-31 19:54:28.553+05:30	2025-07-31 19:54:28.553+05:30	Apply at support@humancircle.org	Human Circle Foundation	Volunteer-based mental wellness and youth org	\N	India	Kerala	Kochi	682001	Marine Drive	https://example.org/jobs/volunteer-support-retention-executive	\N	\N	f	\N	\N
2dc8288e-2b4b-4f99-8ad7-c88ef3c13f13	CSR Project Manager – Education & Skill Development	csr-project-manager-education	Manage end-to-end CSR project cycles focused on education, digital literacy, and skill training for underprivileged youth.	MBA/MSW or equivalent with CSR/NGO experience	Corporate Social Responsibility (CSR)	Full-time	5	INR	950000.00	YEAR	2025-07-27	2025-09-10 00:00:00+05:30	t	2025-07-31 19:54:28.554+05:30	2025-07-31 19:54:28.554+05:30	Apply at csr@techforimpact.com with CV and project portfolio	TechForImpact CSR Trust	CSR arm of a tech company	\N	India	Karnataka	Bengaluru	560103	Outer Ring Road, Marathahalli	https://example.org/jobs/csr-project-manager-education	\N	\N	f	\N	\N
1a288a66-8043-41db-a327-c496e1d26cea	CSR Executive – Community Development	csr-executive-community-development	Support CSR team in identifying community needs, NGO partners, and implementing projects in health and sanitation.	Graduate or Postgraduate in Social Work/Development	Corporate Social Responsibility (CSR)	Full-time	2	INR	500000.00	YEAR	2025-07-26	2025-09-01 00:00:00+05:30	t	2025-07-31 19:54:28.555+05:30	2025-07-31 19:54:28.555+05:30	Send resume to csrteam@buildabetterworld.org	Build a Better World Pvt. Ltd.	Corporate CSR entity	\N	India	Maharashtra	Mumbai	400070	Andheri East	https://example.org/jobs/csr-executive-community-development	\N	\N	f	\N	\N
d8112dc4-b9ca-4522-b709-d6e0bb5b6f6b	CSR Strategy & Reporting Officer	csr-strategy-reporting-officer	Lead CSR policy drafting, impact tracking, and prepare Section 135 (Companies Act) compliant annual reports.	MBA, M.Com, or equivalent with CSR reporting exposure	Corporate Social Responsibility (CSR)	Full-time	4	INR	700000.00	YEAR	2025-07-25	2025-08-30 00:00:00+05:30	t	2025-07-31 19:54:28.558+05:30	2025-07-31 19:54:28.558+05:30	Apply at careers@greenenterprise.com	Green Enterprise Solutions Ltd.	Sustainability & CSR firm	\N	India	Haryana	Gurgaon	122002	Cyber City	https://example.org/jobs/csr-strategy-reporting-officer	\N	\N	f	\N	\N
46bc9644-5ea9-48da-8da6-54f5898e5351	Assistant Manager – CSR Grants and NGO Liaison	assistant-manager-csr-grants	Liaise with NGO partners, disburse CSR grants, monitor fund utilization and ensure compliance with CSR laws.	MBA/MSW preferred; knowledge of CSR legal framework essential	Corporate Social Responsibility (CSR)	Full-time	3	INR	650000.00	YEAR	2025-07-24	2025-09-05 00:00:00+05:30	t	2025-07-31 19:54:28.559+05:30	2025-07-31 19:54:28.559+05:30	Email your CV to csrcompliance@corpsupport.org	CorpSupport India Pvt. Ltd.	Corporate CSR & compliance agency	\N	India	Telangana	Hyderabad	500081	Hitech City	https://example.org/jobs/assistant-manager-csr-grants	\N	\N	f	\N	\N
48dbc72b-1e05-409b-a158-10607fc5aa00	Operations Manager – NGO Programs	operations-manager-ngo-programs	Oversee daily operational activities, logistics, procurement, and coordination between field and head offices.	MBA/PGDM or equivalent in Operations/Management	Administrative & Operations	Full-time	5	INR	850000.00	YEAR	2025-07-27	2025-09-10 00:00:00+05:30	t	2025-07-31 19:54:28.561+05:30	2025-07-31 19:54:28.561+05:30	Email resume to ops@changemakers.org	ChangeMakers Foundation	Pan-India NGO	\N	India	Delhi	New Delhi	110002	Rajendra Place	https://example.org/jobs/operations-manager-ngo-programs	\N	\N	f	\N	\N
d5133640-1c05-468c-988f-01b23ff02585	Administrative Assistant	administrative-assistant	Assist with office management, scheduling, documentation, inventory management, and visitor coordination.	Graduate with working knowledge of MS Office	Administrative & Operations	Full-time	1	INR	250000.00	YEAR	2025-07-25	2025-08-25 00:00:00+05:30	t	2025-07-31 19:54:28.563+05:30	2025-07-31 19:54:28.563+05:30	Submit CV to admin@inclusivehope.org	Inclusive Hope	Disability and Inclusion NGO	\N	India	Odisha	Bhubaneswar	751001	Kharavela Nagar	https://example.org/jobs/administrative-assistant	\N	\N	f	\N	\N
cee75cf9-d8ba-438a-a561-237600e60382	Logistics & Procurement Coordinator	logistics-procurement-coordinator	Manage supply chain, vendor coordination, procurements, and distribution for rural health projects.	Bachelor’s in Logistics/Supply Chain/Commerce	Administrative & Operations	Full-time	3	INR	480000.00	YEAR	2025-07-24	2025-09-05 00:00:00+05:30	t	2025-07-31 19:54:28.565+05:30	2025-07-31 19:54:28.565+05:30	Apply via logistics@ruralreach.org	Rural Reach Foundation	Rural health NGO	\N	India	Madhya Pradesh	Indore	452001	MG Road	https://example.org/jobs/logistics-procurement-coordinator	\N	\N	f	\N	\N
329308c7-9c84-46f4-84ea-e5cbeb32caf6	Office & HR Administrator	office-hr-administrator	Handle admin functions, HR record keeping, leave management, and office communications.	Graduate with 1–2 years admin/HR support experience	Administrative & Operations	Full-time	2	INR	360000.00	YEAR	2025-07-23	2025-08-31 00:00:00+05:30	t	2025-07-31 19:54:28.567+05:30	2025-07-31 19:54:28.567+05:30	Send resume to hr@peaceworksindia.org	PeaceWorks India	Peacebuilding and conflict resolution NGO	\N	India	West Bengal	Kolkata	700017	Park Street	https://example.org/jobs/office-hr-administrator	\N	\N	f	\N	\N
57ba7a61-64fa-47eb-bae3-cee6dbb36d05	FCRA Compliance Executive	fcra-compliance-executive	Ensure FCRA filings, foreign contribution tracking, and coordination with legal consultants for NGO compliance.	Graduate/Postgraduate with FCRA handling experience	Finance & Compliance	Full-time	2	INR	600000.00	YEAR	2025-07-23	2025-09-09 00:00:00+05:30	t	2025-07-31 19:54:28.573+05:30	2025-07-31 19:55:42.23354+05:30	Submit application to fcra@legalroots.org	Legal Roots India	NGO legal advisory & compliance org		India	Jharkhand	Ranchi	834001	Main Road	https://example.org/jobs/fcra-compliance-executive	\N	\N	t		\N
fbb014fd-cc85-437c-aec0-c47c2d2388bf	Internal Auditor – NGO Programs	internal-auditor-ngo-programs-lucknow-uttar-pradesh	Conduct internal audits, review program budgets, and flag financial risks in multi-state programs.	CA Inter/CA/M.Com with auditing experience in nonprofits	Finance & Compliance	Full-time	4	INR	750000.00	YEAR	2025-07-24	2025-08-30 00:00:00+05:30	t	2025-07-31 19:54:28.572+05:30	2025-07-31 19:56:00.447612+05:30	Apply via audit@transparentchange.org	Transparent Change Foundation	Accountability and governance NGO		India	Uttar Pradesh	Lucknow	226001	Hazratganj	https://example.org/jobs/internal-auditor-ngo-programs	\N	\N	t		\N
a9413465-c960-485b-a540-3707ddac67f2	Accounts Officer – Donor Compliance	accounts-officer-donor-compliance-chennai-tamil-nadu	Prepare financial statements, track donor fund utilization, and support audits for international donors.	M.Com/B.Com with knowledge of FCRA and TDS compliance	Finance & Compliance	Full-time	3	INR	500000.00	YEAR	2025-07-25	2025-09-04 00:00:00+05:30	t	2025-07-31 19:54:28.571+05:30	2025-07-31 19:56:03.434995+05:30	Email applications to accounts@careuplift.org	Care Uplift Trust	Health and sanitation NGO		India	Tamil Nadu	Chennai	600034	T. Nagar	https://example.org/jobs/accounts-officer-donor-compliance	\N	\N	t		\N
965be815-abd0-479b-9daf-97a99fa59f7e	Finance Manager – NGO Accounts	finance-manager-ngo-accounts-new-delhi-delhi	Manage overall financial operations including budgeting, fund disbursement, donor reporting, and FCRA compliance.	CA/M.Com/MBA (Finance) with 5+ years in NGO finance	Finance & Compliance	Full-time	5	INR	900000.00	YEAR	2025-07-25	2025-09-13 00:00:00+05:30	t	2025-07-31 19:54:28.568+05:30	2025-07-31 19:56:32.281963+05:30	Send your updated CV to finance@impactnow.org	Impact Now Foundation	National-level NGO		India	Delhi	New Delhi	110003	Lodhi Road	https://example.org/jobs/finance-manager-ngo-accounts	\N	\N	f		\N
1a416b9c-c5d7-45f9-a587-b196188fcf34	TEST-IN	test-in-bangalore-karnataka	sad	sad	Education	Full-time	1	INR	234234.00	HOUR	2025-08-25	2025-08-25 00:00:00+05:30	t	2025-08-25 20:46:15.437+05:30	2025-08-25 20:46:15.437+05:30	sad	TEST	FASDF	\N	India	Karnataka	Bangalore	234234	23423423	\N	7b6d7b54-3794-43f6-8ed1-45159a8c0160	7b6d7b54-3794-43f6-8ed1-45159a8c0160	f	asd	\N
e0eb5f0a-7fe9-487f-b5e3-f817ae634d3e	TEAT	teat-pune-mumbai	TEAT	TEAT	Health	Full-time	25	INR	8768767.00	YEAR	2026-11-10	2026-12-13 00:00:00+05:30	t	2026-04-06 16:20:23.919+05:30	2026-04-06 16:25:54.347503+05:30	TEAT	TEAT	TEAT		India	Mumbai	Pune	854848	TEAT	https://developmentwala.com/	\N	\N	t		\N
38bd3575-42f0-4c9a-8b1c-5323ca0c027c	Jivan Sathi	jivan-sathi-ranchi-jharkhand	<ol><li><b><i><span style="font-size: 12px;">TEST</span></i></b></li></ol>	TEST	Livelihoods	Part-time	18	INR	8118.00	HOUR	2026-04-07	2026-11-11 00:00:00+05:30	t	2026-04-07 23:09:08.996+05:30	2026-04-07 23:21:39.031214+05:30	TEST	Subhash Tech	NGO	\N	India	Jharkhand	Ranchi	834001	Bhursabad	http://localhost:3000/	0a97935e-2381-43e9-ab4c-de4d0a182a41	0a97935e-2381-43e9-ab4c-de4d0a182a41	f	TEST	/uploads/employers/0a97935e-2381-43e9-ab4c-de4d0a182a41/logo_1775580107713.webp
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, entity_title, user_role, created_at, read, details, type, entity_id, user_id) FROM stdin;
a63f4f49-23c4-4ae7-b42c-ad8c24935b24	Test2	employer	2025-07-09 08:42:02.209275+05:30	f	{"id":"4a263747-98ef-4437-a654-4509a7aa5cbf","title":"Test2","organization":"asdasd","type":"Proposal","sector":"Environment / Climate Change","eligible":"asdasda","amount":"4234234","deadline":"2025-07-12T18:30:00.000Z","link":"https://www.apple.com/in/store?afid=p240%7Cgo~cmp-11116556120~adg-179254536873~ad-758844117495_kwd-10778630~dev-c~ext-~prd-~mca-~nt-search&cid=aos-in-kwgo-brand--","rfp_url":null,"description":"asdasd","tags":"asdasd","status":"Draft","featured":false,"created_at":"2025-07-09T03:12:02.207Z","updated_at":"2025-07-09T03:12:02.207Z","employer_id":"cb1e08b4-c87e-4bcb-809d-e8b1e2a9b666"}	grant	4a263747-98ef-4437-a654-4509a7aa5cbf	cb1e08b4-c87e-4bcb-809d-e8b1e2a9b666
9e82cd8b-f32b-4965-af00-7679fb24abd2	TEST	employer	2025-07-09 08:57:31.070525+05:30	f	{"id":"6bdb82bf-934b-4f05-9325-aea7f984cd7d","title":"TEST","slug":"test-asdfasdf-karnataka","description":"ASFASFASDF","qualifications":"ASDFASDF","role_category":"Education","employment_type":"Full-time","experience_min":2342,"salary_currency":"INR","salary_value":"234234.00","salary_unit_text":"HOUR","date_posted":"2025-07-09T18:30:00.000Z","valid_through":"2025-07-19T04:27:00.000Z","is_active":true,"created_at":"2025-07-09T03:27:31.024Z","updated_at":"2025-07-09T03:27:31.024Z","how_to_apply":"ASDFASDF","organization":"SSDFASD","organization_type":"AFASDFASDF","location_id":null,"country":"India","state":"Karnataka","city":"asdfasdf","pin_code":"234234","street_address":"23423423","applylink":"https://www.apple.com/in/store?afid=p240%7Cgo~cmp-11116556120~adg-179254536873~ad-758844117495_kwd-10778630~dev-c~ext-~prd-~mca-~nt-search&cid=aos-in-kwgo-brand--","employer_id":null,"user_id":null,"featured":false,"education_required":"ASDFASD"}	job	6bdb82bf-934b-4f05-9325-aea7f984cd7d	\N
9de7d3b4-d92d-4827-8254-4d0e40abb21d	TEST MB	employer	2025-07-09 09:02:55.546387+05:30	f	{"id":"606d8a2b-e871-46ce-acbe-0515f00f1700","title":"TEST MB","slug":"test-mb-asdfasdf-karnataka","description":"ASDF","qualifications":"ASDFASD","role_category":"Education","employment_type":"Full-time","experience_min":345,"salary_currency":"INR","salary_value":"3456.00","salary_unit_text":"HOUR","date_posted":"2025-07-08T18:30:00.000Z","valid_through":"2025-07-11T03:32:00.000Z","is_active":true,"created_at":"2025-07-09T03:32:55.541Z","updated_at":"2025-07-09T03:32:55.541Z","how_to_apply":"ASDF","organization":"ADSFASD","organization_type":"FASDF","location_id":null,"country":"India","state":"Karnataka","city":"asdfasdf","pin_code":"234234","street_address":"23423423","applylink":"https://www.apple.com/in/store?afid=p240%7Cgo~cmp-11116556120~adg-179254536873~ad-758844117495_kwd-10778630~dev-c~ext-~prd-~mca-~nt-search&cid=aos-in-kwgo-brand--","employer_id":null,"user_id":"de9ba50f-cb0c-44df-8306-ed2c06fb8df1","featured":false,"education_required":"FASDF"}	job	606d8a2b-e871-46ce-acbe-0515f00f1700	de9ba50f-cb0c-44df-8306-ed2c06fb8df1
0c09a168-7edc-44f5-81d8-cf9eaebe6c88	EDIT3	employer	2025-07-09 09:12:54.729966+05:30	f	{"id":"c1cdbbf1-1fb3-4989-a372-5007e326cd1a","title":"EDIT3","organizer":"asdasda","type":"Conference","mode":"Online","location":"adasda","start_date":"2025-07-06T18:30:00.000Z","end_date":"2025-07-09T18:30:00.000Z","link":"","email":"superadmin@example.com","poster_url":null,"description":"asdff","tags":"asdv","created_at":"2025-07-09T03:42:54.728Z","updated_at":"2025-07-09T03:42:54.728Z","start_time":null,"end_time":null,"owner_id":"de9ba50f-cb0c-44df-8306-ed2c06fb8df1","user_role":"employer"}	event	c1cdbbf1-1fb3-4989-a372-5007e326cd1a	de9ba50f-cb0c-44df-8306-ed2c06fb8df1
39cc8a44-055b-45d2-86de-a441f0354ba9	G-emp	employer	2025-07-09 09:14:44.907338+05:30	f	{"id":"90263685-02f2-4621-a5c4-03197a5a4bc2","title":"G-emp","organization":"asdfasfasdf","type":"Proposal","sector":"Education","eligible":"afasdfasdf","amount":"234524234","deadline":"2025-07-11T18:30:00.000Z","link":"https://www.apple.com/in/store?afid=p240%7Cgo~cmp-11116556120~adg-179254536873~ad-758844117495_kwd-10778630~dev-c~ext-~prd-~mca-~nt-search&cid=aos-in-kwgo-brand--","rfp_url":null,"description":"asdfawdf","tags":"asdfasdf","status":"Draft","featured":false,"created_at":"2025-07-09T03:44:44.904Z","updated_at":"2025-07-09T03:44:44.904Z","employer_id":"de9ba50f-cb0c-44df-8306-ed2c06fb8df1"}	grant	90263685-02f2-4621-a5c4-03197a5a4bc2	de9ba50f-cb0c-44df-8306-ed2c06fb8df1
96a78405-56c4-4178-a30c-abf7aa2331ff	G-emp-edit	employer	2025-07-09 09:16:30.593928+05:30	f	{"id":"5e72249c-2b85-4eb0-9801-b16326f1e19c","title":"G-emp-edit","organization":"asdfasfasdf","type":"Proposal","sector":"Education","eligible":"afasdfasdf","amount":"234524234","deadline":"2025-07-10T18:30:00.000Z","link":"https://www.apple.com/in/store?afid=p240%7Cgo~cmp-11116556120~adg-179254536873~ad-758844117495_kwd-10778630~dev-c~ext-~prd-~mca-~nt-search&cid=aos-in-kwgo-brand--","rfp_url":null,"description":"asdfawdf","tags":"asdfasdf","status":"Draft","featured":false,"created_at":"2025-07-09T03:46:30.591Z","updated_at":"2025-07-09T03:46:30.591Z","employer_id":"de9ba50f-cb0c-44df-8306-ed2c06fb8df1"}	grant	5e72249c-2b85-4eb0-9801-b16326f1e19c	de9ba50f-cb0c-44df-8306-ed2c06fb8df1
3c1a0a73-9350-450d-a687-33ed91db7232	G-emp-edit1	employer	2025-07-09 09:16:44.864921+05:30	f	{"id":"759daa0e-07eb-44d2-ac57-442a3c453cb2","title":"G-emp-edit1","organization":"asdfasfasdf","type":"Proposal","sector":"Education","eligible":"afasdfasdf","amount":"234524234","deadline":"2025-07-09T18:30:00.000Z","link":"https://www.apple.com/in/store?afid=p240%7Cgo~cmp-11116556120~adg-179254536873~ad-758844117495_kwd-10778630~dev-c~ext-~prd-~mca-~nt-search&cid=aos-in-kwgo-brand--","rfp_url":null,"description":"asdfawdf","tags":"asdfasdf","status":"Draft","featured":false,"created_at":"2025-07-09T03:46:44.863Z","updated_at":"2025-07-09T03:46:44.863Z","employer_id":"de9ba50f-cb0c-44df-8306-ed2c06fb8df1"}	grant	759daa0e-07eb-44d2-ac57-442a3c453cb2	de9ba50f-cb0c-44df-8306-ed2c06fb8df1
81e6b961-2c3c-4016-83e4-d710d597b07e	EDIT31	employer	2025-07-09 09:19:11.245522+05:30	f	{"id":"d9ca4421-f1fa-464b-9ee6-99be034062cd","title":"EDIT31","organizer":"asdasda","type":"Conference","mode":"Online","location":"adasda","start_date":"2025-07-05T18:30:00.000Z","end_date":"2025-07-08T18:30:00.000Z","link":"","email":"superadmin@example.com","poster_url":null,"description":"asdff","tags":"asdv","created_at":"2025-07-09T03:49:11.243Z","updated_at":"2025-07-09T03:49:11.243Z","start_time":null,"end_time":null,"owner_id":"de9ba50f-cb0c-44df-8306-ed2c06fb8df1","user_role":"employer"}	event	d9ca4421-f1fa-464b-9ee6-99be034062cd	de9ba50f-cb0c-44df-8306-ed2c06fb8df1
eb0a3939-fb73-4c1c-9378-899946589506	qweq	employer	2025-07-10 20:40:05.244292+05:30	f	{"id":"7ed80439-e0f4-4c67-a1ea-636bb971e662","title":"qweq","slug":"qweq-asdfasdf-karnataka","description":"asdasd","qualifications":"sdasd","role_category":"Health","employment_type":"Full-time","experience_min":2,"salary_currency":"INR","salary_value":"342423.00","salary_unit_text":"YEAR","date_posted":"2025-07-09T18:30:00.000Z","valid_through":"2025-07-23T18:30:00.000Z","is_active":true,"created_at":"2025-07-10T15:10:05.240Z","updated_at":"2025-07-10T15:10:05.240Z","how_to_apply":"adasda","organization":"TEST","organization_type":"FASDF","location_id":null,"country":"India","state":"Karnataka","city":"asdfasdf","pin_code":"234234","street_address":"23423423","applylink":null,"employer_id":null,"user_id":null,"featured":false,"education_required":"asd"}	job	7ed80439-e0f4-4c67-a1ea-636bb971e662	\N
9b0f3ab1-8298-4e3d-843e-dff85df7ed09	TE	employer	2025-07-10 20:42:20.948528+05:30	f	{"id":"a00ccb57-dd36-47ef-8c80-d8119f10c612","title":"TE","slug":"te-asdfasdf-karnataka","description":"asd","qualifications":"asd","role_category":"Health","employment_type":"Full-time","experience_min":3,"salary_currency":"INR","salary_value":"234523.00","salary_unit_text":"YEAR","date_posted":"2025-07-09T18:30:00.000Z","valid_through":"2025-07-23T18:30:00.000Z","is_active":true,"created_at":"2025-07-10T15:12:20.943Z","updated_at":"2025-07-10T15:12:20.943Z","how_to_apply":"asd","organization":"TEST","organization_type":"FASDF","location_id":null,"country":"India","state":"Karnataka","city":"asdfasdf","pin_code":"234234","street_address":"23423423","applylink":null,"employer_id":"de9ba50f-cb0c-44df-8306-ed2c06fb8df1","user_id":"de9ba50f-cb0c-44df-8306-ed2c06fb8df1","featured":false,"education_required":"asd"}	job	a00ccb57-dd36-47ef-8c80-d8119f10c612	de9ba50f-cb0c-44df-8306-ed2c06fb8df1
d6582938-1ff5-4da0-b835-e308dcd0ff21	TEST43	employer	2025-07-13 22:18:47.908516+05:30	f	{"id":"8d455772-d095-4a0d-8135-ca4656e1ef50","title":"TEST43","slug":"test43-asdfasdf-karnataka","description":"adsf","qualifications":"434","role_category":"Education","employment_type":"Full-time","experience_min":34,"salary_currency":"INR","salary_value":"3424233.99","salary_unit_text":"YEAR","date_posted":"2000-11-10T18:30:00.000Z","valid_through":"2000-11-10T18:30:00.000Z","is_active":true,"created_at":"2025-07-13T16:48:47.851Z","updated_at":"2025-07-13T16:48:47.851Z","how_to_apply":"asdasd","organization":"asdf","organization_type":"adsf","location_id":null,"country":"India","state":"Karnataka","city":"asdfasdf","pin_code":"234234","street_address":"23423423","applylink":"asdas","employer_id":null,"user_id":null,"featured":true,"education_required":null,"organization_logo":null}	job	8d455772-d095-4a0d-8135-ca4656e1ef50	\N
116d44d0-9bdb-48c7-9015-243ebb25a384	TEST454	employer	2025-07-13 22:22:25.164987+05:30	f	{"id":"d6f6f4f3-81db-4856-bfb9-1ced6bdaa81d","title":"TEST454","slug":"test454-asdfasdf-karnataka","description":"ASDF","qualifications":"DSAD","role_category":"Education","employment_type":"Full-time","experience_min":34,"salary_currency":"INR","salary_value":"234234.00","salary_unit_text":"YEAR","date_posted":"2025-07-14T18:30:00.000Z","valid_through":"2025-07-14T18:30:00.000Z","is_active":true,"created_at":"2025-07-13T16:52:25.132Z","updated_at":"2025-07-13T16:52:25.132Z","how_to_apply":"DASDA","organization":"ADSF","organization_type":"ADFS","location_id":null,"country":"India","state":"Karnataka","city":"asdfasdf","pin_code":"234234","street_address":"23423423","applylink":"ASDASDA","employer_id":null,"user_id":null,"featured":false,"education_required":null,"organization_logo":null}	job	d6f6f4f3-81db-4856-bfb9-1ced6bdaa81d	\N
411da695-10a5-4978-85c5-7f2be5e910ef	TESWT123	employer	2025-07-13 22:46:36.844384+05:30	f	{"id":"e17fbcae-e0ea-4710-9529-67de7a8a201e","title":"TESWT123","slug":"teswt123-asdfasdf-karnataka","description":"ASFDASDF","qualifications":"4234","role_category":"Education","employment_type":"Full-time","experience_min":2342,"salary_currency":"INR","salary_value":"234234.00","salary_unit_text":"YEAR","date_posted":"0200-11-10T18:06:32.000Z","valid_through":"1200-11-10T18:06:32.000Z","is_active":true,"created_at":"2025-07-13T17:16:36.841Z","updated_at":"2025-07-13T17:16:36.841Z","how_to_apply":"ADSFASD","organization":"ASDFASD","organization_type":"ASDFASD","location_id":null,"country":"India","state":"Karnataka","city":"asdfasdf","pin_code":"234234","street_address":"23423423","applylink":"ASDF","employer_id":null,"user_id":null,"featured":true,"education_required":null,"organization_logo":null}	job	e17fbcae-e0ea-4710-9529-67de7a8a201e	\N
69f14a2b-69ae-48d7-baa8-7042a50206f8	HEALTH	employer	2025-07-13 22:50:24.772222+05:30	f	{"id":"22fd3531-132e-4b28-9aa8-d632ebe81013","title":"HEALTH","slug":"health-asdfasdf-karnataka","description":"ASDASD","qualifications":"AD","role_category":"Education","employment_type":"Full-time","experience_min":123,"salary_currency":"INR","salary_value":"23423.00","salary_unit_text":"YEAR","date_posted":"1111-11-10T18:06:32.000Z","valid_through":"1111-11-10T18:06:32.000Z","is_active":true,"created_at":"2025-07-13T17:20:24.632Z","updated_at":"2025-07-13T17:20:24.632Z","how_to_apply":"ADSA","organization":"ADSA","organization_type":"ADS","location_id":null,"country":"India","state":"Karnataka","city":"asdfasdf","pin_code":"234234","street_address":"23423423","applylink":"ASDA","employer_id":null,"user_id":null,"featured":false,"education_required":null,"organization_logo":null}	job	22fd3531-132e-4b28-9aa8-d632ebe81013	\N
3114866e-7fa9-4c40-a7ba-b346ca583c0e	DEV	employer	2025-07-13 22:57:00.113716+05:30	f	{"id":"f80b7682-520f-44cf-870f-7f5f5af9db58","title":"DEV","slug":"dev-asdfasdf-karnataka","description":"asdfasdasdf","qualifications":"234234","role_category":"Education","employment_type":"Full-time","experience_min":324,"salary_currency":"INR","salary_value":"234234.00","salary_unit_text":"YEAR","date_posted":"2025-07-07T18:30:00.000Z","valid_through":"2025-07-22T18:30:00.000Z","is_active":true,"created_at":"2025-07-13T17:27:00.061Z","updated_at":"2025-07-13T17:27:00.061Z","how_to_apply":"asdfasdf","organization":"asdfasds","organization_type":"asdfasd","location_id":null,"country":"India","state":"Karnataka","city":"asdfasdf","pin_code":"234234","street_address":"23423423","applylink":"asdfas","employer_id":null,"user_id":null,"featured":true,"education_required":null,"organization_logo":null}	job	f80b7682-520f-44cf-870f-7f5f5af9db58	\N
c54c0a11-fb4f-407f-a97d-88b8e095454e	REA	employer	2025-07-14 00:17:36.448618+05:30	f	{"id":"a60dfdd5-6959-4286-81f8-331742e0c30b","title":"REA","slug":"rea-asdfasdf-karnataka","description":"DASDAS","qualifications":"ASDF","role_category":"Corporate Social Responsibility (CSR)","employment_type":"Part-time","experience_min":34,"salary_currency":"INR","salary_value":"23422.99","salary_unit_text":"YEAR","date_posted":"1111-11-10T18:06:32.000Z","valid_through":"1111-11-10T18:06:32.000Z","is_active":true,"created_at":"2025-07-13T18:47:36.402Z","updated_at":"2025-07-13T18:47:36.402Z","how_to_apply":"SADAS","organization":"ADSFSDF","organization_type":"ASDF","location_id":null,"country":"India","state":"Karnataka","city":"asdfasdf","pin_code":"234234","street_address":"23423423","applylink":"ASDAS","employer_id":null,"user_id":null,"featured":false,"education_required":null,"organization_logo":null}	job	a60dfdd5-6959-4286-81f8-331742e0c30b	\N
e2085e37-6b89-4fa0-b5f2-7cdf75eab85c	Program Manager	employer	2025-07-15 18:16:44.466016+05:30	f	{"id":"628ad2b3-5f7a-426a-85d4-392126a77c54","title":"Program Manager","slug":"program-manager-palghar-maharashtra","description":"<span style=\\"white-space-collapse: collapse; color: rgba(0, 0, 0, 0.9); font-family: -apple-system, system-ui, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, &quot;Fira Sans&quot;, Ubuntu, Oxygen, &quot;Oxygen Sans&quot;, Cantarell, &quot;Droid Sans&quot;, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Lucida Grande&quot;, Helvetica, Arial, sans-serif; font-size: 14px;\\">Learning Links Foundation is looking for an experienced Program Manager to lead our Holistic Development Program. This is a unique opportunity to drive meaningful impact in education by managing school-based programs and engaging with communities and donors.</span><span style=\\"box-sizing: inherit; border-style: none; border-color: rgba(0, 0, 0, 0.9); border-image: none 100% / 1 / 0 stretch; white-space-collapse: collapse; font-size: 14px; vertical-align: baseline; background-image: none; background-position: 0% 0%; background-size: auto; background-repeat: repeat; background-attachment: scroll; background-origin: padding-box; background-clip: border-box; outline: rgba(0, 0, 0, 0.9) none 0px; font-family: -apple-system, system-ui, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, &quot;Fira Sans&quot;, Ubuntu, Oxygen, &quot;Oxygen Sans&quot;, Cantarell, &quot;Droid Sans&quot;, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Lucida Grande&quot;, Helvetica, Arial, sans-serif; color: rgba(0, 0, 0, 0.9); line-height: inherit !important;\\"><br style=\\"box-sizing: inherit; line-height: inherit !important;\\"></span><span style=\\"white-space-collapse: collapse; color: rgba(0, 0, 0, 0.9); font-family: -apple-system, system-ui, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, &quot;Fira Sans&quot;, Ubuntu, Oxygen, &quot;Oxygen Sans&quot;, Cantarell, &quot;Droid Sans&quot;, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Lucida Grande&quot;, Helvetica, Arial, sans-serif; font-size: 14px;\\">🎯 Key Responsibilities:</span><span style=\\"box-sizing: inherit; border-style: none; border-color: rgba(0, 0, 0, 0.9); border-image: none 100% / 1 / 0 stretch; white-space-collapse: collapse; font-size: 14px; vertical-align: baseline; background-image: none; background-position: 0% 0%; background-size: auto; background-repeat: repeat; background-attachment: scroll; background-origin: padding-box; background-clip: border-box; outline: rgba(0, 0, 0, 0.9) none 0px; font-family: -apple-system, system-ui, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, &quot;Fira Sans&quot;, Ubuntu, Oxygen, &quot;Oxygen Sans&quot;, Cantarell, &quot;Droid Sans&quot;, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Lucida Grande&quot;, Helvetica, Arial, sans-serif; color: rgba(0, 0, 0, 0.9); line-height: inherit !important;\\"><br style=\\"box-sizing: inherit; line-height: inherit !important;\\"></span><span style=\\"white-space-collapse: collapse; color: rgba(0, 0, 0, 0.9); font-family: -apple-system, system-ui, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, &quot;Fira Sans&quot;, Ubuntu, Oxygen, &quot;Oxygen Sans&quot;, Cantarell, &quot;Droid Sans&quot;, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Lucida Grande&quot;, Helvetica, Arial, sans-serif; font-size: 14px;\\">Lead and manage program execution across schools</span><span style=\\"box-sizing: inherit; border-style: none; border-color: rgba(0, 0, 0, 0.9); border-image: none 100% / 1 / 0 stretch; white-space-collapse: collapse; font-size: 14px; vertical-align: baseline; background-image: none; background-position: 0% 0%; background-size: auto; background-repeat: repeat; background-attachment: scroll; background-origin: padding-box; background-clip: border-box; outline: rgba(0, 0, 0, 0.9) none 0px; font-family: -apple-system, system-ui, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, &quot;Fira Sans&quot;, Ubuntu, Oxygen, &quot;Oxygen Sans&quot;, Cantarell, &quot;Droid Sans&quot;, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Lucida Grande&quot;, Helvetica, Arial, sans-serif; color: rgba(0, 0, 0, 0.9); line-height: inherit !important;\\"><br style=\\"box-sizing: inherit; line-height: inherit !important;\\"></span><span style=\\"white-space-collapse: collapse; color: rgba(0, 0, 0, 0.9); font-family: -apple-system, system-ui, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, &quot;Fira Sans&quot;, Ubuntu, Oxygen, &quot;Oxygen Sans&quot;, Cantarell, &quot;Droid Sans&quot;, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Lucida Grande&quot;, Helvetica, Arial, sans-serif; font-size: 14px;\\">Supervise field teams and ensure quality delivery</span><span style=\\"box-sizing: inherit; border-style: none; border-color: rgba(0, 0, 0, 0.9); border-image: none 100% / 1 / 0 stretch; white-space-collapse: collapse; font-size: 14px; vertical-align: baseline; background-image: none; background-position: 0% 0%; background-size: auto; background-repeat: repeat; background-attachment: scroll; background-origin: padding-box; background-clip: border-box; outline: rgba(0, 0, 0, 0.9) none 0px; font-family: -apple-system, system-ui, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, &quot;Fira Sans&quot;, Ubuntu, Oxygen, &quot;Oxygen Sans&quot;, Cantarell, &quot;Droid Sans&quot;, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Lucida Grande&quot;, Helvetica, Arial, sans-serif; color: rgba(0, 0, 0, 0.9); line-height: inherit !important;\\"><br style=\\"box-sizing: inherit; line-height: inherit !important;\\"></span><span style=\\"white-space-collapse: collapse; color: rgba(0, 0, 0, 0.9); font-family: -apple-system, system-ui, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, &quot;Fira Sans&quot;, Ubuntu, Oxygen, &quot;Oxygen Sans&quot;, Cantarell, &quot;Droid Sans&quot;, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Lucida Grande&quot;, Helvetica, Arial, sans-serif; font-size: 14px;\\">Handle budgeting, planning, and fund utilization</span><span style=\\"box-sizing: inherit; border-style: none; border-color: rgba(0, 0, 0, 0.9); border-image: none 100% / 1 / 0 stretch; white-space-collapse: collapse; font-size: 14px; vertical-align: baseline; background-image: none; background-position: 0% 0%; background-size: auto; background-repeat: repeat; background-attachment: scroll; background-origin: padding-box; background-clip: border-box; outline: rgba(0, 0, 0, 0.9) none 0px; font-family: -apple-system, system-ui, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, &quot;Fira Sans&quot;, Ubuntu, Oxygen, &quot;Oxygen Sans&quot;, Cantarell, &quot;Droid Sans&quot;, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Lucida Grande&quot;, Helvetica, Arial, sans-serif; color: rgba(0, 0, 0, 0.9); line-height: inherit !important;\\"><br style=\\"box-sizing: inherit; line-height: inherit !important;\\"></span><span style=\\"white-space-collapse: collapse; color: rgba(0, 0, 0, 0.9); font-family: -apple-system, system-ui, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, &quot;Fira Sans&quot;, Ubuntu, Oxygen, &quot;Oxygen Sans&quot;, Cantarell, &quot;Droid Sans&quot;, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Lucida Grande&quot;, Helvetica, Arial, sans-serif; font-size: 14px;\\">Coordinate with donors, schools, and internal teams</span><span style=\\"box-sizing: inherit; border-style: none; border-color: rgba(0, 0, 0, 0.9); border-image: none 100% / 1 / 0 stretch; white-space-collapse: collapse; font-size: 14px; vertical-align: baseline; background-image: none; background-position: 0% 0%; background-size: auto; background-repeat: repeat; background-attachment: scroll; background-origin: padding-box; background-clip: border-box; outline: rgba(0, 0, 0, 0.9) none 0px; font-family: -apple-system, system-ui, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, &quot;Fira Sans&quot;, Ubuntu, Oxygen, &quot;Oxygen Sans&quot;, Cantarell, &quot;Droid Sans&quot;, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Lucida Grande&quot;, Helvetica, Arial, sans-serif; color: rgba(0, 0, 0, 0.9); line-height: inherit !important;\\"><br style=\\"box-sizing: inherit; line-height: inherit !important;\\"></span><span style=\\"white-space-collapse: collapse; color: rgba(0, 0, 0, 0.9); font-family: -apple-system, system-ui, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, &quot;Fira Sans&quot;, Ubuntu, Oxygen, &quot;Oxygen Sans&quot;, Cantarell, &quot;Droid Sans&quot;, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Lucida Grande&quot;, Helvetica, Arial, sans-serif; font-size: 14px;\\">Monitor progress through evaluations and field visits</span><span style=\\"box-sizing: inherit; border-style: none; border-color: rgba(0, 0, 0, 0.9); border-image: none 100% / 1 / 0 stretch; white-space-collapse: collapse; font-size: 14px; vertical-align: baseline; background-image: none; background-position: 0% 0%; background-size: auto; background-repeat: repeat; background-attachment: scroll; background-origin: padding-box; background-clip: border-box; outline: rgba(0, 0, 0, 0.9) none 0px; font-family: -apple-system, system-ui, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, &quot;Fira Sans&quot;, Ubuntu, Oxygen, &quot;Oxygen Sans&quot;, Cantarell, &quot;Droid Sans&quot;, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Lucida Grande&quot;, Helvetica, Arial, sans-serif; color: rgba(0, 0, 0, 0.9); line-height: inherit !important;\\"><br style=\\"box-sizing: inherit; line-height: inherit !important;\\"></span><span style=\\"white-space-collapse: collapse; color: rgba(0, 0, 0, 0.9); font-family: -apple-system, system-ui, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, &quot;Fira Sans&quot;, Ubuntu, Oxygen, &quot;Oxygen Sans&quot;, Cantarell, &quot;Droid Sans&quot;, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Lucida Grande&quot;, Helvetica, Arial, sans-serif; font-size: 14px;\\">🎓 Qualifications:</span><span style=\\"box-sizing: inherit; border-style: none; border-color: rgba(0, 0, 0, 0.9); border-image: none 100% / 1 / 0 stretch; white-space-collapse: collapse; font-size: 14px; vertical-align: baseline; background-image: none; background-position: 0% 0%; background-size: auto; background-repeat: repeat; background-attachment: scroll; background-origin: padding-box; background-clip: border-box; outline: rgba(0, 0, 0, 0.9) none 0px; font-family: -apple-system, system-ui, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, &quot;Fira Sans&quot;, Ubuntu, Oxygen, &quot;Oxygen Sans&quot;, Cantarell, &quot;Droid Sans&quot;, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Lucida Grande&quot;, Helvetica, Arial, sans-serif; color: rgba(0, 0, 0, 0.9); line-height: inherit !important;\\"><br style=\\"box-sizing: inherit; line-height: inherit !important;\\"></span><span style=\\"white-space-collapse: collapse; color: rgba(0, 0, 0, 0.9); font-family: -apple-system, system-ui, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, &quot;Fira Sans&quot;, Ubuntu, Oxygen, &quot;Oxygen Sans&quot;, Cantarell, &quot;Droid Sans&quot;, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Lucida Grande&quot;, Helvetica, Arial, sans-serif; font-size: 14px;\\">Postgraduate in Education, Social Work, or related field</span><span style=\\"box-sizing: inherit; border-style: none; border-color: rgba(0, 0, 0, 0.9); border-image: none 100% / 1 / 0 stretch; white-space-collapse: collapse; font-size: 14px; vertical-align: baseline; background-image: none; background-position: 0% 0%; background-size: auto; background-repeat: repeat; background-attachment: scroll; background-origin: padding-box; background-clip: border-box; outline: rgba(0, 0, 0, 0.9) none 0px; font-family: -apple-system, system-ui, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, &quot;Fira Sans&quot;, Ubuntu, Oxygen, &quot;Oxygen Sans&quot;, Cantarell, &quot;Droid Sans&quot;, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Lucida Grande&quot;, Helvetica, Arial, sans-serif; color: rgba(0, 0, 0, 0.9); line-height: inherit !important;\\"><br style=\\"box-sizing: inherit; line-height: inherit !important;\\"></span><span style=\\"white-space-collapse: collapse; color: rgba(0, 0, 0, 0.9); font-family: -apple-system, system-ui, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, &quot;Fira Sans&quot;, Ubuntu, Oxygen, &quot;Oxygen Sans&quot;, Cantarell, &quot;Droid Sans&quot;, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Lucida Grande&quot;, Helvetica, Arial, sans-serif; font-size: 14px;\\">10–12 years of program management experience</span><span style=\\"box-sizing: inherit; border-style: none; border-color: rgba(0, 0, 0, 0.9); border-image: none 100% / 1 / 0 stretch; white-space-collapse: collapse; font-size: 14px; vertical-align: baseline; background-image: none; background-position: 0% 0%; background-size: auto; background-repeat: repeat; background-attachment: scroll; background-origin: padding-box; background-clip: border-box; outline: rgba(0, 0, 0, 0.9) none 0px; font-family: -apple-system, system-ui, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, &quot;Fira Sans&quot;, Ubuntu, Oxygen, &quot;Oxygen Sans&quot;, Cantarell, &quot;Droid Sans&quot;, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Lucida Grande&quot;, Helvetica, Arial, sans-serif; color: rgba(0, 0, 0, 0.9); line-height: inherit !important;\\"><br style=\\"box-sizing: inherit; line-height: inherit !important;\\"></span><span style=\\"white-space-collapse: collapse; color: rgba(0, 0, 0, 0.9); font-family: -apple-system, system-ui, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, &quot;Fira Sans&quot;, Ubuntu, Oxygen, &quot;Oxygen Sans&quot;, Cantarell, &quot;Droid Sans&quot;, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Lucida Grande&quot;, Helvetica, Arial, sans-serif; font-size: 14px;\\">Strong leadership, analytical, and budgeting skills</span><span style=\\"box-sizing: inherit; border-style: none; border-color: rgba(0, 0, 0, 0.9); border-image: none 100% / 1 / 0 stretch; white-space-collapse: collapse; font-size: 14px; vertical-align: baseline; background-image: none; background-position: 0% 0%; background-size: auto; background-repeat: repeat; background-attachment: scroll; background-origin: padding-box; background-clip: border-box; outline: rgba(0, 0, 0, 0.9) none 0px; font-family: -apple-system, system-ui, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, &quot;Fira Sans&quot;, Ubuntu, Oxygen, &quot;Oxygen Sans&quot;, Cantarell, &quot;Droid Sans&quot;, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Lucida Grande&quot;, Helvetica, Arial, sans-serif; color: rgba(0, 0, 0, 0.9); line-height: inherit !important;\\"><br style=\\"box-sizing: inherit; line-height: inherit !important;\\"></span><span style=\\"white-space-collapse: collapse; color: rgba(0, 0, 0, 0.9); font-family: -apple-system, system-ui, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, &quot;Fira Sans&quot;, Ubuntu, Oxygen, &quot;Oxygen Sans&quot;, Cantarell, &quot;Droid Sans&quot;, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Lucida Grande&quot;, Helvetica, Arial, sans-serif; font-size: 14px;\\">Fluency in Marathi &amp; English preferred</span>","qualifications":"Postgraduate in Education, Social Work, or related field\\n10–12 years of program management experience\\nStrong leadership, analytical, and budgeting skills\\nFluency in Marathi & English preferred","role_category":"Fundraising & Partnerships","employment_type":"Full-time","experience_min":10,"salary_currency":"INR","salary_value":"12222221.98","salary_unit_text":"YEAR","date_posted":"2025-07-14T18:30:00.000Z","valid_through":"2025-07-29T18:30:00.000Z","is_active":true,"created_at":"2025-07-15T12:46:44.412Z","updated_at":"2025-07-15T12:46:44.412Z","how_to_apply":"<span style=\\"white-space-collapse: collapse; color: rgba(0, 0, 0, 0.9); font-family: -apple-system, system-ui, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, &quot;Fira Sans&quot;, Ubuntu, Oxygen, &quot;Oxygen Sans&quot;, Cantarell, &quot;Droid Sans&quot;, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Lucida Grande&quot;, Helvetica, Arial, sans-serif; font-size: 14px;\\">📩 Apply Now:</span><span class=\\"white-space-pre\\" style=\\"box-sizing: inherit; border-style: none; border-color: rgba(0, 0, 0, 0.9); border-image: none 100% / 1 / 0 stretch; font-size: 14px; vertical-align: baseline; background-image: none; background-position: 0% 0%; background-size: auto; background-repeat: repeat; background-attachment: scroll; background-origin: padding-box; background-clip: border-box; outline: rgba(0, 0, 0, 0.9) none 0px; font-family: -apple-system, system-ui, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, &quot;Fira Sans&quot;, Ubuntu, Oxygen, &quot;Oxygen Sans&quot;, Cantarell, &quot;Droid Sans&quot;, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Lucida Grande&quot;, Helvetica, Arial, sans-serif; color: rgba(0, 0, 0, 0.9); text-wrap-mode: nowrap !important; line-height: inherit !important;\\"> </span><a class=\\"cWZyzrGsTDzyVImkoTAmsQWSxoiLMowIPnLKJKLc \\" target=\\"_self\\" tabindex=\\"0\\" href=\\"mailto:hiringllf@learninglinksindia.org\\" data-test-app-aware-link=\\"\\" style=\\"box-sizing: inherit; border-style: none; border-color: rgb(10, 102, 194); border-image: none 100% / 1 / 0 stretch; color: rgb(10, 102, 194); text-decoration: none solid rgb(10, 102, 194); white-space-collapse: collapse; font-size: 14px; vertical-align: baseline; background-image: none; background-position: 0% 0%; background-size: auto; background-repeat: repeat; background-attachment: scroll; background-origin: padding-box; background-clip: border-box; font-weight: 600; font-family: -apple-system, system-ui, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, &quot;Fira Sans&quot;, Ubuntu, Oxygen, &quot;Oxygen Sans&quot;, Cantarell, &quot;Droid Sans&quot;, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Lucida Grande&quot;, Helvetica, Arial, sans-serif; touch-action: manipulation; position: relative; word-break: normal; overflow-wrap: normal; line-height: inherit !important;\\">hiringllf@learninglinksindia.org</a><span style=\\"box-sizing: inherit; border-style: none; border-color: rgba(0, 0, 0, 0.9); border-image: none 100% / 1 / 0 stretch; white-space-collapse: collapse; font-size: 14px; vertical-align: baseline; background-image: none; background-position: 0% 0%; background-size: auto; background-repeat: repeat; background-attachment: scroll; background-origin: padding-box; background-clip: border-box; outline: rgba(0, 0, 0, 0.9) none 0px; font-family: -apple-system, system-ui, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, &quot;Fira Sans&quot;, Ubuntu, Oxygen, &quot;Oxygen Sans&quot;, Cantarell, &quot;Droid Sans&quot;, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Lucida Grande&quot;, Helvetica, Arial, sans-serif; color: rgba(0, 0, 0, 0.9); line-height: inherit !important;\\"><br style=\\"box-sizing: inherit; line-height: inherit !important;\\"></span><span style=\\"white-space-collapse: collapse; color: rgba(0, 0, 0, 0.9); font-family: -apple-system, system-ui, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, &quot;Fira Sans&quot;, Ubuntu, Oxygen, &quot;Oxygen Sans&quot;, Cantarell, &quot;Droid Sans&quot;, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Lucida Grande&quot;, Helvetica, Arial, sans-serif; font-size: 14px;\\">If you're ready to lead change at the grassroots level, we want to hear from you!</span>","organization":"Learning Links Foundation","organization_type":"We inspire true learning from an early age and create links to enable learning across different stages of life.","location_id":null,"country":"India","state":"Maharashtra","city":"Palghar","pin_code":"343434","street_address":"sdwdwd","applylink":"https://www.linkedin.com/posts/twinkleb_hiring-programmanager-socialimpactjobs-activity-7350766075669622785-RWkg?utm_source=share&utm_medium=member_desktop&rcm=ACoAADDWBnIBERU7-ezbiP-fUO0gg3-abOorUmc","employer_id":null,"user_id":null,"featured":false,"education_required":null,"organization_logo":null}	job	628ad2b3-5f7a-426a-85d4-392126a77c54	\N
9145fc65-5e1f-4458-8a82-7b85d37a067f	Program Manager	employer	2025-07-15 18:59:47.020712+05:30	f	{"id":"760de787-8564-49bc-8f28-94349b18fd14","title":"Program Manager","slug":"program-manager-asdfasdf-karnataka","description":"<span style=\\"white-space-collapse: collapse; color: rgba(0, 0, 0, 0.9); font-family: -apple-system, system-ui, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, &quot;Fira Sans&quot;, Ubuntu, Oxygen, &quot;Oxygen Sans&quot;, Cantarell, &quot;Droid Sans&quot;, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Lucida Grande&quot;, Helvetica, Arial, sans-serif; font-size: 14px;\\">Learning Links Foundation is looking for an experienced Program Manager to lead our Holistic Development Program. This is a unique opportunity to drive meaningful impact in education by managing school-based programs and engaging with communities and donors.</span><span style=\\"box-sizing: inherit; border-style: none; border-color: rgba(0, 0, 0, 0.9); border-image: none 100% / 1 / 0 stretch; white-space-collapse: collapse; font-size: 14px; vertical-align: baseline; background-image: none; background-position: 0% 0%; background-size: auto; background-repeat: repeat; background-attachment: scroll; background-origin: padding-box; background-clip: border-box; outline: rgba(0, 0, 0, 0.9) none 0px; font-family: -apple-system, system-ui, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, &quot;Fira Sans&quot;, Ubuntu, Oxygen, &quot;Oxygen Sans&quot;, Cantarell, &quot;Droid Sans&quot;, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Lucida Grande&quot;, Helvetica, Arial, sans-serif; color: rgba(0, 0, 0, 0.9); line-height: inherit !important;\\"><br style=\\"box-sizing: inherit; line-height: inherit !important;\\"></span><span style=\\"white-space-collapse: collapse; color: rgba(0, 0, 0, 0.9); font-family: -apple-system, system-ui, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, &quot;Fira Sans&quot;, Ubuntu, Oxygen, &quot;Oxygen Sans&quot;, Cantarell, &quot;Droid Sans&quot;, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Lucida Grande&quot;, Helvetica, Arial, sans-serif; font-size: 14px;\\">🎯 Key Responsibilities:</span><span style=\\"box-sizing: inherit; border-style: none; border-color: rgba(0, 0, 0, 0.9); border-image: none 100% / 1 / 0 stretch; white-space-collapse: collapse; font-size: 14px; vertical-align: baseline; background-image: none; background-position: 0% 0%; background-size: auto; background-repeat: repeat; background-attachment: scroll; background-origin: padding-box; background-clip: border-box; outline: rgba(0, 0, 0, 0.9) none 0px; font-family: -apple-system, system-ui, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, &quot;Fira Sans&quot;, Ubuntu, Oxygen, &quot;Oxygen Sans&quot;, Cantarell, &quot;Droid Sans&quot;, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Lucida Grande&quot;, Helvetica, Arial, sans-serif; color: rgba(0, 0, 0, 0.9); line-height: inherit !important;\\"><br style=\\"box-sizing: inherit; line-height: inherit !important;\\"></span><span style=\\"white-space-collapse: collapse; color: rgba(0, 0, 0, 0.9); font-family: -apple-system, system-ui, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, &quot;Fira Sans&quot;, Ubuntu, Oxygen, &quot;Oxygen Sans&quot;, Cantarell, &quot;Droid Sans&quot;, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Lucida Grande&quot;, Helvetica, Arial, sans-serif; font-size: 14px;\\">Lead and manage program execution across schools</span><span style=\\"box-sizing: inherit; border-style: none; border-color: rgba(0, 0, 0, 0.9); border-image: none 100% / 1 / 0 stretch; white-space-collapse: collapse; font-size: 14px; vertical-align: baseline; background-image: none; background-position: 0% 0%; background-size: auto; background-repeat: repeat; background-attachment: scroll; background-origin: padding-box; background-clip: border-box; outline: rgba(0, 0, 0, 0.9) none 0px; font-family: -apple-system, system-ui, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, &quot;Fira Sans&quot;, Ubuntu, Oxygen, &quot;Oxygen Sans&quot;, Cantarell, &quot;Droid Sans&quot;, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Lucida Grande&quot;, Helvetica, Arial, sans-serif; color: rgba(0, 0, 0, 0.9); line-height: inherit !important;\\"><br style=\\"box-sizing: inherit; line-height: inherit !important;\\"></span><span style=\\"white-space-collapse: collapse; color: rgba(0, 0, 0, 0.9); font-family: -apple-system, system-ui, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, &quot;Fira Sans&quot;, Ubuntu, Oxygen, &quot;Oxygen Sans&quot;, Cantarell, &quot;Droid Sans&quot;, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Lucida Grande&quot;, Helvetica, Arial, sans-serif; font-size: 14px;\\">Supervise field teams and ensure quality delivery</span><span style=\\"box-sizing: inherit; border-style: none; border-color: rgba(0, 0, 0, 0.9); border-image: none 100% / 1 / 0 stretch; white-space-collapse: collapse; font-size: 14px; vertical-align: baseline; background-image: none; background-position: 0% 0%; background-size: auto; background-repeat: repeat; background-attachment: scroll; background-origin: padding-box; background-clip: border-box; outline: rgba(0, 0, 0, 0.9) none 0px; font-family: -apple-system, system-ui, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, &quot;Fira Sans&quot;, Ubuntu, Oxygen, &quot;Oxygen Sans&quot;, Cantarell, &quot;Droid Sans&quot;, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Lucida Grande&quot;, Helvetica, Arial, sans-serif; color: rgba(0, 0, 0, 0.9); line-height: inherit !important;\\"><br style=\\"box-sizing: inherit; line-height: inherit !important;\\"></span><span style=\\"white-space-collapse: collapse; color: rgba(0, 0, 0, 0.9); font-family: -apple-system, system-ui, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, &quot;Fira Sans&quot;, Ubuntu, Oxygen, &quot;Oxygen Sans&quot;, Cantarell, &quot;Droid Sans&quot;, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Lucida Grande&quot;, Helvetica, Arial, sans-serif; font-size: 14px;\\">Handle budgeting, planning, and fund utilization</span><span style=\\"box-sizing: inherit; border-style: none; border-color: rgba(0, 0, 0, 0.9); border-image: none 100% / 1 / 0 stretch; white-space-collapse: collapse; font-size: 14px; vertical-align: baseline; background-image: none; background-position: 0% 0%; background-size: auto; background-repeat: repeat; background-attachment: scroll; background-origin: padding-box; background-clip: border-box; outline: rgba(0, 0, 0, 0.9) none 0px; font-family: -apple-system, system-ui, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, &quot;Fira Sans&quot;, Ubuntu, Oxygen, &quot;Oxygen Sans&quot;, Cantarell, &quot;Droid Sans&quot;, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Lucida Grande&quot;, Helvetica, Arial, sans-serif; color: rgba(0, 0, 0, 0.9); line-height: inherit !important;\\"><br style=\\"box-sizing: inherit; line-height: inherit !important;\\"></span><span style=\\"white-space-collapse: collapse; color: rgba(0, 0, 0, 0.9); font-family: -apple-system, system-ui, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, &quot;Fira Sans&quot;, Ubuntu, Oxygen, &quot;Oxygen Sans&quot;, Cantarell, &quot;Droid Sans&quot;, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Lucida Grande&quot;, Helvetica, Arial, sans-serif; font-size: 14px;\\">Coordinate with donors, schools, and internal teams</span><span style=\\"box-sizing: inherit; border-style: none; border-color: rgba(0, 0, 0, 0.9); border-image: none 100% / 1 / 0 stretch; white-space-collapse: collapse; font-size: 14px; vertical-align: baseline; background-image: none; background-position: 0% 0%; background-size: auto; background-repeat: repeat; background-attachment: scroll; background-origin: padding-box; background-clip: border-box; outline: rgba(0, 0, 0, 0.9) none 0px; font-family: -apple-system, system-ui, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, &quot;Fira Sans&quot;, Ubuntu, Oxygen, &quot;Oxygen Sans&quot;, Cantarell, &quot;Droid Sans&quot;, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Lucida Grande&quot;, Helvetica, Arial, sans-serif; color: rgba(0, 0, 0, 0.9); line-height: inherit !important;\\"><br style=\\"box-sizing: inherit; line-height: inherit !important;\\"></span><span style=\\"white-space-collapse: collapse; color: rgba(0, 0, 0, 0.9); font-family: -apple-system, system-ui, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, &quot;Fira Sans&quot;, Ubuntu, Oxygen, &quot;Oxygen Sans&quot;, Cantarell, &quot;Droid Sans&quot;, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Lucida Grande&quot;, Helvetica, Arial, sans-serif; font-size: 14px;\\">Monitor progress through evaluations and field visits</span><span style=\\"box-sizing: inherit; border-style: none; border-color: rgba(0, 0, 0, 0.9); border-image: none 100% / 1 / 0 stretch; white-space-collapse: collapse; font-size: 14px; vertical-align: baseline; background-image: none; background-position: 0% 0%; background-size: auto; background-repeat: repeat; background-attachment: scroll; background-origin: padding-box; background-clip: border-box; outline: rgba(0, 0, 0, 0.9) none 0px; font-family: -apple-system, system-ui, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, &quot;Fira Sans&quot;, Ubuntu, Oxygen, &quot;Oxygen Sans&quot;, Cantarell, &quot;Droid Sans&quot;, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Lucida Grande&quot;, Helvetica, Arial, sans-serif; color: rgba(0, 0, 0, 0.9); line-height: inherit !important;\\"><br style=\\"box-sizing: inherit; line-height: inherit !important;\\"></span><span style=\\"white-space-collapse: collapse; color: rgba(0, 0, 0, 0.9); font-family: -apple-system, system-ui, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, &quot;Fira Sans&quot;, Ubuntu, Oxygen, &quot;Oxygen Sans&quot;, Cantarell, &quot;Droid Sans&quot;, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Lucida Grande&quot;, Helvetica, Arial, sans-serif; font-size: 14px;\\">🎓 Qualifications:</span><span style=\\"box-sizing: inherit; border-style: none; border-color: rgba(0, 0, 0, 0.9); border-image: none 100% / 1 / 0 stretch; white-space-collapse: collapse; font-size: 14px; vertical-align: baseline; background-image: none; background-position: 0% 0%; background-size: auto; background-repeat: repeat; background-attachment: scroll; background-origin: padding-box; background-clip: border-box; outline: rgba(0, 0, 0, 0.9) none 0px; font-family: -apple-system, system-ui, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, &quot;Fira Sans&quot;, Ubuntu, Oxygen, &quot;Oxygen Sans&quot;, Cantarell, &quot;Droid Sans&quot;, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Lucida Grande&quot;, Helvetica, Arial, sans-serif; color: rgba(0, 0, 0, 0.9); line-height: inherit !important;\\"><br style=\\"box-sizing: inherit; line-height: inherit !important;\\"></span><span style=\\"white-space-collapse: collapse; color: rgba(0, 0, 0, 0.9); font-family: -apple-system, system-ui, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, &quot;Fira Sans&quot;, Ubuntu, Oxygen, &quot;Oxygen Sans&quot;, Cantarell, &quot;Droid Sans&quot;, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Lucida Grande&quot;, Helvetica, Arial, sans-serif; font-size: 14px;\\">Postgraduate in Education, Social Work, or related field</span><span style=\\"box-sizing: inherit; border-style: none; border-color: rgba(0, 0, 0, 0.9); border-image: none 100% / 1 / 0 stretch; white-space-collapse: collapse; font-size: 14px; vertical-align: baseline; background-image: none; background-position: 0% 0%; background-size: auto; background-repeat: repeat; background-attachment: scroll; background-origin: padding-box; background-clip: border-box; outline: rgba(0, 0, 0, 0.9) none 0px; font-family: -apple-system, system-ui, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, &quot;Fira Sans&quot;, Ubuntu, Oxygen, &quot;Oxygen Sans&quot;, Cantarell, &quot;Droid Sans&quot;, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Lucida Grande&quot;, Helvetica, Arial, sans-serif; color: rgba(0, 0, 0, 0.9); line-height: inherit !important;\\"><br style=\\"box-sizing: inherit; line-height: inherit !important;\\"></span><span style=\\"white-space-collapse: collapse; color: rgba(0, 0, 0, 0.9); font-family: -apple-system, system-ui, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, &quot;Fira Sans&quot;, Ubuntu, Oxygen, &quot;Oxygen Sans&quot;, Cantarell, &quot;Droid Sans&quot;, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Lucida Grande&quot;, Helvetica, Arial, sans-serif; font-size: 14px;\\">10–12 years of program management experience</span><span style=\\"box-sizing: inherit; border-style: none; border-color: rgba(0, 0, 0, 0.9); border-image: none 100% / 1 / 0 stretch; white-space-collapse: collapse; font-size: 14px; vertical-align: baseline; background-image: none; background-position: 0% 0%; background-size: auto; background-repeat: repeat; background-attachment: scroll; background-origin: padding-box; background-clip: border-box; outline: rgba(0, 0, 0, 0.9) none 0px; font-family: -apple-system, system-ui, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, &quot;Fira Sans&quot;, Ubuntu, Oxygen, &quot;Oxygen Sans&quot;, Cantarell, &quot;Droid Sans&quot;, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Lucida Grande&quot;, Helvetica, Arial, sans-serif; color: rgba(0, 0, 0, 0.9); line-height: inherit !important;\\"><br style=\\"box-sizing: inherit; line-height: inherit !important;\\"></span><span style=\\"white-space-collapse: collapse; color: rgba(0, 0, 0, 0.9); font-family: -apple-system, system-ui, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, &quot;Fira Sans&quot;, Ubuntu, Oxygen, &quot;Oxygen Sans&quot;, Cantarell, &quot;Droid Sans&quot;, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Lucida Grande&quot;, Helvetica, Arial, sans-serif; font-size: 14px;\\">Strong leadership, analytical, and budgeting skills</span><span style=\\"box-sizing: inherit; border-style: none; border-color: rgba(0, 0, 0, 0.9); border-image: none 100% / 1 / 0 stretch; white-space-collapse: collapse; font-size: 14px; vertical-align: baseline; background-image: none; background-position: 0% 0%; background-size: auto; background-repeat: repeat; background-attachment: scroll; background-origin: padding-box; background-clip: border-box; outline: rgba(0, 0, 0, 0.9) none 0px; font-family: -apple-system, system-ui, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, &quot;Fira Sans&quot;, Ubuntu, Oxygen, &quot;Oxygen Sans&quot;, Cantarell, &quot;Droid Sans&quot;, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Lucida Grande&quot;, Helvetica, Arial, sans-serif; color: rgba(0, 0, 0, 0.9); line-height: inherit !important;\\"><br style=\\"box-sizing: inherit; line-height: inherit !important;\\"></span><span style=\\"white-space-collapse: collapse; color: rgba(0, 0, 0, 0.9); font-family: -apple-system, system-ui, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, &quot;Fira Sans&quot;, Ubuntu, Oxygen, &quot;Oxygen Sans&quot;, Cantarell, &quot;Droid Sans&quot;, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Lucida Grande&quot;, Helvetica, Arial, sans-serif; font-size: 14px;\\">Fluency in Marathi &amp; English preferred</span>","qualifications":"Postgraduate in Education, Social Work, or related field\\n10–12 years of program management experience\\nStrong leadership, analytical, and budgeting skills\\nFluency in Marathi & English preferred","role_category":"Human Rights","employment_type":"Full-time","experience_min":2,"salary_currency":"INR","salary_value":"12222221.98","salary_unit_text":"YEAR","date_posted":"2025-10-10T18:30:00.000Z","valid_through":"2025-11-10T18:30:00.000Z","is_active":true,"created_at":"2025-07-15T13:29:46.884Z","updated_at":"2025-07-15T13:29:46.884Z","how_to_apply":"<span style=\\"white-space-collapse: collapse; color: rgba(0, 0, 0, 0.9); font-family: -apple-system, system-ui, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, &quot;Fira Sans&quot;, Ubuntu, Oxygen, &quot;Oxygen Sans&quot;, Cantarell, &quot;Droid Sans&quot;, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Lucida Grande&quot;, Helvetica, Arial, sans-serif; font-size: 14px;\\">📩 Apply Now:</span><span class=\\"white-space-pre\\" style=\\"box-sizing: inherit; border-style: none; border-color: rgba(0, 0, 0, 0.9); border-image: none 100% / 1 / 0 stretch; font-size: 14px; vertical-align: baseline; background-image: none; background-position: 0% 0%; background-size: auto; background-repeat: repeat; background-attachment: scroll; background-origin: padding-box; background-clip: border-box; outline: rgba(0, 0, 0, 0.9) none 0px; font-family: -apple-system, system-ui, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, &quot;Fira Sans&quot;, Ubuntu, Oxygen, &quot;Oxygen Sans&quot;, Cantarell, &quot;Droid Sans&quot;, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Lucida Grande&quot;, Helvetica, Arial, sans-serif; color: rgba(0, 0, 0, 0.9); text-wrap-mode: nowrap !important; line-height: inherit !important;\\"> </span><a class=\\"cWZyzrGsTDzyVImkoTAmsQWSxoiLMowIPnLKJKLc \\" target=\\"_self\\" tabindex=\\"0\\" href=\\"mailto:hiringllf@learninglinksindia.org\\" data-test-app-aware-link=\\"\\" style=\\"box-sizing: inherit; border-style: none; border-color: rgb(10, 102, 194); border-image: none 100% / 1 / 0 stretch; color: rgb(10, 102, 194); text-decoration: none solid rgb(10, 102, 194); white-space-collapse: collapse; font-size: 14px; vertical-align: baseline; background-image: none; background-position: 0% 0%; background-size: auto; background-repeat: repeat; background-attachment: scroll; background-origin: padding-box; background-clip: border-box; font-weight: 600; font-family: -apple-system, system-ui, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, &quot;Fira Sans&quot;, Ubuntu, Oxygen, &quot;Oxygen Sans&quot;, Cantarell, &quot;Droid Sans&quot;, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Lucida Grande&quot;, Helvetica, Arial, sans-serif; touch-action: manipulation; position: relative; word-break: normal; overflow-wrap: normal; line-height: inherit !important;\\">hiringllf@learninglinksindia.org</a><span style=\\"box-sizing: inherit; border-style: none; border-color: rgba(0, 0, 0, 0.9); border-image: none 100% / 1 / 0 stretch; white-space-collapse: collapse; font-size: 14px; vertical-align: baseline; background-image: none; background-position: 0% 0%; background-size: auto; background-repeat: repeat; background-attachment: scroll; background-origin: padding-box; background-clip: border-box; outline: rgba(0, 0, 0, 0.9) none 0px; font-family: -apple-system, system-ui, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, &quot;Fira Sans&quot;, Ubuntu, Oxygen, &quot;Oxygen Sans&quot;, Cantarell, &quot;Droid Sans&quot;, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Lucida Grande&quot;, Helvetica, Arial, sans-serif; color: rgba(0, 0, 0, 0.9); line-height: inherit !important;\\"><br style=\\"box-sizing: inherit; line-height: inherit !important;\\"></span><span style=\\"white-space-collapse: collapse; color: rgba(0, 0, 0, 0.9); font-family: -apple-system, system-ui, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, &quot;Fira Sans&quot;, Ubuntu, Oxygen, &quot;Oxygen Sans&quot;, Cantarell, &quot;Droid Sans&quot;, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Lucida Grande&quot;, Helvetica, Arial, sans-serif; font-size: 14px;\\">If you're ready to lead change at the grassroots level, we want to hear from you!</span>","organization":"Learning Links Foundation","organization_type":"We inspire true learning from an early age and create links to enable learning across different stages of life.","location_id":null,"country":"India","state":"Karnataka","city":"asdfasdf","pin_code":"234234","street_address":"23423423","applylink":"https://www.linkedin.com/posts/twinkleb_hiring-programmanager-socialimpactjobs-activity-7350766075669622785-RWkg?utm_source=share&utm_medium=member_desktop&rcm=ACoAADDWBnIBERU7-ezbiP-fUO0gg3-abOorUmc","employer_id":null,"user_id":null,"featured":false,"education_required":null,"organization_logo":null}	job	760de787-8564-49bc-8f28-94349b18fd14	\N
3f8c4ba7-fe1d-48d6-94e5-84557dfd96c8	test231	employer	2025-07-26 20:39:53.070552+05:30	f	{"id":"1527a760-d64f-4d68-8454-f898633ecf09","title":"test231","slug":"test231","description":"<div><br></div>","qualifications":"","role_category":"Health","employment_type":"Part-time","experience_min":null,"salary_currency":"INR","salary_value":null,"salary_unit_text":"YEAR","date_posted":"1111-11-10T18:06:32.000Z","valid_through":"1111-11-10T18:06:32.000Z","is_active":false,"created_at":"2025-07-26T15:09:53.020Z","updated_at":"2025-07-26T15:09:53.020Z","how_to_apply":null,"organization":"ADKHASKJHD","organization_type":"","location_id":null,"country":"India","state":"","city":"","pin_code":"","street_address":"","applylink":"","employer_id":null,"user_id":null,"featured":false,"education_required":null,"organization_logo":null}	job	1527a760-d64f-4d68-8454-f898633ecf09	\N
b4a595ad-1e91-4487-8b40-571a4ba51662	TEST	super_admin	2025-08-03 21:18:28.903749+05:30	f	{"id":"444d27fe-19b7-46e1-b330-435f11a9fb45","title":"TEST","organizer":"asddas","type":"","mode":"","location":"Karnataka","start_date":"1111-11-10T18:06:32.000Z","end_date":"1111-11-10T18:06:32.000Z","link":"https://www.apple.com/in/store?afid=p240%7Cgo~cmp-11116556120~adg-179254536873~ad-758844117495_kwd-10778630~dev-c~ext-~prd-~mca-~nt-search&cid=aos-in-kwgo-brand--","email":"user@cadratec.com","poster_url":null,"description":"afddafs","tags":"adf","created_at":"2025-08-03T15:48:28.899Z","updated_at":"2025-08-03T15:48:28.899Z","start_time":null,"end_time":null,"owner_id":"cb1e08b4-c87e-4bcb-809d-e8b1e2a9b666","user_role":"super_admin"}	event	444d27fe-19b7-46e1-b330-435f11a9fb45	cb1e08b4-c87e-4bcb-809d-e8b1e2a9b666
093d8908-dc81-4c02-b00d-252a56b2dc03	TEST-IN	employer	2025-08-25 20:46:15.484891+05:30	f	{"id":"1a416b9c-c5d7-45f9-a587-b196188fcf34","title":"TEST-IN","slug":"test-in-bangalore-karnataka","description":"sad","qualifications":"sad","role_category":"Education","employment_type":"Full-time","experience_min":1,"salary_currency":"INR","salary_value":"234234.00","salary_unit_text":"HOUR","date_posted":"2025-08-24T18:30:00.000Z","valid_through":"2025-08-24T18:30:00.000Z","is_active":true,"created_at":"2025-08-25T15:16:15.437Z","updated_at":"2025-08-25T15:16:15.437Z","how_to_apply":"sad","organization":"TEST","organization_type":"FASDF","location_id":null,"country":"India","state":"Karnataka","city":"Bangalore","pin_code":"234234","street_address":"23423423","applylink":null,"employer_id":"7b6d7b54-3794-43f6-8ed1-45159a8c0160","user_id":"7b6d7b54-3794-43f6-8ed1-45159a8c0160","featured":false,"education_required":"asd","organization_logo":null}	job	1a416b9c-c5d7-45f9-a587-b196188fcf34	7b6d7b54-3794-43f6-8ed1-45159a8c0160
b127d43b-2373-40ac-a61f-636d906bf5d3	TEST-IN2	employer	2025-08-25 21:37:22.999042+05:30	f	{"id":"f1a383d3-f1b6-462d-973b-a8687fa948e0","title":"TEST-IN2","slug":"test-in2-bangalore-karnataka","description":"AA","qualifications":"AA","role_category":"Health","employment_type":"Full-time","experience_min":1,"salary_currency":"INR","salary_value":"1.00","salary_unit_text":"YEAR","date_posted":"2025-08-24T18:30:00.000Z","valid_through":"2025-08-24T18:30:00.000Z","is_active":true,"created_at":"2025-08-25T16:07:22.951Z","updated_at":"2025-08-25T16:07:22.951Z","how_to_apply":"AA","organization":"TEST","organization_type":"FASDF","location_id":null,"country":"India","state":"Karnataka","city":"Bangalore","pin_code":"234234","street_address":"23423423","applylink":null,"employer_id":"de9ba50f-cb0c-44df-8306-ed2c06fb8df1","user_id":"de9ba50f-cb0c-44df-8306-ed2c06fb8df1","featured":false,"education_required":"A","organization_logo":null}	job	f1a383d3-f1b6-462d-973b-a8687fa948e0	de9ba50f-cb0c-44df-8306-ed2c06fb8df1
cfdb5d60-7584-4eff-a416-938dd74eb97e	TESTJOB1234	employer	2026-04-03 18:41:00.817991+05:30	f	{"id":"f3716cf7-704c-4b82-81f4-c2f97bee81fc","title":"TESTJOB1234","slug":"testjob1234-pune-mumbai","description":"dfasdf","qualifications":"2321","role_category":"Administrative & Operations","employment_type":"Part-time","experience_min":23,"salary_currency":"INR","salary_value":"31321.00","salary_unit_text":"YEAR","date_posted":"2026-04-21T18:30:00.000Z","valid_through":"2026-04-29T18:30:00.000Z","is_active":true,"created_at":"2026-04-03T13:11:00.626Z","updated_at":"2026-04-03T13:11:00.626Z","how_to_apply":"asdffsda","organization":"sgdsgsdgsdgsdfgdsfg","organization_type":"dafsdfgsagasdg","location_id":null,"country":"India","state":"Mumbai","city":"Pune","pin_code":"854848","street_address":"skljddfhkjshfkjladfsfsd","applylink":"asfas","employer_id":null,"user_id":null,"featured":true,"education_required":null,"organization_logo":null}	job	f3716cf7-704c-4b82-81f4-c2f97bee81fc	\N
e6338695-8410-41f4-aa4e-9029edca7908	TEST	employer	2026-04-04 04:10:50.351444+05:30	f	{"id":"4295e110-4c9d-4269-b751-44128104a6b0","title":"TEST","organization":"TEST","type":"Proposal","sector":"Education","eligible":"Start","amount":"65464646","deadline":"2026-09-30T18:30:00.000Z","link":"http://localhost:3000/","rfp_url":null,"description":"TEST","tags":"education","status":"Published","featured":true,"created_at":"2026-04-03T22:40:50.339Z","updated_at":"2026-04-03T22:40:50.339Z","employer_id":"cb1e08b4-c87e-4bcb-809d-e8b1e2a9b666"}	grant	4295e110-4c9d-4269-b751-44128104a6b0	cb1e08b4-c87e-4bcb-809d-e8b1e2a9b666
829e41b4-d562-4bb5-b401-bec0f2aaced8	TEST56	super_admin	2026-04-04 04:14:18.118592+05:30	f	{"id":"d5b292e5-b784-42aa-aca9-a3aa06ce332b","title":"TEST56","organizer":"TEST56","type":"Conference","mode":"Online","location":"Ranchi","start_date":"2026-05-10T18:30:00.000Z","end_date":"2026-06-10T18:30:00.000Z","link":"http://localhost:3000/","email":"demo@example.com","poster_url":null,"description":"TEST56","tags":"education","created_at":"2026-04-03T22:44:18.116Z","updated_at":"2026-04-03T22:44:18.116Z","start_time":null,"end_time":null,"owner_id":"cb1e08b4-c87e-4bcb-809d-e8b1e2a9b666","user_role":"super_admin"}	event	d5b292e5-b784-42aa-aca9-a3aa06ce332b	cb1e08b4-c87e-4bcb-809d-e8b1e2a9b666
664b96de-2570-452b-9225-a211af48a916	TEAT	employer	2026-04-06 16:20:24.115134+05:30	f	{"id":"e0eb5f0a-7fe9-487f-b5e3-f817ae634d3e","title":"TEAT","slug":"teat-pune-mumbai","description":"TEAT","qualifications":"TEAT","role_category":"Health","employment_type":"Full-time","experience_min":25,"salary_currency":"INR","salary_value":"8768767.00","salary_unit_text":"YEAR","date_posted":"2026-11-10T18:30:00.000Z","valid_through":"2026-12-13T18:30:00.000Z","is_active":true,"created_at":"2026-04-06T10:50:23.919Z","updated_at":"2026-04-06T10:50:23.919Z","how_to_apply":"TEAT","organization":"TEAT","organization_type":"TEAT","location_id":null,"country":"India","state":"Mumbai","city":"Pune","pin_code":"854848","street_address":"TEAT","applylink":"https://developmentwala.com/","employer_id":null,"user_id":null,"featured":true,"education_required":null,"organization_logo":null}	job	e0eb5f0a-7fe9-487f-b5e3-f817ae634d3e	\N
99922d7e-3eac-4557-af1d-f1ccf1c82f59	GRANTTT	employer	2026-04-06 18:02:10.238802+05:30	f	{"id":"a6f4abe9-daf2-4fad-9e11-decc5208f2c2","title":"GRANTTT","organization":"GRANTTT","type":"Proposal","sector":"Health","eligible":"GRANTTT","amount":"65464646","deadline":"2026-11-10T18:30:00.000Z","link":"http://localhost:3000/","rfp_url":null,"description":"GRANTTT","tags":"education","status":"Published","featured":true,"created_at":"2026-04-06T12:32:10.195Z","updated_at":"2026-04-06T12:32:10.195Z","employer_id":"cb1e08b4-c87e-4bcb-809d-e8b1e2a9b666"}	grant	a6f4abe9-daf2-4fad-9e11-decc5208f2c2	cb1e08b4-c87e-4bcb-809d-e8b1e2a9b666
14a03a9c-fd6e-4b22-bb5a-a081e1671ee9	EVENTT	super_admin	2026-04-06 18:11:36.805973+05:30	f	{"id":"98dbf8c3-1729-4e1a-855d-37fa51426650","title":"EVENTT","organizer":"EVENTT","type":"Conference","mode":"Online","location":"Ranchi","start_date":"2026-11-10T18:30:00.000Z","end_date":"2026-12-10T18:30:00.000Z","link":"http://localhost:3000/","email":"demo@example.com","poster_url":null,"description":"EVENTT","tags":"education","created_at":"2026-04-06T12:41:36.796Z","updated_at":"2026-04-06T12:41:36.796Z","start_time":null,"end_time":null,"owner_id":"cb1e08b4-c87e-4bcb-809d-e8b1e2a9b666","user_role":"super_admin"}	event	98dbf8c3-1729-4e1a-855d-37fa51426650	cb1e08b4-c87e-4bcb-809d-e8b1e2a9b666
5796d6b5-b587-43c6-970a-0432bb37371d	Jivan Sathi	employer	2026-04-07 23:09:09.163188+05:30	f	{"id":"38bd3575-42f0-4c9a-8b1c-5323ca0c027c","title":"Jivan Sathi","slug":"jivan-sathi-ranchi-jharkhand","description":"<ol><li><b><i><span style=\\"font-size: 12px;\\">TEST</span></i></b></li></ol>","qualifications":"TEST","role_category":"Livelihoods","employment_type":"Part-time","experience_min":18,"salary_currency":"INR","salary_value":"8118.00","salary_unit_text":"HOUR","date_posted":"2026-04-06T18:30:00.000Z","valid_through":"2026-11-10T18:30:00.000Z","is_active":true,"created_at":"2026-04-07T17:39:08.996Z","updated_at":"2026-04-07T17:39:08.996Z","how_to_apply":"TEST","organization":"Subhash Tech","organization_type":"NGO","location_id":null,"country":"India","state":"Jharkhand","city":"Ranchi","pin_code":"834001","street_address":"Bhursabad","applylink":"http://localhost:3000/","employer_id":"0a97935e-2381-43e9-ab4c-de4d0a182a41","user_id":"0a97935e-2381-43e9-ab4c-de4d0a182a41","featured":false,"education_required":"TEST","organization_logo":null}	job	38bd3575-42f0-4c9a-8b1c-5323ca0c027c	0a97935e-2381-43e9-ab4c-de4d0a182a41
\.


--
-- Data for Name: saved_jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.saved_jobs (id, user_id, job_id, saved_date, notes, created_at) FROM stdin;
\.


--
-- Data for Name: scholarships; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.scholarships (id, title, slug, description, eligibility, application_process, benefits, scholarship_type, field, level, country, state, city, remote, deadline, amount, currency, org_name, org_website, org_about, contact_name, contact_email, phone, featured, status, created_at, updated_at, employer_id) FROM stdin;
2	TWSTsch	TWSTsch	TWSTsch	TWSTsch	TWSTsch	TWSTsch	Merit-Based	IT	TWSTsch	India	Mumbai	Pune	f	2026-11-09	65464646.00	INR	TWSTsch	https://developmentwala.com/	TWSTsch	TWSTsch	sdfsdf@gmail.com	7061444969	t	Active	2026-04-06 19:58:39.853727	2026-04-06 20:06:05.198412	\N
\.


--
-- Data for Name: shortlists; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shortlists (id, employer_id, candidate_id, job_id, created_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, user_id, password, email, first_name, last_name, created_at, updated_at, role, is_active, profile_image) FROM stdin;
de9ba50f-cb0c-44df-8306-ed2c06fb8df1	employer1	employer123	employer1@example.com	Employer	One	2025-06-30 22:33:40.973966+05:30	2025-06-30 22:51:56.238101+05:30	employer	t	\N
7b6d7b54-3794-43f6-8ed1-45159a8c0160	candidate1	candidate123	candidate1@example.com	Candidate	One	2025-06-30 22:33:42.171074+05:30	2025-06-30 22:52:24.522597+05:30	candidate	t	\N
659877df-bbc9-495b-9d11-be9568fd22ca	employer2	password123	employer2@ngo.com	Humanitarian	Aid	2025-07-07 01:30:48.740779+05:30	2025-07-07 01:30:48.740779+05:30	employer	t	\N
e8b6e2cd-feff-4731-8944-660f798707c5	employer3	password123	employer3@ngo.com	Save	TheChildren	2025-07-07 01:30:48.740779+05:30	2025-07-07 01:30:48.740779+05:30	employer	t	\N
c71b82fc-dc51-4156-b558-ba5d54aedfb1	employer4	password123	employer4@ngo.com	UNICEF		2025-07-07 01:30:48.740779+05:30	2025-07-07 01:30:48.740779+05:30	employer	t	\N
39837196-95ef-468b-a8ac-efe4bcfd51e3	employer5	password123	employer5@ngo.com	Red	Cross	2025-07-07 01:30:48.740779+05:30	2025-07-07 01:30:48.740779+05:30	employer	t	\N
a871cff8-ece9-4397-9233-f3b356cc5ee2	employer6	password123	employer6@ngo.com	Plan	India	2025-07-07 01:30:48.740779+05:30	2025-07-07 01:30:48.740779+05:30	employer	t	\N
d9eeb145-145c-4bd5-871d-6f1213661d94	employer7	password123	employer7@ngo.com	Oxfam	India	2025-07-07 01:30:48.740779+05:30	2025-07-07 01:30:48.740779+05:30	employer	t	\N
6a5e9401-f69d-4b24-a755-9bd2b0323fdf	employer8	password123	employer8@ngo.com	CARE	India	2025-07-07 01:30:48.740779+05:30	2025-07-07 01:30:48.740779+05:30	employer	t	\N
6d87ca27-35f9-4590-b724-f5d71fa5c97c	employer9	password123	employer9@ngo.com	Smile	Foundation	2025-07-07 01:30:48.740779+05:30	2025-07-07 01:30:48.740779+05:30	employer	t	\N
b293898d-89aa-4b8e-8a29-22cc0b899e35	employer10	password123	employer10@ngo.com	Action	Aid	2025-07-07 01:30:48.740779+05:30	2025-07-07 01:30:48.740779+05:30	employer	t	\N
59325f02-7d3b-4443-821a-88da3e6e47ff	employer11	password123	employer11@ngo.com	Water	Aid	2025-07-07 01:30:48.740779+05:30	2025-07-07 01:30:48.740779+05:30	employer	t	\N
3958cab7-f927-4cf6-ab04-104d37506d48	employer12	password123	employer12@ngo.com	Room	toRead	2025-07-07 01:30:48.740779+05:30	2025-07-07 01:30:48.740779+05:30	employer	t	\N
2e21240c-63fe-47ad-8299-b619777a9b49	employer13	password123	employer13@ngo.com	Teach	ForIndia	2025-07-07 01:30:48.740779+05:30	2025-07-07 01:30:48.740779+05:30	employer	t	\N
a932b0b6-9d59-43ca-9b10-5a580c0623aa	employer14	password123	employer14@ngo.com	Goonj		2025-07-07 01:30:48.740779+05:30	2025-07-07 01:30:48.740779+05:30	employer	t	\N
c57fca29-266f-4a04-ae67-f05dea8cfd5c	employer15	password123	employer15@ngo.com	Pratham		2025-07-07 01:30:48.740779+05:30	2025-07-07 01:30:48.740779+05:30	employer	t	\N
e687382b-330b-4a64-8253-b7a491fdc960	employer16	password123	employer16@ngo.com	HelpAge	India	2025-07-07 01:30:48.740779+05:30	2025-07-07 01:30:48.740779+05:30	employer	t	\N
9c7da848-4f3f-447f-bfb8-5ff7bb6c7d03	employer17	password123	employer17@ngo.com	CRY		2025-07-07 01:30:48.740779+05:30	2025-07-07 01:30:48.740779+05:30	employer	t	\N
db36cedc-5387-4a70-977d-e168f3674782	employer18	password123	employer18@ngo.com	SEWA		2025-07-07 01:30:48.740779+05:30	2025-07-07 01:30:48.740779+05:30	employer	t	\N
ef65d9ed-e630-4a60-a70f-2473bbd0351e	employer19	password123	employer19@ngo.com	Akshaya	Patra	2025-07-07 01:30:48.740779+05:30	2025-07-07 01:30:48.740779+05:30	employer	t	\N
79830729-b721-44d1-80db-0528fcd1a51d	employer20	password123	employer20@ngo.com	Magic	Bus	2025-07-07 01:30:48.740779+05:30	2025-07-07 01:30:48.740779+05:30	employer	t	\N
1cf2ae49-92a0-45d7-aa75-9ca0c98488f1	employer21	password123	employer21@ngo.com	Doctors	WithoutBorders	2025-07-07 01:30:48.740779+05:30	2025-07-07 01:30:48.740779+05:30	employer	t	\N
e8bf4cee-d7ed-410d-b755-eaf56392d097	employer22	password123	employer22@ngo.com	World	Vision	2025-07-07 01:30:48.740779+05:30	2025-07-07 01:30:48.740779+05:30	employer	t	\N
c13b3566-1596-4b49-9886-3cd0ad0df650	employer23	password123	employer23@ngo.com	CARE	International	2025-07-07 01:30:48.740779+05:30	2025-07-07 01:30:48.740779+05:30	employer	t	\N
d3716959-814f-48f2-b766-88d9057129a1	employer24	password123	employer24@ngo.com	Save	Earth	2025-07-07 01:30:48.740779+05:30	2025-07-07 01:30:48.740779+05:30	employer	t	\N
98a0fb34-c231-42f0-a923-3661ff1b4222	employer25	password123	employer25@ngo.com	Greenpeace		2025-07-07 01:30:48.740779+05:30	2025-07-07 01:30:48.740779+05:30	employer	t	\N
72b7c2d3-10d8-4848-8551-ae1f242ab89c	employer26	password123	employer26@ngo.com	WWF	India	2025-07-07 01:30:48.740779+05:30	2025-07-07 01:30:48.740779+05:30	employer	t	\N
3dbb67ab-bf4a-49b6-8bf5-b8ea8d34328b	employer27	password123	employer27@ngo.com	SOS	Children	2025-07-07 01:30:48.740779+05:30	2025-07-07 01:30:48.740779+05:30	employer	t	\N
ee1c5f9c-7fe2-4cd1-a889-9f3720a1e78c	employer28	password123	employer28@ngo.com	Child	Rights	2025-07-07 01:30:48.740779+05:30	2025-07-07 01:30:48.740779+05:30	employer	t	\N
4a0dc5b3-d7cc-4a61-81d8-d218cbbaa633	employer29	password123	employer29@ngo.com	Smile	Train	2025-07-07 01:30:48.740779+05:30	2025-07-07 01:30:48.740779+05:30	employer	t	\N
af4e981a-9286-4646-a265-5569d00686cf	employer30	password123	employer30@ngo.com	Give	India	2025-07-07 01:30:48.740779+05:30	2025-07-07 01:30:48.740779+05:30	employer	t	\N
0b03bcfd-48eb-4e06-9442-01189bec474b	candidate2	password123	candidate2@ngo.com	Priya	Singh	2025-07-07 01:31:12.255286+05:30	2025-07-07 01:31:12.255286+05:30	candidate	t	\N
c11a148e-33b1-49ad-b80b-633779de2598	candidate3	password123	candidate3@ngo.com	Rahul	Verma	2025-07-07 01:31:12.255286+05:30	2025-07-07 01:31:12.255286+05:30	candidate	t	\N
66b234d8-cacc-4de6-a1f2-86d05a8fbb75	candidate4	password123	candidate4@ngo.com	Sneha	Patel	2025-07-07 01:31:12.255286+05:30	2025-07-07 01:31:12.255286+05:30	candidate	t	\N
c4bad550-a44b-4f03-af09-01bad017d781	candidate5	password123	candidate5@ngo.com	Vikram	Rao	2025-07-07 01:31:12.255286+05:30	2025-07-07 01:31:12.255286+05:30	candidate	t	\N
6999cc4c-ca42-4116-bda3-c566e4013b71	candidate6	password123	candidate6@ngo.com	Anjali	Mehta	2025-07-07 01:31:12.255286+05:30	2025-07-07 01:31:12.255286+05:30	candidate	t	\N
f45f3d50-26b3-4c19-9d36-9874a761749e	candidate7	password123	candidate7@ngo.com	Rohit	Sinha	2025-07-07 01:31:12.255286+05:30	2025-07-07 01:31:12.255286+05:30	candidate	t	\N
78a8dd29-2ced-478f-a993-4da853738503	candidate8	password123	candidate8@ngo.com	Neha	Gupta	2025-07-07 01:31:12.255286+05:30	2025-07-07 01:31:12.255286+05:30	candidate	t	\N
422a3875-172b-4201-a008-d6754db8e11f	candidate9	password123	candidate9@ngo.com	Suresh	Kumar	2025-07-07 01:31:12.255286+05:30	2025-07-07 01:31:12.255286+05:30	candidate	t	\N
c2ba31d6-e582-473a-9b60-9bce6da79284	candidate10	password123	candidate10@ngo.com	Pooja	Rani	2025-07-07 01:31:12.255286+05:30	2025-07-07 01:31:12.255286+05:30	candidate	t	\N
b4e9a7e1-69ac-4454-a1f3-5fe45c756bd3	candidate11	password123	candidate11@ngo.com	Deepak	Joshi	2025-07-07 01:31:12.255286+05:30	2025-07-07 01:31:12.255286+05:30	candidate	t	\N
f90c8ca1-44ac-450d-9ebe-4654d1f18054	candidate12	password123	candidate12@ngo.com	Kavita	Nair	2025-07-07 01:31:12.255286+05:30	2025-07-07 01:31:12.255286+05:30	candidate	t	\N
f0780681-fba9-464a-866f-c9bd735ffbbb	candidate13	password123	candidate13@ngo.com	Manish	Tiwari	2025-07-07 01:31:12.255286+05:30	2025-07-07 01:31:12.255286+05:30	candidate	t	\N
ea7dc863-ac24-4b61-acde-04ebe8e72c4c	candidate14	password123	candidate14@ngo.com	Shweta	Agarwal	2025-07-07 01:31:12.255286+05:30	2025-07-07 01:31:12.255286+05:30	candidate	t	\N
a4d2e160-4b39-4ec0-b617-b34615809d7c	candidate15	password123	candidate15@ngo.com	Arjun	Desai	2025-07-07 01:31:12.255286+05:30	2025-07-07 01:31:12.255286+05:30	candidate	t	\N
6c582f5e-3bf7-4fcd-b521-9307f9886f33	candidate16	password123	candidate16@ngo.com	Meera	Pillai	2025-07-07 01:31:12.255286+05:30	2025-07-07 01:31:12.255286+05:30	candidate	t	\N
4c64e13c-3292-42f4-9a20-b939acd73ea0	candidate17	password123	candidate17@ngo.com	Sanjay	Kapoor	2025-07-07 01:31:12.255286+05:30	2025-07-07 01:31:12.255286+05:30	candidate	t	\N
9810569b-c4ea-48af-9e11-75a9ec5096f7	candidate18	password123	candidate18@ngo.com	Ritu	Jain	2025-07-07 01:31:12.255286+05:30	2025-07-07 01:31:12.255286+05:30	candidate	t	\N
593cf921-f5ec-43ba-9f30-f0fa534a2ea8	candidate19	password123	candidate19@ngo.com	Nikhil	Bansal	2025-07-07 01:31:12.255286+05:30	2025-07-07 01:31:12.255286+05:30	candidate	t	\N
cff85b12-2f7d-4420-9e48-dcdb286e38f2	candidate20	password123	candidate20@ngo.com	Divya	Menon	2025-07-07 01:31:12.255286+05:30	2025-07-07 01:31:12.255286+05:30	candidate	t	\N
56897ac9-5fdc-4604-aefb-cce1203d5163	candidate21	password123	candidate21@ngo.com	Siddharth	Mishra	2025-07-07 01:31:12.255286+05:30	2025-07-07 01:31:12.255286+05:30	candidate	t	\N
77d37556-d670-4158-8363-87c74480f3d1	candidate22	password123	candidate22@ngo.com	Rashmi	Kaur	2025-07-07 01:31:12.255286+05:30	2025-07-07 01:31:12.255286+05:30	candidate	t	\N
901799c8-2196-4860-abee-f93917b6fc45	candidate23	password123	candidate23@ngo.com	Gaurav	Chopra	2025-07-07 01:31:12.255286+05:30	2025-07-07 01:31:12.255286+05:30	candidate	t	\N
a1a28c98-7161-41e4-a942-2a83642a53ae	candidate24	password123	candidate24@ngo.com	Sunita	Yadav	2025-07-07 01:31:12.255286+05:30	2025-07-07 01:31:12.255286+05:30	candidate	t	\N
9c9c84bd-18e3-4e55-93f6-771d20f9d73d	candidate25	password123	candidate25@ngo.com	Karan	Malhotra	2025-07-07 01:31:12.255286+05:30	2025-07-07 01:31:12.255286+05:30	candidate	t	\N
d5ae8e24-4a01-424a-b329-b7fa02af00b8	candidate26	password123	candidate26@ngo.com	Rina	Das	2025-07-07 01:31:12.255286+05:30	2025-07-07 01:31:12.255286+05:30	candidate	t	\N
9808a3f3-b822-458a-817f-41ca75722c64	candidate27	password123	candidate27@ngo.com	Vivek	Agarwal	2025-07-07 01:31:12.255286+05:30	2025-07-07 01:31:12.255286+05:30	candidate	t	\N
0f370c7f-414d-447d-a9b3-437d80265e64	candidate28	password123	candidate28@ngo.com	Tanya	Roy	2025-07-07 01:31:12.255286+05:30	2025-07-07 01:31:12.255286+05:30	candidate	t	\N
7e59645f-4a1d-4b73-86f0-75d5b7023ced	candidate29	password123	candidate29@ngo.com	Harsh	Singhania	2025-07-07 01:31:12.255286+05:30	2025-07-07 01:31:12.255286+05:30	candidate	t	\N
d930afe4-553e-4aa3-9c61-2008ee6929ba	candidate30	password123	candidate30@ngo.com	Nisha	Kumari	2025-07-07 01:31:12.255286+05:30	2025-07-07 01:31:12.255286+05:30	candidate	t	\N
1d12a5b0-4a0b-404b-a43b-c944b09ec137	7YcTqp8HvPgO2iqw1vWURtoCLdS2		newuser@example.com	\N	\N	2025-09-12 22:52:34.660125+05:30	2025-09-12 22:52:34.660125+05:30	candidate	t	\N
793c1f76-9543-4e16-a5d4-6025fa9dc8db	XALoPxYXV1a8dIY2dJEy9HaiFTC3		newuser1@example.com	\N	\N	2025-09-12 22:56:52.685324+05:30	2025-09-12 22:56:52.685324+05:30	candidate	t	\N
a63fbb44-b069-4d65-8b2c-61ae9820728a	lCKmhofW1xT6hDLXEf9Pwwn7m1z2		newuser2@example.com	\N	\N	2025-09-12 23:06:11.960067+05:30	2025-09-12 23:06:11.960067+05:30	candidate	t	\N
d54e6928-b090-40e5-af59-f95f57e453db	UdpdG815oranyoZvwaOimefpRQl1		newuser3@example.com	\N	\N	2025-09-12 23:07:36.656788+05:30	2025-09-12 23:07:36.656788+05:30	candidate	t	\N
383e73a6-a1a6-4cc3-86cb-39b6588f53bb	JYUNtirXkshOuYUEs6blm2IPocM2		newuser4@example.com	\N	\N	2025-09-12 23:14:29.257052+05:30	2025-09-12 23:14:29.257052+05:30	candidate	t	\N
73dee710-e5b1-4000-b951-b7435765e08c	aAwDJgDql5SlfCuhcKMzjLJX7E93		newuser5@example.com	\N	\N	2025-09-12 23:18:12.291498+05:30	2025-09-12 23:18:12.291498+05:30	candidate	t	\N
2bde9384-8c3c-4ccd-ba91-af902bd1ec45	IEdbw4h2rveypG5tSNpmD0Svcu13		newuser6@example.com	\N	\N	2025-09-12 23:19:54.77614+05:30	2025-09-12 23:19:54.77614+05:30	candidate	t	\N
77c1da2d-64d5-4842-abe6-a4cf94b0cc1e	raNyjHadaQMKoBV8QffVhrskAqn1		newuser7@example.com	\N	\N	2025-09-12 23:22:21.085638+05:30	2025-09-12 23:22:21.085638+05:30	candidate	t	\N
5390d523-4f15-4541-8056-ffb8053e0541	gwmyt2JCoyTjaTibdb0d4wHYffC2		demo@example.com	\N	\N	2026-04-03 18:56:39.408151+05:30	2026-04-03 18:56:39.408151+05:30	candidate	t	\N
cb1e08b4-c87e-4bcb-809d-e8b1e2a9b666	r9Rn84UzOzWp9UTf2LS6vVtqpfj2	superadmin123	superadmin@example.com	Super	Admin	2025-06-30 22:33:40.9568+05:30	2026-04-06 16:15:48.535648+05:30	super_admin	t	\N
fbce6c0d-38ac-408e-9922-e4d7b0234239	jWecaq6TtraGxjAOP1YaiSiSC7j1		subhash@example.com	\N	\N	2026-04-07 20:35:52.565522+05:30	2026-04-07 20:35:52.565522+05:30	candidate	t	\N
e4a058b9-ed0f-48eb-aa2b-81e133f05163	Y8jI4gdvTNhzpaC1YcEaXvsPq3w1		subhash79@example.com	\N	\N	2026-04-07 20:57:04.343511+05:30	2026-04-07 20:57:04.343511+05:30	candidate	t	\N
6bb6ac55-c54b-4e6d-8772-d9317333e3af	zjafpj7LC8bqKvHVSLXYAwenktd2		subhash89@example.com	\N	\N	2026-04-07 20:57:46.609125+05:30	2026-04-07 20:57:46.609125+05:30	employer	t	\N
0a97935e-2381-43e9-ab4c-de4d0a182a41	3Fogwf9zpHThK8i88tBl6ODKHWe2		subhash87@example.com	Subhash Tech		2026-04-07 21:28:32.591902+05:30	2026-04-07 22:11:49.320023+05:30	employer	t	\N
daf01176-a437-42c3-8841-a63885685fcc	AU4I5GgxZvR93NI0AGo3w86CcBl2		subhash88@example.com	Canditdate	SUBh	2026-04-07 23:44:01.875139+05:30	2026-04-07 23:44:01.875139+05:30	candidate	t	\N
7dccfe22-6024-4f7e-97e4-1c4d7f8aae9b	f2lSmHbU3vdIjULSdfxmJ667YOw1		candisubh89@example.com	CandiSubh	\N	2026-04-08 23:41:24.319471+05:30	2026-04-08 23:41:24.319471+05:30	candidate	t	\N
\.


--
-- Name: applied_jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.applied_jobs_id_seq', 10, true);


--
-- Name: candidate_education_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.candidate_education_id_seq', 1, false);


--
-- Name: candidate_experience_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.candidate_experience_id_seq', 1, false);


--
-- Name: candidate_profiles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.candidate_profiles_id_seq', 1, true);


--
-- Name: fellowships_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.fellowships_id_seq', 32, true);


--
-- Name: following_employers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.following_employers_id_seq', 1, false);


--
-- Name: internships_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.internships_id_seq', 34, true);


--
-- Name: job_alerts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.job_alerts_id_seq', 1, false);


--
-- Name: saved_jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.saved_jobs_id_seq', 3, true);


--
-- Name: scholarships_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.scholarships_id_seq', 2, true);


--
-- Name: top_organisations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.top_organisations_id_seq', 20, true);


--
-- Name: applications applications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_pkey PRIMARY KEY (id);


--
-- Name: applied_jobs applied_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applied_jobs
    ADD CONSTRAINT applied_jobs_pkey PRIMARY KEY (id);


--
-- Name: candidate_education candidate_education_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidate_education
    ADD CONSTRAINT candidate_education_pkey PRIMARY KEY (id);


--
-- Name: candidate_experience candidate_experience_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidate_experience
    ADD CONSTRAINT candidate_experience_pkey PRIMARY KEY (id);


--
-- Name: candidate_profiles candidate_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidate_profiles
    ADD CONSTRAINT candidate_profiles_pkey PRIMARY KEY (id);


--
-- Name: candidate_profiles_setup candidate_profiles_setup_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidate_profiles_setup
    ADD CONSTRAINT candidate_profiles_setup_pkey PRIMARY KEY (user_id);


--
-- Name: candidate_social_media candidate_social_media_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidate_social_media
    ADD CONSTRAINT candidate_social_media_pkey PRIMARY KEY (id);


--
-- Name: employer_profiles employer_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employer_profiles
    ADD CONSTRAINT employer_profiles_pkey PRIMARY KEY (user_id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: fellowships fellowships_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fellowships
    ADD CONSTRAINT fellowships_pkey PRIMARY KEY (id);


--
-- Name: fellowships fellowships_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fellowships
    ADD CONSTRAINT fellowships_slug_key UNIQUE (slug);


--
-- Name: following_employers following_employers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.following_employers
    ADD CONSTRAINT following_employers_pkey PRIMARY KEY (id);


--
-- Name: following_employers following_employers_user_id_employer_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.following_employers
    ADD CONSTRAINT following_employers_user_id_employer_id_key UNIQUE (user_id, employer_id);


--
-- Name: grants grants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grants
    ADD CONSTRAINT grants_pkey PRIMARY KEY (id);


--
-- Name: internships internships_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.internships
    ADD CONSTRAINT internships_pkey PRIMARY KEY (id);


--
-- Name: internships internships_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.internships
    ADD CONSTRAINT internships_slug_key UNIQUE (slug);


--
-- Name: job_alerts job_alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_alerts
    ADD CONSTRAINT job_alerts_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_slug_key UNIQUE (slug);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: saved_jobs saved_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saved_jobs
    ADD CONSTRAINT saved_jobs_pkey PRIMARY KEY (id);


--
-- Name: scholarships scholarships_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scholarships
    ADD CONSTRAINT scholarships_pkey PRIMARY KEY (id);


--
-- Name: scholarships scholarships_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scholarships
    ADD CONSTRAINT scholarships_slug_key UNIQUE (slug);


--
-- Name: shortlists shortlists_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shortlists
    ADD CONSTRAINT shortlists_pkey PRIMARY KEY (id);


--
-- Name: employers top_organisations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employers
    ADD CONSTRAINT top_organisations_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_user_id_key UNIQUE (user_id);


--
-- Name: idx_candidate_profiles_setup_completed; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_candidate_profiles_setup_completed ON public.candidate_profiles_setup USING btree (profile_completed);


--
-- Name: idx_candidate_social_media_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_candidate_social_media_user_id ON public.candidate_social_media USING btree (user_id);


--
-- Name: idx_employer_profiles_completed; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_employer_profiles_completed ON public.employer_profiles USING btree (profile_completed);


--
-- Name: idx_fellowships_employer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fellowships_employer_id ON public.fellowships USING btree (employer_id);


--
-- Name: idx_internships_employer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_internships_employer_id ON public.internships USING btree (employer_id);


--
-- Name: idx_job_alerts_is_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_job_alerts_is_active ON public.job_alerts USING btree (is_active);


--
-- Name: idx_jobs_slug; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_jobs_slug ON public.jobs USING btree (slug);


--
-- Name: idx_scholarships_employer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_scholarships_employer_id ON public.scholarships USING btree (employer_id);


--
-- Name: candidate_social_media trigger_update_candidate_social_media_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_update_candidate_social_media_updated_at BEFORE UPDATE ON public.candidate_social_media FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_timestamp();


--
-- Name: jobs trigger_update_jobs_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_update_jobs_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_timestamp();


--
-- Name: users trigger_update_users_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_timestamp();


--
-- Name: job_alerts update_job_alerts_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_job_alerts_updated_at BEFORE UPDATE ON public.job_alerts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: applications applications_candidate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_candidate_id_fkey FOREIGN KEY (candidate_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: applications applications_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- Name: candidate_profiles_setup candidate_profiles_setup_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidate_profiles_setup
    ADD CONSTRAINT candidate_profiles_setup_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: employer_profiles employer_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employer_profiles
    ADD CONSTRAINT employer_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: fellowships fellowships_employer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fellowships
    ADD CONSTRAINT fellowships_employer_id_fkey FOREIGN KEY (employer_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: shortlists fk_candidate; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shortlists
    ADD CONSTRAINT fk_candidate FOREIGN KEY (candidate_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: jobs fk_employer; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT fk_employer FOREIGN KEY (employer_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: shortlists fk_job; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shortlists
    ADD CONSTRAINT fk_job FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE SET NULL;


--
-- Name: shortlists fk_shortlist_employer; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shortlists
    ADD CONSTRAINT fk_shortlist_employer FOREIGN KEY (employer_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: grants grants_employer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grants
    ADD CONSTRAINT grants_employer_id_fkey FOREIGN KEY (employer_id) REFERENCES public.users(id);


--
-- Name: internships internships_employer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.internships
    ADD CONSTRAINT internships_employer_id_fkey FOREIGN KEY (employer_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: scholarships scholarships_employer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scholarships
    ADD CONSTRAINT scholarships_employer_id_fkey FOREIGN KEY (employer_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

