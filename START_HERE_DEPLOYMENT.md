# Command Center MVP: START HERE

**Status**: Ready for implementation
**Duration**: 7-10 business days
**Goal**: Production-ready hub aggregation with comprehensive testing

---

## TL;DR

Your Command Center project is **70% scaffolded and ready to implement the MVP**. All infrastructure, database schema, and component structure are in place. The critical path is:

1. **Auth + Seeding** (3 days) - Users can sign in, test data ready
2. **Hub Backend** (3 days) - RPCs for feed and search
3. **Hub Frontend** (4 days) - UI components and real-time
4. **Testing + CI/CD** (3 days) - Full coverage, automation
5. **Polish** (2 days) - Documentation, final validation

**Result**: Production-ready MVP with RLS enforcement, accessibility compliance, and comprehensive testing.

---

## WHAT'S ALREADY DONE

### Infrastructure ✅
- Docker Compose with Postgres, Supabase, SeaweedFS, Postal, Redis, Prometheus, Grafana
- All 13 database migrations created
- RLS policies and audit logging configured
- Search indexes and materialized views for hub aggregation

### Frontend ✅
- SvelteKit application fully scaffolded
- All dependencies installed (Supabase, TanStack Query, Tailwind, Radix UI)
- Component structure established
- Supabase client singleton created
- Store architecture ready

### Project Organization ✅
- Monorepo with pnpm workspaces
- Test directories created (contract, RLS, e2e, a11y)
- GitHub Actions CI stub
- Documentation folder structure (ADRs, operations runbooks)

---

## WHAT NEEDS IMPLEMENTATION

### Critical Blockers (Must Do First)
1. **Authentication** - Login/logout/session management
2. **Database Seeding** - Test data for development
3. **Hub Backend RPCs** - Aggregation and search APIs

### Secondary (Can Parallelize)
4. **Hub Frontend UI** - Page, stores, components
5. **Real-time Subscriptions** - WebSocket updates
6. **Command Palette** - Quick-add with NLP parser

### Quality Gates (Required for Deployment)
7. **Testing Suite** - Unit, contract, RLS, e2e, accessibility
8. **CI/CD Pipeline** - Automated validation on every commit
9. **Documentation** - Architecture decisions, deployment runbooks

---

## STEP-BY-STEP ROADMAP

### Phase 1: Days 1-2 (Auth + Database)
**Goal**: Users can sign in, test data exists

#### Day 1 Tasks
- [ ] Create login page (`frontend/src/routes/login/+page.svelte`)
- [ ] Create auth store (`frontend/src/lib/stores/auth.ts`)
- [ ] Create OAuth callback handler
- [ ] Create logout endpoint
- [ ] Create server-side hooks for session validation
- [ ] Create protected app layout with auth enforcement
- **Test**: `pnpm dev` → http://localhost:5173/login works

#### Day 2 Tasks
- [ ] Start Docker Compose: `docker-compose up -d`
- [ ] Create seed script (`backend/supabase/seeds/dev.sql`)
- [ ] Create test users via GoTrue API
- [ ] Verify RLS isolation with SQL queries
- [ ] Setup `.env.local` with Supabase credentials
- **Test**: `psql -h localhost -U postgres -d command_center` shows test data

---

### Phase 2: Days 3-4 (Hub Backend)
**Goal**: Hub RPCs working, tested, and isolated

#### Day 3 Tasks
- [ ] Implement `hub-feed` RPC (`backend/supabase/functions/hub-feed/index.ts`)
- [ ] Write contract tests for hub-feed
- [ ] Write RLS isolation tests
- [ ] Implement `hub-search` RPC (`backend/supabase/functions/hub-search/index.ts`)
- [ ] Write tests for hub-search
- **Test**: `curl -X POST http://localhost:54321/functions/v1/hub-feed ...` returns JSON

#### Day 4 Tasks
- [ ] Create hubStore.ts with TanStack Query
- [ ] Build hub/+page.svelte (Today, Upcoming, By Domain sections)
- [ ] Create SearchPanel component
- [ ] Integrate domain filtering
- [ ] Add loading/error states
- **Test**: `http://localhost:5173/hub` displays tasks and events

---

### Phase 3: Days 5-6 (Frontend + Testing)
**Goal**: Full hub experience, all tests green

#### Day 5 Tasks
- [ ] Implement CommandPalette.svelte with Cmd+K
- [ ] Create nlp.ts parser ("task Buy milk tomorrow" → task creation)
- [ ] Implement hubRealtime.ts for WebSocket subscriptions
- [ ] Add "New items" toast notifications
- [ ] Test everything together end-to-end
- **Test**: Type `task Test` in command palette, see it appear in hub

