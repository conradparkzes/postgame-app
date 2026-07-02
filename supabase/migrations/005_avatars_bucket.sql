-- v0.5: Avatars storage bucket and policies.
-- Run this after creating the 'avatars' bucket in Dashboard → Storage
-- with Public = true (avatars are publicly viewable).
--
-- Also fix game-media storage policies to use correct path format
-- (userId/gameLogId/filename — no redundant bucket prefix).

-- Avatars bucket policies
CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Avatars are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Game-media bucket policies (if not already created from 001 comments)
-- These use the corrected path format: {userId}/{gameLogId}/{filename}
-- Uncomment and run if you haven't set up game-media bucket policies yet:
--
-- CREATE POLICY "Users can upload their own game media"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'game-media' AND auth.uid()::text = (storage.foldername(name))[1]);
--
-- CREATE POLICY "Users can read game media"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'game-media');
--
-- CREATE POLICY "Users can delete their own game media"
--   ON storage.objects FOR DELETE
--   USING (bucket_id = 'game-media' AND auth.uid()::text = (storage.foldername(name))[1]);
