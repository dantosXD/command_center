<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { hubStore } from '$lib/stores/hubStore';
  import { parseQuickAdd } from '$lib/utils/nlp';
  import { supabase } from '$lib/supabaseClient';

  let open = false;
  let input = '';
  let loading = false;
  let error: string | null = null;

  const dispatch = createEventDispatcher();

  // Open/close handling
  $: if ($hubStore.quickAddOpen !== open) open = $hubStore.quickAddOpen;

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      hubStore.setQuickAddOpen(false);
    } else if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      submit();
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
      hubStore.setQuickAddOpen(false);
      await hubStore.refresh();
      dispatch('added', { type: parsed.type, title: parsed.title });
    } catch (e: any) {
      error = e.message || 'Failed to add item';
    } finally {
      loading = false;
    }
  }

  function close() {
    hubStore.setQuickAddOpen(false);
  }
</script>

{#if open}
  <div
    class="fixed inset-0 z-50 flex items-start justify-center pt-16"
    role="dialog"
    aria-modal="true"
    aria-labelledby="quick-add-title"
  >
    <div
      class="fixed inset-0 bg-black/20"
      role="button"
      tabindex="0"
      on:click={close}
      on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && close()}
    ></div>
    <div class="relative w-full max-w-md bg-background border rounded-lg shadow-lg p-6 space-y-4">
      <h2 id="quick-add-title" class="text-lg font-semibold">Add Task or Event</h2>
      <form on:submit|preventDefault={submit}>
        <label class="block">
          <span class="sr-only">What do you want to do?</span>
          <input
            type="text"
            bind:value={input}
            placeholder="e.g. Submit expense report tomorrow 9am"
            class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            on:keydown={onKeydown}
            disabled={loading}
          />
          <small class="text-muted-foreground">
            Use natural language. Include times or dates, or prefix with @domain.
          </small>
        </label>

        {#if error}
          <p class="text-error text-sm">{error}</p>
        {/if}

        <div class="flex gap-2 justify-end">
          <button type="button" class="btn btn-ghost" on:click={close} disabled={loading}>
            Cancel
          </button>
          <button type="submit" class="btn btn-primary" disabled={loading || !input.trim()}>
            {#if loading}Adding…{:else}Add{/if}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
