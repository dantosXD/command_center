-- 0010_hub_view.sql: SQL view aggregating tasks/events with domain indicators for hub_feed RPC

-- Aggregated hub view combining tasks and events with common shape and domain name
drop view if exists public.hub_aggregate;

create view public.hub_aggregate as
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
  d.color as domain_color,
  d.visibility as domain_visibility,
  t.created_at,
  t.updated_at,
  -- Sorting helpers for hub order
  coalesce(t.due_at, t.created_at) as hub_sort_at
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
  d.color as domain_color,
  d.visibility as domain_visibility,
  e.created_at,
  e.updated_at,
  coalesce(e.starts_at, e.created_at) as hub_sort_at
from public.events e
join public.domains d on d.id = e.domain_id;

-- Row-Level Security for the view (inherits from underlying tables)
-- Ensure RLS policies on tasks/events continue to restrict rows
-- No need to create policies on the view itself; Postgres pushes down

-- Helper for Today vs Upcoming classification (for UI labels)
create or replace function public.classify_hub_item(item_type text, due_at timestamptz, starts_at timestamptz)
returns text language sql immutable as $$
  select
    case
      when item_type = 'task' and date_trunc('day', coalesce(due_at, now())) = date_trunc('day', now()) then 'Today'
      when item_type = 'event' and date_trunc('day', coalesce(starts_at, now())) = date_trunc('day', now()) then 'Today'
      when item_type = 'task' and due_at > now() then 'Upcoming'
      when item_type = 'event' and starts_at > now() then 'Upcoming'
      else 'Past'
    end;
$$;
