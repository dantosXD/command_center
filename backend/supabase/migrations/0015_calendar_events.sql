/**
 * Phase 3 Migration: Calendar Events Schema
 * Creates events table with recurrence support via RRULE (RFC 5545)
 * Also creates recurrence cache and reminder outbox tables
 */

-- ============================================================
-- EVENTS TABLE (Core calendar data)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id UUID NOT NULL REFERENCES public.domains(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_at TIMESTAMP WITH TIME ZONE NOT NULL,
  end_at TIMESTAMP WITH TIME ZONE NOT NULL,
  timezone VARCHAR(255) DEFAULT 'UTC',
  recurrence_rrule TEXT,  -- RFC 5545 RRULE string (e.g., "FREQ=WEEKLY;BYDAY=MO,WE,FR")
  exdates TEXT[],         -- Exception dates (array of ISO date strings)
  location TEXT,
  attendees TEXT[],       -- Email addresses of attendees
  reminders INT[] DEFAULT ARRAY[15, 60],  -- Minutes before event (default: 15 min, 1 hour)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_dates CHECK (start_at < end_at),
  CONSTRAINT non_empty_title CHECK (LENGTH(TRIM(title)) > 0)
);

-- ============================================================
-- RECURRENCE CACHE TABLE (Expansion results for performance)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.recurrences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  occurrence_date DATE NOT NULL,
  is_exception BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure unique occurrences per event
  CONSTRAINT unique_occurrence UNIQUE (event_id, occurrence_date)
);

-- ============================================================
-- REMINDERS OUTBOX TABLE (Notification delivery)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reminder_at TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,  -- NULL until sent
  method TEXT DEFAULT 'email',  -- email, slack, in_app
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure idempotency: only one reminder per user per event
  CONSTRAINT unique_reminder UNIQUE (event_id, user_id, reminder_at, method)
);

-- ============================================================
-- INDEXES (Performance optimization)
-- ============================================================

-- Fast lookups by domain and date range
CREATE INDEX idx_events_domain_start ON public.events(domain_id, start_at DESC);

-- Fast lookups by end date
CREATE INDEX idx_events_domain_end ON public.events(domain_id, end_at DESC);

-- Find recurring events
CREATE INDEX idx_events_recurrence ON public.events(domain_id) WHERE recurrence_rrule IS NOT NULL;

-- Recurrence cache lookups
CREATE INDEX idx_recurrences_date ON public.recurrences(occurrence_date);
CREATE INDEX idx_recurrences_event ON public.recurrences(event_id);

-- Pending reminders (for scheduler)
CREATE INDEX idx_reminders_pending ON public.reminders(reminder_at, sent_at)
  WHERE sent_at IS NULL;

-- User's reminders
CREATE INDEX idx_reminders_user ON public.reminders(user_id, sent_at);

-- ============================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurrences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- TRIGGERS (Auto-update updated_at timestamp)
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_events_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER events_update_timestamp
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.update_events_timestamp();

-- ============================================================
-- GRANTS (PostgREST access)
-- ============================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recurrences TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reminders TO anon;

-- Sequences for auto-increment (if needed)
-- GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- ============================================================
-- TEST SEED DATA (Optional: remove in production)
-- ============================================================

-- This would be in a separate seed file:
-- INSERT INTO public.events (domain_id, title, start_at, end_at, timezone)
-- VALUES (
--   (SELECT id FROM public.domains LIMIT 1),
--   'Test Event',
--   NOW() + INTERVAL '1 day',
--   NOW() + INTERVAL '1 day 1 hour',
--   'UTC'
-- );
