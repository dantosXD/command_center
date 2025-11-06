<script lang="ts">
  import { domainStore, selectedDomain } from '$lib/stores/domain';
  import { onMount, onDestroy } from 'svelte';

  let open = false;
  let buttonElement: HTMLButtonElement;
  let dropdownElement: HTMLDivElement;
  let selectedIndex = -1;

  $: options = [{ id: null, name: 'All Domains', color: null }, ...$domainStore.domains];
  $: loading = $domainStore.loading;

  function toggle() {
    open = !open;
    if (open) {
      selectedIndex = options.findIndex((opt) => opt.id === $domainStore.selectedId);
    }
  }

  function select(id: string | null) {
    domainStore.setSelectedId(id);
    close();
    buttonElement?.focus(); // Return focus to button
  }

  function close() {
    open = false;
    selectedIndex = -1;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (!open) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        toggle();
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        close();
        buttonElement?.focus();
        break;
      case 'ArrowDown':
        e.preventDefault();
        selectedIndex = (selectedIndex + 1) % options.length;
        break;
      case 'ArrowUp':
        e.preventDefault();
        selectedIndex = selectedIndex <= 0 ? options.length - 1 : selectedIndex - 1;
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < options.length) {
          select(options[selectedIndex].id);
        }
        break;
      case 'Home':
        e.preventDefault();
        selectedIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        selectedIndex = options.length - 1;
        break;
    }
  }

  function handleClickOutside(e: MouseEvent) {
    if (
      open &&
      dropdownElement &&
      !dropdownElement.contains(e.target as Node) &&
      !buttonElement.contains(e.target as Node)
    ) {
      close();
    }
  }

  onMount(() => {
    document.addEventListener('click', handleClickOutside);
  });

  onDestroy(() => {
    document.removeEventListener('click', handleClickOutside);
  });
</script>

<div class="relative">
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <button
    bind:this={buttonElement}
    type="button"
    class="flex items-center gap-2 px-3 py-2 border rounded-md text-sm font-medium bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    on:click={toggle}
    on:keydown={handleKeydown}
    aria-expanded={open}
    aria-haspopup="listbox"
    aria-label="Switch domain"
    disabled={loading}
  >
    {#if loading}
      <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span>Loading...</span>
    {:else}
      {#if $selectedDomain}
        <span
          class="w-2 h-2 rounded-full inline-block"
          style="background-color: {$selectedDomain.color || '#3b82f6'}"
          aria-hidden="true"
        ></span>
        <span>{$selectedDomain.name}</span>
      {:else}
        <span>All Domains</span>
      {/if}
      <svg
        class="w-4 h-4 transition-transform {open ? 'rotate-180' : ''}"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    {/if}
  </button>

  {#if open}
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
      bind:this={dropdownElement}
      class="absolute top-full left-0 mt-1 w-56 bg-white border rounded-md shadow-lg z-10"
      on:keydown={handleKeydown}
    >
      <ul role="listbox" class="py-1 max-h-64 overflow-y-auto" aria-label="Domain options">
        {#each options as option, index (option.id || 'all')}
          <li role="presentation">
            <button
              type="button"
              class="w-full px-3 py-2 text-left text-sm hover:bg-blue-50 flex items-center gap-2 {selectedIndex ===
              index
                ? 'bg-blue-100'
                : ''} {option.id === $domainStore.selectedId ? 'font-semibold' : ''}"
              on:click={() => select(option.id)}
              role="option"
              aria-selected={option.id === $domainStore.selectedId}
              tabindex="-1"
            >
              {#if option.color}
                <span
                  class="w-2 h-2 rounded-full"
                  style="background-color: {option.color}"
                  aria-hidden="true"
                ></span>
              {:else}
                <span class="w-2 h-2" aria-hidden="true"></span>
              {/if}
              <span>{option.name}</span>
              {#if option.id === $domainStore.selectedId}
                <svg class="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
              {/if}
            </button>
          </li>
        {/each}
      </ul>
    </div>
  {/if}
</div>
