# Command Center UI - Action Items & Implementation Guide

## 🔴 CRITICAL - Fix Before Launch

### 1. Fix Color Contrast (30 min)

**Current Problem**: Text is too light, fails WCAG AA standards

**Files to Update**:
- `frontend/src/routes/+page.svelte`
- `frontend/src/routes/(app)/hub/+page.svelte`
- `frontend/src/components/*.svelte`

**Changes**:
```diff
- text-gray-500     → text-gray-600 (for secondary text)
- text-gray-600     → text-gray-700 (for muted text)
- text-gray-900     → keep as is (already good)
```

**Verification**:
```bash
# Install contrast checker
npm install --save-dev wcag-contrast

# Or use online tool:
# https://www.tpadesign.com/color-contrast-checker/
```

Test combinations:
- `text-gray-700` on `bg-white`: ~7:1 ✅ AAA
- `text-gray-600` on `bg-gray-50`: ~5:1 ✅ AA

---

### 2. Add Focus Indicators (30 min)

**File**: `frontend/src/app.html` or create global styles

**Add**:
```css
/* Global focus styles for keyboard navigation */
input:focus,
button:focus,
a:focus,
select:focus,
textarea:focus {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}

/* For elements with existing focus-ring classes */
.focus:ring-2.focus:ring-blue-500 {
  /* Already good, keep as is */
}

/* Add to interactive elements without focus rings */
.task-item:focus {
  outline: 2px solid #2563eb;
  outline-offset: -2px;
}
```

**Test**:
- Open app
- Press Tab repeatedly
- Should see blue outline around each element
- Test on: Links, buttons, inputs, custom elements

---

### 3. Add ARIA Labels (1 hour)

**File**: `frontend/src/components/TaskListItem.svelte`

**Change #1**: Edit/Delete buttons
```svelte
<!-- BEFORE -->
<button title="Edit task" on:click={() => dispatch('edit')}>
  <svg>...</svg>
</button>

<!-- AFTER -->
<button
  aria-label="Edit task"
  title="Edit task (Ctrl+E)"
  on:click={() => dispatch('edit')}
>
  <svg aria-hidden="true">...</svg>
</button>
```

**Change #2**: Checkbox
```svelte
<!-- BEFORE -->
<input
  type="checkbox"
  checked={selected}
  on:change={() => dispatch('select')}
  class="w-5 h-5 text-blue-600 rounded cursor-pointer"
  aria-label="Select task"  <!-- Already good -->
/>

<!-- Status badge -->
<span class="px-2 py-1 rounded text-xs font-medium {statusInfo}">
  {task.status}
</span>

<!-- AFTER -->
<span
  class="px-2 py-1 rounded text-xs font-medium {statusInfo}"
  role="status"  <!-- Add this -->
>
  Status: {task.status}
</span>
```

**File**: `frontend/src/components/TaskCreateDialog.svelte`

```svelte
<!-- BEFORE -->
<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div class="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">

<!-- AFTER -->
<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div
    class="bg-white rounded-lg shadow-lg max-w-md w-full mx-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="create-task-title"
  >
    <h2 id="create-task-title" class="text-lg font-semibold text-gray-900">
      Create New Task
    </h2>
```

**Add Error Description**:
```svelte
<!-- BEFORE -->
{#if error}
  <div class="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
    {error}
  </div>
{/if}

<!-- AFTER -->
{#if error}
  <div
    id="task-error"
    class="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700"
    role="alert"
    aria-live="polite"
  >
    {error}
  </div>
{/if}

<!-- Update form element -->
<form
  on:submit|preventDefault={handleSubmit}
  aria-describedby={error ? 'task-error' : undefined}
>
```

---

### 4. Add Delete Confirmation (1 hour)

**Current State**: `TaskDeleteDialog.svelte` exists but isn't used

**File**: `frontend/src/components/TaskListItem.svelte`

```svelte
<script lang="ts">
  import TaskDeleteDialog from './TaskDeleteDialog.svelte';

  let showDeleteConfirm = false;

  function handleDelete() {
    showDeleteConfirm = true;
  }

  function confirmDelete() {
    dispatch('delete');
    showDeleteConfirm = false;
  }
</script>

<!-- Before the list item -->
{#if showDeleteConfirm}
  <TaskDeleteDialog
    taskTitle={task.title}
    on:confirm={confirmDelete}
    on:cancel={() => (showDeleteConfirm = false)}
  />
{/if}

<!-- Update delete button -->
<button
  aria-label="Delete task"
  on:click|stopPropagation={handleDelete}
>
  <svg aria-hidden="true">...</svg>
</button>
```

**File**: `frontend/src/components/TaskDeleteDialog.svelte` (create if missing)

