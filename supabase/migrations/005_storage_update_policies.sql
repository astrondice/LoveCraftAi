-- ─────────────────────────────────────────────────────────────────
-- Migration 005: Fix storage.objects RLS — add UPDATE policies
-- ─────────────────────────────────────────────────────────────────
-- Missing from 004: The `published-assets` bucket uses `upsert: true`
-- in storageService.uploadHtml(), which requires an UPDATE policy on
-- storage.objects. Without it, republishing fails with a 403 policy
-- violation on the second publish of the same HTML path.
-- ─────────────────────────────────────────────────────────────────

-- Allow authenticated users to overwrite their own files in `uploads`
-- (needed when re-uploading the same photo/audio/video path)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename  = 'objects'
      AND policyname = 'uploads_update_own'
  ) THEN
    CREATE POLICY "uploads_update_own"
      ON storage.objects FOR UPDATE
      TO authenticated
      USING (
        bucket_id = 'uploads'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;
END $$;

-- Allow authenticated users to overwrite their own published HTML
-- (needed for republishing — storageService.uploadHtml uses upsert:true)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename  = 'objects'
      AND policyname = 'published_assets_update_own'
  ) THEN
    CREATE POLICY "published_assets_update_own"
      ON storage.objects FOR UPDATE
      TO authenticated
      USING (
        bucket_id = 'published-assets'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;
END $$;

-- Allow authenticated users to overwrite their own thumbnails
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename  = 'objects'
      AND policyname = 'thumbnails_update_own'
  ) THEN
    CREATE POLICY "thumbnails_update_own"
      ON storage.objects FOR UPDATE
      TO authenticated
      USING (
        bucket_id = 'thumbnails'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;
END $$;
