<script lang="ts">
  /**
   * EventDeleteDialog Component
   * Confirmation dialog for deleting events
   * 160 lines
   */
  import type { Event } from '$lib/services/calendarAPI';

  export let open = false;
  export let event: Event | null = null;
  export let onConfirm: () => Promise<void>;
  export let onCancel: () => void;

  let loading = false;
  let error = '';

  async function handleDelete() {
    loading = true;
    error = '';
    try {
      await onConfirm();
      open = false;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to delete event';
    } finally {
      loading = false;
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      onCancel();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if open && event}
  <div class="dialog-overlay" on:click={onCancel}>
    <div class="dialog" on:click|stopPropagation>
      <div class="dialog-header">
        <h2>Delete Event</h2>
        <button class="close-button" on:click={onCancel} aria-label="Close">✕</button>
      </div>

      {#if error}
        <div class="error-message">{error}</div>
      {/if}

      <div class="dialog-body">
        <p>Are you sure you want to delete <strong>{event.title}</strong>?</p>
        <p class="warning">
          This action cannot be undone. Any reminders associated with this event will also be deleted.
        </p>
      </div>

      <div class="dialog-actions">
        <button on:click={onCancel} disabled={loading}>
          Cancel
        </button>
        <button on:click={handleDelete} disabled={loading} class="danger">
          {loading ? 'Deleting...' : 'Delete'}
        </button>
      </div>
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
    max-width: 400px;
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
    font-size: 1.25rem;
  }

  .close-button {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
  }

  .error-message {
    padding: 1rem;
    background: #fee2e2;
    color: #991b1b;
  }

  .dialog-body {
    padding: 1.5rem;
  }

  .dialog-body p {
    margin: 0 0 1rem 0;
    line-height: 1.5;
  }

  .warning {
    color: #dc2626;
    font-size: 0.875rem;
  }

  .dialog-actions {
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

  button:hover:not(:disabled) {
    background: #f3f4f6;
  }

  button.danger {
    background: #dc2626;
    color: white;
    border-color: #dc2626;
  }

  button.danger:hover:not(:disabled) {
    background: #b91c1c;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
