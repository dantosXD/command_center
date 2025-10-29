# Row-Level Security (RLS) Policies - Calendar Tables

## Overview

This document details the RLS policies for all calendar-related tables in Command Center Phase 3. The principle is **defense-in-depth**: every query is validated at the database level; no user can see cross-domain, cross-workspace, or private data without explicit authorization.

## Architecture Principles

1. **Workspace Isolation**: Users can only access events in workspaces where they are active members
2. **Domain Scoping**: Domain visibility rules determine event accessibility
   - `public`: All workspace members can see events
   - `team`: Only domain members can see events
   - `private`: Only event creator can see events
3. **Attendee Self-Service**: Attendees can update their own RSVP status without event creator permission
4. **Creator Privileges**: Event creators can always manage their own events (edit, delete, invite attendees)
5. **Audit Trail**: `created_by` and `updated_by` fields enable audit logging and permission checks

## Table: `events`

### Schema
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY,
  workspace_id UUID NOT NULL,
  domain_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  timezone TEXT DEFAULT 'UTC',
  is_all_day BOOLEAN DEFAULT FALSE,
  created_by UUID NOT NULL,
  updated_by UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### Policies

#### Policy 1: SELECT (Read Access)
**Name**: `events_select_accessible_domains`
**Conditions**: User can view an event if:
1. User is an active workspace member, AND
2. Domain is accessible to user (based on visibility)

```sql
CREATE POLICY "events_select_accessible_domains"
ON events FOR SELECT USING (
  -- Workspace member check
  workspace_id IN (
    SELECT workspace_id FROM workspace_members
    WHERE user_id = auth.uid() AND status = 'active'
  )
  -- Domain accessibility check (public, private creator, or team member)
  AND domain_id IN (
    SELECT id FROM domains
    WHERE workspace_id = events.workspace_id
    AND (
      visibility = 'public'
      OR (visibility = 'private' AND created_by = auth.uid())
      OR (visibility = 'team' AND id IN (
        SELECT domain_id FROM domain_members
        WHERE user_id = auth.uid()
      ))
    )
  )
);
```

**Rationale**:
- Prevents users from seeing events in workspaces they don't belong to
- Respects domain visibility settings (prevents private domain events leaking to non-creators)
- Allows team domain members to see all events in their team
- Allows all workspace members to see public domain events

**Test Case 1**: User in Workspace A should NOT see events in Workspace B's domains
```sql
-- Setup: User (alice) in Workspace A, event in Workspace B
INSERT INTO events VALUES (
  uuid_generate_v4(),
  workspace_b_id,  -- NOT alice's workspace
  domain_id,
  'Event in B',
  NULL,
  NULL,
  NOW(),
  NOW() + INTERVAL '1 hour',
  'UTC',
  FALSE,
  bob_id,  -- bob created it
  NULL,
  NOW(),
  NOW()
);

-- As alice: should return 0 rows
SELECT COUNT(*) FROM events WHERE title = 'Event in B';
-- Expected: 0 (access denied)
```

**Test Case 2**: User should NOT see private domain events they didn't create
```sql
-- Setup: Alice and Bob in Workspace A, private domain created by Bob
INSERT INTO events VALUES (
  uuid_generate_v4(),
  workspace_a_id,
  private_domain_id,  -- visibility = 'private', created_by = bob
  'Bob''s Private Event',
  NULL,
  NULL,
  NOW(),
  NOW() + INTERVAL '1 hour',
  'UTC',
  FALSE,
  bob_id,
  NULL,
  NOW(),
  NOW()
);

-- As alice: should return 0 rows
SELECT COUNT(*) FROM events WHERE title = 'Bob''s Private Event';
-- Expected: 0 (access denied)

-- As bob: should return 1 row
SELECT COUNT(*) FROM events WHERE title = 'Bob''s Private Event';
-- Expected: 1 (creator has access)
```

