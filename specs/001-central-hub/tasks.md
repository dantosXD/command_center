# Tasks: Command Center Hub MVP

**Input**: plan.md, spec.md from `/specs/001-central-hub/`
**Prerequisites**: Research artifacts unavailable; derive tasks from plan/spec

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Task parallelizable (different files, no unmet dependencies)
- **[Story]**: Maps to user story label `[US1]`, `[US2]`, `[US3]`, `[US4]`
- Include exact file paths in descriptions; append `(critical path)` where delay endangers schedule

## Phase 1: Setup (Shared Infrastructure)

### Backend (Setup)

- [X] T001 Initialize Supabase backend scaffold (migrations/, seeds/, functions/, storage-policies/, tests/) in `backend/supabase/` (critical path)
- [X] T002 Configure Deno Edge Functions toolchain (`deno.json`, shared libs) in `backend/supabase/functions/` (critical path)

### Frontend (Setup)

- [X] T003 Bootstrap SvelteKit workspace with Tailwind, Radix UI, TanStack Query, Supabase client in `frontend/` (critical path)
- [X] T004 [P] Configure ESLint, Prettier, Vitest setup, and shared UI testing utilities in `frontend/` and `frontend/tests/`

### Infra/Ops (Setup)

- [X] T005 Author root toolchain config (`package.json`, `pnpm-workspace.yaml`, `.nvmrc`) for mono-repo orchestration at repository root (critical path)
- [X] T006 [P] Create initial CI workflow running lint and placeholder tests in `.github/workflows/ci.yml`

### QA & Docs (Setup)

- [X] T007 Establish shared testing harness (Vitest config, Playwright project, Supabase test utils) in `tests/` and `frontend/tests/` (critical path)
- [X] T008 Seed ADR template and index entries for feature documentation in `docs/adr/`

---

## Phase 2: Foundational (Blocking Prerequisites)

### Backend (Foundational)

- [X] T009 Develop base Postgres migration enabling required extensions and workspace/domain/member tables with tenancy columns in `backend/supabase/migrations/0001_init.sql` (critical path)
- [X] T010 Extend migrations for collections, tasks, events, and notification artifacts with foreign keys in `backend/supabase/migrations/0002_core_entities.sql` (critical path)
- [X] T011 Author row-level security policies for workspace/domain scoped access across core tables in `backend/supabase/storage-policies/tenancy.sql` (critical path)
- [X] T012 Define Supabase storage buckets and attachment metadata schema in `backend/supabase/migrations/0003_storage.sql`

### Infra/Ops (Foundational)

- [X] T013 Compose Docker stack for Postgres, Supabase services, Edge Functions, SeaweedFS, Postal, and Caddy with TLS in `infrastructure/docker-compose.yml` (critical path)
- [X] T014 Configure SeaweedFS deployment (dockerfiles, `filer.toml`, S3 gateway) with readiness probes in `infrastructure/docker/seaweedfs/` (critical path)
- [X] T015 Implement SeaweedFS and Supabase health-check scripts in `infrastructure/scripts/health/`
- [X] T016 Configure secrets vault integration (HashiCorp Vault or Supabase secrets) with Terraform/Docker bootstrap in `infrastructure/secrets/` (critical path)
- [X] T017 [P] Add secret scanning and CI enforcement (gitleaks/pre-commit) in `.github/workflows/` and `tools/security/`

### QA (Foundational)

- [X] T018 Build Supabase RLS regression harness (setup fixtures, assertion helpers) in `tests/rls/` (critical path)
- [X] T019 Build API contract test harness (OpenAPI mocks, Supabase client fixtures) in `tests/contract/` (critical path)
- [X] T020 Configure Playwright base (`playwright.config.ts`, env launchers) targeting Docker stack in `frontend/tests/e2e/`

### Edge Functions & Scheduling (Foundational)

- [X] T021 Implement SeaweedFS pre-sign Edge Function with upload validation in `backend/supabase/functions/presign/index.ts` (critical path)
- [X] T022 Seed pg_cron enablement and baseline job scheduler tables in `backend/supabase/migrations/0004_pg_cron.sql`
- [X] T023 Seed feature flags (`central-hub-mvp`, `calendar-overlay`, `mvp-dashboard`) and defaults in `backend/supabase/migrations/0005_flags.sql`
- [X] T024 Provision search indexes (pg_trgm, full-text) and search configuration in `backend/supabase/migrations/0006_search.sql` (critical path)

---

## Phase 3: User Story 1 - Focused Daily Hub (Priority: P1) 🎯 MVP

