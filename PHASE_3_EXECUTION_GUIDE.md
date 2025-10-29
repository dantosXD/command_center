# Phase 3: Daily Hub Implementation - Execution Guide

**Status**: Beginning Phase 3
**Date**: 2025-10-28
**Duration**: 3-4 days estimated
**Tasks**: T025-T042 (18 total - 7 tests + 4 backend + 7 frontend)

---

## Phase 3 Overview

**Objective**: Deliver the Daily Hub - the core MVP feature aggregating today's tasks and upcoming events across domains.

**User Story 1 (P1) - Focused Daily Hub**:
> As a user I want a single hub that aggregates today's tasks, upcoming meetings, and quick-add shortcuts across domains so I can plan my day without switching tools.

**Independent Test**:
- Sign in with data across domains
- Toggle hub between "All Domains" and focused domain
- Add task via command palette using natural language
- Verify instant hub update without page refresh

---

## Execution Strategy: Red-Green-Refactor

### Phase 3A: RED (Day 1 - Write Tests)
Write all tests **before** any implementation. Tests should fail.

**Checklist**:
```bash
# Create test files (all should FAIL initially)
npm run test -- tests/contract/hub-aggregation.spec.ts  # ❌ FAIL
npm run test -- tests/rls/hub-access.spec.ts           # ❌ FAIL
npm run test -- frontend/tests/unit/hubStore.spec.ts   # ❌ FAIL
npm run test -- frontend/tests/e2e/hub.spec.ts         # ❌ FAIL
```

### Phase 3B: GREEN (Days 2-3 - Implementation)
Implement code to make tests pass.

**Checklist**:
```bash
# Backend implementation
# - Create hub_feed RPC
# - Create search RPC
# - Verify tests pass

# Frontend implementation
# - Create hub UI
# - Create domain selector
# - Create command palette integration
# - Verify E2E tests pass
```

### Phase 3C: REFACTOR (Day 4 - Quality)
Extract components, optimize, accessibility audit.

**Checklist**:
```bash
# Code quality
npm run lint
npm run format

# Accessibility audit
npm run test:a11y

# Performance optimization
# - Check query performance
# - Verify no N+1 queries
# - Test RLS policy overhead
```

---

## Task Breakdown

### TESTS: T025-T031 (7 tasks)

#### T025: Hub Aggregation RPC Contract Test
**File**: `tests/contract/hub-aggregation.spec.ts`
**Framework**: Vitest + Supabase client

```typescript
describe('hub_feed RPC', () => {
  it('returns tasks and events for all domains', async () => {
    // Setup: Create 2 domains with tasks/events
    // Call: SELECT * FROM hub_feed(workspace_id)
    // Verify: Results include both domains' items
    // Verify: Fields: id, title, type, due_date, domain_name
  });

  it('filters by domain when provided', async () => {
    // Call: SELECT * FROM hub_feed(workspace_id, domain_id)
    // Verify: Only items from specified domain
  });

  it('applies feature flags', async () => {
    // Call with flag DISABLED
    // Verify: Returns 404 or empty
  });

  it('respects RLS policies', async () => {
    // As user2, call hub_feed for user1's workspace
    // Verify: 403 error or no results
  });
});
```

**Expected API**:
```
POST /rpc/hub_feed
Body: { workspace_id, domain_id?, include_domains }
Response: { items: [{ id, title, type, due_date, domain_id, domain_name }] }
```

#### T026: RLS Isolation Test for Hub View
**File**: `tests/rls/hub-access.spec.ts`
**Framework**: Custom RLS harness

```typescript
describe('RLS: Hub view isolation', () => {
  it('user1 cannot see user2 workspace items', async () => {
    // Setup: User1 creates domain/tasks
    // Setup: User2 attempts to query
    // Verify: Empty result (RLS blocks)
  });

  it('workspace owner can see all domains', async () => {
    // Setup: Create 3 domains
    // Query as owner
    // Verify: All domains visible
  });

  it('domain member can see only their domain', async () => {
    // Setup: Add user2 to domain1 only
    // Query as user2
    // Verify: Only domain1 items visible
  });
});
```

#### T027: Hub Store Unit Tests
**File**: `frontend/tests/unit/hubStore.spec.ts`
**Framework**: Vitest

