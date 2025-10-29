<script lang="ts">
  import { onMount } from 'svelte';
  import { formatEventDate, formatEventTime, getEventStartTimeInUserTimezone } from '../lib/utils/timezone';

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
  let allDayEvents: CalendarEvent[] = [];
  let timedEvents: CalendarEvent[] = [];
  let currentTime = new Date();
  let hourElements: HTMLDivElement[] = [];

  // Mock data
  const mockEvents: CalendarEvent[] = [
    {
      id: '1',
      title: 'Morning standup',
      start_at: '2025-04-15T13:00:00Z',
      end_at: '2025-04-15T13:30:00Z',
      is_all_day: false,
      timezone: userTimezone
    },
    {
      id: '2',
      title: 'Design review',
      start_at: '2025-04-15T14:30:00Z',
      end_at: '2025-04-15T15:30:00Z',
      is_all_day: false,
      timezone: userTimezone
    },
    {
      id: '3',
      title: 'All-day conference',
      start_at: '2025-04-15T00:00:00Z',
      end_at: '2025-04-16T00:00:00Z',
      is_all_day: true,
      timezone: userTimezone
    }
  ];

  onMount(() => {
    events = mockEvents;
    filterEvents();

    // Update current time every minute
    const timer = setInterval(() => {
      currentTime = new Date();
      scrollToCurrentTime();
    }, 60000);

    setTimeout(scrollToCurrentTime, 100);

    return () => clearInterval(timer);
  });

  function filterEvents() {
    allDayEvents = events.filter(e => e.is_all_day);
    timedEvents = events.filter(e => !e.is_all_day);
  }

  function scrollToCurrentTime() {
    if (hourElements.length === 0) return;

    const now = new Date();
    const hour = now.getHours();
    const element = hourElements[hour];

    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function getHourLabel(hour: number): string {
    return hour === 0
      ? '12 AM'
      : hour < 12
        ? `${hour} AM`
        : hour === 12
          ? '12 PM'
          : `${hour - 12} PM`;
  }

  function getEventHeight(startDate: Date, endDate: Date): number {
    const diffMs = endDate.getTime() - startDate.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return Math.max(diffHours * 60, 40); // Min 40px
  }

  function getEventTop(date: Date): number {
    const { hour, minute } = getEventStartTimeInUserTimezone(date, userTimezone);
    return hour * 60 + minute;
  }

  function handleEventClick(event: CalendarEvent) {
    const eventDetail = new CustomEvent('event-select', { detail: event });
    window.dispatchEvent(eventDetail);
  }

  function handleTimeSlotClick(hour: number) {
    const clickDate = new Date(currentDate);
    clickDate.setHours(hour);
    const dateDetail = new CustomEvent('time-select', { detail: clickDate });
    window.dispatchEvent(dateDetail);
  }

  function getDayTitle(): string {
    return formatEventDate(currentDate, userTimezone, 'long');
  }

  // Calculate current time percentage for indicator
  function getCurrentTimePercentage(): number {
    const hour = currentTime.getHours();
    const minute = currentTime.getMinutes();
    return ((hour * 60 + minute) / (24 * 60)) * 100;
  }
</script>

<div class="day-view">
  <!-- Day header -->
  <div class="day-header">
    <h2 class="day-title">{getDayTitle()}</h2>
  </div>

  <!-- All-day events section -->
  {#if allDayEvents.length > 0}
    <div class="all-day-section">
      <div class="all-day-label">All day</div>
      <div class="all-day-events">
        {#each allDayEvents as event (event.id)}
          <div
            class="all-day-event"
            on:click={() => handleEventClick(event)}
            role="button"
            tabindex="0"
            title={event.title}
            on:keydown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleEventClick(event);
              }
            }}
          >
            {event.title}
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Time grid -->
  <div class="time-grid-wrapper">
    <!-- Time labels -->
    <div class="time-column">
      {#each Array.from({ length: 24 }) as _, hour}
        <div class="time-label" bind:this={hourElements[hour]}>
          {getHourLabel(hour)}
        </div>
      {/each}
    </div>

    <!-- Events container -->
    <div class="events-container">
      <!-- Hour slots -->
      {#each Array.from({ length: 24 }) as _, hour}
        <div
          class="hour-slot"
          on:click={() => handleTimeSlotClick(hour)}
          role="button"
          tabindex="0"
          aria-label={`${getHourLabel(hour)}`}
          on:keydown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleTimeSlotClick(hour);
            }
          }}
        >
          <!-- Events in this hour -->
          {#each timedEvents as event (event.id)}
            {@const startTime = new Date(event.start_at)}
            {@const endTime = new Date(event.end_at)}
            {@const { hour: startHour } = getEventStartTimeInUserTimezone(startTime, userTimezone)}
            {#if startHour === hour}
              <div
                class="event-block"
                style="height: {getEventHeight(startTime, endTime)}px; top: {getEventTop(startTime)}px"
                on:click={(e) => {
                  e.stopPropagation();
                  handleEventClick(event);
                }}
                role="button"
                tabindex="-1"
                title={event.title}
              >
                <div class="event-time">
                  {formatEventTime(startTime, userTimezone, 'short')} –
                  {formatEventTime(endTime, userTimezone, 'short')}
                </div>
                <div class="event-title">
                  {event.title}
                </div>
              </div>
            {/if}
          {/each}
        </div>
      {/each}

      <!-- Current time indicator -->
      <div class="current-time-indicator" style="top: {getCurrentTimePercentage()}%">
        <div class="current-time-dot"></div>
        <div class="current-time-line"></div>
      </div>
    </div>
  </div>
</div>

<style>
  .day-view {
    display: flex;
    flex-direction: column;
    height: 100%;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    overflow: hidden;
    background: white;
  }

  .day-header {
    padding: 1rem;
    border-bottom: 1px solid #e5e7eb;
    background: #f9fafb;
  }

  .day-title {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: #1f2937;
  }

  .all-day-section {
    display: flex;
    gap: 0;
    border-bottom: 1px solid #e5e7eb;
    background: #f9fafb;
    padding: 0.5rem;
  }

  .all-day-label {
    width: 80px;
    flex-shrink: 0;
    font-size: 0.75rem;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    padding: 0.5rem;
  }

  .all-day-events {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .all-day-event {
    background: #fef3c7;
    color: #92400e;
    border: 1px solid #fcd34d;
    border-radius: 3px;
    padding: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &:hover {
      background: #fcd34d;
    }

    &:focus-visible {
      outline: 2px solid #2563eb;
      outline-offset: 1px;
    }
  }

  .time-grid-wrapper {
    flex: 1;
    display: flex;
    overflow: auto;
    position: relative;
  }

  .time-column {
    width: 80px;
    border-right: 1px solid #e5e7eb;
    background: #f9fafb;
    flex-shrink: 0;
  }

  .time-label {
    height: 60px;
    padding: 0.5rem;
    text-align: right;
    font-size: 0.75rem;
    color: #6b7280;
    font-weight: 500;
    border-bottom: 1px solid #e5e7eb;
  }

  .events-container {
    flex: 1;
    position: relative;
    background: white;
  }

  .hour-slot {
    height: 60px;
    border-bottom: 1px solid #e5e7eb;
    position: relative;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background: #f3f4f6;
    }

    &:focus-visible {
      outline: 2px solid #2563eb;
      outline-offset: -2px;
    }

    &:last-child {
      border-bottom: none;
    }
  }

  .event-block {
    position: absolute;
    left: 4px;
    right: 4px;
    background: #dbeafe;
    border: 1px solid #93c5fd;
    border-radius: 4px;
    padding: 0.375rem;
    overflow: hidden;
    cursor: pointer;
    transition: box-shadow 0.2s ease;
    z-index: 20;

    &:hover {
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      background: #bfdbfe;
    }

    &:focus-visible {
      outline: 2px solid #2563eb;
      outline-offset: 1px;
    }
  }

  .event-time {
    font-size: 0.625rem;
    font-weight: 600;
    color: #1e40af;
    white-space: nowrap;
  }

  .event-title {
    font-size: 0.875rem;
    color: #1e40af;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .current-time-indicator {
    position: absolute;
    left: 80px;
    right: 0;
    height: 2px;
    pointer-events: none;
    z-index: 25;
  }

  .current-time-line {
    width: 100%;
    height: 2px;
    background: #ef4444;
  }

  .current-time-dot {
    position: absolute;
    left: -8px;
    top: -5px;
    width: 12px;
    height: 12px;
    background: #ef4444;
    border-radius: 50%;
    border: 2px solid white;
    box-shadow: 0 0 0 2px #ef4444;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .day-title {
      font-size: 1.25rem;
    }

    .time-label {
      font-size: 0.625rem;
    }

    .event-time {
      font-size: 0.5rem;
    }

    .event-title {
      font-size: 0.75rem;
    }
  }

  @media (max-width: 640px) {
    .all-day-label {
      width: 60px;
      font-size: 0.625rem;
    }

    .time-column {
      width: 60px;
    }

    .time-label {
      padding: 0.375rem;
      height: 50px;
    }

    .hour-slot {
      height: 50px;
    }

    .event-block {
      left: 2px;
      right: 2px;
      padding: 0.25rem;
    }

    .day-title {
      font-size: 1rem;
    }
  }

  /* Reduce motion */
  @media (prefers-reduced-motion: reduce) {
    .hour-slot {
      transition: none;
    }

    .event-block {
      transition: none;
    }

    .all-day-event {
      transition: none;
    }
  }
</style>
