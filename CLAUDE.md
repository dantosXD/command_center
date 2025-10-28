# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Command Center** is a unified productivity hub for work and life management—a self-hosted web application that consolidates domains (Home, Work, Play), collections (projects, lists, calendars), and items (tasks, events, notes) with real-time collaboration, strict privacy controls, and comprehensive reporting.

**Status**: Specification/Planning phase (feature branch `001-central-hub`). The project is exceptionally well-planned with clear requirements, phased delivery, and comprehensive governance. MVP delivery is structured across 6 phases over ~11 weeks.

## Build & Development Commands

### Prerequisites
- **Node.js**: Check `.nvmrc` (to be created)
- **Package Manager**: pnpm (not npm or yarn)
- **Docker**: Required for database and infrastructure services
- **Database**: Postgres 15+ (via Docker Compose or Supabase)

### Common Development Commands

```bash
# Install dependencies (monorepo root)
pnpm install

# Run frontend dev server
pnpm --filter frontend dev

# Run backend (Supabase) locally
pnpm --filter backend dev
# Or use Supabase CLI directly: supabase start

# Run tests (unit + integration)
pnpm --filter frontend test
pnpm --filter backend test

# Run a specific test file
pnpm --filter frontend vitest src/routes/hub.test.ts
pnpm --filter backend vitest src/functions/reminders.test.ts

# Run e2e tests (Playwright)
pnpm --filter frontend test:e2e
pnpm test:e2e:ui  # Open Playwright UI for debugging

# Run linting and formatting
pnpm lint
pnpm format

# Type checking
pnpm tsc --noEmit

# Build for production
pnpm --filter frontend build
pnpm --filter backend build

# Start Docker Compose stack (dev/staging)
docker-compose up -d
docker-compose logs -f postgres  # View database logs

# Teardown infrastructure
docker-compose down
```

### Monorepo Structure (to be initialized)

```
command_center/
├── frontend/              # SvelteKit 1.x application
│   ├── src/
│   │   ├── routes/        # SvelteKit pages (hub, calendar, domains, etc.)
│   │   ├── components/    # Reusable Svelte components
│   │   ├── lib/           # Utilities (API client, stores, RLS helpers)
│   │   └── tests/
│   ├── package.json
│   └── svelte.config.js
├── backend/               # Supabase migrations, Edge Functions, RLS
│   ├── migrations/        # SQL schema migrations (supabase migrate)
│   ├── functions/         # Deno Edge Functions (reminders, ICS, notifications)
│   ├── tests/             # RLS, contract, and integration tests
│   └── supabase.yaml      # Supabase project config
├── infrastructure/        # Docker Compose, k3s manifests (future)
│   └── docker-compose.yml
├── docs/                  # Architecture, ADRs, runbooks
│   ├── adr/               # Architectural Decision Records
│   └── runbooks/
├── specs/                 # Feature specifications (SpecKit)
│   └── 001-central-hub/
│       ├── spec.md        # User stories, requirements, acceptance criteria
│       ├── plan.md        # 6-phase implementation roadmap
│       ├── tasks.md       # 108 tasks with dependencies
│       └── checklists/
├── package.json           # Monorepo root (pnpm-workspace)
├── pnpm-workspace.yaml
├── tsconfig.json
└── CLAUDE.md              # This file
```

## Architecture Overview

### Stack Summary
- **Frontend**: SvelteKit 1.x, TailwindCSS, Radix UI, TanStack Query, PWA
- **Backend**: Supabase (PostgREST, GoTrue, Realtime, Edge Functions), Postgres 15+, pg_cron
- **Storage**: SeaweedFS (S3-compatible, accessed via pre-signed URLs from Edge Functions)
- **Notifications**: Postal (email), Slack webhooks, outbox pattern for idempotency
- **Infrastructure**: Docker Compose (dev/staging), k3s/Kubernetes (HA prod)
- **Testing**: Vitest, Playwright e2e, custom RLS/contract test harnesses
- **Monitoring**: Prometheus + Grafana + Loki + Sentry

