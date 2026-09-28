alter table public.marketing_posts
  add column if not exists image_two_url text not null default '';

notify pgrst, 'reload schema';
