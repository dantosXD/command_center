<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { hubStore } from '$lib/stores/hubStore';
  import { supabase } from '$lib/supabaseClient';

  let query = '';
  let loading = false;
  let error: string | null = null;
  let results: any[] = [];
  let open = false;

  const dispatch = createEventDispatcher();

  // Open/close handling
  $: if ($hubStore.searchOpen !== open) open = $hubStore.searchOpen;

  async function performSearch() {
    if (!query.trim()) {
      results = [];
      hubStore.setSearchOpen(false);
      return;
    }
    loading = true;
    error = null;
    try {
      const { data, error: err } = await supabase.rpc('hub_search', {
        p_query: query,
        p_domain_id: $hubStore.domainId,
        p_limit: 50,
      });
      if (err) throw err;
      results = (data as any[]) || [];
    } catch (e: any) {
      error = e.message || 'Search failed';
    } finally {
      loading = false;
    }
  }

  function close() {
    hubStore.setSearchOpen(false);
    query = '';
    results = [];
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      close();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      performSearch();
    }
  }

  function onSelect(item: any) {
    // Optional: navigate to item detail or highlight it
    dispatch('select', { item });
    close();
  }

  function openQuickAdd() {
    hubStore.setSearchOpen(false);
    hubStore.setQuickAddOpen(true);
  }
</script>

{#if open}
  <div
    class="fixed inset-0 z-50 flex items-start justify-center pt-16"
    role="region"
    aria-label="Search and filters"
  >
    <div class="fixed inset-0 bg-black/20" on:click={close} />
    <div class="relative w-full max-w-2xl bg-background border rounded-lg shadow-lg p-6 space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">Search</h2>
        <button type="button" class="btn btn-ghost btn-sm" on:click={close}>Close</button>
      </div>

      <form on:submit|preventDefault={performSearch}>
        <label class="block">
          <span class="sr-only">Search or quick-add</span>
          <input
            type="text"
            bind:value={query}
            placeholder="Search or type to quick-add"
            class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            on:keydown={onKeydown}
            disabled={loading}
            autofocus
          />
        </label>
        <div class="flex gap-2 mt-2">
          <button type="submit" class="btn btn-primary" disabled={loading || !query.trim()}>
            {#if loading}Searching…{:else}Search{/if}
          </button>
          <button type="button" class="btn btn-ghost" on:click={openQuickAdd}>
            Quick Add
          </button>
        </div>
      </form>

      {#if error}
        <p class="text-error text-sm">{error}</p>
      {/if}

      {#if results.length > 0}
        <div class="space-y-2 max-h-64 overflow-y-auto">
          {#each results as item}
            <button
              type="button"
              class="w-full text-left p-3 rounded border hover:bg-accent transition-colors flex items-start gap-3"
              on:click={() => onSelect(item)}
            >
              <div class="flex-1 min-w-0">
                <p class="font-medium truncate">{item.title}</p>
                <p class="text-sm text-muted-foreground">{item.domain_name}</p>
              </div>
              <span class="text-xs px-2 py-1 rounded bg-secondary">{item.type}</span>
            </button>
          {/each}
        </div>
      {:else if query && !loading}
        <p class="text-muted-foreground text-sm">No results.</p>
      {/if}
    </div>
  </div>
{/if}
