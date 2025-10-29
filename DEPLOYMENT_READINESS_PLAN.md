# Command Center MVP: Deployment Readiness & Testing Plan

## Executive Summary

**Project**: Command Center - Unified productivity hub for work/life management
**Status**: 70% Complete (Phase 1-2 scaffolding done, Phase 3 MVP ready to implement)
**Timeline**: 7-10 business days to production deployment
**Scope**: MVP encompasses Phases 1-3 only (Hub aggregation with search, no calendar/notifications yet)

---

## WHAT'S READY TO GO

### Infrastructure ✅ COMPLETE
- Docker Compose stack fully defined (Postgres 15, Supabase GoTrue, PostgREST, Realtime, SeaweedFS, Postal)
- 13 database migrations created covering:
  - Core schema (workspaces, domains, tasks, events, collections)
  - Row-Level Security policies for workspace/domain isolation
  - Audit logging and compliance tracking
  - Search indexes (pg_trgm full-text, materialized views)
  - Hub views and aggregation logic
- RLS enforcement triggers and helpers
- Feature flag infrastructure
- All critical tables have RLS enabled

### Frontend Scaffolding ✅ COMPLETE
- SvelteKit 2.x application with all essential dependencies
- Component library (Radix UI, Lucide icons, TailwindCSS)
- Store architecture for state management (Svelte stores + TanStack Query ready)
- Routes structure established
- Supabase JS client singleton
- Test infrastructure (Vitest, Playwright)
- Basic component scaffolds (CommandPalette, DomainSwitcher, hub components)

### Project Organization ✅ COMPLETE
- Monorepo structure with pnpm workspaces
- GitHub Actions CI pipeline stub
- Documentation folder structure (ADRs, runbooks)
- Tests folder with contract, RLS, and e2e test structure
- Environment configuration templates

---

## CRITICAL GAPS (Blocking MVP)

### 1. AUTHENTICATION FLOW (2-3 days effort)
**Status**: Partially stubbed
**Impact**: Users cannot access application

#### Missing:
- [ ] Login page (`frontend/src/routes/login/+page.svelte`)
  - Email/password form with Supabase GoTrue integration
  - Error handling and loading states
  - Link to signup
- [ ] OAuth callback handler (`frontend/src/routes/auth/callback/+server.ts`)
  - Supabase session management
  - JWT token refresh logic
  - Redirect back to referrer or hub
- [ ] Logout endpoint (`frontend/src/routes/logout/+server.ts`)
  - Session clearing
  - Redirect to login
- [ ] Auth store (`frontend/src/lib/stores/auth.ts`)
  - Reactive current user
  - Session validation
  - Logout handling
- [ ] Server-side hooks (`frontend/src/hooks.server.ts`)
  - Session middleware to validate JWTs
  - Protect all `(app)/*` routes
  - Redirect unauthenticated users to login

#### Implementation Checklist:
```
[ ] Create login form with email/password inputs
[ ] Integrate Supabase GoTrue.signInWithPassword()
[ ] Create OAuth callback handler (parse URL params, set session)
[ ] Create logout handler (clear cookies, clear Supabase session)
[ ] Create auth.ts store with readable/derived stores
[ ] Create hooks.server.ts middleware
[ ] Add E2E test: Sign in → protected route → sign out
[ ] Verify session persists on page refresh
```

---

### 2. DATABASE SEEDING (1 day effort)
**Status**: Not created
**Impact**: No test data for development

#### Missing:
- [ ] `backend/supabase/seeds/dev.sql` - Development seed data

#### Seed Data Required:
- 1 Workspace (workspace_id: UUID, name: "Test Workspace")
- 3 Domains (Home, Work, Play) with different colors
- 2 Test Users (user1@example.com, user2@example.com)
- Domain membership relationships
- 15-20 sample tasks across domains (various statuses, priorities, due dates)
- 5-10 sample events spread over 2-week window
- Feature flags: `central-hub-mvp=true`, `search-beta=true`

