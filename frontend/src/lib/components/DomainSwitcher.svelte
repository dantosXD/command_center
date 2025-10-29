<script lang="ts">
  import { domainStore, selectedDomain } from '$lib/stores/domain';

  let open = false;

  function toggle() {
    open = !open;
  }

  async function select(id: string | null) {
    domainStore.setSelectedId(id);
    open = false;
  }
</script>

<div class="relative">
  <button
    type="button"
    class="flex items-center gap-2 px-3 py-2 border rounded-md text-sm font-medium bg-background hover:bg-accent transition-colors"
    on:click={toggle}
    aria-expanded={open}
    aria-haspopup="listbox"
    aria-label="Switch domain"
  >
    {#if $selectedDomain}
      <span class="w-2 h-2 rounded-full inline-block" style="background-color: {$selectedDomain.color || 'currentColor'}"></span>
      <span>{$selectedDomain.name}</span>
    {:else}
      <span>All Domains</span>
    {/if}
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
    </svg>
  </button>

  {#if open}
    <div class="absolute top-full left-0 mt-1 w-56 bg-background border rounded-md shadow-lg z-10">
      <ul role="listbox" class="py-1">
        <li>
          <button
            type="button"
            class="w-full px-3 py-2 text-left text-sm hover:bg-accent"
            on:click={() => select(null)}
          >
            All Domains
          </button>
        </li>
        {#each $domainStore.domains as domain (domain.id)}
          <li>
            <button
              type="button"
              class="w-full px-3 py-2 text-left text-sm hover:bg-accent flex items-center gap-2"
              on:click={() => select(domain.id)}
              role="option"
              aria-selected={$domainStore.selectedId === domain.id}
            >
              <span
                class="w-2 h-2 rounded-full"
                style="background-color: {domain.color || 'currentColor'}"
              ></span>
              <span>{domain.name}</span>
            </button>
          </li>
        {/each}
      </ul>
    </div>
  {/if}
</div>
