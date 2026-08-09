-- Page view analytics migration
-- ---------------------------------------------------------------------------
-- MANUAL STEP REQUIRED: This file is NOT applied automatically. Run this SQL
-- manually in the Supabase Dashboard -> SQL Editor against the live project.
-- ---------------------------------------------------------------------------
-- Adds a `page_views` table for anonymous, site-wide page-view analytics.
-- This is separate from `user_activities` (which only logs entity views for
-- logged-in users) — do not touch that table here.

create table if not exists page_views (
  id uuid primary key default gen_random_uuid(),
  page_path text not null,
  visitor_id text not null,
  user_id uuid null references site_users(id),
  created_at timestamptz not null default now()
);

create index if not exists page_views_page_path_idx on page_views (page_path);
create index if not exists page_views_visitor_id_idx on page_views (visitor_id);
create index if not exists page_views_created_at_idx on page_views (created_at);

alter table page_views enable row level security;

-- Anonymous visitors write rows directly using the public anon key.
-- No select policy for anon is added — reads are performed via the
-- service-role key from a server API route (see src/app/api/admin/analytics).
create policy "Allow anon insert on page_views"
  on page_views
  for insert
  to anon
  with check (true);
