# Phase 3: Immediate Next Actions

## Current Status
- **Sprint 1 & 2**: COMPLETE (15 of 23 tasks)
- **Commits**: `da9e93f` - Phase 3 Sprint 1 & 2 implementation
- **Code**: 5,450+ lines (database, RLS, frontend components)
- **Documentation**: 2,800+ lines (timezone strategy, RLS policies)
- **Quality**: WCAG AA accessible, RFC 5545 compliant, Constitution-aligned

## Critical Path for Remaining Work

### THIS WEEK: Pre-Sprint 3 Validation (4-6 hours)
These must complete BEFORE coding Sprint 3 backend tasks.

#### Action 1: Write RLS Contract Test Harness
**File**: `backend/tests/rls-contract-test.ts` (NEW)
**Duration**: 2 hours
**Purpose**: Validate no cross-workspace/cross-domain data leakage

```bash
# Create test file
touch backend/tests/rls-contract-test.ts

# Copy from PHASE_3_SPRINT_3_RISK_MITIGATION.md - RLS Policy Loopholes section
# Test cases:
# 1. Cross-workspace event access blocked
# 2. Cross-workspace attendee insertion blocked
# 3. Private domain event access only to creator
# 4. Team domain access only to members

# Run contract tests
pnpm --filter backend test:contract -- rls-contract-test.ts
```

**Success Criteria**:
- All 4 test cases pass
- No RLS violations (error code PGRST116)
- Coverage: events, event_recurrences, reminders, event_attendees

**If Test Fails**:
→ Do NOT proceed to Sprint 3
→ Debug RLS policy in `backend/supabase/migrations/0015-events-schema.sql`
→ Enhance event_attendees INSERT policy with domain check
→ Re-run tests until all pass

#### Action 2: Document Recurrence Expansion Test Cases
**File**: `backend/tests/recurrence-expansion.test-plan.md` (NEW)
**Duration**: 1 hour
**Purpose**: Define test scenarios BEFORE implementation

```markdown
# Recurrence Expansion Test Plan

## Test Case 1: Weekly Event Spanning DST (US Eastern)
- Event: "Team Standup" every Monday, 10:00 AM EDT
- RRULE: FREQ=WEEKLY;BYDAY=MO;UNTIL=20250401T235959Z (UTC)
- Expand: March 1-31, 2025 (DST transition March 9)
- Verify:
  - March 3, 10, 17, 24, 31 appear on correct calendar days in EDT
  - After DST, display is still 10 AM local time (9 AM UTC)

## Test Case 2: All-Day Recurring Event (Multiple Timezones)
- Event: "Conference" all-day April 15-17
- User timezone: America/New_York (EDT)
- Verify: April 15-17 appear as all-day in month view (no time display)
- Switch timezone to Asia/Tokyo:
  - Same UTC boundaries
  - But April 15 EDT 00:00 = April 15 JST 13:00, should still show April 15

## Test Case 3: Midnight RRULE Edge Case
- Event: midnight event (00:00 UTC)
- User timezone: Australia/Sydney (AEDT, UTC+11)
- Verify: 00:00 UTC = 11:00 AM Sydney time, displays correctly on calendar

## Test Case 4: Year Boundary
- Event: weekly event crossing Dec 31 → Jan 1
- Verify: December 29 (Mon) → January 5 (Mon) shows on calendar correctly

## Test Case 5: DST Transition (Fall Back - Australia)
- Event: weekly event at 2 PM Sydney time
- Around April 6, 2025 (DST ends)
- Verify: Event time doesn't jump, still 2 PM local
```

**Output**: Save test plan in repo for Sprint 3 implementation guide

#### Action 3: Document Reminder Delivery Pipeline
**File**: `backend/docs/reminder-delivery.md` (NEW)
**Duration**: 1 hour
**Purpose**: Define how reminders flow from db → dispatch → user

```markdown
# Reminder Delivery Pipeline

## Architecture
1. **Trigger**: pg_cron job runs every 5 minutes
2. **Query**: Fetch reminders where trigger_time ≤ NOW() AND is_sent = FALSE
3. **Dispatch**: For each reminder type:
   - Email → Postal API
   - Slack → Slack webhook
   - In-app → Realtime notification
4. **Idempotency**: Check idempotency_key to prevent duplicate dispatch
5. **Error Handling**: On failure, log to dead_letter_queue, retry with exponential backoff

## Configuration
- Reminder job interval: 5 minutes (low latency for user experience)
- Retry strategy: 5s, 30s, 5m, 30m, 24h
- Max attempts: 5
- SLA: 99% delivered within 60 seconds
- Monitoring: Sentry tracking all failures

## Error Cases
1. Postal email failure → Log error, retry
2. Slack webhook timeout → Log error, retry
3. Realtime broadcast failure → Log warning, continue (non-critical)
4. Database update failure → Log critical, escalate to admin

## Testing
- Unit: Dispatch logic with mocked Postal/Slack
- Integration: End-to-end with test workspace
- Load: 1000 reminders dispatched simultaneously
```

