# Timezone Strategy

## Overview

This document defines how Command Center handles timezones across the calendar, reminders, and event systems. The core principle is: **all times are stored in UTC in the database; user timezone is applied only during display and input processing**.

## Design Principles

1. **Store Everything in UTC**: Database stores all timestamps (`start_at`, `end_at`, `created_at`, `updated_at`, reminder trigger times) in UTC with `TIMESTAMPTZ` columns
2. **Store User Timezone Preference**: Each event can optionally store the user's intended timezone in the `timezone` field (e.g., `America/New_York`)
3. **Display in User's Timezone**: The frontend converts UTC timestamps to the user's local timezone for display
4. **RRULE Always in UTC**: Recurrence rules (RRULE per RFC 5545) are stored and expanded in UTC, then converted to user timezone for display
5. **Consistency Across Devices**: Because the database is the source of truth in UTC, users see consistent event times across devices and timezones

## Storage

### Events Table

```sql
CREATE TABLE events (
  id UUID PRIMARY KEY,
  workspace_id UUID NOT NULL,
  domain_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_at TIMESTAMPTZ NOT NULL,        -- Always UTC
  end_at TIMESTAMPTZ NOT NULL,          -- Always UTC
  timezone TEXT,                         -- User's intended timezone (e.g., 'America/New_York')
  is_all_day BOOLEAN DEFAULT FALSE,
  location TEXT,
  created_by UUID NOT NULL,
  updated_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(), -- UTC
  updated_at TIMESTAMPTZ DEFAULT NOW()  -- UTC
);
```

### Event Recurrences Table

```sql
CREATE TABLE event_recurrences (
  id UUID PRIMARY KEY,
  event_id UUID NOT NULL UNIQUE,
  rrule TEXT,                           -- RFC 5545 RRULE in UTC (e.g., 'FREQ=WEEKLY;BYDAY=MO,WE,FR')
  exdates TEXT[],                       -- Excluded dates in UTC ISO format
  recurrence_type TEXT,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);
```

## Conversion Logic

### Frontend: UTC → User Timezone (Display)

**Input**: UTC timestamp from database
**Output**: Formatted string in user's local timezone

```typescript
// frontend/src/lib/utils/timezone.ts

export function convertUTCToUserTimezone(utcDate: Date, userTimezone: string): Date {
  // Use Intl API or date-fns with timezone library
  // Returns a Date object adjusted to user's timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: userTimezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const parts = formatter.formatToParts(utcDate);
  // Reconstruct as local timezone date
  return new Date(utcDate.toLocaleString('en-US', { timeZone: userTimezone }));
}

export function formatEventTime(utcDate: Date, userTimezone: string, format = 'short'): string {
  // Returns '3:30 PM' or '3:30 PM EST' depending on format
  return new Intl.DateTimeFormat('en-US', {
    timeZone: userTimezone,
    hour: '2-digit',
    minute: '2-digit',
    ...(format === 'long' && { timeZoneName: 'short' })
  }).format(utcDate);
}

// Helper for calendar grid positioning
export function getEventStartTimeInUserTimezone(utcStart: Date, userTimezone: string): { hour: number; minute: number } {
  const localized = convertUTCToUserTimezone(utcStart, userTimezone);
  return {
    hour: localized.getHours(),
    minute: localized.getMinutes()
  };
}
```

### Frontend: User Input → UTC (Storage)

**Input**: User selects "3:30 PM" in their local timezone (e.g., America/New_York)
**Output**: UTC timestamp for database

```typescript
// Parse user input as local time, then convert to UTC
export function convertUserTimezoneToUTC(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  userTimezone: string
): Date {
  // Create a date string in the user's timezone
  const localDateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;

  // Parse as if it's in the user's timezone
  const date = new Date(localDateString);

  // Calculate offset between user's timezone and UTC
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: userTimezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const parts = formatter.formatToParts(date);
  const userLocalDate = new Date(
    parseInt(parts.find(p => p.type === 'year')!.value),
    parseInt(parts.find(p => p.type === 'month')!.value) - 1,
    parseInt(parts.find(p => p.type === 'day')!.value),
    parseInt(parts.find(p => p.type === 'hour')!.value),
    parseInt(parts.find(p => p.type === 'minute')!.value),
    parseInt(parts.find(p => p.type === 'second')!.value)
  );

  const offset = date.getTime() - userLocalDate.getTime();
  return new Date(date.getTime() - offset);
}
```

### RRULE Handling (Recurrence Expansion)

**Key Rule**: RRULE is stored in UTC. When expanding recurrences, all occurrences are calculated in UTC, then converted to user's timezone for display.

