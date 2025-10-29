<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Button from './Button.svelte';
  import { formatEventTime, formatEventDate, formatDuration } from '../lib/utils/timezone';

  export let event: any = null;
  export let isOpen = false;
  export let userTimezone: string = 'UTC';

  const dispatch = createEventDispatcher();

  function handleEdit() {
    dispatch('edit', event);
  }

  function handleDelete() {
    if (confirm('Are you sure you want to delete this event?')) {
      dispatch('delete', event.id);
    }
  }

  function handleRsvp(status: 'accepted' | 'declined' | 'tentative') {
    dispatch('rsvp', { eventId: event.id, status });
  }

  function handleExport() {
    dispatch('export', event.id);
  }

  function handleClose() {
    isOpen = false;
    dispatch('close');
  }

  function getDuration(): string {
    if (!event) return '';
    return formatDuration(new Date(event.start_at), new Date(event.end_at), userTimezone);
  }
</script>

{#if isOpen && event}
  <div class="details-panel">
    <div class="panel-header">
      <h2>{event.title}</h2>
      <button class="close-btn" on:click={handleClose} aria-label="Close">✕</button>
    </div>

    <div class="panel-content">
      <!-- Basic Info -->
      <div class="info-section">
        <div class="info-row">
          <span class="label">Date & Time</span>
          <div class="value">
            {#if event.is_all_day}
              <span class="all-day-badge">All day</span>
              <span>{formatEventDate(new Date(event.start_at), userTimezone, 'short')}</span>
            {:else}
              <span>{formatEventDate(new Date(event.start_at), userTimezone, 'long')}</span>
              <span>{formatEventTime(new Date(event.start_at), userTimezone, 'short')} – {formatEventTime(new Date(event.end_at), userTimezone, 'short')}</span>
              <span class="duration">({getDuration()})</span>
            {/if}
          </div>
        </div>

        {#if event.location}
          <div class="info-row">
            <span class="label">Location</span>
            <span class="value">{event.location}</span>
          </div>
        {/if}

        {#if event.description}
          <div class="info-row">
            <span class="label">Description</span>
            <p class="value description">{event.description}</p>
          </div>
        {/if}
      </div>

      <!-- Attendees -->
      {#if event.attendees && event.attendees.length > 0}
        <div class="attendees-section">
          <h3>Attendees</h3>
          <div class="attendees-list">
            {#each event.attendees as attendee}
              <div class="attendee-item">
                <span class="attendee-name">{attendee.user_id}</span>
                <span class="attendee-status" class:accepted={attendee.status === 'accepted'} class:declined={attendee.status === 'declined'} class:tentative={attendee.status === 'tentative'}>
                  {attendee.status}
                </span>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- RSVP Section (if user is attendee) -->
      <div class="rsvp-section">
        <h3>Your Response</h3>
        <div class="rsvp-buttons">
          <Button variant="secondary" size="sm" on:click={() => handleRsvp('accepted')}>✓ Accept</Button>
          <Button variant="secondary" size="sm" on:click={() => handleRsvp('tentative')}>? Maybe</Button>
          <Button variant="secondary" size="sm" on:click={() => handleRsvp('declined')}>✕ Decline</Button>
        </div>
      </div>
    </div>

    <div class="panel-footer">
      <div class="action-buttons">
        <Button variant="secondary" size="sm" on:click={handleExport}>Export</Button>
        <Button variant="secondary" size="sm" on:click={handleEdit}>Edit</Button>
        <Button variant="danger" size="sm" on:click={handleDelete}>Delete</Button>
      </div>
    </div>
  </div>
{/if}

<style>
  .details-panel {
    position: fixed;
    right: 0;
    top: 0;
    bottom: 0;
    width: 400px;
    background: white;
    box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
    z-index: 40;
    display: flex;
    flex-direction: column;
    border-left: 1px solid #e5e7eb;
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .panel-header h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    word-break: break-word;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.5rem;
    flex-shrink: 0;
  }

  .panel-content {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .info-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .info-row {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .label {
    font-weight: 600;
    font-size: 0.875rem;
    color: #6b7280;
    text-transform: uppercase;
  }

  .value {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    color: #1f2937;
    font-size: 0.875rem;
  }

  .description {
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .all-day-badge {
    display: inline-block;
    background: #fef3c7;
    color: #92400e;
    padding: 0.25rem 0.5rem;
    border-radius: 3px;
    font-size: 0.75rem;
    font-weight: 600;
    width: fit-content;
  }

  .duration {
    color: #6b7280;
    font-size: 0.75rem;
  }

  .attendees-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .attendees-section h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
  }

  .attendees-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .attendee-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    background: #f9fafb;
    border-radius: 4px;
    font-size: 0.875rem;
  }

  .attendee-name {
    font-weight: 500;
  }

  .attendee-status {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    padding: 0.25rem 0.5rem;
    border-radius: 3px;
    background: #dbeafe;
    color: #1e40af;

    &.accepted {
      background: #dcfce7;
      color: #166534;
    }

    &.declined {
      background: #fee2e2;
      color: #991b1b;
    }

    &.tentative {
      background: #fef3c7;
      color: #92400e;
    }
  }

  .rsvp-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .rsvp-section h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
  }

  .rsvp-buttons {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .panel-footer {
    padding: 1.5rem;
    border-top: 1px solid #e5e7eb;
    background: #f9fafb;
  }

  .action-buttons {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  @media (max-width: 768px) {
    .details-panel {
      width: 100%;
      top: auto;
      bottom: 0;
      border-left: none;
      border-top: 1px solid #e5e7eb;
      border-radius: 8px 8px 0 0;
    }

    .panel-header {
      flex-direction: column;
      gap: 1rem;
    }

    .close-btn {
      align-self: flex-start;
    }
  }
</style>
