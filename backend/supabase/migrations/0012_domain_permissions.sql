-- 0012_domain_permissions.sql: Domain membership roles, collection inheritance, and attachments metadata

-- Extend domain_members with role-based permissions
alter table public.domain_members add column if not exists permissions jsonb default '{}';

-- Collection types (project, list, calendar)
create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  domain_id uuid not null references public.domains(id) on delete cascade,
  name text not null,
  kind text not null check (kind in ('project', 'list', 'calendar')),
  description text,
  color text,
  icon text,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_collections_domain on public.collections(domain_id);
alter table public.collections enable row level security;

-- Task status and priority enums
create type task_status as enum ('backlog', 'in-progress', 'blocked', 'done');
create type task_priority as enum ('1', '2', '3', '4');

-- Extend tasks table with collection, recurrence, and completion tracking
alter table public.tasks add column if not exists collection_id uuid references public.collections(id) on delete set null;
alter table public.tasks add column if not exists recurrence_rule text;
alter table public.tasks add column if not exists completed_at timestamptz;
alter table public.tasks add column if not exists assignee_id uuid;

-- Task dependencies (blocking relationships)
create table if not exists public.task_dependencies (
  task_id uuid not null references public.tasks(id) on delete cascade,
  depends_on uuid not null references public.tasks(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (task_id, depends_on)
);
create index if not exists idx_task_dependencies_depends_on on public.task_dependencies(depends_on);
alter table public.task_dependencies enable row level security;

-- Saved filters/views for tasks
create table if not exists public.saved_filters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  domain_id uuid references public.domains(id) on delete cascade,
  name text not null,
  query_params jsonb not null,
  shared_with text[] default array[]::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_saved_filters_user on public.saved_filters(user_id);
create index if not exists idx_saved_filters_domain on public.saved_filters(domain_id);
alter table public.saved_filters enable row level security;

-- Attachment metadata (linked to tasks)
alter table public.attachments add column if not exists size_bytes bigint;
alter table public.attachments add column if not exists mime_type text;
alter table public.attachments add column if not exists uploaded_by uuid;

-- Audit log for privileged actions
create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  action text not null,
  table_name text,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_audit_log_user on public.audit_log(user_id);
create index if not exists idx_audit_log_table on public.audit_log(table_name);
alter table public.audit_log enable row level security;

-- Timestamps update triggers
create trigger set_updated_at_collections
before update on public.collections
for each row execute function public.set_updated_at();

create trigger set_updated_at_saved_filters
before update on public.saved_filters
for each row execute function public.set_updated_at();
