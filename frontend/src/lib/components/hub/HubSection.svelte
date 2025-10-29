<script lang="ts">
  import { todayItems, upcomingItems } from '$lib/stores/hubStore';

  export let section: 'Today' | 'Upcoming';

  $: items = section === 'Today' ? $todayItems : $upcomingItems;

  // Group by domain
  $: grouped = items.reduce((acc, item) => {
    const key = item.domain_name;
    if (!acc[key]) acc[key] = { domain: item, items: [] };
    acc[key].items.push(item);
    return acc;
  }, {} as Record<string, { domain: any; items: any[] }>);

  function formatTime(dateStr: string | null) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  }

  function itemKey(item: any) {
    return `${item.type}-${item.id}`;
  }
</script>

<section>
  <h2 class="text-lg font-semibold mb-4">{section}</h2>
  {#if Object.keys(grouped).length === 0}
    <p class="text-muted-foreground">No {section.toLowerCase()} items.</p>
  {:else}
    <div class="space-y-6">
      {#each Object.entries(grouped) as [domainName, { domain, items }]}
        <div class="space-y-2">
          <div class="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <span
              class="w-2 h-2 rounded-full"
              style="background-color: {domain.domain_color || 'currentColor'}"
            ></span>
            <span>{domainName}</span>
          </div>
          <ul class="space-y-2" data-domain-id={domain.domain_id}>
            {#each items as item (itemKey(item))}
              <li
                class="p-3 rounded-md border hover:bg-accent transition-colors"
                data-testid="hub-item"
                data-type={item.type}
                data-id={item.id}
              >
                <div class="flex items-start justify-between gap-2">
                  <div class="flex-1 min-w-0">
                    <p class="font-medium truncate">{item.title}</p>
                    {#if item.description}
                      <p class="text-sm text-muted-foreground">{item.description}</p>
                    {/if}
                    <div class="text-xs text-muted-foreground mt-1 space-x-2">
                      {#if item.type === 'task' && item.status}
                        <span>Status: {item.status}</span>
                      {/if}
                      {#if item.type === 'event' && item.starts_at && item.ends_at}
                        <span>{formatTime(item.starts_at)}–{formatTime(item.ends_at)}</span>
                        <span>{formatDate(item.starts_at)}</span>
                      {/if}
                      {#if item.type === 'task' && item.due_at}
                        <span>Due {formatDate(item.due_at)} {formatTime(item.due_at)}</span>
                      {/if}
                    </div>
                  </div>
                  <div class="flex items-center gap-1">
                    {#if item.type === 'task' && item.priority !== undefined && item.priority !== null}
                      <span class="text-xs px-1 py-0.5 rounded bg-secondary">P{item.priority}</span>
                    {/if}
                  </div>
                </div>
              </li>
            {/each}
          </ul>
        </div>
      {/each}
    </div>
  {/if}
</section>
