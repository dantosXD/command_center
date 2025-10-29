# Phase 3: Daily Hub - Quick Start Guide

**Status**: Ready to Execute
**Date**: 2025-10-28
**Estimated Duration**: 3-4 days
**Tasks**: 18 (T025-T042)

---

## What is Phase 3?

Phase 3 delivers the **central hub** - a unified interface aggregating today's tasks and upcoming events with:
- Quick-add via command palette
- Structured search and filters
- Domain switching
- Real-time updates via Supabase Realtime

This is the **core MVP feature** and foundation for subsequent phases.

---

## Phase 3 User Story (US1)

**Goal**: Users can sign in, view today's tasks across domains, add tasks via natural language, and search with filters.

**User Acceptance Test**:
```
1. Sign in to Command Center
2. Land on hub page showing Today/Upcoming tasks
3. Toggle between "All Domains" and single domain
4. Quick-add a task: Cmd+K → "Buy groceries @home #quick"
5. See task appear instantly on hub
6. Search: "status:done @work" → see filtered results
7. Close browser, reopen → saved view state persists
```

---

## Phase 3 Tasks Breakdown

### Tests (Run First - Red-Green-Refactor) 🧪

| Task | Description | Framework | Status |
|------|-------------|-----------|--------|
| T025 | Hub aggregation RPC contract test | Tests (vitest) | ⏳ READY |
| T026 | RLS isolation test for hub view | Tests (custom harness) | ⏳ READY |
| T027 | Hub stores unit tests | Vitest | ⏳ READY |
| T028 | Hub E2E flow (Playwright) | Playwright | ⏳ READY |
| T029 | Accessibility audit (WCAG 2.2 AA) | axe DevTools | ⏳ READY |
| T030 | Search/filter contract tests | Tests (vitest) | ⏳ READY |
| T031 | Search RLS isolation tests | Tests (custom harness) | ⏳ READY |

**Expected Output**: All tests fail (red) - ready for implementation

### Backend Implementation 🔧

| Task | Description | Framework | Priority |
|------|-------------|-----------|----------|
| T032 | Hub aggregation SQL view | PostgreSQL | ⭐ CRITICAL |
| T033 | hub_feed RPC (feature flags + RLS) | PostgREST/Deno | ⭐ CRITICAL |
| T034 | Search materialized view & indexing | PostgreSQL | ⭐ CRITICAL |
| T035 | Search & filter RPCs | PostgREST/Deno | ⭐ CRITICAL |

**Expected Output**: REST endpoints with schema validation

### Frontend Implementation 🎨

| Task | Description | Framework | Priority |
|------|-------------|-----------|----------|
| T036 | Domain selection store | Svelte stores + TanStack Query | ⭐ CRITICAL |
| T037 | Hub UI (Today/Upcoming widgets) | SvelteKit + Radix UI | ⭐ CRITICAL |
| T038 | Command palette quick-add | Command/Palette lib | ⭐ CRITICAL |
| T039 | NLP parsing utilities | TypeScript | Standard |
| T040 | Realtime subscription store | Supabase Realtime + Svelte | Standard |
| T041 | Search panel UI (filters, saved views) | Radix UI | Standard |
| T042 | Search integration service | TanStack Query | Standard |

**Expected Output**: Fully functional hub UI with search

---

## How to Start Phase 3

### Step 1: Prepare Environment (5 min)
```bash
# Ensure Docker stack is running
docker-compose -f infrastructure/docker-compose.yml up -d

# Verify health
./infrastructure/scripts/health/check-all.sh

# Should see: ✅ All checks passed
```

### Step 2: Start with Tests (Red-Green-Refactor) (30-60 min)
```bash
# Create test files (stubs with failing assertions)
npm run test -- tests/contract/hub-aggregation.spec.ts

# Expected: ❌ FAIL (no implementation yet)
```

