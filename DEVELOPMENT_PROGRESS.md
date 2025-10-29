# Central Hub MVP – Development Progress Report

**Date:** October 28, 2025 @ 10:19 UTC  
**Status:** 🚀 **ACTIVE DEVELOPMENT IN PROGRESS**  
**Phase:** Phase 3 – Hub MVP Frontend Implementation

---

## Current Work Summary

You're actively implementing the **Hub MVP frontend** with focus on:

✅ **Hub Store (hubStore.ts)**
- Refactored to use `get()` for reactive domain state
- Integrated `hub-feed` Edge Function invocation
- Added error handling and loading states
- Implemented `setSearchOpen()` and `setQuickAddOpen()` methods

✅ **Hub Page (+page.svelte)**
- Domain switcher integration with auto-refresh
- Search panel trigger with proper state management
- Quick-add command palette trigger
- Empty state handling for no domains

✅ **Search Panel Component**
- Full-text search via `hub_search` RPC
- Domain-scoped filtering
- Keyboard navigation (Escape, Enter)
- Result selection and quick-add toggle
- Accessibility labels and ARIA regions

---

## Architecture Overview

### Data Flow

```
User Action
    ↓
Hub Page (+page.svelte)
    ↓
hubStore (state management)
    ↓
Supabase Edge Functions / RPCs
    ↓
Backend (migrations, policies, triggers)
    ↓
Database (Postgres with RLS)
```

### Key Components

| Component | Status | Purpose |
|-----------|--------|---------|
| hubStore.ts | ✅ In Progress | Hub state, refresh, search/quick-add toggles |
| +page.svelte | ✅ In Progress | Main hub layout, domain switcher, modals |
| SearchPanel.svelte | ✅ Complete | Search UI with RPC integration |
| DomainSwitcher.svelte | ⏳ Pending | Domain selection dropdown |
| HubSection.svelte | ⏳ Pending | Today/Upcoming sections |
| QuickAddWidget.svelte | ⏳ Pending | Quick-add form |
| CommandPalette.svelte | ⏳ Pending | Command palette for quick-add |

---

## Next Steps (Priority Order)

### 1. Complete hubStore.ts (CRITICAL)
**Current:** Refresh logic implemented  
**TODO:**
- Implement `createQuickAdd()` to wire NLP parser and mutation calls
- Add realtime subscription completion (lines 77–end)
- Export store instance for use in components

```typescript
// TODO: Complete realtime subscription
function subscribeRealtime() {
  const channel = supabase
    .channel('hub-updates')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
      // Refresh hub on task changes
      refresh();
    })
    .subscribe();
  
  return () => channel.unsubscribe();
}

// Export store
export const hubStore = {
  subscribe,
  refresh,
  setDomain,
  createQuickAdd,
  setSearchOpen,
  setQuickAddOpen,
  subscribeRealtime,
};
```

### 2. Implement DomainSwitcher.svelte
**Purpose:** Domain selection dropdown  
**Requirements:**
- List user's domains from `domainStore`
- Show current selection
- Trigger `domainStore.selectDomain(id)` on change
- Trigger `hubStore.refresh()` on selection

```svelte
<script lang="ts">
  import { domainStore } from '$lib/stores/domain';
  import { hubStore } from '$lib/stores/hubStore';

  async function selectDomain(id: string | null) {
    domainStore.selectDomain(id);
    await hubStore.refresh();
  }
</script>

<select on:change={(e) => selectDomain(e.currentTarget.value)}>
  <option value="">All Domains</option>
  {#each $domainStore.domains as domain}
    <option value={domain.id}>{domain.name}</option>
  {/each}
</select>
```

### 3. Implement HubSection.svelte
**Purpose:** Display Today/Upcoming task sections  
**Requirements:**
- Accept `section` prop ('Today' or 'Upcoming')
- Filter `$hubStore.items` by date bucket
- Render task/event list with status, priority, due date
- Handle empty state

```svelte
<script lang="ts">
  import { hubStore } from '$lib/stores/hubStore';
  export let section: 'Today' | 'Upcoming';

  $: items = $hubStore.items.filter((item) => {
    // Filter by section (Today = today, Upcoming = next 7 days)
    // TODO: implement date bucketing logic
  });
</script>

<section>
  <h2>{section}</h2>
  {#each items as item}
    <div class="hub-item" data-testid="hub-item">
      <p>{item.title}</p>
      <span>{item.domain_name}</span>
    </div>
  {/each}
</section>
```

### 4. Implement QuickAddWidget.svelte
**Purpose:** Quick-add form for tasks/events  
**Requirements:**
- Text input for natural language parsing
- Call `hubStore.createQuickAdd(input)` on submit
- Show loading state during creation
- Close modal on success

### 5. Implement CommandPalette.svelte
**Purpose:** Command palette for quick-add and search  
**Requirements:**
- Keyboard-driven interface (Cmd+K to open)
- Search and quick-add modes
- Fuzzy search results
- Item selection and creation

