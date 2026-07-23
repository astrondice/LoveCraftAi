-- ═══════════════════════════════════════════════════════════════
-- LoveCraft.ai — Production Database Schema
-- Supabase / PostgreSQL
-- ═══════════════════════════════════════════════════════════════

-- ─── Extensions ────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for full-text search

-- ─── Updated-at trigger helper ─────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ════════════════════════════════════════════════════════════════
-- USERS (extends Supabase auth.users)
-- ════════════════════════════════════════════════════════════════
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

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create user row on Supabase Auth signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ════════════════════════════════════════════════════════════════
-- PROJECTS
-- ════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.projects (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title           TEXT NOT NULL DEFAULT 'Untitled Love Story',
  slug            TEXT,
  status          TEXT DEFAULT 'draft' NOT NULL
                    CHECK (status IN ('draft', 'published', 'archived')),
  is_favorite     BOOLEAN DEFAULT FALSE NOT NULL,
  thumbnail_url   TEXT,
  -- Story fields
  name1           TEXT DEFAULT '',
  name2           TEXT DEFAULT '',
  date            TEXT DEFAULT '',
  duration        TEXT DEFAULT '',
  memory          TEXT DEFAULT '',
  message         TEXT DEFAULT '',
  theme_id        TEXT DEFAULT 'cosmic' NOT NULL,
  -- Asset references (Supabase Storage / R2 URLs after upload)
  photo_urls      JSONB DEFAULT '[]'::JSONB NOT NULL,
  music_url       TEXT,
  video_url       TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at      TIMESTAMPTZ,
  CONSTRAINT slug_format CHECK (slug ~ '^[a-z0-9-]+$' OR slug IS NULL)
);

CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_projects_status  ON public.projects(status);
CREATE INDEX idx_projects_created ON public.projects(created_at DESC);
CREATE INDEX idx_projects_search  ON public.projects USING GIN (title gin_trgm_ops);

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ════════════════════════════════════════════════════════════════
-- PROJECT VERSIONS (immutable snapshots)
-- ════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.project_versions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  version_num   INTEGER NOT NULL,
  html_url      TEXT NOT NULL,           -- R2 URL of the generated HTML
  metadata      JSONB DEFAULT '{}'::JSONB,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (project_id, version_num)
);

CREATE INDEX idx_versions_project ON public.project_versions(project_id);

-- ════════════════════════════════════════════════════════════════
-- PUBLISHED SITES
-- ════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.websites (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  version_id      UUID REFERENCES public.project_versions(id),
  slug            TEXT UNIQUE,
  title           TEXT NOT NULL DEFAULT 'Love Story',
  html_url        TEXT NOT NULL,         -- R2 signed URL
  og_image_url    TEXT,
  is_public       BOOLEAN DEFAULT TRUE NOT NULL,
  password_hash   TEXT,                  -- bcrypt hash if password-protected
  views           BIGINT DEFAULT 0 NOT NULL,
  unique_visitors BIGINT DEFAULT 0 NOT NULL,
  status          TEXT DEFAULT 'active' NOT NULL
                    CHECK (status IN ('active', 'inactive', 'deleted')),
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT slug_format CHECK (slug ~ '^[a-z0-9-]+$' OR slug IS NULL)
);

CREATE INDEX idx_sites_slug      ON public.websites(slug);
CREATE INDEX idx_sites_project   ON public.websites(project_id);
CREATE INDEX idx_sites_user      ON public.websites(user_id);
CREATE INDEX idx_sites_status    ON public.websites(status);

CREATE TRIGGER sites_updated_at
  BEFORE UPDATE ON public.websites
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ════════════════════════════════════════════════════════════════
-- ASSETS
-- ════════════════════════════════════════════════════════════════
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

CREATE INDEX idx_assets_user    ON public.assets(user_id);
CREATE INDEX idx_assets_project ON public.assets(project_id);

-- ════════════════════════════════════════════════════════════════
-- ANALYTICS EVENTS
-- ════════════════════════════════════════════════════════════════
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
  ip_hash     TEXT,   -- SHA-256 of IP, for unique visitor deduplication
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_analytics_site    ON public.analytics_events(site_id);
CREATE INDEX idx_analytics_created ON public.analytics_events(created_at DESC);
CREATE INDEX idx_analytics_type    ON public.analytics_events(event_type);

-- ════════════════════════════════════════════════════════════════
-- CUSTOM DOMAINS (architecture-ready, UI hidden initially)
-- ════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.custom_domains (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  project_id   UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  domain       TEXT UNIQUE NOT NULL,
  verified     BOOLEAN DEFAULT FALSE NOT NULL,
  ssl_status   TEXT DEFAULT 'pending'
                 CHECK (ssl_status IN ('pending', 'active', 'failed')),
  cf_zone_id   TEXT,
  txt_record   TEXT,   -- verification TXT value
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER domains_updated_at
  BEFORE UPDATE ON public.custom_domains
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ════════════════════════════════════════════════════════════════
-- SUBSCRIPTIONS
-- ════════════════════════════════════════════════════════════════
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

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ════════════════════════════════════════════════════════════════
-- ACTIVITY LOGS
-- ════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action       TEXT NOT NULL,
  resource     TEXT,
  resource_id  UUID,
  metadata     JSONB DEFAULT '{}'::JSONB,
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_logs_user    ON public.activity_logs(user_id);
CREATE INDEX idx_logs_created ON public.activity_logs(created_at DESC);

-- ════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ════════════════════════════════════════════════════════════════

-- Users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_read_own"   ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_update_own" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "projects_all_own" ON public.projects
  USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Project Versions
ALTER TABLE public.project_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "versions_read_own" ON public.project_versions FOR SELECT
  USING (project_id IN (
    SELECT id FROM public.projects WHERE user_id = auth.uid()
  ));

-- Published Sites
ALTER TABLE public.websites ENABLE ROW LEVEL SECURITY;
-- Public can read active public sites
CREATE POLICY "public_read_active_sites" ON public.websites FOR SELECT
  USING (status = 'active' AND is_public = TRUE);
-- Owner can do everything
CREATE POLICY "owners_manage_sites" ON public.websites
  USING (auth.uid() = user_id);

-- Assets
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "assets_own" ON public.assets USING (auth.uid() = user_id);

-- Analytics (public writes for views, owner reads)
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "analytics_insert_public" ON public.analytics_events FOR INSERT
  WITH CHECK (true);
CREATE POLICY "analytics_read_owner" ON public.analytics_events FOR SELECT
  USING (site_id IN (
    SELECT id FROM public.websites WHERE user_id = auth.uid()
  ));

-- Custom Domains
ALTER TABLE public.custom_domains ENABLE ROW LEVEL SECURITY;
CREATE POLICY "domains_own" ON public.custom_domains USING (auth.uid() = user_id);

-- Subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subscriptions_own" ON public.subscriptions USING (auth.uid() = user_id);

-- Activity Logs (insert-only from service role)
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "logs_read_own" ON public.activity_logs FOR SELECT
  USING (auth.uid() = user_id);
