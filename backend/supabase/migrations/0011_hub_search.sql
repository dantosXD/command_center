-- 0011_hub_search.sql: Search materialized view and indexes for structured filters (T034)
-- Enables fast structured search with filters (status, priority, time windows, domain)

-- Materialized view aggregating searchable fields with RLS-safe row filtering
drop materialized view if exists public.hub_search_mv;

create materialized view public.hub_search_mv as
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
  d.name as domain_name,
  d.visibility as domain_visibility,
  -- Search vector (already exists on tasks; replicate here for uniformity)
  t.search_tsvector,
  -- Time bucketing for UI filters (Today, Upcoming)
  case
    when date_trunc('day', coalesce(t.due_at, now())) = date_trunc('day', now()) then 'Today'
    when t.due_at > now() then 'Upcoming'
    else 'Past'
  end as time_bucket,
  t.created_at
from public.tasks t
join public.domains d on d.id = t.domain_id

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
  d.name as domain_name,
  d.visibility as domain_visibility,
  -- Search vector
  e.search_tsvector,
  case
    when date_trunc('day', coalesce(e.starts_at, now())) = date_trunc('day', now()) then 'Today'
    when e.starts_at > now() then 'Upcoming'
    else 'Past'
  end as time_bucket,
  e.created_at
from public.events e
join public.domains d on d.id = e.domain_id;

-- Unique index for refresh/concurrent access
create unique index if not exists idx_hub_search_mv_pk on public.hub_search_mv (type, id);

-- GIN trigram index on title/description for fast prefix/fuzzy
create index if not exists idx_hub_search_mv_title_trgm on public.hub_search_mv using gin (title gin_trgm_ops);
create index if not exists idx_hub_search_mv_desc_trgm on public.hub_search_mv using gin (description gin_trgm_ops);

-- GIN tsvector for full-text
create index if not exists idx_hub_search_mv_search_tsv on public.hub_search_mv using gin (search_tsvector);

-- Partial indexes for common filters (status, priority, time_bucket)
create index if not exists idx_hub_search_mv_status on public.hub_search_mv (status) where status is not null;
create index if not exists idx_hub_search_mv_priority on public.hub_search_mv (priority) where priority is not null;
create index if not exists idx_hub_search_mv_time_bucket on public.hub_search_mv (time_bucket) where time_bucket is not null;

-- Composite for domain+time+status/priority
create index if not exists idx_hub_search_mv_domain_status on public.hub_search_mv (domain_id, status) where status is not null;
create index if not exists idx_hub_search_mv_domain_priority on public.hub_search_mv (domain_id, priority) where priority is not null;
create index if not exists idx_hub_search_mv_domain_due on public.hub_search_mv (domain_id, due_at) where due_at is not null;
create index if not exists idx_hub_search_mv_domain_starts on public.hub_search_mv (domain_id, starts_at) where starts_at is not null;

-- Function to refresh materialized view safely (idempotent)
create or replace function public.refresh_hub_search_mv()
returns void language plpgsql as $$
begin
  refresh materialized view concurrently public.hub_search_mv;
end;
$$;
