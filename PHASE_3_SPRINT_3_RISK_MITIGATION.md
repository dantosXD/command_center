# Phase 3 Sprint 3 Risk Mitigation Plan

## Overview
Based on consensus analysis, 5 critical risks identified for Sprints 3-4. This document outlines mitigation strategies before implementation begins.

## Risk Assessment Summary

| Risk | Severity | Likelihood | Impact | Mitigation |
|------|----------|-----------|--------|-----------|
| Timezone conversion bugs in recurrence expansion | HIGH | MEDIUM | Events appear on wrong days in calendar | Multi-TZ test coverage before coding |
| pg_cron reminder delivery failures unnoticed | HIGH | HIGH | Silent failures, users miss reminders | Error tracking integration (Sentry) + SLA definition |
| ICS import creates duplicate events | MEDIUM | MEDIUM | Data corruption, user confusion | Deduplication hash + idempotency keys |
| RLS policy loopholes (cross-workspace access) | MEDIUM | LOW | Data leakage, security breach | Contract tests NOW (before Sprint 3) |
| Feature flag cache invalidation | MEDIUM | LOW | Users don't see flag toggle immediately | Server-side evaluation + short TTL |

---

## Risk 1: Timezone Conversion Bugs in Recurrence Expansion
**Severity**: HIGH | **Phase**: Sprint 3 (Task 16)

### Problem
- rrule library returns UTC dates
- Frontend calendar expects user timezone dates
- Mismatch causes events to appear on wrong calendar days
- Example: RRULE for "every Monday" in EDT. If expansion returns UTC Monday, displays on Sunday in EDT calendar

### Mitigation Strategy

#### 1. Pre-Implementation Test Cases (WRITE NOW)
Create `backend/functions/expand_recurrence/expand_recurrence.test.ts`:
- Test case: Recurring weekly event spanning DST transition (March US, September AU)
- Test case: All-day recurring event in EDT showing correct date in month view
- Test case: User in Tokyo timezone, RRULE in UTC, expansion returns correct dates
- Test case: Midnight RRULE (00:00 UTC) expands to correct local midnight
- Test case: User changes timezone after event creation, recurrence still correct

#### 2. Implementation Checklist (Sprint 3)
- [ ] rrule library returns UTC Date objects
- [ ] Edge Function converts UTC → user timezone before returning to frontend
- [ ] Frontend month view receives user-timezone-adjusted dates
- [ ] Test coverage: 3+ timezones (US, UTC, Asia) with DST transitions
- [ ] Test coverage: all-day events, recurring all-day events, timed recurring events

#### 3. Code Pattern
```typescript
// backend/functions/expand_recurrence/index.ts
export async function expandRecurrence(
  startDate: Date,         // UTC
  rruleString: string,     // UTC
  userTimezone: string,    // e.g., 'America/New_York'
  expandDays: number = 30
): Promise<{ utcDate: Date; displayDate: Date; timezone: string }[]> {
  // Expand in UTC
  const rruleSet = new RRuleSet();
  rruleSet.rrule(new RRule(rruleString, { dtstart: startDate }));
  const utcOccurrences = rruleSet.between(startDate, endDate);

  // Convert to user timezone for display
  const displayOccurrences = utcOccurrences.map(utcDate => ({
    utcDate,
    displayDate: convertUTCToUserTimezone(utcDate, userTimezone),
    timezone: userTimezone
  }));

  return displayOccurrences;
}
```

#### 4. Testing Command
```bash
pnpm --filter backend test -- expand_recurrence.test.ts --coverage
```

---

## Risk 2: pg_cron Reminder Delivery Failures Go Unnoticed
**Severity**: HIGH | **Phase**: Sprint 3 (Task 19-20)

### Problem
- pg_cron scheduler runs, but Postal email fails silently
- User never knows reminder wasn't delivered
- Dead letter queue in plan, but error alerting not implemented
- SLA targets (99% within 60s) not monitored

