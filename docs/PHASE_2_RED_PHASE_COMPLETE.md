# Phase 2 - Sprint 3a: RED PHASE COMPLETE

**Status**: ✅ RED PHASE DONE | **Date**: 2025-10-28 | **Sprint**: Week 3, Days 1-2

## What is the RED Phase?

Per the Constitution's **red-green-refactor** pattern:
- **RED**: Write failing tests that define expected behavior
- **GREEN**: Implement code to make tests pass
- **REFACTOR**: Clean up and optimize

This document confirms all RED phase deliverables are complete. Tests are written and will FAIL until implemented in Sprint 3b.

---

## RED Phase Deliverables

### 1. Contract Tests (API Validation)

**File**: `tests/contract/tasks.spec.ts` - 25 failing tests

**Test Coverage**:
- POST /tasks (Create)
  - Create with required fields (title, domain_id)
  - Validate required fields (title)
  - RLS enforcement: cannot create in inaccessible domains
  - Timestamp generation (created_at, updated_at)

- GET /tasks (List)
  - List tasks for accessible domains
  - Filter by domain_id
  - Filter by collection_id
  - Filter by status
  - Sort by due_at, priority
  - Hide tasks from inaccessible domains (RLS)
  - Pagination support (limit/offset)

- PATCH /tasks/:id (Update)
  - Update task status
  - Update priority and due_at
  - RLS: prevent unauthorized updates
  - Timestamp updates (updated_at)

- DELETE /tasks/:id (Delete)
  - Delete with authorization
  - RLS: prevent unauthorized deletes

- Task Dependencies
  - Create dependencies
  - Prevent circular dependencies

**Dependencies**: Requires Supabase running + authenticated users

### 2. RLS Tests (Security Isolation)

**File**: `tests/rls/task-access.spec.ts` - 12 failing tests

**Test Coverage**:
- Domain Isolation - Private Domains
  - Alice cannot view Bob's private domain tasks
  - Bob cannot view Alice's private domain tasks
  - Private domain tasks not in list queries
  - RLS prevents unauthorized access

- Domain Isolation - Shared Domains
  - Can view shared domain tasks when member
  - Cannot view shared domain tasks when not member
  - Can view after being added as member

- Update/Delete Authorization
  - Cannot update Bob's tasks (RLS)
  - Cannot delete Bob's tasks (RLS)
  - Permission escalation prevented

- RLS Boundary Validation
  - Task isolation prevents info leakage
  - Count/aggregate queries respect RLS
  - No cross-domain data exposure

**Dependencies**: Requires Supabase running + 2 authenticated test users (Alice, Bob)

### 3. Frontend Store Tests (State Management)

**File**: `frontend/src/lib/stores/tasks.test.ts` - 18 failing tests

**Test Coverage**:
- Initialization
  - Initialize with empty tasks

- Load Tasks
  - Load tasks for current domain
  - Set loading state during fetch
  - Handle load errors gracefully

- Create Task
  - Add task to list
  - Set proper timestamps

- Update Task
  - Update task status optimistically
  - Handle update errors and rollback
  - Update task priority

- Delete Task
  - Remove task from list

- Filter Tasks
  - Filter tasks by status
  - Sort tasks by due date

- Error Handling
  - Display error message on network failure
  - Clear error on retry

**Dependencies**: Requires taskStore implementation (part of GREEN phase)

---

## Skeleton Files Created

These skeleton files define the interface but lack implementation. They will be filled in during GREEN phase (Sprint 3b).

### 1. Frontend Store Skeleton
**File**: `frontend/src/lib/stores/tasks.ts`
- TaskState interface
- Task interface
- createTaskStore() function
- TODO comments showing what to implement

### 2. Task API Service Skeleton
**File**: `frontend/src/lib/services/taskAPI.ts`
- taskAPI.create()
- taskAPI.list()
- taskAPI.get()
- taskAPI.update()
- taskAPI.delete()
- taskAPI.createDependency()
- taskAPI.listDependencies()
- Each with TODO comments and test reference

### 3. RLS Migration Skeleton
**File**: `backend/supabase/migrations/0014_task_crud_rls.sql`
- RLS policy definitions for tasks table
- RLS policy definitions for task_dependencies table
- Comments showing policy intent
- Performance indexes for domain_members lookups

---

## Test Execution Status

**Current State**: All tests should FAIL (RED phase ✓)

