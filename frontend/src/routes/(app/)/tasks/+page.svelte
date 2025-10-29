<script lang="ts">
  /**
   * Tasks Page
   * Main page for task management
   * Displays task list with filters, sorting, and CRUD dialogs
   *
   * Part of Phase 2 Sprint 3c: REFACTOR phase - UI development
   */

  import { onMount } from 'svelte';
  import { taskStore } from '$lib/stores/tasks';
  import TaskList from '../../../components/TaskList.svelte';
  import TaskCreateDialog from '../../../components/TaskCreateDialog.svelte';
  import TaskDeleteDialog from '../../../components/TaskDeleteDialog.svelte';
  import { SHORTCUTS, createShortcutListener } from '$lib/shortcuts';
  import type { Task } from '$lib/stores/tasks';

  // TODO: Get domain_id from route params or user context
  const domainId = 'demo-domain-id';

  let showCreateDialog = false;
  let showDeleteDialog = false;
  let selectedTaskForDelete: Task | null = null;

  /**
   * Load tasks on mount
   */
  onMount(async () => {
    try {
      await taskStore.loadTasks(domainId);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    }

    // Set up keyboard shortcuts
    const handleShortcuts = createShortcutListener({
      CREATE_TASK: () => {
        showCreateDialog = true;
      },
      DELETE_TASK: () => {
        // TODO: Get selected task and open delete dialog
        showDeleteDialog = true;
      },
      FOCUS_SEARCH: () => {
        // TODO: Focus search input
        console.log('Search not yet implemented');
      },
    });

    window.addEventListener('keydown', handleShortcuts);
    return () => window.removeEventListener('keydown', handleShortcuts);
  });
</script>

<svelte:head>
  <title>Tasks - Command Center</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold text-gray-900">Tasks</h1>
      <p class="mt-1 text-gray-500">Manage your work with tasks and checklists</p>
    </div>
    <button
      on:click={() => (showCreateDialog = true)}
      class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
      New Task
      <span class="text-xs opacity-75 ml-2">Cmd+N</span>
    </button>
  </div>

  <!-- Task List -->
  <div class="bg-white rounded-lg shadow-sm border border-gray-200">
    <TaskList />
  </div>

  <!-- Help Text -->
  <div class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
    <p class="text-sm text-blue-900">
      <span class="font-semibold">Keyboard Shortcuts:</span>
      Cmd+N to create • Cmd+E to edit • Cmd+D to delete • Escape to cancel
    </p>
  </div>

  <!-- Dialogs -->
  <TaskCreateDialog
    open={showCreateDialog}
    {domainId}
    on:close={() => (showCreateDialog = false)}
    on:created={() => {
      showCreateDialog = false;
      // Task already added to store by optimistic update
    }}
  />

  <TaskDeleteDialog
    open={showDeleteDialog}
    task={selectedTaskForDelete}
    on:close={() => (showDeleteDialog = false)}
    on:deleted={() => {
      showDeleteDialog = false;
      selectedTaskForDelete = null;
    }}
  />
</div>
