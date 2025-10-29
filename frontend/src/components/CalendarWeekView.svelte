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

  interface WeekDay {
    date: Date;
    dayName: string;
    dayNum: number;
    isToday: boolean;
    events: CalendarEvent[];
  }

  let events: CalendarEvent[] = [];
  let weekDays: WeekDay[] = [];
  let currentTime = new Date();
  let hourElements: HTMLDivElement[] = [];

  // Mock data for development
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
      title: 'Design Review',
      start_at: '2025-04-15T15:30:00Z',
      end_at: '2025-04-15T16:30:00Z',
      is_all_day: false,
      timezone: userTimezone
    },
    {
      id: '3',
      title: 'All-day conference',
      start_at: '2025-04-16T00:00:00Z',
      end_at: '2025-04-17T00:00:00Z',
      is_all_day: true,
      timezone: userTimezone
    }
  ];

  onMount(() => {
    events = mockEvents;
    buildWeek();

    // Update current time indicator every minute
    const timer = setInterval(() => {
      currentTime = new Date();
      scrollToCurrentTime();
    }, 60000);

    // Scroll to current time on mount
    setTimeout(scrollToCurrentTime, 100);

    return () => clearInterval(timer);
  });

  function buildWeek() {
    // Get Monday of current week
    const date = new Date(currentDate);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const monday = new Date(date.setDate(diff));

    weekDays = [];
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(monday);
      dayDate.setDate(dayDate.getDate() + i);

      const dayName = dayDate.toLocaleString('en-US', { weekday: 'short', timeZone: userTimezone });
      const dayNum = dayDate.getDate();
      const isToday =
        dayDate.getDate() === new Date().getDate() &&
        dayDate.getMonth() === new Date().getMonth() &&
        dayDate.getFullYear() === new Date().getFullYear();

      const dayEvents = getEventsForDay(dayDate);

      weekDays.push({
        date: dayDate,
        dayName,
        dayNum,
        isToday,
        events: dayEvents
      });
    }
  }

  function getEventsForDay(date: Date): CalendarEvent[] {
    return events.filter(event => {
      const eventStart = new Date(event.start_at);
      const eventEnd = new Date(event.end_at);
      const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

      return eventStart.getTime() <= checkDate.getTime() + 86400000 && eventEnd.getTime() > checkDate.getTime();
    });
  }

  function scrollToCurrentTime() {
    if (hourElements.length === 0) return;

    const now = new Date();
    const hour = now.getHours();
    const element = hourElements[hour];

    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
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

  function getTimePercentage(date: Date): number {
    const { hour, minute } = getEventStartTimeInUserTimezone(date, userTimezone);
    return ((hour * 60 + minute) / (24 * 60)) * 100;
  }

  function getEventHeight(startDate: Date, endDate: Date): number {
    const diffMs = endDate.getTime() - startDate.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return Math.max(diffHours * 60, 30); // Min 30px for visibility
  }

  function handleEventClick(event: CalendarEvent) {
    const eventDetail = new CustomEvent('event-select', { detail: event });
    window.dispatchEvent(eventDetail);
  }

  function handleTimeSlotClick(dayDate: Date, hour: number) {
    const clickDate = new Date(dayDate);
    clickDate.setHours(hour);
    const dateDetail = new CustomEvent('time-select', { detail: clickDate });
    window.dispatchEvent(dateDetail);
  }
</script>

<div class="week-view">
  <!-- All-day events row -->
  <div class="all-day-section">
    <div class="all-day-label">All day</div>
    <div class="all-day-events">
      {#each weekDays as day}
        <div class="all-day-column" aria-label={`${day.dayName} ${day.dayNum}`}>
          {#each day.events.filter(e => e.is_all_day) as event (event.id)}
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
      {/each}
    </div>
  </div>

  <!-- Time grid -->
  <div class="time-grid-wrapper">
    <!-- Time labels -->
    <div class="time-column">
      {#each Array.from({ length: 24 }) as _, i}
        <div class="time-label" bind:this={hourElements[i]}>
          {getHourLabel(i)}
        </div>
      {/each}
    </div>

    <!-- Day columns -->
    <div class="days-grid">
      {#each weekDays as day}
        <div class="day-column" class:today={day.isToday} role="region" aria-label={`${day.dayName} ${day.dayNum}`}>
          <!-- Day header -->
          <div class="day-header">
            <span class="day-name">{day.dayName}</span>
            <span class="day-number">{day.dayNum}</span>
          </div>

          <!-- Hours -->
          <div class="hours-container">
            {#each Array.from({ length: 24 }) as _, hour}
              <div
                class="hour-slot"
                on:click={() => handleTimeSlotClick(day.date, hour)}
                role="button"
                tabindex="0"
                aria-label={`${getHourLabel(hour)} on ${day.dayName}`}
                on:keydown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleTimeSlotClick(day.date, hour);
                  }
                }}
              >
                <!-- Events in this hour -->
                {#each day.events.filter(e => !e.is_all_day) as event (event.id)}
                  {@const startTime = new Date(event.start_at)}
                  {@const endTime = new Date(event.end_at)}
                  {@const { hour: startHour, minute: startMinute } = getEventStartTimeInUserTimezone(startTime, userTimezone)}
                  {#if startHour === hour}
                    <div
                      class="event-block"
                      style="height: {getEventHeight(startTime, endTime)}px; top: {(startMinute / 60) * 60}px"
                      on:click={(e) => {
                        e.stopPropagation();
                        handleEventClick(event);
                      }}
                      role="button"
                      tabindex="-1"
                      title={event.title}
                    >
                      <div class="event-time">
                        {formatEventTime(startTime, userTimezone, 'short')}
                      </div>
                      <div class="event-title">
                        {event.title}
                      </div>
                    </div>
                  {/if}
                {/each}
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>

    <!-- Current time indicator (if today is visible) -->
    {#if weekDays.some(d => d.isToday)}
      {@const todayIndex = weekDays.findIndex(d => d.isToday)}
      {@const currentHour = currentTime.getHours()}
      {@const currentMinute = currentTime.getMinutes()}
      {@const topPercent = ((currentHour * 60 + currentMinute) / (24 * 60)) * 100}
      <div class="current-time-indicator" style="top: {topPercent}%">
        <div class="current-time-line"></div>
      </div>
    {/if}
  </div>
</div>

<style>
  .week-view {
    display: flex;
    flex-direction: column;
    height: 100%;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    overflow: hidden;
    background: white;
  }

  .all-day-section {
    display: flex;
    border-bottom: 1px solid #e5e7eb;
    background: #f9fafb;
  }

  .all-day-label {
    width: 80px;
    padding: 0.75rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    border-right: 1px solid #e5e7eb;
  }

  .all-day-events {
    flex: 1;
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 0;
  }

  .all-day-column {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.5rem;
    border-right: 1px solid #e5e7eb;
    min-height: 60px;

    &:last-child {
      border-right: none;
    }
  }

  .all-day-event {
    background: #fef3c7;
    color: #92400e;
    border: 1px solid #fcd34d;
    border-radius: 3px;
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: background-color 0.2s ease;

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
    position: sticky;
    left: 0;
    z-index: 10;
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

  .days-grid {
    flex: 1;
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 0;
  }

  .day-column {
    display: flex;
    flex-direction: column;
    border-right: 1px solid #e5e7eb;

    &:last-child {
      border-right: none;
    }

    &.today {
      background: #eff6ff;

      .day-header {
        background: #dbeafe;
        color: #1e40af;
      }
    }
  }

  .day-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.75rem 0.5rem;
    border-bottom: 1px solid #e5e7eb;
    background: white;
  }

  .day-name {
    font-size: 0.75rem;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
  }

  .day-number {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
  }

  .hours-container {
    flex: 1;
    position: relative;
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
    left: 2px;
    right: 2px;
    background: #dbeafe;
    border: 1px solid #93c5fd;
    border-radius: 3px;
    padding: 0.25rem;
    overflow: hidden;
    cursor: pointer;
    transition: background-color 0.2s ease;
    z-index: 20;

    &:hover {
      background: #bfdbfe;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
  }

  .event-title {
    font-size: 0.75rem;
    color: #1e40af;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .current-time-indicator {
    position: absolute;
    left: 80px;
    right: 0;
    height: 2px;
    background: #ef4444;
    pointer-events: none;
    z-index: 25;
  }

  .current-time-line {
    position: absolute;
    left: -6px;
    top: -4px;
    width: 12px;
    height: 10px;
    background: #ef4444;
    border-radius: 50%;
  }

  /* Responsive Design - collapse to day view on mobile */
  @media (max-width: 640px) {
    .days-grid {
      grid-template-columns: 1fr;
    }

    .day-column:not(:first-child) {
      display: none;
    }

    .all-day-column:not(:first-child) {
      display: none;
    }

    .all-day-events {
      grid-template-columns: 1fr;
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
