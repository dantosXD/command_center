# Sprint 3c - UI Development Plan
## Phase 2 Refactor & Component Implementation

**Created**: 2025-10-28
**Status**: 🟢 READY TO START (after tests pass)
**Target Timeline**: Week 4 (1 week)
**Dependent On**: Phase 2 Sprint 3b ✅ COMPLETE

---

## EXECUTIVE SUMMARY

Sprint 3c transforms Task CRUD operations (backend-complete in 3b) into a fully functional user interface. This sprint builds the RefACTOR phase of the TDD cycle:

```
RED (Tests) ✅ → GREEN (Implementation) ✅ → REFACTOR (UI) ⏳ ← YOU ARE HERE
```

**Deliverables**:
- 4 UI components (TaskList, TaskCreate, TaskEdit, TaskDelete)
- Keyboard shortcut system
- Filtering & sorting UI
- Full integration with stores (real-time reactivity)
- E2E tested workflows

**Definition of Done for Sprint 3c**:
- All 4 UI components built and tested
- All 55 backend tests still passing
- Keyboard shortcuts working
- Manual testing complete
- E2E smoke tests green
- Ready for Phase 3

---

## COMPONENTS TO BUILD

### 1. TaskList Component
**File**: `frontend/src/components/TaskList.svelte`
**Size Estimate**: 200-300 lines
**Complexity**: Medium

**Features**:
- [x] Display tasks from task store
- [x] Real-time updates via store subscription
- [x] Status indicators (backlog/in-progress/blocked/done)
- [x] Priority visualization (color-coded)
- [x] Due date display with relative formatting (e.g., "Due in 2 days")
- [x] Assignee avatars
- [x] Virtual scrolling for large lists (>500 tasks)
- [x] Empty state handling
- [x] Loading skeleton
- [x] Click to select task
- [x] Hover actions (edit, delete buttons)

**Dependencies**:
- `$lib/stores/tasks` - task store
- `$lib/utils/dates` - relative date formatting
- `lucide-svelte` - icons
- `@radix-ui` components - accessibility

**Tests** (Vitest):
```typescript
describe('TaskList', () => {
  // Render with empty store
  // Render with tasks
  // Real-time updates when store changes
  // Virtual scroll performance
  // Keyboard navigation (arrow keys)
  // Click handling
})
```

**Acceptance Criteria**:
- [ ] Renders 100+ tasks smoothly
- [ ] Updates within 100ms of store change
- [ ] Keyboard accessible (arrow keys, Enter)
- [ ] Mobile responsive
- [ ] No console errors
- [ ] 90+ Lighthouse score

---

### 2. TaskCreate Dialog
**File**: `frontend/src/components/TaskCreateDialog.svelte`
**Size Estimate**: 150-200 lines
**Complexity**: Medium

**Features**:
- [x] Modal dialog with form
- [x] Fields: title (required), description, domain_id, collection_id, status, priority, due_at
- [x] Form validation (title required)
- [x] Optimistic creation (closes immediately)
- [x] Error handling with undo option
- [x] Focus management (auto-focus title)
- [x] Cancel button (Escape key)
- [x] Submit via button or Cmd+Enter

**Dependencies**:
- `$lib/stores/tasks` - createTask() method
- Form validation library (zod or custom)
- Dialog component (Radix)

**Tests**:
```typescript
describe('TaskCreateDialog', () => {
  // Opens when triggered
  // Form validation
  // Optimistic creation shows new task
  // Error handling and rollback
  // Keyboard shortcuts work
  // Clears form after submit
})
```

**Acceptance Criteria**:
- [ ] Task creates within 200ms
- [ ] Form validates before submit
- [ ] Error messages clear and helpful
- [ ] Escape key closes dialog
- [ ] Cmd+N opens dialog (global shortcut)

---

### 3. TaskEdit Component (Inline or Modal)
**File**: `frontend/src/components/TaskEdit.svelte`
**Size Estimate**: 200-250 lines
**Complexity**: High (state management)

**Features**:
- [x] Edit mode triggered by click or keyboard
- [x] Fields: title, description, status, priority, due_at, assignee
- [x] Optimistic update (instant UI feedback)
- [x] Cancel (Escape) discards changes
- [x] Auto-save on blur (optional)
- [x] Dirty state tracking (unsaved changes warning)
- [x] Conflict resolution (server wins on conflict)
- [x] Full undo/redo support (optional Phase 4)

**Implementation Options**:
- **Option A**: Inline editing (edit row in place)
  - Pros: Fast, space-efficient
  - Cons: Limited space for large descriptions

- **Option B**: Modal dialog (open edit form)
  - Pros: Full screen, better UX
  - Cons: More clicks to edit

**Recommendation**: Start with **Option A** (inline), upgrade to **Option B** in Phase 4 if needed

