create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  username text not null unique,
  role text not null default 'staff' check (role in ('admin', 'staff')),
  approval_status text not null default 'pending' check (approval_status in ('pending', 'approved')),
  created_at timestamptz not null default now()
);

create or replace function public.create_profile_for_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username)
  values (new.id, lower(coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1))))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists create_profile_on_signup on auth.users;
create trigger create_profile_on_signup
  after insert on auth.users
  for each row execute procedure public.create_profile_for_new_user();

alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles
  for select to authenticated using (auth.uid() = id);

-- After registering the owner, run this once in the SQL Editor:
-- update public.profiles set role = 'admin', approval_status = 'approved' where username = 'admin';
-- Approve staff from Table Editor > profiles by setting approval_status to approved.
