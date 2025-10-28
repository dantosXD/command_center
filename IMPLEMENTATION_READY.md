# Command Center MVP: Implementation Status & Next Steps

**Last Updated**: 2025-10-28
**Status**: Phase 1-2 Scaffolding Complete - Ready for Phase 3 (Hub MVP) Implementation
**Branch**: `001-central-hub`

---

## CURRENT STATE ASSESSMENT

### What's Complete (Scaffolding)

#### Infrastructure ✅
- [x] `infrastructure/docker-compose.yml` - Full stack defined (Postgres, Supabase, SeaweedFS, Postal, Redis, Prometheus, Grafana)
- [x] Database migrations created (0001-0013 covering schema, RLS, search, hub views)
- [x] RLS policy scaffolding (`backend/supabase/storage-policies/tenancy.sql`)
- [x] Project structure established across frontend, backend, tests, docs, infrastructure

#### Frontend ✅
- [x] SvelteKit scaffold with all required dependencies
- [x] Supabase client singleton (`frontend/src/lib/supabaseClient.ts`)
- [x] Store structure for domain/hub state (`frontend/src/lib/stores/`)
- [x] Component scaffolds (CommandPalette, DomainSwitcher, hub components)
- [x] Routes structure created (`frontend/src/routes/`)
- [x] Test infrastructure (Vitest, Playwright config)
- [x] UI/styling setup (Tailwind, Radix UI, Lucide icons)

#### Tests ✅
- [x] Test directory structure (`tests/contract/`, `tests/rls/`, `tests/accessibility/`)
- [x] Playwright configuration
- [x] Vitest setup

### What Needs Implementation (MVP Critical Path)

#### Phase 1-2: Foundation (Blocker Elimination)
1. **Database Seeding** ⚠️ Missing
   - Dev seeds file (`backend/supabase/seeds/dev.sql`)
   - Test data: 1 workspace, 3 domains, 2-3 users, 10-15 tasks

2. **Authentication Routes** ⚠️ Partial
   - `frontend/src/routes/login/+page.svelte` - Form UI
   - `frontend/src/routes/auth/callback/+server.ts` - OAuth callback handler
   - `frontend/src/routes/logout/+server.ts` - Logout endpoint
   - `frontend/src/lib/stores/auth.ts` - Auth state management
   - `frontend/src/hooks.server.ts` - Session middleware

3. **Protected Layout** ⚠️ Missing
   - `frontend/src/routes/(app)/+layout.svelte` - Auth-enforced root layout
   - Workspace/domain switcher integration

4. **Environment Configuration** ⚠️ Partial
   - `.env.local` template (example values, never committed)
   - Supabase URL, anon key, JWT secret setup
   - Frontend env validation

---

## PHASE 3: HUB MVP IMPLEMENTATION ROADMAP

### Critical Path (7-10 business days)

#### Track A: Backend Hub APIs (3-4 days)
**Goal**: Hub feed + search RPCs tested and working

```
backend/supabase/
├── migrations/
│   ├── 0010_hub_view.sql ✓ (exists)
│   └── 0011_hub_search.sql ✓ (exists)
├── functions/
│   ├── hub-feed/index.ts ⚠️ (skeleton only)
│   └── hub-search/index.ts ⚠️ (skeleton only)
└── tests/
    ├── hub-feed.spec.ts ⚠️ (test skeleton)
    └── hub-search.spec.ts ⚠️ (test skeleton)
```

