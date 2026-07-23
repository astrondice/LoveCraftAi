-- ─────────────────────────────────────────────────────────────────
-- Migration 004: Create Supabase Storage buckets + RLS policies
-- ─────────────────────────────────────────────────────────────────
-- ROOT CAUSE:
--   The frontend used bucket name "lovecraft-assets" but no such bucket
--   existed in Supabase Storage. The three required buckets are:
--     uploads          (private) — raw user assets
--     published-assets (public)  — generated HTML love sites
--     thumbnails       (public)  — OG/preview images
-- ─────────────────────────────────────────────────────────────────

-- ── 1. Create buckets ─────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'uploads',
    'uploads',
    FALSE,                          -- private: requires auth or signed URL
    52428800,                       -- 50 MB per file
    ARRAY[
      'image/jpeg', 'image/png', 'image/webp', 'image/gif',
      'audio/mpeg', 'audio/ogg', 'audio/wav',
      'video/mp4', 'video/webm'
    ]
  ),
  (
    'published-assets',
    'published-assets',
    TRUE,                           -- public: anyone can read HTML sites
    10485760,                       -- 10 MB per file
    ARRAY['text/html', 'text/html; charset=utf-8', 'text/plain']
  ),
  (
    'thumbnails',
    'thumbnails',
    TRUE,                           -- public: OG images served directly
    2097152,                        -- 2 MB per file
    ARRAY['image/jpeg', 'image/png', 'image/webp']
  )
ON CONFLICT (id) DO UPDATE
  SET
    public             = EXCLUDED.public,
    file_size_limit    = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ── 2. RLS policies for `uploads` (private) ───────────────────────

-- Authenticated users can upload to their own folder
CREATE POLICY "uploads_insert_own"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'uploads'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Authenticated users can read their own files
CREATE POLICY "uploads_select_own"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'uploads'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Authenticated users can delete their own files
CREATE POLICY "uploads_delete_own"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'uploads'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ── 3. RLS policies for `published-assets` (public) ──────────────

-- Anyone (including anon) can read published HTML files
CREATE POLICY "published_assets_select_public"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'published-assets');

-- Only authenticated users can upload HTML files to their own folder
CREATE POLICY "published_assets_insert_own"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'published-assets'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Authenticated users can overwrite (update) their own files (republish)
CREATE POLICY "published_assets_update_own"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'published-assets'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Authenticated users can delete their own published files
CREATE POLICY "published_assets_delete_own"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'published-assets'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ── 4. RLS policies for `thumbnails` (public) ────────────────────

-- Anyone can view thumbnails (OG images)
CREATE POLICY "thumbnails_select_public"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'thumbnails');

-- Only authenticated users can upload thumbnails to their own folder
CREATE POLICY "thumbnails_insert_own"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'thumbnails'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Authenticated users can delete their own thumbnails
CREATE POLICY "thumbnails_delete_own"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'thumbnails'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
