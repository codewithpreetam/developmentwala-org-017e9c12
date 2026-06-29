
DROP POLICY IF EXISTS "Users update own contact message flags" ON public.contact_messages;

CREATE POLICY "Users update own contact message flags"
ON public.contact_messages
FOR UPDATE
USING (user_id IS NOT NULL AND user_id = auth.uid())
WITH CHECK (
  user_id IS NOT NULL AND user_id = auth.uid()
  AND NOT (name    IS DISTINCT FROM (SELECT cm.name    FROM public.contact_messages cm WHERE cm.id = contact_messages.id))
  AND NOT (email   IS DISTINCT FROM (SELECT cm.email   FROM public.contact_messages cm WHERE cm.id = contact_messages.id))
  AND NOT (subject IS DISTINCT FROM (SELECT cm.subject FROM public.contact_messages cm WHERE cm.id = contact_messages.id))
  AND NOT (message IS DISTINCT FROM (SELECT cm.message FROM public.contact_messages cm WHERE cm.id = contact_messages.id))
  AND NOT (status::text IS DISTINCT FROM (SELECT cm.status::text FROM public.contact_messages cm WHERE cm.id = contact_messages.id))
  AND NOT (unread_for_admin IS DISTINCT FROM (SELECT cm.unread_for_admin FROM public.contact_messages cm WHERE cm.id = contact_messages.id))
  AND NOT (last_reply_at    IS DISTINCT FROM (SELECT cm.last_reply_at    FROM public.contact_messages cm WHERE cm.id = contact_messages.id))
  AND NOT (created_at       IS DISTINCT FROM (SELECT cm.created_at       FROM public.contact_messages cm WHERE cm.id = contact_messages.id))
  AND NOT (user_id          IS DISTINCT FROM (SELECT cm.user_id          FROM public.contact_messages cm WHERE cm.id = contact_messages.id))
);

REVOKE SELECT ON public.employers FROM anon;
GRANT SELECT (
  id, name, logo, location, tags, open_positions, about, founded,
  company_size, website, social_facebook, social_twitter,
  social_linkedin, social_instagram, owner_user_id,
  created_at, updated_at, tagline, sector, ngo_type
) ON public.employers TO anon;
