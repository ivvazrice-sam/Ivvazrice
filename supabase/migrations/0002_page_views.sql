-- Visitor analytics: one row per page view.
-- Writes go through /api/track with the service role; nothing public reads it.

create table if not exists page_views (
  id uuid primary key default gen_random_uuid(),
  path text not null,
  visitor_id text not null,
  referrer text default '',
  user_agent text default '',
  country text default '',
  created_at timestamptz not null default now()
);

create index if not exists page_views_created_idx on page_views (created_at desc);
create index if not exists page_views_visitor_idx on page_views (visitor_id);

alter table page_views enable row level security;
create policy "admins read" on page_views for select using (admin_role() in ('admin', 'editor', 'sales'));
create policy "admin delete" on page_views for delete using (admin_role() = 'admin');