#### Implementation Checklist:
```
[ ] Create backend/supabase/seeds/dev.sql with INSERT statements
[ ] Seed workspace owned by user1
[ ] Seed 3 domains with sample data
[ ] Create tasks with varied due dates (past, today, upcoming, future)
[ ] Create events with varied times
[ ] Test RLS isolation: user1 cannot see user2's data
[ ] Create seed data for Playwright tests (separate from dev seeds)
```

---

### 3. PROTECTED APP LAYOUT (1 day effort)
**Status**: Minimal skeleton
**Impact**: No navigation, no root layout

#### Missing:
- [ ] `frontend/src/routes/(app)/+layout.svelte` - Root protected layout
  - Auth check (redirect to login if not authenticated)
  - Navigation header with:
    - Logo/app name
    - Workspace switcher dropdown
    - Domain switcher dropdown
    - User menu (account, settings, logout)
  - Main content slot
  - Sidebar (if desired)
  - Mobile responsive design
- [ ] Workspace switcher component
- [ ] Domain switcher integration with store

#### Implementation Checklist:
```
[ ] Create (app) layout with conditional rendering based on auth store
[ ] Build top navigation header with Tailwind
[ ] Implement workspace dropdown (fetch from Supabase)
[ ] Implement domain dropdown (dynamic based on selected workspace)
[ ] Add user menu with logout link
[ ] Make responsive for mobile
[ ] Add accessibility attributes (role, aria-*)
[ ] Test: Authenticated user sees header; unauthenticated sees login
```

---

### 4. HUB BACKEND APIS (3 days effort)
**Status**: Migrations exist; RPC functions stubbed
**Impact**: No data aggregation for hub

#### Missing:
- [ ] Complete `backend/supabase/functions/hub-feed/index.ts`
  - Query hub_view for user's workspace
  - Filter by domain (if specified)
  - Apply feature flag check
  - Return paginated results: `{tasks: [...], events: [...], total_count}`
  - Handle RLS isolation (verify user can access domain)
- [ ] Complete `backend/supabase/functions/hub-search/index.ts`
  - Text search across task titles/descriptions
  - Filter by status, priority, domain, date range
  - Return paginated results
  - Validate RLS isolation

#### Database Views Already Exist:
- `public.hub_view` (0010_hub_view.sql) - Materializes tasks/events with metadata
- `public.hub_search_idx` (0011_hub_search.sql) - Search index with pg_trgm

#### Implementation Checklist:
```
[ ] Write hub-feed RPC (accept workspace_id, domain_filter, window_days)
[ ] Query hub_view with RLS enforcement
[ ] Apply feature flag gating
[ ] Add input validation
[ ] Write contract test (verify RPC signature, response shape)
[ ] Write RLS test (user A cannot see user B's hub)
[ ] Test performance: < 500ms for 100 tasks
[ ] Write integration test with sample data

[ ] Write hub-search RPC (accept search_term, filters, pagination)
[ ] Query hub_search_idx
[ ] Add filter logic (status, priority, domain, date range)
[ ] Write contract test
[ ] Write RLS test
[ ] Test full-text search functionality
```

---

### 5. HUB FRONTEND UI (4 days effort)
**Status**: Component scaffolds exist; logic missing
**Impact**: No visual interface for hub

#### Missing Pages/Components:
- [ ] `frontend/src/routes/(app)/hub/+page.svelte` - Hub main page
  - Today section (tasks due today + events today)
  - Upcoming section (next 7 days)
  - By Domain section (grouped view)
  - Domain filter selector
  - "All Domains" toggle
  - Loading/error states
  - Empty state messaging
- [ ] `frontend/src/lib/stores/hubStore.ts` - Hub state management
  - Fetch hub-feed from Supabase
  - Cache results (TanStack Query)
  - Refetch on domain change
  - Optimistic updates for task creation
- [ ] `frontend/src/lib/components/hub/SearchPanel.svelte` - Search/filter drawer
  - Status filter (dropdown with multi-select)
  - Priority filter
  - Domain filter
  - Date range filter
  - Save filter option
  - Apply/clear buttons