**Test Case 3**: User should see team domain events if they're a team member
```sql
-- Setup: Team domain with alice and bob as members
INSERT INTO events VALUES (
  uuid_generate_v4(),
  workspace_a_id,
  team_domain_id,  -- visibility = 'team'
  'Team Event',
  NULL,
  NULL,
  NOW(),
  NOW() + INTERVAL '1 hour',
  'UTC',
  FALSE,
  bob_id,
  NULL,
  NOW(),
  NOW()
);

-- As alice (team member): should return 1 row
SELECT COUNT(*) FROM events WHERE title = 'Team Event';
-- Expected: 1 (team member has access)

-- As charlie (not team member): should return 0 rows
SELECT COUNT(*) FROM events WHERE title = 'Team Event';
-- Expected: 0 (access denied)
```

#### Policy 2: INSERT (Create Events)
**Name**: `events_insert_accessible_domains`
**Conditions**: User can create an event if:
1. User is an active workspace member, AND
2. Domain is accessible (can write to), AND
3. User sets themselves as creator

```sql
CREATE POLICY "events_insert_accessible_domains"
ON events FOR INSERT WITH CHECK (
  workspace_id IN (
    SELECT workspace_id FROM workspace_members
    WHERE user_id = auth.uid() AND status = 'active'
  )
  AND domain_id IN (
    SELECT id FROM domains
    WHERE workspace_id = events.workspace_id
    AND (
      visibility = 'public'
      OR (visibility = 'private' AND created_by = auth.uid())
      OR (visibility = 'team' AND id IN (
        SELECT domain_id FROM domain_members
        WHERE user_id = auth.uid()
      ))
    )
  )
  AND created_by = auth.uid()
);
```

**Rationale**:
- Users can only create events in workspaces they belong to
- Users can only create events in domains they have access to
- `created_by = auth.uid()` prevents users from spoofing event ownership
- This also prevents users from creating events in private domains they don't own

**Test Case 4**: User cannot create event in domain they can't access
```sql
-- Setup: Charlie tries to create event in Alice's private domain
BEGIN;
  SET LOCAL role = charlie;

  INSERT INTO events (
    id, workspace_id, domain_id, title, start_at, end_at,
    created_by, created_at, updated_at
  ) VALUES (
    uuid_generate_v4(),
    workspace_a_id,
    alice_private_domain_id,  -- Alice's private domain
    'Charlie''s Attempt',
    NOW(),
    NOW() + INTERVAL '1 hour',
    charlie_id,
    NOW(),
    NOW()
  );
ROLLBACK;
-- Expected: RLS violation (access denied)
```

#### Policy 3: UPDATE (Edit Events)
**Name**: `events_update_own_events`
**Conditions**: User can edit an event if:
1. User is the event creator, AND
2. User is still an active workspace member

```sql
CREATE POLICY "events_update_own_events"
ON events FOR UPDATE USING (
  created_by = auth.uid()
  AND workspace_id IN (
    SELECT workspace_id FROM workspace_members
    WHERE user_id = auth.uid() AND status = 'active'
  )
) WITH CHECK (
  created_by = auth.uid()
  AND workspace_id IN (
    SELECT workspace_id FROM workspace_members
    WHERE user_id = auth.uid() AND status = 'active'
  )
);
```

**Rationale**:
- Only event creators can edit (not collaborators; this is by design for Phase 3 MVP)
- Prevents workspace members who left from modifying events
- `WITH CHECK` clause prevents privilege escalation (e.g., changing `created_by`)

**Test Case 5**: User can edit their own events
```sql
-- Setup: Alice creates event
INSERT INTO events (
  id, workspace_id, domain_id, title, start_at, end_at,
  created_by, created_at, updated_at
) VALUES (
  event_id,
  workspace_a_id,
  public_domain_id,
  'Alice''s Event',
  NOW(),
  NOW() + INTERVAL '1 hour',
  alice_id,
  NOW(),
  NOW()
);

-- As alice: can update title
BEGIN;
  SET LOCAL role = alice;

  UPDATE events SET title = 'Updated Title' WHERE id = event_id;
COMMIT;
-- Expected: 1 row updated
```

