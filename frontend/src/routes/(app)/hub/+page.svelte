<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { taskStore } from '$lib/stores/tasks';
  import type { Task } from '$lib/stores/tasks';
  import { formatRelativeDate, isOverdue } from '$lib/utils/dates';
  import { domainStore } from '$lib/stores/domain';

  let tasks: Task[] = [];
  let loading = false;
  let error: string | null = null;
  let unsubscribe: (() => void) | null = null;

  onMount(async () => {
    // Subscribe to task store
    unsubscribe = taskStore.subscribe((state) => {
      tasks = state.tasks;
      loading = state.loading;
      error = state.error;
    });

    // Load tasks for the current domain
    try {
      const domainId = $domainStore.selectedId || 'default';
      await taskStore.loadTasks(domainId);
    } catch (e) {
      console.error('Failed to load tasks:', e);
    }
  });

  onDestroy(() => {
    if (unsubscribe) {
      unsubscribe();
    }
  });

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
   * Filter tasks that are due today
   */
  function getTodaysTasks(): Task[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return tasks.filter((task) => {
      if (!task.due_at || task.status === 'done') return false;
      const dueDate = new Date(task.due_at);
      return dueDate >= today && dueDate < tomorrow;
    });
  }

  /**
   * Filter tasks that are overdue
   */
  function getOverdueTasks(): Task[] {
    return tasks.filter((task) => {
      if (!task.due_at || task.status === 'done') return false;
      return isOverdue(task.due_at);
    });
  }

  /**
   * Filter tasks in progress
   */
  function getInProgressTasks(): Task[] {
    return tasks.filter((task) => task.status === 'in-progress');
  }

  /**
   * Reload tasks
   */
  async function reload() {
    try {
      const domainId = $domainStore.selectedId || 'default';
      await taskStore.loadTasks(domainId);
    } catch (e) {
      console.error('Failed to reload tasks:', e);
    }
  }

  $: todaysTasks = getTodaysTasks();
  $: overdueTasks = getOverdueTasks();
  $: inProgressTasks = getInProgressTasks();
</script>

