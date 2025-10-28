# 🚀 PHASE 3 EXECUTION BEGINS

**Status**: Phase 3 Ready - Daily Hub Implementation Starting Now
**Date**: 2025-10-28
**Duration**: 3-4 days estimated
**Tasks**: T025-T042 (18 total)

---

## What is Phase 3?

Phase 3 builds the **Daily Hub** - the core MVP feature that aggregates today's tasks and upcoming events across domains.

**User Story**: "As a user I want a single hub that aggregates today's tasks, upcoming meetings, and quick-add shortcuts across domains so I can plan my day without switching tools."

**Definition of Done**:
- ✅ Hub UI shows Today/Upcoming tasks and events
- ✅ Domain switcher to focus on single domain or "All Domains"
- ✅ Quick-add via command palette with natural language parsing
- ✅ Search and filters (status, priority, domain, tag)
- ✅ Real-time updates via WebSocket
- ✅ All 18 tests passing (contract, RLS, unit, E2E, accessibility)
- ✅ WCAG 2.2 AA compliance

---

## Quick Start: 3 Commands

```bash
# 1. Start Docker
docker-compose -f infrastructure/docker-compose.yml up -d

# 2. Verify everything works
./infrastructure/scripts/health/check-all.sh

# 3. Begin Phase 3 execution
# Follow PHASE_3_EXECUTION_GUIDE.md
```

**Expected Output**:
```
✓ PostgreSQL - OPEN
✓ PostgREST - OK
✓ Supabase Auth - OK
✓ Realtime - OK
✓ SeaweedFS - OK
✓ Prometheus - OK
...
✓ All checks passed!
```

---

## Phase 3 Task Structure

### Tests First (Red-Green-Refactor) - T025-T031
**Goal**: Write all tests BEFORE implementation

| Task | File | Framework |
|------|------|-----------|
| T025 | tests/contract/hub-aggregation.spec.ts | Vitest |
| T026 | tests/rls/hub-access.spec.ts | Custom RLS harness |
| T027 | frontend/tests/unit/hubStore.spec.ts | Vitest |
| T028 | frontend/tests/e2e/hub.spec.ts | Playwright |
| T029 | tests/accessibility/hub.axe.spec.ts | axe-core |
| T030 | tests/contract/hub-search.spec.ts | Vitest |
| T031 | tests/rls/hub-search.spec.ts | Custom RLS harness |

**Status**: All ready to write → **Expected to FAIL initially** ✓

### Backend Implementation - T032-T035
**Goal**: Create RPCs and database views

| Task | File | Type |
|------|------|------|
| T032 | backend/supabase/migrations/0010_hub_view.sql | SQL View |
| T033 | backend/supabase/functions/hub-feed/index.ts | Deno RPC |
| T034 | backend/supabase/migrations/0011_hub_search.sql | Materialized View |
| T035 | backend/supabase/functions/hub-search/index.ts | Deno RPC |

**Status**: T032, T034 already exist → **Verify** ✓
**Status**: T033, T035 ready to implement → **Create**

### Frontend Implementation - T036-T042
**Goal**: Build UI components and integration

| Task | File | Type |
|------|------|------|
| T036 | frontend/src/lib/stores/domain.ts | Svelte Store |
| T037 | frontend/src/routes/(app)/hub/+page.svelte | Page Component |
| T038 | frontend/src/lib/components/CommandPalette.svelte | Component |
| T039 | frontend/src/lib/utils/nlp.ts | Utility |
| T040 | frontend/src/lib/stores/hubRealtime.ts | Store |
| T041 | frontend/src/lib/components/hub/SearchPanel.svelte | Component |
| T042 | frontend/src/lib/services/hubSearch.ts | Service |

**Status**: All ready to implement → **Create**

---

## Execution Timeline

| Day | Phase | Work | Expected | Success Metric |
|-----|-------|------|----------|---|
| 1 | RED | Write all 7 tests | ~30 min | Tests exist but FAIL |
| 2 | GREEN (Backend) | Implement T032-T035 | ~2 hours | Contract + RLS tests pass |
| 3 | GREEN (Frontend) | Implement T036-T042 | ~2 hours | E2E tests pass |
| 4 | REFACTOR | Quality + Accessibility | ~1 hour | 100% tests, 0 a11y violations |

**Total**: 3-4 days → **Hub MVP Complete**

---

## Starting Point: Day 1 Red Phase

### Step 1: Create Test Files

```bash
# Navigate to project
cd /c/Users/207ds/Desktop/Apps/command_center/command_center

# Create test directories if needed
mkdir -p tests/contract tests/rls tests/accessibility
mkdir -p frontend/tests/unit frontend/tests/e2e

# Create all test files (stubs)
touch tests/contract/hub-aggregation.spec.ts
touch tests/contract/hub-search.spec.ts
touch tests/rls/hub-access.spec.ts
touch tests/rls/hub-search.spec.ts
touch frontend/tests/unit/hubStore.spec.ts
touch frontend/tests/e2e/hub.spec.ts
touch tests/accessibility/hub.axe.spec.ts
```

### Step 2: Write Tests

Follow detailed test specs in `PHASE_3_EXECUTION_GUIDE.md`:
- T025: Hub aggregation RPC contract test
- T026: RLS isolation test
- T027: Hub store unit tests
- T028: Hub E2E flow
- T029: Accessibility audit
- T030: Search/filter contract tests
- T031: Search RLS isolation tests

**Each test should**:
1. Have descriptive name
2. Set up test data
3. Execute tested function
4. Assert expected results
5. **FAIL** because implementation doesn't exist yet ✓

### Step 3: Verify Tests Fail

