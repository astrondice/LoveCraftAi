-- ═══════════════════════════════════════════════════════════════════
-- LoveCraft.ai — COMPLETE DATABASE SETUP (ONE-SHOT MIGRATION)
-- ═══════════════════════════════════════════════════════════════════
-- How to apply this migration:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard
-- 2. Select your project (oucygqsltknoderruayc)
-- 3. Go to SQL Editor (left sidebar) → Click "New query"
-- 4. Copy and paste ALL text below into the editor and click "Run"
-- ═══════════════════════════════════════════════════════════════════

-- ─── Extensions ────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ─── Updated-at trigger helper ─────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ════════════════════════════════════════════════════════════════════
-- USERS (extends auth.users)
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.users (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email        TEXT UNIQUE NOT NULL,
  name         TEXT,
  avatar_url   TEXT,
  role         TEXT DEFAULT 'user' NOT NULL
                 CHECK (role IN ('user', 'admin', 'superadmin')),
  plan         TEXT DEFAULT 'free' NOT NULL
                 CHECK (plan IN ('free', 'pro', 'enterprise')),
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at   TIMESTAMPTZ
);

DROP TRIGGER IF EXISTS users_updated_at ON public.users;
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile row on Supabase Auth signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ════════════════════════════════════════════════════════════════════
-- PROJECTS
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.projects (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title           TEXT NOT NULL DEFAULT 'Untitled Love Story',
  slug            TEXT,
  status          TEXT DEFAULT 'draft' NOT NULL
                    CHECK (status IN ('draft', 'published', 'archived')),
  is_favorite     BOOLEAN DEFAULT FALSE NOT NULL,
  thumbnail_url   TEXT,
  name1           TEXT DEFAULT '',
  name2           TEXT DEFAULT '',
  date            TEXT DEFAULT '',
  duration        TEXT DEFAULT '',
  memory          TEXT DEFAULT '',
  message         TEXT DEFAULT '',
  theme_id        TEXT DEFAULT 'cosmic' NOT NULL,
  photo_urls      JSONB DEFAULT '[]'::JSONB NOT NULL,
  music_url       TEXT,
  video_url       TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at      TIMESTAMPTZ,
  CONSTRAINT slug_format CHECK (slug ~ '^[a-z0-9-]+$' OR slug IS NULL)
);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status  ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created ON public.projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_search  ON public.projects USING GIN (title gin_trgm_ops);

DROP TRIGGER IF EXISTS projects_updated_at ON public.projects;
CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ════════════════════════════════════════════════════════════════════
-- PROJECT VERSIONS
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.project_versions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  version_num   INTEGER NOT NULL,
  html_url      TEXT NOT NULL,
  metadata      JSONB DEFAULT '{}'::JSONB,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (project_id, version_num)
);

CREATE INDEX IF NOT EXISTS idx_versions_project ON public.project_versions(project_id);

-- ════════════════════════════════════════════════════════════════════
-- PUBLISHED SITES
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.websites (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  version_id      UUID REFERENCES public.project_versions(id),
  slug            TEXT UNIQUE,
  title           TEXT NOT NULL DEFAULT 'Love Story',
  html_url        TEXT NOT NULL,
  og_image_url    TEXT,
  is_public       BOOLEAN DEFAULT TRUE NOT NULL,
  password_hash   TEXT,
  views           BIGINT DEFAULT 0 NOT NULL,
  unique_visitors BIGINT DEFAULT 0 NOT NULL,
  status          TEXT DEFAULT 'active' NOT NULL
                    CHECK (status IN ('active', 'inactive', 'deleted')),
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT slug_format CHECK (slug ~ '^[a-z0-9-]+$' OR slug IS NULL)
);

CREATE INDEX IF NOT EXISTS idx_sites_slug      ON public.websites(slug);
CREATE INDEX IF NOT EXISTS idx_sites_project   ON public.websites(project_id);
CREATE INDEX IF NOT EXISTS idx_sites_user      ON public.websites(user_id);
CREATE INDEX IF NOT EXISTS idx_sites_status    ON public.websites(status);

