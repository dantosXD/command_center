-- 0006_search.sql: Search configuration and indexes for structured filters (T024)

-- Ensure extensions already enabled (idempotent)
create extension if not exists pg_trgm;
create extension if not exists btree_gin;

-- Text search configuration
create text search configuration public.english_unaccented (COPY = english);
alter text search configuration public.english_unaccented
  alter mapping for asciiword, asciihword, hword_asciipart, word, hword, hword_part
  with english_stem;

-- GIN trigram indexes on key text fields for fast prefix/fuzzy matching
create index if not exists idx_domains_name_trgm on public.domains using gin (name gin_trgm_ops);
create index if not exists idx_collections_name_trgm on public.collections using gin (name gin_trgm_ops);
create index if not exists idx_tasks_title_trgm on public.tasks using gin (title gin_trgm_ops);
create index if not exists idx_tasks_description_trgm on public.tasks using gin (description gin_trgm_ops);
create index if not exists idx_events_title_trgm on public.events using gin (title gin_trgm_ops);
create index if not exists idx_events_description_trgm on public.events using gin (description gin_trgm_ops);

-- Full-text search vectors (tsvector) for natural language search
alter table public.tasks add column if not exists search_tsvector tsvector
  generated always as (
    setweight(to_tsvector('english_unaccented', coalesce(title, '')), 'A')
    || setweight(to_tsvector('english_unaccented', coalesce(description, '')), 'B')
  ) stored;
create index if not exists idx_tasks_search_tsv on public.tasks using gin (search_tsvector);

alter table public.events add column if not exists search_tsvector tsvector
  generated always as (
    setweight(to_tsvector('english_unaccented', coalesce(title, '')), 'A')
    || setweight(to_tsvector('english_unaccented', coalesce(description, '')), 'B')
  ) stored;
create index if not exists idx_events_search_tsv on public.events using gin (search_tsvector);

-- Partial indexes for filters by status/priority to avoid scanning all rows
create index if not exists idx_tasks_status on public.tasks (status) where status is not null;
create index if not exists idx_tasks_priority on public.tasks (priority) where priority is not null;
create index if not exists idx_tasks_due_at on public.tasks (due_at) where due_at is not null;
create index if not exists idx_tasks_domain_status on public.tasks (domain_id, status);
create index if not exists idx_events_domain_starts on public.events (domain_id, starts_at);

-- Composite indexes for common query patterns (domain + time + state)
create index if not exists idx_tasks_domain_due_status on public.tasks (domain_id, due_at desc, status) where due_at is not null;
create index if not exists idx_events_domain_starts_ends on public.events (domain_id, starts_at, ends_at) where starts_at is not null;

-- Search helper function (used by hub-search RPC)
create or replace function public.search_tasks_and_events(
  p_query text default '',
  p_domain_id uuid default null,
  p_statuses text[] default null,
  p_priorities int[] default null,
  p_due_from timestamptz default null,
  p_due_to timestamptz default null,
  p_event_starts_from timestamptz default null,
  p_event_starts_to timestamptz default null,
  p_limit int default 50,
  p_offset int default 0
)
returns table (
  type text,
  id uuid,
  title text,
  description text,
  status text,
  priority int,
  due_at timestamptz,
  starts_at timestamptz,
  ends_at timestamptz,
  domain_id uuid,
  created_at timestamptz
)
language sql stable as $$
declare
  v_search_tsvector tsvector;
begin
  v_search_tsvector := to_tsvector('english_unaccented', coalesce(p_query, ''));
  return query
  select
    'task'::text as type,
    t.id,
    t.title,
    t.description,
    t.status,
    t.priority,
    t.due_at,
    null::timestamptz as starts_at,
    null::timestamptz as ends_at,
    t.domain_id,
    t.created_at
  from public.tasks t
  where
    (p_domain_id is null or t.domain_id = p_domain_id)
    and (p_statuses is null or t.status = any(p_statuses))
    and (p_priorities is null or t.priority = any(p_priorities))
    and (p_due_from is null or t.due_at >= p_due_from)
    and (p_due_to is null or t.due_at <= p_due_to)
    and (p_query is null or t.search_tsvector @@ v_search_tsvector)
  union all
  select
    'event'::text as type,
    e.id,
    e.title,
    e.description,
    null::text as status,
    null::int as priority,
    null::timestamptz as due_at,
    e.starts_at,
    e.ends_at,
    e.domain_id,
    e.created_at
  from public.events e
  where
    (p_domain_id is null or e.domain_id = p_domain_id)
    and (p_event_starts_from is null or e.starts_at >= p_event_starts_from)
    and (p_event_starts_to is null or e.starts_at <= p_event_starts_to)
    and (p_query is null or e.search_tsvector @@ v_search_tsvector)
  order by due_at nulls last, starts_at nulls last
  limit p_limit offset p_offset;
end;
$$;
