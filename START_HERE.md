# 🚀 Command Center MVP - Start Here

**Welcome!** Your Command Center MVP is specification-complete, infrastructure-initialized, and ready for implementation.

## What Is This Project?

**Command Center** is a unified productivity hub that consolidates:
- 📋 Tasks, projects, and lists
- 📅 Calendars with events and reminders
- 👥 Domains (Home, Work, Play) for organization
- 🔔 Notifications and collaboration features
- 🔐 Strict privacy controls with Row-Level Security

**Status**: Fully planned, ready for implementation
**Timeline**: ~11 weeks (6 phases + hardening)
**Team Size**: 1-3 developers

---

## Quick Start (5 minutes)

### 1. Read the Specification
The MVP consists of 4 user stories:

```bash
cat specs/001-central-hub/spec.md
```

**Key Stories**:
- **US1 (P1)**: Central hub aggregates today's tasks/events
- **US2 (P1)**: Domains organize work with privacy controls
- **US3 (P2)**: Calendar with reminders and timezone support
- **US4 (P3)**: Collaboration via comments and dashboards

### 2. Review the Implementation Plan
Understand the architecture and phases:

```bash
cat specs/001-central-hub/plan.md
```

### 3. See the Task Breakdown
108 tasks organized into 6 phases:

```bash
cat specs/001-central-hub/tasks.md
```

### 4. Start Implementation
Choose one:

**Option A: Automated (Recommended)**
```
Use /speckit.implement slash command (in Windsurf/Claude Code)
```

**Option B: Manual**
```bash
git checkout 001-central-hub
pnpm install
cd frontend && pnpm dev
# Start with tasks marked [ ] in tasks.md
```

---

## Key Documents

| Document | Purpose | Read First? |
|----------|---------|------------|
| `CLAUDE.md` | Project guidance for AI | 👍 Yes |
| `IMPLEMENTATION_GUIDE.md` | Phase-by-phase execution | 👍 Yes |
| `specs/001-central-hub/spec.md` | Feature requirements | 👍 Yes |
| `specs/001-central-hub/plan.md` | Architecture & design | ✅ After spec |
| `specs/001-central-hub/tasks.md` | 108 actionable tasks | ✅ When implementing |
| `.specify/memory/constitution.md` | 7 core principles | ✅ Reference |
| `SPECKIT_IMPLEMENTATION.md` | SpecKit workflows | ✅ Reference |

---

## Project Structure

```
command_center/
├── frontend/                    # SvelteKit 1.x web app
│   ├── src/
│   │   ├── routes/             # Pages (hub, calendar, domains)
│   │   ├── components/         # UI components
│   │   ├── stores/             # State management
│   │   └── lib/                # Utilities & services
│   └── tests/                  # Unit & E2E tests
├── backend/                     # Supabase backend
│   └── supabase/
│       ├── migrations/         # Database schema
│       ├── functions/          # Deno Edge Functions
│       ├── storage-policies/   # RLS policies
│       └── tests/              # Database tests
├── infrastructure/              # Docker & Kubernetes
│   └── docker-compose.yml      # Local dev stack
├── docs/
│   └── adr/                    # Architecture decisions
├── specs/001-central-hub/       # Feature documentation
│   ├── spec.md                 # Requirements
│   ├── plan.md                 # Implementation plan
│   └── tasks.md                # Task breakdown
├── .specify/                    # SpecKit framework
├── .windsurf/                   # Windsurf workflows
└── CLAUDE.md                    # This guide
```

---

## Tech Stack

**Frontend**: SvelteKit 1.x, TailwindCSS, Radix UI, TanStack Query
**Backend**: Supabase (Postgres 15+, PostgREST, GoTrue, Edge Functions)
**Storage**: SeaweedFS (S3-compatible)
**Email**: Postal (SMTP server)
**Infrastructure**: Docker Compose (dev/staging), k3s/k8s (HA prod)
**Testing**: Vitest, Playwright, custom RLS/contract harnesses
**Monitoring**: Prometheus + Grafana + Loki + Sentry

---

## 7 Core Principles (Constitution)

Every feature MUST satisfy these non-negotiable principles:

1. **Deterministic Correctness** - Tests first, red-green-refactor
2. **Defense-in-Depth Security** - RLS on all data, secrets in vaults
3. **Accessible by Default** - WCAG 2.2 AA compliance
4. **Incremental Delivery** - Feature flags, staged rollout
5. **Idempotent Operations** - Background jobs safely retryable
6. **Reproducible Builds** - Deterministic, hermetic toolchains
7. **Comprehensive Testing** - Unit, contract, RLS, e2e tests REQUIRED

**Definition of Done**:
- ✅ Unit tests (Vitest)
- ✅ Contract tests (RLS/API schema)
- ✅ E2E smoke tests (Playwright)
- ✅ Accessibility audit (WCAG 2.2 AA)
- ✅ Code review + test verification
- ✅ Security/privacy assessment (if applicable)

---

## Implementation Timeline

| Phase | Duration | Goal |
|-------|----------|------|
| **Phase 1** | 1-2 days | Setup: SvelteKit, Docker, testing harnesses |
| **Phase 2** | 3-4 days | Foundational: RLS, Docker stack, feature flags |
| **Phase 3** | 2-3 days | **US1**: Daily hub aggregation |
| **Phase 4** | 3-4 days | **US2**: Domain/task management |
| **Phase 5** | 3-4 days | **US3**: Calendar + reminders |
| **Phase 6** | 2-3 days | **US4**: Collaboration + dashboard |
| **Phase 7** | 2-3 days | Hardening: Tests, security, DR drills |
| **Total** | ~11 weeks | **MVP Complete** |