**Test Case 6**: User cannot edit others' events
```sql
-- As bob: cannot update alice's event
BEGIN;
  SET LOCAL role = bob;

  UPDATE events SET title = 'Hacked' WHERE id = event_id;
ROLLBACK;
-- Expected: RLS violation (0 rows updated)
```

#### Policy 4: DELETE (Remove Events)
**Name**: `events_delete_own_events`
**Conditions**: User can delete an event if:
1. User is the event creator, AND
2. User is still an active workspace member

```sql
CREATE POLICY "events_delete_own_events"
ON events FOR DELETE USING (
  created_by = auth.uid()
  AND workspace_id IN (
    SELECT workspace_id FROM workspace_members
    WHERE user_id = auth.uid() AND status = 'active'
  )
);
```

**Rationale**:
- Only event creators can delete (prevents attendees from removing events)
- Prevents deleted workspace members from deleting historical events

## Table: `event_recurrences`

### Policies

#### Policy 1: SELECT
**Name**: `event_recurrences_select`
```sql
CREATE POLICY "event_recurrences_select"
ON event_recurrences FOR SELECT USING (
  event_id IN (
    SELECT id FROM events WHERE events.id = event_recurrences.event_id
    AND workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  )
);
```

**Rationale**:
- Users can view RRULE if they can view the parent event
- Cascades event visibility (if you can't see the event, you can't see its recurrence)

#### Policy 2: INSERT, UPDATE, DELETE
**Names**: `event_recurrences_insert`, `event_recurrences_update`, `event_recurrences_delete`
```sql
CREATE POLICY "event_recurrences_insert"
ON event_recurrences FOR INSERT WITH CHECK (
  event_id IN (
    SELECT id FROM events WHERE created_by = auth.uid()
  )
);

CREATE POLICY "event_recurrences_update"
ON event_recurrences FOR UPDATE USING (
  event_id IN (
    SELECT id FROM events WHERE created_by = auth.uid()
  )
) WITH CHECK (
  event_id IN (
    SELECT id FROM events WHERE created_by = auth.uid()
  )
);

CREATE POLICY "event_recurrences_delete"
ON event_recurrences FOR DELETE USING (
  event_id IN (
    SELECT id FROM events WHERE created_by = auth.uid()
  )
);
```

**Rationale**:
- Only event creators can manage recurrence rules
- Prevents attendees from modifying how events repeat

## Table: `reminders`

### Policies

#### Policy 1: SELECT
**Name**: `reminders_select`
```sql
CREATE POLICY "reminders_select"
ON reminders FOR SELECT USING (
  event_id IN (
    SELECT id FROM events WHERE
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  )
);
```

**Rationale**:
- Users can see reminders for events they have workspace access to
- Prevents users from discovering private event existence via reminder queries

#### Policy 2: INSERT
**Name**: `reminders_insert`
```sql
CREATE POLICY "reminders_insert"
ON reminders FOR INSERT WITH CHECK (
  event_id IN (
    SELECT id FROM events WHERE
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  )
  AND created_by = auth.uid()
);
```

**Rationale**:
- Users can only create reminders for themselves
- Prevents users from creating reminders for others' accounts
- `created_by = auth.uid()` ensures self-service reminders

#### Policies 3-4: UPDATE, DELETE
**Names**: `reminders_update`, `reminders_delete`
```sql
CREATE POLICY "reminders_update"
ON reminders FOR UPDATE USING (
  created_by = auth.uid()
) WITH CHECK (
  created_by = auth.uid()
);

CREATE POLICY "reminders_delete"
ON reminders FOR DELETE USING (
  created_by = auth.uid()
);
```

**Rationale**:
- Users can only manage their own reminders
- Prevents users from disabling others' reminders

## Table: `event_attendees`

### Policies