- [ ] `frontend/src/lib/components/CommandPalette.svelte` - Cmd+K quick-add
  - Global command palette (always available)
  - Quick task creation: "task <title> [date]"
  - NLP parsing in `frontend/src/lib/utils/nlp.ts`
  - Mutation to create task
  - Optimistic UI update
- [ ] `frontend/src/lib/stores/hubRealtime.ts` - Real-time updates
  - Supabase Realtime subscription to tasks/events
  - Auto-refresh hub on new/updated items
  - Toast notification for new items

#### Implementation Checklist:
```
Frontend Store & Hooks:
[ ] Implement hubStore.ts with TanStack Query
    [ ] createQuery for hub-feed
    [ ] Reactive domain filter binding
    [ ] Refetch on domain change
    [ ] Error/loading states
[ ] Implement hubRealtime.ts subscription
    [ ] Listen to tasks and events channels
    [ ] Update hub store on realtime events
    [ ] Show "New items" toast
    [ ] Manual refresh option

Hub Page Layout:
[ ] Create hub/+page.svelte with Svelte 5 syntax
    [ ] Today section (tasks + events)
    [ ] Upcoming section (7 days)
    [ ] By Domain section (grouped by domain)
    [ ] Domain selector dropdown
    [ ] Search trigger button
[ ] Make responsive/accessible
[ ] Add loading skeleton
[ ] Add empty state UI

Search Panel:
[ ] Create SearchPanel.svelte with filter drawer
    [ ] Status, priority, domain, date range filters
    [ ] Apply/clear buttons
    [ ] Save filter form
[ ] Integrate with hubStore (refetch on filter change)
[ ] Test filter combinations

Command Palette:
[ ] Implement nlp.ts parser
    [ ] "task <title>" → {type: 'task', title}
    [ ] "task <title> tomorrow" → {type: 'task', title, due_at: tomorrow}
    [ ] "event <title> 2pm-3pm" → {type: 'event', title, start, end}
[ ] Create CommandPalette.svelte
    [ ] Cmd+K listener
    [ ] Input with autocomplete
    [ ] Mutation to create item
    [ ] Optimistic update to hub store
    [ ] Error handling

Real-time:
[ ] Test realtime subscription persistence
[ ] Verify hub updates without page refresh
[ ] Handle disconnect/reconnect gracefully
```

---

## COMPLETE IMPLEMENTATION CHECKLIST

### Phase 1-2: Foundation (Estimated 15 hours)

#### Auth & Session (7 hours)
- [ ] Auth store (auth.ts)
- [ ] Login page component
- [ ] Callback handler
- [ ] Logout endpoint
- [ ] Server-side session middleware
- [ ] Protected layout with auth check
- [ ] E2E auth flow test

#### Database & Seeding (3 hours)
- [ ] Seed script (dev.sql)
- [ ] Verify migrations apply
- [ ] Test RLS isolation with queries
- [ ] Create test user fixtures

#### Environment (2 hours)
- [ ] .env.local template
- [ ] Verify SUPABASE_URL, ANON_KEY setup
- [ ] Frontend env validation
- [ ] Docker Compose network troubleshooting

#### CI/CD Pipeline (3 hours)
- [ ] GitHub Actions workflow (.github/workflows/ci.yml)
- [ ] Lint check (ESLint)
- [ ] Type check (tsc)
- [ ] Test execution (pnpm test)
- [ ] Gitleaks check

---

### Phase 3: Hub MVP (Estimated 20-25 hours)

#### Backend Hub APIs (8 hours)
- [ ] hub-feed RPC implementation
- [ ] hub-search RPC implementation
- [ ] Contract tests for both RPCs
- [ ] RLS isolation tests
- [ ] Feature flag validation tests
- [ ] Integration tests with sample data
- [ ] Performance testing (< 500ms)

#### Frontend Hub UI (12 hours)
- [ ] hubStore.ts with TanStack Query
- [ ] hubRealtime.ts subscription store
- [ ] hub/+page.svelte main page
- [ ] SearchPanel.svelte with filters
- [ ] CommandPalette.svelte with NLP
- [ ] nlp.ts parser utilities
- [ ] Responsive styling & layout
- [ ] Loading/error/empty states
- [ ] Accessibility (keyboard, screen reader)