---

## Current Status

### ✅ Completed (6/108 tasks)

- [x] T001 - Supabase backend scaffold
- [x] T002 - Deno Edge Functions toolchain
- [x] T005 - Monorepo config (package.json, pnpm-workspace.yaml)
- [x] T006 - Initial CI workflow
- [x] T009 - Base Postgres migration (workspace/domain schema)
- [x] T010 - Core entities migration (tasks, events)

### 📋 Next: Phase 1 Completion (4 tasks)

- [ ] T003 - Bootstrap SvelteKit with Tailwind, Radix UI, TanStack Query
- [ ] T004 - Configure ESLint, Prettier, Vitest
- [ ] T007 - Establish testing harness (Vitest, Playwright, RLS)
- [ ] T008 - Seed ADR template

### ➡️ Then: Phase 2-7 (98 tasks)

All tasks documented in `specs/001-central-hub/tasks.md`

---

## Next Actions

### For First Implementation

1. **Read the specification** (15 min)
   ```bash
   cat specs/001-central-hub/spec.md
   ```

2. **Review the implementation guide** (10 min)
   ```bash
   cat IMPLEMENTATION_GUIDE.md
   ```

3. **Review the plan** (15 min)
   ```bash
   cat specs/001-central-hub/plan.md
   ```

4. **Start Phase 1** (choose one):

   **Via SpecKit Workflow** (recommended):
   ```
   /speckit.implement
   ```

   **Via Manual Execution**:
   ```bash
   git checkout 001-central-hub
   pnpm install
   cd frontend && pnpm dev
   # Mark tasks complete in tasks.md as you go
   ```

---

## Command Reference

```bash
# View specification
cat specs/001-central-hub/spec.md

# View implementation plan
cat specs/001-central-hub/plan.md

# View 108 tasks
cat specs/001-central-hub/tasks.md

# Install dependencies
pnpm install

# Start frontend dev server
cd frontend && pnpm dev

# Run linting
pnpm lint

# Run tests
pnpm test

# Docker stack (Phase 2+)
docker-compose up -d
docker-compose logs -f postgres

# View constitution (7 principles)
cat .specify/memory/constitution.md

# List SpecKit workflows
ls -la .windsurf/workflows/speckit.*.md
```

---

## Glossary

| Term | Meaning |
|------|---------|
| **Specification** | Business requirements (spec.md) |
| **Plan** | Architecture & design (plan.md) |
| **Tasks** | Actionable work items (tasks.md) |
| **User Story** | Feature from user perspective (US1-US4) |
| **RLS** | Row-Level Security (data isolation) |
| **Edge Function** | Serverless function (Deno) |
| **Realtime** | WebSocket updates (Supabase) |
| **ICS** | iCalendar format (.ics files) |
| **RRULE** | Recurrence rule (RFC 5545) |
| **Outbox** | Notification delivery pattern |
| **ADR** | Architectural Decision Record |

---

## FAQ

**Q: Can I start with just one user story?**
A: Yes! User stories are independently testable. You can implement US1 (hub) first, then US2, US3, etc.

**Q: How do I handle conflicts in a team?**
A: Assign phases by user story (Developer A = US1, Dev B = US2) or by layer (Dev A = Backend, Dev B = Frontend).

**Q: What if I need to change the specification?**
A: Run `/speckit.clarify` or `/speckit.specify` to update spec.md, then `/speckit.plan` to update the plan. Tasks will need updating.

**Q: How do I know when a phase is complete?**
A: All tasks in that phase marked `[x]`, tests passing, and code reviewed.

**Q: What's the difference between SpecKit workflows?**
A: `/speckit.specify` = write spec, `/speckit.plan` = design architecture, `/speckit.tasks` = break into tasks, `/speckit.implement` = execute tasks.

---

## Getting Help

**Specification Questions**: Review `specs/001-central-hub/spec.md` and `.specify/memory/constitution.md`

**Architecture Questions**: Review `specs/001-central-hub/plan.md` and `docs/adr/`

**Task Questions**: Review `specs/001-central-hub/tasks.md` and file paths in each task

**SpecKit Questions**: Review `.specify/README.md` and workflow files in `.windsurf/workflows/`

**Project Context**: Review `CLAUDE.md` (guidance for AI assistants)

---

## Success Looks Like

When the MVP is complete, you'll have:

✅ **Daily Hub**: Single page aggregating today's tasks/events across domains
✅ **Domains**: Work/Home/Play organization with privacy controls
✅ **Tasks**: Full CRUD with recurrence, dependencies, attachments
✅ **Calendar**: Multi-domain overlay with ICS export
✅ **Reminders**: Email + in-app in user's local timezone
✅ **Collaboration**: Comments with @mentions, presence, dashboards
✅ **Audit**: Privileged actions logged
✅ **Tests**: >80% coverage, all suites passing
✅ **Security**: RLS isolation verified, threat models documented
✅ **Deployment**: Docker Compose (dev), k3s (prod HA)

---

## Ready to Begin?

### Immediately:

1. Read `CLAUDE.md` (this is your guide)
2. Read `specs/001-central-hub/spec.md` (understand user value)
3. Read `IMPLEMENTATION_GUIDE.md` (understand execution)

### Then:

```bash
git checkout 001-central-hub
pnpm install
/speckit.implement
# OR
cd frontend && pnpm dev
```

---

**Command Center MVP is ready! Let's build it! 🚀**

**Questions?** Review the documents above or check the SpecKit workflows in `.windsurf/workflows/`

**Version**: 1.0
**Date**: 2025-10-28
**Status**: Specification Complete, Implementation Ready