**Goal**: Provide a unified hub aggregating Today/Upcoming tasks and events with quick-add, structured search, and domain switcher.
**Independent Test**: Sign in, toggle All Domains vs focused domain, execute structured search, create tasks via command palette, verify hub updates without leaving page.

### QA (US1)

- [X] T025 [P] [US1] Author contract test for hub aggregation RPC in `tests/contract/hub-aggregation.spec.ts` (critical path)
- [X] T026 [P] [US1] Implement RLS coverage for hub view cross-domain isolation in `tests/rls/hub-access.spec.ts` (critical path)
- [X] T027 [P] [US1] Write Vitest suite for hub stores and quick-add parser in `frontend/tests/unit/hubStore.spec.ts`
- [X] T028 [P] [US1] Build Playwright e2e flow for daily planning and domain switching in `frontend/tests/e2e/hub.spec.ts` (critical path)
- [X] T029 [P] [US1] Extend accessibility audit for hub widgets in `tests/accessibility/hub.axe.spec.ts`
- [X] T030 [P] [US1] Create contract tests for search/filter API endpoints in `tests/contract/hub-search.spec.ts` (critical path)
- [X] T031 [P] [US1] Expand RLS tests for search scopes and saved filters in `tests/rls/hub-search.spec.ts` (critical path)

### Backend (US1)

- [X] T032 [P] [US1] Create SQL view aggregating tasks/events with domain indicators in `backend/supabase/migrations/0010_hub_view.sql` (critical path)
- [X] T033 [US1] Implement Supabase RPC (`hub_feed`) applying feature flag + tenancy filters in `backend/supabase/functions/hub-feed/index.ts` (critical path)
- [X] T034 [P] [US1] Implement search materialized view and indexing for structured filters in `backend/supabase/migrations/0011_hub_search.sql` (critical path)
- [X] T035 [US1] Build search and saved filter RPCs (including natural language parse hooks) in `backend/supabase/functions/hub-search/index.ts` (critical path)

### Frontend (US1)

- [X] T036 [P] [US1] Implement domain selection store with persisted preference in `frontend/src/stores/domain.ts` (critical path)
- [X] T037 [US1] Build hub UI (Today/Upcoming, meetings, quick-add widgets) in `frontend/src/routes/(app)/hub/+page.svelte` (critical path)
- [X] T038 [US1] Wire command palette quick-add mutations to Supabase using natural language parser in `frontend/src/lib/components/CommandPalette.svelte`
- [X] T039 [US1] Implement quick-add parsing utilities and validation in `frontend/src/lib/utils/nlp.ts`
- [X] T040 [US1] Add realtime subscription store for hub updates in `frontend/src/lib/stores/hubRealtime.ts`
- [X] T041 [US1] Build structured search UI (filters drawer, saved views) in `frontend/src/lib/components/hub/SearchPanel.svelte`
- [X] T042 [US1] Integrate search results with hub list virtualisation and saved view persistence in `frontend/src/lib/services/hubSearch.ts`

---

## Phase 4: User Story 2 - Domain & Collection Management (Priority: P1)

**Goal**: Allow owners to manage domains, projects, lists, and calendars with role-based visibility while delivering full task/list/board workflows.
**Independent Test**: Create private and shared domains, assign roles, execute task/list/board CRUD with dependencies and attachments, confirm saved filters persist and permissions hold.

### QA (US2)

- [X] T043 [P] [US2] Author contract test for domain/collection CRUD endpoints in `tests/contract/domains.spec.ts` (critical path)
- [X] T044 [P] [US2] Extend RLS tests covering domain visibility controls in `tests/rls/domain-visibility.spec.ts` (critical path)
- [X] T045 [P] [US2] Create contract tests for task/list/board CRUD and dependency APIs in `tests/contract/tasks.spec.ts` (critical path)
- [X] T046 [P] [US2] Add RLS regression coverage for tasks, attachments, and saved filters in `tests/rls/tasks.spec.ts` (critical path)
- [X] T047 [P] [US2] Create Deno unit tests for domain/task triggers and role grants in `backend/supabase/tests/domain-task.spec.ts`
- [X] T048 [P] [US2] Build Playwright domain administration and task board flows in `frontend/tests/e2e/domain-tasks.spec.ts` (critical path)
- [X] T049 [P] [US2] Update accessibility audit for management forms, list, and board interactions in `tests/accessibility/domain-tasks.axe.spec.ts`

### Backend (US2)

