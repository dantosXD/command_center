-- 0013_audit_log.sql: Audit triggers logging privileged actions (domain/task mutations)

-- Generic audit trigger function
create or replace function public.audit_log_trigger()
returns trigger language plpgsql as $$
begin
  insert into public.audit_log (user_id, action, table_name, record_id, old_values, new_values)
  values (
    auth.uid(),
    tg_op,
    tg_table_name,
    case when tg_op = 'DELETE' then old.id else new.id end,
    case when tg_op = 'DELETE' or tg_op = 'UPDATE' then row_to_json(old) else null end,
    case when tg_op = 'INSERT' or tg_op = 'UPDATE' then row_to_json(new) else null end
  );
  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

-- Audit domain mutations
create trigger audit_domains
after insert or update or delete on public.domains
for each row execute function public.audit_log_trigger();

-- Audit domain membership changes
create trigger audit_domain_members
after insert or update or delete on public.domain_members
for each row execute function public.audit_log_trigger();

-- Audit task status changes (privileged)
create trigger audit_tasks
after insert or update or delete on public.tasks
for each row execute function public.audit_log_trigger();

-- Audit collection changes
create trigger audit_collections
after insert or update or delete on public.collections
for each row execute function public.audit_log_trigger();

-- RLS for audit log: users can only view their own actions
create policy "Users can view their own audit entries"
on public.audit_log for select
using (user_id = auth.uid() or auth.uid() in (
  select user_id from public.domain_members
  where domain_id in (
    select domain_id from public.audit_log al
    join public.tasks t on t.id = al.record_id and al.table_name = 'tasks'
    union
    select domain_id from public.audit_log al
    join public.domains d on d.id = al.record_id and al.table_name = 'domains'
  )
  and role in ('owner', 'admin')
));
