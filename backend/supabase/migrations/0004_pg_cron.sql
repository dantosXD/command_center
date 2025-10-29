-- 0004_pg_cron.sql: Enable pg_cron and baseline job scheduler tables

-- Ensure pg_cron is installed and enabled (idempotent)
create extension if not exists pg_cron schema cron;

-- Cron schedule patterns stored for reference and configuration UI
create table if not exists public.cron_schedules (
  id uuid primary key default gen_random_uuid(),
  job_name text not null unique,
  schedule expression not null, -- cron expression, e.g., '0 * * * *'
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable timestamps update trigger
create trigger set_updated_at_cron_schedules
before update on public.cron_schedules
for each row execute function public.set_updated_at();

-- Baseline schedules for reminders and digest (placeholder values)
insert into public.cron_schedules (job_name, schedule, description) values
  ('reminders_5min', '*/5 * * * *', 'Send due reminders within next 5 minutes'),
  ('reminders_hourly', '0 * * * *', 'Hourly reminder sweep for upcoming tasks/events'),
  ('digest_daily', '0 7 * * *', 'Daily digest at 07:00 UTC'),
  ('digest_weekly', '0 7 * * 1', 'Weekly digest on Mondays 07:00 UTC')
on conflict (job_name) do nothing;

-- Helper to schedule a job via function
create or replace function public.schedule_cron_job(job_name text, sql text)
returns void language sql as $$
  select cron.schedule(job_name, schedule, sql)
  from public.cron_schedules
  where public.cron_schedules.job_name = schedule_cron_job.job_name;
$$;

-- Example: schedule a reminder sweep (will be activated when Edge Functions exist)
-- select public.schedule_cron_job(
--   'reminders_5min',
--   $$select supabase_functions.invoke('reminder-sweep', json_build_object('window_minutes', 5))$$
-- );
-- This is commented out to avoid errors before function exists; will be added in T021 or T090

-- View to show active jobs
create view public.active_cron_jobs as
  select
    jobid,
    schedule,
    command,
    nodename,
    nodeport,
    database,
    username,
    active,
    jobname
  from cron.job
  join public.cron_schedules cs on cs.job_name = cron.job.jobname;
