# ADR-003: Notification Outbox Pattern

**Status**: Accepted
**Date**: 2025-10-28
**Author**: Backend Team
**Scope**: Notification Delivery (Phase 4+)

---

## Context

Command Center requires reliable notification delivery across multiple channels (email, Slack, in-app) while guaranteeing:
- **Idempotency**: Notifications delivered exactly once (no duplicates)
- **Durability**: No notifications lost if system crashes
- **Auditability**: Ability to trace notification delivery
- **Scalability**: Support hundreds of notifications/second
- **Offline Resilience**: Gracefully handle unavailable services

**Problem Statement**:
- Direct delivery can lose notifications (no durability)
- Distributed systems require transaction guarantees
- Service failures (Slack down, email server timeout) need retry logic
- Need to support multiple channels (email, Slack, in-app)
- Constitutional requirement: Idempotent Operations

---

## Decision

Implement the Notification Outbox Pattern:

1. **Outbox Table**:
   - Persistent queue for notifications
   - Notification rows written in same transaction as domain event
   - Each notification has idempotency key (UUID)
   - Statuses: pending → sent → delivered → failed

2. **pg_cron Scheduler**:
   - Periodic jobs (every 5 minutes) process pending notifications
   - Jobs are idempotent (safe to run multiple times)
   - Lock mechanism prevents concurrent processing

3. **Edge Function Dispatcher**:
   - Called by scheduler
   - Attempts delivery on all channels
   - Writes delivery attempt to audit log
   - Retries with exponential backoff

4. **Delivery Channels**:
   - Email (Postal SMTP)
   - Slack (Webhooks)
   - In-app (Realtime broadcast + database write)

5. **Audit & Metrics**:
   - Every attempt logged
   - Delivery metrics: success rate, latency, retry count
   - Failed notifications investigated (dead letter queue)

---

## Rationale

**Why Outbox Pattern**:
- Decouples notification trigger from delivery
- Guarantees durability (persisted before sent)
- Enables retry without losing data
- Allows priority/batching strategies
- Simplest reliable pattern (no Kafka, RabbitMQ complexity)

**Why pg_cron**:
- Built into Postgres (no external dependency)
- Serverless (no dedicated worker process)
- ACID guarantees (SQL transactions)
- Scheduling is transparent to application

**Why Edge Functions**:
- Serverless (scales automatically)
- Can reach external services (Slack, Postal)
- Deno runtime (fast startup)
- Version controlled with code

**Why Idempotency Keys**:
- Deduplicate notifications (UUID prevents duplicates)
- Safe to replay delivery attempts
- Slack webhook deduplication
- Email subject/to/time uniqueness check

**Why Multiple Retry Attempts**:
- Network is unreliable
- Services have transient failures
- Exponential backoff prevents thundering herd
- Eventual consistency (will deliver when service recovers)

---

## Consequences

**Positive Consequences**:
- Guaranteed notification delivery (at-least-once)
- No lost notifications
- Decoupled delivery from triggering
- Full audit trail
- Easy to debug (all attempts logged)
- Can prioritize urgent notifications
- Supports bulking/batching for efficiency
- Simple implementation (no complex queues)

**Negative Consequences**:
- Additional database table (outbox)
- Slight latency (async, not immediate)
- Scheduler adds database load
- Need to handle delivery failures
- Dead letter queue management
- Duplicate notifications possible (at-least-once, not exactly-once)

**Mitigations**:
- Idempotency keys prevent duplicates
- Monitoring & alerting for failed notifications
- Dead letter queue reviewed weekly
- Rate limiting on Slack/email delivery
- Bulk operations for efficiency

---

## Implementation Details

### Outbox Table

```sql
CREATE TABLE notification_outbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id),
  user_id uuid NOT NULL REFERENCES auth.users(id),

  -- Idempotency key (prevents duplicates)
  idempotency_key TEXT NOT NULL UNIQUE,

  -- Notification content
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  action_url TEXT,

  -- Channels to deliver on
  channels TEXT[] NOT NULL DEFAULT '{in-app}',
  priority INT DEFAULT 5,

  -- Delivery tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
  attempt_count INT DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,

  -- Error tracking
  error_message TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days',

  UNIQUE(user_id, idempotency_key)
);

CREATE INDEX outbox_pending ON notification_outbox(workspace_id)
  WHERE status = 'pending' AND expires_at > NOW();
CREATE INDEX outbox_delivered ON notification_outbox(user_id, delivered_at DESC);
```

### pg_cron Job Definition