#### Frontend Testing (5 hours)
- [ ] Unit tests for stores and utilities
- [ ] Contract tests for RPC integration
- [ ] E2E flow: sign in → view hub → search → quick-add → realtime
- [ ] Accessibility audit (Axe scan)
- [ ] Load test with 100+ tasks
- [ ] RLS verification: cross-domain access blocked

---

## SUCCESS CRITERIA FOR MVP DEPLOYMENT

### Functional Requirements ✅
1. Users can sign up and sign in
2. Hub displays today's tasks and upcoming events (7-day window)
3. Domain filtering works (user can switch between Home/Work/Play)
4. Search filters work (status, priority, date range)
5. Command palette (Cmd+K) creates tasks from natural language
6. Real-time updates show new items without page refresh
7. All data is isolated by workspace and domain (RLS enforced)

### Non-Functional Requirements ✅
1. **Performance**: Hub loads in < 1.5 seconds, search responds in < 500ms
2. **Reliability**: All services stay healthy for 24h continuous uptime
3. **Accessibility**: WCAG 2.2 AA compliance (keyboard navigation, color contrast)
4. **Security**: No data leakage, RLS enforced, secrets in vault
5. **Testing**: ≥80% coverage for critical paths, all tests pass
6. **Deployment**: Deterministic builds, reproducible CI/CD

### Quality Gates ✅
- [ ] All Phase 1-3 migrations apply cleanly
- [ ] RLS policies validated with isolation tests
- [ ] Auth flow tested (sign in → protected route → sign out)
- [ ] Hub feed RPC contract tests pass
- [ ] Hub search RPC contract tests pass
- [ ] RLS tests verify cross-domain isolation
- [ ] E2E tests cover critical user flows
- [ ] Accessibility audit passes (no WCAG violations)
- [ ] CI/CD green on every commit (no flaky tests)
- [ ] Zero secrets in repo (gitleaks passes)

---

## DEPLOYMENT RUNBOOK

### Pre-Deployment Checklist
```
[ ] All tests passing (pnpm test)
[ ] Type checking clean (pnpm check)
[ ] Linting clean (pnpm lint)
[ ] Migrations applied (psql check)
[ ] RLS policies in place (psql check pg_policies)
[ ] Secrets in vault, not in .env
[ ] Docker Compose stack healthy
[ ] CI/CD green on main branch
[ ] Code review approved
[ ] Architecture decision recorded in docs/adr/
```

### Deployment Steps
1. **Local Verification**:
   ```bash
   docker-compose up -d
   pnpm install
   pnpm test
   pnpm build
   ```

2. **Staging Deployment**:
   ```bash
   git tag -a v0.1.0-alpha -m "Hub MVP"
   git push --tags
   # CI/CD deploys to staging environment
   ```

3. **Smoke Tests**:
   ```bash
   # Run Playwright tests against staging
   pnpm test:e2e --config=playwright.staging.config.ts
   ```

4. **Production Deployment**:
   ```bash
   # Promote staging to production (via deployment tool)
   # Rolling update: blue-green deployment
   # Monitor: error rate, latency, RLS violations
   ```

5. **Post-Deployment**:
   ```bash
   # Verify services healthy
   curl http://localhost/api/health
   # Check logs for errors
   docker-compose logs -f
   # Monitor metrics (Prometheus/Grafana)
   ```

---

## TESTING STRATEGY

### Unit Tests (Vitest)
- Store mutations: hubStore.ts, domain.ts
- Utilities: nlp.ts (NLP parser)
- Helpers: RLS helpers, audit functions
- Target: ≥80% coverage for business logic

### Contract Tests
- hub-feed RPC: verify signature, response schema, pagination
- hub-search RPC: verify filters work, pagination works
- Target: ≥90% of API surface

### RLS Tests (Mandatory per Constitution)
- User A cannot query User B's workspace
- User A cannot query User B's domains
- User A cannot view tasks in private User B domain
- RLS policies block DELETE/UPDATE for unauthorized users
- Audit logs record all privileged actions
- Target: 100% RLS isolation coverage