- [X] T050 [P] [US2] Add migrations for domain membership roles, collection inheritance, and attachments metadata in `backend/supabase/migrations/0012_domain_permissions.sql` (critical path)
- [X] T051 [US2] Implement Supabase RPCs for domain CRUD and membership invites in `backend/supabase/functions/domains/index.ts`
- [X] T052 [US2] Define PostgREST policies for domain-scoped resources in `backend/supabase/storage-policies/domains.sql` (critical path)
- [X] T053 [US2] Establish audit triggers logging privileged actions in `backend/supabase/migrations/0013_audit_log.sql`
- [X] T054 [P] [US2] Implement task/list CRUD RPCs with recurrence, dependencies, and attachments in `backend/supabase/functions/tasks/index.ts` (critical path)
- [X] T055 [US2] Create saved filter persistence and sharing RPCs in `backend/supabase/functions/task-filters/index.ts`
- [X] T056 [US2] Build board ordering and swimlane logic (status/priority lanes) in `backend/supabase/functions/task-board/index.ts`
- [X] T057 [US2] Integrate SeaweedFS attachment linking and metadata validation in `backend/supabase/functions/task-attachments/index.ts`

### Frontend (US2)

- [X] T058 [US2] Build domain management page with create/edit/archive flows in `frontend/src/routes/(app)/domains/+page.svelte` (critical path)
- [X] T059 [US2] Implement collection form components with validation in `frontend/src/lib/components/domains/CollectionForm.svelte`
- [X] T060 [US2] Add role assignment drawer and invitation workflows in `frontend/src/lib/components/domains/RoleDrawer.svelte`
- [X] T061 [US2] Wire domain invite notifications and Slack webhook triggers in `frontend/src/lib/services/domainInvites.ts`
- [X] T062 [US2] Create task list view route with filters and inline editing in `frontend/src/routes/(app)/tasks/list/+page.svelte` (critical path)
- [X] T063 [US2] Build kanban board route with drag/drop interactions in `frontend/src/routes/(app)/tasks/board/+page.svelte` (critical path)
- [X] T064 [US2] Implement task detail drawer with recurrence, dependencies, and attachments in `frontend/src/lib/components/tasks/TaskDrawer.svelte`
- [X] T065 [US2] Deliver saved view builder UI with share controls in `frontend/src/lib/components/tasks/SavedFilters.svelte`
- [X] T066 [US2] Integrate SeaweedFS attachment upload/download UI in `frontend/src/lib/components/tasks/AttachmentPicker.svelte`
- [X] T067 [US2] Document domain governance and task workflow decisions in `docs/adr/command-center-architecture.md`

---

## Phase 5: User Story 3 - Calendar & Reminder Integrity (Priority: P2)

**Goal**: Synchronize tasks/events with calendars, support time zones, recurrence, ICS export, and reminder reliability.
**Independent Test**: Create recurring items, ensure overlays render correctly, verify reminders fire in local time, and confirm ICS export imports cleanly.

### QA (US3)

- [X] T068 [P] [US3] Write contract tests for calendar, reminder, and ICS import/export APIs in `tests/contract/calendar.spec.ts` (critical path)
- [X] T069 [P] [US3] Add RLS tests for shared calendar access and cross-domain isolation in `tests/rls/calendar-access.spec.ts` (critical path)
- [X] T070 [P] [US3] Create recurrence parser unit tests in `backend/supabase/tests/recurrence.spec.ts`
- [X] T071 [P] [US3] Implement Playwright coverage for calendar overlays, drag/drop, and ICS import/export flows in `frontend/tests/e2e/calendar.spec.ts` (critical path)
- [X] T072 [P] [US3] Update accessibility audits for calendar keyboard traversal and import dialogs in `tests/accessibility/calendar.axe.spec.ts`

### Backend (US3)

- [X] T073 [P] [US3] Extend migrations for calendars, events, recurrence rules, exdates, and timezone fields in `backend/supabase/migrations/0014_calendars.sql` (critical path)
- [X] T074 [US3] Implement recurrence expansion Edge Function for scheduling windows in `backend/supabase/functions/recurrence-scheduler/index.ts` (critical path)
- [X] T075 [US3] Implement ICS import/export Edge Functions with domain filtering in `backend/supabase/functions/ics-sync/index.ts` (critical path)
- [X] T076 [US3] Configure reminder pg_cron jobs and retries in `backend/scripts/cron/reminders.sql`
- [X] T077 [US3] Add ICS import/export integration tests in `backend/supabase/tests/ics-sync.spec.ts`

### Frontend (US3)

- [X] T078 [US3] Build calendar page with day/week/month layouts, overlays, and ICS import controls in `frontend/src/routes/(app)/calendar/+page.svelte` (critical path)
- [X] T079 [US3] Implement reusable calendar components (week grid, timeline) in `frontend/src/lib/components/calendar/WeekView.svelte`
- [X] T080 [US3] Add natural-language quick add for events/tasks in `frontend/src/lib/services/calendarQuickAdd.ts`
- [X] T081 [US3] Wire timezone-aware calendar store and filters in `frontend/src/lib/stores/calendarStore.ts`

