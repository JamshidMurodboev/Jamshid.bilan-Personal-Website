-- ============================================================
-- Admin Overhaul Migration — run in Supabase SQL Editor
-- ============================================================

-- scholarships: add new columns
alter table scholarships
  add column if not exists description_uz text,
  add column if not exists description_ru text,
  add column if not exists description_en text,
  add column if not exists open_date text,
  add column if not exists close_date text,
  add column if not exists results_date text,
  add column if not exists results_date_type text default 'exact',
  add column if not exists category text default 'fully_funded'
    check (category in ('fully_funded', 'partially_funded', 'self_funded')),
  add column if not exists photo_urls text[] not null default '{}';

-- universities: add new columns
alter table universities
  add column if not exists description_uz text,
  add column if not exists description_ru text,
  add column if not exists description_en text,
  add column if not exists photo_urls text[] not null default '{}';

-- university_majors: new table
create table if not exists university_majors (
  id            uuid primary key default uuid_generate_v4(),
  university_id uuid not null references universities(id) on delete cascade,
  name          text not null,
  language      text,
  tuition       numeric,
  currency      text not null default 'USD'
                  check (currency in ('USD', 'UZS', 'EUR', 'TL')),
  sort_order    smallint not null default 0
);
alter table university_majors enable row level security;
create policy "Public read university_majors" on university_majors for select using (true);
create policy "Authenticated manage university_majors" on university_majors for all using (auth.role() = 'authenticated');

-- student_results: add new columns
alter table student_results
  add column if not exists category text default 'scholarship_winner'
    check (category in ('scholarship_winner', 'tuition_based')),
  add column if not exists major text,
  add column if not exists language text,
  add column if not exists university_ranking integer,
  add column if not exists university_name text,
  add column if not exists photo_urls text[] not null default '{}';

-- news_posts: add photo_urls
alter table news_posts
  add column if not exists photo_urls text[] not null default '{}';

-- testimonials: add category + links
alter table testimonials
  add column if not exists category text default 'scholarship_winner'
    check (category in ('scholarship_winner', 'tuition_based')),
  add column if not exists scholarship_id uuid references scholarships(id) on delete set null,
  add column if not exists university_id  uuid references universities(id) on delete set null,
  add column if not exists photo_urls text[] not null default '{}';

-- inquiries: add admin notes + extra fields
alter table inquiries
  add column if not exists notes text,
  add column if not exists dob text,
  add column if not exists language_certificate text,
  add column if not exists grant_interest text,
  add column if not exists university_interest text;

-- site_users: public-site user tracking table
create table if not exists site_users (
  id             text primary key,
  full_name      text not null,
  email          text not null unique,
  phone          text,
  gender         text,
  dob            text,
  photo_url      text,
  created_at     timestamptz not null default now(),
  last_active_at timestamptz,
  login_count    integer not null default 0,
  status         text not null default 'active'
                   check (status in ('active', 'blocked'))
);
alter table site_users enable row level security;
create policy "Public insert site_users" on site_users for insert with check (true);
create policy "Public update site_users" on site_users for update using (true);
create policy "Authenticated read site_users" on site_users for select using (auth.role() = 'authenticated');
create policy "Authenticated delete site_users" on site_users for delete using (auth.role() = 'authenticated');
create policy "Authenticated update site_users" on site_users for update using (auth.role() = 'authenticated');
