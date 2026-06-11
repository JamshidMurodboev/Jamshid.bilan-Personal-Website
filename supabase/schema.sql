-- ============================================================
-- Jamshid.bilan Scholarship Consulting — Supabase Schema
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. scholarships
-- ============================================================
create table if not exists scholarships (
  id           uuid primary key default uuid_generate_v4(),
  title        text not null,
  country      text not null,
  university   text,
  coverage     text[] not null default '{}',
  eligibility  text,
  deadline     date,
  difficulty   smallint check (difficulty between 1 and 5),
  tip          text,
  application_url text,
  status       text not null default 'open' check (status in ('open', 'closed', 'upcoming')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table scholarships enable row level security;
create policy "Public read scholarships" on scholarships for select using (true);
create policy "Authenticated insert scholarships" on scholarships for insert with check (auth.role() = 'authenticated');
create policy "Authenticated update scholarships" on scholarships for update using (auth.role() = 'authenticated');
create policy "Authenticated delete scholarships" on scholarships for delete using (auth.role() = 'authenticated');

-- ============================================================
-- 2. universities
-- ============================================================
create table if not exists universities (
  id           uuid primary key default uuid_generate_v4(),
  name         text not null,
  country      text not null,
  city         text,
  logo_url     text,
  website_url  text,
  tuition_usd  integer,
  type         text not null default 'public' check (type in ('public', 'private')),
  ranking      integer,
  programs     text[] not null default '{}',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table universities enable row level security;
create policy "Public read universities" on universities for select using (true);
create policy "Authenticated insert universities" on universities for insert with check (auth.role() = 'authenticated');
create policy "Authenticated update universities" on universities for update using (auth.role() = 'authenticated');
create policy "Authenticated delete universities" on universities for delete using (auth.role() = 'authenticated');

-- ============================================================
-- 3. student_results
-- ============================================================
create table if not exists student_results (
  id             uuid primary key default uuid_generate_v4(),
  student_name   text not null,
  photo_url      text,
  university_id  uuid references universities (id) on delete set null,
  scholarship_id uuid references scholarships (id) on delete set null,
  degree_level   text not null check (degree_level in ('bachelor', 'master', 'phd')),
  year           smallint not null,
  country        text not null,
  testimonial    text,
  created_at     timestamptz not null default now()
);

alter table student_results enable row level security;
create policy "Public read student_results" on student_results for select using (true);
create policy "Authenticated insert student_results" on student_results for insert with check (auth.role() = 'authenticated');
create policy "Authenticated update student_results" on student_results for update using (auth.role() = 'authenticated');
create policy "Authenticated delete student_results" on student_results for delete using (auth.role() = 'authenticated');

-- ============================================================
-- 4. stats
-- ============================================================
create table if not exists stats (
  id         uuid primary key default uuid_generate_v4(),
  key        text not null unique,
  value      text not null,
  label_uz   text,
  label_ru   text,
  label_en   text,
  sort_order smallint default 0,
  updated_at timestamptz not null default now()
);

alter table stats enable row level security;
create policy "Public read stats" on stats for select using (true);
create policy "Authenticated manage stats" on stats for all using (auth.role() = 'authenticated');

-- Seed default stats
insert into stats (key, value, label_uz, label_ru, label_en, sort_order) values
  ('full_ride', '5+', 'To''liq grantlar', 'Полные гранты', 'Full Scholarships', 1),
  ('admissions', '100+', 'Muvaffaqiyatli qabullar', 'Успешных поступлений', 'Successful Admissions', 2),
  ('countries', '10+', 'Davlatlar', 'Стран', 'Countries', 3),
  ('years', '4+', 'Yillik tajriba', 'Лет опыта', 'Years Experience', 4)
on conflict (key) do nothing;

-- ============================================================
-- 5. news_posts
-- ============================================================
create table if not exists news_posts (
  id           uuid primary key default uuid_generate_v4(),
  title_uz     text not null,
  title_ru     text,
  title_en     text,
  body_uz      text not null,
  body_ru      text,
  body_en      text,
  cover_url    text,
  published    boolean not null default false,
  published_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table news_posts enable row level security;
create policy "Public read published news" on news_posts for select using (published = true);
create policy "Authenticated manage news" on news_posts for all using (auth.role() = 'authenticated');

-- ============================================================
-- 6. blog_posts
-- ============================================================
create table if not exists blog_posts (
  id           uuid primary key default uuid_generate_v4(),
  slug         text not null unique,
  title_uz     text not null,
  title_ru     text,
  title_en     text,
  excerpt_uz   text,
  excerpt_ru   text,
  excerpt_en   text,
  body_uz      text not null,
  body_ru      text,
  body_en      text,
  cover_url    text,
  tags         text[] not null default '{}',
  published    boolean not null default false,
  published_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table blog_posts enable row level security;
create policy "Public read published blog" on blog_posts for select using (published = true);
create policy "Authenticated manage blog" on blog_posts for all using (auth.role() = 'authenticated');

-- ============================================================
-- 7. inquiries
-- ============================================================
create table if not exists inquiries (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  phone         text not null,
  email         text,
  message       text,
  source        text default 'website',
  status        text not null default 'new' check (status in ('new', 'contacted', 'converted', 'closed')),
  locale        text not null default 'uz',
  created_at    timestamptz not null default now()
);

alter table inquiries enable row level security;
create policy "Anyone can insert inquiry" on inquiries for insert with check (true);
create policy "Authenticated read inquiries" on inquiries for select using (auth.role() = 'authenticated');
create policy "Authenticated update inquiries" on inquiries for update using (auth.role() = 'authenticated');

-- ============================================================
-- Updated_at trigger helper
-- ============================================================
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_scholarships_updated before update on scholarships
  for each row execute procedure set_updated_at();
create trigger trg_universities_updated before update on universities
  for each row execute procedure set_updated_at();
create trigger trg_news_updated before update on news_posts
  for each row execute procedure set_updated_at();
create trigger trg_blog_updated before update on blog_posts
  for each row execute procedure set_updated_at();
