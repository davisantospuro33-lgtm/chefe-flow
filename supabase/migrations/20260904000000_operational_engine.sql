-- Operational Engine: estado persistido, tickets e eventos imutáveis.
create table if not exists public.operational_status (
  professional_id uuid primary key references public.professionals(id) on delete cascade,
  status text not null default 'closed' check (status in ('available','serving','paused','closed')),
  current_ticket_id uuid,
  updated_at timestamptz not null default now()
);

create table if not exists public.queue_tickets (
  id uuid primary key default gen_random_uuid(),
  queue_id uuid not null references public.queues(id) on delete cascade,
  professional_id uuid not null references public.professionals(id) on delete cascade,
  customer_id uuid not null references auth.users(id) on delete cascade,
  service_id uuid references public.services(id) on delete set null,
  kind text not null check (kind in ('physical','virtual')),
  position integer not null check (position > 0),
  status text not null default 'waiting' check (status in ('waiting','called','serving','completed','cancelled')),
  estimated_start_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.service_sessions (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professionals(id) on delete cascade,
  ticket_id uuid references public.queue_tickets(id) on delete set null,
  appointment_id uuid references public.appointments(id) on delete set null,
  customer_id uuid not null references auth.users(id) on delete cascade,
  service_id uuid references public.services(id) on delete set null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  duration_min integer check (duration_min is null or duration_min between 1 and 1440),
  revenue_cents integer not null default 0 check (revenue_cents >= 0),
  status text not null default 'active' check (status in ('active','completed','cancelled'))
);

create table if not exists public.operational_events (
  id bigint generated always as identity primary key,
  professional_id uuid not null references public.professionals(id) on delete cascade,
  actor_id uuid not null references auth.users(id) on delete restrict,
  event_type text not null,
  ticket_id uuid references public.queue_tickets(id) on delete set null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists queue_tickets_active_idx on public.queue_tickets (professional_id, status, position);
create unique index if not exists one_active_session_per_professional on public.service_sessions (professional_id) where status = 'active';
create unique index if not exists one_open_ticket_per_customer_queue on public.queue_tickets (queue_id, customer_id) where status in ('waiting','called','serving');

alter table public.operational_status enable row level security;
alter table public.queue_tickets enable row level security;
alter table public.service_sessions enable row level security;
alter table public.operational_events enable row level security;

create policy operational_public_read on public.operational_status for select to anon, authenticated using (exists (select 1 from public.professionals p where p.id = professional_id and p.is_published));
create policy operational_member_write on public.operational_status for update to authenticated using (exists (select 1 from public.professional_members m where m.professional_id = operational_status.professional_id and m.user_id = (select auth.uid()))) with check (exists (select 1 from public.professional_members m where m.professional_id = operational_status.professional_id and m.user_id = (select auth.uid())));
create policy tickets_customer_or_member on public.queue_tickets for all to authenticated using (customer_id = (select auth.uid()) or exists (select 1 from public.professional_members m where m.professional_id = queue_tickets.professional_id and m.user_id = (select auth.uid()))) with check (customer_id = (select auth.uid()) or exists (select 1 from public.professional_members m where m.professional_id = queue_tickets.professional_id and m.user_id = (select auth.uid())));
create policy sessions_customer_or_member on public.service_sessions for all to authenticated using (customer_id = (select auth.uid()) or exists (select 1 from public.professional_members m where m.professional_id = service_sessions.professional_id and m.user_id = (select auth.uid()))) with check (customer_id = (select auth.uid()) or exists (select 1 from public.professional_members m where m.professional_id = service_sessions.professional_id and m.user_id = (select auth.uid())));
create policy events_member_read on public.operational_events for select to authenticated using (exists (select 1 from public.professional_members m where m.professional_id = operational_events.professional_id and m.user_id = (select auth.uid())));

create or replace function public.execute_operation_command(command jsonb)
returns jsonb language plpgsql security invoker set search_path = public
as $$
declare actor uuid := auth.uid(); professional uuid; ticket uuid; next_status text;
begin
  if actor is null then raise exception 'authentication required'; end if;
  if command->>'type' = 'set_status' then
    next_status := command->>'status';
    select p.id into professional from professionals p join professional_members m on m.professional_id=p.id where m.user_id=actor limit 1 for update;
    if professional is null then raise exception 'professional membership required'; end if;
    insert into operational_status(professional_id,status) values(professional,next_status) on conflict(professional_id) do update set status=excluded.status, updated_at=now();
    insert into operational_events(professional_id,actor_id,event_type,payload) values(professional,actor,'status_changed',command);
    return jsonb_build_object('professional_id',professional,'status',next_status);
  end if;
  if command->>'type' = 'join_queue' then
    insert into queue_tickets(queue_id,professional_id,customer_id,service_id,kind,position)
    select q.id,q.professional_id,actor,nullif(command->>'serviceId','')::uuid,command->>'kind',coalesce((select max(position)+1 from queue_tickets t where t.queue_id=q.id),1)
    from queues q where q.id=(command->>'queueId')::uuid and q.status='open'
    returning id into ticket;
    if ticket is null then raise exception 'queue unavailable'; end if;
    return jsonb_build_object('ticket_id',ticket);
  end if;
  raise exception 'unsupported operation command';
end; $$;
