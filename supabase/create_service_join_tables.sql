-- Service join tables
create table if not exists service_scholarships (
  service_id    uuid references services(id) on delete cascade,
  scholarship_id uuid references scholarships(id) on delete cascade,
  primary key (service_id, scholarship_id)
);
alter table service_scholarships enable row level security;
create policy "Allow all on service_scholarships" on service_scholarships for all using (true) with check (true);

create table if not exists service_universities (
  service_id    uuid references services(id) on delete cascade,
  university_id uuid references universities(id) on delete cascade,
  primary key (service_id, university_id)
);
alter table service_universities enable row level security;
create policy "Allow all on service_universities" on service_universities for all using (true) with check (true);

create table if not exists service_results (
  service_id uuid references services(id) on delete cascade,
  result_id  uuid references student_results(id) on delete cascade,
  primary key (service_id, result_id)
);
alter table service_results enable row level security;
create policy "Allow all on service_results" on service_results for all using (true) with check (true);

-- news join tables (multi-select)
create table if not exists news_scholarships (
  news_id       uuid references news_posts(id) on delete cascade,
  scholarship_id uuid references scholarships(id) on delete cascade,
  primary key (news_id, scholarship_id)
);
alter table news_scholarships enable row level security;
create policy "Allow all on news_scholarships" on news_scholarships for all using (true) with check (true);

create table if not exists news_universities (
  news_id       uuid references news_posts(id) on delete cascade,
  university_id uuid references universities(id) on delete cascade,
  primary key (news_id, university_id)
);
alter table news_universities enable row level security;
create policy "Allow all on news_universities" on news_universities for all using (true) with check (true);
