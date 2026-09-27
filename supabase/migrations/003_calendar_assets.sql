alter table public.marketing_posts
  add column if not exists asset_url text not null default '',
  add column if not exists asset_type text not null default 'image' check (asset_type in ('image', 'video')),
  add column if not exists cover_url text not null default '',
  add column if not exists completed_at timestamptz;