#### Day 6 Tasks
- [ ] Write unit tests (hubStore, nlp.ts, stores)
- [ ] Write E2E tests (sign in → view hub → search → quick-add → realtime)
- [ ] Write accessibility tests (Axe scan + keyboard navigation)
- [ ] Create GitHub Actions CI workflow
- [ ] Verify all tests pass locally
- **Test**: `pnpm test && pnpm test:e2e` - all green

---

### Phase 4: Days 7-10 (Polish & Deployment)
**Goal**: Production-ready MVP

#### Documentation
- [ ] Architecture decision record (docs/adr/hub-mvp.md)
- [ ] Deployment runbook (docs/operations/deployment.md)
- [ ] API contract documentation
- [ ] Quick-start guide for developers

#### Final Validation
- [ ] Full test suite passes
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] No secrets in repo (gitleaks clean)
- [ ] Accessibility audit passes
- [ ] Load test with 1000+ tasks < 500ms

#### Deployment
- [ ] Docker Compose stack runs cleanly
- [ ] Frontend builds without errors
- [ ] All migrations apply successfully
- [ ] CI/CD pipeline validated
- [ ] Ready for staging deployment

---

## KEY DECISION POINTS

### 1. Authentication Method
**Decision**: Supabase GoTrue (built-in, no additional service)
**Trade-off**: Limited customization vs. simplicity

### 2. Real-time Updates
**Decision**: Supabase Realtime (logical decoding, built-in)
**Trade-off**: Broadcasts all changes; RLS filtering on client side

### 3. Search Implementation
**Decision**: pg_trgm full-text search (native Postgres)
**Trade-off**: No relevance scoring vs. no Elasticsearch needed

### 4. Natural Language Parser
**Decision**: Regex-based (no ML model)
**Trade-off**: Limited accuracy vs. zero external dependencies

---

## RESOURCES & DOCUMENTATION

### Your Documentation
- **Status**: `IMPLEMENTATION_READY.md` - Current state + gaps
- **Plan**: `DEPLOYMENT_READINESS_PLAN.md` - Detailed roadmap + checklists
- **Quick Start**: `QUICK_START_IMPLEMENTATION.md` - Step-by-step with code examples

### Constitution (Non-Negotiable Principles)
- ✅ **Deterministic Correctness**: Tests before code (red-green-refactor)
- ✅ **Defense-in-Depth RLS**: Every query respects domain isolation
- ✅ **Accessible by Default**: WCAG 2.2 AA compliance
- ✅ **Feature Flags**: Incremental rollout capability
- ✅ **Idempotent Operations**: Safe to retry without side effects
- ✅ **Reproducible Builds**: Pinned dependencies, deterministic CI
- ✅ **Comprehensive Testing**: Unit + contract + RLS + e2e + a11y

### External References
- **Supabase**: https://supabase.com/docs
- **PostgreSQL RLS**: https://www.postgresql.org/docs/15/ddl-rowsecurity.html
- **SvelteKit**: https://kit.svelte.dev
- **TanStack Query**: https://tanstack.com/query/latest/docs/svelte/overview

---

## QUICK COMMAND REFERENCE

### Development
```bash
# Install dependencies
pnpm install

# Start frontend dev server
pnpm --filter frontend dev

# Start Docker Compose stack
cd infrastructure
docker-compose up -d

# Run tests
pnpm test                    # Unit tests
pnpm test:e2e              # E2E tests
pnpm test                  # All tests

# Formatting & linting
pnpm lint
pnpm format
```

### Database
```bash
# Connect to database
psql -U postgres -h localhost -d command_center

# Apply migrations
psql -U postgres -h localhost -d command_center -f backend/supabase/migrations/0001_init.sql

# Seed test data
psql -U postgres -h localhost -d command_center -f backend/supabase/seeds/dev.sql

# Check RLS policies
SELECT tablename, policyname FROM pg_policies;
```

### Verification
```bash
# Check all tests pass
pnpm test

# Type checking
pnpm check

# Linting
pnpm lint

# Build frontend
pnpm --filter frontend build

# Run E2E tests
pnpm test:e2e --headed   # With UI
```

---

## TROUBLESHOOTING

### "Cannot connect to Postgres"
```bash
# Verify Docker Compose is running
docker-compose ps

# Check logs
docker-compose logs postgres

# Restart if needed
docker-compose restart postgres
```

### "Supabase auth not working"
```bash
# Verify GoTrue service is healthy
curl http://localhost:9999/auth/v1/health

# Check environment variables
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY
```