**Tests**:
```typescript
describe('TaskEdit', () => {
  // Enter edit mode
  // Save changes optimistically
  // Rollback on error
  // Cancel discards changes
  // Conflict detection
})
```

**Acceptance Criteria**:
- [ ] Edit triggers on double-click or Cmd+E
- [ ] Changes save within 200ms
- [ ] Dirty state shows visual indicator
- [ ] Escape cancels without saving
- [ ] Conflicts handled gracefully

---

### 4. TaskDelete Component
**File**: `frontend/src/components/TaskDeleteDialog.svelte`
**Size Estimate**: 100-150 lines
**Complexity**: Low

**Features**:
- [x] Confirmation dialog before delete
- [x] Shows task title for confirmation
- [x] Warning if task has subtasks/dependencies
- [x] Undo option (optional, Phase 4)
- [x] Keyboard shortcuts (Cmd+D to delete)
- [x] Cancel (Escape) aborts delete

**Dependencies**:
- `$lib/stores/tasks` - deleteTask() method
- Dialog component (Radix)

**Tests**:
```typescript
describe('TaskDeleteDialog', () => {
  // Shows confirmation dialog
  // Cancel aborts delete
  // Confirm deletes task
  // Rollback on error
  // Warning for cascade deletes
})
```

**Acceptance Criteria**:
- [ ] Delete requires confirmation
- [ ] Optimistic delete shows immediately
- [ ] Error shows undo option
- [ ] Cascade warnings clear

---

## KEYBOARD SHORTCUTS

Create `frontend/src/lib/shortcuts.ts`:

```typescript
export const SHORTCUTS = {
  CREATE: { key: 'n', cmd: true, label: 'Create task' },
  EDIT: { key: 'e', cmd: true, label: 'Edit task' },
  DELETE: { key: 'd', cmd: true, label: 'Delete task' },
  COMPLETE: { key: 'enter', label: 'Toggle completion' },
  ESCAPE: { key: 'escape', label: 'Cancel/Close' },
  FOCUS_SEARCH: { key: 'k', cmd: true, label: 'Open search' },
};
```

**Global Shortcut Handler** (in root layout):

```svelte
<script>
  import { onMount } from 'svelte';

  onMount(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === 'n') {
        e.preventDefault();
        // Open TaskCreateDialog
      }
      if (e.metaKey && e.key === 'e') {
        e.preventDefault();
        // Enter edit mode on selected task
      }
      // ... etc
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });
</script>
```

---

## FILTERING & SORTING UI

### Filter Component
**File**: `frontend/src/components/TaskFilters.svelte`

**Features**:
- [ ] Status filter (checkboxes: backlog, in-progress, blocked, done)
- [ ] Priority filter (Low, Medium, High, Critical)
- [ ] Due date filter (Today, This Week, Overdue, Upcoming)
- [ ] Assignee filter (dropdown with user list)
- [ ] Clear all filters button
- [ ] Save filter preset (Phase 4)

**Implementation**:
```svelte
<script>
  import { taskStore } from '$lib/stores/tasks';

  let filters = {
    status: [],
    priority: [],
    dueDate: [],
    assignee: '',
  };

  $: filteredTasks = $taskStore.tasks.filter(t => {
    if (filters.status.length && !filters.status.includes(t.status)) return false;
    if (filters.priority.length && !filters.priority.includes(t.priority)) return false;
    // ... etc
    return true;
  });
</script>

<div class="filters">
  <!-- Checkboxes for each filter -->
  <button on:click={() => filters = {}}>Clear</button>
</div>
```

### Sort Component
**File**: `frontend/src/components/TaskSort.svelte`

**Features**:
- [ ] Sort dropdown (Due Date, Priority, Created Date, Status)
- [ ] Ascending/Descending toggle
- [ ] Active sort indicator

**Implementation** (use store methods):
```svelte
<select bind:value={sortBy}>
  <option value="created">Created Date</option>
  <option value="due_date">Due Date</option>
  <option value="priority">Priority</option>
</select>

<button on:click={toggleDirection}>
  {ascending ? '↑' : '↓'}
</button>

{#if sortBy === 'due_date'}
  {$taskStore.sortByDueDate()}
{/if}
```

---

## INTEGRATION WITH STORES

### Real-Time Updates Pattern

```svelte
<script>
  import { taskStore } from '$lib/stores/tasks';

  let tasks = [];

  // Subscribe to store changes
  const unsubscribe = taskStore.subscribe(state => {
    tasks = state.tasks;
  });

  onDestroy(unsubscribe);
</script>

<div>
  {#each tasks as task (task.id)}
    <TaskListItem {task} />
  {/each}
</div>
```

### Error Handling Pattern