```typescript
describe('hubStore', () => {
  it('aggregates tasks and events by due date', () => {
    // Input: tasks=[{due: 2025-10-28}, {due: 2025-10-29}]
    //        events=[{start: 2025-10-28}]
    // Verify: Correct sort order
  });

  it('filters by domain selection', () => {
    // Input: all items across domains
    // Action: selectDomain('work')
    // Verify: Only work items shown
  });

  it('persists domain preference to localStorage', () => {
    // Action: selectDomain('home')
    // Reload page
    // Verify: Domain still selected
  });
});
```

#### T028: Hub E2E Flow
**File**: `frontend/tests/e2e/hub.spec.ts`
**Framework**: Playwright

```typescript
test('Hub aggregation and quick-add flow', async ({ page }) => {
  // 1. Sign in
  await page.goto('/');
  await signIn(page, testUser);

  // 2. Land on hub
  await expect(page).toHaveURL('/hub');

  // 3. Verify today's tasks visible
  await expect(page.locator('[data-test="hub-today"]')).toBeVisible();

  // 4. Toggle domain selector
  await page.click('[data-test="domain-selector"]');
  await page.click('text=Work');

  // 5. Verify filtered
  await expect(page.locator('text=Home tasks')).not.toBeVisible();

  // 6. Quick-add task
  await page.keyboard.press('Control+K');
  await page.fill('[data-test="command-palette-input"]', 'Buy milk @home');
  await page.keyboard.press('Enter');

  // 7. Verify task appears instantly
  await expect(page.locator('text=Buy milk')).toBeVisible();
});
```

#### T029: Accessibility Audit
**File**: `tests/accessibility/hub.axe.spec.ts`
**Framework**: axe-core

```typescript
describe('Hub accessibility (WCAG 2.2 AA)', () => {
  it('passes automated accessibility checks', async () => {
    const results = await axe(page);
    expect(results.violations).toHaveLength(0);
  });

  it('hub has proper ARIA labels', () => {
    expect(page.locator('[aria-label="Hub today"]')).toBeTruthy();
    expect(page.locator('[aria-label="Domain switcher"]')).toBeTruthy();
  });

  it('keyboard navigation works', async () => {
    // Tab through hub
    // Verify focus order correct
    // Verify command palette opens with Cmd+K
  });

  it('high contrast mode works', () => {
    // Toggle high contrast CSS
    // Verify readable
  });
});
```

#### T030: Search/Filter Contract Tests
**File**: `tests/contract/hub-search.spec.ts`
**Framework**: Vitest

```typescript
describe('search RPC', () => {
  it('searches by title', async () => {
    // Call: SELECT * FROM search_tasks('coffee', workspace_id)
    // Verify: Returns matching tasks
  });

  it('filters by status', async () => {
    // Call: SELECT * FROM search_tasks('', workspace_id, 'status=done')
    // Verify: Only done tasks
  });

  it('searches across domains', async () => {
    // Create items in multiple domains
    // Search with no domain filter
    // Verify: All matching items
  });

  it('respects RLS isolation', async () => {
    // As user2, search user1's workspace
    // Verify: 403 or no results
  });
});
```

#### T031: Search RLS Isolation Tests
**File**: `tests/rls/hub-search.spec.ts`
**Framework**: Custom RLS harness

```typescript
describe('RLS: Search isolation', () => {
  it('user cannot search across workspaces', async () => {
    // Search in workspace2 as workspace1-member
    // Verify: No results or error
  });

  it('private domain items excluded from cross-domain search', async () => {
    // Create private domain with tasks
    // Search as non-member
    // Verify: Private tasks not in results
  });
});
```

---

### BACKEND: T032-T035 (4 tasks)

#### T032: Hub Aggregation SQL View
**File**: `backend/supabase/migrations/0010_hub_view.sql`
**Status**: Already exists from Phase 1 - VERIFY

```sql
-- Verify this view exists and returns correct schema
CREATE OR REPLACE VIEW public.hub_items AS
SELECT
  'task'::text AS item_type,
  t.id,
  t.title,
  t.status,
  t.priority,
  t.due_date AS due_at,
  t.created_at,
  t.domain_id,
  d.name AS domain_name,
  d.visibility,
  d.workspace_id
FROM public.tasks t
JOIN public.domains d ON t.domain_id = d.id
UNION ALL
SELECT
  'event'::text AS item_type,
  e.id,
  e.title,
  'scheduled'::text AS status,
  NULL::int AS priority,
  e.start_time AS due_at,
  e.created_at,
  e.domain_id,
  d.name AS domain_name,
  d.visibility,
  d.workspace_id
FROM public.events e
JOIN public.domains d ON e.domain_id = d.id
WHERE e.start_time >= NOW() - INTERVAL '1 day'
ORDER BY due_at, priority DESC NULLS LAST;
```