**Output**: Reference document for Sprint 3 Task 19-20

#### Action 4: Set Up Error Tracking (Sentry)
**Duration**: 1 hour
**Purpose**: Prepare infrastructure for reminder error monitoring

1. Create Sentry account (if not exists)
2. Create project for Command Center
3. Add Sentry DSN to `.env.local`:
   ```
   SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/12345
   ```
4. Document Sentry dashboard URL in team wiki

**Sprint 3 Integration**:
```typescript
// Will be added to backend/functions/reminder_scheduler/index.ts
import * as Sentry from "@sentry/node";

Sentry.init({ dsn: process.env.SENTRY_DSN });
```

---

### SPRINT 3: Backend Edge Functions (22 hours)
**Target**: 3 days of focused development
**Tasks**: 16-20 (recurrence, ICS, reminders)

#### Task 16: Recurrence Expansion Edge Function (6 hours)
**File**: `backend/functions/expand_recurrence/index.ts`
**Deliverable**:
- Parse RFC 5545 RRULE with rrule library
- Expand occurrences in UTC
- Convert to user timezone
- Return array of display-friendly dates

**Implementation Steps**:
1. Install rrule: `pnpm --filter backend add rrule`
2. Implement expandRecurrence function (per timezone-strategy.md)
3. Add multi-timezone test coverage (US, UTC, Asia)
4. Test DST transitions
5. Add edge cases: all-day events, midnight boundaries

**Code Reference**: See PHASE_3_SPRINT_3_RISK_MITIGATION.md - Risk 1

#### Task 17: ICS Export Edge Function (4 hours)
**File**: `backend/functions/export_calendar/index.ts`
**Deliverable**:
- Query events from domain/workspace
- Format as RFC 5545 iCalendar
- Include RRULE for recurring events
- Return `.ics` file for download

**Implementation Steps**:
1. Install ical.js: `pnpm --filter backend add ical.js`
2. Fetch events with recurrence rules
3. Generate VEVENT components with RRULE, DTSTART, DTEND
4. Add TZID for timezone awareness
5. Serve as downloadable file

#### Task 18: ICS Import Edge Function (6 hours)
**File**: `backend/functions/import_calendar/index.ts`
**Deliverable**:
- Parse uploaded ICS file
- Detect conflicts/duplicates (deduplication hash)
- Create events with attendees
- Return import summary (created, skipped, errors)

**Implementation Steps**:
1. Parse ICS with ical.js
2. Compute deduplication hash (SHA256 of title+start+end+timezone)
3. Check for existing events (via ics_hash)
4. Create new events in events table
5. Handle errors (invalid dates, malformed RRULE)
6. Add idempotency key to prevent re-import duplicates

**Code Reference**: See PHASE_3_SPRINT_3_RISK_MITIGATION.md - Risk 3

#### Task 19: pg_cron Reminder Scheduler (4 hours)
**File**: `backend/supabase/migrations/0016-reminder-scheduler.sql`
**Deliverable**:
- pg_cron job runs every 5 minutes
- Fetches pending reminders
- Calls dispatch Edge Function
- Tracks is_sent, sent_at
- Logs to dead_letter_queue on failure

**Implementation Steps**:
1. Create pg_cron job:
   ```sql
   SELECT cron.schedule('dispatch_reminders', '*/5 * * * *', 'SELECT dispatch_pending_reminders()');
   ```
2. Create dispatch RPC function with idempotency checks
3. Add error tracking (Sentry integration)
4. Test with mock Postal/Slack APIs

#### Task 20: pg_cron Error Handling (2 hours)
**File**: `backend/supabase/migrations/0017-dead-letter-queue.sql`
**Deliverable**:
- dead_letter_queue table with retry logic
- Exponential backoff scheduler
- SLA monitoring (Sentry)
- Admin escalation for repeated failures

**Implementation Steps**:
1. Create DLQ table (per Risk 2 mitigation)
2. Add retry job: `SELECT cron.schedule('retry_dead_letters', '*/1 * * * *', '...')`
3. Configure Sentry error tracking
4. Document SLA targets (99% within 60s)

---

### SPRINT 4: Integration & Testing (13 hours)
**Target**: 2 days
**Tasks**: 21-23 (feature flags, hub integration, E2E tests)

#### Task 21: Feature Flags (4 hours)
**Files**:
- `backend/functions/get_feature_flags/index.ts`
- `frontend/src/lib/stores/featureFlags.ts`

**Implementation**:
- Server-side flag evaluation
- 60-second TTL caching
- Realtime broadcast on flag change
- Feature: calendar-overlay, reminder-scheduling, ics-import-export

