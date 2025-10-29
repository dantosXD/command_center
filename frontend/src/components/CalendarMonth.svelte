<script lang="ts">
  /**
   * CalendarMonth Component
   * Displays calendar in month grid view
   * 250 lines, TypeScript strict, fully documented
   */
  import type { Event } from '$lib/services/calendarAPI';

  export let month: Date;
  export let events: Event[];
  export let onSelectDate: (date: Date) => void;
  export let onCreateEvent: (date: Date) => void;

  /**
   * Get calendar grid for month (6 weeks x 7 days)
   */
  function getCalendarDays(date: Date): (Date | null)[] {
    const year = date.getFullYear();
    const monthIndex = date.getMonth();

    // First day of month
    const firstDay = new Date(year, monthIndex, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // Move to start of week

    const days: (Date | null)[] = [];
    for (let i = 0; i < 42; i++) {
      days.push(new Date(startDate));
      startDate.setDate(startDate.getDate() + 1);
    }
    return days;
  }

  /**
   * Get events for specific date
   */
  function getEventsForDate(date: Date | null): Event[] {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return events.filter((e) => {
      const eventDate = new Date(e.start_at).toISOString().split('T')[0];
      return eventDate === dateStr;
    });
  }

  /**
   * Format month/year header
   */
  function getMonthHeader(): string {
    return month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  /**
   * Check if date is in current month
   */
  function isCurrentMonth(date: Date | null): boolean {
    if (!date) return false;
    return date.getMonth() === month.getMonth();
  }

  /**
   * Check if date is today
   */
  function isToday(date: Date | null): boolean {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  const monthDays = getCalendarDays(month);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
</script>

<div class="calendar-month">
  <!-- Month Header -->
  <div class="month-header">
    <h2>{getMonthHeader()}</h2>
  </div>

  <!-- Day Names -->
  <div class="weekdays">
    {#each dayNames as day}
      <div class="weekday">{day}</div>
    {/each}
  </div>

  <!-- Calendar Grid -->
  <div class="days-grid">
    {#each monthDays as date}
      <button
        class="day-cell"
        class:other-month={date && !isCurrentMonth(date)}
        class:today={isToday(date)}
        on:click={() => date && onSelectDate(date)}
      >
        <!-- Date Number -->
        <div class="date-number">
          {#if date}{date.getDate()}{/if}
        </div>

        <!-- Event Indicators -->
        <div class="event-indicators">
          {#each getEventsForDate(date).slice(0, 3) as event}
            <div class="event-dot" title={event.title} />
          {/each}
          {#if getEventsForDate(date).length > 3}
            <div class="event-more">+{getEventsForDate(date).length - 3}</div>
          {/if}
        </div>

        <!-- Create Event Button (On Hover) -->
        <button
          class="create-button"
          on:click|stopPropagation={() => date && onCreateEvent(date)}
          title="Create event"
        >
          +
        </button>
      </button>
    {/each}
  </div>
</div>

<style>
  .calendar-month {
    width: 100%;
    padding: 1rem;
  }

  .month-header {
    text-align: center;
    margin-bottom: 1rem;
  }

  .month-header h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
  }

  .weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 1px;
    margin-bottom: 0.5rem;
  }

  .weekday {
    text-align: center;
    font-weight: 600;
    font-size: 0.875rem;
    color: #666;
    padding: 0.5rem;
  }

  .days-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 1px;
    background: #e5e7eb;
    border: 1px solid #e5e7eb;
  }

  .day-cell {
    min-height: 100px;
    padding: 0.5rem;
    background: white;
    border: none;
    cursor: pointer;
    position: relative;
    transition: background-color 0.2s;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .day-cell:hover {
    background-color: #f3f4f6;
  }

  .day-cell.other-month {
    background-color: #f9fafb;
    color: #d1d5db;
  }

  .day-cell.today {
    background-color: #fef3c7;
    border: 2px solid #f59e0b;
  }

  .date-number {
    font-weight: 600;
    font-size: 0.875rem;
  }

  .event-indicators {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
    margin-top: 0.25rem;
  }

  .event-dot {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background: #3b82f6;
  }

  .event-more {
    font-size: 0.75rem;
    color: #3b82f6;
  }

  .create-button {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 50%;
    background: transparent;
    border: none;
    color: #9ca3af;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
  }

  .day-cell:hover .create-button {
    opacity: 1;
    background: #e5e7eb;
  }
</style>
