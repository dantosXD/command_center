# Implementation Plan: Command Center Hub MVP

**Branch**: `001-central-hub` | **Date**: 2025-10-27 | **Spec**: [/specs/001-central-hub/spec.md](spec.md)
**Input**: Feature specification from `/specs/001-central-hub/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Deliver a self-hosted Command Center that consolidates domains, projects, tasks, and events while enforcing strict privacy and observability guardrails. The MVP stands up a Supabase/Postgres core with Row-Level Security, SeaweedFS-backed file storage through pre-signed URLs, and SvelteKit frontend experiences for the hub, calendars, and collaboration. Delivery proceeds through six increments: (1) platform foundations (schema, RLS, auth, storage, build tooling), (2) task/list workflows with filters and saved views, (3) calendar authoring plus ICS exports and reminder scaffolding, (4) notification pipelines via pg_cron outbox and Edge Functions, (5) hub and collaboration surface (comments, presence, reporting), and (6) hardening, load, and disaster-recovery drills to reach constitution-grade quality gates.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript (SvelteKit 1.x), Deno 1.45 (Edge Functions), SQL (Postgres 15+), Bash/PowerShell for ops automation.  
**Primary Dependencies**: Supabase (PostgREST, GoTrue, Realtime, Edge Functions), pg_cron, pg_trgm, TailwindCSS, Headless UI/Radix, TanStack Query, TipTap, Supabase JS SDK, Caddy/Trafik, Postal/Postfix, Prometheus/Grafana/Loki, Sentry.  
**Storage**: Supabase Postgres (workspace/domain tenancy, notifications, audit), SeaweedFS (S3-compatible object storage).  
**Testing**: Vitest + Testing Library for unit/UI, Playwright for e2e smoke, Supabase testing harness for RLS/contract suites, k6 for load on schedulers, custom Deno test runners for Edge Functions.  
**Target Platform**: Self-hosted Docker Compose (dev/staging) with path to k3s/Kubernetes for HA; PWA-capable web clients (desktop & mobile browsers).  
**Project Type**: Web application with real-time collaboration (frontend + backend services + infrastructure).  
**Performance Goals**: P95 read ≤ 250 ms, P95 write ≤ 400 ms, 99% notifications dispatched < 60 s, 99.5% API/S3 monthly availability.  
**Constraints**: WCAG 2.2 AA accessibility, strict RLS isolation, TLS everywhere, feature flags for incremental release, deterministic builds, idempotent jobs.  
**Scale/Scope**: Initial target of 50–100 active users per workspace, 10 domains/workspace, 50k tasks, 10k events, 20GB files.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify the feature plan satisfies every constitution guardrail:

- ✅ Accessibility: Calendar, hub, and command palette design include keyboard traversal, high contrast themes, and CI accessibility scans plus quarterly manual audits. Owners: Frontend team (UI lead) with QA partnership.
- ✅ Security: Tenancy enforced via workspace_id/domain_id RLS, HMAC-signed webhooks, secrets stored in vault, and dedicated threat model workshop before Phase 3. Owners: Platform security engineer + lead backend.
- ✅ Testing: Vitest unit suites, Supabase contract + RLS suites, Playwright e2e, and notification outbox integration tests mapped per phase with failure ownership documented in TESTING.md.
- ✅ Delivery: Feature flags `central-hub-mvp`, `calendar-overlay`, `mvp-dashboard`, rollout cohorts, automatic rollback tied to error budget + RLS violation alerts, sunset checklist tracked in ADR.
- ✅ Operations: Jobs built on pg_cron + Edge Functions with idempotent outbox pattern, quarterly DR drills covering DB + SeaweedFS + Postal snapshots, on-call runbook update before GA.
- ✅ Build & Release: Docker Compose and Supabase CLI pinned versions, reproducible lockfiles (pnpm), CI pipeline caches validated, environment promotion via git tags with artifact provenance.
- ✅ Documentation: ADRs for architecture and notification pipeline committed before Phase 2 exit, runbooks and release notes maintained in `/docs`.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
backend/
├── supabase/
│   ├── migrations/
│   ├── seeds/
│   ├── functions/                # Edge Functions (Deno)
│   ├── storage-policies/         # SeaweedFS presign rules, RLS helpers
│   └── tests/
├── scripts/
│   ├── cron/                     # pg_cron schedule definitions
│   └── tooling/                  # Supabase CLI, backup scripts
└── outbox/                       # Notification workers (Deno adapters)

frontend/
├── src/
│   ├── lib/
│   ├── routes/
│   ├── components/
│   ├── stores/
│   └── styles/
├── public/
└── tests/
    ├── unit/
    └── e2e/

infrastructure/
├── docker-compose.yml
├── docker/
│   ├── caddy/
│   ├── postal/
│   └── seaweedfs/
└── k8s/
    ├── base/
    └── overlays/

docs/
├── adr/
├── operations/
└── runbooks/

tests/
├── contract/
├── rls/
├── performance/
└── accessibility/
```

