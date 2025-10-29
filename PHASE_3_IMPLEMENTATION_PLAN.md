# Phase 3 Implementation Plan
## Calendar & Reminders (2 Weeks)

**Status**: 🟢 READY TO START (after Phase 2 deployment)
**Timeline**: Weeks 5-6
**Sprints**: 4a (RED), 4b (GREEN), 4c (REFACTOR)
**Deliverables**: Calendar UI, Reminder System, ICS Support

---

## PHASE 3 OVERVIEW

Phase 3 extends the Command Center MVP with calendar management and automated reminders:

```
Phase 2 (DONE):    Task CRUD + RLS + UI ✅
Phase 3 (NOW):     Calendar + Events + Reminders
Phase 4 (NEXT):    Notifications + Digests
Phase 5 (FUTURE):  Hub Aggregation + Collab
Phase 6 (FINAL):   Hardening + Release
```

---

## ARCHITECTURE DECISIONS

### Calendar Data Model

```sql
events (
  id UUID PRIMARY KEY,
  domain_id UUID FK,
  title TEXT NOT NULL,
  description TEXT,
  start_at TIMESTAMP NOT NULL,
  end_at TIMESTAMP NOT NULL,
  timezone VARCHAR(255),
  recurrence_rrule TEXT,  -- RFC 5545
  exdates TEXT[],         -- Exception dates
  location TEXT,
  attendees TEXT[],
  reminders INT[],        -- Minutes before
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)

recurrences (
  id UUID PRIMARY KEY,
  event_id UUID FK,
  occurrence_date DATE,
  is_exception BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
)

reminders (
  id UUID PRIMARY KEY,
  event_id UUID FK,
  user_id UUID FK,
  reminder_at TIMESTAMP NOT NULL,
  sent_at TIMESTAMP,
  method TEXT,  -- email, slack, in_app
  created_at TIMESTAMP DEFAULT NOW()
)
```

### Key Design Patterns

1. **RRULE Storage**: Store RFC 5545 RRULE string, expand on demand
2. **Timezone Handling**: Store timezone, convert on client
3. **Optimistic Updates**: Same pattern as Phase 2 tasks
4. **RLS Enforcement**: Domain isolation via domain_members
5. **Recurrence Expansion**: Edge Function expands 30-day window
6. **Reminder Delivery**: Outbox pattern with pg_cron trigger

---

## SPRINT 4A: RED PHASE (Tests First)

### Step 1: Calendar CRUD Tests (25 tests)

**File**: `tests/contract/calendar.spec.ts`

```typescript
// Create event tests
- Should create event with required fields
- Should validate required fields (title, start_at, end_at)
- Should enforce RLS: user can only create in accessible domains
- Should set created_at and updated_at timestamps
- Should handle timezone conversion
- Should validate start < end timestamps

// List events tests
- Should list events for accessible domains
- Should filter by date range
- Should filter by calendar/collection
- Should support pagination
- Should support sorting (by start_at, title)
- Should expand recurring events in date range

// Read event tests
- Should fetch single event
- Should expand recurrence if RRULE present
- Should include attendees and reminders

// Update event tests
- Should update event fields
- Should enforce RLS
- Should update recurrence rule
- Should invalidate cached recurrences

// Delete event tests
- Should delete event and associated data
- Should cascade to reminders
- Should enforce RLS

// Recurring event tests
- Should expand RRULE for date range
- Should handle exception dates (exdates)
- Should support all FREQ values (DAILY, WEEKLY, etc.)
- Should handle timezone-aware expansion
```

### Step 2: RLS Tests (10 tests)

**File**: `tests/rls/calendar-access.spec.ts`

```typescript
// Domain isolation tests
- Alice cannot view Bob's private domain events
- Bob cannot view Alice's private domain events
- Shared domain events visible when member
- Shared domain events hidden when not member

// Permission tests
- Cannot update events in inaccessible domain
- Cannot delete events in inaccessible domain
- Attendee restrictions enforced

// Recurrence tests
- Expanded recurrences respect RLS
- Reminder queries respect RLS
```

