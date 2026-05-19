-- Create a storage bucket for profile pictures
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-pictures',
  'profile-pictures',
  true,  -- Public bucket so profile picture URLs work without auth tokens
  5242880,  -- 5 MB max file size
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for profile-pictures bucket
-- Users can upload/update their own profile picture (stored in {user_id}/ folder)
CREATE POLICY "Users can upload own profile picture"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'profile-pictures'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own profile picture"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'profile-pictures'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Anyone can view profile pictures (public bucket)
CREATE POLICY "Anyone can view profile pictures"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profile-pictures');

-- Users can delete their own profile picture
CREATE POLICY "Users can delete own profile picture"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'profile-pictures'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
