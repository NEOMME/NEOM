-- Neom (NEMP) initial schema
-- Run in Supabase SQL Editor or via: npm run db:migrate

create extension if not exists "pgcrypto";

-- Profiles (linked to auth.users when users sign up)
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid unique references auth.users(id) on delete set null,
  name text not null,
  email text unique not null,
  role text not null check (role in ('student', 'admin')) default 'student',
  country text,
  created_at timestamptz not null default now()
);

create table if not exists public.countries (
  id text primary key,
  name text not null,
  code text not null,
  flag text not null
);

create table if not exists public.categories (
  id text primary key,
  name text not null,
  description text not null default '',
  icon text not null default 'Tag',
  color text not null default '#06b6d4'
);

create table if not exists public.universities (
  id text primary key,
  name text not null,
  country_id text not null references public.countries(id) on delete restrict,
  description text not null default '',
  tuition text not null default '',
  ranking int not null default 0,
  programs jsonb not null default '[]'::jsonb,
  deadline text not null default '',
  published boolean not null default true
);

create table if not exists public.university_categories (
  university_id text not null references public.universities(id) on delete cascade,
  category_id text not null references public.categories(id) on delete cascade,
  primary key (university_id, category_id)
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.profiles(id) on delete set null,
  university_id text not null references public.universities(id) on delete restrict,
  status text not null default 'draft'
    check (status in ('draft', 'submitted', 'under_review', 'accepted', 'rejected')),
  steps jsonb not null default '[]'::jsonb,
  personal_info jsonb not null default '{}'::jsonb,
  academic_info jsonb not null default '{}'::jsonb,
  documents jsonb not null default '[]'::jsonb,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.promotions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  discount text not null default '',
  active boolean not null default true,
  start_date date not null,
  end_date date not null
);

create table if not exists public.email_campaigns (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  body text not null default '',
  status text not null default 'draft'
    check (status in ('draft', 'scheduled', 'sent')),
  recipients int not null default 0,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists applications_updated_at on public.applications;
create trigger applications_updated_at
  before update on public.applications
  for each row execute function public.set_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (auth_id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'student')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.countries enable row level security;
alter table public.categories enable row level security;
alter table public.universities enable row level security;
alter table public.university_categories enable row level security;
alter table public.applications enable row level security;
alter table public.promotions enable row level security;
alter table public.email_campaigns enable row level security;

-- Public read for reference data
create policy "countries_public_read" on public.countries for select using (true);
create policy "categories_public_read" on public.categories for select using (true);
create policy "universities_public_read" on public.universities for select using (true);
create policy "university_categories_public_read" on public.university_categories for select using (true);

-- Profiles
create policy "profiles_read_own" on public.profiles for select
  using (auth.uid() = auth_id or exists (
    select 1 from public.profiles p where p.auth_id = auth.uid() and p.role = 'admin'
  ));

create policy "profiles_update_own" on public.profiles for update
  using (auth.uid() = auth_id);

-- Applications
create policy "applications_student_read" on public.applications for select
  using (
    student_id in (select id from public.profiles where auth_id = auth.uid())
    or exists (select 1 from public.profiles p where p.auth_id = auth.uid() and p.role = 'admin')
  );

create policy "applications_student_insert" on public.applications for insert
  with check (
    student_id in (select id from public.profiles where auth_id = auth.uid())
    or exists (select 1 from public.profiles p where p.auth_id = auth.uid() and p.role = 'admin')
  );

create policy "applications_student_update" on public.applications for update
  using (
    student_id in (select id from public.profiles where auth_id = auth.uid())
    or exists (select 1 from public.profiles p where p.auth_id = auth.uid() and p.role = 'admin')
  );

-- Admin-only write for categories, universities, promotions, email
create policy "categories_admin_all" on public.categories for all
  using (exists (select 1 from public.profiles p where p.auth_id = auth.uid() and p.role = 'admin'));

create policy "universities_admin_write" on public.universities for all
  using (exists (select 1 from public.profiles p where p.auth_id = auth.uid() and p.role = 'admin'));

create policy "university_categories_admin_all" on public.university_categories for all
  using (exists (select 1 from public.profiles p where p.auth_id = auth.uid() and p.role = 'admin'));

create policy "promotions_admin_all" on public.promotions for all
  using (exists (select 1 from public.profiles p where p.auth_id = auth.uid() and p.role = 'admin'));

create policy "email_campaigns_admin_all" on public.email_campaigns for all
  using (exists (select 1 from public.profiles p where p.auth_id = auth.uid() and p.role = 'admin'));

-- Service role bypasses RLS; anon/authenticated use policies above
