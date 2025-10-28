# Phase 2 - Next Actions: GREEN Phase Setup

**Date**: 2025-10-28 | **Sprint**: 3b (Week 3, Days 3-4) | **Status**: Ready to implement

---

## Summary: What Just Happened

You just completed the **RED PHASE** of Sprint 3a:

- ✅ Created 25 contract tests (API validation)
- ✅ Created 12 RLS tests (security isolation)
- ✅ Created 18 frontend store tests (state management)
- ✅ Created 3 skeleton files with TODO comments
- ✅ Created RLS migration with policy definitions

**Total**: 55 failing tests that define what needs to be built

---

## Next Phase: GREEN PHASE (Sprint 3b)

In the GREEN phase, you'll implement code to make all 55 tests PASS.

### Implementation Order (Critical Dependencies)

```
Phase 2b Green Phase: Task CRUD Implementation
Priority order ensures tests pass with minimal rework:

1. SETUP (Critical - Everything depends on this)
   - Run migration 0014_task_crud_rls.sql
   - Create test fixtures (users, domains, tasks)

2. BACKEND LAYER (Required by tests)
   - RLS policies enabled
   - PostgREST routes ready

3. FRONTEND SERVICE LAYER (Used by store)
   - taskAPI.list() - Get tasks
   - taskAPI.create() - Create task
   - taskAPI.update() - Update task
   - taskAPI.delete() - Delete task

4. FRONTEND STORE (Consumes service layer)
   - createTaskStore()
   - loadTasks()
   - createTask()
   - updateTask()
   - deleteTask()
   - filterByStatus()
   - sortByDueDate()

5. TESTING (Verify all pass)
   - pnpm test:contract → 25 PASS
   - pnpm test:rls → 12 PASS
   - pnpm --filter frontend test → 18 PASS

All tests PASS = GREEN phase complete
```

---

## Execution Checklist

### Pre-Implementation Setup (15-20 min)

- [ ] Understand test expectations by reading:
  - `tests/contract/tasks.spec.ts` - What API should do
  - `tests/rls/task-access.spec.ts` - What RLS should enforce
  - `frontend/src/lib/stores/tasks.test.ts` - What store should manage

- [ ] Review migration:
  - `backend/supabase/migrations/0014_task_crud_rls.sql`

### Implementation Order

**Day 3 - Part 1 (Task 1-2)** - Estimated 2 hours
- [ ] **Task 1**: Set up test database and fixtures
  - Need 2 test users (alice@test.local, bob@test.local)
  - Need 2 workspaces (1 per user)
  - Need 3 domains (1 private Alice, 1 private Bob, 1 shared)
  - Need sample tasks in each domain
  - Can manually create via Supabase dashboard or write SQL

- [ ] **Task 2**: Run migration 0014_task_crud_rls.sql
  ```bash
  psql postgresql://postgres:password@localhost:5432/command_center \
    < backend/supabase/migrations/0014_task_crud_rls.sql
  ```
  - Verify migration succeeded
  - Check RLS is enabled: `SELECT * FROM pg_policies WHERE tablename='tasks';`

**Day 3 - Part 2 (Task 3)** - Estimated 1.5 hours
- [ ] **Task 3**: Implement `frontend/src/lib/services/taskAPI.ts`
  - Start with `taskAPI.list(domainId)`
  - Then `taskAPI.create()`
  - Then `taskAPI.update()`
  - Then `taskAPI.delete()`
  - Pattern: Use supabase.from('tasks').select/insert/update/delete()
  - Each function should be ~10-15 lines

**Day 4 - Part 1 (Task 4)** - Estimated 1.5 hours
- [ ] **Task 4**: Implement `frontend/src/lib/stores/tasks.ts`
  - Create store with writable state
  - loadTasks() should call taskAPI.list()
  - createTask() should call taskAPI.create()
  - updateTask() should do optimistic update + sync
  - Each method 15-20 lines

