<script lang="ts">
  import { onMount } from 'svelte';
  import { domainStore } from '$lib/stores/domain';
  import { hubStore } from '$lib/stores/hubStore';
  import CommandPalette from '$lib/components/CommandPalette.svelte';
  import DomainSwitcher from '$lib/components/DomainSwitcher.svelte';
  import HubSection from '$lib/components/hub/HubSection.svelte';
  import QuickAddWidget from '$lib/components/hub/QuickAddWidget.svelte';
  import SearchPanel from '$lib/components/hub/SearchPanel.svelte';

  onMount(() => {
    domainStore.loadDomains();
    // React to domain changes and refresh hub
    domainStore.subscribe((state) => {
      if (state.selectedId !== undefined) {
        hubStore.setDomain(state.selectedId);
        hubStore.refresh();
      }
    });
  });

  const sections = ['Today', 'Upcoming'];
</script>

<svelte:head>
  <title>Hub – Command Center</title>
</svelte:head>

<main class="mx-auto max-w-5xl p-4 space-y-6">
  <!-- Header with domain switcher and actions -->
  <header class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
    <h1 class="text-2xl font-bold">Hub</h1>
    <div class="flex items-center gap-2">
      <DomainSwitcher />
      <button
        type="button"
        data-testid="search-open"
        class="btn btn-ghost btn-sm"
        aria-label="Search or filter"
        on:click={() => hubStore.setSearchOpen(true)}
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        Search
      </button>
      <button
        type="button"
        data-testid="quick-add-trigger"
        class="btn btn-primary btn-sm"
        aria-label="Add task or event"
        on:click={() => hubStore.setQuickAddOpen(true)}
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Quick Add
      </button>
    </div>
  </header>

  <!-- Content: sections (Today/Upcoming) grouped by time bucket -->
  <section class="space-y-8">
    {#each sections as section (section)}
      <HubSection {section} />
    {:else}
      <p class="text-center text-muted-foreground">No items to display.</p>
    {/each}
  </section>

  <!-- Empty state when no items and no domain selected -->
  {#if $domainStore.domains.length === 0}
    <div class="text-center py-12">
      <p class="text-lg mb-4">Create your first domain to get started.</p>
      <a href="/domains" class="btn btn-primary">Create Domain</a>
    </div>
  {/if}

  <!-- Modals/overlays -->
  {#if $hubStore.searchOpen}
    <SearchPanel />
  {/if}
  {#if $hubStore.quickAddOpen}
    <CommandPalette />
  {/if}
</main>

<style>
  main {
    min-height: 100vh;
  }
</style>