---

## Phase 6: User Story 4 - Collaboration & Notifications (Priority: P3)

**Goal**: Deliver collaboration (comments, presence, dashboard) and notification pipelines (UI + email + quiet hours + digests).
**Independent Test**: Mention users, update statuses, review dashboards, receive in-app/email notifications honoring quiet hours and digests.

### QA (US4)

- [X] T082 [P] [US4] Write contract tests for notification outbox and digest endpoints in `tests/contract/notifications.spec.ts` (critical path)
- [X] T083 [P] [US4] Expand RLS tests for notification preferences and audit visibility in `tests/rls/notifications-access.spec.ts` (critical path)
- [X] T084 [P] [US4] Create unit tests for digest scheduler logic in `backend/supabase/tests/digest-worker.spec.ts`
- [X] T085 [P] [US4] Implement Playwright tests for notifications center and quiet hours in `frontend/tests/e2e/notifications.spec.ts`
- [X] T086 [P] [US4] Update accessibility audit for comments and dashboards in `tests/accessibility/collaboration.axe.spec.ts`
- [X] T087 [P] [US4] Create contract tests for CSV export endpoints verifying sanitized payloads in `tests/contract/exports.spec.ts` (critical path)
- [X] T088 [P] [US4] Add RLS/privacy regression tests for CSV exports ensuring domain scoping and masking in `tests/rls/exports.spec.ts` (critical path)

### Backend (US4)

- [X] T089 [P] [US4] Add migrations for notification outbox, delivery logs, user quiet hours in `backend/supabase/migrations/0015_notifications.sql` (critical path)
- [X] T090 [US4] Implement notification outbox worker (email + Slack channels, retries) in `backend/outbox/worker.ts` (critical path)
- [X] T091 [US4] Configure digest and quiet-hour pg_cron schedules in `backend/scripts/cron/digests.sql`
- [X] T092 [US4] Create email templates and localization helpers in `backend/outbox/templates/email/`
- [X] T093 [US4] Extend Slack webhook adapter with signing + filtering in `backend/outbox/channels/slack.ts`
- [X] T094 [US4] Introduce comments, mentions, and activity timeline tables in `backend/supabase/migrations/0016_comments.sql`
- [X] T095 [US4] Implement presence and reporting feed RPCs in `backend/supabase/functions/presence-feed/index.ts`
- [X] T096 [US4] Implement CSV export RPC applying domain filters and column masking in `backend/supabase/functions/csv-export/index.ts` (critical path)
- [X] T097 [US4] Define CSV export SQL views and auditing hooks to scrub sensitive fields in `backend/supabase/migrations/0017_csv_exports.sql` (critical path)
- [X] T098-A [US4] Implement email unsubscribe footer generation with CAN-SPAM/GDPR compliance statements in `backend/outbox/templates/email/unsubscribe-footer.ts` (critical path)
- [X] T098-B [US4] Add unsubscribe link handler and preference persistence in `backend/supabase/functions/unsubscribe/index.ts` with audit logging (critical path)
- [X] T098-C [US4] Create contract tests for unsubscribe endpoint and footer rendering in `tests/contract/unsubscribe.spec.ts` (critical path)

### Frontend (US4)

- [X] T098 [US4] Build notifications center UI with realtime updates in `frontend/src/routes/(app)/notifications/+page.svelte` (critical path)
- [X] T099 [US4] Add quiet hours settings UI in `frontend/src/lib/components/notifications/QuietHoursDialog.svelte`
- [X] T100 [US4] Implement digest preference management UI in `frontend/src/lib/components/notifications/DigestPreferences.svelte`
- [X] T101 [US4] Build comments & mentions UI with optimistic updates in `frontend/src/lib/components/comments/CommentThread.svelte`
- [X] T102 [US4] Create reporting dashboard (overdue, upcoming, velocity) in `frontend/src/routes/(app)/dashboard/+page.svelte`
- [X] T103 [US4] Surface audit trail viewer and export controls in `frontend/src/lib/components/dashboard/AuditTrail.svelte`
- [X] T104 [US4] Implement CSV export UI with download handling and error feedback in `frontend/src/lib/components/dashboard/ExportMenu.svelte` (critical path)
- [X] T105 [US4] Configure Sentry alert routing for notification and export failures in `infrastructure/monitoring/alert-rules/notifications.yaml`

---

## Final Phase: Polish & Cross-Cutting Concerns