### Step 3: Implement Backend (2-3 hours)
```sql
-- T032: Create hub aggregation SQL view
-- Shows tasks/events with domain info
SELECT
  t.id, t.title, t.status, t.due_date, d.name AS domain
FROM tasks t
JOIN domains d ON d.id = t.domain_id
WHERE t.owner_id = current_user_uid()
ORDER BY t.due_date;

-- T033: Create RPC (hub_feed function)
-- Apply feature flags + RLS filtering
-- Callable via PostgREST: /rpc/hub_feed?workspace_id=...
```

### Step 4: Implement Frontend (2-3 hours)
```svelte
<!-- T037: hub/+page.svelte -->
<script>
  import { onMount } from 'svelte';
  import { useQuery } from '@tanstack/svelte-query';

  let selectedDomain = 'all';

  const { data: hubTasks } = useQuery({
    queryKey: ['hub_feed', selectedDomain],
    queryFn: () => fetchHubFeed(selectedDomain),
  });
</script>

<div class="hub-container">
  <DomainSelector bind:selectedDomain />
  <HubTaskList tasks={$hubTasks} />
  <CommandPalette onAddTask={addTask} />
</div>
```

### Step 5: Run Tests (Green) (30 min)
```bash
npm run test -- T037

# Expected: ✅ PASS (implementation complete)
```

### Step 6: E2E Verification (30 min)
```bash
npm run test:e2e -- frontend/tests/e2e/hub.spec.ts

# Expected: ✅ All flows pass
```

---

## Key Implementation Details

### Hub Aggregation View

**Location**: `backend/supabase/migrations/0010_hub_view.sql`
(Already created in Phase 1 - verify it exists)

Expected schema:
```sql
CREATE VIEW hub_items AS
SELECT
  'task' AS item_type,
  t.id, t.title, t.status, t.priority,
  t.due_date, t.created_at,
  d.id AS domain_id, d.name AS domain_name,
  d.visibility
FROM tasks t
JOIN domains d ON t.domain_id = d.id
UNION ALL
SELECT
  'event' AS item_type,
  e.id, e.title, 'scheduled' AS status, NULL AS priority,
  e.start_time AS due_date, e.created_at,
  d.id AS domain_id, d.name AS domain_name,
  d.visibility
FROM events e
JOIN domains d ON e.domain_id = d.id
WHERE e.start_time >= NOW()
ORDER BY due_date, priority DESC;
```

### Feature Flags

**Flag**: `central-hub-mvp`
**Rollout**: Start enabled for all users in dev

Check in RPC:
```sql
WHERE EXISTS (
  SELECT 1 FROM public.feature_flags ff
  WHERE ff.flag_name = 'central-hub-mvp'
    AND ff.enabled_by_default = true
)
```

### NLP Parser

**Location**: `frontend/src/lib/utils/nlp.ts`

Examples:
```
Input: "Buy groceries @home #quick"
Output: {
  title: "Buy groceries",
  domain: "home",
  tags: ["quick"]
}

Input: "Meeting with Alice @work +monday"
Output: {
  title: "Meeting with Alice",
  domain: "work",
  tags: ["monday"]
}
```

---

## Files to Create/Modify

### Backend
```
backend/supabase/functions/hub-feed/index.ts        (NEW - RPC)
backend/supabase/functions/hub-search/index.ts      (NEW - RPC)
backend/supabase/migrations/0010_hub_view.sql       (VERIFY exists)
backend/supabase/migrations/0011_hub_search.sql     (VERIFY exists)
backend/supabase/tests/nlp-parser.spec.ts           (NEW)
```

### Frontend
```
frontend/src/routes/(app)/hub/+page.svelte          (NEW)
frontend/src/lib/stores/domain.ts                   (NEW)
frontend/src/lib/stores/hubRealtime.ts              (NEW)
frontend/src/lib/components/CommandPalette.svelte   (NEW)
frontend/src/lib/components/hub/SearchPanel.svelte  (NEW)
frontend/src/lib/services/hubSearch.ts              (NEW)
frontend/src/lib/utils/nlp.ts                       (NEW)
frontend/tests/unit/hubStore.spec.ts                (NEW)
frontend/tests/e2e/hub.spec.ts                      (NEW)
```