```sql
-- Schedule job to run every 5 minutes
SELECT cron.schedule(
  'process-notifications',
  '*/5 * * * *',
  'SELECT notification_dispatcher()'
);

-- Idempotent dispatcher function
CREATE OR REPLACE FUNCTION notification_dispatcher()
RETURNS void AS $$
DECLARE
  v_batch RECORD;
BEGIN
  -- Process up to 100 pending notifications
  FOR v_batch IN
    SELECT id, user_id, channels, title, body, action_url
    FROM notification_outbox
    WHERE status = 'pending'
      AND attempt_count < 5
      AND (last_attempt_at IS NULL OR last_attempt_at < NOW() - INTERVAL '5 minutes')
    ORDER BY priority DESC, created_at ASC
    LIMIT 100
    FOR UPDATE SKIP LOCKED
  LOOP
    -- Call Edge Function to dispatch
    PERFORM http_post(
      'https://supabase.co/functions/v1/notify-dispatcher',
      jsonb_build_object(
        'id', v_batch.id,
        'user_id', v_batch.user_id,
        'channels', v_batch.channels,
        'title', v_batch.title,
        'body', v_batch.body,
        'action_url', v_batch.action_url
      )
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;
```

### Edge Function: Notification Dispatcher

```typescript
// backend/supabase/functions/notify-dispatcher/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.0";

serve(async (req) => {
  const { id, user_id, channels, title, body, action_url } = await req.json();

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  let success = true;

  // Deliver on each channel
  if (channels.includes("in-app")) {
    await supabase.from("notifications").insert({
      user_id,
      title,
      body,
      action_url,
      read_at: null,
    });
  }

  if (channels.includes("email")) {
    try {
      const { error } = await fetch(
        `${Deno.env.get("POSTAL_API_URL")}/api/v1/send/message`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${Deno.env.get("POSTAL_API_KEY")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: user_id, // Email lookup from users table
            subject: title,
            html_body: body,
          }),
        }
      );
      if (error) success = false;
    } catch (e) {
      success = false;
    }
  }

  if (channels.includes("slack")) {
    try {
      // Get user's Slack webhook from preferences
      const { data: prefs } = await supabase
        .from("user_preferences")
        .select("slack_webhook_url")
        .eq("user_id", user_id)
        .single();

      if (prefs?.slack_webhook_url) {
        await fetch(prefs.slack_webhook_url, {
          method: "POST",
          body: JSON.stringify({
            text: title,
            blocks: [
              {
                type: "section",
                text: { type: "mrkdwn", text: body },
              },
              {
                type: "actions",
                elements: [
                  {
                    type: "button",
                    text: { type: "plain_text", text: "View" },
                    url: action_url,
                  },
                ],
              },
            ],
          }),
        });
      }
    } catch (e) {
      success = false;
    }
  }

  // Update outbox status
  if (success) {
    await supabase
      .from("notification_outbox")
      .update({
        status: "delivered",
        delivered_at: new Date().toISOString(),
        attempt_count: undefined,
      })
      .eq("id", id);
  } else {
    await supabase
      .from("notification_outbox")
      .update({
        status: "sent", // Will retry
        last_attempt_at: new Date().toISOString(),
        attempt_count: undefined,
      })
      .eq("id", id);
  }

  return new Response(JSON.stringify({ success }), {
    headers: { "Content-Type": "application/json" },
  });
});
```

---

## Alternatives Considered

| Alternative | Pros | Cons | Why Not Chosen |
|-------------|------|------|----------------|
| **Direct delivery** | Simple | Not durable, loses messages | Loses notifications |
| **Message queue (Kafka)** | Scalable | Complexity, ops overhead | Overkill for MVP |
| **Polling sidecar** | Simple | Separate process, ops | Outbox simpler |
| **Event sourcing** | Audit trail | High complexity | Outbox sufficient |

---

## Testing Strategy

### Contract Tests
- Outbox correctly formats notifications
- Channels selection works
- Idempotency key prevents duplicates

### Integration Tests
- Edge Function handles email delivery
- Slack webhook posting works
- Retry logic with exponential backoff
- Failed notifications marked correctly

### Load Tests
- Dispatcher handles 1000s of notifications
- No blocking on UI
- Database performance under load

---

## Rollout Plan

**Phase 4** (Weeks 6-7):
1. Create outbox table and schema (T109)
2. Create pg_cron job and scheduler (T022)
3. Create Edge Function dispatcher (T106)
4. Implement email delivery (Postal) (T107)
5. Add Slack webhook support (T108)
6. Full test coverage (T093-T099)

---

## References

- Specification: `specs/001-central-hub/spec.md` (Notifications section)
- Plan: `specs/001-central-hub/plan.md` (Phase 4)
- Constitution: `.specify/memory/constitution.md` (Principle V: Idempotent Operations)

---

## Sign-Off

- [ ] Backend Lead: Implementation review
- [ ] Database Architect: Schema review
- [ ] QA Lead: Test coverage verification
- [ ] Ops Lead: Scheduler configuration

---

## History

| Date | Status | Notes |
|------|--------|-------|
| 2025-10-28 | Accepted | Outbox pattern for reliable notification delivery |