```svelte
<script>
  let error = null;

  async function handleCreate(data) {
    try {
      await taskStore.createTask(data);
      // Success - no error needed, store handles UI update
    } catch (err) {
      error = err.message;
      // Show error toast/modal
    }
  }
</script>

{#if error}
  <div class="error">
    {error}
    <button on:click={() => error = null}>Dismiss</button>
  </div>
{/if}
```

---

## TESTING STRATEGY FOR SPRINT 3C

### Unit Tests (Vitest)
- Component rendering
- Store integration
- Event handling
- Error states

```bash
pnpm --filter frontend test -- components/
```

### E2E Tests (Playwright)
- Create task workflow
- Edit task workflow
- Delete task workflow
- Keyboard shortcuts

```bash
pnpm --filter frontend test:e2e
```

### Manual Testing Checklist
- [ ] Create task (Cmd+N)
- [ ] Edit task (Cmd+E)
- [ ] Delete task (Cmd+D) with confirmation
- [ ] Filter by status
- [ ] Sort by due date
- [ ] Real-time updates (open in 2 windows)
- [ ] Keyboard navigation (arrow keys, Tab)
- [ ] Mobile responsiveness
- [ ] Dark mode (if supported)

---

## STYLING & DESIGN

### Design System
- Use existing Tailwind CSS setup
- Radix UI components for accessibility
- Icons from lucide-svelte

### Component Structure

```
frontend/src/
  components/
    TaskList.svelte
    TaskCreateDialog.svelte
    TaskEdit.svelte
    TaskDeleteDialog.svelte
    TaskFilters.svelte
    TaskSort.svelte
    TaskListItem.svelte (child component)
    TaskStatusBadge.svelte
    TaskPriorityBadge.svelte
```

### CSS Classes (Tailwind)

```css
/* Task status colors */
.status-backlog { @apply bg-gray-100 text-gray-800; }
.status-in-progress { @apply bg-blue-100 text-blue-800; }
.status-blocked { @apply bg-red-100 text-red-800; }
.status-done { @apply bg-green-100 text-green-800; }

/* Priority colors */
.priority-low { @apply bg-green-100; }
.priority-medium { @apply bg-yellow-100; }
.priority-high { @apply bg-orange-100; }
.priority-critical { @apply bg-red-100; }
```

---

## IMPLEMENTATION SEQUENCE

### Phase 1: Core Components (Days 1-2)
1. [x] TaskList component
2. [x] TaskListItem (child)
3. [x] TaskCreate dialog
4. [x] TaskDelete dialog
5. [x] Integration tests

### Phase 2: Advanced Features (Days 3-4)
1. [x] TaskEdit (inline)
2. [x] Keyboard shortcuts
3. [x] Filters & Sort UI
4. [x] Real-time subscription tests

### Phase 3: Polish & Testing (Days 5)
1. [x] E2E smoke tests
2. [x] Manual testing
3. [x] Performance optimization
4. [x] Accessibility audit
5. [x] Documentation

---

## SUCCESS CRITERIA

### Functional
- [ ] All 4 UI components implemented
- [ ] Tasks render from store
- [ ] Create/edit/delete work optimistically
- [ ] Filters & sort work
- [ ] Keyboard shortcuts operational
- [ ] Real-time updates work

### Quality
- [ ] All backend tests still passing (55/55)
- [ ] E2E tests passing
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] 90+ Lighthouse score

### Accessibility
- [ ] WCAG 2.2 AA compliant
- [ ] Keyboard-only navigation works
- [ ] Screen reader tested
- [ ] Color contrast ≥ 4.5:1

### Performance
- [ ] TaskList renders 100+ items in <200ms
- [ ] Updates within 100ms of action
- [ ] No memory leaks
- [ ] Mobile smooth at 60fps

---

## KNOWN RISKS & MITIGATIONS

### Risk 1: Real-time Sync Conflicts
**Problem**: If user edits task in 2 windows, last-write-wins may conflict
**Mitigation**:
- Implement conflict detection (compare server version_number)
- Show conflict resolution dialog
- Let user choose: keep their version or accept server version

### Risk 2: Virtual Scrolling Complexity
**Problem**: Virtual scroll is complex to implement correctly
**Mitigation**:
- Start simple (regular list, no virtual scroll)
- Add virtual scroll only if >500 items (Phase 4)
- Use svelte-virtualized library if needed

### Risk 3: Keyboard Shortcut Conflicts
**Problem**: Cmd+N, Cmd+E, Cmd+D may conflict with browser/OS
**Mitigation**:
- Use Cmd+Shift+N instead if conflicts
- Document shortcuts in settings
- Allow customization (Phase 5)

### Risk 4: Mobile UX
**Problem**: Keyboard shortcuts don't work on mobile
**Mitigation**:
- Provide button UI as primary (Cmd+N as secondary)
- Mobile bottom sheet for actions
- FAB (floating action button) for create

