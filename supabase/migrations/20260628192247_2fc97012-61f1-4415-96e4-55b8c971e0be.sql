-- Sequence defaults for integer-id tables
ALTER TABLE ONLY public.applied_jobs ALTER COLUMN id SET DEFAULT nextval('public.applied_jobs_id_seq'::regclass);
ALTER TABLE ONLY public.candidate_education ALTER COLUMN id SET DEFAULT nextval('public.candidate_education_id_seq'::regclass);
ALTER TABLE ONLY public.candidate_experience ALTER COLUMN id SET DEFAULT nextval('public.candidate_experience_id_seq'::regclass);
ALTER TABLE ONLY public.candidate_profiles ALTER COLUMN id SET DEFAULT nextval('public.candidate_profiles_id_seq'::regclass);
ALTER TABLE ONLY public.employers ALTER COLUMN id SET DEFAULT nextval('public.top_organisations_id_seq'::regclass);
ALTER TABLE ONLY public.fellowships ALTER COLUMN id SET DEFAULT nextval('public.fellowships_id_seq'::regclass);
ALTER TABLE ONLY public.following_employers ALTER COLUMN id SET DEFAULT nextval('public.following_employers_id_seq'::regclass);
ALTER TABLE ONLY public.internships ALTER COLUMN id SET DEFAULT nextval('public.internships_id_seq'::regclass);
ALTER TABLE ONLY public.job_alerts ALTER COLUMN id SET DEFAULT nextval('public.job_alerts_id_seq'::regclass);
ALTER TABLE ONLY public.saved_jobs ALTER COLUMN id SET DEFAULT nextval('public.saved_jobs_id_seq'::regclass);
ALTER TABLE ONLY public.scholarships ALTER COLUMN id SET DEFAULT nextval('public.scholarships_id_seq'::regclass);

-- Primary keys
ALTER TABLE ONLY public.applications ADD CONSTRAINT applications_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.applied_jobs ADD CONSTRAINT applied_jobs_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.candidate_education ADD CONSTRAINT candidate_education_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.candidate_experience ADD CONSTRAINT candidate_experience_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.candidate_profiles ADD CONSTRAINT candidate_profiles_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.candidate_profiles_setup ADD CONSTRAINT candidate_profiles_setup_pkey PRIMARY KEY (user_id);
ALTER TABLE ONLY public.candidate_social_media ADD CONSTRAINT candidate_social_media_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.employer_profiles ADD CONSTRAINT employer_profiles_pkey PRIMARY KEY (user_id);
ALTER TABLE ONLY public.events ADD CONSTRAINT events_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.fellowships ADD CONSTRAINT fellowships_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.following_employers ADD CONSTRAINT following_employers_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.grants ADD CONSTRAINT grants_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.internships ADD CONSTRAINT internships_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.job_alerts ADD CONSTRAINT job_alerts_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.jobs ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.notifications ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.saved_jobs ADD CONSTRAINT saved_jobs_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.scholarships ADD CONSTRAINT scholarships_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.shortlists ADD CONSTRAINT shortlists_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.employers ADD CONSTRAINT top_organisations_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.users ADD CONSTRAINT users_pkey PRIMARY KEY (id);

-- Unique constraints
ALTER TABLE ONLY public.fellowships ADD CONSTRAINT fellowships_slug_key UNIQUE (slug);
ALTER TABLE ONLY public.following_employers ADD CONSTRAINT following_employers_user_id_employer_id_key UNIQUE (user_id, employer_id);
ALTER TABLE ONLY public.internships ADD CONSTRAINT internships_slug_key UNIQUE (slug);
ALTER TABLE ONLY public.jobs ADD CONSTRAINT jobs_slug_key UNIQUE (slug);
ALTER TABLE ONLY public.scholarships ADD CONSTRAINT scholarships_slug_key UNIQUE (slug);
ALTER TABLE ONLY public.users ADD CONSTRAINT users_email_key UNIQUE (email);
ALTER TABLE ONLY public.users ADD CONSTRAINT users_user_id_key UNIQUE (user_id);

-- Indexes
CREATE INDEX idx_candidate_profiles_setup_completed ON public.candidate_profiles_setup USING btree (profile_completed);
CREATE INDEX idx_candidate_social_media_user_id ON public.candidate_social_media USING btree (user_id);
CREATE INDEX idx_employer_profiles_completed ON public.employer_profiles USING btree (profile_completed);
CREATE INDEX idx_fellowships_employer_id ON public.fellowships USING btree (employer_id);
CREATE INDEX idx_internships_employer_id ON public.internships USING btree (employer_id);
CREATE INDEX idx_job_alerts_is_active ON public.job_alerts USING btree (is_active);
CREATE INDEX idx_jobs_slug ON public.jobs USING btree (slug);
CREATE INDEX idx_scholarships_employer_id ON public.scholarships USING btree (employer_id);

-- Triggers
CREATE TRIGGER trigger_update_candidate_social_media_updated_at BEFORE UPDATE ON public.candidate_social_media FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_timestamp();
CREATE TRIGGER trigger_update_jobs_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_timestamp();
CREATE TRIGGER trigger_update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_timestamp();
CREATE TRIGGER update_job_alerts_updated_at BEFORE UPDATE ON public.job_alerts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Foreign keys
ALTER TABLE ONLY public.applications ADD CONSTRAINT applications_candidate_id_fkey FOREIGN KEY (candidate_id) REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.applications ADD CONSTRAINT applications_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.candidate_profiles_setup ADD CONSTRAINT candidate_profiles_setup_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.employer_profiles ADD CONSTRAINT employer_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.fellowships ADD CONSTRAINT fellowships_employer_id_fkey FOREIGN KEY (employer_id) REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE ONLY public.shortlists ADD CONSTRAINT fk_candidate FOREIGN KEY (candidate_id) REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.jobs ADD CONSTRAINT fk_employer FOREIGN KEY (employer_id) REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE ONLY public.shortlists ADD CONSTRAINT fk_job FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE SET NULL;
ALTER TABLE ONLY public.shortlists ADD CONSTRAINT fk_shortlist_employer FOREIGN KEY (employer_id) REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.grants ADD CONSTRAINT grants_employer_id_fkey FOREIGN KEY (employer_id) REFERENCES public.users(id);
ALTER TABLE ONLY public.internships ADD CONSTRAINT internships_employer_id_fkey FOREIGN KEY (employer_id) REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE ONLY public.scholarships ADD CONSTRAINT scholarships_employer_id_fkey FOREIGN KEY (employer_id) REFERENCES public.users(id) ON DELETE SET NULL;