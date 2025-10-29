<script lang="ts">
  /**
   * EventDetail Component
   * Displays event details in modal
   * 200 lines
   */
  import type { Event } from '$lib/services/calendarAPI';

  export let event: Event | null = null;
  export let onEdit: () => void;
  export let onDelete: () => void;
  export let onClose: () => void;

  function formatDate(isoString: string): string {
    return new Date(isoString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      onClose();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if event}
  <div class="detail-overlay" on:click={onClose}>
    <div class="detail-modal" on:click|stopPropagation>
      <div class="detail-header">
        <h2>{event.title}</h2>
        <button class="close-button" on:click={onClose} aria-label="Close">✕</button>
      </div>

      <div class="detail-body">
        <!-- Date/Time -->
        <div class="detail-section">
          <h3>Date & Time</h3>
          <p>
            <strong>Starts:</strong> {formatDate(event.start_at)}
          </p>
          <p>
            <strong>Ends:</strong> {formatDate(event.end_at)}
          </p>
          {#if event.timezone}
            <p>
              <strong>Timezone:</strong> {event.timezone}
            </p>
          {/if}
        </div>

        <!-- Description -->
        {#if event.description}
          <div class="detail-section">
            <h3>Description</h3>
            <p>{event.description}</p>
          </div>
        {/if}

        <!-- Location -->
        {#if event.location}
          <div class="detail-section">
            <h3>Location</h3>
            <p>{event.location}</p>
          </div>
        {/if}

        <!-- Attendees -->
        {#if event.attendees && event.attendees.length > 0}
          <div class="detail-section">
            <h3>Attendees</h3>
            <ul>
              {#each event.attendees as attendee}
                <li>{attendee}</li>
              {/each}
            </ul>
          </div>
        {/if}

        <!-- Reminders -->
        {#if event.reminders && event.reminders.length > 0}
          <div class="detail-section">
            <h3>Reminders</h3>
            <ul>
              {#each event.reminders as minutes}
                <li>{minutes} minutes before</li>
              {/each}
            </ul>
          </div>
        {/if}

        <!-- Recurrence -->
        {#if event.recurrence_rrule}
          <div class="detail-section">
            <h3>Recurrence</h3>
            <p><code>{event.recurrence_rrule}</code></p>
          </div>
        {/if}
      </div>

      <div class="detail-actions">
        <button on:click={onEdit}>Edit</button>
        <button on:click={onDelete} class="danger">Delete</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .detail-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;
  }

  .detail-modal {
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
  }

  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .detail-header h2 {
    margin: 0;
    font-size: 1.5rem;
  }

  .close-button {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
  }

  .detail-body {
    padding: 1.5rem;
  }

  .detail-section {
    margin-bottom: 1.5rem;
  }

  .detail-section h3 {
    margin: 0 0 0.5rem 0;
    font-size: 0.875rem;
    font-weight: 600;
    color: #666;
    text-transform: uppercase;
  }

  .detail-section p {
    margin: 0.5rem 0;
    line-height: 1.5;
  }

  .detail-section ul {
    margin: 0;
    padding-left: 1.5rem;
  }

  .detail-section li {
    margin: 0.25rem 0;
  }

  code {
    background: #f3f4f6;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-family: monospace;
    font-size: 0.875rem;
  }

  .detail-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    padding: 1rem 1.5rem;
    border-top: 1px solid #e5e7eb;
  }

  button {
    padding: 0.5rem 1rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  button:hover {
    background: #f3f4f6;
  }

  button.danger {
    background: #dc2626;
    color: white;
    border-color: #dc2626;
  }

  button.danger:hover {
    background: #b91c1c;
  }
</style>
