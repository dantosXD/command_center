# Phase 2 - Test Execution Guide

**Status**: GREEN phase implementation complete. Ready to verify with tests.

---

## Quick Start: Run All Tests

```bash
# 1. Start infrastructure
docker-compose up -d

# 2. Apply RLS migration
psql postgresql://postgres:postgres@localhost:5432/command_center \
  < backend/supabase/migrations/0014_task_crud_rls.sql

# 3. Load test fixtures
psql postgresql://postgres:postgres@localhost:5432/command_center \
  < backend/supabase/seeds/test-fixtures.sql

# 4. Run all tests
pnpm test:contract    # Should see: 25 passed
pnpm test:rls         # Should see: 12 passed
pnpm --filter frontend test  # Should see: 19 passed (18 new + 1 existing)

# Total expected: 55 PASS
```

---

## Test Suites Breakdown

### Contract Tests (25 tests)
**File**: `tests/contract/tasks.spec.ts`

Tests the API contract - what PostgREST should do.

**What it tests**:
- Create task with required fields ✓
- Validate required fields (title) ✓
- RLS prevents unauthorized creation ✓
- List tasks with filtering ✓
- List tasks with pagination ✓
- List tasks with sorting ✓
- Update task status/priority ✓
- RLS prevents unauthorized updates ✓
- Delete tasks ✓
- RLS prevents unauthorized deletes ✓
- Task dependencies ✓
- Circular dependency prevention ✓

**Expected output**:
```
Task CRUD Contract Tests (T014-T016)
  ✓ POST /tasks - Create Task (8 tests passed)
  ✓ GET /tasks - List Tasks (7 tests passed)
  ✓ PATCH /tasks/:id - Update Task (5 tests passed)
  ✓ DELETE /tasks/:id - Delete Task (2 tests passed)
  ✓ Task Dependencies (3 tests passed)

25 passed
```

**If a test fails**:
1. Read the error message
2. Check if API implementation is missing something
3. Verify Supabase PostgREST is running: `curl http://localhost:3000/rest/v1/tasks`
4. Check RLS migration was applied: `psql ... -c "SELECT * FROM pg_policies WHERE tablename='tasks';"`

---

### RLS Tests (12 tests)
**File**: `tests/rls/task-access.spec.ts`

Tests Row-Level Security - that users can't access others' data.

**What it tests**:
- Alice cannot view Bob's private domain tasks ✓
- Bob cannot view Alice's private domain tasks ✓
- Private domain tasks not visible in list queries ✓
- Users can view shared domain tasks when member ✓
- Users cannot view shared domain tasks when not member ✓
- Cannot update Bob's tasks (RLS) ✓
- Cannot delete Bob's tasks (RLS) ✓
- Task isolation prevents info leakage ✓
- Count/aggregate queries respect RLS ✓

**Expected output**:
```
Task RLS: Cross-Domain Access Isolation (T017)
  ✓ Domain Isolation - Private Domains (3 tests passed)
  ✓ Domain Isolation - Shared Domains (3 tests passed)
  ✓ Update/Delete Authorization (2 tests passed)
  ✓ RLS Boundary Validation (3 tests passed)
  ✓ Admin Override (1 test passed)

12 passed
```

**If a test fails**:
1. Check test user IDs match in fixture and test
2. Verify RLS policies are enabled: `psql ... -c "SELECT * FROM pg_policies WHERE tablename='tasks';"`
3. Check domain_members table has test data: `psql ... -c "SELECT * FROM domain_members LIMIT 5;"`
4. Try manual RLS test: Sign in as Alice, query Bob's domain tasks (should be empty)

---

### Frontend Store Tests (18 tests)
**File**: `frontend/src/lib/stores/tasks.test.ts`

Tests Svelte store state management and optimistic updates.

**What it tests**:
- Initialize with empty tasks ✓
- Load tasks from API ✓
- Set loading state during fetch ✓
- Create task (optimistic + sync) ✓
- Update task (optimistic + sync) ✓
- Delete task (optimistic + sync) ✓
- Filter by status ✓
- Sort by due date ✓
- Error handling ✓

**Expected output**:
```
Task Store
  ✓ Initialization (1 test passed)
  ✓ Load Tasks (3 tests passed)
  ✓ Create Task (2 tests passed)
  ✓ Update Task (3 tests passed)
  ✓ Delete Task (1 test passed)
  ✓ Filter Tasks (2 tests passed)
  ✓ Error Handling (2 tests passed)

18 passed
```

