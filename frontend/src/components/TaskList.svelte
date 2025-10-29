<script lang="ts">
  /**
   * TaskList Component
   * Displays tasks from the task store with real-time updates
   * Supports filtering, sorting, and task selection
   *
   * Part of Phase 2 Sprint 3c: REFACTOR phase - UI development
   */

  import { onDestroy } from 'svelte';
  import { taskStore, type Task } from '$lib/stores/tasks';
  import TaskListItem from './TaskListItem.svelte';
  import { formatRelativeDate } from '$lib/utils/dates';

  let tasks: Task[] = [];
  let error: string | null = null;
  let loading = false;
  let selectedTaskId: string | null = null;

  // Subscribe to task store
  const unsubscribe = taskStore.subscribe((state) => {
    tasks = state.tasks;
    loading = state.loading;
    error = state.error;
  });

  onDestroy(unsubscribe);

  /**
   * Handle task selection
   */
  function selectTask(taskId: string) {
    selectedTaskId = selectedTaskId === taskId ? null : taskId;
  }

  /**
   * Handle keyboard navigation
   */
  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const taskIds = tasks.map((t) => t.id);
      const currentIndex = taskIds.indexOf(selectedTaskId || '');

      if (event.key === 'ArrowDown') {
        const nextIndex = Math.min(currentIndex + 1, taskIds.length - 1);
        selectedTaskId = taskIds[nextIndex] || null;
      } else {
        const prevIndex = Math.max(currentIndex - 1, 0);
        selectedTaskId = taskIds[prevIndex] || null;
      }
    }
  }

  /**
   * Get status badge color
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
   * Get priority badge color
   */
  function getPriorityClass(priority: number | null | undefined): string {
    if (!priority) return '';
    if (priority >= 3) return 'bg-red-100 text-red-800';
    if (priority >= 2) return 'bg-orange-100 text-orange-800';
    return 'bg-green-100 text-green-800';
  }
</script>

<div
  class="task-list bg-white rounded-lg shadow-sm border border-gray-200"
  on:keydown={handleKeyDown}
  role="list"
  tabindex="0"
  aria-label="Task list with keyboard navigation"
>
  {#if loading}
    <div class="p-4 text-center text-gray-500">
      <div class="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2" />
      Loading tasks...
    </div>
  {:else if error}
    <div class="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
      <p class="font-semibold">Error loading tasks</p>
      <p class="text-sm">{error}</p>
    </div>
  {:else if tasks.length === 0}
    <div class="p-8 text-center text-gray-400">
      <svg
        class="w-12 h-12 mx-auto mb-2 text-gray-300"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
        />
      </svg>
      <p class="text-lg font-medium">No tasks yet</p>
      <p class="text-sm">Create your first task using Cmd+N</p>
    </div>
  {:else}
    <div class="divide-y divide-gray-100">
      {#each tasks as task (task.id)}
        <div
          class="task-item-wrapper {selectedTaskId === task.id ? 'bg-blue-50' : 'hover:bg-gray-50'} transition-colors"
          role="listitem"
          on:click={() => selectTask(task.id)}
        >
          <TaskListItem
            {task}
            selected={selectedTaskId === task.id}
            on:select={() => selectTask(task.id)}
          />
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .task-list {
    overflow: hidden;
  }

  .task-item-wrapper {
    cursor: pointer;
  }
</style>