```typescript
// backend/functions/expand_recurrence/index.ts
import { RRuleSet } from 'rrule';

export async function expandRecurrence(
  startDate: Date,         // UTC
  rruleString: string,     // 'FREQ=WEEKLY;BYDAY=MO,WE,FR;UNTIL=20250101T235959Z'
  exdates: string[],       // ['20241225T100000Z', '20250101T100000Z']
  expandDays: number = 30
): Promise<Date[]> {
  // RRuleSet expects UTC dates and RRULE strings
  const rruleSet = new RRuleSet();
  rruleSet.rrule(new RRule(rruleString, { dtstart: startDate }));

  // Add exclusions
  exdates.forEach(exdate => {
    rruleSet.exdate(new Date(exdate)); // ISO 8601 UTC string
  });

  // Get occurrences in UTC
  const endDate = new Date(startDate.getTime() + expandDays * 24 * 60 * 60 * 1000);
  const occurrences = rruleSet.between(startDate, endDate);

  return occurrences;
}
```

**Frontend Usage**:
```typescript
// frontend/src/components/CalendarMonthView.svelte
// After backend returns expanded occurrences in UTC:
const occurrences = await expandRecurrence(event, 30);
const displayOccurrences = occurrences.map(utc => ({
  utcDate: utc,
  displayTime: formatEventTime(utc, userTimezone, 'short'),
  displayDate: utc.toLocaleDateString('en-US', { timeZone: userTimezone })
}));
```

## All-Day Events

All-day events require special handling because they don't have a specific time:

1. **Storage**: `is_all_day = true`, `start_at` and `end_at` are set to midnight UTC on the respective dates
   - Example: All-day event on April 15th, 2025 (user's timezone: America/New_York)
   - `start_at: 2025-04-15T04:00:00Z` (midnight EDT is 4 AM UTC, due to EDT offset)
   - `end_at: 2025-04-16T04:00:00Z` (midnight of next day)

2. **Display**: Show as "All day" without time component
3. **Calendar Rendering**: Place in the "all-day event" row at the top of the day view

## Daylight Saving Time (DST)

The Intl API automatically handles DST transitions:
- When a user in America/New_York views an event at 2:00 AM on the day DST ends, the offset changes
- The frontend conversion functions automatically account for this

## Feature Flags

```typescript
// feature flags for timezone-related features
const featureFlags = {
  'calendar-overlay': true,           // Enable multi-calendar display
  'reminder-scheduling': true,        // Enable pg_cron reminders
  'ics-import-export': true,          // Enable ICS import/export
  'timezone-user-override': false     // (Future) Allow users to override timezone per event
};
```

## Edge Cases & Decisions

| Scenario | Decision |
|----------|----------|
| User travels to different timezone | Events remain at original timezone; frontend converts to user's current system timezone for display |
| Creating recurring event spanning DST | RRULE is in UTC; expansion handles DST automatically |
| Importing ICS file with no timezone | Default to UTC; user can override in event editor |
| Exporting to ICS | Include TZID (timezone identifier) and VTIMEZONE component per RFC 5545 |
| User changes their timezone setting | All existing events remain in UTC; frontend display updates immediately |
| Midnight events on timezone boundary | Stored as UTC midnight; displayed in user's local midnight |

## RLS Considerations

Timezone is **not** a security boundary. All users with access to an event see the same UTC timestamp. The timezone field is purely a preference for display.

```sql
-- RLS policy: Users can only see events in their accessible domains
CREATE POLICY "Users can view events in accessible domains"
ON events FOR SELECT USING (
  workspace_id IN (
    SELECT workspace_id FROM workspace_members
    WHERE user_id = auth.uid() AND status = 'active'
  )
  AND domain_id IN (
    SELECT id FROM domains
    WHERE workspace_id = events.workspace_id
    AND visibility IN ('public', 'shared')
  )
);
```

## Testing Strategy

1. **Unit Tests** (Vitest): Timezone conversion functions, DST transitions
2. **Contract Tests**: API returns correct UTC timestamps
3. **E2E Tests** (Playwright):
   - User creates event at 3 PM in America/New_York, views in UTC, verifies display
   - User imports ICS with timezone, exports, verifies TZID preserved
   - Recurring event spanning DST, all occurrences display correctly

## Summary

- **In Database**: Always UTC
- **On the Wire**: ISO 8601 UTC strings (e.g., `2025-04-15T14:30:00Z`)
- **In Frontend**: Convert to user's timezone for display only
- **In RRULE**: Stored in UTC, expanded in UTC, displayed in user's timezone
- **For All-Day**: `is_all_day=true`, start/end at midnight UTC of respective dates
