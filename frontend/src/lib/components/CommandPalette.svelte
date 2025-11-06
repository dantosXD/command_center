<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { hubStore } from '$lib/stores/hubStore';
  import { parseQuickAdd } from '$lib/utils/nlp';
  import { supabase } from '$lib/supabaseClient';

  let open = false;
  let input = '';
  let loading = false;
  let error: string | null = null;
  let inputElement: HTMLInputElement;
  let dialogElement: HTMLDivElement;

  const dispatch = createEventDispatcher();

  // Open/close handling with focus management
  $: if ($hubStore.quickAddOpen !== open) {
    open = $hubStore.quickAddOpen;
    if (open) {
      // Focus input when dialog opens
      setTimeout(() => inputElement?.focus(), 100);
    } else {
      // Clear state when closing
      input = '';
      error = null;
    }
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else if (e.key === 'Enter' && input.trim() && !loading) {
      e.preventDefault();
      submit();
    } else if (e.key === 'Tab') {
      // Focus trap: keep focus within dialog
      trapFocus(e);
    }
  }

  function trapFocus(e: KeyboardEvent) {
    if (!dialogElement) return;

    const focusableElements = dialogElement.querySelectorAll(
      'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement?.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement?.focus();
    }
  }

  async function submit() {
    const trimmed = input.trim();
    if (!trimmed) return;
    loading = true;
    error = null;

    try {
      const parsed = parseQuickAdd(trimmed);
      if (!parsed.title) throw new Error('Title is required');

      if (parsed.type === 'task') {
        const { error: err } = await supabase.from('tasks').insert({
          title: parsed.title,
          description: parsed.description || null,
          due_at: parsed.due_at,
          // Resolve domain to ID when domainStore is available; for now use default
        });
        if (err) throw err;
      } else if (parsed.type === 'event') {
        const { error: err } = await supabase.from('events').insert({
          title: parsed.title,
          description: parsed.description || null,
          starts_at: parsed.starts_at,
          ends_at: parsed.ends_at,
        });
        if (err) throw err;
      }

      input = '';
      close();
      await hubStore.refresh();
      dispatch('added', { type: parsed.type, title: parsed.title });
    } catch (e: any) {
      error = e.message || 'Failed to add item';
      console.error('Quick add error:', e);
    } finally {
      loading = false;
    }
  }

  function close() {
    hubStore.setQuickAddOpen(false);
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      close();
    }
  }

  function handleBackdropKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      close();
    }
  }
</script>

{#if open}
  <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
  <div
    class="fixed inset-0 z-50 flex items-start justify-center pt-16"
    role="dialog"
    aria-modal="true"
    aria-labelledby="quick-add-title"
    aria-describedby="quick-add-description"
    on:keydown={onKeydown}
  >
    <!-- Backdrop -->
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
      class="fixed inset-0 bg-black/20"
      on:click={handleBackdropClick}
      aria-label="Close dialog"
    ></div>

    <!-- Dialog content -->
    <div
      bind:this={dialogElement}
      class="relative w-full max-w-md bg-white border rounded-lg shadow-lg p-6 space-y-4"
    >
      <h2 id="quick-add-title" class="text-lg font-semibold">Add Task or Event</h2>
      <p id="quick-add-description" class="sr-only">
        Use natural language to quickly add tasks or events. Include times, dates, or domain prefixes.
      </p>

      <form on:submit|preventDefault={submit}>
        <label class="block">
          <span class="sr-only">What do you want to do?</span>
          <input
            bind:this={inputElement}
            type="text"
            bind:value={input}
            placeholder="e.g. Submit expense report tomorrow 9am"
            class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
            disabled={loading}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? 'quick-add-error' : 'quick-add-hint'}
          />
          <small id="quick-add-hint" class="text-gray-600 text-sm block mt-1">
            Use natural language. Include times or dates, or prefix with @domain.
          </small>
        </label>

        {#if error}
          <div
            id="quick-add-error"
            role="alert"
            aria-live="polite"
            class="text-red-600 text-sm mt-2 p-2 bg-red-50 rounded border border-red-200"
          >
            {error}
          </div>
        {/if}

        <div class="flex gap-2 justify-end mt-4">
          <button
            type="button"
            class="px-4 py-2 border rounded-md hover:bg-gray-50 transition-colors"
            on:click={close}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            disabled={loading || !input.trim()}
            aria-busy={loading}
          >
            {#if loading}
              <span class="flex items-center gap-2">
                <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Adding…
              </span>
            {:else}
              Add
            {/if}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
