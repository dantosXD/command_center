# Command Center MVP - Implementation Execution Guide

**Status**: Ready for Phase 1 Completion & Phase 2-6 Execution
**Feature Branch**: 001-central-hub
**Total Tasks**: 108 (across 6 phases)
**Date**: 2025-10-28

## Executive Summary

The Command Center MVP is **specification-complete and partially initialized**. The foundational project structure, TypeScript configuration, monorepo setup, and initial database migrations are in place.

**Next Steps**: Complete remaining Phase 1 tasks, then execute Phases 2-6 sequentially following the task breakdown.

---

## Current Project Status

### ✅ Completed Tasks (6/108)

**Phase 1: Setup**
- [X] T001 - Supabase backend scaffold initialized
- [X] T002 - Deno Edge Functions toolchain configured
- [X] T005 - Monorepo config (package.json, pnpm-workspace.yaml, .nvmrc)
- [X] T006 - Initial CI workflow created
- [X] T009 - Base Postgres migration (extensions, workspace/domain schema)
- [X] T010 - Core entities migration (tasks, events, notifications)

### 📋 Remaining Tasks (102/108)

**Phase 1 - Setup (4 tasks)**
- [ ] T003 - Bootstrap SvelteKit workspace with Tailwind, Radix UI, TanStack Query
- [ ] T004 - Configure ESLint, Prettier, Vitest setup
- [ ] T007 - Establish shared testing harness
- [ ] T008 - Seed ADR template and index

**Phase 2 - Foundational (15 tasks)**
- [ ] T011 - Row-level security policies
- [ ] T012 - Storage buckets and metadata schema
- [ ] T013 - Docker Compose stack (Postgres, Supabase, SeaweedFS, Postal, Caddy)
- [ ] T014-T024 - Infrastructure, testing harnesses, feature flags, search indexes

**Phase 3 - User Story 1: Daily Hub (18 tasks)**
- [ ] T025-T042 - Contract tests, RLS tests, backend RPCs, frontend UI

**Phase 4 - User Story 2: Domain Management (25 tasks)**
- [ ] T043-T067 - Domain/collection CRUD, task workflows, boards, permissions

**Phase 5 - User Story 3: Calendar & Reminders (20 tasks)**
- [ ] T068-T087 - Calendar overlay, recurrence, ICS export, reminders

**Phase 6 - User Story 4: Collaboration (12 tasks)**
- [ ] T088-T099 - Comments, mentions, dashboards, audit logs

**Phase 7 - Hardening & Release (8 tasks)**
- [ ] T100-T108 - Security review, performance testing, DR drills, runbooks

---

## Phase Execution Sequence

### Phase 1: Setup (1-2 days)

**Objective**: Complete framework initialization

**Tasks**:
- T003 - Bootstrap SvelteKit (install deps, create routes structure)
- T004 - Configure linting & testing (ESLint, Prettier, Vitest)
- T007 - Testing harness (Vitest, Playwright, RLS fixtures)
- T008 - ADR template seeding

**Critical Path**: T003, T004, T007

**Verification**:
```bash
cd frontend && pnpm install
pnpm dev  # Should start without errors
pnpm lint  # Should pass
pnpm test  # Should run
```

---

### Phase 2: Foundational (3-4 days)

**Objective**: Core infrastructure & security policies

**Critical Tasks**:
- T011 - RLS policies (CRITICAL PATH)
- T013 - Docker Compose stack (CRITICAL PATH)
- T021 - SeaweedFS presign Edge Function
- T024 - Search indexes

**Verification**:
```bash
docker-compose up -d
# Access Supabase Studio: http://localhost:54321
# Access SeaweedFS: http://localhost:8333
```

---

### Phase 3: User Story 1 - Daily Hub (2-3 days)

**Objective**: Central hub aggregation, quick-add, search

**Deliverables**:
- Hub page at `/hub` showing today's tasks/events
- Domain switcher
- Quick-add via command palette
- Structured search with filters
- Realtime updates

---

### Phase 4: User Story 2 - Domain Management (3-4 days)

**Objective**: Domain/collection CRUD, task workflows, permissions

**Deliverables**:
- Domain management page
- Task list & kanban board views
- Role-based access control
- Attachments upload/download
- Saved views with sharing

---

### Phase 5: User Story 3 - Calendar & Reminders (3-4 days)

**Objective**: Calendar overlay, recurrence, ICS export, reminders

**Deliverables**:
- Multi-calendar overlay with color coding
- Recurrence editor (RRULE)
- Timezone-aware reminders
- ICS export/import

---

### Phase 6: User Story 4 - Collaboration (2-3 days)

**Objective**: Comments, mentions, dashboards, audit logs

**Deliverables**:
- Comments with @mentions
- Real-time presence
- Reporting dashboard
- Audit log UI
- Slack integration

---

### Phase 7: Hardening & Release (2-3 days)

**Objective**: Security, performance, disaster recovery

**Deliverables**:
- >80% test coverage
- P95 read ≤ 250ms, P95 write ≤ 400ms
- Security audit completed
- DR procedures tested
- On-call runbooks

---

## Constitution Compliance Checklist

**Before merging Phase X, verify**:

- [ ] Unit tests passing (Vitest)
- [ ] Contract tests passing (API schema validation)
- [ ] RLS tests passing (cross-domain isolation)
- [ ] E2E smoke tests passing (Playwright)
- [ ] Accessibility audit passing (WCAG 2.2 AA)
- [ ] Code review completed
- [ ] Security/privacy assessment documented (if applicable)
- [ ] ADR created for architectural decisions
- [ ] Commit message follows convention: `feat(US#): description`

---

## Start Implementation Now

**Option 1: Using SpecKit Workflow**
```
/speckit.implement
```

This will:
- Verify prerequisites (spec.md, plan.md, tasks.md exist)
- Check checklist completion status
- Execute tasks in phase order
- Track completion (mark tasks with [x])

**Option 2: Manual Execution**
```bash
# Ensure on correct branch
git checkout 001-central-hub

# Install dependencies
pnpm install

# Start Phase 1
cd frontend && pnpm dev
```

---

## Timeline Estimate

- **Phase 1**: 1-2 days (setup)
- **Phase 2**: 3-4 days (infrastructure)
- **Phase 3**: 2-3 days (hub)
- **Phase 4**: 3-4 days (domains/tasks)
- **Phase 5**: 3-4 days (calendar/reminders)
- **Phase 6**: 2-3 days (collaboration)
- **Phase 7**: 2-3 days (hardening)

**Total**: ~11 weeks for full MVP

---

## Success Criteria (MVP Complete When)

✅ Central hub aggregates tasks/events
✅ Domains isolate data with RLS
✅ Tasks have recurrence, dependencies, attachments
✅ Calendar shows multi-domain overlay with ICS export
✅ Reminders fire in user's local time
✅ Comments with @mentions work
✅ Audit log records privileged actions
✅ Dashboard shows overdue/velocity
✅ Slack webhook integration working
✅ All tests passing (unit, contract, RLS, e2e)
✅ Accessibility audit passing
✅ Security review complete
✅ DR procedures tested

---

**Command Center MVP is ready for implementation! 🚀**

**Branch**: 001-central-hub
**Status**: Phase 1 (6/8 tasks) → Ready for Phase 2
**Governance**: Constitution v1.0.0 (7 core principles enforced)
