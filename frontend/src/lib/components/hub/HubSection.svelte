<script lang="ts">
  import { todayItems, upcomingItems } from '$lib/stores/hubStore';
  import { createEventDispatcher } from 'svelte';

  export let section: 'Today' | 'Upcoming';

  const dispatch = createEventDispatcher();

  $: items = section === 'Today' ? $todayItems : $upcomingItems;

  // Group by domain
  $: grouped = items.reduce(
    (acc, item) => {
      const key = item.domain_name || 'No Domain';
      if (!acc[key]) acc[key] = { domain: item, items: [] };
      acc[key].items.push(item);
      return acc;
    },
    {} as Record<string, { domain: any; items: any[] }>
  );

  function formatTime(dateStr: string | null) {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
    } catch (e) {
      console.error('Error formatting time:', e);
      return '';
    }
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    } catch (e) {
      console.error('Error formatting date:', e);
      return '';
    }
  }

  function itemKey(item: any) {
    return `${item.type}-${item.id}`;
  }

  function handleItemClick(item: any) {
    dispatch('itemClick', { item });
  }

  function handleItemKeydown(e: KeyboardEvent, item: any) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleItemClick(item);
    }
  }

  function getPriorityLabel(priority: number | null | undefined): string {
    if (priority === null || priority === undefined) return '';
    return `Priority ${priority}`;
  }

  function getStatusLabel(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ');
  }
</script>

<section aria-labelledby="hub-section-{section}">
  <h2 id="hub-section-{section}" class="text-lg font-semibold mb-4">{section}</h2>
  {#if Object.keys(grouped).length === 0}
    <p class="text-gray-600">No {section.toLowerCase()} items.</p>
  {:else}
    <div class="space-y-6">
      {#each Object.entries(grouped) as [domainName, { domain, items }] (domainName)}
        <div class="space-y-2">
          <div class="flex items-center gap-2 text-sm font-medium text-gray-600">
            <span
              class="w-2 h-2 rounded-full"
              style="background-color: {domain.domain_color || '#3b82f6'}"
              aria-hidden="true"
            ></span>
            <span>{domainName}</span>
          </div>
          <ul class="space-y-2" data-domain-id={domain.domain_id} role="list">
            {#each items as item (itemKey(item))}
              <li role="listitem">
                <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                <button
                  type="button"
                  class="w-full p-3 rounded-md border hover:bg-blue-50 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors text-left"
                  data-testid="hub-item"
                  data-type={item.type}
                  data-id={item.id}
                  on:click={() => handleItemClick(item)}
                  on:keydown={(e) => handleItemKeydown(e, item)}
                  aria-label="{item.type === 'task' ? 'Task' : 'Event'}: {item.title}"
                >
                  <div class="flex items-start justify-between gap-2">
                    <div class="flex-1 min-w-0">
                      <p class="font-medium truncate">{item.title}</p>
                      {#if item.description}
                        <p class="text-sm text-gray-600 line-clamp-2 mt-1">{item.description}</p>
                      {/if}
                      <div class="text-xs text-gray-500 mt-2 flex flex-wrap gap-2">
                        {#if item.type === 'task' && item.status}
                          <span
                            class="inline-flex items-center px-2 py-0.5 rounded bg-gray-100"
                            aria-label="Status: {getStatusLabel(item.status)}"
                          >
                            {getStatusLabel(item.status)}
                          </span>
                        {/if}
                        {#if item.type === 'event' && item.starts_at && item.ends_at}
                          <span aria-label="Time: {formatTime(item.starts_at)} to {formatTime(item.ends_at)}">
                            {formatTime(item.starts_at)}–{formatTime(item.ends_at)}
                          </span>
                          <span aria-label="Date: {formatDate(item.starts_at)}">
                            {formatDate(item.starts_at)}
                          </span>
                        {/if}
                        {#if item.type === 'task' && item.due_at}
                          <span aria-label="Due: {formatDate(item.due_at)} at {formatTime(item.due_at)}">
                            Due {formatDate(item.due_at)}
                            {#if formatTime(item.due_at)}
                              {formatTime(item.due_at)}
                            {/if}
                          </span>
                        {/if}
                      </div>
                    </div>
                    <div class="flex items-center gap-1 flex-shrink-0">
                      {#if item.type === 'task' && item.priority !== undefined && item.priority !== null}
                        <span
                          class="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800 font-medium"
                          aria-label={getPriorityLabel(item.priority)}
                        >
                          P{item.priority}
                        </span>
                      {/if}
                    </div>
                  </div>
                </button>
              </li>
            {/each}
          </ul>
        </div>
      {/each}
    </div>
  {/if}
</section>
