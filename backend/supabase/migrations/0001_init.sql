-- 0001_init.sql: Base schema, extensions, and core tenancy tables
-- Dependencies: Postgres 15+, Supabase

-- Extensions
create extension if not exists pgcrypto;
create extension if not exists pg_trgm;
create extension if not exists pg_cron;

-- Workspaces
create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  timezone text not null default 'UTC',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Domains (e.g., Home, Work, Play)
create table if not exists public.domains (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  color text,
  visibility text not null check (visibility in ('private','shared','workspace')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_domains_workspace on public.domains(workspace_id);

-- Domain membership
create table if not exists public.domain_members (
  domain_id uuid not null references public.domains(id) on delete cascade,
  user_id uuid not null,
  role text not null check (role in ('owner','admin','member','guest')),
  created_at timestamptz not null default now(),
  primary key (domain_id, user_id)
);
create index if not exists idx_domain_members_user on public.domain_members(user_id);

-- Feature flags baseline (used across phases)
create table if not exists public.feature_flags (
  key text primary key,
  enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS enablement (policies to be added in 0011_tenancy_policies.sql per T011)
alter table public.workspaces enable row level security;
alter table public.domains enable row level security;
alter table public.domain_members enable row level security;

-- Timestamps update trigger (generic)
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;$$;

create trigger set_updated_at_workspaces
before update on public.workspaces
for each row execute function public.set_updated_at();

create trigger set_updated_at_domains
before update on public.domains
for each row execute function public.set_updated_at();