### Mitigation Strategy

#### 1. Error Tracking Integration (DURING Sprint 3)
Add Sentry error tracking:
```typescript
// backend/functions/reminder_scheduler/index.ts
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: "production"
});

export async function dispatchReminders() {
  try {
    // reminder dispatch logic
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        component: "reminder_scheduler",
        attempt: retryCount
      },
      level: "fatal"
    });
    // Write to dead letter queue
    await logToDeadLetterQueue(error);
  }
}
```

#### 2. Dead Letter Queue Schema (Sprint 3, Task 20)
```sql
CREATE TABLE reminder_dead_letter_queue (
  id UUID PRIMARY KEY,
  reminder_id UUID REFERENCES reminders(id),
  error_message TEXT,
  error_stack TEXT,
  attempt_count INT,
  next_retry_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_dlq_unresolved ON reminder_dead_letter_queue(resolved_at)
WHERE resolved_at IS NULL;
```

#### 3. SLA Definition (DOCUMENT NOW)
Create `backend/docs/reminder-sla.md`:
- Target: 99% of reminders delivered within 60 seconds
- Retry strategy: exponential backoff (5s, 30s, 5m, 30m)
- Max attempts: 5
- Escalation: After 5 failed attempts, notify workspace admin via in-app notification
- Monitoring: Sentry dashboard tracking reminder failures by type (email/Slack/in-app)

#### 4. Monitoring Dashboard (DOCUMENT URL)
Link to Sentry dashboard showing:
- Reminder dispatch success rate
- P95 delivery time
- Error distribution by type
- Top failing reminders

#### 5. Alert Configuration
```typescript
// Alert if >1% of reminders fail in last 1 hour
Sentry.captureMessage(
  "Reminder delivery SLA violation: >1% failure rate",
  "error"
);
```

---

## Risk 3: ICS Import Creates Duplicate Events
**Severity**: MEDIUM | **Phase**: Sprint 3 (Task 18)

### Problem
- User imports same ICS file twice
- Creates duplicate events with same title/time
- No conflict detection or deduplication
- Data corruption and confusion

### Mitigation Strategy

#### 1. Deduplication Hash (IMPLEMENT Sprint 3)
Add to events table:
```sql
ALTER TABLE events ADD COLUMN ics_hash TEXT UNIQUE;
-- Hash = SHA256(title + start_at + end_at + timezone)
```

#### 2. ICS Import Logic
```typescript
// backend/functions/import_calendar/index.ts
import crypto from "crypto";

function computeEventHash(event: any): string {
  const data = `${event.title}|${event.start_at}|${event.end_at}|${event.timezone}`;
  return crypto.createHash("sha256").update(data).digest("hex");
}

export async function importCalendar(icsContent: string, domainId: string) {
  const events = parseICS(icsContent);

  for (const event of events) {
    const hash = computeEventHash(event);

    // Check if event already exists
    const existing = await supabase
      .from("events")
      .select("id")
      .eq("ics_hash", hash)
      .eq("domain_id", domainId)
      .single();

    if (existing.data) {
      // Skip or update
      continue;
    }

    // Insert new event
    await supabase.from("events").insert({
      ...event,
      ics_hash: hash
    });
  }
}
```

#### 3. Idempotency Key (IMPLEMENT Sprint 3)
```sql
ALTER TABLE events ADD COLUMN import_idempotency_key TEXT UNIQUE;
-- Key = user_id + import_timestamp + file_hash
```

#### 4. Testing
```typescript
// Test: Import same ICS twice, expect 0 duplicates
it("should not create duplicates on reimport", async () => {
  const icsContent = fs.readFileSync("test.ics", "utf-8");

  await importCalendar(icsContent, domainId);
  const count1 = await getEventCount(domainId);

  await importCalendar(icsContent, domainId);
  const count2 = await getEventCount(domainId);

  expect(count1).toBe(count2);
});
```

