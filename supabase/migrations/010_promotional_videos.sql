-- ─────────────────────────────────────────────────────────────────
-- Migration 010: Admin Controlled Promotional Video System
-- ─────────────────────────────────────────────────────────────────

-- 1. Ensure public.users exists (fallback if initial schema wasn't run)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'user' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Promotional Videos Table
CREATE TABLE IF NOT EXISTS public.promotional_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  poster_url TEXT,
  cta_text TEXT DEFAULT 'Explore Templates',
  cta_url TEXT DEFAULT '/templates',
  category TEXT DEFAULT 'global',
  aspect_ratio TEXT DEFAULT '16:9',
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  autoplay BOOLEAN DEFAULT true,
  muted BOOLEAN DEFAULT true,
  loop BOOLEAN DEFAULT true,
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  duration NUMERIC DEFAULT 0,
  file_size BIGINT DEFAULT 0,
  mime_type TEXT DEFAULT 'video/mp4',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Index for fast query of active promotional videos by category & priority
CREATE INDEX IF NOT EXISTS idx_promo_videos_active_cat 
ON public.promotional_videos (is_active, category, priority DESC, display_order ASC);

-- 3. Promotional Video Analytics Events Table
CREATE TABLE IF NOT EXISTS public.promotional_video_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES public.promotional_videos(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'impression', 'play', '25%', '50%', '75%', 'complete', 'cta_click'
  category TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_promo_events_video 
ON public.promotional_video_events (video_id, event_type);

-- 4. Row Level Security (RLS)
ALTER TABLE public.promotional_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotional_video_events ENABLE ROW LEVEL SECURITY;

-- Drop old policies if existing to avoid conflicts
DROP POLICY IF EXISTS "Public can view active promotional videos" ON public.promotional_videos;
DROP POLICY IF EXISTS "Admins have full access to promotional videos" ON public.promotional_videos;
DROP POLICY IF EXISTS "Anyone can insert promotional video events" ON public.promotional_video_events;
DROP POLICY IF EXISTS "Admins can view promotional video events" ON public.promotional_video_events;
DROP POLICY IF EXISTS "Permissive promotional videos table policy" ON public.promotional_videos;

-- Master permissive policy for promotional_videos table
CREATE POLICY "Permissive promotional videos table policy"
  ON public.promotional_videos
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Anyone can log analytics events
CREATE POLICY "Anyone can insert promotional video events"
  ON public.promotional_video_events
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- 5. Storage Bucket Setup & Permissive Policies
INSERT INTO storage.buckets (id, name, public)
VALUES ('promotional-videos', 'promotional-videos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop all previous policies to avoid conflicts
DROP POLICY IF EXISTS "Public access for promotional videos storage" ON storage.objects;
DROP POLICY IF EXISTS "Admin write access for promotional videos storage" ON storage.objects;
DROP POLICY IF EXISTS "Admin update access for promotional videos storage" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete access for promotional videos storage" ON storage.objects;
DROP POLICY IF EXISTS "Allow upload to promotional-videos storage" ON storage.objects;
DROP POLICY IF EXISTS "Allow update in promotional-videos storage" ON storage.objects;
DROP POLICY IF EXISTS "Allow delete in promotional-videos storage" ON storage.objects;
DROP POLICY IF EXISTS "Permissive promotional videos storage policy" ON storage.objects;

-- Master permissive policy for promotional-videos bucket
CREATE POLICY "Permissive promotional videos storage policy"
  ON storage.objects
  FOR ALL
  TO public
  USING (bucket_id = 'promotional-videos')
  WITH CHECK (bucket_id = 'promotional-videos');
