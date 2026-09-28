create table if not exists public.social_connections (
  platform text primary key check (platform in ('Facebook', 'TikTok')),
  account_id text not null,
  account_name text not null,
  access_token text not null,
  connected_at timestamptz not null default now(),
  last_synced_at timestamptz
);

alter table public.social_connections enable row level security;
