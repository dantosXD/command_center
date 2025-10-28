-- tenancy.sql: Row-Level Security policies for workspace/domain tenancy
-- Constitution: defense-in-depth with RLS MUST be enforced

-- Helper: current user UID
create or replace function current_user_uid()
returns uuid language sql stable as $$
  select auth.uid()
$$;

-- Helper: is workspace owner
create or replace function is_workspace_owner(workspace_id uuid)
returns boolean language sql stable as $$
  select exists (
    select 1 from public.workspaces w
    where w.id = workspace_id and w.owner_id = current_user_uid()
  );
$$;

-- Workspaces
-- Users can only see/update/delete their own workspaces unless granted via domain membership
create policy "Users can view own workspaces"
on public.workspaces for select
using (owner_id = current_user_uid());

create policy "Users can insert own workspaces"
on public.workspaces for insert
with check (owner_id = current_user_uid());

create policy "Users can update own workspaces"
on public.workspaces for update
using (owner_id = current_user_uid())
with check (owner_id = current_user_uid());

create policy "Users can delete own workspaces"
on public.workspaces for delete
using (owner_id = current_user_uid());

-- Domains
-- Visibility: private=owner+admin only; shared=members+workspace; workspace=workspace users
create policy "Users can view domains by visibility"
on public.domains for select
using (
  visibility = 'private' and exists (
    select 1 from public.domain_members dm
    where dm.domain_id = domains.id and dm.user_id = current_user_uid() and dm.role in ('owner','admin')
  )
  or visibility = 'shared' and exists (
    select 1 from public.domain_members dm
    where dm.domain_id = domains.id and dm.user_id = current_user_uid()
  )
  or visibility = 'workspace' and exists (
    select 1 from public.workspaces w
    join public.domain_members dm on dm.domain_id = domains.id
    where w.id = domains.workspace_id and w.owner_id = current_user_uid()
  )
);

create policy "Domain owners/admins can manage private domains"
on public.domains for all
using (
  visibility = 'private' and exists (
    select 1 from public.domain_members dm
    where dm.domain_id = domains.id and dm.user_id = current_user_uid() and dm.role in ('owner','admin')
  )
)
with check (
  visibility = 'private' and exists (
    select 1 from public.domain_members dm
    where dm.domain_id = domains.id and dm.user_id = current_user_uid() and dm.role in ('owner','admin')
  )
);

-- Domain membership
create policy "Domain members can view their own memberships"
on public.domain_members for select
using (user_id = current_user_uid());

create policy "Domain owners can manage memberships"
on public.domain_members for all
using (
  exists (
    select 1 from public.domain_members dm
    where dm.domain_id = domain_members.domain_id and dm.user_id = current_user_uid() and dm.role = 'owner'
  )
);

-- Collections, Tasks, Events, Attachments: inherit domain-based visibility
-- Use a helper to enforce domain membership for all child entities
create policy "Users can view child entities via domain membership"
on public.collections for select
using (
  exists (
    select 1 from public.domain_members dm
    where dm.domain_id = collections.domain_id and dm.user_id = current_user_uid()
  )
);

create policy "Domain members can manage collections"
on public.collections for all
using (
  exists (
    select 1 from public.domain_members dm
    where dm.domain_id = collections.domain_id and dm.user_id = current_user_uid() and dm.role in ('owner','admin')
  )
);

apply similar policies to tasks, events, task_dependencies, and attachments;
-- Below is illustrative for tasks; other entities follow the same pattern

create policy "Users can view tasks via domain membership"
on public.tasks for select
using (
  exists (
    select 1 from public.domain_members dm
    where dm.domain_id = tasks.domain_id and dm.user_id = current_user_uid()
  )
);

create policy "Domain members can manage tasks"
on public.tasks for all
using (
  exists (
    select 1 from public.domain_members dm
    where dm.domain_id = tasks.domain_id and dm.user_id = current_user_uid() and dm.role in ('owner','admin')
  )
);

-- Events
create policy "Users can view events via domain membership"
on public.events for select
using (
  exists (
    select 1 from public.domain_members dm
    where dm.domain_id = events.domain_id and dm.user_id = current_user_uid()
  )
);

create policy "Domain members can manage events"
on public.events for all
using (
  exists (
    select 1 from public.domain_members dm
    where dm.domain_id = events.domain_id and dm.user_id = current_user_uid() and dm.role in ('owner','admin')
  )
);

-- Task Dependencies
create policy "Users can view dependencies via task domain membership"
on public.task_dependencies for select
using (
  exists (
    select 1 from public.domain_members dm
    where dm.domain_id = (select domain_id from public.tasks where id = task_dependencies.task_id) and dm.user_id = current_user_uid()
  )
);

create policy "Users can manage dependencies via task domain membership"
on public.task_dependencies for all
using (
  exists (
    select 1 from public.domain_members dm
    where dm.domain_id = (select domain_id from public.tasks where id = task_dependencies.task_id) and dm.user_id = current_user_uid() and dm.role in ('owner','admin')
  )
);

-- Attachments
create policy "Users can view attachments via task domain membership"
on public.attachments for select
using (
  exists (
    select 1 from public.tasks t
    join public.domain_members dm on dm.domain_id = t.domain_id
    where t.id = attachments.task_id and dm.user_id = current_user_uid()
  )
);

