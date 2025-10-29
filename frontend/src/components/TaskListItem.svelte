<script lang="ts">
  /**
   * TaskListItem Component
   * Individual task row in the task list
   * Shows task details with status, priority, due date
   *
   * Part of Phase 2 Sprint 3c: REFACTOR phase - UI development
   */

  import { createEventDispatcher } from 'svelte';
  import type { Task } from '$lib/stores/tasks';
  import { formatRelativeDate, isOverdue } from '$lib/utils/dates';

  interface $$Props {
    task: Task;
    selected?: boolean;
  }

  export let task: Task;
  export let selected = false;

  const dispatch = createEventDispatcher();

  /**
   * Get status badge color class
   */
  function getStatusClass(status: string): string {
    switch (status) {
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'blocked':
        return 'bg-red-100 text-red-800';
      case 'done':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  /**
   * Get priority badge text and color
   */
  function getPriorityInfo(priority: number | null | undefined): { text: string; class: string } {
    if (!priority) return { text: '', class: '' };
    if (priority >= 3) return { text: 'Critical', class: 'bg-red-100 text-red-800' };
    if (priority >= 2) return { text: 'High', class: 'bg-orange-100 text-orange-800' };
    return { text: 'Low', class: 'bg-green-100 text-green-800' };
  }

  /**
   * Get due date display with styling
   */
  function getDueDateInfo(dueAt: string | null | undefined) {
    if (!dueAt) return { text: '', class: '' };

    const isLate = isOverdue(dueAt);
    const formatted = formatRelativeDate(dueAt);

    return {
      text: formatted,
      class: isLate ? 'text-red-600 font-semibold' : 'text-gray-500',
    };
  }

  const statusInfo = getStatusClass(task.status);
  const priorityInfo = getPriorityInfo(task.priority);
  const dueDateInfo = getDueDateInfo(task.due_at);
</script>

<div class="task-item px-4 py-3 flex items-center gap-3">
  <!-- Checkbox / Selection indicator -->
  <input
    type="checkbox"
    checked={selected}
    on:change={() => dispatch('select')}
    class="w-5 h-5 text-blue-600 rounded cursor-pointer"
    aria-label="Select task"
  />

  <!-- Task Title -->
  <div class="flex-1 min-w-0">
    <p class="font-medium text-gray-900 truncate">{task.title}</p>
    {#if task.description}
      <p class="text-sm text-gray-500 truncate">{task.description}</p>
    {/if}
  </div>

  <!-- Badges Container -->
  <div class="flex items-center gap-2 flex-shrink-0">
    <!-- Status Badge -->
    <span class="px-2 py-1 rounded text-xs font-medium {statusInfo}">
      {task.status}
    </span>

    <!-- Priority Badge (if set) -->
    {#if priorityInfo.text}
      <span class="px-2 py-1 rounded text-xs font-medium {priorityInfo.class}">
        {priorityInfo.text}
      </span>
    {/if}

    <!-- Due Date -->
    {#if dueDateInfo.text}
      <span class="text-xs {dueDateInfo.class}">
        {dueDateInfo.text}
      </span>
    {/if}
  </div>

  <!-- Actions (hidden until hover/selection) -->
  <div class="flex items-center gap-1 flex-shrink-0 opacity-0 hover:opacity-100 transition-opacity">
    <button
      class="p-1 rounded hover:bg-blue-100 text-blue-600"
      title="Edit task (Cmd+E)"
      on:click|stopPropagation={() => dispatch('edit')}
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        />
      </svg>
    </button>
    <button
      class="p-1 rounded hover:bg-red-100 text-red-600"
      title="Delete task (Cmd+D)"
      on:click|stopPropagation={() => dispatch('delete')}
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
        />
      </svg>
    </button>
  </div>
</div>

<style>
  .task-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
</style>
