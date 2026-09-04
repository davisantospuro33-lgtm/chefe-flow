-- Hardening incremental: completa comandos e garante ownership, eventos e concorrência.
alter table public.operational_events add constraint operational_events_type_check check (event_type <> '');
create unique index if not exists one_waiting_position_per_queue on public.queue_tickets(queue_id, position) where status = 'waiting';

create or replace function public.execute_operation_command(command jsonb)
returns jsonb language plpgsql security invoker set search_path = public
as $$
declare actor uuid := auth.uid(); professional uuid; ticket_id uuid; current_status text; next_status text; ticket_row public.queue_tickets;
begin
  if actor is null then raise exception 'authentication required'; end if;
  if command->>'type' = 'set_status' then
    next_status := command->>'status';
    select p.id into professional from professionals p join professional_members m on m.professional_id = p.id where m.user_id = actor limit 1 for update;
    if professional is null then raise exception 'professional membership required'; end if;
    select status into current_status from operational_status where professional_id = professional for update;
    if current_status = 'closed' and next_status not in ('closed','available') then raise exception 'closed operation must reopen as available'; end if;
    insert into operational_status(professional_id,status) values(professional,next_status)
      on conflict(professional_id) do update set status=excluded.status, updated_at=now();
    insert into operational_events(professional_id,actor_id,event_type,payload) values(professional,actor,'status_changed',command);
    return jsonb_build_object('professional_id',professional,'status',next_status);
  elsif command->>'type' = 'join_queue' then
    insert into queue_tickets(queue_id, professional_id, customer_id, service_id, kind, position)
      select q.id, q.professional_id, actor, nullif(command->>'serviceId','')::uuid, command->>'kind',
        coalesce((select max(t.position)+1 from queue_tickets t where t.queue_id=q.id and t.status='waiting'),1)
      from queues q where q.id=(command->>'queueId')::uuid and q.status='open'
      returning id into ticket_id;
    if ticket_id is null then raise exception 'queue unavailable'; end if;
    select * into ticket_row from queue_tickets where id=ticket_id;
    insert into operational_events(professional_id,actor_id,event_type,ticket_id,payload) values(ticket_row.professional_id,actor,'ticket_joined',ticket_id,command);
    return jsonb_build_object('ticket_id',ticket_id,'position',ticket_row.position);
  elsif command->>'type' in ('call_ticket','start_ticket','complete_ticket','cancel_ticket') then
    ticket_id := (command->>'ticketId')::uuid;
    select * into ticket_row from queue_tickets where id=ticket_id for update;
    if ticket_row.id is null then raise exception 'ticket not found'; end if;
    if not (ticket_row.customer_id=actor or exists(select 1 from professional_members m where m.professional_id=ticket_row.professional_id and m.user_id=actor)) then raise exception 'ticket access denied'; end if;
    if command->>'type'='call_ticket' then update queue_tickets set status='called', updated_at=now() where id=ticket_id and status='waiting';
    elsif command->>'type'='start_ticket' then update queue_tickets set status='serving', updated_at=now() where id=ticket_id and status='called';
    elsif command->>'type'='cancel_ticket' then update queue_tickets set status='cancelled', updated_at=now() where id=ticket_id and status in ('waiting','called','serving');
    else update queue_tickets set status='completed', updated_at=now() where id=ticket_id and status='serving'; end if;
    if not found then raise exception 'invalid ticket transition'; end if;
    insert into operational_events(professional_id,actor_id,event_type,ticket_id,payload) values(ticket_row.professional_id,actor,command->>'type',ticket_id,command);
    return jsonb_build_object('ticket_id',ticket_id,'status',(select status from queue_tickets where id=ticket_id));
  end if;
  raise exception 'unsupported operation command';
end; $$;
