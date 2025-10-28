# Command Center MVP: Quick Start Implementation Guide

**Duration**: 7-10 business days
**Start Date**: Now
**Target**: Production-ready hub aggregation with testing

---

## BEFORE YOU START

### Prerequisites Check
```bash
# Check Node.js version
node --version  # Requires 18+

# Check pnpm
pnpm --version  # Requires 9+

# Check Docker
docker --version
docker-compose --version

# Verify Git setup
git config user.name
git config user.email
```

### Repository Status
```bash
cd /path/to/command_center
git status  # Should show clean working tree or expected changes
git branch  # Should be on 001-central-hub
```

---

## DAY 1: AUTH & SESSION SETUP

### Morning: Login Route Implementation (2 hours)

**Goal**: Users can sign in with email/password

**Task 1.1: Create login page**
```typescript
// frontend/src/routes/login/+page.svelte
<script lang="ts">
  import { goto } from '$app/navigation';
  import { supabase } from '$lib/supabaseClient';

  let email = '';
  let password = '';
  let error = '';
  let loading = false;

  async function handleLogin() {
    loading = true;
    error = '';

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      error = signInError.message;
      loading = false;
    } else {
      goto('/hub');
    }
  }
</script>

<div class="flex items-center justify-center min-h-screen">
  <form on:submit|preventDefault={handleLogin} class="w-80 p-8 border rounded-lg">
    <h1 class="text-2xl font-bold mb-6">Command Center</h1>

    {#if error}
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {error}
      </div>
    {/if}

    <div class="mb-4">
      <label class="block text-sm font-bold mb-2">Email</label>
      <input
        type="email"
        bind:value={email}
        class="w-full px-3 py-2 border rounded-lg"
        disabled={loading}
      />
    </div>

    <div class="mb-6">
      <label class="block text-sm font-bold mb-2">Password</label>
      <input
        type="password"
        bind:value={password}
        class="w-full px-3 py-2 border rounded-lg"
        disabled={loading}
      />
    </div>

    <button
      type="submit"
      disabled={loading}
      class="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold disabled:opacity-50"
    >
      {loading ? 'Signing in...' : 'Sign In'}
    </button>
  </form>
</div>
```

**Task 1.2: Create auth store**
```typescript
// frontend/src/lib/stores/auth.ts
import { writable, derived } from 'svelte/store';
import { supabase } from '$lib/supabaseClient';
import type { Session } from '@supabase/supabase-js';

function createAuthStore() {
  const session = writable<Session | null>(null);
  const loading = writable(true);
  const user = derived(session, $session => $session?.user ?? null);

  // Initialize session from Supabase
  supabase.auth.getSession().then(({ data }) => {
    session.set(data.session);
    loading.set(false);
  });

  // Listen for auth changes
  supabase.auth.onAuthStateChange((event, newSession) => {
    session.set(newSession);
  });

  return { session, user, loading };
}

export const auth = createAuthStore();
```

**Task 1.3: Create callback handler**
```typescript
// frontend/src/routes/auth/callback/+server.ts
import { redirect } from '@sveltejs/kit';

export async function GET(event) {
  const { url } = event;
  const code = url.searchParams.get('code');

  if (code) {
    const { error } = await event.locals.supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      redirect(303, '/hub');
    }
  }

  redirect(303, '/login');
}
```

**Task 1.4: Create logout endpoint**
```typescript
// frontend/src/routes/logout/+server.ts
import { redirect } from '@sveltejs/kit';

export async function POST(event) {
  const { error } = await event.locals.supabase.auth.signOut();

  if (!error) {
    redirect(303, '/login');
  }
}
```

### Afternoon: Middleware & Protected Layout (2 hours)

**Task 1.5: Create server-side hooks**
```typescript
// frontend/src/hooks.server.ts
import { createServerClient } from '@supabase/ssr'
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public'
import type { Handle } from '@sveltejs/kit'
import { redirect } from '@sveltejs/kit'

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => event.cookies.getSetCookie(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) =>
          event.cookies.set(name, value, { path: '/', ...options })
        )
      },
    },
  })

  event.locals.getSession = async () => {
    const {
      data: { session },
    } = await event.locals.supabase.auth.getSession()
    return session
  }

  // Protect (app)/* routes
  if (event.url.pathname.startsWith('/(app)')) {
    const session = await event.locals.getSession()
    if (!session) {
      redirect(303, '/login')
    }
  }

  return resolve(event)
}
```

