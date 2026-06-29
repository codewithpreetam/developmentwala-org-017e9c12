
ALTER TABLE public.applications ALTER COLUMN job_id DROP NOT NULL;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS opportunity_id uuid;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS opportunity_type varchar(32) NOT NULL DEFAULT 'job';
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS cover_letter text;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS cv_url text;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS applicant_name text;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS updated_at timestamp without time zone NOT NULL DEFAULT now();
