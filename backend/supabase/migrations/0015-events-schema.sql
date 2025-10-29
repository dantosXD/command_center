-- Phase 3: Calendar & Reminders - Events Schema Migration
-- This migration creates the core calendar tables with RLS policies
-- Reference: /backend/docs/timezone-strategy.md

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- EVENTS TABLE
-- ============================================================================
-- Core calendar events table
-- All timestamps stored in UTC (TIMESTAMPTZ)
-- User's timezone preference stored in 'timezone' field
-- All-day events: is_all_day=true, start_at/end_at set to midnight UTC

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,

  -- Event details
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,

  -- Timestamps (all UTC per timezone strategy)
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,

  -- User's intended timezone (e.g., 'America/New_York')
  -- Used for display and recurrence expansion
  timezone TEXT DEFAULT 'UTC',

  -- All-day event indicator
  is_all_day BOOLEAN DEFAULT FALSE,

  -- Audit fields
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraint: end_at must be after start_at
  CONSTRAINT check_valid_time_range CHECK (end_at > start_at)
);

-- Indexes for performance
CREATE INDEX idx_events_workspace_domain ON events(workspace_id, domain_id);
CREATE INDEX idx_events_start_end ON events(start_at, end_at);
CREATE INDEX idx_events_created_by ON events(created_by);
CREATE INDEX idx_events_created_at ON events(created_at DESC);

-- ============================================================================
-- EVENT RECURRENCES TABLE
-- ============================================================================
-- Stores recurrence rules (RRULE) per RFC 5545
-- One-to-one relationship with events (optional)

CREATE TABLE event_recurrences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL UNIQUE REFERENCES events(id) ON DELETE CASCADE,

  -- RFC 5545 RRULE string in UTC
  -- Example: 'FREQ=WEEKLY;BYDAY=MO,WE,FR;UNTIL=20250401T235959Z'
  rrule TEXT,

  -- Excluded dates (ISO 8601 UTC strings)
  -- Example: ['2025-04-15T14:30:00Z', '2025-04-22T14:30:00Z']
  exdates TEXT[],

  -- Recurrence type (for UI reference)
  -- Options: 'once', 'daily', 'weekly', 'monthly', 'yearly', 'custom'
  recurrence_type TEXT DEFAULT 'once',

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_event_recurrences_event_id ON event_recurrences(event_id);

-- ============================================================================
-- REMINDERS TABLE
-- ============================================================================
-- Stores event reminders (email, Slack, in-app)
-- Each event can have multiple reminders

CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,

  -- Reminder type: email, slack, in_app
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('email', 'slack', 'in_app')),

  -- Minutes before event to send reminder (negative = after event)
  -- Example: 15 = send 15 minutes before, -60 = send 60 minutes after
  reminder_value INTEGER NOT NULL,

  -- User who created this reminder (may differ from event creator)
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Delivery tracking
  is_sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMPTZ,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraint: reminder_value should be reasonable (-1440 to 10080)
  CONSTRAINT check_valid_reminder_value CHECK (reminder_value >= -1440 AND reminder_value <= 10080)
);

CREATE INDEX idx_reminders_event_id ON reminders(event_id);
CREATE INDEX idx_reminders_is_sent ON reminders(is_sent);
CREATE INDEX idx_reminders_created_by ON reminders(created_by);

-- ============================================================================
-- EVENT ATTENDEES TABLE
-- ============================================================================
-- Tracks event attendees and their RSVP status
-- Supports multi-person events and collaboration

CREATE TABLE event_attendees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- RSVP status
  status TEXT NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'accepted', 'declined', 'tentative')),

  -- Optional response comment from attendee
  response_comment TEXT,

  -- When attendee responded
  responded_at TIMESTAMPTZ,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevent duplicate attendees for same event
  UNIQUE (event_id, user_id)
);

CREATE INDEX idx_event_attendees_event_id ON event_attendees(event_id);
CREATE INDEX idx_event_attendees_user_id ON event_attendees(user_id);
CREATE INDEX idx_event_attendees_status ON event_attendees(status);

-- ============================================================================
-- ROW-LEVEL SECURITY (RLS)
-- ============================================================================
-- All tables use RLS to enforce workspace/domain isolation

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_recurrences ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- EVENTS RLS POLICIES
-- ============================================================================

-- Policy: Users can view events in accessible domains
-- Users can see an event if:
-- 1. They are a workspace member
-- 2. The event's domain is accessible to them
--    - Domain visibility = 'public', OR
--    - Domain visibility = 'private' AND user is domain creator, OR
--    - Domain visibility = 'team' AND user is domain member
CREATE POLICY "events_select_accessible_domains"
ON events FOR SELECT USING (
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
);