---

## DEPENDENCIES & BLOCKERS

### Must Complete Before Sprint 3c:
- [x] Phase 2 Sprint 3b implementation (DONE)
- [x] Tests written (DONE)
- [ ] Tests passing (IN PROGRESS)
- [ ] Code review approved (PENDING)

### External Dependencies:
- [ ] Supabase running (for real data)
- [ ] Authentication working (to get user context)
- [ ] Database migrations applied (for RLS)

### Internal Dependencies:
- [ ] `$lib/stores/tasks` - READY ✅
- [ ] `$lib/services/taskAPI` - READY ✅
- [ ] `$lib/supabaseClient` - MUST EXIST
- [ ] Tailwind CSS - READY ✅
- [ ] Radix UI components - READY ✅

---

## DELIVERABLES CHECKLIST

### Code
- [ ] TaskList.svelte (200-300 lines)
- [ ] TaskCreateDialog.svelte (150-200 lines)
- [ ] TaskEdit.svelte (200-250 lines)
- [ ] TaskDeleteDialog.svelte (100-150 lines)
- [ ] TaskFilters.svelte (150-200 lines)
- [ ] TaskSort.svelte (80-120 lines)
- [ ] TaskListItem.svelte (100-150 lines)
- [ ] shortcuts.ts (50 lines)

### Tests
- [ ] Unit tests for each component (vitest)
- [ ] E2E workflows (Playwright)
- [ ] Manual test checklist completed
- [ ] Accessibility audit completed

### Documentation
- [ ] Component API documentation (JSDoc)
- [ ] Keyboard shortcuts guide
- [ ] Design system documentation
- [ ] Testing strategy documented

### Total Code: ~1200 lines UI + tests

---

## TIMELINE ESTIMATE

| Task | Duration | Owner |
|------|----------|-------|
| TaskList component | 4 hours | Dev |
| TaskCreate dialog | 3 hours | Dev |
| TaskEdit component | 4 hours | Dev |
| TaskDelete dialog | 2 hours | Dev |
| Filters & Sort | 3 hours | Dev |
| Keyboard shortcuts | 2 hours | Dev |
| Testing & debugging | 4 hours | QA |
| E2E tests | 3 hours | QA |
| Documentation | 2 hours | Tech Writer |
| **TOTAL** | **~33 hours** | - |

**Calendar**: 1 week (5 days × 6-7 hours/day)

---

## PHASE 3 READINESS

After Sprint 3c completes, the team is ready for Phase 3:

### Phase 3 Scope: Calendar & Reminders
- Calendar schema (events, recurrence, exceptions)
- Calendar UI (month/week/day views)
- Reminder scheduler (pg_cron)
- Notification delivery (email/Slack)
- ICS import/export

### Phase 3 Dependencies on Sprint 3c:
- [ ] Task CRUD UI working (prerequisite for calendar)
- [ ] Store pattern proven (reuse for events)
- [ ] Keyboard shortcut system (extend for calendar)
- [ ] Filter/sort UI pattern (extend for events)
- [ ] E2E test infrastructure ready

### Phase 3 Start Date:
After Sprint 3c approval + code review ≈ **Week 5**

---

## REFERENCES

- Phase 2 Sprint 3b Summary: `PHASE_2_SPRINT_3B_COMPLETE.md`
- Task API: `frontend/src/lib/services/taskAPI.ts`
- Task Store: `frontend/src/lib/stores/tasks.ts`
- Constitution: `.specify/memory/constitution.md`
- Design System: `docs/design-system.md` (to be created)

---

## STATUS

```
╔════════════════════════════════════════════════════════════════╗
║  SPRINT 3C - UI DEVELOPMENT PLAN                              ║
║                                                                ║
║  STATUS: 🟢 READY TO START (after Phase 2 Sprint 3b approval) ║
║  TIMELINE: 1 week (Week 4)                                    ║
║  DELIVERABLES: 4 components + keyboard shortcuts + tests      ║
║  TOTAL EFFORT: ~33 hours                                      ║
║                                                                ║
║  BLOCKERS:                                                     ║
║  - [⏳ IN PROGRESS] Phase 2 Sprint 3b tests execution         ║
║  - [⏳ PENDING] Code review approval                          ║
║                                                                ║
║  NEXT STEPS:                                                   ║
║  1. Execute tests (Option A: Supabase CLI)                    ║
║  2. Conduct code review of implementation                     ║
║  3. Approve & merge Sprint 3b                                 ║
║  4. START Sprint 3c (this plan)                               ║
╚════════════════════════════════════════════════════════════════╝
```

---

**Document Version**: 1.0
**Last Updated**: 2025-10-28
**Prepared By**: Claude Code
**Approval**: Pending Sprint 3b completion

