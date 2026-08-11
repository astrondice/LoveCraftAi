-- ─────────────────────────────────────────────────────────────────
-- Migration 008: Multi-Category Architecture & Template Registry
-- Safely extends LoveCraft.ai database schema with 100% backward compatibility
-- ─────────────────────────────────────────────────────────────────

-- ── 1. Create Public Categories Table ────────────────────────────
CREATE TABLE IF NOT EXISTS public.categories (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             TEXT UNIQUE NOT NULL,
  name             TEXT NOT NULL,
  emoji            TEXT DEFAULT '✨' NOT NULL,
  description      TEXT,
  badge            TEXT,
  is_featured      BOOLEAN DEFAULT FALSE NOT NULL,
  is_hidden        BOOLEAN DEFAULT FALSE NOT NULL,
  sort_order       INTEGER DEFAULT 0 NOT NULL,
  hero_title       TEXT,
  hero_description TEXT,
  accent_gradient  TEXT,
  popular_tags     JSONB DEFAULT '[]'::JSONB NOT NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_sort ON public.categories(sort_order ASC);

CREATE TRIGGER categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── 2. Create Public Templates Table ─────────────────────────────
CREATE TABLE IF NOT EXISTS public.templates (
  id               TEXT PRIMARY KEY,
  title            TEXT NOT NULL,
  slug             TEXT UNIQUE NOT NULL,
  category_slug    TEXT REFERENCES public.categories(slug) ON UPDATE CASCADE ON DELETE SET NULL,
  category_name    TEXT NOT NULL,
  sub_category     TEXT,
  thumbnail        TEXT NOT NULL,
  description      TEXT NOT NULL,
  vibe             TEXT,
  atmosphere       TEXT,
  featured         BOOLEAN DEFAULT FALSE NOT NULL,
  badge            TEXT,
  tags             JSONB DEFAULT '[]'::JSONB NOT NULL,
  setup_time       TEXT DEFAULT '2 mins' NOT NULL,
  perfect_for      TEXT,
  features         JSONB DEFAULT '[]'::JSONB NOT NULL,
  pages_included   INTEGER DEFAULT 4 NOT NULL,
  animations       TEXT,
  performance_score INTEGER DEFAULT 99 NOT NULL,
  ai_ready         BOOLEAN DEFAULT TRUE NOT NULL,
  responsive       BOOLEAN DEFAULT TRUE NOT NULL,
  seo_ready        BOOLEAN DEFAULT TRUE NOT NULL,
  dark_mode        BOOLEAN DEFAULT TRUE NOT NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_templates_category ON public.templates(category_slug);
CREATE INDEX IF NOT EXISTS idx_templates_featured ON public.templates(featured);

CREATE TRIGGER templates_updated_at
  BEFORE UPDATE ON public.templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── 3. Extend public.projects safely with category_slug ──────────
ALTER TABLE public.projects 
  ADD COLUMN IF NOT EXISTS category_slug TEXT DEFAULT 'love' NOT NULL;

CREATE INDEX IF NOT EXISTS idx_projects_category ON public.projects(category_slug);

-- ── 4. Row Level Security Policies ───────────────────────────────
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- Public read access for active categories
CREATE POLICY "public_read_categories" ON public.categories
  FOR SELECT USING (is_hidden = FALSE);

-- Public read access for all templates
CREATE POLICY "public_read_templates" ON public.templates
  FOR SELECT USING (TRUE);

-- Admin write policies
CREATE POLICY "admins_manage_categories" ON public.categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "admins_manage_templates" ON public.templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- ── 5. Seed Pre-Defined Categories ───────────────────────────────
INSERT INTO public.categories (slug, name, emoji, description, badge, is_featured, sort_order, hero_title, hero_description)
VALUES
  ('all', 'All Templates', '✨', 'Browse every handcrafted website experience across all categories.', NULL, TRUE, 0, 'Explore Endless Possibilities', 'Choose from our complete marketplace of handcrafted digital experiences.'),
  ('love', 'Love', '❤️', 'Cinematic digital love stories, proposals, anniversaries & romance memory boxes.', 'Core', TRUE, 1, 'Cinematic Love & Romance Stories', 'Weave photos, music, and emotional letters into a private, timeless digital love website.'),
  ('raksha-bandhan', 'Raksha Bandhan', '🎀', 'Celebrate the purest brother-sister bond through unforgettable digital experiences.', 'New Collection', TRUE, 2, 'Raksha Bandhan Collection', 'Celebrate the purest brother–sister bond through unforgettable digital memory websites.'),
  ('birthday', 'Birthday', '🎂', 'Joyful birthday celebration portals, video surprise hubs & milestone timeline sites.', 'Popular', TRUE, 3, 'Birthday Celebration Experiences', 'Create unforgettable digital birthday surprises packed with photo galleries and video messages.'),
  ('wedding', 'Wedding', '💍', 'Regal wedding websites, RSVP management, itinerary timelines & gilded vow displays.', NULL, TRUE, 4, 'Regal & Classic Wedding Sites', 'Share your special day with guests through luxurious invitation cards and RSVP forms.'),
  ('business', 'Business', '🏢', 'Modern enterprise landing pages, agency showcases & high-converting service portals.', NULL, FALSE, 5, 'High-Converting Business Sites', 'Elevate your brand with sleek corporate websites and contact forms.'),
  ('portfolio', 'Portfolio', '💼', 'Stunning personal portfolios for designers, creators, photographers & developers.', NULL, TRUE, 6, 'Creative & Professional Portfolios', 'Display your finest work with dynamic masonry galleries and dark mode aesthetics.'),
  ('startup', 'Startup', '🚀', 'High-impact tech startup landing pages, waitlist builders & product launch sites.', 'Hot', FALSE, 7, 'Tech & Product Launch Landing Pages', 'Launch your app or software product with animated hero graphics and waitlist collection.'),
  ('resume', 'Resume', '📄', 'Interactive digital CVs, bio link portals & executive career summary pages.', NULL, FALSE, 8, 'Interactive Digital Resumes', 'Stand out to recruiters and clients with interactive career timelines.'),
  ('saas', 'SaaS', '⚡', 'Ultra-fast software platforms, feature matrix grids & subscription tier pages.', NULL, FALSE, 9, 'SaaS Product & Platform Showcases', 'Convert visitors into trial subscribers with high-converting SaaS landing templates.'),
  ('restaurant', 'Restaurant', '🍽️', 'Mouth-watering digital menus, table reservation forms & culinary experience sites.', NULL, FALSE, 10, 'Culinary & Dining Website Experiences', 'Present dish menus with vivid imagery and online reservation forms.'),
  ('education', 'Education', '🎓', 'Course landing pages, online academy portals & workshop registration sites.', NULL, FALSE, 11, 'Learning & Academy Websites', 'Promote courses, workshops, and educational programs.'),
  ('festival', 'Festival', '🪔', 'Vibrant festive greeting pages, holiday countdowns & celebration hubs.', NULL, FALSE, 12, 'Festive & Cultural Celebration Portals', 'Celebrate festivals with glowing greeting cards and personalized wishes.')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  emoji = EXCLUDED.emoji,
  description = EXCLUDED.description,
  hero_title = EXCLUDED.hero_title,
  hero_description = EXCLUDED.hero_description;
