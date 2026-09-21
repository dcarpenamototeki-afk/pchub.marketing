create extension if not exists "pgcrypto";

create table if not exists public.marketing_posts (
  id text primary key,
  title text not null default '',
  content_type text not null default 'Other',
  platform text not null,
  format text not null,
  owners text[] not null default '{}',
  date date not null,
  posted_time time,
  status text not null default 'Planned',
  url text not null default '',
  views bigint,
  likes bigint,
  comments bigint,
  shares bigint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint marketing_platform_check check (platform in ('Facebook', 'TikTok')),
  constraint marketing_format_check check (format in ('Main output', 'Reel', 'Static')),
  constraint marketing_content_type_check check (content_type in ('Entertainment', 'Product showcase', 'Educational', 'Community', 'Promotion', 'Other')),
  constraint marketing_status_check check (status in ('Planned', 'In progress', 'For review', 'Published')),
  constraint marketing_owner_check check (owners <@ array['Ella', 'Reg', 'Elijah']::text[]),
  constraint marketing_metrics_check check ((views is null or views >= 0) and (likes is null or likes >= 0) and (comments is null or comments >= 0) and (shares is null or shares >= 0))
);

create index if not exists marketing_posts_date_idx on public.marketing_posts (date);
create index if not exists marketing_posts_status_idx on public.marketing_posts (status);

create or replace function public.marketing_set_updated_at()
returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;

drop trigger if exists marketing_posts_updated_at on public.marketing_posts;
create trigger marketing_posts_updated_at before update on public.marketing_posts for each row execute function public.marketing_set_updated_at();

alter table public.marketing_posts enable row level security;
create policy "Authenticated users can read marketing posts" on public.marketing_posts for select to authenticated using (true);
create policy "Authenticated users can write marketing posts" on public.marketing_posts for all to authenticated using (true) with check (true);
