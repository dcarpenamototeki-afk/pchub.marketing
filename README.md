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

## Windows local use

Double-click `Start-PC-Hub.cmd`, then sign in with your approved live staff account.
The app runs at http://localhost:3000 and only listens on this PC.
This PC is configured to use the live workspace as described below.
The launcher uses the production build, so rebuild after updating source code.
The ignored `.env.local` file contains the public Supabase settings and live API destination.

## Local connection to the live workspace

This PC uses `.env.local` with the same public Supabase URL and publishable key as the Vercel app. `LOCAL_LIVE_API_ORIGIN=https://pchub-marketing.vercel.app` routes `/api/posts` through the existing live backend, preserving the signed-in user's Authorization header and production approval checks. No service-role key is stored locally.

Sign in with your approved live staff account. Local and live browser sessions are separate, but posts use the same backend. Internet access is required; changes made locally affect live records. Refresh the other browser to see changes (automatic realtime updates are not implemented). The previous demo credentials and browser-only records are not used in this configuration.

## Calendar assets and Team Pulse rollout

1. Apply `supabase/migrations/005_calendar_assets.sql` in the existing PC Hub Supabase project's SQL Editor. This adds asset URL/type, cover URL and completion timestamp columns without replacing records.
2. Deploy this source to the existing Vercel project. Keep its existing Supabase environment settings. `LOCAL_LIVE_API_ORIGIN` is only for this PC, not Vercel.
3. Rebuild/restart the local app and sign in with an approved staff account. The local proxy uses the updated live API.
4. In Calendar, add an entry with a Google Drive **file** link, select Image or Video, and optionally add a cover photo file link. Open links use the viewer's Google Drive permissions. Mark Done after finishing the task; it then appears in the Overview Team Pulse for the selected week. Published status and social analytics remain separate.

Until the updated API advertises calendar support, the client blocks saves to avoid losing new fields through the old live API. The feature has not been migrated or deployed automatically. Run `node tests/calendar.cjs` for validation and mapping checks, then `npm run build`.
