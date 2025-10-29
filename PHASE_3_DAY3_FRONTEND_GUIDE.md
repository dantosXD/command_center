# Phase 3 Day 3: Frontend Implementation Guide (T036-T042)

**Status**: Backend complete ✅ - Frontend ready to implement
**Date**: 2025-10-28
**Duration**: 2-3 hours estimated
**Tasks**: T036-T042 (7 total)

---

## Frontend Tasks Overview

| Task | Component | Type | Status |
|------|-----------|------|--------|
| T036 | Domain selector store | Svelte Store | 🔄 READY |
| T037 | Hub UI page | SvelteKit Page | 🔄 READY |
| T038 | Command palette | Component | 🔄 READY |
| T039 | NLP parser | Utility | 🔄 READY |
| T040 | Realtime store | Svelte Store | 🔄 READY |
| T041 | Search panel | Component | 🔄 READY |
| T042 | Search service | Service/Hook | 🔄 READY |

---

## Recommended Implementation Order

### Step 1: Utilities & Stores (T039, T036, T040)
Build reusable logic and state management first.

### Step 2: Components (T038, T041)
Create UI components that use stores and utilities.

### Step 3: Page Integration (T037)
Wire everything together on the hub page.

### Step 4: Services (T042)
Create service layer for API interactions.

---

## T036: Domain Selection Store

**File**: `frontend/src/lib/stores/domain.ts`

```typescript
import { writable, derived } from 'svelte/store';
import { supabase } from '$lib/supabaseClient';

// Create persistent domain store
function createDomainStore() {
  // Initialize from localStorage
  const stored = typeof window !== 'undefined'
    ? localStorage.getItem('hubSelectedDomain') || 'all'
    : 'all';

  const { subscribe, set, update } = writable<string>(stored);

  return {
    subscribe,
    select: (domainId: string) => {
      localStorage.setItem('hubSelectedDomain', domainId);
      set(domainId);
    },
    reset: () => {
      localStorage.removeItem('hubSelectedDomain');
      set('all');
    },
  };
}

export const selectedDomain = createDomainStore();

// Fetch available domains for dropdown
export async function fetchUserDomains(workspaceId: string) {
  const { data, error } = await supabase
    .from('domains')
    .select('id, name, visibility')
    .eq('workspace_id', workspaceId)
    .order('name');

  if (error) {
    console.error('Failed to fetch domains:', error);
    return [];
  }

  return data || [];
}

// Derived store: check if all domains selected
export const isAllDomains = derived(selectedDomain, $selected => $selected === 'all');
```

---

## T037: Hub UI Page

**File**: `frontend/src/routes/(app)/hub/+page.svelte`

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { useQuery } from '@tanstack/svelte-query';
  import { selectedDomain, isAllDomains, fetchUserDomains } from '$lib/stores/domain';
  import { subscribeToHubUpdates } from '$lib/stores/hubRealtime';
  import DomainSelector from '$lib/components/hub/DomainSelector.svelte';
  import TaskList from '$lib/components/hub/TaskList.svelte';
  import SearchPanel from '$lib/components/hub/SearchPanel.svelte';
  import CommandPalette from '$lib/components/CommandPalette.svelte';

  let workspaceId: string = '';
  let selectedDomainValue: string = 'all';

  onMount(async () => {
    // Get workspace from user session
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      const { data: workspace } = await supabase
        .from('workspaces')
        .select('id')
        .eq('owner_id', data.user.id)
        .single();
      workspaceId = workspace?.id || '';
    }
  });

  // Subscribe to domain changes
  selectedDomain.subscribe(val => {
    selectedDomainValue = val;
  });

  // Fetch hub items (tasks + events)
  const { data: hubItems, isLoading, error } = useQuery({
    queryKey: ['hub_items', workspaceId, selectedDomainValue],
    queryFn: async () => {
      const response = await fetch('/api/rpc/hub-feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          p_domain_id: selectedDomainValue === 'all' ? null : selectedDomainValue,
          p_limit: 200,
          p_offset: 0,
        }),
      });
      const { data } = await response.json();
      return data;
    },
    enabled: !!workspaceId,
    staleTime: 30000, // Cache for 30s
  });

  // Subscribe to realtime updates
  onMount(() => {
    if (!workspaceId) return;

    const { unsubscribe } = subscribeToHubUpdates(workspaceId);
    return () => unsubscribe();
  });

  // Helper: check if item is today
  function isToday(date: string): boolean {
    const today = new Date();
    const itemDate = new Date(date);
    return itemDate.toDateString() === today.toDateString();
  }

  // Helper: check if item is upcoming
  function isUpcoming(date: string): boolean {
    const today = new Date();
    const itemDate = new Date(date);
    return itemDate > today && !isToday(date);
  }