### "RLS policy prevents query"
```bash
# Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

# View policies on table
SELECT * FROM pg_policies WHERE tablename = 'tasks';

# Test as specific user
RESET ROLE;
SET ROLE authenticated;
SET jwt.claims.sub = 'user-uuid';
SELECT * FROM tasks;  -- Should be blocked by RLS
```

### "Tests failing"
```bash
# Run with verbose output
pnpm test -- --reporter=verbose

# Run specific test file
pnpm test -- src/lib/stores/hubStore.spec.ts

# Debug in browser
pnpm test:e2e --headed
```

---

## SUCCESS CRITERIA CHECKLIST

### Before You Start
- [ ] Read this file and understand the plan
- [ ] Read `IMPLEMENTATION_READY.md` for current state
- [ ] Review `QUICK_START_IMPLEMENTATION.md` for code examples
- [ ] Setup your editor (VSCode + Svelte extension recommended)

### Day 1-2 Complete
- [ ] Users can sign in and access `/hub`
- [ ] Logout works and returns to login page
- [ ] Test data seeded in database
- [ ] RLS isolation verified with test queries

### Day 3-4 Complete
- [ ] hub-feed RPC returns tasks and events
- [ ] hub-search RPC filters by status/priority/domain
- [ ] Contract tests for both RPCs pass
- [ ] RLS tests verify cross-domain isolation blocked

### Day 5-6 Complete
- [ ] `/hub` page displays today's tasks + upcoming events
- [ ] Domain filter dropdown works
- [ ] Search panel with filters implemented
- [ ] Cmd+K command palette creates tasks
- [ ] Real-time updates show new items

### Day 7+ Complete
- [ ] All unit tests pass
- [ ] All E2E tests pass
- [ ] All RLS isolation tests pass
- [ ] Accessibility audit passes (zero WCAG violations)
- [ ] CI/CD pipeline green
- [ ] No secrets in repo (gitleaks clean)
- [ ] Documentation complete

---

## NEXT STEPS

### Right Now
1. Read `IMPLEMENTATION_READY.md` to understand current state
2. Read `QUICK_START_IMPLEMENTATION.md` for Day 1 tasks
3. Setup your environment (Node 18+, pnpm 9+, Docker)

### Day 1 Morning
1. Start `docker-compose up -d` to bring up infrastructure
2. Follow Day 1 tasks in `QUICK_START_IMPLEMENTATION.md`
3. Build login page component
4. Test by trying to sign in at `/login`

### Day 2
1. Create seed script with test data
2. Create test users in Supabase
3. Verify RLS isolation with SQL queries
4. Verify test data shows in hub

### Days 3-10
Follow the detailed roadmap in `QUICK_START_IMPLEMENTATION.md` and `DEPLOYMENT_READINESS_PLAN.md`.

---

## SUPPORT & RESOURCES

### Questions?
- Check the Constitution (`.specify/memory/constitution.md`)
- Review the Specification (`specs/001-central-hub/spec.md`)
- Check the detailed plans above

### Stuck on a Task?
1. Look at code examples in `QUICK_START_IMPLEMENTATION.md`
2. Check related test files for expected behavior
3. Verify Docker Compose stack is healthy
4. Check `.env.local` configuration

### Need to Deviate from Plan?
- Document the architectural decision in `docs/adr/`
- Ensure decision aligns with Constitution principles
- Update this plan to reflect changes
- Commit decision record before proceeding

---

## SUMMARY

Command Center MVP is **ready to implement**. You have:

✅ Infrastructure (Docker Compose)
✅ Database schema (13 migrations, RLS policies)
✅ Frontend scaffolding (SvelteKit, components, stores)
✅ Test structure (contract, RLS, e2e, accessibility)
✅ Documentation (specification, constitution, plans)

**What you need to do**: Implement the 7 days of tasks as laid out in `QUICK_START_IMPLEMENTATION.md`.

**Result**: Production-ready MVP in 7-10 business days with:
- ✅ Users can sign in
- ✅ Hub displays aggregated tasks/events
- ✅ Domain filtering works
- ✅ Search functionality
- ✅ Command palette quick-add
- ✅ Real-time updates
- ✅ RLS isolation enforced
- ✅ Comprehensive test coverage
- ✅ Accessibility compliant
- ✅ CI/CD pipeline automated

**Let's build!** Start with `QUICK_START_IMPLEMENTATION.md` Day 1.

---

**Last updated**: 2025-10-28
**Branch**: `001-central-hub`
**Status**: Ready for implementation
