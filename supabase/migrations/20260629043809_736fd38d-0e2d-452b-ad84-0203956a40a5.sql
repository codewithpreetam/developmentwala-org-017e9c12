
DROP POLICY IF EXISTS "uploads auth read" ON storage.objects;
CREATE POLICY "uploads auth read" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'uploads');
DROP POLICY IF EXISTS "uploads auth insert" ON storage.objects;
CREATE POLICY "uploads auth insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'uploads');
DROP POLICY IF EXISTS "uploads auth update" ON storage.objects;
CREATE POLICY "uploads auth update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'uploads');
DROP POLICY IF EXISTS "uploads auth delete" ON storage.objects;
CREATE POLICY "uploads auth delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'uploads');