---

## Backend Integration Checklist

### Edge Functions (Ready for Testing)
- ✅ `hub-feed` – Hub aggregation RPC
- ✅ `hub-search` – Search and filter RPC
- ⏳ `tasks` – Task CRUD operations
- ⏳ `task-filters` – Saved filter persistence
- ⏳ `task-board` – Board ordering

### Migrations (Ready for Testing)
- ✅ 0001–0006 – Core schema, RLS, search
- ✅ 0010–0011 – Hub view and search view
- ✅ 0012–0013 – Domain permissions and audit
- ⏳ 0014–0017 – Calendar, notifications, comments, exports

### RLS Policies (Ready for Testing)
- ✅ tenancy.sql – Workspace/domain scoped access
- ✅ domains.sql – Domain-scoped resource policies

---

## Testing Strategy

### Unit Tests (hubStore.ts)
```bash
npm run test -- hubStore.spec.ts
```

### E2E Tests (hub flow)
```bash
npm run test:e2e -- hub.spec.ts
```

### Accessibility Audit
```bash
npm run test:a11y -- hub.axe.spec.ts
```

### Manual Testing
1. Start dev server: `npm run dev`
2. Navigate to `/hub`
3. Verify domain switcher loads domains
4. Verify search opens and searches
5. Verify quick-add opens command palette
6. Verify realtime updates when tasks change

---

## Environment Setup Reminder

**If npm install still fails:**
```bash
# Option 1: Clear npm cache and retry
npm cache clean --force
npm install

# Option 2: Use yarn instead
yarn install

# Option 3: Use pnpm (if PATH refreshed)
pnpm install
```

**Once dependencies installed:**
```bash
# Start Supabase local stack
supabase start

# Start SvelteKit dev server
npm run dev

# Run tests
npm run test
npm run test:e2e
```

---

## File Structure Reference

```
frontend/src/
├── routes/
│   └── (app)/
│       └── hub/
│           └── +page.svelte          ✅ In Progress
├── lib/
│   ├── stores/
│   │   ├── hubStore.ts              ✅ In Progress
│   │   └── domain.ts                ✅ Complete
│   ├── components/
│   │   ├── hub/
│   │   │   ├── SearchPanel.svelte    ✅ Complete
│   │   │   ├── HubSection.svelte     ⏳ Pending
│   │   │   ├── QuickAddWidget.svelte ⏳ Pending
│   │   │   └── DomainSwitcher.svelte ⏳ Pending
│   │   └── CommandPalette.svelte     ⏳ Pending
│   ├── services/
│   │   ├── hubSearch.ts             ⏳ Pending
│   │   └── hubRealtime.ts           ⏳ Pending
│   └── utils/
│       └── nlp.ts                    ⏳ Pending (NLP parser)
└── tests/
    ├── unit/
    │   └── hubStore.spec.ts          ⏳ Pending
    ├── e2e/
    │   └── hub.spec.ts               ⏳ Pending
    └── accessibility/
        └── hub.axe.spec.ts           ⏳ Pending
```

---

## Key Decisions & Notes

1. **State Management:** Using Svelte stores with reactive subscriptions to domain changes
2. **Error Handling:** Try-catch blocks with user-friendly error messages
3. **Accessibility:** ARIA labels, keyboard navigation, focus management
4. **Realtime Updates:** Supabase channel subscriptions for live hub updates
5. **RLS Enforcement:** All queries respect row-level security policies

---

## Estimated Timeline

| Task | Effort | Timeline |
|------|--------|----------|
| Complete hubStore.ts | 1–2 hours | Today |
| DomainSwitcher.svelte | 1 hour | Today |
| HubSection.svelte | 2 hours | Today |
| QuickAddWidget.svelte | 2 hours | Tomorrow |
| CommandPalette.svelte | 3 hours | Tomorrow |
| Unit/E2E/A11y tests | 4 hours | Tomorrow |
| **Total Phase 3 Frontend** | **~13 hours** | **2 days** |

---

## Success Criteria

✅ Hub page loads with domain switcher  
✅ Search panel opens and searches tasks/events  
✅ Quick-add opens command palette  
✅ Domain selection filters hub items  
✅ Realtime updates reflect task changes  
✅ All tests pass (unit, e2e, accessibility)  
✅ WCAG AA compliance verified  

---

## Resources

- **Supabase Docs:** https://supabase.com/docs
- **SvelteKit Docs:** https://kit.svelte.dev
- **Playwright Docs:** https://playwright.dev
- **Axe Accessibility:** https://www.deque.com/axe/

---

**Status: 🚀 ACTIVE DEVELOPMENT – READY TO CONTINUE**

Next: Complete hubStore.ts realtime subscription and implement DomainSwitcher.svelte