**Structure Decision**: Dual-application mono-repo: `backend/` encapsulates Supabase configuration, Edge Functions, and cron tooling; `frontend/` hosts the SvelteKit PWA; `infrastructure/` manages self-hosted orchestration; `docs/` maintains ADRs/runbooks; top-level `tests/` centralizes cross-cutting suites (contract, RLS, performance, accessibility).

## Phase Execution Plan

1. **Foundations (Weeks 1-2)**
   - Create workspace/domain schema with RLS policies, Supabase auth scaffold, and SeaweedFS integration via pre-signed URL Edge Function.
   - Configure Docker Compose (Postgres, PostgREST, GoTrue, Realtime, Edge Functions, SeaweedFS, Postal, Caddy) with TLS termination and secure cookies.
   - Enable pg_cron, pg_trgm, (optional) pgvector; seed feature flag table and baseline ADRs.
   - Establish CI pipelines (lint, Vitest, RLS tests, Playwright smoke, accessibility scan) and observability stack (Prometheus, Grafana, Loki, Sentry).

2. **Tasks & Lists (Weeks 3-4)**
   - Implement task/list CRUD via PostgREST policies and Supabase JS, including filters, saved views, dependencies, subtasks, attachments (SeaweedFS).
   - Build command palette quick-create, keyboard navigation, and structured filters in SvelteKit.
   - Add unit/contract tests for task APIs, RLS guardrails, and UI state management.

3. **Calendar & Reminders (Weeks 5-6)**
   - Model events/calendars with recurrence_rrule, exdates, timezone fields; author calendar views (day/week/month) with overlays.
   - Edge Function handles ICS export/import and recurrence expansion windows, storing reminder schedules in pg_cron with idempotent outbox entries.
   - Validate reminder timing across time zones and add e2e smoke coverage.

4. **Notifications & Digest (Weeks 6-7)**
   - Build notification outbox pipeline (unique user_id/channel/occurrence_id), HMAC-signed Slack webhook, Postal email templates, in-app notification UI with realtime updates.
   - Implement quiet hours, batching/digest logic, and retry with exponential backoff using pg_cron + Edge Functions.
   - Extend monitoring with delivery latency dashboards and alerting on failure rates.

5. **Hub & Collaboration (Weeks 8-9)**
   - Assemble hub (All Domains vs focused) with Today/Upcoming, meetings, quick-add, and presence indicators.
   - Implement comments with @mentions, optimistic updates, and activity timeline; connect reporting dashboard (overdue, upcoming, velocity proxy).
   - Finalize domain switcher, keyboard-first UX, and finalize ADR updates.

6. **Hardening & Readiness (Weeks 10-11)**
   - Run full RLS, contract, accessibility, e2e smoke suites; perform load tests on scheduler/notifications.
   - Execute backup/restore drill (Postgres, SeaweedFS filer metadata + volumes, Postal) and document results.
   - Conduct threat model review sign-off, security regression tests, feature flag sunset checklist, and release readiness assessment.

## Complexity Tracking

No constitution guardrail violations identified; no additional complexity waivers required.
