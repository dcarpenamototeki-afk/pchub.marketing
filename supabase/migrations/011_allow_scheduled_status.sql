alter table public.marketing_posts
  drop constraint if exists marketing_status_check;

alter table public.marketing_posts
  add constraint marketing_status_check
  check (status in ('Planned', 'In progress', 'For review', 'For posting', 'Scheduled', 'Published'));

notify pgrst, 'reload schema';
