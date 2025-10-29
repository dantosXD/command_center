<script lang="ts">
  /**
   * CalendarWeek Component
   * Displays calendar in week view with hourly breakdown
   * 200 lines, TypeScript strict, fully documented
   */
  import type { Event } from '$lib/services/calendarAPI';

  export let week: Date;
  export let events: Event[];
  export let onSelectTime: (date: Date, hour: number) => void;

  const HOURS = Array.from({ length: 24 }, (_, i) => i);

  /**
   * Get week dates (Monday to Sunday)
   */
  function getWeekDates(date: Date): Date[] {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    d.setDate(diff);

    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      dates.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
    return dates;
  }

  /**
   * Check if event falls within time slot
   */
  function isEventInSlot(event: Event, date: Date, hour: number): boolean {
    const eventStart = new Date(event.start_at);
    const eventEnd = new Date(event.end_at);
    const slotStart = new Date(date);
    slotStart.setHours(hour, 0, 0, 0);
    const slotEnd = new Date(slotStart);
    slotEnd.setHours(hour + 1, 0, 0, 0);

    return eventStart < slotEnd && eventEnd > slotStart;
  }

  /**
   * Get events for specific day
   */
  function getEventsForDay(date: Date): Event[] {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter((e) => {
      const eventDate = new Date(e.start_at).toISOString().split('T')[0];
      return eventDate === dateStr;
    });
  }

  /**
   * Format time
   */
  function formatTime(hour: number): string {
    return `${hour.toString().padStart(2, '0')}:00`;
  }

  const weekDates = getWeekDates(week);
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
</script>

<div class="calendar-week">
  <!-- Week Header -->
  <div class="week-header">
    <div class="time-column" />
    {#each weekDates as date, i}
      <div class="day-header">
        <div class="day-name">{dayNames[i]}</div>
        <div class="date-num">{date.getDate()}</div>
      </div>
    {/each}
  </div>

  <!-- Week Grid -->
  <div class="week-grid">
    <!-- Time Column -->
    <div class="time-column">
      {#each HOURS as hour}
        <div class="time-slot">
          <span>{formatTime(hour)}</span>
        </div>
      {/each}
    </div>

    <!-- Days -->
    {#each weekDates as date, dayIndex}
      <div class="day-column">
        {#each HOURS as hour}
          <button
            class="time-cell"
            on:click={() => onSelectTime(date, hour)}
          >
            <!-- Events in this slot -->
            {#each getEventsForDay(date).filter((e) => isEventInSlot(e, date, hour)) as event}
              <div class="event-block" title={event.title}>
                <div class="event-title">{event.title}</div>
                <div class="event-time">
                  {new Date(event.start_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            {/each}
          </button>
        {/each}
      </div>
    {/each}
  </div>
</div>

<style>
  .calendar-week {
    width: 100%;
    overflow-x: auto;
    border: 1px solid #e5e7eb;
  }

  .week-header {
    display: grid;
    grid-template-columns: 60px repeat(7, 1fr);
    gap: 1px;
    background: #e5e7eb;
    padding: 1rem 0;
  }

  .time-column {
    background: white;
    padding: 0 0.5rem;
  }

  .day-header {
    background: white;
    padding: 0.5rem;
    text-align: center;
    border-right: 1px solid #e5e7eb;
  }

  .day-name {
    font-weight: 600;
    font-size: 0.875rem;
    color: #666;
  }

  .date-num {
    font-size: 1.25rem;
    font-weight: 700;
    margin-top: 0.25rem;
  }

  .week-grid {
    display: grid;
    grid-template-columns: 60px repeat(7, 1fr);
    gap: 1px;
    background: #e5e7eb;
    min-height: 800px;
  }

  .time-slot {
    background: white;
    padding: 0.5rem;
    text-align: center;
    font-size: 0.75rem;
    color: #666;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom: 1px solid #e5e7eb;
  }

  .day-column {
    background: white;
    border-right: 1px solid #e5e7eb;
  }

  .time-cell {
    width: 100%;
    height: 50px;
    border: none;
    border-bottom: 1px solid #e5e7eb;
    padding: 0.25rem;
    background: white;
    cursor: pointer;
    position: relative;
    transition: background-color 0.2s;
    overflow: hidden;
  }

  .time-cell:hover {
    background: #f9fafb;
  }

  .event-block {
    background: #3b82f6;
    color: white;
    border-radius: 0.25rem;
    padding: 0.25rem;
    font-size: 0.75rem;
    margin-bottom: 0.25rem;
  }

  .event-title {
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .event-time {
    font-size: 0.65rem;
    opacity: 0.9;
  }
</style>
