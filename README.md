# PC Hub Marketing
Standalone local-first Supabase + Vercel-ready content monitoring, calendar, manually recorded social analytics and team KPI app.

## KPI
Weekly completion = published assignments / all assignments × 100.
Every week contributes completion × 25% to the monthly total, capped at 100%.
Monday–Sunday weeks belong to the month of their Monday, including a fifth week within the cap.
Shared assignments count for each assigned member.

## Local setup

1. Copy `.env.example` to `.env.local` and add the PC Hub Supabase project values.
2. Add only the authorized PC Hub staff user IDs to both `NEXT_PUBLIC_ALLOWED_USER_UIDS` and `ALLOWED_USER_UIDS`.
3. Apply `supabase/migrations/001_marketing_posts.sql` to the PC Hub Supabase project when you are ready to connect it.

Nothing in this repository creates a Supabase project, users, tables, or Vercel deployment automatically.

## Data
35 planned posts transcribed from the September 21–27 reference, using 2026.
Main output is mapped to TikTok; uncolored/unassigned entries are assigned to the team.
Ella, Reg, and Elijah are the three staff. Diana is retained only in the reference off-day note.
Facebook page: https://www.facebook.com/pchub
Facebook/TikTok automatic sync is not implemented. Post URLs and metrics are entered manually.
The first authenticated GET seeds the 35 weekly-plan records only after the local Supabase migration has been applied.

## Verification
Run `npm run build` for a Vercel-compatible production build. The Supabase schema lives in `supabase/migrations/`.