### Step 3: Unit Tests (20 tests)

**File**: `frontend/src/lib/stores/calendar.test.ts`

```typescript
// Store initialization
- Initialize with empty events

// Calendar loading
- Load events for date range
- Set loading state
- Handle errors

// Event CRUD
- Create event (optimistic)
- Update event (optimistic + rollback)
- Delete event (optimistic + rollback)

// Recurrence handling
- Expand recurring events
- Update exception dates
- Filter by recurring/non-recurring

// Derived stores
- Filter by date
- Filter by attendee
- Get calendar count

// Error handling
- Rollback on create error
- Rollback on update error
- Rollback on delete error
```

**Total RED Phase**: 55 test specifications

---

## SPRINT 4B: GREEN PHASE (Implementation)

### Step 1: Database Schema (1-2 hours)

**File**: `backend/supabase/migrations/0015_calendar_events.sql`

```sql
-- Events table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id UUID NOT NULL REFERENCES public.domains(id),
  title TEXT NOT NULL,
  description TEXT,
  start_at TIMESTAMP NOT NULL,
  end_at TIMESTAMP NOT NULL,
  timezone VARCHAR(255) DEFAULT 'UTC',
  recurrence_rrule TEXT,
  exdates TEXT[],
  location TEXT,
  attendees TEXT[],
  reminders INT[] DEFAULT ARRAY[15, 60],  -- Minutes before
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT valid_dates CHECK (start_at < end_at)
);

-- Recurrence expansion cache
CREATE TABLE public.recurrences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  occurrence_date DATE NOT NULL,
  is_exception BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Reminders outbox
CREATE TABLE public.reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  reminder_at TIMESTAMP NOT NULL,
  sent_at TIMESTAMP,
  method TEXT DEFAULT 'email',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_events_domain_start ON public.events(domain_id, start_at DESC);
CREATE INDEX idx_recurrences_date ON public.recurrences(occurrence_date);
CREATE INDEX idx_reminders_pending ON public.reminders(reminder_at, sent_at);
```

### Step 2: RLS Policies (3 policies)

**File**: `backend/supabase/migrations/0016_calendar_rls.sql`

```sql
-- Events RLS (same pattern as tasks)
CREATE POLICY events_select ON public.events
  FOR SELECT USING (
    domain_id IN (
      SELECT domain_id FROM public.domain_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY events_insert ON public.events
  FOR INSERT WITH CHECK (
    domain_id IN (
      SELECT domain_id FROM public.domain_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY events_update ON public.events
  FOR UPDATE USING (
    domain_id IN (
      SELECT domain_id FROM public.domain_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY events_delete ON public.events
  FOR DELETE USING (
    domain_id IN (
      SELECT domain_id FROM public.domain_members
      WHERE user_id = auth.uid()
    )
  );

-- Recurrence RLS (inherited from event)
CREATE POLICY recurrences_select ON public.recurrences
  FOR SELECT USING (
    event_id IN (
      SELECT id FROM public.events WHERE domain_id IN (
        SELECT domain_id FROM public.domain_members
        WHERE user_id = auth.uid()
      )
    )
  );

-- Reminder RLS (user-scoped + event domain)
CREATE POLICY reminders_select ON public.reminders
  FOR SELECT USING (
    user_id = auth.uid() AND
    event_id IN (
      SELECT id FROM public.events WHERE domain_id IN (
        SELECT domain_id FROM public.domain_members
        WHERE user_id = auth.uid()
      )
    )
  );
```

### Step 3: Calendar API Service (3-4 hours)

**File**: `frontend/src/lib/services/calendarAPI.ts`

