-- ─────────────────────────────────────────────────────────────────
-- Migration 012 FINAL: Based on ACTUAL production schema
--
-- Actual websites table columns (verified 2026-08-20):
--   id, user_id, title, slug, website_type, status,
--   blueprint_json, preview_image, published_html,
--   created_at, updated_at
--
-- Missing columns to add: ONLY published_at
-- Everything else already exists.
-- ─────────────────────────────────────────────────────────────────

-- ── 1. Add published_at (the only missing column) ─────────────────
ALTER TABLE public.websites
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

-- ── 2. Backfill published_at for existing active sites ────────────
UPDATE public.websites
SET published_at = created_at
WHERE published_at IS NULL AND status = 'active';

-- ── 3. Index ──────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_websites_published ON public.websites(published_at DESC);

-- ── 4. Fix RLS: is_public column does NOT exist in production ──────
-- The original policy "public_read_active_sites" referenced is_public
-- which doesn't exist. Re-create it using only status = 'active'.
DROP POLICY IF EXISTS "public_read_active_sites" ON public.websites;
DROP POLICY IF EXISTS "websites_select_owner" ON public.websites;
DROP POLICY IF EXISTS "websites_insert_owner" ON public.websites;
DROP POLICY IF EXISTS "websites_update_owner" ON public.websites;
DROP POLICY IF EXISTS "websites_delete_owner" ON public.websites;
DROP POLICY IF EXISTS "owners_manage_sites" ON public.websites;

-- Anyone can read active published sites (no is_public check — column doesn't exist)
CREATE POLICY "public_read_active_sites" ON public.websites
  FOR SELECT USING (status = 'active');

-- Owner can view all their sites (including inactive/trash)
CREATE POLICY "websites_select_owner" ON public.websites
  FOR SELECT USING (auth.uid() = user_id);

-- Owner can insert their own sites
CREATE POLICY "websites_insert_owner" ON public.websites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Owner can update their own sites
CREATE POLICY "websites_update_owner" ON public.websites
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Owner can delete their own sites
CREATE POLICY "websites_delete_owner" ON public.websites
  FOR DELETE USING (auth.uid() = user_id);
