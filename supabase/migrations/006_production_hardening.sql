-- ─────────────────────────────────────────────────────────────────
-- Migration 006: Production Security, RLS Hardening & Storage Isolation
-- ─────────────────────────────────────────────────────────────────

-- ── 1. Ensure RLS is enabled on all tables ───────────────────────
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- ── 2. Table RLS Policies ────────────────────────────────────────

-- USERS
DROP POLICY IF EXISTS "users_read_own" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;
DROP POLICY IF EXISTS "users_insert_own" ON public.users;

CREATE POLICY "users_read_own" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- PROJECTS
DROP POLICY IF EXISTS "projects_select_own" ON public.projects;
DROP POLICY IF EXISTS "projects_insert_own" ON public.projects;
DROP POLICY IF EXISTS "projects_update_own" ON public.projects;
DROP POLICY IF EXISTS "projects_delete_own" ON public.projects;
DROP POLICY IF EXISTS "projects_all_own" ON public.projects;

CREATE POLICY "projects_select_own" ON public.projects
  FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "projects_insert_own" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "projects_update_own" ON public.projects
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "projects_delete_own" ON public.projects
  FOR DELETE USING (auth.uid() = user_id);

-- PROJECT VERSIONS
DROP POLICY IF EXISTS "versions_select_own" ON public.project_versions;
DROP POLICY IF EXISTS "versions_insert_own" ON public.project_versions;
DROP POLICY IF EXISTS "versions_read_own" ON public.project_versions;

CREATE POLICY "versions_select_own" ON public.project_versions
  FOR SELECT USING (
    project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())
  );

CREATE POLICY "versions_insert_own" ON public.project_versions
  FOR INSERT WITH CHECK (
    project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())
  );

-- WEBSITES
DROP POLICY IF EXISTS "public_read_active_sites" ON public.websites;
DROP POLICY IF EXISTS "owners_manage_sites" ON public.websites;
DROP POLICY IF EXISTS "websites_select_owner" ON public.websites;
DROP POLICY IF EXISTS "websites_insert_owner" ON public.websites;
DROP POLICY IF EXISTS "websites_update_owner" ON public.websites;
DROP POLICY IF EXISTS "websites_delete_owner" ON public.websites;

-- Anyone can view public active websites
CREATE POLICY "public_read_active_sites" ON public.websites
  FOR SELECT USING (status = 'active' AND is_public = TRUE);

-- Owners can view all their sites (including inactive/drafts)
CREATE POLICY "websites_select_owner" ON public.websites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "websites_insert_owner" ON public.websites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "websites_update_owner" ON public.websites
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "websites_delete_owner" ON public.websites
  FOR DELETE USING (auth.uid() = user_id);

-- ASSETS
DROP POLICY IF EXISTS "assets_own" ON public.assets;
DROP POLICY IF EXISTS "assets_select_own" ON public.assets;
DROP POLICY IF EXISTS "assets_insert_own" ON public.assets;
DROP POLICY IF EXISTS "assets_delete_own" ON public.assets;

CREATE POLICY "assets_select_own" ON public.assets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "assets_insert_own" ON public.assets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "assets_delete_own" ON public.assets
  FOR DELETE USING (auth.uid() = user_id);

-- ANALYTICS EVENTS
DROP POLICY IF EXISTS "analytics_insert_public" ON public.analytics_events;
DROP POLICY IF EXISTS "analytics_read_owner" ON public.analytics_events;

CREATE POLICY "analytics_insert_public" ON public.analytics_events
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "analytics_read_owner" ON public.analytics_events
  FOR SELECT USING (
    site_id IN (SELECT id FROM public.websites WHERE user_id = auth.uid())
  );

-- SUBSCRIPTIONS
DROP POLICY IF EXISTS "subscriptions_own" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_select_own" ON public.subscriptions;

CREATE POLICY "subscriptions_select_own" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- ACTIVITY LOGS
DROP POLICY IF EXISTS "logs_read_own" ON public.activity_logs;
DROP POLICY IF EXISTS "logs_insert_own" ON public.activity_logs;

CREATE POLICY "logs_read_own" ON public.activity_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "logs_insert_own" ON public.activity_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ── 3. Performance Indexes ───────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_projects_user_created ON public.projects(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_websites_user_created ON public.websites(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_websites_status_public ON public.websites(status, is_public);
CREATE INDEX IF NOT EXISTS idx_assets_user_type ON public.assets(user_id, type);
CREATE INDEX IF NOT EXISTS idx_analytics_site_created ON public.analytics_events(site_id, created_at DESC);

-- ── 4. Storage Bucket Policies (supporting both `users/{userId}/...` and `{userId}/...`) ─
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'uploads_insert_own_v2') THEN
    DROP POLICY "uploads_insert_own_v2" ON storage.objects;
  END IF;
END $$;

CREATE POLICY "uploads_insert_user_scoped" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'uploads' AND (
      (storage.foldername(name))[1] = auth.uid()::text OR
      ((storage.foldername(name))[1] = 'users' AND (storage.foldername(name))[2] = auth.uid()::text)
    )
  );

CREATE POLICY "uploads_select_user_scoped" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'uploads' AND (
      (storage.foldername(name))[1] = auth.uid()::text OR
      ((storage.foldername(name))[1] = 'users' AND (storage.foldername(name))[2] = auth.uid()::text)
    )
  );

CREATE POLICY "uploads_update_user_scoped" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'uploads' AND (
      (storage.foldername(name))[1] = auth.uid()::text OR
      ((storage.foldername(name))[1] = 'users' AND (storage.foldername(name))[2] = auth.uid()::text)
    )
  );

CREATE POLICY "uploads_delete_user_scoped" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'uploads' AND (
      (storage.foldername(name))[1] = auth.uid()::text OR
      ((storage.foldername(name))[1] = 'users' AND (storage.foldername(name))[2] = auth.uid()::text)
    )
  );

CREATE POLICY "published_assets_insert_user_scoped" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'published-assets' AND (
      (storage.foldername(name))[1] = auth.uid()::text OR
      ((storage.foldername(name))[1] = 'users' AND (storage.foldername(name))[2] = auth.uid()::text)
    )
  );

CREATE POLICY "published_assets_update_user_scoped" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'published-assets' AND (
      (storage.foldername(name))[1] = auth.uid()::text OR
      ((storage.foldername(name))[1] = 'users' AND (storage.foldername(name))[2] = auth.uid()::text)
    )
  );

CREATE POLICY "published_assets_delete_user_scoped" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'published-assets' AND (
      (storage.foldername(name))[1] = auth.uid()::text OR
      ((storage.foldername(name))[1] = 'users' AND (storage.foldername(name))[2] = auth.uid()::text)
    )
  );
