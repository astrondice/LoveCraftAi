-- Immutable public publishing contract. This migration is forward-only.

CREATE TABLE IF NOT EXISTS public.published_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.websites(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  html_path TEXT NOT NULL,
  preview_image TEXT,
  content_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'failed')),
  published_at TIMESTAMPTZ,
  published_by UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (site_id, version_number)
);

ALTER TABLE public.websites ADD COLUMN IF NOT EXISTS active_version_id UUID;
ALTER TABLE public.websites
  DROP CONSTRAINT IF EXISTS websites_active_version_id_fkey;
ALTER TABLE public.websites
  ADD CONSTRAINT websites_active_version_id_fkey
  FOREIGN KEY (active_version_id) REFERENCES public.published_versions(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_published_versions_site_created
  ON public.published_versions(site_id, version_number DESC);
CREATE INDEX IF NOT EXISTS idx_websites_active_version
  ON public.websites(active_version_id);

ALTER TABLE public.published_versions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "published_versions_select_owner" ON public.published_versions;
DROP POLICY IF EXISTS "published_versions_insert_owner" ON public.published_versions;
CREATE POLICY "published_versions_select_owner" ON public.published_versions
  FOR SELECT TO authenticated
  USING (published_by = auth.uid());

-- Remove the insecure anonymous bypass introduced in migration 013.
DROP POLICY IF EXISTS "websites_insert_anon_fallback" ON public.websites;

-- Published Storage is intentionally public, but browser clients may write only
-- within their own pending version namespace. Objects are immutable: no UPDATE.
UPDATE storage.buckets
  SET public = TRUE,
      allowed_mime_types = ARRAY[
        'text/html', 'text/html; charset=utf-8',
        'image/jpeg', 'image/png', 'image/webp', 'image/gif',
        'audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/mp4',
        'video/mp4', 'video/webm'
      ]
  WHERE id = 'published-assets';

DROP POLICY IF EXISTS "published_assets_insert_user_scoped" ON storage.objects;
DROP POLICY IF EXISTS "published_assets_update_user_scoped" ON storage.objects;
DROP POLICY IF EXISTS "published_assets_insert_own" ON storage.objects;
DROP POLICY IF EXISTS "published_assets_update_own" ON storage.objects;
DROP POLICY IF EXISTS "published_assets_update_own" ON storage.objects;
DROP POLICY IF EXISTS "published_assets_delete_own" ON storage.objects;
CREATE POLICY "published_assets_insert_version_owner" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'published-assets'
    AND (storage.foldername(name))[1] = 'published'
    AND EXISTS (
      SELECT 1 FROM public.published_versions pv
      WHERE pv.id::text = (storage.foldername(name))[3]
        AND pv.published_by = auth.uid()
        AND pv.status = 'pending'
    )
  );
CREATE POLICY "published_assets_delete_pending_version_owner" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'published-assets'
    AND (storage.foldername(name))[1] = 'published'
    AND EXISTS (
      SELECT 1 FROM public.published_versions pv
      WHERE pv.id::text = (storage.foldername(name))[3]
        AND pv.published_by = auth.uid()
        AND pv.status = 'pending'
    )
  );

CREATE OR REPLACE FUNCTION public.create_pending_published_version(p_site_id UUID)
RETURNS TABLE(id UUID, version_number INTEGER)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE next_version INTEGER;
BEGIN
  IF auth.uid() IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.websites w WHERE w.id = p_site_id AND w.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;
  PERFORM pg_advisory_xact_lock(hashtext(p_site_id::text));
  SELECT COALESCE(MAX(pv.version_number), 0) + 1 INTO next_version
    FROM public.published_versions pv WHERE pv.site_id = p_site_id;
  RETURN QUERY INSERT INTO public.published_versions
    (site_id, version_number, html_path, content_hash, published_by)
  VALUES (p_site_id, next_version, '', '', auth.uid())
  RETURNING published_versions.id, published_versions.version_number;
END;
$$;

CREATE OR REPLACE FUNCTION public.activate_published_version(
  p_site_id UUID, p_version_id UUID, p_html_path TEXT, p_preview_image TEXT, p_content_hash TEXT,
  p_title TEXT, p_website_type TEXT, p_blueprint JSONB
)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.websites w WHERE w.id = p_site_id AND w.user_id = auth.uid()
  ) THEN RAISE EXCEPTION 'not authorized'; END IF;
  UPDATE public.published_versions SET html_path = p_html_path, preview_image = p_preview_image,
    content_hash = p_content_hash, status = 'active', published_at = now()
    WHERE id = p_version_id AND site_id = p_site_id AND published_by = auth.uid() AND status = 'pending';
  IF NOT FOUND THEN RAISE EXCEPTION 'pending version not found'; END IF;
  UPDATE public.websites SET active_version_id = p_version_id, status = 'active', title = p_title,
    website_type = p_website_type, preview_image = p_preview_image, published_html = p_html_path,
    blueprint_json = p_blueprint, published_at = now(), updated_at = now()
    WHERE id = p_site_id AND user_id = auth.uid();
END;
$$;

CREATE OR REPLACE FUNCTION public.rollback_published_version(p_site_id UUID, p_version_id UUID)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.websites w WHERE w.id = p_site_id AND w.user_id = auth.uid()
  ) THEN RAISE EXCEPTION 'not authorized'; END IF;
  UPDATE public.websites w SET active_version_id = pv.id, published_html = pv.html_path,
    preview_image = pv.preview_image, published_at = now(), updated_at = now()
    FROM public.published_versions pv
    WHERE w.id = p_site_id AND pv.id = p_version_id AND pv.site_id = p_site_id
      AND pv.published_by = auth.uid() AND pv.status = 'active';
  IF NOT FOUND THEN RAISE EXCEPTION 'published version not found'; END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.fail_published_version(p_site_id UUID, p_version_id UUID)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.published_versions pv SET status = 'failed'
  WHERE pv.id = p_version_id AND pv.site_id = p_site_id AND pv.published_by = auth.uid() AND pv.status = 'pending'
    AND EXISTS (SELECT 1 FROM public.websites w WHERE w.id = p_site_id AND w.user_id = auth.uid());
END;
$$;

CREATE OR REPLACE FUNCTION public.get_public_site(p_site_id UUID)
RETURNS TABLE(id UUID, title TEXT, website_type TEXT, preview_image TEXT, html_url TEXT, published_at TIMESTAMPTZ)
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT w.id, w.title, w.website_type, COALESCE(pv.preview_image, w.preview_image),
    COALESCE(NULLIF(pv.html_path, ''), NULLIF(w.published_html, '')), w.published_at
  FROM public.websites w
  LEFT JOIN public.published_versions pv ON pv.id = w.active_version_id AND pv.status = 'active'
  WHERE w.id = p_site_id AND w.status = 'active'
    AND COALESCE(NULLIF(pv.html_path, ''), NULLIF(w.published_html, '')) IS NOT NULL;
$$;

GRANT EXECUTE ON FUNCTION public.create_pending_published_version(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.activate_published_version(UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rollback_published_version(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fail_published_version(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_site(UUID) TO anon, authenticated;