create policy "Users can manage attachments via task domain membership"
on public.attachments for all
using (
  exists (
    select 1 from public.tasks t
    join public.domain_members dm on dm.domain_id = t.domain_id
    where t.id = attachments.task_id and dm.user_id = current_user_uid() and dm.role in ('owner','admin')
  )
);

-- Notification Outbox (Phase 4)
-- Users can only see their own notifications in the outbox
create policy "Users can view their notification outbox"
on public.notification_outbox for select
using (user_id = current_user_uid());

create policy "Users can manage their notification outbox"
on public.notification_outbox for all
using (user_id = current_user_uid())
with check (user_id = current_user_uid());

-- Notifications (delivered/in-app)
-- Users can only see their own in-app notifications
create policy "Users can view their notifications"
on public.notifications for select
using (user_id = current_user_uid());

create policy "Users can manage their notifications"
on public.notifications for all
using (user_id = current_user_uid())
with check (user_id = current_user_uid());

-- User Preferences (quiet hours, notification settings)
-- Users can only see/manage their own preferences
create policy "Users can view their preferences"
on public.user_preferences for select
using (user_id = current_user_uid());

create policy "Users can manage their preferences"
on public.user_preferences for all
using (user_id = current_user_uid())
with check (user_id = current_user_uid());

-- Audit Log (RLS enforces that non-admins cannot read audit logs)
-- Only workspace owners and domain admins can view audit logs
create policy "Admins can view audit logs"
on public.audit_log for select
using (
  exists (
    select 1 from public.workspaces w
    where w.id = audit_log.workspace_id and w.owner_id = current_user_uid()
  )
  or exists (
    select 1 from public.domains d
    join public.domain_members dm on dm.domain_id = d.id
    where d.id = audit_log.domain_id and dm.user_id = current_user_uid() and dm.role = 'admin'
  )
);

-- Enable RLS on all tables
alter table public.workspaces enable row level security;
alter table public.domains enable row level security;
alter table public.domain_members enable row level security;
alter table public.collections enable row level security;
alter table public.tasks enable row level security;
alter table public.events enable row level security;
alter table public.task_dependencies enable row level security;
alter table public.attachments enable row level security;
alter table public.notification_outbox enable row level security;
alter table public.notifications enable row level security;
alter table public.user_preferences enable row level security;
alter table public.audit_log enable row level security;

-- Audit Logging Triggers (Constitutional Principle II: Defense-in-Depth)
-- Log all privileged actions (creates, updates, deletes)

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  domain_id uuid references public.domains(id) on delete set null,
  actor_id uuid not null references auth.users(id),
  action text not null check (action in ('INSERT', 'UPDATE', 'DELETE')),
  table_name text not null,
  record_id uuid not null,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz default now()
);

create index audit_log_workspace_idx on public.audit_log(workspace_id);
create index audit_log_domain_idx on public.audit_log(domain_id);
create index audit_log_actor_idx on public.audit_log(actor_id);
create index audit_log_created_idx on public.audit_log(created_at desc);

-- Trigger function for audit logging
create or replace function audit_trigger_fn()
returns trigger language plpgsql security definer as $$
declare
  v_workspace_id uuid;
  v_domain_id uuid;
begin
  -- Determine workspace_id based on table
  if tg_table_name = 'workspaces' then
    v_workspace_id := coalesce(new.id, old.id);
  elsif tg_table_name = 'domains' then
    v_workspace_id := coalesce(new.workspace_id, old.workspace_id);
    v_domain_id := coalesce(new.id, old.id);
  elsif tg_table_name in ('collections', 'tasks', 'events') then
    v_domain_id := coalesce(new.domain_id, old.domain_id);
    select workspace_id into v_workspace_id
    from public.domains where id = v_domain_id;
  elsif tg_table_name = 'domain_members' then
    select workspace_id into v_workspace_id
    from public.domains where id = coalesce(new.domain_id, old.domain_id);
    v_domain_id := coalesce(new.domain_id, old.domain_id);
  end if;

  -- Log the action
  insert into public.audit_log(workspace_id, domain_id, actor_id, action, table_name, record_id, old_data, new_data)
  values(
    v_workspace_id,
    v_domain_id,
    current_user_uid(),
    tg_op,
    tg_table_name,
    coalesce(new.id, old.id),
    case when tg_op = 'UPDATE' then row_to_json(old) else null end,
    case when tg_op in ('INSERT', 'UPDATE') then row_to_json(new) else null end
  );

  return coalesce(new, old);
end;
$$;

-- Attach triggers to all sensitive tables
create trigger audit_workspaces after insert or update or delete on public.workspaces for each row execute function audit_trigger_fn();
create trigger audit_domains after insert or update or delete on public.domains for each row execute function audit_trigger_fn();
create trigger audit_domain_members after insert or update or delete on public.domain_members for each row execute function audit_trigger_fn();
create trigger audit_collections after insert or update or delete on public.collections for each row execute function audit_trigger_fn();
create trigger audit_tasks after insert or update or delete on public.tasks for each row execute function audit_trigger_fn();
create trigger audit_events after insert or update or delete on public.events for each row execute function audit_trigger_fn();
