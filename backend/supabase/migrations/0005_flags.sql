-- 0005_flags.sql: Seed feature flags for phased rollout and central-hub gating

-- Clear existing flags (idempotent)
delete from public.feature_flags;

-- Flags per T023 and delivery workflow
insert into public.feature_flags (key, enabled) values
  ('central-hub-mvp', true),
  ('calendar-overlay', false),
  ('mvp-dashboard', false),
  ('ics-import', false),
  ('csv-export', false),
  ('command-palette', false),
  ('collaboration', false),
  ('notifications-ui', false),
  ('quiet-hours', false),
  ('digest-scheduler', false),
  ('slack-webhook', false),
  ('rls-hardened', true),
  ('audit-viewer', false);

-- Helper to query flag state by auth context
create or replace function feature_flag_enabled(flag_key text)
returns boolean language sql stable as $$
  select enabled from public.feature_flags where key = flag_key limit 1;
$$;

-- Helper to restrict rows by multiple flags (AND)
create or replace function feature_flags_enabled(flag_keys text[])
returns boolean language sql stable as $$
  select count(*) = array_length(flag_keys, 1)
  from public.feature_flags
  where key = any(flag_keys) and enabled = true;
$$;