```bash
npm run test

# Expected output:
# ❌ hub_feed RPC returns tasks and events
# ❌ RLS: user cannot see user2 workspace
# ❌ hubStore aggregates by due date
# ... (all tests fail)
#
# Tests: 7 failed, 0 passed
```

**This is SUCCESS for Red Phase!**

---

## Key Implementation Details

### Hub Aggregation View
Already exists from Phase 1 in `backend/supabase/migrations/0010_hub_view.sql`:
- Combines tasks + events into single view
- Includes domain info
- Sorted by due date
- RLS applied automatically

**Verify**:
```bash
PGPASSWORD=postgres psql -h localhost -U postgres -d command_center \
  -c "SELECT * FROM hub_items LIMIT 1;"
# Should return: item_type, id, title, status, due_at, domain_name, etc.
```

### Hub Feed RPC
New Edge Function to create (T033):
- Endpoint: `POST /rpc/hub_feed`
- Accepts: workspace_id, domain_id (optional)
- Returns: Items sorted by due date
- RLS enforced automatically

### Domain Store
New Svelte store to create (T036):
- Tracks selected domain
- Persists to localStorage
- Triggers hub re-fetch on change
- Supports "all" or specific domain_id

### Hub UI Component
New SvelteKit page to create (T037):
- Route: `/hub`
- Shows Today/Upcoming sections
- Domain selector dropdown
- Quick-add button
- Real-time updates on item changes

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│                   FRONTEND                      │
├─────────────────────────────────────────────────┤
│  /hub (SvelteKit page)                         │
│  ├── DomainSelector (store: selectedDomain)    │
│  ├── CommandPalette (NLP parser)               │
│  ├── TaskList (real-time via Realtime store)   │
│  └── SearchPanel (filters + full-text)         │
└────────────────┬────────────────────────────────┘
                 │
        HTTP POST /rpc/hub_feed
        HTTP POST /rpc/hub_search
                 │
┌────────────────▼────────────────────────────────┐
│                  BACKEND                        │
├─────────────────────────────────────────────────┤
│  Edge Functions (Deno)                          │
│  ├── hub-feed RPC                              │
│  └── hub-search RPC                            │
│                                                 │
│  Views (PostgreSQL)                            │
│  ├── hub_items (tasks + events)                │
│  └── hub_search_index (full-text search)       │
│                                                 │
│  RLS Policies (enforced)                       │
│  └── Automatic workspace/domain filtering      │
│                                                 │
│  Realtime Subscriptions (Supabase)             │
│  └── Item changes broadcast to connected users │
└─────────────────────────────────────────────────┘
```

---

## Git Workflow

```bash
# Phase 3 is on branch: 001-central-hub
git status
# Should show: On branch 001-central-hub

# Create Phase 3 sub-branch (optional)
git checkout -b phase-3-hub

# Commit test files
git add tests/contract/hub-*.spec.ts
git add tests/rls/hub-*.spec.ts
git add tests/accessibility/hub.axe.spec.ts
git add frontend/tests/unit/hubStore.spec.ts
git add frontend/tests/e2e/hub.spec.ts

git commit -m "Phase 3: Write hub aggregation tests (red phase)"

# Continue with implementation...
```

---

## Resources Ready for Phase 3

✅ **Docker Stack**: Operational (11 services)
✅ **Database**: RLS policies active
✅ **Monitoring**: Prometheus + Grafana
✅ **Health Checks**: Automated verification
✅ **Test Frameworks**: Vitest, Playwright, axe
✅ **Development Server**: npm run dev
✅ **Edge Functions**: Deno runtime ready

---

## Expected Outcomes by End of Phase 3

### Hub MVP Complete
- ✅ Core value delivered: unified daily view
- ✅ 18 tasks implemented (T025-T042)
- ✅ 100% test coverage (contract, RLS, E2E, a11y)
- ✅ Real-time collaboration ready
- ✅ Search/filtering operational

### Ready for Phase 4
- ✅ Hub foundation solid
- ✅ User can plan day from single view
- ✅ Next: Domain management (create/edit domains, assign members)
- ✅ Next: Task workflows (list/board views, dependencies)

### Project Progress
- **Before Phase 3**: 40/108 tasks (37%)
- **After Phase 3**: 58/108 tasks (54%)
- **Completion Rate**: +18 tasks in 3-4 days

---

## Quick Reference Commands

```bash
# Start environment
docker-compose -f infrastructure/docker-compose.yml up -d

# Verify health
./infrastructure/scripts/health/check-all.sh

# Run all tests
npm run test

# Run specific test file
npm run test -- tests/contract/hub-aggregation.spec.ts

# Frontend dev server
pnpm --filter frontend dev

# Database access
PGPASSWORD=postgres psql -h localhost -U postgres -d command_center

# Deploy Edge Function
supabase functions deploy hub-feed

# View Realtime subscriptions
curl http://localhost:4000/health

# Check git status
git status
git log --oneline | head -10
```

---

## Confidence Check ✅

**Infrastructure**: ✅ Operational
**Database**: ✅ RLS active
**Testing**: ✅ Frameworks ready
**Documentation**: ✅ Complete
**Team**: ✅ Clear tasks

**Status**: READY TO EXECUTE PHASE 3

---

## Next: Follow PHASE_3_EXECUTION_GUIDE.md

This document provides:
- Detailed test specifications (T025-T031)
- Backend implementation code (T032-T035)
- Frontend component templates (T036-T042)
- Day-by-day execution plan
- Troubleshooting guide

**Start now**: Open `PHASE_3_EXECUTION_GUIDE.md` and begin Day 1

---

**Generated**: 2025-10-28
**Status**: Phase 3 Starting - Red Phase (Write Tests)
**Next**: Implement Day 1 Red Phase (write all tests)
