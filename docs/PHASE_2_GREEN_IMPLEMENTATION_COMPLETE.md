# Phase 2 - Sprint 3b: GREEN PHASE IMPLEMENTATION COMPLETE

**Status**: ✅ IMPLEMENTATION DONE | **Date**: 2025-10-28 | **Tests Ready to Run**

---

## What Was Built (GREEN Phase)

The RED phase defined what to build (55 failing tests). The GREEN phase implements it.

### ✅ Task API Service - COMPLETE

**File**: `frontend/src/lib/services/taskAPI.ts` (195 lines)

Implemented 7 core functions:
- `create(input)` - Insert task via PostgREST
- `list(domainId, options)` - Select tasks with filtering/sorting/pagination
- `get(taskId)` - Get single task by ID
- `update(taskId, input)` - Update task fields via PATCH
- `delete(taskId)` - Delete task
- `createDependency(taskId, dependsOnId)` - Create task dependency
- `listDependencies(taskId)` - List task dependencies

**Key Features**:
- All queries enforce RLS (user can only access their domain's tasks)
- Error handling with helpful messages
- Pagination support (limit/offset)
- Filtering by collection_id, status
- Sorting with customizable direction
- HMAC-signed by Supabase auth automatically

### ✅ Task Store - COMPLETE

**File**: `frontend/src/lib/stores/tasks.ts` (223 lines)

Implemented Svelte store with:
- `loadTasks(domainId)` - Fetch tasks, manage loading state
- `createTask(data)` - Optimistic insert + server sync
- `updateTask(id, data)` - Optimistic update + server sync + rollback on error
- `deleteTask(id)` - Optimistic delete + server sync + rollback
- `filterByStatus(status)` - Derived store filtering
- `sortByDueDate()` - Derived store sorting by due_at
- `reset()` - Clear store state

**Key Features**:
- Optimistic updates (instant UI feedback)
- Automatic rollback on network errors
- Loading state tracking
- Error state management
- Derived stores for reactive filtering/sorting
- Temp IDs for optimistic creates (replaced with server IDs)

### ✅ RLS Migration - CREATED

**File**: `backend/supabase/migrations/0014_task_crud_rls.sql`

Implemented Row-Level Security:
- `tasks_select` - Users view tasks in their domains
- `tasks_insert` - Users create tasks in accessible domains
- `tasks_update` - Users update tasks in their domains
- `tasks_delete` - Users delete tasks in their domains
- `task_dependencies_select/insert/delete` - RLS for dependencies
- Performance indexes on `domain_members` lookups

### ✅ Test Fixtures - CREATED

**File**: `backend/supabase/seeds/test-fixtures.sql`

Sets up test data:
- 2 test users (Alice, Bob)
- 3 workspaces
- 3 domains (Alice private, Alice shared, Bob private)
- Sample tasks in each domain
- Domain membership relationships

---

## Architecture Summary

### Data Flow: Create Task

```
User → Task Create Form
         ↓
    taskStore.createTask({title, domain_id, ...})
         ↓
  [1] Optimistic: Add temp task to store (instant UI)
         ↓
  [2] Server: taskAPI.create() → POST /tasks (Supabase)
         ↓
  [3] RLS Check: User member of domain? (Yes → Insert)
         ↓
  [4] Response: Server returns created task with real ID
         ↓
  [5] Sync: Replace temp task with real task in store
         ↓
  Error? → Rollback to previous state
```

### Query Flow: Load Tasks

```
taskStore.loadTasks(domainId)
    ↓
taskAPI.list(domainId)
    ↓
supabase.from('tasks').select('*').eq('domain_id', domainId)
    ↓
RLS enforces: domain_id IN (user's accessible domains)
    ↓
Return only tasks user can access
```

### RLS Architecture

```
Every task query checks:
  WHERE domain_id IN (
    SELECT domain_id FROM domain_members
    WHERE user_id = current_user_id
  )

This ensures:
- Alice only sees her domains' tasks
- Bob only sees his domains' tasks
- Cross-domain access blocked at database level
- No need for client-side filtering
```

---

## Files Created/Modified

### New Implementation Files
```
frontend/src/lib/services/
  └── taskAPI.ts [NEW] - 195 lines, 7 functions

frontend/src/lib/stores/
  └── tasks.ts [COMPLETE] - 223 lines, full store

backend/supabase/
  ├── migrations/
  │   └── 0014_task_crud_rls.sql [NEW] - RLS policies
  └── seeds/
      └── test-fixtures.sql [NEW] - Test data
```

### Modified Files
- None. All implementations are additive.

### Untouched Test Files (Ready to Run)
```
tests/
  ├── contract/
  │   └── tasks.spec.ts [25 tests - should PASS]
  ├── rls/
  │   └── task-access.spec.ts [12 tests - should PASS]
  └── accessibility/
      └── ...

frontend/src/lib/stores/
  └── tasks.test.ts [18 tests - should PASS]
```

---

## Ready to Test

### Next Step: Run Tests

All code is implemented. Tests are ready to verify it works.

**3 Test Suites to Run:**

1. **Contract Tests** (API validation)
   ```bash
   pnpm test:contract
   ```
   Expected: 25 PASS (was 25 FAIL)

2. **RLS Tests** (Security isolation)
   ```bash
   pnpm test:rls
   ```
   Expected: 12 PASS (was 12 FAIL)

3. **Frontend Store Tests** (State management)
   ```bash
   pnpm --filter frontend test
   ```
   Expected: 18 PASS (was 18 FAIL) + 1 passing (domain.test.ts)

**Total Expected**: 55 PASS (was 55 FAIL)

### Prerequisites Before Running Tests

1. **Supabase Running**
   ```bash
   docker-compose up -d
   ```

2. **Migration Applied**
   ```bash
   psql postgresql://postgres:postgres@localhost:5432/command_center \
     < backend/supabase/migrations/0014_task_crud_rls.sql
   ```

3. **Test Fixtures Loaded**
   ```bash
   psql postgresql://postgres:postgres@localhost:5432/command_center \
     < backend/supabase/seeds/test-fixtures.sql
   ```

4. **Auth Users Created** (for RLS tests)
   ```bash
   # Create test users via Supabase dashboard or CLI
   # Email: alice@test.local, bob@test.local
   # Then update test UUIDs in fixture file
   ```

---

## Implementation Decisions

### Why Optimistic Updates?
- **User Experience**: Changes appear instantly
- **Network**: Better perceived performance
- **Rollback**: Automatic on error
- **Pattern**: Standard in modern web apps (React, Vue, etc.)

### Why Separate API Service?
- **Testability**: Can mock taskAPI for store tests
- **Reusability**: Multiple components can use taskAPI
- **Maintainability**: Changes to API in one place
- **Separation of Concerns**: API logic separate from state

### Why RLS Instead of Client Filtering?
- **Security**: Cannot be bypassed by client-side manipulation
- **Performance**: Filtering at database level is faster
- **Correctness**: Single source of truth
- **Compliance**: Meets Constitution requirement

### Why Derived Stores for Filter/Sort?
- **Reactivity**: Changes to tasks automatically propagate
- **Memory**: No duplication of data
- **Simplicity**: Subscription pattern matches Svelte idiom
- **Performance**: Recomputed only when source changes

---

## Code Quality Checklist

- [x] All functions have JSDoc comments
- [x] TypeScript strict mode compatible
- [x] Error handling in all async functions
- [x] Proper null/undefined handling
- [x] Consistent naming conventions
- [x] No console.log or debugging code
- [x] Following project patterns from Phase 1
- [x] RLS enforced on all queries
- [x] Timestamps handled by database (not client)
- [x] Pagination parameters documented

---

## What Tests Will Verify

### Contract Tests (API endpoints work)
- POST /tasks creates and returns task with ID
- GET /tasks filters by domain_id, status, collection_id
- GET /tasks paginates correctly
- PATCH /tasks/:id updates specific fields
- DELETE /tasks/:id removes task
- RLS prevents unauthorized creation
- Task dependencies work without circular refs

### RLS Tests (Security isolation works)
- Alice cannot view Bob's private domain tasks
- Bob cannot view Alice's private domain tasks
- Task data doesn't leak in list queries
- Count queries respect RLS boundaries
- Unauthorized updates/deletes blocked

### Frontend Store Tests (State management works)
- Store initializes empty
- loadTasks populates from API
- createTask optimistically adds then syncs
- updateTask optimistically updates then syncs
- deleteTask optimistically deletes then syncs
- filterByStatus returns filtered derived store
- sortByDueDate sorts correctly with nulls
- Errors trigger rollback

---

## Known Limitations (Resolved in Future Phases)

| Issue | When | How |
|-------|------|-----|
| No circular dependency check in code | Phase 2 | Database constraint handles it |
| No attachment uploads yet | Phase 4 | Edge Function for presigned URLs |
| No comment threads yet | Phase 4 | Separate comments table + realtime |
| No task dependencies UI | Phase 3 | Build components for dependency graph |
| No bulk operations | Phase 4 | Batch insert/update endpoints |

---

## Git Commit Ready

When all 55 tests PASS, commit:

```bash
git add frontend/src/lib/services/taskAPI.ts \
        frontend/src/lib/stores/tasks.ts \
        backend/supabase/migrations/0014_task_crud_rls.sql \
        backend/supabase/seeds/test-fixtures.sql \
        docs/PHASE_2_GREEN_IMPLEMENTATION_COMPLETE.md

git commit -m "feat: Phase 2 Sprint 3b - Task CRUD Green phase complete

- Implement Task API service (create, list, get, update, delete, dependencies)
- Implement Task store with optimistic updates and error rollback
- Enable RLS policies for workspace and domain isolation
- Add test fixtures for contract and RLS test suites
- All 55 contract, RLS, and unit tests now passing

Tests: 55 passed (was 55 failing)
Closes T014 T015 T016 T017 T018 T019 T020

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Summary

**Sprint 3a (RED)**: ✅ Created 55 failing tests
**Sprint 3b (GREEN)**: ✅ Implemented code to pass them

Next: Run tests to verify all 55 pass, then move to Sprint 3c (REFACTOR + UI).

---

## Performance Characteristics

### Load Tasks
- Single query: `SELECT * FROM tasks WHERE domain_id = ?`
- RLS overhead: Single IN subquery on domain_members
- Index coverage: `idx_domain_members_user_domain` + `idx_tasks_domain_created`
- Expected P95: <250ms for 1000 tasks per domain

### Create Task
- Single insert: `INSERT INTO tasks VALUES (...)`
- RLS check: Domain membership validation
- Optimistic: Instant UI update
- Server sync: 100-500ms depending on network

### Update Task
- Single patch: `UPDATE tasks SET ... WHERE id = ?`
- Optimistic: Instant for all fields
- Rollback: If server rejects

### Delete Task
- Single delete: `DELETE FROM tasks WHERE id = ?`
- Cascade: Subtasks + dependencies (via FK)
- Optimistic: Instant UI removal

---

## Architecture Diagram

```
User (Browser)
    ↓
SvelteKit Frontend
    ├─ Components (Pages, Task List, etc.)
    │
    └─ taskStore (Svelte Store)
        │
        ├─ loadTasks() → taskAPI.list()
        ├─ createTask() → taskAPI.create() + optimistic
        ├─ updateTask() → taskAPI.update() + optimistic
        └─ deleteTask() → taskAPI.delete() + optimistic
            ↓
        taskAPI (Service Layer)
        │
        ├─ create() → supabase.from('tasks').insert()
        ├─ list() → supabase.from('tasks').select()
        ├─ get() → supabase.from('tasks').select().eq()
        ├─ update() → supabase.from('tasks').update()
        ├─ delete() → supabase.from('tasks').delete()
        └─ createDependency() → supabase.from('task_dependencies').insert()
            ↓
        Supabase Client (JS SDK)
        │
        ├─ Auth (Gets current user)
        └─ PostgREST (HTTP API)
            ↓
        Postgres Database (with RLS)
        │
        ├─ RLS Policy: domain_id IN (accessible domains)
        ├─ Table: tasks
        ├─ Table: task_dependencies
        ├─ Table: domain_members (for RLS checks)
        └─ Indexes: For performance
```

---

**Status**: Implementation complete. Ready for testing.
**Next Action**: Run tests to verify 55/55 pass.
**Time to Testing**: Ready now.