```svelte
<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  interface $$Props {
    taskTitle: string;
  }

  export let taskTitle: string;

  const dispatch = createEventDispatcher();
</script>

{#if true}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div
      class="bg-white rounded-lg shadow-lg max-w-sm w-full mx-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-title"
    >
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 id="delete-title" class="text-lg font-semibold text-gray-900">
          Delete Task?
        </h2>
      </div>

      <div class="px-6 py-4">
        <p class="text-gray-600">
          Are you sure you want to delete "<strong>{taskTitle}</strong>"?
        </p>
        <p class="text-sm text-gray-500 mt-2">This action cannot be undone.</p>
      </div>

      <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 justify-end">
        <button
          class="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          on:click={() => dispatch('cancel')}
        >
          Cancel
        </button>
        <button
          class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          on:click={() => dispatch('confirm')}
        >
          Delete Task
        </button>
      </div>
    </div>
  </div>
{/if}
```

---

### 5. Fix Modal Close on Outside Click (30 min)

**File**: `frontend/src/components/TaskCreateDialog.svelte`

```svelte
<script lang="ts">
  let showWarning = false;
  let hasUnsavedChanges = false;

  $: hasUnsavedChanges = title.trim().length > 0 || description.trim().length > 0;

  function closeDialog() {
    if (hasUnsavedChanges && !showWarning) {
      showWarning = true;
      return;
    }

    open = false;
    resetForm();
    dispatch('close');
  }

  function handleBackdropClick() {
    if (hasUnsavedChanges) {
      showWarning = true;
    } else {
      closeDialog();
    }
  }
</script>

<!-- Update backdrop -->
<div
  class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  on:click={handleBackdropClick}
>

<!-- Add warning dialog before main dialog -->
{#if showWarning}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-lg max-w-sm w-full mx-4">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">Unsaved Changes</h2>
      </div>
      <div class="px-6 py-4">
        <p class="text-gray-600">You have unsaved changes. Discard them?</p>
      </div>
      <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 justify-end">
        <button
          class="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          on:click={() => (showWarning = false)}
        >
          Keep Editing
        </button>
        <button
          class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          on:click={() => {
            showWarning = false;
            open = false;
            resetForm();
          }}
        >
          Discard Changes
        </button>
      </div>
    </div>
  </div>
{/if}
```

---

## 🟠 HIGH PRIORITY - Next Sprint

### 6. Add Loading States & Skeletons (2 hours)

**Files**: `frontend/src/routes/(app)/hub/+page.svelte`, `frontend/src/routes/(app)/tasks/+page.svelte`

**Create**: `frontend/src/components/SkeletonLoader.svelte`

```svelte
<script lang="ts">
  export let count = 3;
</script>

<div class="space-y-4">
  {#each Array(count) as _}
    <div class="bg-gray-200 animate-pulse rounded h-16 w-full" />
  {/each}
</div>
```

**Update Hub Page**:
```svelte
<script lang="ts">
  import SkeletonLoader from '$lib/components/SkeletonLoader.svelte';

  let loading = true;
  let tasks: Task[] = [];

  onMount(async () => {
    loading = true;
    tasks = await taskStore.fetchTasks();
    loading = false;
  });
</script>

{#if loading}
  <SkeletonLoader count={4} />
{:else if tasks.length > 0}
  <!-- Render tasks -->
{:else}
  <!-- Empty state -->
{/if}
```

---

### 7. Add Toast Notifications (2 hours)

**Create**: `frontend/src/lib/stores/toast.ts`

```ts
import { writable } from 'svelte/store';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

function createToastStore() {
  const { subscribe, update } = writable<Toast[]>([]);

  return {
    subscribe,
    add: (message: string, type: ToastType = 'info', duration = 3000) => {
      const id = Math.random().toString(36).substr(2, 9);
      const toast: Toast = { id, message, type, duration };

      update(toasts => [...toasts, toast]);

      if (duration > 0) {
        setTimeout(() => {
          update(toasts => toasts.filter(t => t.id !== id));
        }, duration);
      }

      return id;
    },
    remove: (id: string) => {
      update(toasts => toasts.filter(t => t.id !== id));
    },
    clear: () => {
      update(() => []);
    }
  };
}

export const toastStore = createToastStore();
```

**Create**: `frontend/src/components/ToastContainer.svelte`

```svelte
<script lang="ts">
  import { toastStore } from '$lib/stores/toast';
</script>

<div class="fixed bottom-4 right-4 z-50 space-y-2">
  {#each $toastStore as toast (toast.id)}
    <div
      class="px-4 py-3 rounded shadow-lg text-white max-w-sm animate-slide-up"
      class:bg-green-600={toast.type === 'success'}
      class:bg-red-600={toast.type === 'error'}
      class:bg-blue-600={toast.type === 'info'}
    >
      {toast.message}
    </div>
  {/each}
</div>

<style>
  @keyframes slideUp {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .animate-slide-up {
    animation: slideUp 0.3s ease-out;
  }
</style>
```

