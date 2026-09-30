alter table public.marketing_posts
  add column if not exists delay_reason text not null default '';

notify pgrst, 'reload schema';
