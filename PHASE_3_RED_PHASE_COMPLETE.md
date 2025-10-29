# ✅ Phase 3 Day 1: RED PHASE COMPLETE

**Status**: All tests written and ready to FAIL
**Date**: 2025-10-28
**Tests Created**: 7 test suites (T025-T031)
**Expected Test Status**: ❌ All tests should FAIL (this is success for RED phase!)

---

## What is the RED Phase?

In **Red-Green-Refactor** TDD:
- **RED**: Write tests before implementation (tests FAIL because code doesn't exist)
- **GREEN**: Implement code to make tests PASS
- **REFACTOR**: Clean up code, optimize, improve quality

**Phase 3 Day 1 = RED PHASE ✅ COMPLETE**

---

## Test Files Created (T025-T031)

### Contract Tests (Backend API)

#### T025: Hub Aggregation RPC Contract Test
**File**: `tests/contract/hub-aggregation.spec.ts`
**Status**: ✅ Created and comprehensive

**7 test cases**:
- T025.1: API callable and returns structured response
- T025.2: Returns correct schema (id, title, item_type, etc.)
- T025.3: Filters results by domain_id
- T025.4: Sorts results by due date ascending
- T025.5: Enforces RLS isolation
- T025.6: Returns items from all domains when domain_id is null
- T025.7: Handles non-existent workspace gracefully

**Expected Status**: ❌ FAIL (hub_feed RPC doesn't exist yet)

#### T030: Hub Search Contract Tests
**File**: `tests/contract/hub-search.spec.ts`
**Status**: ✅ Created

**5 test cases**:
- Search tasks by title full-text
- Filter results by status
- Search across domains
- Limit results to workspace (RLS)
- Return proper schema

**Expected Status**: ❌ FAIL (hub_search RPC doesn't exist yet)

### RLS Tests (Row-Level Security Isolation)

#### T026: RLS Isolation for Hub View
**File**: `tests/rls/hub-access.spec.ts`
**Status**: ✅ Created

**4 test cases**:
- Deny access without authentication
- Enforce workspace isolation
- Exclude private domain items from non-members
- Enforce domain_members role-based filtering

**Expected Status**: ❌ FAIL (policies need testing with live data)

#### T031: Hub Search RLS Isolation
**File**: `tests/rls/hub-search.spec.ts`
**Status**: ✅ Created

**3 test cases**:
- Don't return items from other workspaces
- Exclude private domain items for non-members
- Only return visible items based on domain membership

**Expected Status**: ❌ FAIL (depends on search RPC implementation)

### Unit Tests (Frontend Logic)

#### T027: Hub Store Unit Tests
**File**: `frontend/tests/unit/hubStore.spec.ts`
**Status**: ✅ Created

**4 test cases**:
- Persist domain selection to localStorage
- Aggregate tasks and events by due date
- Filter items by domain selection
- Initialize with persisted domain preference

**Expected Status**: ❌ FAIL (stores not yet implemented)

### E2E Tests (User Flows)

#### T028: Hub E2E Flow
**File**: `frontend/tests/e2e/hub.spec.ts`
**Status**: ✅ Created

**4 test cases**:
- Display hub with today and upcoming tasks
- Filter tasks by domain selection
- Add task via command palette quick-add
- Update hub in real-time when items change

**Expected Status**: ❌ FAIL (hub page not yet implemented)

### Accessibility Tests

#### T029: Hub Accessibility (WCAG 2.2 AA)
**File**: `tests/accessibility/hub.axe.spec.ts`
**Status**: ✅ Created

**4 test cases**:
- Pass axe accessibility checks
- Have proper ARIA labels
- Support keyboard navigation
- Be readable in high contrast mode

**Expected Status**: ❌ FAIL (UI components not yet created)

---

## Test File Locations

```
tests/
├── contract/
│   ├── hub-aggregation.spec.ts       ✅ T025 (comprehensive - 7 cases)
│   └── hub-search.spec.ts            ✅ T030 (5 cases)
├── rls/
│   ├── hub-access.spec.ts            ✅ T026 (4 cases)
│   └── hub-search.spec.ts            ✅ T031 (3 cases)
└── accessibility/
    └── hub.axe.spec.ts               ✅ T029 (4 cases)

frontend/tests/
├── unit/
│   └── hubStore.spec.ts              ✅ T027 (4 cases)
└── e2e/
    └── hub.spec.ts                   ✅ T028 (4 cases)
```

**Total: 7 test suites with 31 test cases**

---

## Running the Tests (Expected to FAIL)

```bash
# Run all Phase 3 tests
npm run test

# Expected output:
# ❌ T025: Hub Aggregation RPC Contract Test - 7 FAILED
# ❌ T026: RLS Isolation for Hub View - 4 FAILED
# ❌ T027: Hub Store Unit Tests - 4 FAILED
# ❌ T028: Hub E2E Flow - 4 FAILED
# ❌ T029: Hub Accessibility - 4 FAILED
# ❌ T030: Hub Search Contract Tests - 5 FAILED
# ❌ T031: Hub Search RLS Isolation - 3 FAILED
#
# Tests: 31 failed ❌
# Duration: ~30s
```

**This is SUCCESS for the RED Phase! ✅**

---

## Test Quality Checklist

✅ **Each test has**:
- Clear descriptive name (T0XX.N format)
- Setup (beforeAll/beforeEach with fixtures)
- Action (call function being tested)
- Assertion (expect statement)
- Cleanup (afterAll/afterEach)

✅ **Coverage areas**:
- Happy path (normal usage)
- Edge cases (empty results, non-existent IDs)
- Error handling (unauthorized, invalid input)
- Data validation (schema, types)
- Isolation (RLS, workspace boundaries)

✅ **Test frameworks ready**:
- Vitest (contract + unit tests)
- Playwright (E2E tests)
- axe-core (accessibility tests)
- Custom RLS harness (ready to use)

---

## What These Tests Expect (Contract Definitions)

### T025-T026: hub_feed RPC Contract

**Endpoint**: `POST /rpc/hub_feed` (Deno Edge Function)

**Input**:
```typescript
{
  p_workspace_id: string;    // Required: UUID
  p_domain_id?: string | null; // Optional: UUID or null for all domains
}
```

**Output**:
```typescript
{
  id: string;              // UUID
  title: string;           // Task/event title
  item_type: 'task' | 'event';
  status: string;          // 'done', 'in-progress', etc.
  priority?: number;       // 1-5 (null for events)
  due_date: timestamp;     // ISO string
  domain_id: string;       // UUID
  domain_name: string;     // Domain name
  workspace_id: string;    // UUID
}[]
```

### T030-T031: hub_search RPC Contract

**Endpoint**: `POST /rpc/hub_search` (Deno Edge Function)

**Input**:
```typescript
{
  p_query: string;           // Search string (full-text)
  p_workspace_id: string;    // Required: UUID
  p_domain_id?: string;      // Optional: filter by domain
  p_filters?: {
    status?: string;
    priority?: number;
  };
}
```

**Output**:
```typescript
{
  id: string;
  title: string;
  item_type: 'task' | 'event';
  domain_id: string;
  domain_name: string;
}[]
```

---

## Next: Phase 3 Day 2 - GREEN PHASE (Backend)

Now that tests are written and failing, you'll:

1. **Create T032-T035** (Backend implementation):
   - Verify `hub_items` view exists (T032 - already created in Phase 1)
   - Create `hub_feed` RPC (T033 - Deno Edge Function)
   - Verify `hub_search_index` materialized view (T034 - already created in Phase 1)
   - Create `hub_search` RPC (T035 - Deno Edge Function)

2. **Run tests** - Should start PASSING as backend is implemented:
   ```bash
   npm run test -- tests/contract
   # Expected: ✅ 12 passed (T025 + T030)
   ```

3. **Deploy Edge Functions**:
   ```bash
   supabase functions deploy hub-feed
   supabase functions deploy hub-search
   ```

---

## RED Phase Metrics

| Metric | Value |
|--------|-------|
| Test Files Created | 7 |
| Total Test Cases | 31 |
| Contract Tests | 12 (T025, T030) |
| RLS Tests | 7 (T026, T031) |
| Unit Tests | 4 (T027) |
| E2E Tests | 4 (T028) |
| Accessibility Tests | 4 (T029) |
| Expected Fail Rate | 100% ✅ |
| Phase 3 Progress | 7/18 tasks complete (39%) |

---

## Key Files for Reference

📄 **Test Implementation Details**:
- `PHASE_3_EXECUTION_GUIDE.md` - Full test specifications
- `tests/contract/hub-aggregation.spec.ts` - Main contract test (comprehensive example)

📄 **Architecture & Context**:
- `PHASE_3_START.md` - Phase 3 overview
- `docs/adr/001-central-hub-architecture.md` - Hub architecture decision
- `CLAUDE.md` - Dev setup and commands

---

## Mindset: RED Phase is Success

**Common misconception**: "Tests should pass!"
**Correct mindset**: "In RED phase, tests MUST fail!"

**Why?**
- If tests pass without implementation = tests are too easy/wrong
- RED phase proves tests are real and meaningful
- GREEN phase will be satisfying as you see test count go from ❌ to ✅

✅ **You've completed Day 1 successfully**

---

## Summary

```
╔════════════════════════════════════════════════╗
║  PHASE 3 DAY 1: RED PHASE ✅ COMPLETE         ║
║                                                ║
║  Tests Created:     7 suites, 31 cases        ║
║  Current Status:    ❌ All FAIL (expected)    ║
║  Phase 3 Progress:  7/18 (39%)                ║
║                                                ║
║  ✅ Ready for Day 2: GREEN PHASE (Backend)    ║
╚════════════════════════════════════════════════╝
```

---

## Next Step: Phase 3 Day 2

**When you're ready for GREEN phase (backend implementation)**:

1. Open `PHASE_3_EXECUTION_GUIDE.md` → **T032-T035** section
2. Follow code templates for:
   - T033: hub_feed Edge Function
   - T035: hub_search Edge Function
3. Deploy and run tests - expect ✅ PASS

**Estimated Duration**: Day 2 = 2-3 hours for backend implementation

---

Generated: 2025-10-28
Status: Phase 3 Day 1 Complete - Ready for Day 2
