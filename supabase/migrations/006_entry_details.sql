alter table public.marketing_posts
 add column if not exists caption text not null default '',
 add column if not exists created_by uuid references auth.users(id),
 add column if not exists published_at timestamptz;
alter table public.marketing_posts drop constraint if exists marketing_status_check;
alter table public.marketing_posts add constraint marketing_status_check check (status in ('Planned','In progress','For review','For posting','Published'));