**Task 1.6: Create protected layout**
```svelte
<!-- frontend/src/routes/(app)/+layout.svelte -->
<script lang="ts">
  import { auth } from '$lib/stores/auth';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  async function logout() {
    await fetch('/logout', { method: 'POST' });
    goto('/login');
  }
</script>

{#if !$auth.loading}
  <div class="flex h-screen">
    <!-- Sidebar/Nav -->
    <div class="w-64 bg-slate-900 text-white p-4">
      <h1 class="text-xl font-bold mb-8">Command Center</h1>
      <nav class="space-y-2">
        <a href="/hub" class="block px-3 py-2 rounded hover:bg-slate-700">Hub</a>
        <a href="/domains" class="block px-3 py-2 rounded hover:bg-slate-700">Domains</a>
      </nav>
      <div class="mt-8 pt-4 border-t border-slate-700">
        <button on:click={logout} class="w-full text-left px-3 py-2 hover:bg-slate-700">
          Logout
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 overflow-auto">
      <header class="bg-white border-b p-4 flex justify-between">
        <h2 class="text-lg font-semibold">{$page.data.title ?? 'Hub'}</h2>
        <div class="text-sm text-gray-600">{$auth.user?.email}</div>
      </header>
      <main class="p-6">
        <slot />
      </main>
    </div>
  </div>
{/if}
```

**Validation**:
```bash
# Start dev server
pnpm dev

# Test: Navigate to http://localhost:5173/login
# Should see login form
# Try logging in (need test user first, see Day 2)
```

---

## DAY 2: DATABASE SEEDING & ENV SETUP

### Morning: Environment Configuration (1 hour)

**Task 2.1: Create .env.local template**
```bash
# frontend/.env.local (DO NOT COMMIT)
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
PUBLIC_SUPABASE_URL=http://localhost:54321
PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Note**: The ANON_KEY comes from Docker Compose environment variables set in docker-compose.yml

### Afternoon: Database Seeding (4 hours)

**Task 2.2: Create development seeds**
```sql
-- backend/supabase/seeds/dev.sql
-- Development seed data for testing

-- Workspaces
INSERT INTO public.workspaces (id, name, timezone)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  'Test Workspace',
  'UTC'
) ON CONFLICT DO NOTHING;

-- Domains
INSERT INTO public.domains (id, workspace_id, name, color, visibility)
VALUES
  ('550e8400-e29b-41d4-a716-446655440001'::uuid, '550e8400-e29b-41d4-a716-446655440000', 'Home', '#3B82F6', 'workspace'),
  ('550e8400-e29b-41d4-a716-446655440002'::uuid, '550e8400-e29b-41d4-a716-446655440000', 'Work', '#10B981', 'workspace'),
  ('550e8400-e29b-41d4-a716-446655440003'::uuid, '550e8400-e29b-41d4-a716-446655440000', 'Play', '#F59E0B', 'workspace')
ON CONFLICT DO NOTHING;

-- Feature flags
INSERT INTO public.feature_flags (key, enabled)
VALUES
  ('central-hub-mvp', true),
  ('search-beta', true),
  ('calendar-overlay', false),
  ('notification-outbox-v2', false)
ON CONFLICT DO NOTHING;

-- Sample tasks (will need real user IDs)
-- INSERT INTO public.tasks (...) VALUES (...)
-- After auth users created
```

**Task 2.3: Start Docker Compose stack**
```bash
cd infrastructure
docker-compose up -d

# Verify services running
docker-compose ps

# Check Postgres is healthy
docker-compose logs postgres | grep "ready to accept"

# Connect to database
psql -U postgres -h localhost -d command_center
\dt  # List tables
SELECT * FROM public.workspaces;
```

**Task 2.4: Create test users in Supabase**
```bash
# Using Supabase CLI
supabase start

# Or manually via GoTrue API
curl -X POST http://localhost:9999/auth/v1/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user1@example.com",
    "password": "Test123!@#",
    "user_metadata": {"full_name": "User One"}
  }'

curl -X POST http://localhost:9999/auth/v1/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user2@example.com",
    "password": "Test456!@#",
    "user_metadata": {"full_name": "User Two"}
  }'
```

**Validation**:
```bash
# Verify users created
psql -U postgres -h localhost -d command_center
SELECT id, email FROM auth.users;

