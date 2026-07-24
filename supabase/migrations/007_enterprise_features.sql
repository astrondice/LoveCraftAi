-- ─────────────────────────────────────────────────────────────────
-- Migration 007: Enterprise Features — Trash Bin, Deployments & Quotas
-- ─────────────────────────────────────────────────────────────────

-- ── 1. Update public.websites status check to include 'trash' ────
ALTER TABLE public.websites DROP CONSTRAINT IF EXISTS websites_status_check;
ALTER TABLE public.websites ADD CONSTRAINT websites_status_check
  CHECK (status IN ('active', 'inactive', 'deleted', 'trash'));

-- ── 2. Create Deployments table for Publish History & Rollbacks ────
CREATE TABLE IF NOT EXISTS public.deployments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id         UUID NOT NULL REFERENCES public.websites(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  version_num     INTEGER NOT NULL DEFAULT 1,
  html_url        TEXT NOT NULL,
  title           TEXT NOT NULL,
  snapshot_json   JSONB DEFAULT '{}'::JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_deployments_site ON public.deployments(site_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_deployments_user ON public.deployments(user_id);

ALTER TABLE public.deployments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "deployments_select_owner" ON public.deployments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "deployments_insert_owner" ON public.deployments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ── 3. Create User Quotas table ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_quotas (
  user_id           UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  plan              TEXT DEFAULT 'free' NOT NULL CHECK (plan IN ('free', 'pro', 'enterprise')),
  websites_limit    INTEGER DEFAULT 3 NOT NULL,
  ai_gen_limit      INTEGER DEFAULT 100 NOT NULL,
  ai_gen_count      INTEGER DEFAULT 0 NOT NULL,
  storage_bytes_max BIGINT DEFAULT 52428800 NOT NULL, -- 50 MB for free
  updated_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.user_quotas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quotas_select_owner" ON public.user_quotas
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "quotas_upsert_owner" ON public.user_quotas
  FOR ALL USING (auth.uid() = user_id);