**Verify in psql**:
```bash
PGPASSWORD=postgres psql -h localhost -U postgres -d command_center \
  -c "SELECT * FROM hub_items LIMIT 1;"
# Should return: item_type, id, title, status, priority, due_at, created_at, domain_id, domain_name, visibility, workspace_id
```

#### T033: Hub Feed RPC
**File**: `backend/supabase/functions/hub-feed/index.ts`
**Framework**: Deno + PostgREST

```typescript
// hub-feed/index.ts - Deno Edge Function

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.0';

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const { workspace_id, domain_id, include_domains } = await req.json();
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Check feature flag
  const { data: flag } = await supabase
    .from('feature_flags')
    .select('enabled_by_default')
    .eq('flag_name', 'central-hub-mvp')
    .single();

  if (!flag?.enabled_by_default) {
    return new Response(JSON.stringify({ error: 'Feature not enabled' }), {
      status: 403,
    });
  }

  // Query hub_items view (RLS applied automatically via auth user)
  let query = supabase
    .from('hub_items')
    .select('*')
    .eq('workspace_id', workspace_id)
    .order('due_at', { ascending: true });

  if (domain_id) {
    query = query.eq('domain_id', domain_id);
  }

  const { data, error } = await query;

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
    });
  }

  return new Response(JSON.stringify({ items: data }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

**Deploy**:
```bash
supabase functions deploy hub-feed
```

**Test**:
```bash
curl -X POST http://localhost:3001/rpc/hub_feed \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -d '{"workspace_id": "...", "include_domains": true}'
```

#### T034: Search Materialized View & Indexes
**File**: `backend/supabase/migrations/0011_hub_search.sql`
**Status**: Already exists from Phase 1 - VERIFY

```sql
-- Enable pg_trgm extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create search materialized view
CREATE MATERIALIZED VIEW IF NOT EXISTS public.hub_search_index AS
SELECT
  id,
  title,
  description,
  'task'::text AS item_type,
  domain_id,
  workspace_id,
  setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(description, '')), 'B') AS search_vector
FROM public.tasks
WHERE deleted_at IS NULL
UNION ALL
SELECT
  id,
  title,
  '' AS description,
  'event'::text AS item_type,
  domain_id,
  workspace_id,
  setweight(to_tsvector('english', COALESCE(title, '')), 'A') AS search_vector
FROM public.events
WHERE deleted_at IS NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS hub_search_vector_idx
ON public.hub_search_index USING GIN(search_vector);

CREATE INDEX IF NOT EXISTS hub_search_domain_idx
ON public.hub_search_index(domain_id, workspace_id);
```

**Refresh after changes**:
```bash
REFRESH MATERIALIZED VIEW CONCURRENTLY public.hub_search_index;
```

#### T035: Search & Filter RPCs
**File**: `backend/supabase/functions/hub-search/index.ts`
**Framework**: Deno + PostgREST

```typescript
// hub-search/index.ts - Deno Edge Function

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.0';

interface SearchRequest {
  query: string;
  workspace_id: string;
  domain_id?: string;
  filters?: {
    status?: string;
    priority?: number;
    assignee?: string;
  };
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const body: SearchRequest = await req.json();
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Full-text search using pg_trgm
  let query = supabase
    .from('hub_search_index')
    .select('*')
    .eq('workspace_id', body.workspace_id);

  if (body.query) {
    query = query.textSearch('search_vector', body.query, {
      type: 'websearch',
      config: 'english',
    });
  }

  if (body.domain_id) {
    query = query.eq('domain_id', body.domain_id);
  }

  // Apply structured filters
  if (body.filters?.status) {
    query = query.eq('status', body.filters.status);
  }

  if (body.filters?.priority !== undefined) {
    query = query.eq('priority', body.filters.priority);
  }

