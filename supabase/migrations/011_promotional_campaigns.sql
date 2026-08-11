-- ─────────────────────────────────────────────────────────────────
-- Migration 011: Promotional Campaigns & Raksha Bandhan System
-- ─────────────────────────────────────────────────────────────────

-- 1. Promotional Campaigns Table
CREATE TABLE IF NOT EXISTS public.promotional_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT DEFAULT 'raksha-bandhan',
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 10,
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Index for active campaign lookup
CREATE INDEX IF NOT EXISTS idx_promo_campaigns_active 
ON public.promotional_campaigns (is_active, category, priority DESC);

-- 2. Extend promotional_videos table to support campaign grouping and images
ALTER TABLE public.promotional_videos 
ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES public.promotional_campaigns(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS media_type TEXT DEFAULT 'video', -- 'video' | 'image'
ADD COLUMN IF NOT EXISTS subtitle TEXT;

-- 3. RLS for Promotional Campaigns
ALTER TABLE public.promotional_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active campaigns"
  ON public.promotional_campaigns
  FOR SELECT
  USING (
    is_active = true 
    AND (start_at IS NULL OR start_at <= now())
    AND (end_at IS NULL OR end_at >= now())
  );

CREATE POLICY "Admins have full access to campaigns"
  ON public.promotional_campaigns
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.id = auth.uid()
      AND public.users.role IN ('admin', 'superadmin')
    )
  );

-- 4. Seed Flagship Raksha Bandhan 2026 Campaign Data
INSERT INTO public.promotional_campaigns (id, name, slug, category, description, is_active, priority)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-111111111111',
  'Raksha Bandhan 2026 Collection',
  'raksha-bandhan-2026',
  'raksha-bandhan',
  'Celebrate the purest brother-sister bond with cinematic memory websites.',
  true,
  100
) ON CONFLICT (slug) DO NOTHING;

-- Seed the 6 Flagship Raksha Bandhan Assets
INSERT INTO public.promotional_videos (
  campaign_id, title, subtitle, description, media_type, video_url, poster_url, 
  cta_text, cta_url, category, aspect_ratio, is_active, priority, display_order
)
VALUES
(
  'a1b2c3d4-e5f6-7890-abcd-111111111111',
  'The Purest Bond Ever',
  'A bond that time can''t break',
  'Golden sacred thread animations, childhood throwback photo frames, and documentary storytelling.',
  'image',
  'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1200&q=80',
  'Explore Raksha Bandhan Templates',
  '/templates/raksha-bandhan',
  'raksha-bandhan',
  '16:9',
  true,
  100,
  1
),
(
  'a1b2c3d4-e5f6-7890-abcd-111111111111',
  'Threads of Love',
  'Handcrafted memories, wrapped in love',
  'Handcrafted scrapbook aesthetic with deckled paper edges, polaroid memories, and marigold silk accents.',
  'image',
  'https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&w=1200&q=80',
  'Explore Raksha Bandhan Templates',
  '/templates/raksha-bandhan',
  'raksha-bandhan',
  '16:9',
  true,
  90,
  2
),
(
  'a1b2c3d4-e5f6-7890-abcd-111111111111',
  'Our Childhood',
  'The best memories were made together',
  'Retro film layout designed to showcase silly childhood fights, shared secrets, and growing up together.',
  'image',
  'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1200&q=80',
  'Explore Raksha Bandhan Templates',
  '/templates/raksha-bandhan',
  'raksha-bandhan',
  '16:9',
  true,
  80,
  3
),
(
  'a1b2c3d4-e5f6-7890-abcd-111111111111',
  'Miles Apart, Hearts Together',
  'No distance can weaken this bond',
  'Designed for siblings living across different cities or countries to celebrate Rakhi virtually.',
  'image',
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
  'Explore Raksha Bandhan Templates',
  '/templates/raksha-bandhan',
  'raksha-bandhan',
  '16:9',
  true,
  70,
  4
),
(
  'a1b2c3d4-e5f6-7890-abcd-111111111111',
  'Dear Brother / Dear Sister',
  'Thank you for being my forever friend',
  'An elegant, letterform tribute experience with unfolding paper presentation, ink text reveal, and wax seal.',
  'image',
  'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1200&q=80',
  'Explore Raksha Bandhan Templates',
  '/templates/raksha-bandhan',
  'raksha-bandhan',
  '16:9',
  true,
  60,
  5
),
(
  'a1b2c3d4-e5f6-7890-abcd-111111111111',
  'Forever Together',
  'Different yet perfect, just like us',
  'Flagship documentary masterpiece with chapter navigation, film progress, and movie credits ending.',
  'image',
  'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80',
  'Explore Raksha Bandhan Templates',
  '/templates/raksha-bandhan',
  'raksha-bandhan',
  '16:9',
  true,
  50,
  6
)
ON CONFLICT DO NOTHING;