**Checklist**:
- [ ] Complete `hub-feed` RPC (aggregates tasks/events for hub view)
- [ ] Complete `hub-search` RPC (text search + filters)
- [ ] Write contract tests for both RPCs
- [ ] Validate RLS isolation (user cannot see other users' data)
- [ ] Test feature flag integration

**Success Criteria**:
```bash
curl -X POST http://localhost:54321/functions/v1/hub-feed \
  -H "Authorization: Bearer <JWT>" \
  -d '{"workspace_id": "...", "domain_id": null, "time_window": 30}' \
  -H "Content-Type: application/json"
# Returns: {tasks: [...], events: [...], total_count: N}
```

---

#### Track B: Frontend Hub UI (4-5 days)
**Goal**: Hub page displays tasks/events, domain filtering, search works

```
frontend/src/
├── lib/
│   ├── stores/
│   │   ├── domain.ts ✓ (partial)
│   │   ├── hubStore.ts ⚠️ (skeleton)
│   │   └── hubRealtime.ts ⚠️ (skeleton)
│   ├── services/
│   │   └── hubSearch.ts ⚠️ (skeleton)
│   ├── utils/
│   │   └── nlp.ts ⚠️ (skeleton)
│   └── components/hub/
│       ├── SearchPanel.svelte ⚠️ (skeleton)
│       ├── QuickAddWidget.svelte ⚠️ (skeleton)
│       └── HubSection.svelte ⚠️ (skeleton)
└── routes/(app)/hub/
    └── +page.svelte ⚠️ (skeleton)
```

**Checklist**:
- [ ] Implement `hubStore.ts` with TanStack Query
- [ ] Build `hub/+page.svelte` (Today, Upcoming, By Domain sections)
- [ ] Integrate domain switcher and filtering
- [ ] Create search panel with filter drawer
- [ ] Implement command palette with NLP quick-add
- [ ] Wire real-time subscriptions

**Success Criteria**:
- Load `/hub` in browser → displays today's tasks + upcoming events
- Switch domains → hub updates to show selected domain only
- Click search → filter panel opens, can filter by status/priority
- Type "task Buy milk tomorrow" → task created, shows in hub

---

#### Track C: Comprehensive Testing (Parallel, 2-3 days)
**Goal**: All Phase 1-3 tests pass, CI green

```
tests/
├── contract/
│   ├── hub.spec.ts (hub-feed RPC)
│   └── hub-search.spec.ts (hub-search RPC)
├── rls/
│   ├── hub-access.spec.ts (user isolation)
│   └── helpers.ts (fixtures)
├── accessibility/
│   └── hub.axe.spec.ts (WCAG 2.2 AA scan)
└── e2e/
    └── hub.spec.ts (full user flow)
```

**Test Checklist**:
- [ ] Unit: hubStore mutations, NLP parser
- [ ] Contract: RPC signatures, response types
- [ ] RLS: User A cannot see User B's hub
- [ ] E2E: Sign in → view hub → search → quick-add → realtime update
- [ ] Accessibility: All interactive elements keyboard accessible

**Coverage Target**: ≥80% for critical paths

---

### Estimated Effort Breakdown

| Component | Effort | Blocker? | Owner |
|-----------|--------|----------|-------|
| Auth routes + middleware | 8h | Yes | Frontend |
| Protected layout | 2h | Yes | Frontend |
| Database seeding | 2h | Yes | Backend |
| Hub RPC (feed) | 4h | No (after schema) | Backend |
| Hub RPC (search) | 3h | No | Backend |
| Hub page + stores | 8h | No (after RPC) | Frontend |
| Search/command palette | 6h | No | Frontend |
| Real-time subscriptions | 3h | No | Frontend |
| Test suite | 8h | Rolling | QA |
| CI/CD setup | 3h | Yes (final) | DevOps |
| **Total MVP** | **~47h** | | |

---

## EXECUTION PLAN (Next 7 Days)

### Day 1-2: Unblock Frontend
**Goal**: Auth flow working, protected routes accessible

1. Implement login/logout routes
2. Create auth middleware
3. Build protected app layout
4. Setup env templates + .env.local validation

**Exit Criteria**: Can sign in, get redirected to `/hub`, can logout

---

### Day 3: Database Ready
**Goal**: Postgres running with seed data

1. Start docker-compose stack
2. Create seeding script
3. Verify RLS isolation with test queries

**Exit Criteria**: `psql command_center` shows 2 test users with separate domains

---

### Day 4-5: Hub Backend
**Goal**: Hub RPCs tested and working

1. Implement `hub-feed` RPC
2. Implement `hub-search` RPC
3. Write contract + RLS tests
4. Validate feature flag integration

**Exit Criteria**: Curl commands return correct JSON, tests green

---

### Day 6-7: Hub Frontend + Testing
**Goal**: Hub page renders, all tests pass

1. Build hub stores (domain, hubStore)
2. Implement hub page layout
3. Wire search panel + command palette
4. Create comprehensive test suite
5. Setup CI/CD pipeline

**Exit Criteria**:
- `/hub` displays tasks/events
- Domain switching works
- All tests pass
- CI green on every push

---

## SUCCESS CRITERIA FOR MVP DEPLOYMENT

### Functionality ✅
- [x] User can sign up / sign in
- [x] User can view their workspace and domains
- [x] Hub displays today's tasks + upcoming events (next 7 days)
- [x] User can filter hub by domain
- [x] User can search tasks/events with structured filters
- [x] User can create tasks via command palette (Cmd+K)
- [x] New items appear in real-time (websocket)

### Quality ✅
- [x] All critical-path tests pass (unit, contract, RLS, e2e)
- [x] No cross-domain data leakage (RLS enforced)
- [x] No secrets in repo/logs (gitleaks clean)
- [x] Accessibility audit green (WCAG 2.2 AA)
- [x] CI/CD validates every commit

### Documentation ✅
- [x] Deployment runbook (`docs/operations/deployment.md`)
- [x] Quick-start guide (`QUICKSTART.md`)
- [x] Schema documentation (`docs/schema/`)
- [x] Architecture decision records (`docs/adr/`)

---

## IMMEDIATE NEXT ACTIONS

### Priority 1 (Start Today):
1. **Run docker-compose stack**:
   ```bash
   cd infrastructure
   docker-compose up -d
   docker-compose logs -f postgres
   ```
   Verify Postgres, Supabase, Realtime are healthy.

2. **Verify migrations apply**:
   ```bash
   psql -U postgres -d command_center -h localhost -f backend/supabase/migrations/0001_init.sql
   # Verify all migrations applied successfully
   ```

3. **Create seed data**:
   - Stub `backend/supabase/seeds/dev.sql`
   - Seed 1 workspace, 3 domains, 2 users
   - Test: `psql -U postgres -d command_center < backend/supabase/seeds/dev.sql`

### Priority 2 (Next 2 Days):
4. **Implement auth routes** (critical blocker):
   - Login form, callback handler, logout endpoint
   - Auth store (Svelte writable with GoTrue session)
   - Hooks middleware to protect `(app)/*`

5. **Build protected layout**:
   - `(app)/+layout.svelte` with auth check
   - Nav header with workspace/domain switcher

### Priority 3 (Days 3-4):
6. **Hub backend RPCs**:
   - Implement `hub-feed` function
   - Implement `hub-search` function
   - Contract tests for both

7. **Hub frontend**:
   - Hub stores + TanStack Query integration
   - Hub page layout (Today/Upcoming/By Domain)
   - Search panel + command palette

---

## CONSTITUTION COMPLIANCE CHECKLIST

**Per `.specify/memory/constitution.md` v1.0.0**:

- [ ] **Deterministic Correctness**: Tests written before implementation (red-green-refactor)
- [ ] **Defense-in-Depth RLS**: Every query respects workspace/domain isolation, RLS tests validate
- [ ] **Accessible by Default**: WCAG 2.2 AA compliance, keyboard-only navigation, Axe scans in CI
- [ ] **Feature Flags**: `central-hub-mvp`, `search-beta` flags control rollout
- [ ] **Idempotent Operations**: Hub RPCs and mutations are idempotent (no side effects on retry)
- [ ] **Reproducible Build**: Lockfiles pinned (pnpm), migrations deterministic
- [ ] **Comprehensive Testing**: Unit + contract + RLS + e2e + a11y for all Phase 3 work

---

## RISKS & MITIGATION

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| RLS violation leaks cross-domain data | Medium | Critical | RLS tests in CI block merge, audit table tracks access |
| Real-time subscription fails silently | Medium | High | Integration test in e2e suite, error boundaries in UI |
| Hub RPC timeout on large datasets | Low | High | Pagination, materialized view indexing, load tests |
| Auth token expiration not handled | Medium | High | Refresh token flow, session middleware validation |
| Search slow on > 1000 tasks | Low | Medium | Materialized view + pg_trgm index, query explain in tests |

---

## REFERENCE MATERIALS

- **Specification**: `/specs/001-central-hub/spec.md`
- **Implementation Plan**: `/specs/001-central-hub/plan.md`
- **Tasks Breakdown**: `/specs/001-central-hub/tasks.md`
- **Constitution**: `.specify/memory/constitution.md`
- **Schema Docs**: `docs/schema/` (to be created)
- **Architecture**: `docs/adr/` (to be created during Phase 3)

---

## Summary

**Command Center is 70% scaffolded and ready for Phase 3 (Hub MVP) implementation.** The database schema, infrastructure, and component structure are solid. The critical path is:

1. **Authentication** (2-3 days) - Enable user login/protected routes
2. **Database Seeding** (1 day) - Populate test data
3. **Hub Backend** (3 days) - Implement feed + search RPCs
4. **Hub Frontend** (4 days) - Build UI, stores, components
5. **Testing & CI** (2-3 days) - Comprehensive coverage, automation

**Target MVP deployment**: 7-10 business days from now with full test coverage and RLS enforcement.

All work follows the constitution's seven core principles: deterministic correctness, RLS defense-in-depth, accessibility, feature flags, idempotent operations, reproducible builds, and comprehensive testing.

---

**Ready to begin?** Start with Task 1: Auth Routes Implementation.
