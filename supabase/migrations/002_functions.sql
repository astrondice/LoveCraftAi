-- ─────────────────────────────────────────────────────────────────
-- Supplementary functions & indexes for production performance
-- ─────────────────────────────────────────────────────────────────

-- Atomic view counter increment (avoids race conditions)
CREATE OR REPLACE FUNCTION increment_site_views(site_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.published_sites
  SET views = views + 1
  WHERE id = site_id AND status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to anon (public view tracking)
GRANT EXECUTE ON FUNCTION increment_site_views(UUID) TO anon;
GRANT EXECUTE ON FUNCTION increment_site_views(UUID) TO authenticated;

-- ── Full-text search on projects ─────────────────────────────────
-- (Already added via pg_trgm in 001_initial.sql)

-- ── Composite index for dashboard query ──────────────────────────
CREATE INDEX IF NOT EXISTS idx_projects_user_status
  ON public.projects(user_id, status)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_sites_user_status
  ON public.published_sites(user_id, status);

-- ── Analytics: partitioning-ready index ──────────────────────────
CREATE INDEX IF NOT EXISTS idx_analytics_site_type_time
  ON public.analytics_events(site_id, event_type, created_at DESC);
