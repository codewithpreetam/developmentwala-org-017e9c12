
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS status_history JSONB DEFAULT '[]'::jsonb;

CREATE OR REPLACE FUNCTION public.notify_candidate_on_interview()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cand_user_id uuid;
BEGIN
  IF NEW.candidate_email IS NULL THEN RETURN NEW; END IF;
  SELECT id INTO cand_user_id FROM public.users WHERE lower(email) = lower(NEW.candidate_email) LIMIT 1;
  IF cand_user_id IS NULL THEN RETURN NEW; END IF;

  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.notifications (user_id, entity_title, details, type, read)
    VALUES (
      cand_user_id,
      'Interview Scheduled: ' || COALESCE(NEW.opportunity_title, 'your application'),
      'You have been invited to an interview on ' || to_char(NEW.scheduled_at AT TIME ZONE 'UTC', 'Mon DD, YYYY HH24:MI') || ' UTC. Check your Interviews tab for details.',
      'interview_scheduled',
      false
    );
  ELSIF TG_OP = 'UPDATE' AND (
    NEW.scheduled_at IS DISTINCT FROM OLD.scheduled_at OR
    NEW.meeting_link IS DISTINCT FROM OLD.meeting_link OR
    NEW.status IS DISTINCT FROM OLD.status
  ) THEN
    INSERT INTO public.notifications (user_id, entity_title, details, type, read)
    VALUES (
      cand_user_id,
      'Interview Updated: ' || COALESCE(NEW.opportunity_title, 'your application'),
      'Your interview details have been updated. Status: ' || COALESCE(NEW.status, 'confirmed') || '. Please review them in your dashboard.',
      'interview_updated',
      false
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_candidate_on_interview ON public.interviews;
CREATE TRIGGER trg_notify_candidate_on_interview
AFTER INSERT OR UPDATE ON public.interviews
FOR EACH ROW EXECUTE FUNCTION public.notify_candidate_on_interview();