  const { data, error } = await query.limit(100);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
    });
  }

  return new Response(JSON.stringify({ results: data }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

**Deploy**:
```bash
supabase functions deploy hub-search
```

---

### FRONTEND: T036-T042 (7 tasks)

#### T036: Domain Selection Store
**File**: `frontend/src/lib/stores/domain.ts`
**Framework**: Svelte stores + TanStack Query

```typescript
// domain.ts - Reactive domain selection store

import { writable } from 'svelte/store';
import { useQuery } from '@tanstack/svelte-query';

interface Domain {
  id: string;
  name: string;
  visibility: 'private' | 'shared' | 'workspace';
}

// Persistent domain preference
function createDomainStore() {
  const storedDomain = localStorage.getItem('hubSelectedDomain') || 'all';
  const { subscribe, set } = writable<string>(storedDomain);

  return {
    subscribe,
    select: (domainId: string) => {
      localStorage.setItem('hubSelectedDomain', domainId);
      set(domainId);
    },
  };
}

export const selectedDomain = createDomainStore();

// Fetch available domains
export function useDomains(workspaceId: string) {
  return useQuery({
    queryKey: ['domains', workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/domains?workspace_id=${workspaceId}`);
      return res.json() as Promise<Domain[]>;
    },
  });
}
```

#### T037: Hub UI Component
**File**: `frontend/src/routes/(app)/hub/+page.svelte`
**Framework**: SvelteKit + Radix UI

```svelte
<!-- hub/+page.svelte -->

<script lang="ts">
  import { onMount } from 'svelte';
  import { useQuery } from '@tanstack/svelte-query';
  import { selectedDomain } from '$lib/stores/domain';
  import DomainSelector from '$lib/components/hub/DomainSelector.svelte';
  import TaskList from '$lib/components/hub/TaskList.svelte';
  import CommandPalette from '$lib/components/CommandPalette.svelte';
  import { HubCard, HubSection } from '$lib/components/hub';

  let workspaceId: string;
  let selectedDomainValue: string;

  onMount(async () => {
    // Load workspace from session
    workspaceId = (await fetch('/api/auth/user').then(r => r.json())).workspace_id;
  });

  selectedDomain.subscribe(val => {
    selectedDomainValue = val;
  });

  // Fetch hub items (tasks + events)
  const { data: hubItems, isLoading } = useQuery({
    queryKey: ['hub_items', workspaceId, selectedDomainValue],
    queryFn: async () => {
      const res = await fetch('/api/rpc/hub_feed', {
        method: 'POST',
        body: JSON.stringify({
          workspace_id: workspaceId,
          domain_id: selectedDomainValue === 'all' ? null : selectedDomainValue,
        }),
      });
      return res.json();
    },
    enabled: !!workspaceId,
  });
</script>

<div class="hub-container">
  <header class="hub-header">
    <h1>Daily Hub</h1>
    <DomainSelector {workspaceId} />
  </header>

  <main class="hub-content">
    {#if isLoading}
      <p>Loading...</p>
    {:else if hubItems?.items}
      <HubSection title="Today">
        <TaskList items={hubItems.items.filter(i => isToday(i.due_date))} />
      </HubSection>

      <HubSection title="Upcoming">
        <TaskList items={hubItems.items.filter(i => isUpcoming(i.due_date))} />
      </HubSection>
    {/if}
  </main>

  <CommandPalette />
</div>

<style>
  .hub-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }

  .hub-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid var(--border-color);
  }

  .hub-content {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
  }
</style>
```

#### T038: Command Palette Quick-Add
**File**: `frontend/src/lib/components/CommandPalette.svelte`
**Framework**: SvelteKit + Radix UI

```svelte
<!-- CommandPalette.svelte -->

<script lang="ts">
  import { writable } from 'svelte/store';
  import { parseNaturalLanguage } from '$lib/utils/nlp';
  import * as Dialog from '@radix-ui/react-dialog';

  let open = writable(false);
  let input = '';

  function handleKeydown(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      open.set(true);
    }
  }

  async function handleSubmit() {
    const parsed = parseNaturalLanguage(input);

    const response = await fetch('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(parsed),
    });

    if (response.ok) {
      // Refresh hub
      location.reload();
    }
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Content>
    <input
      type="text"
      placeholder="Cmd+K: Add task, switch domains..."
      value={input}
      on:change={e => input = e.target.value}
      on:keydown={e => e.key === 'Enter' && handleSubmit()}
    />
  </Dialog.Content>
