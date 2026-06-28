-- Supabase Storage: public "uploads" bucket for profile pictures, CVs, logos, etc.
-- Run: npm run db:setup-storage

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('uploads', 'uploads', true, 5242880)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit;

-- storage.objects has RLS enabled by default; policies below allow the anon key
-- used by the Vite frontend (custom app auth, not Supabase Auth JWT).

DROP POLICY IF EXISTS "uploads public read" ON storage.objects;
CREATE POLICY "uploads public read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'uploads');

DROP POLICY IF EXISTS "uploads anon insert" ON storage.objects;
CREATE POLICY "uploads anon insert"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'uploads');

DROP POLICY IF EXISTS "uploads anon update" ON storage.objects;
CREATE POLICY "uploads anon update"
ON storage.objects FOR UPDATE
TO anon, authenticated
USING (bucket_id = 'uploads')
WITH CHECK (bucket_id = 'uploads');

DROP POLICY IF EXISTS "uploads anon delete" ON storage.objects;
CREATE POLICY "uploads anon delete"
ON storage.objects FOR DELETE
TO anon, authenticated
USING (bucket_id = 'uploads');