<svelte:head>
  <title>Hub - Command Center</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <!-- Header -->
  <div class="bg-white border-b border-gray-200">
    <div class="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Hub</h1>
          <p class="mt-1 text-gray-500">Your unified dashboard for tasks and events</p>
        </div>
        <div class="flex items-center gap-3">
          <button
            type="button"
            class="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            on:click={reload}
            disabled={loading}
            aria-label="Reload tasks"
          >
            <svg
              class="w-5 h-5 {loading ? 'animate-spin' : ''}"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
          <a
            href="/tasks"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            New Task
          </a>
        </div>
      </div>
    </div>
  </div>

  <!-- Main Content -->
  <div class="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
    <!-- Error Alert -->
    {#if error}
      <div
        role="alert"
        class="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3"
      >
        <svg class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clip-rule="evenodd"
          />
        </svg>
        <div class="flex-1">
          <h3 class="font-semibold text-red-900">Error loading tasks</h3>
          <p class="text-sm text-red-700 mt-1">{error}</p>
        </div>
        <button
          type="button"
          class="px-3 py-1 text-sm text-red-700 hover:text-red-900 font-medium"
          on:click={reload}
        >
          Retry
        </button>
      </div>
    {/if}

    <!-- Loading Skeleton -->
    {#if loading && tasks.length === 0}
      <div class="space-y-4">
        {#each [1, 2, 3, 4] as _ (  _)}
          <div class="bg-white rounded-lg border p-4 animate-pulse">
            <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div class="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        {/each}
      </div>
    {:else}
      <!-- Overview Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div class="text-gray-500 text-sm font-medium">Total Tasks</div>
        <div class="text-3xl font-bold text-gray-900 mt-2">{tasks.length}</div>
      </div>
      <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div class="text-gray-500 text-sm font-medium">In Progress</div>
        <div class="text-3xl font-bold text-blue-600 mt-2">{inProgressTasks.length}</div>
      </div>
      <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div class="text-gray-500 text-sm font-medium">Due Today</div>
        <div class="text-3xl font-bold text-orange-600 mt-2">{todaysTasks.length}</div>
      </div>
      <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div class="text-gray-500 text-sm font-medium">Overdue</div>
        <div class="text-3xl font-bold text-red-600 mt-2">{overdueTasks.length}</div>
      </div>
    </div>

    <!-- Overdue Tasks -->
    {#if overdueTasks.length > 0}
      <section class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 bg-red-50">
          <h2 class="text-lg font-semibold text-red-900">⚠️ Overdue Tasks ({overdueTasks.length})</h2>
        </div>
        <div class="divide-y divide-gray-100">
          {#each overdueTasks as task (task.id)}
            <div class="p-4 hover:bg-gray-50 transition-colors">
              <div class="flex items-start gap-4">
                <div class="flex-1">
                  <p class="font-medium text-gray-900">{task.title}</p>
                  {#if task.description}
                    <p class="text-sm text-gray-500 mt-1">{task.description}</p>
                  {/if}
                  <div class="flex items-center gap-2 mt-2">
                    <span class="px-2 py-1 rounded text-xs font-medium {getStatusClass(task.status)}">
                      {task.status}
                    </span>
                    {#if task.due_at}
                      <span class="text-xs text-red-600 font-semibold">{formatRelativeDate(task.due_at)}</span>
                    {/if}
                  </div>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </section>
    {/if}

    <!-- Today's Tasks -->
    {#if todaysTasks.length > 0}
      <section class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 bg-orange-50">
          <h2 class="text-lg font-semibold text-orange-900">📅 Due Today ({todaysTasks.length})</h2>
        </div>
        <div class="divide-y divide-gray-100">
          {#each todaysTasks as task (task.id)}
            <div class="p-4 hover:bg-gray-50 transition-colors">
              <div class="flex items-start gap-4">
                <div class="flex-1">
                  <p class="font-medium text-gray-900">{task.title}</p>
                  {#if task.description}
                    <p class="text-sm text-gray-500 mt-1">{task.description}</p>
                  {/if}
                  <div class="flex items-center gap-2 mt-2">
                    <span class="px-2 py-1 rounded text-xs font-medium {getStatusClass(task.status)}">
                      {task.status}
                    </span>
                    {#if task.assigned_to}
                      <span class="text-xs text-gray-600">Assigned to {task.assigned_to}</span>
                    {/if}
                  </div>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </section>
    {/if}

    <!-- In Progress Tasks -->
    {#if inProgressTasks.length > 0}
      <section class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 bg-blue-50">
          <h2 class="text-lg font-semibold text-blue-900">⚡ In Progress ({inProgressTasks.length})</h2>
        </div>
        <div class="divide-y divide-gray-100">
          {#each inProgressTasks as task (task.id)}
            <div class="p-4 hover:bg-gray-50 transition-colors">
              <div class="flex items-start gap-4">
                <div class="flex-1">
                  <p class="font-medium text-gray-900">{task.title}</p>
                  {#if task.description}
                    <p class="text-sm text-gray-500 mt-1">{task.description}</p>
                  {/if}
                  <div class="flex items-center gap-2 mt-2">
                    <span class="px-2 py-1 rounded text-xs font-medium {getStatusClass(task.status)}">
                      {task.status}
                    </span>
                    {#if task.due_at}
                      <span class="text-xs text-gray-600">Due {formatRelativeDate(task.due_at)}</span>
                    {/if}
                    {#if task.assigned_to}
                      <span class="text-xs text-gray-600">Assigned to {task.assigned_to}</span>
                    {/if}
                  </div>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </section>
    {/if}

      <!-- Empty State -->
      {#if tasks.length === 0 && !loading}
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div class="text-gray-400 mb-4">
            <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
          </div>
          <p class="text-lg font-medium text-gray-900">No tasks yet</p>
          <p class="text-gray-500 mt-2">Create your first task to get started</p>
          <a
            href="/tasks"
            class="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Task
          </a>
        </div>
      {/if}
    {/if}
  </div>
</div>
