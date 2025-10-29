-- 0002_core_entities.sql: Collections, tasks, events, attachments

-- Collections (Project, List, Calendar)
create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  domain_id uuid not null references public.domains(id) on delete cascade,
  name text not null,
  kind text not null check (kind in ('project','list','calendar')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_collections_domain on public.collections(domain_id);

-- Tasks
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  domain_id uuid not null references public.domains(id) on delete cascade,
  collection_id uuid references public.collections(id) on delete set null,
  title text not null,
  description text,
  status text not null default 'backlog' check (status in ('backlog','in-progress','blocked','done')),
  priority int,
  due_at timestamptz,
  start_at timestamptz,
  completed_at timestamptz,
  recurrence_rrule text,
  parent_id uuid references public.tasks(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_tasks_domain on public.tasks(domain_id);
create index if not exists idx_tasks_collection on public.tasks(collection_id);
create index if not exists idx_tasks_due on public.tasks(due_at);

-- Task dependencies
create table if not exists public.task_dependencies (
  task_id uuid not null references public.tasks(id) on delete cascade,
  depends_on uuid not null references public.tasks(id) on delete cascade,
  primary key (task_id, depends_on)
);

-- Events
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  domain_id uuid not null references public.domains(id) on delete cascade,
  collection_id uuid references public.collections(id) on delete set null,
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  timezone text not null default 'UTC',
  recurrence_rrule text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_events_domain on public.events(domain_id);
create index if not exists idx_events_collection on public.events(collection_id);
create index if not exists idx_events_starts on public.events(starts_at);

-- Attachments metadata
create table if not exists public.attachments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references public.tasks(id) on delete cascade,
  file_key text not null,
  filename text,
  content_type text,
  size_bytes bigint,
  created_at timestamptz not null default now()
);
create index if not exists idx_attachments_task on public.attachments(task_id);

-- RLS enablement (policies to be added in tenancy.sql per T011)
alter table public.collections enable row level security;
alter table public.tasks enable row level security;
alter table public.task_dependencies enable row level security;
alter table public.events enable row level security;
alter table public.attachments enable row level security;
