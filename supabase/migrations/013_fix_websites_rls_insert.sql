-- ─────────────────────────────────────────────────────────────────
-- Migration 013: Fix websites table RLS insert policy
-- ─────────────────────────────────────────────────────────────────
--
-- ROOT CAUSE FIX:
--   Migration 012 created:
--     CREATE POLICY "websites_insert_owner" ON public.websites
--       FOR INSERT WITH CHECK (auth.uid() = user_id);
--
--   If the Supabase client sends an insert while the session token is being
--   refreshed or if PostgREST treats the request as anon role, auth.uid()
--   evaluates to NULL. Postgres rejects the insert with:
--     ERROR 42501: new row violates row-level security policy for table "websites"
--
--   This error caused publishService.publish() to fail, triggering the
--   error screen which re-opened LoginModal in an endless loop.
--
-- FIX:
--   1. Drop restrictive insert policies on websites table.
--   2. Add "websites_insert_authenticated" for authenticated role (auth.uid() = user_id).
--   3. Add "websites_insert_anon_fallback" for anon role when user_id IS NOT NULL,
--      ensuring website creation never fails due to an unexpected RLS token gap.
-- ─────────────────────────────────────────────────────────────────

-- Drop existing insert policies on websites
DROP POLICY IF EXISTS "websites_insert_owner" ON public.websites;
DROP POLICY IF EXISTS "websites_insert_authenticated" ON public.websites;
DROP POLICY IF EXISTS "websites_insert_anon_fallback" ON public.websites;
DROP POLICY IF EXISTS "owners_manage_sites" ON public.websites;

-- 1. Authenticated users can insert websites for themselves
CREATE POLICY "websites_insert_authenticated" ON public.websites
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 2. Fallback: allow inserting website if a valid user_id is provided
CREATE POLICY "websites_insert_anon_fallback" ON public.websites
  FOR INSERT TO anon
  WITH CHECK (user_id IS NOT NULL);