```typescript
export const calendarAPI = {
  // Create event
  create: async (input: CreateEventInput) => {
    // Validate dates
    // Call PostgREST insert
    // Handle RLS errors
  },

  // List events (with recurrence expansion)
  list: async (domainId: string, options: {
    startDate: string,
    endDate: string,
    expandRecurrence?: boolean,
    collectionId?: string,
  }) => {
    // Query events in date range
    // Expand recurring events if requested
    // Filter by collection if provided
  },

  // Get single event
  get: async (eventId: string) => {
    // Fetch event
    // Expand recurrence if present
  },

  // Update event
  update: async (eventId: string, input: UpdateEventInput) => {
    // Update event
    // Invalidate recurrence cache
  },

  // Delete event
  delete: async (eventId: string) => {
    // Delete event (cascades to reminders)
  },

  // Export as ICS
  exportICS: async (eventId: string) => {
    // Generate RFC 5545 ICS format
  },

  // Import from ICS
  importICS: async (domainId: string, icsContent: string) => {
    // Parse ICS
    // Create events
    // Handle RRULE
  },

  // Get attendees
  listAttendees: async (eventId: string) => {
    // Fetch attendees
  },

  // Set reminders
  setReminders: async (eventId: string, reminders: number[]) => {
    // Update reminders array
  },
};
```

### Step 4: Calendar Store (3-4 hours)

**File**: `frontend/src/lib/stores/calendar.ts`

```typescript
export function createCalendarStore() {
  const store = writable<CalendarState>({
    events: [],
    selectedDate: new Date(),
    loading: false,
    error: null,
  });

  return {
    subscribe: store.subscribe,

    loadEvents: async (domainId: string, startDate: Date, endDate: Date) => {
      // Load events for date range
      // Expand recurring events
      // Set loading state
    },

    createEvent: async (data: Partial<Event>) => {
      // Optimistic create
      // Sync with server
      // Rollback on error
    },

    updateEvent: async (id: string, data: Partial<Event>) => {
      // Optimistic update
      // Sync with server
      // Rollback on error
    },

    deleteEvent: async (id: string) => {
      // Optimistic delete
      // Sync with server
      // Rollback on error
    },

    setSelectedDate: (date: Date) => {
      // Update selected date
      // Trigger reload if needed
    },

    getEventsForDate: (date: Date) => {
      // Get events for specific date
      // Return derived store
    },

    getRecurringEvents: () => {
      // Get events with RRULE
      // Return derived store
    },
  };
}
```

### Step 5: Reminder Scheduler (2-3 hours)

**File**: `backend/supabase/migrations/0017_reminder_scheduler.sql`

```sql
-- pg_cron job to trigger reminders
SELECT cron.schedule('send-pending-reminders', '* * * * *', $$
  WITH pending_reminders AS (
    SELECT * FROM reminders
    WHERE sent_at IS NULL
    AND reminder_at <= NOW()
    LIMIT 100
  )
  SELECT pending_reminders.* FROM pending_reminders
  FOR UPDATE SKIP LOCKED
$$);

-- Edge Function: process reminders
-- Call via pg_cron, sends via email/Slack
-- Updates sent_at timestamp for idempotency
```

**Total GREEN Phase**: 600+ lines of code

---

## SPRINT 4C: REFACTOR PHASE (UI Components)

### Step 1: Calendar Components (6-8 hours)

1. **CalendarMonth.svelte** (250 lines)
   - Month grid view
   - Date highlighting
   - Event indicators

2. **CalendarWeek.svelte** (200 lines)
   - Week view with hours
   - Event blocks with times
   - Drag-to-reschedule

3. **CalendarDay.svelte** (200 lines)
   - Hourly breakdown
   - All-day events
   - Event details

4. **EventCreateDialog.svelte** (220 lines)
   - Event form with validation
   - RRULE builder UI
   - Attendee selection
   - Reminder configuration

5. **EventEditDialog.svelte** (220 lines)
   - Edit existing event
   - Recurrence modification
   - Exception date management

6. **EventDetail.svelte** (200 lines)
   - Event details modal
   - Attendee list
   - Reminder settings
   - Delete confirmation

7. **RecurrenceBuilder.svelte** (150 lines)
   - Visual RRULE builder
   - Frequency selection (daily, weekly, etc.)
   - Exception dates
   - Preview upcoming occurrences

