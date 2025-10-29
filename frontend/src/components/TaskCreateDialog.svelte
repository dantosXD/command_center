<script lang="ts">
  /**
   * TaskCreateDialog Component
   * Modal dialog for creating new tasks
   * Supports form validation and optimistic creation
   *
   * Part of Phase 2 Sprint 3c: REFACTOR phase - UI development
   */

  import { createEventDispatcher } from 'svelte';
  import { taskStore } from '$lib/stores/tasks';

  interface $$Props {
    open?: boolean;
    domainId: string;
  }

  export let open = false;
  export let domainId: string;

  const dispatch = createEventDispatcher();

  let title = '';
  let description = '';
  let priority: number | null = null;
  let dueAt: string | null = null;
  let status: 'backlog' | 'in-progress' | 'blocked' | 'done' = 'backlog';
  let loading = false;
  let error: string | null = null;

  /**
   * Reset form
   */
  function resetForm() {
    title = '';
    description = '';
    priority = null;
    dueAt = null;
    status = 'backlog';
    error = null;
  }

  /**
   * Close dialog
   */
  function closeDialog() {
    open = false;
    resetForm();
    dispatch('close');
  }

  /**
   * Validate form
   */
  function validate(): boolean {
    if (!title.trim()) {
      error = 'Task title is required';
      return false;
    }
    return true;
  }

  /**
   * Handle form submission
   */
  async function handleSubmit() {
    if (!validate()) return;

    loading = true;
    error = null;

    try {
      await taskStore.createTask({
        domain_id: domainId,
        title: title.trim(),
        description: description.trim() || null,
        status,
        priority,
        due_at: dueAt || null,
      });

      dispatch('created');
      closeDialog();
    } catch (err: any) {
      error = err.message || 'Failed to create task';
      loading = false;
    }
  }

  /**
   * Handle keyboard shortcuts
   */
  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      closeDialog();
    } else if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault();
      handleSubmit();
    }
  }
</script>

{#if open}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" on:click={closeDialog}>
    <div
      class="bg-white rounded-lg shadow-lg max-w-md w-full mx-4"
      on:click|stopPropagation
      on:keydown={handleKeyDown}
      role="dialog"
      aria-labelledby="dialog-title"
    >
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 id="dialog-title" class="text-lg font-semibold text-gray-900">Create New Task</h2>
      </div>

      <!-- Form -->
      <form on:submit|preventDefault={handleSubmit} class="px-6 py-4 space-y-4">
        <!-- Title Field (Required) -->
        <div>
          <label for="title" class="block text-sm font-medium text-gray-700 mb-1">
            Task Title <span class="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            bind:value={title}
            placeholder="What needs to be done?"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            autofocus
            disabled={loading}
          />
        </div>

        <!-- Description Field -->
        <div>
          <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            bind:value={description}
            placeholder="Add details (optional)"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            disabled={loading}
          />
        </div>

        <!-- Status Field -->
        <div>
          <label for="status" class="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status"
            bind:value={status}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            <option value="backlog">Backlog</option>
            <option value="in-progress">In Progress</option>
            <option value="blocked">Blocked</option>
            <option value="done">Done</option>
          </select>
        </div>

        <!-- Priority Field -->
        <div>
          <label for="priority" class="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            id="priority"
            bind:value={priority}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            <option value={null}>None</option>
            <option value={1}>Low</option>
            <option value={2}>High</option>
            <option value={3}>Critical</option>
          </select>
        </div>

        <!-- Due Date Field -->
        <div>
          <label for="dueAt" class="block text-sm font-medium text-gray-700 mb-1">
            Due Date
          </label>
          <input
            id="dueAt"
            type="date"
            bind:value={dueAt}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>

        <!-- Error Message -->
        {#if error}
          <div class="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            {error}
          </div>
        {/if}

        <!-- Form Actions -->
        <div class="flex gap-3 justify-end pt-4">
          <button
            type="button"
            on:click={closeDialog}
            disabled={loading}
            class="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {#if loading}
              <span class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            {/if}
            Create Task
          </button>
        </div>
      </form>

      <!-- Footer hint -->
      <div class="px-6 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
        💡 Tip: Press Escape to cancel, Cmd+Enter to submit
      </div>
    </div>
  </div>
{/if}

<style>
  :global(.dark) {
    --bg-white: #1f2937;
    --text-gray-900: #f9fafb;
  }
</style>
