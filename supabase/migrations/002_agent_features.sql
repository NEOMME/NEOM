-- Neom agent features: chat persistence, research staging, notifications

-- Persistent chat history
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  agent_type text not null default 'student'
    check (agent_type in ('student', 'admin')),
  created_at timestamptz not null default now()
);

create index if not exists chat_messages_profile_idx
  on public.chat_messages (profile_id, agent_type, created_at);

-- University research staging (human review before publish)
create table if not exists public.universities_staging (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country_id text references public.countries(id) on delete set null,
  category_ids jsonb not null default '[]'::jsonb,
  description text not null default '',
  tuition text not null default '',
  ranking int not null default 0,
  programs jsonb not null default '[]'::jsonb,
  deadline text not null default '',
  source_url text,
  research_notes text not null default '',
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  researched_by uuid references public.profiles(id) on delete set null,
  reviewed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index if not exists universities_staging_status_idx
  on public.universities_staging (status, created_at desc);

-- Admin notifications (application submitted, research complete, etc.)
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  title text not null,
  body text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_unread_idx
  on public.notifications (read, created_at desc);

-- RLS
alter table public.chat_messages enable row level security;
alter table public.universities_staging enable row level security;
alter table public.notifications enable row level security;

-- Chat: users read/write own messages; admins read all
create policy "chat_own_read" on public.chat_messages for select
  using (
    profile_id in (select id from public.profiles where auth_id = auth.uid())
    or exists (select 1 from public.profiles p where p.auth_id = auth.uid() and p.role = 'admin')
  );

create policy "chat_own_insert" on public.chat_messages for insert
  with check (
    profile_id in (select id from public.profiles where auth_id = auth.uid())
    or exists (select 1 from public.profiles p where p.auth_id = auth.uid() and p.role = 'admin')
  );

-- Staging: admin only
create policy "staging_admin_all" on public.universities_staging for all
  using (exists (select 1 from public.profiles p where p.auth_id = auth.uid() and p.role = 'admin'));

-- Notifications: admin only
create policy "notifications_admin_all" on public.notifications for all
  using (exists (select 1 from public.profiles p where p.auth_id = auth.uid() and p.role = 'admin'));

-- Storage bucket for application documents (run in Supabase Dashboard if needed):
-- insert into storage.buckets (id, name, public) values ('application-documents', 'application-documents', false);