8. **AttendeeManager.svelte** (100 lines)
   - Add/remove attendees
   - Invitation status
   - RSVP management

### Step 2: Calendar Page Integration (2-3 hours)

**File**: `frontend/src/routes/calendar/+page.svelte`

```svelte
<script>
  // Calendar page with:
  // - View selector (month/week/day)
  // - Date navigation
  // - Event creation shortcut
  // - Store integration
  // - Real-time updates
</script>
```

### Step 3: ICS Import/Export UI (1-2 hours)

**File**: `frontend/src/components/CalendarImportExport.svelte`

```svelte
- Import from ICS file
- Export selected event
- Export entire calendar
- Sync with Google Calendar (future)
```

**Total REFACTOR Phase**: 1400+ lines of UI code

---

## IMPLEMENTATION SEQUENCE

### Week 5 (Sprint 4a + 4b)
- Mon-Tue: RED phase - Write 55 test specifications
- Wed-Fri: GREEN phase - Implement calendar backend

### Week 6 (Sprint 4c)
- Mon-Wed: UI components (8 components)
- Thu: Integration and E2E testing
- Fri: Code review, polish, and deployment

---

## TESTING STRATEGY

### Unit Tests (Vitest)
```bash
npm --filter frontend test -- calendar
# Expect: 20 tests pass
```

### Contract Tests
```bash
npm test:contract
# Expect: 25 tests pass (+ 25 from Phase 2)
```

### RLS Tests
```bash
npm test:rls
# Expect: 10 tests pass (+ 12 from Phase 2)
```

### E2E Tests (Playwright)
```bash
npm test:e2e
# Test workflows:
# - Create event
# - Edit recurring event
# - Delete event
# - Import/export ICS
```

---

## SUCCESS CRITERIA

### Phase 3 Complete When:
- [ ] All 55 tests passing
- [ ] 8 UI components built
- [ ] ICS import/export working
- [ ] Reminder scheduler tested
- [ ] Code review approved
- [ ] E2E tests passing
- [ ] Documentation complete

---

## KNOWN DEPENDENCIES

### Must Have Before Phase 3
- ✅ Phase 2 deployed to production
- ✅ Task CRUD working
- ✅ RLS framework proven
- ✅ Store pattern validated

### External Dependencies
- [ ] Postal email service (Phase 4)
- [ ] Slack webhooks (Phase 4)
- [ ] Google Calendar API (future)

---

## RISK MITIGATION

### Risk 1: RRULE Complexity
**Mitigation**: Use rrule.js library, test extensively

### Risk 2: Recurrence Expansion Performance
**Mitigation**: Limit expansion window (30 days), cache results

### Risk 3: Timezone Handling
**Mitigation**: Store timezone, convert on client, thorough testing

### Risk 4: Reminder Delivery
**Mitigation**: Outbox pattern ensures reliability, retry logic

---

## DEPLOYMENT PLAN

### Pre-Production
1. Run full test suite (80+ tests)
2. Code review approval
3. Staging deployment
4. Smoke test in staging
5. Final approval

### Production
1. Deploy with feature flag (calendar-mvp)
2. Monitor error rates
3. Collect user feedback
4. Plan Phase 4

---

## CONSTITUTIONAL COMPLIANCE

- ✅ I. Deterministic Correctness (55 tests first)
- ✅ II. Defense-in-Depth (RLS enforced)
- ✅ III. Accessible (WCAG 2.2 AA path)
- ✅ IV. Incremental (Feature flags ready)
- ✅ V. Idempotent (Optimistic + rollback)
- ✅ VI. Reproducible (Pinned dependencies)
- ✅ VII. Test Discipline (55+ tests)

---

## PHASE 4 READINESS

After Phase 3, ready for:
- Notification system
- Email/Slack delivery
- Digest batching
- Advanced scheduling

---

**Phase 3 Status**: READY TO START
**Timeline**: Weeks 5-6 (2 weeks)
**Total Effort**: ~80 hours
**Code Delivered**: ~2200 lines (tests + implementation + UI)
**Next**: Execute Phase 3 sprint cycle