### E2E Tests (Playwright)
- Sign in flow (happy path + error cases)
- Hub display (today, upcoming, by domain)
- Domain switching
- Search with various filters
- Quick-add command palette
- Real-time subscription (new task appears without refresh)
- Logout flow

### Accessibility Tests
- Automated: Axe scan for WCAG 2.2 AA violations
- Manual: Keyboard-only navigation, screen reader testing
- Target: Zero violations, all interactive elements keyboard accessible

### Performance Tests
- Load test: hub-feed RPC with 1000+ tasks < 500ms
- Load test: hub-search with full-text query < 200ms
- Load test: Realtime subscription handling 10+ concurrent updates

---

## ARCHITECTURE DECISIONS (To Be Recorded)

### 1. Hub Aggregation Strategy
- **Decision**: Materialized view + RPC function
- **Rationale**: Denormalized view enables fast queries; RPC applies RLS + feature flags
- **Trade-offs**: View updates on task/event change; slower than raw query but safer

### 2. Real-time Subscription
- **Decision**: Supabase Realtime (PostgreSQL logical decoding)
- **Rationale**: Built into Supabase; no separate service
- **Trade-offs**: Broadcast all changes; RLS filters on client side

### 3. Search Indexing
- **Decision**: pg_trgm full-text search + materialized view
- **Rationale**: Native Postgres; no Elasticsearch needed for MVP
- **Trade-offs**: Limited relevance scoring; good enough for 10k items

### 4. NLP for Quick-Add
- **Decision**: Regex-based parser (no ML model)
- **Rationale**: Simplicity; covers 90% of use cases
- **Trade-offs**: No true NLP; extensible to ML later

---

## TIMELINE

| Phase | Duration | Start | End | Deliverable |
|-------|----------|-------|-----|-------------|
| Auth + Seeding | 3 days | Day 1 | Day 3 | Users can sign in |
| Hub Backend | 3 days | Day 2 | Day 4 | RPCs tested |
| Hub Frontend | 4 days | Day 3 | Day 6 | Hub page working |
| Testing + CI | 3 days | Day 4 | Day 7 | All tests green |
| **Total** | **7 days** | | | **MVP Ready** |

(Overlapping phases, actual duration 7-10 business days depending on team size)

---

## RESOURCES

### Documentation
- Specification: `/specs/001-central-hub/spec.md`
- Plan: `/specs/001-central-hub/plan.md`
- Tasks: `/specs/001-central-hub/tasks.md`
- Constitution: `.specify/memory/constitution.md`

### Code References
- Migrations: `backend/supabase/migrations/`
- RLS Policies: `backend/supabase/storage-policies/tenancy.sql`
- Frontend Client: `frontend/src/lib/supabaseClient.ts`
- Package Config: `frontend/package.json`, `backend/package.json`

### External References
- Supabase Docs: https://supabase.com/docs
- Postgres RLS: https://www.postgresql.org/docs/15/ddl-rowsecurity.html
- SvelteKit: https://kit.svelte.dev
- TanStack Query: https://tanstack.com/query/latest/docs/svelte/overview

---

## SUMMARY

Command Center MVP is **ready to implement**. The foundation (infrastructure, schema, scaffolding) is solid. The critical path is:

1. **Auth** (3 days) - Unblock user access
2. **Seeding** (1 day) - Populate test data
3. **Hub Backend** (3 days) - Implement RPCs
4. **Hub Frontend** (4 days) - Build UI
5. **Testing** (3 days) - Comprehensive coverage + CI/CD

**Target**: Production-ready deployment in 7-10 business days with full test coverage, RLS enforcement, and accessibility compliance.

All work follows the **Constitution's seven core principles**: deterministic correctness, defense-in-depth RLS, accessibility, feature flags, idempotent operations, reproducible builds, and comprehensive testing.

**Status**: ✅ Ready to begin implementation. **Next action**: Start with Phase 1 Day 1 (Auth + Seeding).