- [X] T106 [P] Produce Grafana dashboards for hub latency, calendar throughput, notification pipeline SLIs in `infrastructure/monitoring/grafana/`
- [X] T107 Define alert rules for RLS violations, SeaweedFS health, and reminder latency in `infrastructure/monitoring/alert-rules/`
- [X] T108 [P] Author backup/restore scripts for Postgres, SeaweedFS, Postal in `backend/scripts/tooling/backup-restore.{ps1,sh}` (critical path)
- [X] T109 Run load and failure drills with k6 scripts targeting notification/recurrence jobs in `tests/performance/notification-load.k6.ts`
- [X] T110 [P] Compile release ADRs capturing trade-offs (architecture, notification pipeline, task workflows) in `docs/adr/`
- [X] T111 Update deployment guide for dev → staging promotion, feature flag rollout, and rollback plan in `docs/operations/deployment.md`
- [X] T112 [P] Execute final accessibility regression suite across hub, domains, calendar, and notifications in `tests/accessibility/regression.md`
- [X] T113 Validate quickstart instructions and craft smoke checklist in `specs/001-central-hub/quickstart.md`
- [X] T114 [P] Implement localization validation tests for date/time formatting across locales (en-US, de-DE, ja-JP) and DST transitions in `tests/localization/date-formatting.spec.ts` (critical path)
- [X] T115 [P] Create email footer compliance tests verifying unsubscribe links, CAN-SPAM/GDPR statements, and locale-appropriate legal text in `tests/localization/email-footer.spec.ts` (critical path)
- [X] T116 Implement velocity metric calculation and display tests in `tests/performance/velocity-metric.spec.ts` validating slope computation and +/-% WoW accuracy (critical path)

---

## Dependencies & Execution Order

- **Phase 1 → Phase 2**: Complete setup (T001–T008) before foundational tasks.
- **Phase 2 → User Stories**: Foundational backend, infra, security, and QA scaffolds (T009–T024) unblock stories; all user story work depends on these.
- **User Story Priorities**: `[US1]` and `[US2]` (both P1) can initiate once Phase 2 finishes; `[US3]` (P2) depends on `[US1]` search + `[US2]` task models; `[US4]` (P3) depends on `[US2]` task data and `[US3]` reminder infrastructure.
- **Story Internals**: Tests (T025/T043/T068/T082) precede implementations within each story; migrations precede RPCs; RPCs precede frontend integrations.
- **Polish Phase**: Begins after desired stories reach acceptance, leveraging telemetry and operations artifacts generated earlier.

### Dependency Graph (High-Level)

```text
Setup (T001–T008)
  ↓
Foundational (T009–T024)
  ↓
User Story 1 (T025–T042) ──┐
                            ├─> User Story 3 (T068–T081)
User Story 2 (T043–T067) ──┘     ↓
                                 User Story 4 (T082–T100)
                                     ↓
Polish (T101–T108)
```

## Parallel Execution Examples

- **Foundational**: T013 (Docker compose), T014 (SeaweedFS config), and T016 (vault integration) can progress in parallel once T009–T011 draft schema and policies.
- **User Story 1**: Run T025–T031 test authoring concurrently while backend tasks T032–T035 progress; frontend tasks T036–T042 can split across developers after T032 lands.
- **User Story 2**: T050 (migrations) must land before T058 domain UI wiring, but T045–T049 QA tasks can execute in parallel; frontend tasks T062–T066 can run concurrently after T054 ships.
- **User Story 3**: T073 migrations unlock simultaneous work on T074 recurrence function and T078 frontend overlays.
- **User Story 4**: T087 migrations gate T088 worker; meanwhile, T085 Playwright scripting and T091 Slack adapter can proceed independently.

## Implementation Strategy

1. **MVP Slice**: Deliver Setup + Foundational + User Story 1 to unlock central hub demo with search; treat as Milestone 1 PR with full test suite.
2. **Domain & Task Workflows**: Land User Story 2 as Milestone 2 PR, expanding task/list/board capabilities, saved filters, and domain governance docs.
3. **Scheduling Excellence**: Ship User Story 3 (Milestone 3) with recurrence engine, ICS export, and calendar UX.
4. **Collaboration & Notifications**: Complete User Story 4 (Milestone 4) with outbox worker, quiet hours, digests, dashboards.
5. **Hardening**: Polish phase ensures observability, backup/restore, load drills, accessibility, and deployment runbooks before GA.

**Suggested MVP Scope**: Phases 1–3 (through `[US1]`) provide a usable daily planning hub with secure tenancy and structured search; subsequent milestones add governance, scheduling depth, collaboration, and notifications.