**Update**: `frontend/src/routes/+layout.svelte`

```svelte
<script lang="ts">
  import ToastContainer from '$lib/components/ToastContainer.svelte';
</script>

<ToastContainer />
<slot />
```

**Use in TaskCreateDialog**:
```ts
import { toastStore } from '$lib/stores/toast';

async function handleSubmit() {
  try {
    await taskStore.createTask({...});
    toastStore.add('Task created successfully!', 'success');
    closeDialog();
  } catch (err) {
    toastStore.add(`Error: ${err.message}`, 'error');
  }
}
```

---

### 8. Add Navigation Header (2 hours)

**Create**: `frontend/src/components/Header.svelte`

```svelte
<script lang="ts">
  import { page } from '$app/stores';
</script>

<header class="bg-white border-b border-gray-200 sticky top-0 z-40">
  <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
    <!-- Logo -->
    <a href="/" class="text-xl font-bold text-gray-900">
      Command Center
    </a>

    <!-- Navigation -->
    <nav class="flex items-center gap-6">
      <a
        href="/tasks"
        class="text-gray-600 hover:text-gray-900"
        class:font-semibold={$page.url.pathname === '/tasks'}
      >
        Tasks
      </a>
      <a
        href="/calendar"
        class="text-gray-600 hover:text-gray-900"
        class:font-semibold={$page.url.pathname === '/calendar'}
      >
        Calendar
      </a>
      <a
        href="/(app)/hub"
        class="text-gray-600 hover:text-gray-900"
        class:font-semibold={$page.url.pathname === '/(app)/hub'}
      >
        Hub
      </a>
    </nav>

    <!-- Profile -->
    <div class="w-8 h-8 bg-blue-600 rounded-full" />
  </div>
</header>

<style>
  a.font-semibold {
    color: #2563eb;
  }
</style>
```

**Update**: `frontend/src/routes/(app)/+layout.svelte`

```svelte
<script lang="ts">
  import Header from '$lib/components/Header.svelte';
</script>

<Header />
<slot />
```

---

## 🟡 MEDIUM PRIORITY - This Phase

### 9. Create Button Component (1.5 hours)

**Create**: `frontend/src/components/Button.svelte`

```svelte
<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
  type Size = 'sm' | 'md' | 'lg';

  interface $$Props extends HTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    size?: Size;
    disabled?: boolean;
    loading?: boolean;
  }

  export let variant: Variant = 'primary';
  export let size: Size = 'md';
  export let disabled = false;
  export let loading = false;

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'text-gray-600 hover:bg-gray-100'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
</script>

<button
  class="rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2
    {variantClasses[variant]} {sizeClasses[size]}"
  {disabled}
  {...$$props}
>
  {#if loading}
    <span class="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
  {/if}
  <slot />
</button>
```

**Usage**:
```svelte
<Button variant="primary">Create Task</Button>
<Button variant="secondary" disabled>Cancel</Button>
<Button variant="danger">Delete</Button>
<Button variant="ghost" size="sm">More options</Button>
```

---

## 📋 Implementation Checklist

### Week 1 (Critical Fixes)
- [ ] Fix color contrast (text-gray-600/700)
- [ ] Add focus indicators
- [ ] Add ARIA labels
- [ ] Add delete confirmation
- [ ] Fix modal unsaved changes warning
- [ ] Test with screen reader (NVDA/VoiceOver)
- [ ] Run Axe accessibility audit

### Week 2 (High Priority)
- [ ] Add loading skeletons
- [ ] Add toast notifications
- [ ] Add navigation header
- [ ] Fix mobile responsiveness
- [ ] Test on iPhone/iPad

### Week 3+ (Medium Priority)
- [ ] Create Button component
- [ ] Create Badge component
- [ ] Define design tokens
- [ ] Implement dark mode
- [ ] Add animations

---

## 🧪 Testing Commands

```bash
# Install accessibility testing
npm install --save-dev @axe-core/react

# Run tests
npm test

# Type checking
npm run type-check

# Format code
npm run format

# Lint
npm run lint
```

---

## 📞 Questions Before Starting?

1. **Timeline**: When is launch? This determines which issues to fix first.
2. **Accessibility Requirements**: WCAG 2.1 AA? ADA? EN 301 549?
3. **Mobile First?**: Design for mobile first or desktop?
4. **Design System**: Do you want to invest in a design system now or later?
5. **Resources**: Do you have a designer on the team to guide these changes?

---

**Last Updated**: October 29, 2025
**Status**: Ready for Implementation
**Estimated Time**: 15-20 hours for all critical + high priority items
