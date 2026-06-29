
CREATE OR REPLACE FUNCTION public.notify_on_new_contact_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_id uuid;
  preview text;
BEGIN
  preview := left(coalesce(NEW.message, ''), 180);
  FOR admin_id IN SELECT user_id FROM public.user_roles WHERE role = 'admin' LOOP
    INSERT INTO public.notifications (user_id, entity_title, details, type, entity_id, read)
    VALUES (
      admin_id,
      'New message from ' || coalesce(NEW.name, NEW.email, 'a user') || ': ' || coalesce(NEW.subject, '(no subject)'),
      preview,
      'message',
      NEW.id::text,
      false
    );
  END LOOP;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_on_new_contact_message ON public.contact_messages;
CREATE TRIGGER trg_notify_on_new_contact_message
AFTER INSERT ON public.contact_messages
FOR EACH ROW EXECUTE FUNCTION public.notify_on_new_contact_message();

CREATE OR REPLACE FUNCTION public.notify_on_contact_reply()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  msg public.contact_messages%ROWTYPE;
  admin_id uuid;
  preview text;
  subj text;
BEGIN
  SELECT * INTO msg FROM public.contact_messages WHERE id = NEW.message_id;
  IF NOT FOUND THEN RETURN NEW; END IF;
  preview := left(coalesce(NEW.body, ''), 180);
  subj := coalesce(msg.subject, '(no subject)');

  IF NEW.sender_role = 'admin' THEN
    IF msg.user_id IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, entity_title, details, type, entity_id, read)
      VALUES (
        msg.user_id,
        'Admin replied: ' || subj,
        preview,
        'message',
        msg.id::text,
        false
      );
    END IF;
  ELSE
    FOR admin_id IN SELECT user_id FROM public.user_roles WHERE role = 'admin' LOOP
      INSERT INTO public.notifications (user_id, entity_title, details, type, entity_id, read)
      VALUES (
        admin_id,
        'New reply from ' || coalesce(NEW.sender_name, msg.name, msg.email, 'user') || ': ' || subj,
        preview,
        'message',
        msg.id::text,
        false
      );
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_on_contact_reply ON public.contact_message_replies;
CREATE TRIGGER trg_notify_on_contact_reply
AFTER INSERT ON public.contact_message_replies
FOR EACH ROW EXECUTE FUNCTION public.notify_on_contact_reply();