</Dialog.Root>

<svelte:window on:keydown={handleKeydown} />
```

#### T039: NLP Parsing Utilities
**File**: `frontend/src/lib/utils/nlp.ts`
**Framework**: TypeScript

```typescript
// nlp.ts - Natural Language Parser for quick-add

interface ParsedTask {
  title: string;
  description?: string;
  domain?: string;
  tags?: string[];
  priority?: 'low' | 'medium' | 'high';
  dueDate?: Date;
}

export function parseNaturalLanguage(input: string): ParsedTask {
  // Example: "Buy milk @home #quick tomorrow"

  const domainMatch = input.match(/@(\w+)/);
  const tagMatches = input.match(/#(\w+)/g);
  const priorityMatch = input.match(/!(!)*/);
  const dateMatch = parseDateNLP(input);

  const title = input
    .replace(/@\w+/g, '') // Remove @domain
    .replace(/#\w+/g, '') // Remove #tags
    .replace(/!+/g, '') // Remove priority
    .trim();

  return {
    title,
    domain: domainMatch?.[1],
    tags: tagMatches?.map(t => t.slice(1)),
    priority: priorityMatch ? (priorityMatch[0].length === 1 ? 'high' : 'urgent') : 'medium',
    dueDate: dateMatch,
  };
}

function parseDateNLP(input: string): Date | undefined {
  // Parse "today", "tomorrow", "next monday", etc.
  const lowerInput = input.toLowerCase();
  const today = new Date();

  if (lowerInput.includes('today')) return today;
  if (lowerInput.includes('tomorrow')) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }

  // Add more date parsing as needed
  return undefined;
}
```

#### T040: Realtime Subscription Store
**File**: `frontend/src/lib/stores/hubRealtime.ts`
**Framework**: Supabase Realtime + Svelte stores

```typescript
// hubRealtime.ts - Real-time updates for hub items

import { writable } from 'svelte/store';
import { supabase } from '$lib/supabaseClient';

export function subscribeToHubUpdates(workspaceId: string) {
  const items = writable([]);

  // Subscribe to task changes
  const tasksSubscription = supabase
    .from('tasks')
    .on('*', (payload) => {
      // Update local store without full page reload
      items.update(curr => {
        if (payload.eventType === 'INSERT') {
          return [...curr, payload.new];
        } else if (payload.eventType === 'UPDATE') {
          return curr.map(item => item.id === payload.new.id ? payload.new : item);
        } else if (payload.eventType === 'DELETE') {
          return curr.filter(item => item.id !== payload.old.id);
        }
        return curr;
      });
    })
    .eq('workspace_id', workspaceId)
    .subscribe();

  return {
    items,
    unsubscribe: () => tasksSubscription.unsubscribe(),
  };
}
```

#### T041: Search Panel UI
**File**: `frontend/src/lib/components/hub/SearchPanel.svelte`
**Framework**: SvelteKit + Radix UI

```svelte
<!-- hub/SearchPanel.svelte -->

<script lang="ts">
  import { writable } from 'svelte/store';
  import { useQuery } from '@tanstack/svelte-query';

  let searchQuery = writable('');
  let filters = writable({
    status: null,
    priority: null,
    domain: null,
  });

  const { data: results } = useQuery({
    queryKey: ['search', $searchQuery, $filters],
    queryFn: async () => {
      const res = await fetch('/api/rpc/hub_search', {
        method: 'POST',
        body: JSON.stringify({
          query: $searchQuery,
          filters: $filters,
        }),
      });
      return res.json();
    },
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
    </select>

    <select bind:value={$filters.priority}>
      <option value={null}>All priorities</option>
      <option value="high">High</option>
      <option value="medium">Medium</option>
      <option value="low">Low</option>
    </select>
  </div>

  {#if results?.results}
    <div class="results">
      {#each results.results as result}
        <div class="result-item">
          {result.title}
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .search-panel {
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 1rem;
  }

  .filters {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
  }

  .results {
    margin-top: 1rem;
  }

  .result-item {
    padding: 0.5rem;
    border-bottom: 1px solid var(--border-color);
  }
</style>
```

#### T042: Search Integration Service
**File**: `frontend/src/lib/services/hubSearch.ts`
**Framework**: TypeScript + TanStack Query

```typescript
// hubSearch.ts - Search service with caching

import { queryClient } from '$lib/queryClient';

interface SearchParams {
  query: string;
  workspaceId: string;
  domainId?: string;
  filters?: {
    status?: string;
    priority?: number;
  };
}

export async function searchHub(params: SearchParams) {
  const cached = queryClient.getQueryData(['hub_search', params.query]);
  if (cached) return cached;

  const response = await fetch('/api/rpc/hub_search', {
    method: 'POST',
    body: JSON.stringify(params),
  });

  const data = await response.json();

  // Cache results
  queryClient.setQueryData(['hub_search', params.query], data);

  return data;
}

export function clearSearchCache() {
  queryClient.removeQueries(['hub_search']);
}
```

---

## Day-by-Day Execution Plan

### Day 1: Write All Tests (Red Phase)
```bash
# Create test files
touch tests/contract/hub-aggregation.spec.ts
touch tests/rls/hub-access.spec.ts
touch frontend/tests/unit/hubStore.spec.ts
touch frontend/tests/e2e/hub.spec.ts
touch tests/accessibility/hub.axe.spec.ts
touch tests/contract/hub-search.spec.ts
touch tests/rls/hub-search.spec.ts

# Run all tests - expect to FAIL
npm run test

# Expected: 20+ failures (test code not implemented)
```

**Deliverable**: All test files written with failing assertions

### Day 2: Backend Implementation (Green Phase - Backend)
```bash
# Verify views/migrations exist
PGPASSWORD=postgres psql -h localhost -U postgres -d command_center \
  -c "SELECT * FROM hub_items LIMIT 1;"

# Deploy Edge Functions
supabase functions deploy hub-feed
supabase functions deploy hub-search

# Run backend tests only
npm run test -- tests/contract

# Expected: Contract tests passing
# Expected: RLS tests passing
```

**Deliverable**: Backend RPCs operational, contract tests passing

### Day 3: Frontend Implementation (Green Phase - Frontend)
```bash
# Create all frontend components
mkdir -p frontend/src/routes/\(app\)/hub
mkdir -p frontend/src/lib/stores
mkdir -p frontend/src/lib/components/hub

# Implement components and stores
# Run frontend tests
npm run test -- frontend/tests

# Run E2E tests
npm run test:e2e -- hub.spec.ts

# Expected: All E2E tests passing
```

**Deliverable**: Hub UI fully functional, E2E tests passing

### Day 4: Quality & Accessibility (Refactor Phase)
```bash
# Code quality
npm run lint
npm run format

# Accessibility audit
npm run test:a11y

# Fix any violations
# Optimize performance

# Final full test run
npm run test && npm run test:e2e

# Expected: 100% tests passing, 0 a11y violations
```

**Deliverable**: Production-ready code, full test coverage, accessibility verified

---

## Success Criteria

Phase 3 is complete when:

✅ All 18 tasks (T025-T042) are marked complete
✅ All tests passing:
  - Contract tests (T025, T030)
  - RLS tests (T026, T031)
  - Unit tests (T027)
  - E2E tests (T028)
  - Accessibility tests (T029)
✅ Hub UI fully functional
✅ Real-time updates working
✅ Search/filter operational
✅ Command palette quick-add working
✅ WCAG 2.2 AA compliance verified
✅ No RLS violations
✅ Code reviewed and merged

---

## Troubleshooting

### Tests Won't Run
```bash
# Check dependencies
npm list vitest playwright

# Reinstall
npm ci

# Clear cache
rm -rf node_modules/.vite
npm run test -- --no-cache
```

### Docker Services Down
```bash
# Restart
docker-compose down
docker-compose up -d

# Verify
./infrastructure/scripts/health/check-all.sh
```

### RLS Test Failures
- Check that RLS policies are enabled on all tables
- Verify test user has correct role in database
- Check domain_members table for test users

---

## References

- `PHASE_3_QUICKSTART.md` - Phase 3 overview
- `PHASE_2_EXECUTION.md` - Infrastructure (Docker, RLS)
- `CLAUDE.md` - Dev commands and setup
- `docs/adr/001-central-hub-architecture.md` - Architecture details

---

**Status**: Phase 3 Ready to Execute
**Next Action**: Begin Day 1 - Write All Tests

Generated: 2025-10-28
