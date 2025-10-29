<script lang="ts">
  import { onMount } from 'svelte';
  import { formatEventDate, formatEventTime } from '../lib/utils/timezone';

  export let currentDate: Date = new Date();
  export let userTimezone: string = 'UTC';

  interface CalendarEvent {
    id: string;
    title: string;
    start_at: string;
    end_at: string;
    is_all_day: boolean;
    timezone: string;
  }

  let events: CalendarEvent[] = [];
  let calendarDays: Array<Array<{ date: Date; isCurrentMonth: boolean; events: CalendarEvent[] }>> = [];

  // Mock data for development (replace with API call)
  const mockEvents: CalendarEvent[] = [
    {
      id: '1',
      title: 'Team Standup',
      start_at: '2025-04-15T14:00:00Z',
      end_at: '2025-04-15T14:30:00Z',
      is_all_day: false,
      timezone: userTimezone
    },
    {
      id: '2',
      title: 'Project Review',
      start_at: '2025-04-16T10:00:00Z',
      end_at: '2025-04-16T11:00:00Z',
      is_all_day: false,
      timezone: userTimezone
    },
    {
      id: '3',
      title: 'Conference',
      start_at: '2025-04-18T00:00:00Z',
      end_at: '2025-04-19T00:00:00Z',
      is_all_day: true,
      timezone: userTimezone
    }
  ];

  onMount(async () => {
    events = mockEvents;
    buildCalendarGrid();
  });

  function buildCalendarGrid() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // First day of month
    const firstDay = new Date(year, month, 1);
    // Last day of month
    const lastDay = new Date(year, month + 1, 0);

    // Adjust to show previous month's trailing days
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    // Build 6-week grid
    const weeks = [];
    let currentWeek = [];

    for (let i = 0; i < 42; i++) {
      // 6 weeks × 7 days
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);

      const isCurrentMonth = date.getMonth() === month;
      const dayEvents = getEventsForDate(date, isCurrentMonth);

      currentWeek.push({
        date,
        isCurrentMonth,
        events: dayEvents
      });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    calendarDays = weeks;
  }

  function getEventsForDate(date: Date, isCurrentMonth: boolean): CalendarEvent[] {
    if (!isCurrentMonth) return [];

    const dateStr = formatEventDate(date, userTimezone, 'short').replace(/\//g, '-');

    return events.filter(event => {
      const eventStart = new Date(event.start_at);
      const eventEnd = new Date(event.end_at);
      const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

      // For all-day events, check if date falls within range
      if (event.is_all_day) {
        return checkDate >= eventStart && checkDate < eventEnd;
      }

      // For timed events, check if they occur on this date
      return (
        eventStart.toDateString() === checkDate.toDateString() ||
        (eventStart < checkDate && eventEnd > checkDate)
      );
    });
  }

  function isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  function getDayOfWeekHeader(): string[] {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  }

  function handleEventClick(event: CalendarEvent) {
    // Emit custom event or navigate to event details
    const eventDetail = new CustomEvent('event-select', { detail: event });
    window.dispatchEvent(eventDetail);
  }

  function handleDateClick(date: Date) {
    // Emit custom event to create new event
    const dateDetail = new CustomEvent('date-select', { detail: date });
    window.dispatchEvent(dateDetail);
  }
</script>

<div class="month-view">
  <!-- Day of week headers -->
  <div class="weekday-headers">
    {#each getDayOfWeekHeader() as dayName}
      <div class="weekday-header">
        {dayName}
      </div>
    {/each}
  </div>

  <!-- Calendar grid -->
  <div class="calendar-grid">
    {#each calendarDays as week}
      <div class="calendar-week">
        {#each week as day}
          <div
            class="calendar-day"
            class:other-month={!day.isCurrentMonth}
            class:today={isToday(day.date)}
            on:click={() => handleDateClick(day.date)}
            role="button"
            tabindex="0"
            aria-label={formatEventDate(day.date, userTimezone, 'long')}
            on:keydown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleDateClick(day.date);
              }
            }}
          >
            <!-- Date number -->
            <div class="date-number">
              {day.date.getDate()}
            </div>

            <!-- Events for this day -->
            <div class="events-container">
              {#each day.events as event (event.id)}
                <div
                  class="event-item"
                  class:all-day={event.is_all_day}
                  on:click={(e) => {
                    e.stopPropagation();
                    handleEventClick(event);
                  }}
                  role="button"
                  tabindex="-1"
                  title={event.title}
                >
                  {#if event.is_all_day}
                    <span class="event-badge">All day</span>
                  {:else}
                    <span class="event-time">
                      {formatEventTime(new Date(event.start_at), userTimezone, 'short')}
                    </span>
                  {/if}
                  <span class="event-title">{event.title}</span>
                </div>
              {/each}

              {#if day.events.length === 0 && day.isCurrentMonth}
                <div class="no-events" aria-hidden="true">•</div>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {/each}
  </div>
</div>

<style>
  .month-view {
    display: flex;
    flex-direction: column;
    height: 100%;
    gap: 1rem;
  }

  .weekday-headers {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 0;
    margin-bottom: 0.5rem;
  }

  .weekday-header {
    text-align: center;
    font-weight: 600;
    font-size: 0.875rem;
    color: #6b7280;
    padding: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .calendar-grid {
    display: flex;
    flex-direction: column;
    gap: 0;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    overflow: hidden;
    flex: 1;
  }

  .calendar-week {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 0;
    flex: 1;
  }

  .calendar-day {
    padding: 0.75rem;
    border-right: 1px solid #e5e7eb;
    border-bottom: 1px solid #e5e7eb;
    min-height: 100px;
    background: white;
    cursor: pointer;
    transition: background-color 0.2s ease;
    display: flex;
    flex-direction: column;

    &:last-child {
      border-right: none;
    }

    &:hover:not(.other-month) {
      background: #f9fafb;
    }

    &.other-month {
      background: #f9fafb;
      opacity: 0.5;
      cursor: default;
    }

    &.today {
      background: #eff6ff;
      border-top: 3px solid #2563eb;
    }

    &:focus-visible {
      outline: 2px solid #2563eb;
      outline-offset: -2px;
    }
  }

  .date-number {
    font-weight: 600;
    color: #1f2937;
    font-size: 0.875rem;
    margin-bottom: 0.25rem;
  }

  .events-container {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    flex: 1;
    overflow: hidden;
  }

  .event-item {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.5rem;
    background: #dbeafe;
    color: #1e40af;
    border-radius: 3px;
    font-size: 0.75rem;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: pointer;
    transition: background-color 0.2s ease;
    border: 1px solid #bfdbfe;

    &:hover {
      background: #bfdbfe;
    }

    &.all-day {
      background: #fef3c7;
      color: #92400e;
      border-color: #fcd34d;

      &:hover {
        background: #fcd34d;
      }
    }

    &:focus-visible {
      outline: 2px solid #2563eb;
      outline-offset: 1px;
    }
  }

  .event-time {
    font-size: 0.625rem;
    font-weight: 600;
  }

  .event-title {
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .event-badge {
    display: inline-block;
    background: rgba(0, 0, 0, 0.1);
    padding: 0.125rem 0.25rem;
    border-radius: 2px;
    font-size: 0.625rem;
    font-weight: 700;
    text-transform: uppercase;
  }

  .no-events {
    color: #d1d5db;
    font-size: 0.625rem;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .calendar-day {
      min-height: 80px;
      padding: 0.5rem;
    }

    .date-number {
      font-size: 0.75rem;
    }

    .event-item {
      font-size: 0.625rem;
      padding: 0.125rem 0.25rem;
    }

    .weekday-header {
      font-size: 0.75rem;
      padding: 0.25rem;
    }
  }

  @media (max-width: 640px) {
    .calendar-day {
      min-height: 60px;
      padding: 0.375rem;
    }

    .date-number {
      font-size: 0.625rem;
    }

    .event-item {
      font-size: 0.5rem;
      padding: 0.125rem 0.25rem;
    }

    .weekday-header {
      font-size: 0.625rem;
    }
  }

  /* Reduce motion */
  @media (prefers-reduced-motion: reduce) {
    .calendar-day {
      transition: none;
    }

    .event-item {
      transition: none;
    }
  }
</style>