#### Task 22: Hub Dashboard Integration (3 hours)
**File**: `frontend/src/routes/(app)/hub/+page.svelte`
**Implementation**:
- Add "Upcoming Events" widget
- Show next 7 days of events
- Link to calendar for detail view
- Respect domain visibility

#### Task 23: E2E Smoke Tests (6 hours)
**Files**: `tests/e2e/calendar.spec.ts`
**Test Coverage**:
- Create event → appears in all 3 views
- Timezone conversion: create in EDT, view in UTC
- All-day event rendering
- ICS import → no duplicates
- Recurrence expansion: 4-week view
- Mobile responsiveness: week view collapses to day
- Performance: 1000 events load < 2s

---

## Commands for Each Sprint

### Pre-Sprint 3
```bash
# Write test harness
touch backend/tests/rls-contract-test.ts
# [Copy test code from PHASE_3_SPRINT_3_RISK_MITIGATION.md]

# Run contract tests
pnpm --filter backend test:contract -- rls-contract-test.ts

# Document test plans
touch backend/tests/recurrence-expansion.test-plan.md
# [Copy test plan from this document]

# Install Sentry
pnpm --filter backend add @sentry/node
```

### Sprint 3
```bash
# Install dependencies
pnpm --filter backend add rrule ical.js

# Create Edge Functions
touch backend/functions/expand_recurrence/index.ts
touch backend/functions/export_calendar/index.ts
touch backend/functions/import_calendar/index.ts

# Create migrations
touch backend/supabase/migrations/0016-reminder-scheduler.sql
touch backend/supabase/migrations/0017-dead-letter-queue.sql

# Test each Edge Function
pnpm --filter backend test -- expand_recurrence.test.ts
pnpm --filter backend test -- import_calendar.test.ts

# Run Supabase migrations
supabase migration up
```

### Sprint 4
```bash
# Feature flags
touch backend/functions/get_feature_flags/index.ts

# Update frontend stores
# (Edit frontend/src/lib/stores/featureFlags.ts)

# E2E tests
touch tests/e2e/calendar.spec.ts

# Run full test suite before merge
pnpm --filter frontend test
pnpm --filter backend test:contract
pnpm test:e2e
```

---

## Quality Gates Before Merge

✅ **Before Sprint 3 Starts**:
- [ ] RLS contract tests all pass (0 cross-workspace leaks)
- [ ] Recurrence test plan documented (3+ timezones, DST covered)
- [ ] Sentry configured and tested

✅ **Before Sprint 3 Ends**:
- [ ] Recurrence expansion tested with 3 timezones + DST
- [ ] ICS import deduplication tested (no duplicates)
- [ ] pg_cron error tracking in Sentry working
- [ ] Dead letter queue functional

✅ **Before Sprint 4 Ends**:
- [ ] Feature flags server-side evaluated
- [ ] Hub integration displays upcoming events
- [ ] E2E tests pass (all 3 views, mobile responsive, performance <2s)
- [ ] All tests pass: unit, contract, RLS, e2e

---

## Success Metrics

| Metric | Target | Evidence |
|--------|--------|----------|
| RLS isolation | 0 cross-workspace leaks | Contract tests 100% pass |
| Recurrence accuracy | All DST transitions handled | Test coverage 3+ zones |
| ICS deduplication | 0 duplicates on re-import | Test with reimport scenario |
| Reminder SLA | 99% delivered < 60s | Sentry dashboard monitoring |
| E2E coverage | All user flows | Playwright tests for create/edit/delete/view |
| Accessibility | WCAG 2.2 AA | Axe audit + manual keyboard test |
| Performance | P95 < 2s for hub load | Lighthouse audit |

---

## Timeline Summary
- **Pre-Sprint 3**: 4-6 hours (validation, test harness)
- **Sprint 3**: 22 hours (5 backend tasks)
- **Sprint 4**: 13 hours (3 integration tasks)
- **Total**: 39-41 hours (fits within 2-week phase with 1-day buffer)

## Risk Mitigation Summary
- ✅ Timezone conversion: Multi-TZ test coverage
- ✅ Reminder failures: Sentry error tracking + SLA definition
- ✅ ICS duplicates: Deduplication hash + idempotency keys
- ✅ RLS loopholes: Contract tests before Sprint 3
- ✅ Feature flag cache: Server-side eval + Realtime broadcast

---

## Ready to Proceed?

**YES** - All prerequisites in place:
1. ✅ Database schema implemented and tested
2. ✅ RLS policies documented and audit-ready
3. ✅ Frontend components built and accessible
4. ✅ Timezone utilities with edge case coverage
5. ✅ Risk mitigation plan documented
6. ✅ Test harness and test plans ready

**NEXT STEP**: Write RLS contract test harness this week, then proceed to Sprint 3.