### Core Data Model

**Tenancy**: All data is workspace-scoped and domain-scoped with Row-Level Security.

- **Workspace**: Top-level container (tenant), holds domains, members, roles
- **Domain**: Scoped grouping (Home/Work/Play) with collections and visibility settings
- **Collection**: Project, List, or Calendar (references items, has ownership/permissions)
- **Task**: Work item with status, priority, assignees, recurrence (RRULE), dependencies, subtasks, attachments, comments
- **Event**: Calendar entry with start/end, timezone, attendees, reminders, recurrence (RRULE)
- **Notification**: Outbox entry for email/Slack delivery (idempotent, retryable)
- **Audit Log**: Record of privileged actions with timestamp and actor
- **Comments/Presence**: Activity timeline with @mentions and real-time online status

### Key Architectural Patterns

1. **Row-Level Security (RLS)**: Every table has explicit policies. Users can only see data they have access to. No exceptions.
2. **Notification Outbox**: Background jobs write notifications to a persistent outbox table; a scheduler processes them idempotently with retry logic.
3. **Feature Flags**: All new capabilities ship behind reversible flags (e.g., `central-hub-mvp`, `calendar-overlay`) with per-tenant overrides.
4. **Recurrence Expansion**: Recurring tasks/events are stored with RRULE + exception dates; Edge Functions expand them within a query window on demand.
5. **Presigned URLs**: Files in SeaweedFS are accessed via time-limited, HMAC-signed URLs generated by Edge Functions—never exposed directly.
6. **Real-time Subscriptions**: Supabase Realtime broadcasts changes to the hub, calendar, and presence system.

## Constitution & Quality Gates

The project is governed by a Constitution (`.specify/memory/constitution.md`, v1.0.0) that mandates seven core principles:

### I. Deterministic Correctness
- All changes MUST start from failing tests (red-green-refactor).
- Business rules encoded in automated tests before implementation.

### II. Defense-in-Depth with Row-Level Security
- Every table ships with explicit RLS policies; no exceptions.
- Secrets in managed vaults; no credentials in repos or CI logs.
- Threat models required before new surfaces ship.

### III. Accessible by Default
- WCAG 2.2 AA compliance validated by automated and manual audits.
- New UI work includes accessibility acceptance criteria and keyboard-only paths.
- Accessibility regressions block release.

### IV. Incremental Delivery Behind Feature Flags
- New capabilities ship behind reversible flags with staged rollout plans.
- Automatic rollback triggers on error budget violation or RLS violation alerts.

### V. Idempotent and Recoverable Operations
- Background jobs and workflows MUST be idempotent and safely retryable.
- Disaster recovery drills validate procedures quarterly.

### VI. Reproducible Build & Release Pipeline
- Deterministic builds via pinned dependencies (pnpm lockfiles, Supabase CLI pinned).
- CI/CD captures artifact provenance; commits replay with identical outputs.

### VII. Comprehensive Test Discipline
- Every change MUST provide unit, contract, RLS, and e2e smoke coverage in CI before merge.
- CI fails when mandatory suites are missing or skipped.

### Definition of Done
Before merging any change:
- ✅ Unit tests (Vitest)
- ✅ Contract tests (Supabase API schema validation)
- ✅ RLS tests (isolation validation)
- ✅ E2E smoke tests (Playwright)
- ✅ Accessibility audit (WCAG 2.2 AA, Axe + manual) *if UI changes*
- ✅ Code review confirms tests fail before implementation and pass after
- ✅ Security/privacy assessment logged (if touching personal/regulated data)

## Testing Strategy

### Unit Tests (Vitest)
- Business logic, utilities, calculations, parsing
- Run before commit: `pnpm --filter [frontend|backend] test`
- Coverage target: >80% for critical paths

### Contract Tests (Supabase)
- API schema validation against PostgREST endpoints
- RLS isolation and permission boundaries
- Run via custom harness in CI