---

## Risk 4: RLS Policy Loopholes (Cross-Workspace Access)
**Severity**: MEDIUM | **Phase**: BEFORE Sprint 3 (Task 7 Validation)

### Problem
- event_attendees INSERT policy only checks event creator, not domain accessibility
- User in Workspace A could add self to event in Workspace B if they know event_id
- No audit logging for RLS violation attempts

### Mitigation Strategy

#### 1. Contract Test Harness (WRITE NOW - THIS WEEK)
Create `backend/tests/rls-contract-test.ts`:

```typescript
import { createClient } from "@supabase/supabase-js";

describe("RLS Contract Tests - Calendar", () => {
  let aliceClient: SupabaseClient; // Workspace A member
  let bobClient: SupabaseClient;   // Workspace B member

  it("should prevent cross-workspace event access", async () => {
    // Create event in Workspace B as Bob
    const { data: event } = await bobClient
      .from("events")
      .insert({ title: "Bob's Event", workspace_id: workspaceB_id, ... })
      .select()
      .single();

    // Alice tries to select Bob's event
    const { data, error } = await aliceClient
      .from("events")
      .select("*")
      .eq("id", event.id);

    expect(data).toBeNull(); // Should be blocked
    expect(error?.code).toBe("PGRST116"); // RLS violation
  });

  it("should prevent cross-workspace attendee insertion", async () => {
    // Create event in Workspace B as Bob
    const event = await createEventInWorkspace(bobClient, workspaceB_id);

    // Alice tries to add herself as attendee
    const { error } = await aliceClient
      .from("event_attendees")
      .insert({ event_id: event.id, user_id: alice_id, status: "accepted" });

    expect(error?.code).toBe("PGRST116"); // RLS violation
  });

  it("should allow private domain event access only to creator", async () => {
    // Create private domain event as Alice in Workspace A
    const event = await createPrivateDomainEvent(aliceClient, workspaceA_id);

    // Bob (Workspace A, not domain member) tries to access
    const { data, error } = await bobClient
      .from("events")
      .select("*")
      .eq("id", event.id);

    expect(data).toBeNull();
    expect(error?.code).toBe("PGRST116");
  });
});
```

Run with:
```bash
pnpm --filter backend test:contract -- rls-contract-test.ts
```

#### 2. RLS Policy Enhancement (IF needed after tests)
If contract tests fail, add explicit domain check to event_attendees INSERT:

```sql
CREATE POLICY "event_attendees_insert_domain_check"
ON event_attendees FOR INSERT WITH CHECK (
  event_id IN (
    SELECT id FROM events
    WHERE domain_id IN (
      SELECT id FROM domains
      WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_members
        WHERE user_id = auth.uid() AND status = 'active'
      )
    )
  )
);
```

#### 3. Audit Logging (BEFORE merge)
```sql
CREATE TABLE rls_violation_audit (
  id UUID PRIMARY KEY,
  table_name TEXT,
  operation TEXT,
  attempted_by UUID,
  attempted_at TIMESTAMPTZ DEFAULT NOW(),
  violation_reason TEXT,
  payload JSONB
);

-- Trigger on every failed RLS check (via app logging)
```

---

## Risk 5: Feature Flag Cache Invalidation
**Severity**: MEDIUM | **Phase**: Sprint 4 (Task 21)

### Problem
- Feature flag cached on frontend
- Admin enables flag on server
- User still sees flag as disabled until cache expires
- Confusing for testing/rollout

### Mitigation Strategy