</script>

<div class="hub-container">
  <header class="hub-header">
    <h1>Daily Hub</h1>
    <DomainSelector {workspaceId} />
  </header>

  <main class="hub-content">
    {#if isLoading}
      <div class="loading">Loading your tasks...</div>
    {:else if error}
      <div class="error">Error loading hub: {error.message}</div>
    {:else if hubItems}
      <!-- Today Section -->
      <section class="hub-section">
        <h2>Today</h2>
        <TaskList items={hubItems.filter(i => isToday(i.hub_sort_at))} />
      </section>

      <!-- Upcoming Section -->
      <section class="hub-section">
        <h2>Upcoming</h2>
        <TaskList items={hubItems.filter(i => isUpcoming(i.hub_sort_at))} />
      </section>

      <!-- Search Panel -->
      <section class="hub-section">
        <SearchPanel {workspaceId} {selectedDomainValue} />
      </section>
    {/if}
  </main>

  <CommandPalette {workspaceId} {selectedDomainValue} />
</div>

<style>
  .hub-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: var(--bg-primary);
  }

  .hub-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid var(--border-color);
    background: var(--bg-secondary);
  }

  .hub-header h1 {
    margin: 0;
    font-size: 1.75rem;
    font-weight: 600;
  }

  .hub-content {
    flex: 1;
    overflow-y: auto;
    padding: 2rem;
  }

  .hub-section {
    margin-bottom: 2rem;
  }

  .hub-section h2 {
    margin: 0 0 1rem 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .loading,
  .error {
    padding: 2rem;
    text-align: center;
    color: var(--text-secondary);
  }

  .error {
    color: var(--color-danger);
  }
</style>
```

---

## T038: Command Palette Component

**File**: `frontend/src/lib/components/CommandPalette.svelte`

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { parseNaturalLanguage } from '$lib/utils/nlp';
  import { writable } from 'svelte/store';

  export let workspaceId: string;
  export let selectedDomainValue: string;

  let isOpen = writable(false);
  let inputValue = '';

  onMount(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        isOpen.set(true);
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  });

  async function handleSubmit() {
    if (!inputValue.trim()) return;

    try {
      // Parse natural language
      const parsed = parseNaturalLanguage(inputValue);

      // Determine domain
      const domainId = parsed.domain
        ? (await resolveDomainName(parsed.domain))
        : selectedDomainValue === 'all'
        ? null
        : selectedDomainValue;

      // Create task
      const { error } = await supabase.from('tasks').insert({
        domain_id: domainId,
        title: parsed.title,
        description: parsed.description,
        priority: parsed.priority === 'high' ? 3 : 2,
        due_date: parsed.dueDate?.toISOString(),
        status: 'backlog',
      });

      if (error) throw error;

      // Clear input and close
      inputValue = '';
      isOpen.set(false);

      // Refresh hub items
      window.location.reload(); // Or trigger query refetch
    } catch (err) {
      console.error('Failed to create task:', err);
      alert('Failed to create task. Try again.');
    }
  }

  async function resolveDomainName(domainName: string): Promise<string | null> {
    const { data } = await supabase
      .from('domains')
      .select('id')
      .ilike('name', `%${domainName}%`)
      .single();
    return data?.id || null;
  }
</script>

{#if $isOpen}
  <div class="command-palette-overlay" on:click={() => isOpen.set(false)}>
    <div class="command-palette" on:click|stopPropagation>
      <input
        type="text"
        placeholder="Cmd+K: Add task (e.g., 'Buy milk @home tomorrow')"
        value={inputValue}
        on:change={e => inputValue = e.target.value}
        on:keydown={e => {
          if (e.key === 'Enter') handleSubmit();
          if (e.key === 'Escape') isOpen.set(false);
        }}
        autofocus
      />
    </div>
  </div>
{/if}

<style>
  .command-palette-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-top: 10vh;
    z-index: 1000;
  }

  .command-palette {
    background: var(--bg-secondary);
    border-radius: 8px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    width: 90%;
    max-width: 500px;
  }

  input {
    width: 100%;
    padding: 1rem;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    background: var(--bg-secondary);
  }

  input:focus {
    outline: 2px solid var(--color-primary);
    outline-offset: 0;
  }
</style>
```

---

## T039: NLP Parser Utility

**File**: `frontend/src/lib/utils/nlp.ts`

```typescript
import type { Task } from '$lib/types';

export interface ParsedTask {
  title: string;
  description?: string;
  domain?: string;
  tags?: string[];
  priority?: 'low' | 'medium' | 'high';
  dueDate?: Date;
}

/**
 * Parse natural language task input
 * Examples:
 *  - "Buy milk @home tomorrow"
 *  - "Code review !! @work"
 *  - "Meet alice #important"
 */
export function parseNaturalLanguage(input: string): ParsedTask {
  const domainMatch = input.match(/@(\w+)/);
  const tagMatches = input.match(/#(\w+)/g);
  const priorityMatch = input.match(/!+/);
  const dateMatch = parseDateNLP(input);

  // Remove special syntax from title
  const title = input
    .replace(/@\w+/g, '') // Remove @domain
    .replace(/#\w+/g, '') // Remove #tags
    .replace(/!+/g, '') // Remove priority
    .trim();

  // Determine priority by ! count
  let priority: 'low' | 'medium' | 'high' = 'medium';
  if (priorityMatch) {
    priority = priorityMatch[0].length >= 2 ? 'high' : 'medium';
  }

  return {
    title,
    domain: domainMatch?.[1],
    tags: tagMatches?.map(t => t.slice(1)),
    priority,
    dueDate: dateMatch,
  };
}

function parseDateNLP(input: string): Date | undefined {
  const lowerInput = input.toLowerCase();
  const today = new Date();

  // Today
  if (lowerInput.includes('today')) {
    return today;
  }

  // Tomorrow
  if (lowerInput.includes('tomorrow')) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }

  // Next [day of week]
  const dayMatch = lowerInput.match(/(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);
  if (dayMatch) {
    return getNextDayOfWeek(dayMatch[1]);
  }

  // Next week
  if (lowerInput.includes('next week')) {
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek;
  }

  // In N days
  const daysMatch = lowerInput.match(/in (\d+) days?/);
  if (daysMatch) {
    const date = new Date(today);
    date.setDate(date.getDate() + parseInt(daysMatch[1]));
    return date;
  }

  return undefined;
}

function getNextDayOfWeek(dayName: string): Date {
  const days: Record<string, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };

  const today = new Date();
  const targetDay = days[dayName.toLowerCase()];
  const currentDay = today.getDay();

  let daysAhead = targetDay - currentDay;
  if (daysAhead <= 0) daysAhead += 7;

  const result = new Date(today);
  result.setDate(result.getDate() + daysAhead);
  return result;
}
```

---

## T040: Realtime Subscription Store

**File**: `frontend/src/lib/stores/hubRealtime.ts`

```typescript
import { writable } from 'svelte/store';
import { supabase } from '$lib/supabaseClient';

export interface HubItem {
  id: string;
  title: string;
  item_type: 'task' | 'event';
  status: string;
  priority?: number;
  hub_sort_at: string;
  domain_id: string;
  domain_name: string;
}

export function subscribeToHubUpdates(workspaceId: string) {
  const items = writable<HubItem[]>([]);

  // Subscribe to task changes
  const tasksSubscription = supabase
    .channel(`workspace:${workspaceId}:tasks`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'tasks',
      },
      (payload) => {
        items.update(curr => {
          if (payload.eventType === 'INSERT') {
            return [...curr, payload.new as HubItem];
          } else if (payload.eventType === 'UPDATE') {
            return curr.map(item =>
              item.id === payload.new.id ? (payload.new as HubItem) : item
            );
          } else if (payload.eventType === 'DELETE') {
            return curr.filter(item => item.id !== payload.old.id);
          }
          return curr;
        });
      }
    )
    .subscribe();

  // Subscribe to event changes
  const eventsSubscription = supabase
    .channel(`workspace:${workspaceId}:events`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'events',
      },
      (payload) => {
        items.update(curr => {
          if (payload.eventType === 'INSERT') {
            return [...curr, payload.new as HubItem];
          } else if (payload.eventType === 'UPDATE') {
            return curr.map(item =>
              item.id === payload.new.id ? (payload.new as HubItem) : item
            );
          } else if (payload.eventType === 'DELETE') {
            return curr.filter(item => item.id !== payload.old.id);
          }
          return curr;
        });
      }
    )
    .subscribe();

  return {
    items,
    unsubscribe: () => {
      tasksSubscription.unsubscribe();
      eventsSubscription.unsubscribe();
    },
  };
}
```

---

## T041: Search Panel Component

**File**: `frontend/src/lib/components/hub/SearchPanel.svelte`

```svelte
<script lang="ts">
  import { writable } from 'svelte/store';
  import { useQuery } from '@tanstack/svelte-query';
  import { supabase } from '$lib/supabaseClient';

  export let workspaceId: string;
  export let selectedDomainValue: string;

  let searchQuery = writable('');
  let filters = writable({
    status: null as string | null,
    priority: null as number | null,
  });

  // Query search results
  const { data: results } = useQuery({
    queryKey: ['hub_search', $searchQuery, $filters],
    queryFn: async () => {
      const response = await fetch('/api/rpc/hub-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          p_query: $searchQuery,
          p_domain_id: selectedDomainValue === 'all' ? null : selectedDomainValue,
          p_statuses: $filters.status ? [$filters.status] : null,
          p_priorities: $filters.priority ? [$filters.priority] : null,
        }),
      });
      const { data } = await response.json();
      return data;
    },
    enabled: !!$searchQuery || !!$filters.status || !!$filters.priority,
  });
</script>

<div class="search-panel">
  <input
    type="text"
    placeholder="Search tasks..."
    value={$searchQuery}
    on:change={e => searchQuery.set(e.target.value)}
  />

  <div class="filters">
    <select bind:value={$filters.status}>
      <option value={null}>All statuses</option>
      <option value="done">Done</option>
      <option value="in-progress">In Progress</option>
      <option value="backlog">Backlog</option>
      <option value="blocked">Blocked</option>
    </select>

    <select bind:value={$filters.priority}>
      <option value={null}>All priorities</option>
      <option value={3}>High</option>
      <option value={2}>Medium</option>
      <option value={1}>Low</option>
    </select>
  </div>

  {#if results && results.length > 0}
    <div class="results">
      {#each results as result (result.id)}
        <div class="result-item">
          <strong>{result.title}</strong>
          <span class="item-type">{result.item_type}</span>
          <span class="domain">{result.domain_name}</span>
        </div>
      {/each}
    </div>
  {:else if $searchQuery}
    <div class="no-results">No results found</div>
  {/if}
</div>

<style>
  .search-panel {
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 1rem;
    background: var(--bg-secondary);
  }

  input,
  select {
    display: block;
    width: 100%;
    padding: 0.5rem;
    margin-bottom: 1rem;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    font-size: 0.875rem;
  }

  .filters {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .filters select {
    flex: 1;
    margin-bottom: 0;
  }

  .results {
    max-height: 300px;
    overflow-y: auto;
  }

  .result-item {
    padding: 0.75rem;
    border-bottom: 1px solid var(--border-color);
    font-size: 0.875rem;
    cursor: pointer;
  }

  .result-item:hover {
    background: var(--bg-tertiary);
  }

  .item-type,
  .domain {
    display: inline-block;
    margin-left: 0.5rem;
    padding: 0.125rem 0.5rem;
    background: var(--bg-tertiary);
    border-radius: 2px;
    font-size: 0.75rem;
    color: var(--text-secondary);
  }

  .no-results {
    padding: 1rem;
    text-align: center;
    color: var(--text-secondary);
    font-size: 0.875rem;
  }
</style>
```

---

## T042: Search Integration Service

**File**: `frontend/src/lib/services/hubSearch.ts`

```typescript
import { queryClient } from '$lib/queryClient';
import { supabase } from '$lib/supabaseClient';

export interface SearchParams {
  query: string;
  workspaceId: string;
  domainId?: string | null;
  filters?: {
    status?: string;
    priority?: number;
    dueFrom?: string;
    dueTo?: string;
  };
}

/**
 * Search hub with caching
 */
export async function searchHub(params: SearchParams) {
  const cacheKey = ['hub_search', params.query, params.filters];

  // Check cache
  const cached = queryClient.getQueryData(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch('/api/rpc/hub-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        p_query: params.query,
        p_workspace_id: params.workspaceId,
        p_domain_id: params.domainId,
        p_statuses: params.filters?.status ? [params.filters.status] : null,
        p_priorities: params.filters?.priority ? [params.filters.priority] : null,
        p_due_from: params.filters?.dueFrom,
        p_due_to: params.filters?.dueTo,
      }),
    });

    const { data, error } = await response.json();

    if (error) {
      throw new Error(error);
    }

    // Cache results
    queryClient.setQueryData(cacheKey, data);

    return data;
  } catch (err) {
    console.error('Search failed:', err);
    return [];
  }
}

/**
 * Clear search cache
 */
export function clearSearchCache() {
  queryClient.removeQueries({ queryKey: ['hub_search'] });
}
```

---

## Supporting Components Needed

### DomainSelector.svelte
```svelte
<script lang="ts">
  import { selectedDomain, fetchUserDomains } from '$lib/stores/domain';

  export let workspaceId: string;

  let domains = [];

  onMount(async () => {
    domains = await fetchUserDomains(workspaceId);
  });
</script>

<select value={$selectedDomain} on:change={e => selectedDomain.select(e.target.value)}>
  <option value="all">All Domains</option>
  {#each domains as domain (domain.id)}
    <option value={domain.id}>{domain.name}</option>
  {/each}
</select>
```

### TaskList.svelte
```svelte
<script lang="ts">
  export let items = [];
</script>

{#if items.length > 0}
  <ul>
    {#each items as item (item.id)}
      <li>{item.title} ({item.item_type})</li>
    {/each}
  </ul>
{:else}
  <p>No items</p>
{/if}
```

---

## Implementation Checklist

- [ ] T036: Domain selection store
  - [ ] Writable store with localStorage persistence
  - [ ] fetchUserDomains helper
  - [ ] isAllDomains derived store

- [ ] T037: Hub page
  - [ ] Fetch and display hub items
  - [ ] Today/Upcoming sections
  - [ ] Domain selector integration
  - [ ] Realtime subscriptions

- [ ] T038: Command palette
  - [ ] Dialog/overlay component
  - [ ] Cmd+K keyboard shortcut
  - [ ] Task creation on enter
  - [ ] Parse domain from input

- [ ] T039: NLP parser
  - [ ] Parse @domain syntax
  - [ ] Parse #tags syntax
  - [ ] Parse ! priority syntax
  - [ ] Parse date expressions

- [ ] T040: Realtime store
  - [ ] Subscribe to tasks changes
  - [ ] Subscribe to events changes
  - [ ] Update store on INSERT/UPDATE/DELETE
  - [ ] Cleanup subscriptions

- [ ] T041: Search panel
  - [ ] Search input
  - [ ] Status filter dropdown
  - [ ] Priority filter dropdown
  - [ ] Display search results

- [ ] T042: Search service
  - [ ] Call hub-search RPC
  - [ ] Cache results
  - [ ] Error handling
  - [ ] Clear cache function

---

## Running Tests During Implementation

```bash
# Run E2E tests as you build
npm run test:e2e -- frontend/tests/e2e/hub.spec.ts

# Run unit tests
npm run test -- frontend/tests/unit/hubStore.spec.ts

# Watch mode for development
npm run test -- --watch
```

---

## Next: Day 4 Refactor Phase

Once all frontend components are implemented:
1. Run full test suite
2. Fix any remaining test failures
3. Accessibility audit (T029)
4. Code cleanup and optimization
5. Performance review

---

**Status**: Backend complete ✅ - Ready to implement frontend
**Duration**: 2-3 hours
**Success Criteria**: All E2E tests passing ✅
