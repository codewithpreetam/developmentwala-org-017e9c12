
-- Add ownership + thread support to contact_messages
ALTER TABLE public.contact_messages
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS last_reply_at timestamp without time zone,
  ADD COLUMN IF NOT EXISTS unread_for_user boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS unread_for_admin boolean NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS contact_messages_user_id_idx ON public.contact_messages(user_id);

-- Allow the owning user to read their own contact messages (admins already covered)
DROP POLICY IF EXISTS "Users read own contact messages" ON public.contact_messages;
CREATE POLICY "Users read own contact messages" ON public.contact_messages
  FOR SELECT USING (user_id IS NOT NULL AND user_id = auth.uid());

-- Allow the owning user to update read-flag fields on their own threads
DROP POLICY IF EXISTS "Users update own contact message flags" ON public.contact_messages;
CREATE POLICY "Users update own contact message flags" ON public.contact_messages
  FOR UPDATE USING (user_id IS NOT NULL AND user_id = auth.uid())
  WITH CHECK (user_id IS NOT NULL AND user_id = auth.uid());

-- Threaded replies
CREATE TABLE IF NOT EXISTS public.contact_message_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id bigint NOT NULL REFERENCES public.contact_messages(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  sender_role text NOT NULL CHECK (sender_role IN ('admin','user')),
  sender_name text,
  body text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS contact_message_replies_message_idx
  ON public.contact_message_replies(message_id, created_at);

GRANT SELECT, INSERT ON public.contact_message_replies TO authenticated;
GRANT ALL ON public.contact_message_replies TO service_role;

ALTER TABLE public.contact_message_replies ENABLE ROW LEVEL SECURITY;

-- Admins can do anything
DROP POLICY IF EXISTS "Admins manage all replies" ON public.contact_message_replies;
CREATE POLICY "Admins manage all replies" ON public.contact_message_replies
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Owners can read replies on their own message threads
DROP POLICY IF EXISTS "Owners read replies" ON public.contact_message_replies;
CREATE POLICY "Owners read replies" ON public.contact_message_replies
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.contact_messages m
            WHERE m.id = contact_message_replies.message_id
              AND m.user_id = auth.uid())
  );

-- Owners can insert replies as 'user' on their own threads
DROP POLICY IF EXISTS "Owners send replies" ON public.contact_message_replies;
CREATE POLICY "Owners send replies" ON public.contact_message_replies
  FOR INSERT WITH CHECK (
    sender_role = 'user'
    AND sender_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.contact_messages m
                WHERE m.id = contact_message_replies.message_id
                  AND m.user_id = auth.uid())
  );

-- Allow signed-in users to set user_id = auth.uid() when submitting a contact message
DROP POLICY IF EXISTS "Anyone can submit contact message" ON public.contact_messages;
CREATE POLICY "Anyone can submit contact message" ON public.contact_messages
  FOR INSERT WITH CHECK (
    (email IS NOT NULL)
    AND (length(btrim(email)) BETWEEN 3 AND 320)
    AND (message IS NOT NULL)
    AND (length(btrim(message)) BETWEEN 1 AND 5000)
    AND (user_id IS NULL OR user_id = auth.uid())
  );

-- Trigger: when a reply is inserted, bump the parent message
CREATE OR REPLACE FUNCTION public.handle_contact_reply_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.contact_messages
     SET last_reply_at = NEW.created_at,
         unread_for_user = CASE WHEN NEW.sender_role = 'admin' THEN true ELSE unread_for_user END,
         unread_for_admin = CASE WHEN NEW.sender_role = 'user' THEN true ELSE unread_for_admin END,
         status = CASE WHEN NEW.sender_role = 'admin' THEN 'replied' ELSE 'awaiting_admin' END
   WHERE id = NEW.message_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_contact_reply_insert ON public.contact_message_replies;
CREATE TRIGGER trg_contact_reply_insert
AFTER INSERT ON public.contact_message_replies
FOR EACH ROW EXECUTE FUNCTION public.handle_contact_reply_insert();