DROP TRIGGER IF EXISTS sites_updated_at ON public.websites;
CREATE TRIGGER sites_updated_at
  BEFORE UPDATE ON public.websites
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ════════════════════════════════════════════════════════════════════
-- ASSETS
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.assets (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  project_id   UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  type         TEXT NOT NULL
                 CHECK (type IN ('image', 'video', 'audio', 'html', 'zip', 'thumbnail')),
  filename     TEXT NOT NULL,
  r2_key       TEXT UNIQUE NOT NULL,
  url          TEXT NOT NULL,
  size_bytes   BIGINT,
  mime_type    TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_assets_user    ON public.assets(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_project ON public.assets(project_id);

-- ════════════════════════════════════════════════════════════════════
-- ANALYTICS EVENTS
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id     UUID NOT NULL REFERENCES public.websites(id) ON DELETE CASCADE,
  event_type  TEXT NOT NULL
                CHECK (event_type IN ('view', 'download', 'qr_scan', 'share')),
  country     TEXT,
  city        TEXT,
  device      TEXT CHECK (device IN ('desktop', 'tablet', 'mobile', 'unknown')),
  os          TEXT,
  browser     TEXT,
  referrer    TEXT,
  ip_hash     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_analytics_site    ON public.analytics_events(site_id);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON public.analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_type    ON public.analytics_events(event_type);

-- ════════════════════════════════════════════════════════════════════
-- SUBSCRIPTIONS
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  plan         TEXT DEFAULT 'free' NOT NULL,
  status       TEXT DEFAULT 'active' NOT NULL
                 CHECK (status IN ('active', 'past_due', 'canceled', 'trialing')),
  stripe_id    TEXT UNIQUE,
  expires_at   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

DROP TRIGGER IF EXISTS subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ════════════════════════════════════════════════════════════════════
-- ACTIVITY LOGS
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action       TEXT NOT NULL,
  resource     TEXT,
  resource_id  UUID,
  metadata     JSONB DEFAULT '{}'::JSONB,
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_logs_user    ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_created ON public.activity_logs(created_at DESC);

-- ════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ════════════════════════════════════════════════════════════════════

-- Users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_read_own"   ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;
DROP POLICY IF EXISTS "users_insert_own" ON public.users;
CREATE POLICY "users_read_own"   ON public.users FOR SELECT  USING (auth.uid() = id);
CREATE POLICY "users_update_own" ON public.users FOR UPDATE  USING (auth.uid() = id);
CREATE POLICY "users_insert_own" ON public.users FOR INSERT  WITH CHECK (auth.uid() = id);

-- Projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "projects_all_own" ON public.projects;
CREATE POLICY "projects_all_own" ON public.projects
  USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Project Versions
ALTER TABLE public.project_versions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "versions_read_own" ON public.project_versions;
CREATE POLICY "versions_read_own" ON public.project_versions FOR SELECT
  USING (project_id IN (
    SELECT id FROM public.projects WHERE user_id = auth.uid()
  ));

-- Published Sites
ALTER TABLE public.websites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_active_sites" ON public.websites;
DROP POLICY IF EXISTS "owners_manage_sites"      ON public.websites;
CREATE POLICY "public_read_active_sites" ON public.websites FOR SELECT
  USING (status = 'active' AND is_public = TRUE);
CREATE POLICY "owners_manage_sites" ON public.websites
  USING (auth.uid() = user_id);

-- Assets
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "assets_own" ON public.assets;
CREATE POLICY "assets_own" ON public.assets USING (auth.uid() = user_id);

-- Analytics
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "analytics_insert_public" ON public.analytics_events;
DROP POLICY IF EXISTS "analytics_read_owner"    ON public.analytics_events;
CREATE POLICY "analytics_insert_public" ON public.analytics_events FOR INSERT WITH CHECK (true);
CREATE POLICY "analytics_read_owner"    ON public.analytics_events FOR SELECT
  USING (site_id IN (SELECT id FROM public.websites WHERE user_id = auth.uid()));

-- Subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "subscriptions_own" ON public.subscriptions;
CREATE POLICY "subscriptions_own" ON public.subscriptions USING (auth.uid() = user_id);

-- Activity Logs
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "logs_read_own" ON public.activity_logs;
CREATE POLICY "logs_read_own" ON public.activity_logs FOR SELECT USING (auth.uid() = user_id);

-- ════════════════════════════════════════════════════════════════════
-- FUNCTIONS
-- ════════════════════════════════════════════════════════════════════

-- Atomic view counter increment
CREATE OR REPLACE FUNCTION increment_site_views(site_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.websites
  SET views = views + 1
  WHERE id = site_id AND status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION increment_site_views(UUID) TO anon;
GRANT EXECUTE ON FUNCTION increment_site_views(UUID) TO authenticated;

-- ════════════════════════════════════════════════════════════════════
-- PERFORMANCE INDEXES
-- ════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_projects_user_status
  ON public.projects(user_id, status)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_sites_user_status
  ON public.websites(user_id, status);

CREATE INDEX IF NOT EXISTS idx_analytics_site_type_time
  ON public.analytics_events(site_id, event_type, created_at DESC);

-- ════════════════════════════════════════════════════════════════════
-- STORAGE: RLS POLICIES
-- ════════════════════════════════════════════════════════════════════

DO $$
DECLARE
  policies TEXT[] := ARRAY[
    'uploads_insert_own', 'uploads_select_own', 'uploads_update_own', 'uploads_delete_own',
    'published_assets_select_public', 'published_assets_insert_own',
    'published_assets_update_own', 'published_assets_delete_own',
    'thumbnails_select_public', 'thumbnails_insert_own',
    'thumbnails_update_own', 'thumbnails_delete_own'
  ];
  p TEXT;
BEGIN
  FOREACH p IN ARRAY policies LOOP
    BEGIN
      EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', p);
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END LOOP;
END $$;

-- uploads (private bucket)
CREATE POLICY "uploads_insert_own" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'uploads' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "uploads_select_own" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'uploads' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "uploads_update_own" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'uploads' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "uploads_delete_own" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'uploads' AND (storage.foldername(name))[1] = auth.uid()::text);

-- published-assets (public bucket)
CREATE POLICY "published_assets_select_public" ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'published-assets');

CREATE POLICY "published_assets_insert_own" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'published-assets' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "published_assets_update_own" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'published-assets' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "published_assets_delete_own" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'published-assets' AND (storage.foldername(name))[1] = auth.uid()::text);

-- thumbnails (public bucket)
CREATE POLICY "thumbnails_select_public" ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'thumbnails');

CREATE POLICY "thumbnails_insert_own" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'thumbnails' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "thumbnails_update_own" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'thumbnails' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "thumbnails_delete_own" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'thumbnails' AND (storage.foldername(name))[1] = auth.uid()::text);

-- ════════════════════════════════════════════════════════════════════
-- BACKFILL: Create public.users rows for any existing auth.users
-- ════════════════════════════════════════════════════════════════════
INSERT INTO public.users (id, email, name, avatar_url)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name'),
  au.raw_user_meta_data->>'avatar_url'
FROM auth.users au
WHERE NOT EXISTS (SELECT 1 FROM public.users pu WHERE pu.id = au.id)
ON CONFLICT (id) DO NOTHING;
