<script lang="ts">
  import { onMount } from 'svelte';
  import CalendarMonthView from './CalendarMonthView.svelte';
  import CalendarWeekView from './CalendarWeekView.svelte';
  import CalendarDayView from './CalendarDayView.svelte';
  import Button from './Button.svelte';
  import { getUserTimezone } from '../lib/utils/timezone';

  type ViewType = 'month' | 'week' | 'day';

  let currentView: ViewType = 'month';
  let currentDate = new Date();
  let userTimezone = 'UTC';
  let isLoading = false;

  // Mobile detection
  let isMobile = false;

  onMount(() => {
    // Get user's timezone preference (from auth or localstorage)
    userTimezone = getUserTimezone();

    // Handle responsive layout
    const handleResize = () => {
      isMobile = window.innerWidth < 768;
      // Force day view on very small screens
      if (window.innerWidth < 640 && currentView === 'week') {
        currentView = 'day';
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });

  function previousPeriod() {
    const newDate = new Date(currentDate);
    switch (currentView) {
      case 'month':
        newDate.setMonth(newDate.getMonth() - 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() - 7);
        break;
      case 'day':
        newDate.setDate(newDate.getDate() - 1);
        break;
    }
    currentDate = newDate;
  }

  function nextPeriod() {
    const newDate = new Date(currentDate);
    switch (currentView) {
      case 'month':
        newDate.setMonth(newDate.getMonth() + 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + 7);
        break;
      case 'day':
        newDate.setDate(newDate.getDate() + 1);
        break;
    }
    currentDate = newDate;
  }

  function goToToday() {
    currentDate = new Date();
  }

  function setView(view: ViewType) {
    // Prevent week view on mobile (< 640px)
    if (view === 'week' && window.innerWidth < 640) {
      currentView = 'day';
    } else {
      currentView = view;
    }
  }

  // Format header based on current view
  function getHeaderText(): string {
    const year = currentDate.getFullYear();
    const month = currentDate.toLocaleString('en-US', { month: 'long', timeZone: userTimezone });
    const date = currentDate.getDate();
    const weekStart = new Date(currentDate);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());

    switch (currentView) {
      case 'month':
        return `${month} ${year}`;
      case 'week':
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: userTimezone })} – ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: userTimezone })}`;
      case 'day':
        return `${month} ${date}, ${year}`;
    }
  }
</script>

<div class="calendar-container">
  <!-- Sticky Header -->
  <div class="calendar-header">
    <!-- Navigation -->
    <div class="header-nav">
      <Button
        variant="secondary"
        size="sm"
        on:click={previousPeriod}
        aria-label="Previous period"
      >
        ← Previous
      </Button>

      <Button
        variant="secondary"
        size="sm"
        on:click={goToToday}
        aria-label="Go to today"
      >
        Today
      </Button>

      <Button
        variant="secondary"
        size="sm"
        on:click={nextPeriod}
        aria-label="Next period"
      >
        Next →
      </Button>
    </div>

    <!-- Header Title -->
    <h2 class="header-title" role="heading" aria-level="2">
      {getHeaderText()}
    </h2>

    <!-- View Switcher -->
    <div class="view-switcher" role="group" aria-label="Calendar view options">
      <button
        class="view-btn"
        class:active={currentView === 'month'}
        on:click={() => setView('month')}
        aria-pressed={currentView === 'month'}
        title="Month view"
      >
        <span class="sr-only">Month view</span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </button>

      <button
        class="view-btn"
        class:active={currentView === 'week'}
        class:hidden={isMobile}
        on:click={() => setView('week')}
        aria-pressed={currentView === 'week'}
        title="Week view (not available on mobile)"
        disabled={isMobile}
      >
        <span class="sr-only">Week view</span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
      </button>

      <button
        class="view-btn"
        class:active={currentView === 'day'}
        on:click={() => setView('day')}
        aria-pressed={currentView === 'day'}
        title="Day view"
      >
        <span class="sr-only">Day view</span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="9" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      </button>
    </div>
  </div>

  <!-- Calendar View Content -->
  <div class="calendar-content">
    {#if isLoading}
      <div class="loading-state" role="status" aria-live="polite">
        <p>Loading calendar...</p>
      </div>
    {:else if currentView === 'month'}
      <CalendarMonthView {currentDate} {userTimezone} />
    {:else if currentView === 'week'}
      <CalendarWeekView {currentDate} {userTimezone} />
    {:else if currentView === 'day'}
      <CalendarDayView {currentDate} {userTimezone} />
    {/if}
  </div>
</div>

<style>
  .calendar-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .calendar-header {
    position: sticky;
    top: 0;
    z-index: 30;
    padding: 1rem;
    background: white;
    border-bottom: 1px solid #e5e7eb;
    border-radius: 8px 8px 0 0;

    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .header-nav {
    display: flex;
    gap: 0.5rem;
  }

  .header-title {
    flex: 1;
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: #1f2937;
    min-width: 200px;
  }

  .view-switcher {
    display: flex;
    gap: 0.5rem;
    background: #f3f4f6;
    padding: 0.25rem;
    border-radius: 6px;
  }

  .view-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    padding: 0;
    background: transparent;
    border: none;
    border-radius: 4px;
    color: #6b7280;
    cursor: pointer;
    transition: all 0.2s ease;

    font-size: 0;
  }

  .view-btn:hover:not(:disabled) {
    background: white;
    color: #1f2937;
  }

  .view-btn.active {
    background: white;
    color: #2563eb;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }

  .view-btn:focus-visible {
    outline: 2px solid #2563eb;
    outline-offset: 2px;
  }

  .view-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .view-btn.hidden {
    display: none;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }

  .calendar-content {
    flex: 1;
    overflow: auto;
    padding: 1rem;
  }

  .loading-state {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #6b7280;
    font-size: 1rem;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .calendar-header {
      flex-direction: column;
      align-items: flex-start;
    }

    .header-nav {
      width: 100%;
      justify-content: space-between;
    }

    .header-title {
      width: 100%;
      font-size: 1.25rem;
      min-width: auto;
    }

    .view-switcher {
      width: 100%;
      justify-content: space-around;
    }

    .view-btn {
      flex: 1;
    }
  }

  @media (max-width: 640px) {
    .calendar-header {
      padding: 0.75rem;
    }

    .calendar-content {
      padding: 0.75rem;
    }

    .header-title {
      font-size: 1.125rem;
    }
  }

  /* Reduce motion for accessibility */
  @media (prefers-reduced-motion: reduce) {
    .view-btn {
      transition: none;
    }
  }
</style>