### Tests
```
tests/contract/hub-aggregation.spec.ts              (NEW)
tests/contract/hub-search.spec.ts                   (NEW)
tests/rls/hub-access.spec.ts                        (NEW)
tests/rls/hub-search.spec.ts                        (NEW)
tests/accessibility/hub.axe.spec.ts                 (NEW)
```

---

## Testing Strategy

### Red-Green-Refactor Cycle

**Day 1 (Red)**:
- Write all tests with failing assertions
- Contract tests: define expected API schema
- RLS tests: verify domain isolation
- E2E tests: full user flow

**Day 2-3 (Green)**:
- Implement backend RPCs to pass contract tests
- Implement frontend components to pass E2E tests
- Run unit tests to verify business logic

**Day 4 (Refactor)**:
- Extract reusable components
- Optimize queries and indexes
- Final accessibility audit

---

## Definition of Done (Phase 3)

Before merging Phase 3:
- ✅ All tests passing (unit, contract, RLS, E2E, accessibility)
- ✅ Hub RPC returns correct schema with RLS applied
- ✅ Domain selector persists preference
- ✅ Command palette creates tasks correctly
- ✅ Search filters work (status, priority, domain, tag)
- ✅ Realtime updates visible without page refresh
- ✅ WCAG 2.2 AA compliance verified
- ✅ Code reviewed (no RLS violations, security clean)

---

## Performance Targets (Phase 3)

| Metric | Target | Notes |
|--------|--------|-------|
| Hub load (P95) | < 1.5 s | From cache after initial |
| Search response | < 500 ms | Indexed query |
| Task add latency | < 200 ms | Optimistic update |
| RLS policy check | < 50 ms per row | Materialized view helps |

---

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|-----------|-----------|
| RLS policy bugs | Medium | Comprehensive RLS tests (T026, T031) |
| NLP parser edge cases | Medium | Extensive unit tests, user feedback |
| Realtime sync conflicts | Low | TanStack Query handles dedupe |
| Search performance | Low | Materialized view + indexes |

---

## Next Phase After Phase 3

Once hub is complete and tested:
- Phase 4: Domain & Collection Management (domain creation, task CRUD, list/board views)
- Phases 5-7: Calendar, Collaboration, Hardening

---

## Resources

- `IMPLEMENTATION_STATUS.md` - Overall progress tracking
- `PHASE_2_EXECUTION.md` - Infrastructure setup (Docker, RLS)
- `specs/001-central-hub/tasks.md` - Full task breakdown
- `docs/adr/001-central-hub-architecture.md` - Architecture
- `CLAUDE.md` - Dev setup and commands

---

## Quick Commands

```bash
# Start Docker
docker-compose -f infrastructure/docker-compose.yml up -d

# Verify health
./infrastructure/scripts/health/check-all.sh

# Run Phase 3 tests
npm run test -- T025 T026 T027 T028

# Start frontend dev
pnpm --filter frontend dev

# Connect to database
PGPASSWORD=postgres psql -h localhost -U postgres -d command_center

# View logs
docker-compose logs -f postgres
docker-compose logs -f postgrest
```

---

## How to Execute

**Option 1: Automated with SpecKit**
```
/speckit.implement
# Will guide through Phase 3 execution step-by-step
```

**Option 2: Manual Execution**
Follow task breakdown in `specs/001-central-hub/tasks.md`
- T025-T031: Write all tests
- T032-T035: Implement backend
- T036-T042: Implement frontend
- Run full test suite to verify

---

## Status: Ready to Begin

Phase 3 is fully planned and ready to execute. The infrastructure (Phase 2) is complete and operational.

**Recommended**: Start with `/speckit.implement` workflow for guided execution.

---

Generated: 2025-10-28
Branch: 001-central-hub