#### Policy 1: SELECT
**Name**: `event_attendees_select`
```sql
CREATE POLICY "event_attendees_select"
ON event_attendees FOR SELECT USING (
  event_id IN (
    SELECT id FROM events WHERE
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  )
);
```

**Rationale**:
- Users can see attendee lists for events they have access to
- Cascades event visibility (no attendee list leaks for private events)

#### Policy 2: INSERT
**Name**: `event_attendees_insert`
```sql
CREATE POLICY "event_attendees_insert"
ON event_attendees FOR INSERT WITH CHECK (
  event_id IN (
    SELECT id FROM events WHERE created_by = auth.uid()
  )
);
```

**Rationale**:
- Only event creators can invite attendees
- Prevents attendees from adding themselves without permission
- Prevents social engineering (inviting unwanted people to events)

#### Policy 3: UPDATE (RSVP Self-Service)
**Name**: `event_attendees_update_own_rsvp`
```sql
CREATE POLICY "event_attendees_update_own_rsvp"
ON event_attendees FOR UPDATE USING (
  user_id = auth.uid()
) WITH CHECK (
  user_id = auth.uid()
  AND status IN ('accepted', 'declined', 'tentative')
);
```

**Rationale**:
- Attendees can update their own RSVP status (key differentiator from event editing)
- Status is restricted to valid values (prevents data corruption)
- Users cannot change their user_id or spoof being another attendee

**Test Case 7**: Attendee can RSVP to event without event creator permission
```sql
-- Setup: Alice creates event, Bob is invited
INSERT INTO event_attendees (
  id, event_id, user_id, status, created_at, updated_at
) VALUES (
  uuid_generate_v4(),
  event_id,
  bob_id,
  'invited',
  NOW(),
  NOW()
);

-- As bob: can update own RSVP
BEGIN;
  SET LOCAL role = bob;

  UPDATE event_attendees SET status = 'accepted' WHERE user_id = bob_id AND event_id = event_id;
COMMIT;
-- Expected: 1 row updated
```

#### Policy 4: UPDATE (Event Organizer)
**Name**: `event_attendees_update_as_organizer`
```sql
CREATE POLICY "event_attendees_update_as_organizer"
ON event_attendees FOR UPDATE USING (
  event_id IN (
    SELECT id FROM events WHERE created_by = auth.uid()
  )
);
```

**Rationale**:
- Event creators can update attendee records (e.g., mark as accepted if they receive offline RSVP)
- This is a separate policy from RSVP self-service

#### Policy 5: DELETE
**Name**: `event_attendees_delete`
```sql
CREATE POLICY "event_attendees_delete"
ON event_attendees FOR DELETE USING (
  event_id IN (
    SELECT id FROM events WHERE created_by = auth.uid()
  )
  OR user_id = auth.uid()
);
```

**Rationale**:
- Event creators can remove attendees
- Attendees can remove themselves (decline and withdraw)

## RLS Testing Strategy

### Unit Tests
Test each policy in isolation using `BEGIN; SET LOCAL role = ...;` transactions.

### Contract Tests
Verify RLS violations return 403 Forbidden to API clients.

### Audit Tests
Verify that `created_by` and `updated_by` fields are correctly populated.

### Cross-Domain Isolation Tests
- User in Workspace A should NEVER see data from Workspace B
- User in private domain should NOT see data from other domains
- Attendee should be able to RSVP without privilege escalation

## Related Documentation

- `/backend/docs/timezone-strategy.md` - Timezone handling (UTC storage, user timezone display)
- `/specs/001-central-hub/spec.md` - Feature specification
- `/specs/001-central-hub/plan.md` - Implementation roadmap

## Maintenance & Audits

RLS policies must be reviewed:
1. **Before each release**: Verify no new tables bypass RLS
2. **After permission model changes**: Update policies to reflect new roles/capabilities
3. **Quarterly**: Conduct full RLS audit to verify isolation is maintained
4. **Upon breach investigation**: Trace data access via audit logs to confirm RLS enforcement
