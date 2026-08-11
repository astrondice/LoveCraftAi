-- ─────────────────────────────────────────────────────────────────
-- Migration 009: Production Template Lifecycle & Security Rules
-- Enforces status field ('draft', 'development', 'review', 'testing', 'ready', 'published', 'archived')
-- Ensures users ONLY see published templates while admins can manage unpublished templates
-- ─────────────────────────────────────────────────────────────────

-- ── 1. Add status column to templates table ───────────────────────
ALTER TABLE public.templates 
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' NOT NULL;

-- Drop existing constraint if present and add strict status CHECK
ALTER TABLE public.templates DROP CONSTRAINT IF EXISTS templates_status_check;
ALTER TABLE public.templates ADD CONSTRAINT templates_status_check
  CHECK (status IN ('draft', 'development', 'review', 'testing', 'ready', 'published', 'archived'));

-- ── 2. Create Index on status & category_slug ─────────────────────
CREATE INDEX IF NOT EXISTS idx_templates_status_category 
  ON public.templates(status, category_slug);

-- ── 3. Update Row Level Security Policies for templates ────────────
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- Drop loose public read policy if exists
DROP POLICY IF EXISTS "public_read_templates" ON public.templates;

-- Public users can ONLY read published templates
CREATE POLICY "public_read_published_templates" ON public.templates
  FOR SELECT USING (status = 'published');

-- Admins and Superadmins can read all templates regardless of status
CREATE POLICY "admins_read_all_templates" ON public.templates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- Admin management policy for INSERT / UPDATE / DELETE
CREATE POLICY "admins_manage_all_templates" ON public.templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- ── 4. Set Initial Statuses for Pre-Seeded Templates ──────────────
-- 10 Original Love Templates & 6 Flagship Raksha Bandhan Templates are Published
UPDATE public.templates 
SET status = 'published' 
WHERE id IN (
  'cosmic', 'memories', 'rose', 'dream', 'cinematic', 'proposal', 'moonlight', 'golden', 'sakura', 'eternal',
  'rakhi-bond', 'rakhi-threads', 'rakhi-childhood', 'rakhi-miles', 'rakhi-brother', 'rakhi-memories'
);

-- Archive unused / merged placeholder templates
UPDATE public.templates
SET status = 'archived'
WHERE id IN ('rakhi-sister', 'rakhi-promise');


