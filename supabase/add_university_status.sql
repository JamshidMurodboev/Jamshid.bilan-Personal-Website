-- Add status column to universities table
-- Values: 'open' (accepting applications), 'closed' (not accepting), 'upcoming' (opening soon)

alter table universities
  add column if not exists status text not null default 'open'
  check (status in ('open', 'closed', 'upcoming'));
