<script lang="ts">
  /**
   * Calendar Page
   * Main page for calendar management
   * Displays calendar with month view and upcoming events
   *
   * Part of Phase 3: Calendar & Reminders
   */

  import { taskStore } from '$lib/stores/tasks';
  import type { Task } from '$lib/stores/tasks';

  let currentDate = new Date();
  let tasks: Task[] = [];

  // Subscribe to task store
  const unsubscribe = taskStore.subscribe((state) => {
    tasks = state.tasks;
  });

  /**
   * Get days in month
   */
  function getDaysInMonth(date: Date): number {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }

  /**
   * Get first day of month (0 = Sunday, 1 = Monday, etc.)
   */
  function getFirstDayOfMonth(date: Date): number {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  }

  /**
   * Navigate to previous month
   */
  function goToPrevious() {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
  }

  /**
   * Navigate to next month
   */
  function goToNext() {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
  }

  /**
   * Go to today
   */
  function goToToday() {
    currentDate = new Date();
  }

  /**
   * Get tasks for a specific date
   */
  function getTasksForDate(date: Date): Task[] {
    return tasks.filter((task) => {
      if (!task.due_at) return false;
      const taskDate = new Date(task.due_at);
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      );
    });
  }

  /**
   * Format month/year for display
   */
  function formatDateDisplay(): string {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long' };
    return currentDate.toLocaleDateString('en-US', options);
  }

  // Generate calendar grid
  $: daysInMonth = getDaysInMonth(currentDate);
  $: firstDay = getFirstDayOfMonth(currentDate);
  $: calendarDays = Array.from({ length: firstDay + daysInMonth }, (_, i) => {
    if (i < firstDay) return null;
    return new Date(currentDate.getFullYear(), currentDate.getMonth(), i - firstDay + 1);
  });
</script>

<svelte:head>
  <title>Calendar - Command Center</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between mb-6">
    <div>
      <h1 class="text-3xl font-bold text-gray-900">Calendar</h1>
      <p class="mt-1 text-gray-500">View your schedule and upcoming tasks</p>
    </div>
    <a
      href="/tasks"
      class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
      New Task
    </a>
  </div>

  <!-- Controls -->
  <div class="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
    <div class="flex items-center gap-2">
      <button
        on:click={goToPrevious}
        class="p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Previous month"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        on:click={goToToday}
        class="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Today
      </button>
      <button
        on:click={goToNext}
        class="p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Next month"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>

    <h2 class="text-lg font-semibold text-gray-900">{formatDateDisplay()}</h2>
  </div>

  <!-- Calendar Grid -->
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <!-- Day headers -->
    <div class="grid grid-cols-7 gap-1 mb-2">
      {#each ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as day}
        <div class="text-center font-semibold text-gray-600 py-2 text-sm">{day}</div>
      {/each}
    </div>

    <!-- Calendar days -->
    <div class="grid grid-cols-7 gap-1">
      {#each calendarDays as date (date?.getTime() ?? -1)}
        {#if date}
          <div
            class="aspect-square border border-gray-200 rounded p-2 hover:bg-blue-50 transition-colors cursor-pointer {date.getMonth() === currentDate.getMonth()
              ? ''
              : 'bg-gray-50'} {date.toDateString() === new Date().toDateString() ? 'bg-blue-100 border-blue-300' : ''}"
          >
            <div class="text-right text-sm font-medium text-gray-900 mb-1">{date.getDate()}</div>
            <div class="space-y-1">
              {#each getTasksForDate(date) as task (task.id)}
                <div class="text-xs bg-blue-100 text-blue-800 rounded px-1 py-0.5 truncate">
                  {task.title}
                </div>
              {/each}
            </div>
          </div>
        {:else}
          <div></div>
        {/if}
      {/each}
    </div>
  </div>

  <!-- Upcoming Tasks -->
  <section class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
      <h2 class="text-lg font-semibold text-gray-900">Upcoming Tasks</h2>
    </div>
    <div class="divide-y divide-gray-100">
      {#each tasks.filter((t) => t.due_at).sort((a, b) => (a.due_at || '').localeCompare(b.due_at || '')) as task (task.id)}
        <div class="p-4 hover:bg-gray-50 transition-colors">
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1">
              <p class="font-medium text-gray-900">{task.title}</p>
              {#if task.description}
                <p class="text-sm text-gray-500 mt-1 truncate">{task.description}</p>
              {/if}
            </div>
            {#if task.due_at}
              <div class="text-right">
                <div class="text-sm text-gray-600">{new Date(task.due_at).toLocaleDateString()}</div>
                <div class="text-xs px-2 py-1 rounded mt-1 {task.status === 'done'
                  ? 'bg-green-100 text-green-800'
                  : task.status === 'in-progress'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'}">
                  {task.status}
                </div>
              </div>
            {/if}
          </div>
        </div>
      {/each}
      {#if !tasks.some((t) => t.due_at)}
        <div class="p-8 text-center text-gray-500">
          <p>No upcoming tasks scheduled</p>
        </div>
      {/if}
    </div>
  </section>
</div>