### RLS Tests
- Verify users cannot access cross-domain data
- Verify workspace isolation
- Custom test harness validates policy scope

### E2E Smoke Tests (Playwright)
- Critical user flows: hub aggregation, domain creation, task/event CRUD, notification delivery, calendar export
- Run in CI: `pnpm test:e2e`
- UI-only debugging: `pnpm test:e2e:ui`

### Load & Performance Tests
- k6 for notification scheduler under load
- P95 read latency ≤ 250 ms, P95 write ≤ 400 ms
- 99% notifications dispatched < 60 s

## Development Workflow (SpecKit)

The project uses a specification-first workflow via **SpecKit**:

1. **Specification** (`.specify` folder): Feature specs, acceptance criteria, user stories in `/specs/[###-feature]/spec.md`
2. **Planning** (`.specify` folder): Implementation roadmap, phases, tasks in `/specs/[###-feature]/plan.md`
3. **Tasks** (`.specify` folder): Actionable task breakdown (108 tasks, 6 phases) in `/specs/[###-feature]/tasks.md`
4. **Implementation**: Feature branch tied to spec, guided by constitution, phased delivery with feature flags
5. **Architectural Decisions**: Documented as ADRs in `/docs/adr` before merge

### SpecKit Workflows (in `.windsurf/workflows/`)
These are guidance files for structured development:
- `speckit.specify` - Write feature specification
- `speckit.plan` - Generate implementation plan
- `speckit.tasks` - Break down into actionable tasks
- `speckit.implement` - Guide implementation using constitution + plan
- `speckit.constitution` - Review core principles

## Key Implementation Notes

### Phase Sequence (MVP: 6 Phases, ~11 weeks)

**Phase 1: Foundations (Weeks 1–2)**
- Monorepo init, SvelteKit scaffold, Supabase/Postgres schema, RLS policies
- Docker Compose stack (Postgres, Postal, SeaweedFS, Caddy)
- Auth setup (GoTrue), storage bucket pre-signing
- CI pipeline scaffolds

**Phase 2: Tasks & Lists (Weeks 3–4)**
- Task CRUD, filters, saved views, attachments, subtasks, checklists
- List views and sorting
- Bulk operations

**Phase 3: Calendar & Reminders (Weeks 5–6)**
- Calendar schema (events, recurrence RRULE, exdates)
- Multi-calendar overlay, day/week/month views
- ICS import/export, reminder scheduling via pg_cron
- Time zone handling

**Phase 4: Notifications & Digests (Weeks 6–7)**
- Notification outbox with idempotent delivery
- Email (Postal), Slack webhook integrations
- Quiet hours, digest batching
- Edge Function notification dispatcher

**Phase 5: Hub & Collaboration (Weeks 8–9)**
- Central hub assembly (Today/Upcoming aggregation)
- Comments, mentions, presence
- Basic dashboard (overdue, velocity proxy)
- CSV export, audit log UI

**Phase 6: Hardening & Readiness (Weeks 10–11)**
- Full test suites (unit, contract, RLS, e2e, load)
- Performance tuning, database indexing
- Security review, threat model validation
- Disaster recovery drills, runbooks
- Release notes, feature flag documentation

### RLS & Security (Mandatory Every Phase)
- Every query touches RLS policies; audit every table/view.
- Secrets in vault (no .env in repo).
- HMAC-signed presigned URLs for SeaweedFS.
- CORS and CSRF protections on SvelteKit backend routes.

### Feature Flags (Mandatory Every Feature)
Examples:
- `central-hub-mvp` - Enable hub aggregation
- `calendar-overlay` - Multi-calendar UI
- `mvp-dashboard` - Basic reporting
- `notification-outbox-v2` - New delivery pipeline

Flags support:
- Per-tenant overrides (admin panel or database)
- Automatic rollback on error budget violation
- Sunset checklist before GA