**Day 4 - Part 2 (Task 5)** - Estimated 45 min
- [ ] **Task 5**: Run tests and fix failures
  ```bash
  pnpm test:contract      # Should start with failures
  pnpm test:rls           # Should start with failures
  pnpm --filter frontend test  # Should start with failures
  ```
  - First test run will show which implementations are missing
  - Iterate and fix until all pass

---

## Code Patterns to Follow

### Task API Service Pattern

```typescript
// Pattern from taskAPI.ts
export const taskAPI = {
  list: async (domainId: string) => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('domain_id', domainId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  },
};
```

### Task Store Pattern

```typescript
// Pattern from tasks.ts
export function createTaskStore() {
  const store = writable<TaskState>({ tasks: [], loading: false, error: null });

  return {
    subscribe: store.subscribe,

    loadTasks: async (domainId: string) => {
      store.update(s => ({ ...s, loading: true }));
      try {
        const tasks = await taskAPI.list(domainId);
        store.set({ tasks, loading: false, error: null });
      } catch (err) {
        store.update(s => ({ ...s, loading: false, error: err.message }));
      }
    },
  };
}
```

---

## Testing During Implementation

### Run Tests Incrementally

```bash
# After implementing list/get
pnpm test:contract -- -t "should list tasks"

# After implementing create
pnpm test:contract -- -t "should create task"

# After implementing update
pnpm test:contract -- -t "should update task"

# After implementing RLS
pnpm test:rls

# After implementing store
pnpm --filter frontend test
```

### When a Test Fails

1. Read the test to understand what it expects
2. Find the expectation that failed
3. Implement the missing piece in the service/store
4. Re-run just that test
5. Move to next test

---

## Success Criteria for GREEN Phase

- [ ] All 25 contract tests PASS
- [ ] All 12 RLS tests PASS
- [ ] All 18 frontend store tests PASS
- [ ] `pnpm test:contract && pnpm test:rls && pnpm --filter frontend test` all succeed
- [ ] TypeScript strict mode: `pnpm --filter frontend check` passes
- [ ] No ESLint errors: `pnpm --filter frontend lint` passes
- [ ] Ready to commit with 55/55 tests passing

---

## Commit Message When Done (Template)

```
chore: Phase 2 Sprint 3b - Task CRUD Green phase

- Implement Task API service (create, list, get, update, delete)
- Implement Task store with optimistic updates and error handling
- Enable RLS policies for workspace and domain isolation
- Add circular dependency prevention for task dependencies
- All 55 contract, RLS, and unit tests now passing

Tests: 55 passed (was 55 failing)

Closes T014 T015 T016 T017 T018 T019 T020
```

---

## Files to Implement (In Order)

1. `frontend/src/lib/services/taskAPI.ts` - Fill in TODO functions
2. `frontend/src/lib/stores/tasks.ts` - Fill in TODO functions
3. Run migration: `backend/supabase/migrations/0014_task_crud_rls.sql`
4. Create test fixtures in database
5. Run all tests until passing

---

## Resources During Implementation

- [Contract Test Expectations](./tests/contract/tasks.spec.ts)
- [RLS Test Expectations](./tests/rls/task-access.spec.ts)
- [Store Test Expectations](./frontend/src/lib/stores/tasks.test.ts)
- [RLS Governance Guide](./docs/runbooks/RLS_GOVERNANCE.md)
- [Supabase Docs](https://supabase.com/docs)

---

## Estimated Timeline

- Setup & Migration: 30 min
- Task API Service: 1.5 hours
- Task Store: 1.5 hours
- Testing & Debugging: 1 hour
- **Total**: ~4.5 hours (one day of focused work)

---

## Ready to Start?

When you're ready to begin GREEN phase:

1. Confirm you understand the test expectations
2. Set up test fixtures in database
3. Run the migration
4. Start with taskAPI.list()
5. Work through tests incrementally
6. All 55 tests should PASS by end of Sprint 3b

**The tests define exactly what you need to build. Follow them, and you'll have a solid implementation.**

Good luck! Questions? Review the test files - they're self-documenting.