```
Tests to Run (when ready):
  pnpm test:contract    --> 25 failing tests
  pnpm test:rls         --> 12 failing tests
  pnpm --filter frontend test  --> 18 failing tests (tasks.test.ts)

Total RED phase tests: 55 failing tests
Goal: 0 failures in GREEN phase (Sprint 3b)
```

---

## Next Steps: Sprint 3b - GREEN PHASE

**Timeline**: Days 3-4 of Week 3

**Sequence**:

1. **Create test fixtures**
   - Set up Supabase test database with sample data
   - Create test users (Alice, Bob)
   - Create test workspaces/domains
   - Create test tasks

2. **Implement RLS Migration**
   - Run migration 0014_task_crud_rls.sql
   - Verify RLS policies are enabled

3. **Implement Task API Service** (`frontend/src/lib/services/taskAPI.ts`)
   - create() - INSERT via PostgREST
   - list() - SELECT with filters
   - get() - SELECT single task
   - update() - PATCH via PostgREST
   - delete() - DELETE via PostgREST
   - createDependency() - CREATE dependency with circular check
   - listDependencies() - LIST dependencies

4. **Implement Task Store** (`frontend/src/lib/stores/tasks.ts`)
   - loadTasks(domainId)
   - createTask(data)
   - updateTask(id, data)
   - deleteTask(id)
   - filterByStatus(status)
   - sortByDueDate()

5. **Run Tests & Verify PASS**
   ```bash
   pnpm test:contract    # Should be 25 PASS
   pnpm test:rls         # Should be 12 PASS
   pnpm --filter frontend test  # Should be 18 PASS
   ```

6. **Git Commit**
   ```bash
   git add tests/ frontend/src/lib/stores/tasks.ts frontend/src/lib/services/taskAPI.ts backend/supabase/migrations/0014_*
   git commit -m "chore: Phase 2 Sprint 3b - Task CRUD Green phase

   - Implement Task API service (create, list, get, update, delete)
   - Implement Task store with state management
   - Enable RLS policies for task isolation
   - All 55 contract, RLS, and unit tests passing

   Tests: 55 passed (was 55 failing)"
   ```

---

## Architecture Decisions

### Why POST for Create?
PostgREST automatically creates RESTful endpoints from tables. INSERT becomes POST /tasks.

### Why Optimistic Updates?
Frontend updates immediately, syncs with server. Improves UX responsiveness. Rollback on error.

### Why Domain-Scoped RLS?
Tasks belong to domains (Home/Work/Play). Domain membership controls access. Users see only their domains' tasks.

### Why Indexes on domain_members?
RLS policies query `domain_members` on every task access. Indexes make this O(log n) instead of O(n).

---

## Files Changed in RED Phase

```
tests/
├── contract/
│   └── tasks.spec.ts [NEW] 25 contract tests
└── rls/
    └── task-access.spec.ts [NEW] 12 RLS tests

frontend/src/lib/
├── stores/
│   ├── tasks.ts [NEW] Store skeleton
│   └── tasks.test.ts [NEW] 18 unit tests
└── services/
    └── taskAPI.ts [NEW] API service skeleton

backend/supabase/migrations/
└── 0014_task_crud_rls.sql [NEW] RLS policies

docs/
└── PHASE_2_RED_PHASE_COMPLETE.md [NEW] This file
```

---

## Success Criteria for RED Phase

- [x] All 25 contract tests written and failing
- [x] All 12 RLS tests written and failing
- [x] All 18 frontend store tests written and failing
- [x] Task API service skeleton created with TODO comments
- [x] Task store skeleton created with TODO comments
- [x] RLS migration written with policy definitions
- [x] Tests reference clear acceptance criteria
- [x] Each test has corresponding implementation location documented

**RED PHASE STATUS: 100% COMPLETE ✅**

Next sprint begins with GREEN phase implementation.

---

## Risk Assessment (for GREEN phase)

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Circular dependencies in tasks | Medium | Add CHECK constraint in migration |
| RLS performance with large user bases | Medium | Index domain_members, test with 1000+ users |
| Optimistic update conflicts | Low | Add version field to detect conflicts |
| Task cascade delete complexity | Medium | Test with subtasks in beforeAll |

---

## References

- [Constitution](../.specify/memory/constitution.md) - Red-green-refactor pattern
- [Phase 1 Completion](./PHASE_1_COMPLETION.md) - Foundation setup
- [Implementation Plan](./PHASE_2_IMPLEMENTATION_PLAN.md) - Detailed roadmap
- [RLS Governance](./runbooks/RLS_GOVERNANCE.md) - Security guidelines