### Notification Pipeline (Core to Phase 4+)
1. Business logic writes row to `notifications` outbox table (e.g., on task due date)
2. pg_cron scheduler fires at configured interval
3. Edge Function fetches pending notifications
4. Dispatcher sends via email (Postal), Slack, or in-app
5. Outbox entry marked as delivered (with idempotency key to prevent duplicates)
6. Retries on failure (exponential backoff)

### Recurrence Expansion (Core to Phase 3+)
- Store tasks/events with RRULE string (RFC 5545) and exdates
- Edge Function or RPC expands within a window (e.g., next 30 days)
- Calendar UI receives expanded occurrences, not just the parent
- Subtask/event occurrence updates propagate back to parent RRULE

## Debugging & Troubleshooting

### Database Issues
```bash
# Connect to Postgres
docker-compose exec postgres psql -U postgres -d command_center

# Check RLS policies
SELECT * FROM pg_policies;

# Inspect table structure
\d tasks

# Run migrations
supabase migration up
```

### Frontend Issues
- Open browser DevTools (F12) → Console for errors
- SvelteKit hot reload should auto-refresh
- Playwright UI for e2e debugging: `pnpm test:e2e:ui`

### Backend/Edge Functions
- Check Edge Function logs: `supabase functions deploy [name] --debug`
- Test locally: `deno test src/functions/reminders.test.ts`

### Notifications Not Delivering
1. Check `notifications` outbox table for pending rows
2. Verify pg_cron job is running: `SELECT * FROM cron.job;`
3. Check Postal/Slack integration config (vault)
4. Review Edge Function logs for dispatch errors

## Key Files & References

| File/Path | Purpose |
|-----------|---------|
| `.specify/memory/constitution.md` | Core principles, quality gates, governance (v1.0.0) |
| `specs/001-central-hub/spec.md` | User stories, requirements, acceptance criteria |
| `specs/001-central-hub/plan.md` | 6-phase implementation roadmap, technical context |
| `specs/001-central-hub/tasks.md` | 108 actionable tasks with dependencies |
| `docs/adr/` | Architectural Decision Records (to be created) |
| `docs/runbooks/` | On-call runbooks (to be created) |
| `frontend/src/lib/supabase.ts` | Supabase client singleton (to be created) |
| `backend/migrations/001-init.sql` | Initial schema + RLS (to be created) |
| `docker-compose.yml` | Local dev infrastructure (to be created) |
| `TESTING.md` | Test ownership, failure triage (to be created) |

## Performance & Reliability Targets

| Metric | Target |
|--------|--------|
| P95 read latency | ≤ 250 ms |
| P95 write latency | ≤ 400 ms |
| Notification dispatch (99%) | < 60 s |
| API/S3 availability (99.5%) | Monthly SLA |
| Hub aggregation (P95) | < 1.5 s |
| Calendar overlay render (P95) | < 1.5 s |
| Cross-domain access leaks | < 0.1% |

## Environment Variables (Local Development)

Create `.env.local` at the monorepo root (never commit):

```env
# Supabase
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_DB_PASSWORD=postgres

# SeaweedFS (presigned URLs)
SEAWEEDFS_S3_ENDPOINT=http://localhost:8333

# Postal (email)
POSTAL_WEBHOOK_SECRET=your_secret_here

# Slack webhooks (Phase 4+)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...

# Feature flags (Phase 5+)
FEATURE_CENTRAL_HUB_MVP=true
FEATURE_CALENDAR_OVERLAY=false
```

## Getting Help

- **Specification Questions**: Refer to `/specs/001-central-hub/spec.md` and `/specs/001-central-hub/plan.md`
- **Constitution Violations**: Check `.specify/memory/constitution.md` v1.0.0
- **Architecture**: ADRs in `/docs/adr` or create one before merge
- **RLS/Security**: Threat models in `/docs` or security lead review before Phase 3
- **Test Failures**: Consult `TESTING.md` for ownership and triage SLA (< 1 business day)