#### 1. Flag Evaluation Strategy (DOCUMENT NOW)
Create `backend/docs/feature-flags.md`:
```markdown
## Feature Flag Evaluation

### Server-Side Evaluation (Recommended)
- Flag state stored in Supabase `feature_flags` table
- Evaluated on every API call
- TTL: 60 seconds (refresh from server every minute)
- Real-time: Optional Realtime channel broadcast on flag change

### Implementation
1. Endpoint: GET /api/feature-flags
2. Response: { calendar-overlay: true, reminder-scheduling: false, ... }
3. Client caches for 60 seconds
4. On flag change, server broadcasts via Realtime

### Example
```typescript
// frontend/src/lib/stores/featureFlags.ts
export const featureFlags = writable<FeatureFlags>({});

onMount(async () => {
  const flags = await fetch('/api/feature-flags');
  featureFlags.set(flags);

  // Subscribe to real-time updates
  supabase.channel('public:feature_flags')
    .on('*', () => {
      // Refresh flags immediately
      refreshFeatureFlags();
    })
    .subscribe();
});
```
```

#### 2. Implementation (Sprint 4)
```typescript
// backend/functions/get_feature_flags/index.ts
export async function getFeatureFlags(workspaceId: string) {
  const flags = await supabase
    .from("feature_flags")
    .select("*")
    .eq("workspace_id", workspaceId);

  return {
    "calendar-overlay": flags.data?.find(f => f.name === "calendar-overlay")?.enabled ?? false,
    "reminder-scheduling": flags.data?.find(f => f.name === "reminder-scheduling")?.enabled ?? false,
    "ics-import-export": flags.data?.find(f => f.name === "ics-import-export")?.enabled ?? false
  };
}
```

#### 3. Testing
```typescript
it("should update flag immediately via Realtime", async () => {
  // Flag initially disabled
  expect(get(featureFlags)["calendar-overlay"]).toBe(false);

  // Admin enables flag
  await adminEnableFlag("calendar-overlay");

  // Broadcast Realtime message
  await sleep(100); // Wait for Realtime delivery

  // Flag should be enabled
  expect(get(featureFlags)["calendar-overlay"]).toBe(true);
});
```

---

## Implementation Checklist

### BEFORE Sprint 3 Starts
- [ ] Write RLS contract test harness (`backend/tests/rls-contract-test.ts`)
- [ ] Run contract tests against current RLS policies
- [ ] Document timezone test cases for recurrence expansion
- [ ] Document reminder delivery SLA (`backend/docs/reminder-sla.md`)
- [ ] Add Sentry error tracking configuration
- [ ] Create feature flag evaluation strategy document

### During Sprint 3
- [ ] Implement timezone-aware recurrence expansion with test coverage
- [ ] Implement ICS import deduplication hash + idempotency keys
- [ ] Implement pg_cron error tracking + dead letter queue
- [ ] Document reminder delivery pipeline (Postal email, Slack webhook, in-app)

### Before Merge
- [ ] Run RLS violation audit (contract tests)
- [ ] Verify recurrence expansion in 3+ timezones with DST
- [ ] Test ICS import deduplication (reimport same file)
- [ ] Verify pg_cron error tracking in Sentry
- [ ] Document feature flag rollout plan

### Sprint 4
- [ ] Implement feature flag evaluation endpoint
- [ ] Implement Realtime flag update broadcast
- [ ] Add flag caching strategy on frontend

---

## Quality Gate Sign-Off

Before merge to main, verify:
- ✅ RLS contract tests pass (0 cross-workspace leaks)
- ✅ Recurrence expansion tests pass (3 timezones, DST transitions)
- ✅ ICS import deduplication tests pass (no duplicates on reimport)
- ✅ Error tracking configured (Sentry receiving reminder errors)
- ✅ Feature flag strategy documented (server-side evaluation + TTL)

---

## Timeline Impact

All mitigations can be completed within Phase 3 timeline:
- Pre-Sprint 3 tasks (contract tests, docs): 4-6 hours
- During Sprint 3: Integrated into Task 16-20 (~2 extra hours per task)
- Sprint 4: Feature flag implementation (2 hours)

**Estimated Additional Effort**: 6 hours (fits within Phase 3 buffer)
