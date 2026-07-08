
CREATE POLICY "chefe media public read" ON storage.objects FOR SELECT USING (bucket_id = 'chefe-media');
CREATE POLICY "chefe media public insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'chefe-media');
CREATE POLICY "chefe media public update" ON storage.objects FOR UPDATE USING (bucket_id = 'chefe-media') WITH CHECK (bucket_id = 'chefe-media');
CREATE POLICY "chefe media public delete" ON storage.objects FOR DELETE USING (bucket_id = 'chefe-media');
