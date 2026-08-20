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

DROP POLICY IF EXISTS "Public can view active promotional videos" ON public.promotional_videos;
DROP POLICY IF EXISTS "Admins have full access to promotional videos" ON public.promotional_videos;
DROP POLICY IF EXISTS "Anyone can insert promotional video events" ON public.promotional_video_events;
DROP POLICY IF EXISTS "Admins can view promotional video events" ON public.promotional_video_events;
DROP POLICY IF EXISTS "Permissive promotional videos table policy" ON public.promotional_videos;

-- Public can view active promotional videos
CREATE POLICY "Public can view active promotional videos"
  ON public.promotional_videos
  FOR SELECT
  TO public
  USING (
    is_active = true 
    AND (start_at IS NULL OR start_at <= now())
    AND (end_at IS NULL OR end_at >= now())
  );

-- Only authenticated admins or service_role can modify promotional videos
CREATE POLICY "Admins have full access to promotional videos"
  ON public.promotional_videos
  FOR ALL
  TO authenticated
  USING (
    auth.role() = 'service_role' OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.id = auth.uid()
      AND public.users.role IN ('admin', 'superadmin')
    )
  )
  WITH CHECK (
    auth.role() = 'service_role' OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.id = auth.uid()
      AND public.users.role IN ('admin', 'superadmin')
    )
  );

-- Anyone can log analytics events
CREATE POLICY "Anyone can insert promotional video events"
  ON public.promotional_video_events
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Admins can read analytics events
CREATE POLICY "Admins can view promotional video events"
  ON public.promotional_video_events
  FOR SELECT
  TO authenticated
  USING (
    auth.role() = 'service_role' OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.id = auth.uid()
      AND public.users.role IN ('admin', 'superadmin')
    )
  );

-- 5. Storage Bucket Setup & Permissive Policies
INSERT INTO storage.buckets (id, name, public)
VALUES ('promotional-videos', 'promotional-videos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public access for promotional videos storage" ON storage.objects;
DROP POLICY IF EXISTS "Admin write access for promotional videos storage" ON storage.objects;
DROP POLICY IF EXISTS "Admin update access for promotional videos storage" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete access for promotional videos storage" ON storage.objects;
DROP POLICY IF EXISTS "Allow upload to promotional-videos storage" ON storage.objects;
DROP POLICY IF EXISTS "Allow update in promotional-videos storage" ON storage.objects;
DROP POLICY IF EXISTS "Allow delete in promotional-videos storage" ON storage.objects;
DROP POLICY IF EXISTS "Permissive promotional videos storage policy" ON storage.objects;

-- Public can read objects in promotional-videos bucket
CREATE POLICY "Public access for promotional videos storage"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'promotional-videos');

-- Only authenticated admins can write/delete objects in promotional-videos bucket
CREATE POLICY "Admin write access for promotional videos storage"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'promotional-videos' AND (
      auth.role() = 'service_role' OR
      EXISTS (
        SELECT 1 FROM public.users
        WHERE public.users.id = auth.uid()
        AND public.users.role IN ('admin', 'superadmin')
      )
    )
  );

CREATE POLICY "Admin update access for promotional videos storage"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'promotional-videos' AND (
      auth.role() = 'service_role' OR
      EXISTS (
        SELECT 1 FROM public.users
        WHERE public.users.id = auth.uid()
        AND public.users.role IN ('admin', 'superadmin')
      )
    )
  );

CREATE POLICY "Admin delete access for promotional videos storage"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'promotional-videos' AND (
      auth.role() = 'service_role' OR
      EXISTS (
        SELECT 1 FROM public.users
        WHERE public.users.id = auth.uid()
        AND public.users.role IN ('admin', 'superadmin')
      )
    )
  );
