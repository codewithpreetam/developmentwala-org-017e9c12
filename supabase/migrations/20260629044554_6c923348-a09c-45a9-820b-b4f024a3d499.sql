
CREATE INDEX IF NOT EXISTS applications_candidate_idx ON public.applications(candidate_id);
CREATE INDEX IF NOT EXISTS applications_opportunity_idx ON public.applications(opportunity_type, opportunity_id);
CREATE UNIQUE INDEX IF NOT EXISTS applications_unique_per_candidate
  ON public.applications(candidate_id, opportunity_type, opportunity_id)
  WHERE opportunity_id IS NOT NULL;

CREATE TRIGGER trg_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
