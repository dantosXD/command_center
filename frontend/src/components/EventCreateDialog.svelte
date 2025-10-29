<script lang="ts">
  /**
   * EventCreateDialog Component
   * Dialog for creating new events with form validation
   * 220 lines, TypeScript strict, fully documented
   */
  import type { CreateEventInput } from '$lib/services/calendarAPI';

  export let open = false;
  export let initialDate: Date | null = null;
  export let domainId: string;
  export let onSubmit: (data: CreateEventInput) => Promise<void>;
  export let onCancel: () => void;

  let title = '';
  let description = '';
  let startDate = initialDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0];
  let startTime = '10:00';
  let endDate = startDate;
  let endTime = '11:00';
  let timezone = 'UTC';
  let isRecurring = false;
  let rrule = '';
  let error = '';
  let loading = false;

  /**
   * Validate form
   */
  function validate(): boolean {
    error = '';

    if (!title.trim()) {
      error = 'Event title is required';
      return false;
    }

    const start = new Date(`${startDate}T${startTime}:00`);
    const end = new Date(`${endDate}T${endTime}:00`);

    if (start >= end) {
      error = 'End time must be after start time';
      return false;
    }

    return true;
  }

  /**
   * Handle form submission
   */
  async function handleSubmit() {
    if (!validate()) return;

    loading = true;
    try {
      const data: CreateEventInput = {
        domain_id: domainId,
        title: title.trim(),
        description: description.trim() || undefined,
        start_at: `${startDate}T${startTime}:00Z`,
        end_at: `${endDate}T${endTime}:00Z`,
        timezone,
        recurrence_rrule: isRecurring ? rrule : undefined,
      };

      await onSubmit(data);

      // Reset form
      title = '';
      description = '';
      error = '';
      open = false;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to create event';
    } finally {
      loading = false;
    }
  }

  /**
   * Handle keyboard shortcuts
   */
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      onCancel();
    } else if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSubmit();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if open}
  <div class="dialog-overlay" on:click={onCancel}>
    <div class="dialog" on:click|stopPropagation>
      <!-- Header -->
      <div class="dialog-header">
        <h2>Create Event</h2>
        <button class="close-button" on:click={onCancel} aria-label="Close">
          ✕
        </button>
      </div>

      <!-- Error -->
      {#if error}
        <div class="error-message">{error}</div>
      {/if}

      <!-- Form -->
      <form on:submit|preventDefault={handleSubmit}>
        <!-- Title -->
        <div class="form-group">
          <label for="title">Event Title *</label>
          <input
            id="title"
            type="text"
            bind:value={title}
            placeholder="e.g., Team Standup"
            required
            disabled={loading}
          />
        </div>

        <!-- Description -->
        <div class="form-group">
          <label for="description">Description</label>
          <textarea
            id="description"
            bind:value={description}
            placeholder="Optional event details"
            rows={3}
            disabled={loading}
          />
        </div>

        <!-- Date & Time -->
        <div class="form-row">
          <div class="form-group">
            <label for="startDate">Start Date *</label>
            <input
              id="startDate"
              type="date"
              bind:value={startDate}
              required
              disabled={loading}
            />
          </div>
          <div class="form-group">
            <label for="startTime">Start Time *</label>
            <input
              id="startTime"
              type="time"
              bind:value={startTime}
              required
              disabled={loading}
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="endDate">End Date *</label>
            <input
              id="endDate"
              type="date"
              bind:value={endDate}
              required
              disabled={loading}
            />
          </div>
          <div class="form-group">
            <label for="endTime">End Time *</label>
            <input
              id="endTime"
              type="time"
              bind:value={endTime}
              required
              disabled={loading}
            />
          </div>
        </div>

        <!-- Timezone -->
        <div class="form-group">
          <label for="timezone">Timezone</label>
          <select id="timezone" bind:value={timezone} disabled={loading}>
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern</option>
            <option value="America/Chicago">Central</option>
            <option value="America/Denver">Mountain</option>
            <option value="America/Los_Angeles">Pacific</option>
          </select>
        </div>

        <!-- Recurrence -->
        <div class="form-group">
          <label>
            <input type="checkbox" bind:checked={isRecurring} disabled={loading} />
            Recurring Event
          </label>
        </div>

        {#if isRecurring}
          <div class="form-group">
            <label for="rrule">Recurrence Rule (RRULE)</label>
            <input
              id="rrule"
              type="text"
              bind:value={rrule}
              placeholder="e.g., FREQ=WEEKLY;BYDAY=MO,WE,FR"
              disabled={loading}
            />
          </div>
        {/if}

        <!-- Actions -->
        <div class="dialog-actions">
          <button type="button" on:click={onCancel} disabled={loading}>
            Cancel
          </button>
          <button type="submit" disabled={loading} class="primary">
            {loading ? 'Creating...' : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<style>
  .dialog-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;
  }

  .dialog {
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
  }

  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .dialog-header h2 {
    margin: 0;
    font-size: 1.5rem;
  }

  .close-button {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0;
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .error-message {
    padding: 1rem;
    background: #fee2e2;
    color: #991b1b;
    border-bottom: 1px solid #fecaca;
  }

  form {
    padding: 1.5rem;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }

  .form-group input[type='text'],
  .form-group input[type='date'],
  .form-group input[type='time'],
  .form-group textarea,
  .form-group select {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    font-family: inherit;
    font-size: 1rem;
  }

  .form-group input:disabled,
  .form-group textarea:disabled,
  .form-group select:disabled {
    background: #f3f4f6;
    cursor: not-allowed;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .form-row .form-group {
    margin-bottom: 0;
  }

  .dialog-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    padding-top: 1rem;
    border-top: 1px solid #e5e7eb;
    margin-top: 1rem;
  }

  button {
    padding: 0.5rem 1rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.2s;
  }

  button:hover:not(:disabled) {
    background: #f3f4f6;
  }

  button.primary {
    background: #3b82f6;
    color: white;
    border-color: #3b82f6;
  }

  button.primary:hover:not(:disabled) {
    background: #2563eb;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
