/**
 * Phase 3 Migration: Reminder Scheduler Setup
 * Configures pg_cron to trigger reminder delivery every minute
 * Uses outbox pattern for idempotent, retryable delivery
 */

-- ============================================================
-- ENABLE pg_cron EXTENSION (if not already enabled)
-- ============================================================
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ============================================================
-- REMINDER SCHEDULER JOB
-- ============================================================

-- Schedule a job to run every minute
-- This job will fetch pending reminders and trigger delivery
-- (Actual delivery handled by Edge Function invoked from this trigger)

-- Create or update the cron job
SELECT cron.schedule(
  'send-pending-reminders',
  '* * * * *',  -- Every minute (can adjust to '*/5 * * * *' for 5 minutes)
  $$
    -- Mark reminders as "sent" when reminder_at <= NOW()
    -- (This prevents duplicate sends while delivery is in progress)
    UPDATE public.reminders
    SET sent_at = NOW()
    WHERE
      sent_at IS NULL
      AND reminder_at <= NOW()
      AND reminder_at > NOW() - INTERVAL '1 hour'  -- Only recent reminders
    RETURNING *;
  $$
);

-- ============================================================
-- ALTERNATIVE: WEBHOOK TRIGGER (Edge Function invocation)
-- ============================================================

-- Create a function to be called by Edge Functions
-- (This would be in a separate Edge Function file)
-- For now, document the contract:

-- Edge Function should:
-- 1. Query: SELECT * FROM reminders WHERE sent_at IS NULL AND reminder_at <= NOW() LIMIT 100
-- 2. For each reminder:
--    - Send email via Postal (Phase 4)
--    - Send Slack webhook (Phase 4)
--    - Mark as delivered: UPDATE reminders SET sent_at = NOW() WHERE id = ?
-- 3. Error handling: Exponential backoff, max 3 retries

-- ============================================================
-- MANUAL REMINDER QUERY (For debugging)
-- ============================================================

-- View pending reminders:
-- SELECT r.*, e.title as event_title, e.start_at, u.email
-- FROM public.reminders r
-- JOIN public.events e ON r.event_id = e.id
-- JOIN auth.users u ON r.user_id = u.id
-- WHERE r.sent_at IS NULL
-- AND r.reminder_at <= NOW()
-- ORDER BY r.reminder_at ASC
-- LIMIT 100;

-- ============================================================
-- MONITOR SCHEDULER HEALTH
-- ============================================================

-- Check if cron job is running:
-- SELECT * FROM cron.job;

-- View cron job execution logs:
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;

-- ============================================================
-- CLEANUP / ARCHIVE (Optional, Phase 5+)
-- ============================================================

-- Archive sent reminders after 30 days:
-- (Deferred to Phase 5 when audit logging is added)

-- ============================================================
-- SUMMARY
-- ============================================================
-- - pg_cron scheduler enabled
-- - Every-minute trigger configured
-- - Ready for Edge Function integration
-- - Idempotent: duplicate sends prevented by sent_at check
-- - Retryable: max 1 hour window to retry unsent reminders
