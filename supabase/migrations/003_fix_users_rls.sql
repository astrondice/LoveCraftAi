-- ─────────────────────────────────────────────────────────────────
-- Migration 003: Fix public.users RLS to allow self-upsert
-- ─────────────────────────────────────────────────────────────────
--
-- ROOT CAUSE:
--   001_initial.sql only created SELECT and UPDATE policies on public.users.
--   There was NO INSERT policy for the authenticated role.
--
--   Supabase's handle_new_user() trigger runs as SECURITY DEFINER so it
--   bypasses RLS — the trigger inserts work fine.
--
--   However, when the frontend's auth.service.ts tries to upsert a missing
--   profile row (e.g. for an OAuth user whose trigger failed, or a user
--   created before this migration), the upsert runs as the authenticated
--   role and is BLOCKED by RLS with no INSERT policy → PostgREST 403/404.
--
-- FIX:
--   Add an INSERT policy so authenticated users can create their own row.
--   The USING/WITH CHECK clause `auth.uid() = id` ensures users can only
--   insert a row for themselves.
-- ─────────────────────────────────────────────────────────────────

-- Allow authenticated users to insert their own profile row.
-- This is safe: WITH CHECK (auth.uid() = id) prevents inserting rows
-- for other users.
CREATE POLICY "users_insert_own"
  ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ─────────────────────────────────────────────────────────────────
-- SAFETY NET: For any existing auth.users rows that have no
-- corresponding public.users row, backfill them now.
-- This is idempotent (INSERT ... ON CONFLICT DO NOTHING).
-- ─────────────────────────────────────────────────────────────────
INSERT INTO public.users (id, email, name, avatar_url)
SELECT
  au.id,
  au.email,
  COALESCE(
    au.raw_user_meta_data->>'full_name',
    au.raw_user_meta_data->>'name'
  ),
  au.raw_user_meta_data->>'avatar_url'
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.users pu WHERE pu.id = au.id
)
ON CONFLICT (id) DO NOTHING;
