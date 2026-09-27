-- Repair the missing team table required by the production team API.
create table if not exists public.team_members (
 name text primary key check (char_length(name) between 2 and 60),
 active boolean not null default true,
 created_at timestamptz not null default now()
);
insert into public.team_members (name) values ('Ella'),('Reg'),('Elijah') on conflict (name) do nothing;
alter table public.team_members enable row level security;
-- The authenticated server API enforces approved-account/admin access.
alter table public.marketing_posts drop constraint if exists marketing_owner_check;
notify pgrst, 'reload schema';
