-- Fundação multi-profissional CHEFE Elite v2. Somente aditiva.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.professionals (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete restrict,
  display_name text not null,
  slug text not null unique,
  city text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.professional_members (
  professional_id uuid not null references public.professionals(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'staff' check (role in ('owner','manager','staff')),
  created_at timestamptz not null default now(),
  primary key (professional_id, user_id)
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professionals(id) on delete cascade,
  name text not null,
  description text,
  duration_min integer not null default 30 check (duration_min between 5 and 1440),
  price_cents integer not null default 0 check (price_cents >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.queues (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professionals(id) on delete cascade,
  queue_date date not null,
  status text not null default 'open' check (status in ('open','paused','closed')),
  created_at timestamptz not null default now(),
  unique (professional_id, queue_date)
);

create table if not exists public.queue_entries (
  id uuid primary key default gen_random_uuid(),
  queue_id uuid not null references public.queues(id) on delete cascade,
  customer_id uuid not null references auth.users(id) on delete cascade,
  service_id uuid references public.services(id) on delete set null,
  position integer not null check (position > 0),
  status text not null default 'waiting' check (status in ('waiting','called','serving','completed','cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professionals(id) on delete cascade,
  customer_id uuid not null references auth.users(id) on delete cascade,
  service_id uuid references public.services(id) on delete set null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'requested' check (status in ('requested','confirmed','completed','cancelled')),
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professionals(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 5000),
  visibility text not null default 'draft' check (visibility in ('draft','published','archived')),
  created_at timestamptz not null default now()
);

create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professionals(id) on delete cascade,
  media_url text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professionals(id) on delete cascade,
  customer_id uuid not null references auth.users(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  body text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  unique (professional_id, customer_id)
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professionals(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.conversation_members (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 10000),
  kind text not null default 'text' check (kind in ('text','system')),
  created_at timestamptz not null default now()
);

create table if not exists public.arrival_alerts (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professionals(id) on delete cascade,
  customer_id uuid not null references auth.users(id) on delete cascade,
  queue_entry_id uuid references public.queue_entries(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','sent','read','dismissed')),
  created_at timestamptz not null default now()
);

create table if not exists public.notification_preferences (
  user_id uuid not null references auth.users(id) on delete cascade,
  professional_id uuid not null references public.professionals(id) on delete cascade,
  push_enabled boolean not null default true,
  chat_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (user_id, professional_id)
);

create index if not exists queue_entries_active_idx on public.queue_entries (queue_id, status, position);
create index if not exists appointments_window_idx on public.appointments (professional_id, starts_at, ends_at);
create index if not exists posts_feed_idx on public.posts (professional_id, visibility, created_at desc);
create index if not exists stories_expiry_idx on public.stories (professional_id, expires_at);
create index if not exists messages_conversation_idx on public.messages (conversation_id, created_at);
create index if not exists alerts_customer_idx on public.arrival_alerts (customer_id, status, created_at desc);

alter table public.profiles enable row level security;
alter table public.professionals enable row level security;
alter table public.professional_members enable row level security;
alter table public.services enable row level security;
alter table public.queues enable row level security;
alter table public.queue_entries enable row level security;
alter table public.appointments enable row level security;
alter table public.posts enable row level security;
alter table public.stories enable row level security;
alter table public.reviews enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;
alter table public.arrival_alerts enable row level security;
alter table public.notification_preferences enable row level security;

create policy profiles_self on public.profiles for all to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy professionals_public_read on public.professionals for select to anon, authenticated using (is_published = true);
create policy professionals_member_manage on public.professionals for all to authenticated using (owner_id = (select auth.uid()) or exists (select 1 from public.professional_members m where m.professional_id = id and m.user_id = (select auth.uid()) and m.role in ('owner','manager'))) with check (owner_id = (select auth.uid()) or exists (select 1 from public.professional_members m where m.professional_id = id and m.user_id = (select auth.uid()) and m.role in ('owner','manager')));
create policy members_self_or_manager on public.professional_members for select to authenticated using (user_id = (select auth.uid()) or exists (select 1 from public.professional_members m where m.professional_id = professional_id and m.user_id = (select auth.uid()) and m.role in ('owner','manager')));
create policy services_public_read on public.services for select to anon, authenticated using (is_active = true and exists (select 1 from public.professionals p where p.id = professional_id and p.is_published));
create policy services_member_manage on public.services for all to authenticated using (exists (select 1 from public.professional_members m where m.professional_id = services.professional_id and m.user_id = (select auth.uid()))) with check (exists (select 1 from public.professional_members m where m.professional_id = services.professional_id and m.user_id = (select auth.uid())));
create policy posts_public_read on public.posts for select to anon, authenticated using (visibility = 'published');
create policy posts_author_manage on public.posts for all to authenticated using (author_id = (select auth.uid())) with check (author_id = (select auth.uid()));
create policy stories_public_read on public.stories for select to anon, authenticated using (expires_at > now());
create policy reviews_public_read on public.reviews for select to anon, authenticated using (status = 'approved');
create policy reviews_customer_write on public.reviews for insert to authenticated with check (customer_id = (select auth.uid()));
create policy appointments_participant on public.appointments for all to authenticated using (customer_id = (select auth.uid()) or exists (select 1 from public.professional_members m where m.professional_id = appointments.professional_id and m.user_id = (select auth.uid()))) with check (customer_id = (select auth.uid()) or exists (select 1 from public.professional_members m where m.professional_id = appointments.professional_id and m.user_id = (select auth.uid())));
create policy queue_customer_access on public.queue_entries for all to authenticated using (customer_id = (select auth.uid()) or exists (select 1 from public.queues q join public.professional_members m on m.professional_id = q.professional_id where q.id = queue_id and m.user_id = (select auth.uid()))) with check (customer_id = (select auth.uid()) or exists (select 1 from public.queues q join public.professional_members m on m.professional_id = q.professional_id where q.id = queue_id and m.user_id = (select auth.uid())));
create policy conversations_member_access on public.conversations for select to authenticated using (exists (select 1 from public.conversation_members cm where cm.conversation_id = id and cm.user_id = (select auth.uid())));
create policy conversation_members_self on public.conversation_members for select to authenticated using (user_id = (select auth.uid()));
create policy messages_member_access on public.messages for all to authenticated using (sender_id = (select auth.uid()) or exists (select 1 from public.conversation_members cm where cm.conversation_id = messages.conversation_id and cm.user_id = (select auth.uid()))) with check (sender_id = (select auth.uid()) and exists (select 1 from public.conversation_members cm where cm.conversation_id = messages.conversation_id and cm.user_id = (select auth.uid())));
create policy alerts_customer_access on public.arrival_alerts for all to authenticated using (customer_id = (select auth.uid()) or exists (select 1 from public.professional_members m where m.professional_id = arrival_alerts.professional_id and m.user_id = (select auth.uid()))) with check (customer_id = (select auth.uid()) or exists (select 1 from public.professional_members m where m.professional_id = arrival_alerts.professional_id and m.user_id = (select auth.uid())));
create policy notification_preferences_self on public.notification_preferences for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
