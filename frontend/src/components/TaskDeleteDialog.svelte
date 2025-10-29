<script lang="ts">
  /**
   * TaskDeleteDialog Component
   * Confirmation dialog for deleting tasks
   * Shows task details and warns about cascading deletes
   *
   * Part of Phase 2 Sprint 3c: REFACTOR phase - UI development
   */

  import { createEventDispatcher } from 'svelte';
  import { taskStore, type Task } from '$lib/stores/tasks';

  interface $$Props {
    open?: boolean;
    task?: Task | null;
  }

  export let open = false;
  export let task: Task | null = null;

  const dispatch = createEventDispatcher();

  let loading = false;
  let error: string | null = null;

  /**
   * Close dialog
   */
  function closeDialog() {
    open = false;
    error = null;
  }

  /**
   * Confirm delete
   */
  async function confirmDelete() {
    if (!task) return;

    loading = true;
    error = null;

    try {
      await taskStore.deleteTask(task.id);
      dispatch('deleted', { taskId: task.id });
      closeDialog();
    } catch (err: any) {
      error = err.message || 'Failed to delete task';
      loading = false;
    }
  }

  /**
   * Handle keyboard shortcuts
   */
  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      closeDialog();
    } else if (event.key === 'Enter' && !loading) {
      confirmDelete();
    }
  }
</script>

{#if open && task}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" on:click={closeDialog}>
    <div
      class="bg-white rounded-lg shadow-lg max-w-md w-full mx-4"
      on:click|stopPropagation
      on:keydown={handleKeyDown}
      role="alertdialog"
      aria-labelledby="dialog-title"
    >
      <!-- Icon -->
      <div class="bg-red-50 px-6 py-4 flex justify-center">
        <div class="flex-shrink-0">
          <svg class="h-12 w-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4v2m0 4v2M6.343 3H18a2 2 0 012 2v14a2 2 0 01-2 2H6.343a2 2 0 01-2-2V5a2 2 0 012-2z"
            />
          </svg>
        </div>
      </div>

      <!-- Content -->
      <div class="px-6 py-4">
        <h3 id="dialog-title" class="text-lg font-semibold text-gray-900 mb-2">
          Delete Task?
        </h3>

        <!-- Task Details -->
        <div class="bg-gray-50 p-3 rounded mb-4 border border-gray-200">
          <p class="font-medium text-gray-900 break-words">{task.title}</p>
          {#if task.description}
            <p class="text-sm text-gray-600 break-words mt-1">{task.description}</p>
          {/if}
        </div>

        <!-- Warning -->
        <p class="text-sm text-gray-600 mb-4">
          This action <span class="font-semibold">cannot be undone</span>. Any subtasks or dependencies will also be deleted.
        </p>

        <!-- Error Message -->
        {#if error}
          <div class="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700 mb-4">
            {error}
          </div>
        {/if}

        <!-- Actions -->
        <div class="flex gap-3 justify-end">
          <button
            type="button"
            on:click={closeDialog}
            disabled={loading}
            class="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            on:click={confirmDelete}
            disabled={loading}
            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
          >
            {#if loading}
              <span class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            {/if}
            Delete Task
          </button>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
        💡 Press Enter to confirm or Escape to cancel
      </div>
    </div>
  </div>
{/if}