# Verify workspaces/domains exist
SELECT * FROM public.workspaces;
SELECT * FROM public.domains;
```

---

## DAY 3: HUB BACKEND APIS

### All Day: Hub RPC Implementation (8 hours)

**Task 3.1: Implement hub-feed RPC**
```typescript
// backend/supabase/functions/hub-feed/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.0'

Deno.serve(async (req) => {
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    {
      global: { headers: { Authorization: req.headers.get('Authorization')! } },
    }
  )

  // Get current user from JWT
  const { data: { user } } = await supabaseClient.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { workspace_id, domain_id, time_window = 30 } = await req.json()

  // Validate user has access to workspace
  const { data: membership } = await supabaseClient
    .from('domain_members')
    .select('id')
    .eq('user_id', user.id)
    .limit(1)

  if (!membership?.length) {
    return new Response('Forbidden', { status: 403 })
  }

  // Fetch hub view with optional domain filter
  let query = supabaseClient
    .from('hub_view')
    .select('*')
    .gte('due_at', new Date().toISOString())
    .lte('due_at', new Date(Date.now() + time_window * 86400000).toISOString())

  if (domain_id) {
    query = query.eq('domain_id', domain_id)
  }

  const { data, error, count } = await query

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // Separate tasks and events
  const tasks = data.filter(item => item.item_type === 'task')
  const events = data.filter(item => item.item_type === 'event')

  return new Response(
    JSON.stringify({ tasks, events, total_count: count }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
```

**Task 3.2: Write contract tests for hub-feed**
```typescript
// tests/contract/hub-feed.spec.ts
import { describe, it, expect } from 'vitest';
import { createClient } from '@supabase/supabase-js';

describe('hub-feed RPC', () => {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  it('should return tasks and events', async () => {
    const { data, error } = await supabase.functions.invoke('hub-feed', {
      body: {
        workspace_id: '550e8400-e29b-41d4-a716-446655440000',
        domain_id: null,
        time_window: 30,
      },
    });

    expect(error).toBeNull();
    expect(data).toHaveProperty('tasks');
    expect(data).toHaveProperty('events');
    expect(data).toHaveProperty('total_count');
    expect(Array.isArray(data.tasks)).toBe(true);
    expect(Array.isArray(data.events)).toBe(true);
  });

  it('should filter by domain_id', async () => {
    const { data } = await supabase.functions.invoke('hub-feed', {
      body: {
        workspace_id: '550e8400-e29b-41d4-a716-446655440000',
        domain_id: '550e8400-e29b-41d4-a716-446655440001', // Home
        time_window: 30,
      },
    });

    expect(data.tasks.every(t => t.domain_id === '550e8400-e29b-41d4-a716-446655440001')).toBe(true);
  });

  it('should enforce RLS', async () => {
    // User2 should not see User1's tasks
    // Test with different auth tokens
  });
});
```

**Task 3.3: Write RLS isolation test**
```typescript
// tests/rls/hub-access.spec.ts
import { describe, it, expect } from 'vitest';

describe('Hub RLS Isolation', () => {
  it('user1 cannot see user2 tasks in hub-feed', async () => {
    // Arrange: Create two test users with different domains
    // Act: User1 calls hub-feed, User2 calls hub-feed
    // Assert: User1 should not see User2's tasks
  });

  it('user cannot access workspace they are not member of', async () => {
    // Should receive 403 Forbidden
  });
});
```

**Validation**:
```bash
# Test RPC directly
curl -X POST http://localhost:54321/functions/v1/hub-feed \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"workspace_id": "550e8400-e29b-41d4-a716-446655440000", "domain_id": null, "time_window": 30}'

# Should return JSON with tasks and events arrays
```

---

## DAY 4-5: HUB FRONTEND UI

### Hub Store & Components (8 hours)

**Task 4.1: Create hub store**
```typescript
// frontend/src/lib/stores/hubStore.ts
import { writable, derived } from 'svelte/store';
import { createQuery } from '@tanstack/svelte-query';
import { supabase } from '$lib/supabaseClient';
import { domain } from './domain';

interface HubItem {
  id: string;
  title: string;
  due_at?: string;
  status?: string;
  domain_id: string;
  item_type: 'task' | 'event';
}

export function useHubFeed() {
  const selectedDomain = domain;

  const query = createQuery({
    queryKey: ['hub-feed', selectedDomain],
    queryFn: async () => {
      const selectedDomainId = get(selectedDomain);

      const { data, error } = await supabase.functions.invoke('hub-feed', {
        body: {
          workspace_id: 'current-workspace-id', // Get from auth/context
          domain_id: selectedDomainId === 'all' ? null : selectedDomainId,
          time_window: 30,
        },
      });

      if (error) throw error;
      return data;
    },
  });

  return {
    tasks: derived(query, $q => $q.data?.tasks ?? []),
    events: derived(query, $q => $q.data?.events ?? []),
    loading: derived(query, $q => $q.isLoading),
    error: derived(query, $q => $q.error),
    refetch: () => query.refetch(),
  };
}
```

**Task 4.2: Create hub page**
```svelte
<!-- frontend/src/routes/(app)/hub/+page.svelte -->
<script lang="ts">
  import { useHubFeed } from '$lib/stores/hubStore';
  import { domain } from '$lib/stores/domain';
  import HubSection from '$lib/components/hub/HubSection.svelte';
  import SearchPanel from '$lib/components/hub/SearchPanel.svelte';

  const { tasks, events, loading, error, refetch } = useHubFeed();

  let showSearch = false;

  const today = new Date();
  const upcoming = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  $: todayTasks = $tasks.filter(t => {
    const due = new Date(t.due_at);
    return due.toDateString() === today.toDateString();
  });

  $: upcomingTasks = $tasks.filter(t => {
    const due = new Date(t.due_at);
    return due > today && due <= upcoming;
  });
</script>

<div class="p-6">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-3xl font-bold">Hub</h1>
    <div class="space-x-2">
      <button on:click={() => showSearch = true} class="px-4 py-2 bg-blue-600 text-white rounded">
        Search
      </button>
      <select bind:value={$domain} class="px-4 py-2 border rounded">
        <option value="all">All Domains</option>
        <option value="home">Home</option>
        <option value="work">Work</option>
        <option value="play">Play</option>
      </select>
    </div>
  </div>

  {#if $error}
    <div class="bg-red-100 text-red-700 p-4 rounded mb-4">
      Error loading hub: {$error.message}
    </div>
  {/if}

  {#if $loading}
    <div class="text-center py-12">Loading...</div>
  {:else}
    <div class="space-y-6">
      <HubSection title="Today" items={todayTasks} />
      <HubSection title="Upcoming (7 days)" items={upcomingTasks} />
    </div>
  {/if}

  {#if showSearch}
    <SearchPanel on:close={() => showSearch = false} {refetch} />
  {/if}
</div>
```

**Task 4.3: Create hub section component**
```svelte
<!-- frontend/src/lib/components/hub/HubSection.svelte -->
<script lang="ts">
  export let title: string;
  export let items: any[] = [];

  const getStatusColor = (status: string) => {
    const colors = {
      'done': 'bg-green-100 text-green-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      'backlog': 'bg-gray-100 text-gray-800',
      'blocked': 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };
</script>

<div class="bg-white rounded-lg p-4">
  <h2 class="text-xl font-semibold mb-4">{title}</h2>

  {#if items.length === 0}
    <p class="text-gray-500">No items</p>
  {:else}
    <ul class="space-y-2">
      {#each items as item (item.id)}
        <li class="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100">
          <div>
            <p class="font-medium">{item.title}</p>
            <p class="text-sm text-gray-600">{item.domain_name}</p>
          </div>
          {#if item.status}
            <span class="px-2 py-1 text-xs font-semibold rounded {getStatusColor(item.status)}">
              {item.status}
            </span>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</div>
```

**Validation**:
```bash
# Start frontend dev server
pnpm dev

# Navigate to http://localhost:5173/hub
# Should see hub with today/upcoming sections
# Domain filter should work
```

---

## DAY 6: TESTING & CI/CD

### Morning: Test Suite (4 hours)

**Task 6.1: Write hub store tests**
```typescript
// frontend/tests/unit/hubStore.spec.ts
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';

describe('Hub Store', () => {
  it('should fetch hub feed data', async () => {
    // Test store fetches data from RPC
  });

  it('should filter by domain', async () => {
    // Test domain filter updates query
  });

  it('should handle errors gracefully', async () => {
    // Test error state
  });
});
```

**Task 6.2: Write E2E test**
```typescript
// frontend/tests/e2e/hub.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Hub E2E', () => {
  test('user can view hub after login', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="email"]', 'user1@example.com');
    await page.fill('input[type="password"]', 'Test123!@#');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('http://localhost:5173/hub');
    await expect(page.locator('h1')).toContainText('Hub');
  });

  test('user can switch domains', async ({ page }) => {
    // Login first
    // Select domain from dropdown
    // Verify tasks update
  });

  test('quick-add creates task', async ({ page }) => {
    // Navigate to hub
    // Press Cmd+K
    // Type "task Buy milk tomorrow"
    // Verify task appears in hub
  });
});
```

### Afternoon: CI/CD Pipeline (2 hours)

**Task 6.3: Create GitHub Actions workflow**
```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: command_center
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - run: pnpm install

      - run: pnpm lint

      - run: pnpm check

      - run: pnpm test

      - run: pnpm test:e2e
        env:
          SUPABASE_URL: http://localhost:54321
          SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
```

**Validation**:
```bash
# Run all tests locally first
pnpm test
pnpm test:e2e

# Push to trigger CI
git add .
git commit -m "feat: Hub MVP implementation"
git push origin 001-central-hub

# Check GitHub Actions
# All checks should pass
```

---

## DAY 7: FINAL POLISH & DEPLOYMENT PREP

### All Day: Refinements & Documentation (8 hours)

**Task 7.1: Complete remaining components**
- Command palette (Cmd+K quick-add)
- Real-time subscriptions
- Error boundaries and loading states
- Accessibility attributes (role, aria-label)

**Task 7.2: Documentation**
- Architecture decision record (docs/adr/hub-mvp.md)
- Deployment runbook (docs/operations/deployment.md)
- Quick-start guide (QUICKSTART.md)

**Task 7.3: Final testing**
- Run full test suite: `pnpm test && pnpm test:e2e`
- Accessibility audit: `pnpm test:a11y`
- Performance check: load test with 100+ tasks
- Security: gitleaks scan for secrets

---

## CHECKLIST: MVP DEPLOYMENT READY

### Functionality
- [ ] Users can sign up and sign in
- [ ] Hub displays today's tasks + upcoming events
- [ ] Domain filtering works
- [ ] Search panel with filters implemented
- [ ] Command palette (Cmd+K) creates tasks
- [ ] Real-time updates show new items
- [ ] All data isolated by workspace/domain (RLS enforced)

### Quality
- [ ] All Phase 1-3 tests pass
- [ ] RLS isolation verified
- [ ] No secrets in repo (gitleaks clean)
- [ ] Accessibility audit passes (WCAG 2.2 AA)
- [ ] CI/CD green on every commit

### Documentation
- [ ] Architecture decisions recorded
- [ ] Deployment runbook created
- [ ] Quick-start guide written
- [ ] Schema documented
- [ ] API contracts documented

### Deployment
- [ ] Docker Compose stack runs cleanly
- [ ] All migrations apply successfully
- [ ] Test data seeds without errors
- [ ] Frontend builds without errors
- [ ] No TypeScript errors
- [ ] No linting errors

---

## NEXT PHASE (Post-MVP)

Once Hub MVP is deployed and validated:
- **Phase 4**: Domain & collection management, task workflows, boards
- **Phase 5**: Calendar views, recurrence, ICS export, reminders
- **Phase 6**: Notifications pipeline, comments, dashboards, reporting

---

## RESOURCES & REFERENCES

### Supabase
- Docs: https://supabase.com/docs
- JS Client: https://supabase.com/docs/reference/javascript
- RPC: https://supabase.com/docs/guides/database/functions

### SvelteKit
- Docs: https://kit.svelte.dev
- Forms: https://kit.svelte.dev/docs/form-actions
- Load: https://kit.svelte.dev/docs/load

### Testing
- Vitest: https://vitest.dev
- Playwright: https://playwright.dev
- TanStack Query: https://tanstack.com/query/latest/docs/svelte/overview

---

## SUMMARY

This quick-start guide breaks down Command Center MVP into 7 daily sprints:

1. **Day 1**: Auth routes & session management
2. **Day 2**: Database seeding & env setup
3. **Day 3**: Hub backend RPCs
4. **Day 4-5**: Hub frontend UI & stores
5. **Day 6**: Testing & CI/CD
6. **Day 7**: Polish & deployment prep

Each day has concrete, actionable tasks with code examples. Follow this sequentially, test after each day, and you'll have a production-ready MVP in 7 business days.

**Start now. Good luck!**