-- Policy: Users can create events in accessible domains
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

-- Policy: Users can update their own events
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

-- Policy: Users can delete their own events
CREATE POLICY "events_delete_own_events"
ON events FOR DELETE USING (
  created_by = auth.uid()
  AND workspace_id IN (
    SELECT workspace_id FROM workspace_members
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

-- ============================================================================
-- EVENT RECURRENCES RLS POLICIES
-- ============================================================================

-- Policy: Users can view recurrence rules for accessible events
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

-- Policy: Users can create recurrence rules for their events
CREATE POLICY "event_recurrences_insert"
ON event_recurrences FOR INSERT WITH CHECK (
  event_id IN (
    SELECT id FROM events WHERE created_by = auth.uid()
  )
);

-- Policy: Users can update recurrence rules for their events
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

-- Policy: Users can delete recurrence rules for their events
CREATE POLICY "event_recurrences_delete"
ON event_recurrences FOR DELETE USING (
  event_id IN (
    SELECT id FROM events WHERE created_by = auth.uid()
  )
);

-- ============================================================================
-- REMINDERS RLS POLICIES
-- ============================================================================

-- Policy: Users can view reminders for accessible events
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

-- Policy: Users can create reminders for accessible events
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

-- Policy: Users can update/delete their own reminders
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

-- ============================================================================
-- EVENT ATTENDEES RLS POLICIES
-- ============================================================================

-- Policy: Users can view attendee lists for accessible events
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

-- Policy: Users can add attendees to their events
CREATE POLICY "event_attendees_insert"
ON event_attendees FOR INSERT WITH CHECK (
  event_id IN (
    SELECT id FROM events WHERE created_by = auth.uid()
  )
);

-- Policy: Attendees can update their own RSVP status
CREATE POLICY "event_attendees_update_own_rsvp"
ON event_attendees FOR UPDATE USING (
  user_id = auth.uid()
) WITH CHECK (
  user_id = auth.uid()
  AND status IN ('accepted', 'declined', 'tentative')
);

-- Policy: Event creators can update attendee status
CREATE POLICY "event_attendees_update_as_organizer"
ON event_attendees FOR UPDATE USING (
  event_id IN (
    SELECT id FROM events WHERE created_by = auth.uid()
  )
);

-- Policy: Event creators can remove attendees
CREATE POLICY "event_attendees_delete"
ON event_attendees FOR DELETE USING (
  event_id IN (
    SELECT id FROM events WHERE created_by = auth.uid()
  )
  OR user_id = auth.uid()
);

-- ============================================================================
-- TRIGGERS FOR AUDIT FIELDS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for events
CREATE TRIGGER events_update_timestamp
BEFORE UPDATE ON events
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Trigger for reminders
CREATE TRIGGER reminders_update_timestamp
BEFORE UPDATE ON reminders
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Trigger for event_attendees
CREATE TRIGGER event_attendees_update_timestamp
BEFORE UPDATE ON event_attendees
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE events IS 'Calendar events for workspaces. All timestamps in UTC. User timezone stored for display and recurrence expansion.';
COMMENT ON COLUMN events.timezone IS 'User''s intended timezone (e.g., "America/New_York"). Used for RRULE expansion and display conversion.';
COMMENT ON COLUMN events.is_all_day IS 'If true, event spans entire day(s). start_at/end_at set to midnight UTC boundaries.';

COMMENT ON TABLE event_recurrences IS 'RFC 5545 RRULE data. Stored in UTC. Parent event defines timezone for expansion.';
COMMENT ON COLUMN event_recurrences.rrule IS 'RFC 5545 RRULE string. Example: "FREQ=WEEKLY;BYDAY=MO,WE,FR;UNTIL=20250401T235959Z"';
COMMENT ON COLUMN event_recurrences.exdates IS 'Array of excluded dates in ISO 8601 UTC format.';

COMMENT ON TABLE reminders IS 'Event reminders (email, Slack, in-app). Delivery tracked with is_sent and sent_at.';
COMMENT ON COLUMN reminders.reminder_value IS 'Minutes before event (-1440 to 10080). Negative = after event.';

COMMENT ON TABLE event_attendees IS 'Event attendees and RSVP status. Supports multi-person events and self-service RSVP updates.';
COMMENT ON COLUMN event_attendees.status IS 'RSVP status: invited, accepted, declined, tentative';
