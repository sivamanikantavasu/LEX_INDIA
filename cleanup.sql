-- LexIndia Database Architecture "Clean Slate" Script
-- WARNING: This will permanently delete all LexIndia data and tables.
-- Run this in your Supabase SQL Editor to reset your architecture.

-- 1. Drop Triggers & Functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 2. Drop all Tables (CASCADE handles dependent objects)
DROP TABLE IF EXISTS public.user_achievements CASCADE;
DROP TABLE IF EXISTS public.achievements CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.likes CASCADE;
DROP TABLE IF EXISTS public.comments CASCADE;
DROP TABLE IF EXISTS public.sync_logs CASCADE;
DROP TABLE IF EXISTS public.broadcasts CASCADE;
DROP TABLE IF EXISTS public.sessions CASCADE;
DROP TABLE IF EXISTS public.advisory_requests CASCADE;
DROP TABLE IF EXISTS public.forum_posts CASCADE;
DROP TABLE IF EXISTS public.forum_threads CASCADE;
DROP TABLE IF EXISTS public.bookmarks CASCADE;
DROP TABLE IF EXISTS public.quiz_results CASCADE;
DROP TABLE IF EXISTS public.questions CASCADE;
DROP TABLE IF EXISTS public.quizzes CASCADE;
DROP TABLE IF EXISTS public.articles CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 3. Drop Custom Types
DROP TYPE IF EXISTS public.user_role CASCADE;
DROP TYPE IF EXISTS public.content_status CASCADE;

-- Optional: Drop any remaining sequences or legacy tables
-- DROP SEQUENCE IF EXISTS ...;

-- VERIFICATION: The public schema should now be empty of LexIndia components.
