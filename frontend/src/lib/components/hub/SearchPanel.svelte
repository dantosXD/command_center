<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { hubStore } from '$lib/stores/hubStore';
  import { supabase } from '$lib/supabaseClient';

  let query = '';
  let loading = false;
  let error: string | null = null;
  let results: any[] = [];
  let open = false;
  let inputElement: HTMLInputElement;
  let dialogElement: HTMLDivElement;
  let selectedIndex = -1;

  const dispatch = createEventDispatcher();

  // Open/close handling with focus management
  $: if ($hubStore.searchOpen !== open) {
    open = $hubStore.searchOpen;
    if (open) {
      setTimeout(() => inputElement?.focus(), 100);
      selectedIndex = -1;
    } else {
      query = '';
      results = [];
      error = null;
    }
  }

  async function performSearch() {
    if (!query.trim()) {
      results = [];
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
      selectedIndex = results.length > 0 ? 0 : -1;
    } catch (e: any) {
      error = e.message || 'Search failed';
      console.error('Search error:', e);
    } finally {
      loading = false;
    }
  }

  function close() {
    hubStore.setSearchOpen(false);
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else if (e.key === 'Enter' && !loading) {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        onSelect(results[selectedIndex]);
      } else {
        performSearch();
      }
    } else if (e.key === 'ArrowDown' && results.length > 0) {
      e.preventDefault();
      selectedIndex = (selectedIndex + 1) % results.length;
    } else if (e.key === 'ArrowUp' && results.length > 0) {
      e.preventDefault();
      selectedIndex = selectedIndex <= 0 ? results.length - 1 : selectedIndex - 1;
    } else if (e.key === 'Tab') {
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

  function onSelect(item: any) {
    dispatch('select', { item });
    close();
  }

  function openQuickAdd() {
    hubStore.setSearchOpen(false);
    hubStore.setQuickAddOpen(true);
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
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
    aria-labelledby="search-title"
    on:keydown={onKeydown}
  >
    <!-- Backdrop -->
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
      class="fixed inset-0 bg-black/20"
      on:click={handleBackdropClick}
      aria-label="Close search"
    ></div>

    <!-- Dialog content -->
    <div
      bind:this={dialogElement}
      class="relative w-full max-w-2xl bg-white border rounded-lg shadow-lg p-6 space-y-4"
    >
      <div class="flex items-center justify-between">
        <h2 id="search-title" class="text-lg font-semibold">Search</h2>
        <button
          type="button"
          class="px-3 py-1 text-sm border rounded-md hover:bg-gray-50"
          on:click={close}
          aria-label="Close search dialog"
        >
          Close
        </button>
      </div>

      <form on:submit|preventDefault={performSearch}>
        <label class="block">
          <span class="sr-only">Search tasks and events</span>
          <input
            bind:this={inputElement}
            type="search"
            bind:value={query}
            placeholder="Search tasks and events..."
            class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
            disabled={loading}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? 'search-error' : undefined}
          />
        </label>
        <div class="flex gap-2 mt-2">
          <button
            type="submit"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            disabled={loading || !query.trim()}
            aria-busy={loading}
          >
            {#if loading}
              <span class="flex items-center gap-2">
                <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Searching…
              </span>
            {:else}
              Search
            {/if}
          </button>
          <button
            type="button"
            class="px-4 py-2 border rounded-md hover:bg-gray-50 transition-colors"
            on:click={openQuickAdd}
          >
            Quick Add
          </button>
        </div>
      </form>

      {#if error}
        <div
          id="search-error"
          role="alert"
          aria-live="polite"
          class="text-red-600 text-sm p-2 bg-red-50 rounded border border-red-200"
        >
          {error}
        </div>
      {/if}

      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        class={results.length === 0 && query && !loading ? '' : 'sr-only'}
      >
        {#if results.length > 0}
          Found {results.length} result{results.length === 1 ? '' : 's'}
        {:else if query && !loading}
          No results found
        {/if}
      </div>

      {#if results.length > 0}
        <div class="space-y-2 max-h-96 overflow-y-auto" role="list" aria-label="Search results">
          {#each results as item, index (item.id)}
            <button
              type="button"
              class="w-full text-left p-3 rounded border hover:bg-blue-50 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors flex items-start gap-3 {selectedIndex ===
              index
                ? 'bg-blue-100'
                : ''}"
              on:click={() => onSelect(item)}
              role="listitem"
              aria-label="{item.type}: {item.title} in {item.domain_name}"
            >
              <div class="flex-1 min-w-0">
                <p class="font-medium truncate">{item.title}</p>
                <p class="text-sm text-gray-600">{item.domain_name}</p>
              </div>
              <span
                class="text-xs px-2 py-1 rounded bg-gray-100 text-gray-800 flex-shrink-0"
                aria-label="Type: {item.type}"
              >
                {item.type}
              </span>
            </button>
          {/each}
        </div>
      {:else if query && !loading}
        <p class="text-gray-600 text-sm text-center py-8">No results found for "{query}"</p>
      {/if}
    </div>
  </div>
{/if}