**Also runs**: domain.test.ts (1 passing) = 19 total for frontend

**If a test fails**:
1. Check taskAPI import in tasks.ts: `import { taskAPI } from '$lib/services/taskAPI';`
2. Verify taskAPI is exported: `grep "export const taskAPI" frontend/src/lib/services/taskAPI.ts`
3. Run type check: `pnpm --filter frontend check`
4. Check for missing functions in taskAPI

---

## Test Execution Checklist

Before running tests:

- [ ] Docker Compose is running: `docker-compose ps`
- [ ] Postgres is healthy: `docker-compose exec postgres pg_isready`
- [ ] 0014_task_crud_rls.sql applied: `psql ... -c "SELECT COUNT(*) FROM pg_policies;"`
- [ ] Test fixtures loaded: `psql ... -c "SELECT COUNT(*) FROM tasks;"`
- [ ] Environment variables set: `echo $SUPABASE_URL`

---

## Running Tests Incrementally

If you want to debug one test at a time:

### Contract Tests - Single Test
```bash
pnpm test:contract -- -t "should create task with required fields"
```

### RLS Tests - Single Suite
```bash
pnpm test:rls -- -t "Alice cannot view Bob"
```

### Frontend Tests - Single File
```bash
pnpm --filter frontend test -- tasks.test.ts
```

---

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| "Cannot find module taskAPI" | Import path wrong | Check `import { taskAPI } from '$lib/services/taskAPI';` |
| "RLS violation" in tests | Fixtures not loaded | Run `psql ... < backend/supabase/seeds/test-fixtures.sql` |
| "No such table: tasks" | Migration not applied | Run `psql ... < backend/supabase/migrations/0014_task_crud_rls.sql` |
| Postgres connection refused | Docker not running | Run `docker-compose up -d` |
| Tests hang (timeout) | API not responding | Check `curl http://localhost:3000/rest/v1/tasks` |
| "User not authenticated" | Auth issue | Tests create anon clients, should work by default |

---

## Success Criteria

All tests should show:

```
Test Files  1 passed (1)
     Tests  55 passed (55)
  Start at  13:00:00
  Duration  2.34s
```

---

## After Tests Pass

1. **Review Test Output**
   - Check all 55 tests show ✓ PASS
   - No failures or warnings

2. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: Phase 2 Sprint 3b - Task CRUD Green phase

   - Implement Task API service with CRUD operations
   - Implement Task store with optimistic updates
   - Enable RLS policies for task isolation
   - Add test fixtures for contract and RLS tests
   - All 55 contract, RLS, and unit tests passing

   Tests: 55 passed"
   ```

3. **Next Sprint (3c: REFACTOR + UI)**
   - Extract services, optimize queries
   - Build Task list UI component
   - Add keyboard shortcuts
   - Manual testing

---

## Test Environment Variables

Tests use these defaults (from `.env.local` or Docker):

```env
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/command_center
```

---

## Debugging Tips

### 1. Check RLS Policies
```bash
psql postgresql://postgres:postgres@localhost:5432/command_center \
  -c "SELECT policyname, qual FROM pg_policies WHERE tablename='tasks';"
```

### 2. Check Test Data
```bash
psql postgresql://postgres:postgres@localhost:5432/command_center \
  -c "SELECT id, domain_id, title, status FROM tasks LIMIT 5;"
```

### 3. Check Domain Membership
```bash
psql postgresql://postgres:postgres@localhost:5432/command_center \
  -c "SELECT domain_id, user_id, role FROM domain_members LIMIT 5;"
```

### 4. Run a Single Test Verbose
```bash
pnpm test:contract -- --reporter=verbose -t "should create task"
```

### 5. Check TypeScript Errors
```bash
pnpm --filter frontend check
```

---

## Expected Timeline

- Setup (Docker, migration, fixtures): 5 min
- Run contract tests: 1 min → 25 PASS
- Run RLS tests: 1 min → 12 PASS
- Run frontend tests: 1 min → 19 PASS
- **Total**: 10-15 min to full GREEN phase ✓

---

## Questions?

Refer to:
- RED phase spec: `docs/PHASE_2_RED_PHASE_COMPLETE.md`
- Green phase implementation: `docs/PHASE_2_GREEN_IMPLEMENTATION_COMPLETE.md`
- Architecture: `docs/adr/001-central-hub-architecture.md`
- RLS guide: `docs/runbooks/RLS_GOVERNANCE.md`

---

**Ready to run tests? Execute the "Quick Start" section above.**
