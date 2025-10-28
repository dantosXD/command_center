# ADR-001: Central Hub Architecture

**Status**: Accepted
**Date**: 2025-10-28
**Author**: Engineering Team
**Scope**: Central Hub Feature (US1)

---

## Context

The Command Center MVP requires a "Central Hub" that aggregates today's tasks and upcoming meetings across all domains without requiring users to switch between views.

**Problem Statement**:
- Users need a single view of their most relevant work items
- Tasks and events exist across multiple domains (Home, Work, Play)
- Manual aggregation would be inefficient and error-prone
- Hub must support real-time updates when items change
- Feature must support gradual rollout via feature flags

---

## Decision

Implement the Central Hub using:

1. **Backend Aggregation Layer**:
   - Supabase PostgREST RPC for hub_feed query
   - SQL materialized view aggregating tasks/events
   - Tenant-scoped with Row-Level Security enforcement
   - Feature flag `central-hub-mvp` for gradual rollout

2. **Real-time Updates**:
   - Supabase Realtime subscriptions for live updates
   - Optimistic UI updates while subscriptions establish
   - Automatic reconnection handling

3. **Search & Filters**:
   - Structured search: assignee, status, domain, due date range
   - Materialized view for search index
   - Full-text search via pg_trgm

4. **Quick-Add**:
   - Command palette for natural language task creation
   - Natural Language Parser Edge Function
   - Automatic date/priority parsing

---

## Rationale

**Why PostgREST RPC**:
- Auto-generated API from SQL function
- Type-safe through Supabase client generation
- Simple to version and test
- Supports complex filtering and aggregation

**Why Materialized View for Search**:
- Pre-computed indexes for fast lookups
- Configurable refresh strategy (on-demand or scheduled)
- Better performance than ad-hoc queries
- Aligns with reproducible builds (deterministic indexes)

**Why Feature Flags**:
- Allows staged rollout (Constitution: Incremental Delivery)
- Easy rollback if issues discovered
- A/B testing capability for future
- Per-tenant control for beta testing

**Why Realtime Subscriptions**:
- Live updates without polling
- Better UX (no manual refresh needed)
- Reduced server load vs. polling
- WebSocket connection handles reconnection automatically

---

## Consequences

**Positive Consequences**:
- Single unified view of today's work
- Real-time collaboration awareness
- Scalable aggregation (database handles complexity)
- Supports future analytics and reporting
- Feature flag allows safe rollout
- Test coverage via contract & RLS tests

**Negative Consequences**:
- Materialized view requires refresh management
- Realtime WebSocket connections use more server resources
- RLS policies add database complexity
- Natural language parser adds latency to quick-add

**Mitigations**:
- Refresh strategy documented in runbooks
- Connection pooling configured in Supabase
- RLS policies tested with dedicated test suite
- NLP parser optimized with Edge Function caching

---

## Implementation Details

### Database Schema

```sql
-- Materialized view for hub aggregation
CREATE MATERIALIZED VIEW hub_feed AS
  SELECT
    t.id, t.workspace_id, t.domain_id, t.title, t.status,
    t.due_at, t.priority, 'task' as item_type,
    ARRAY_AGG(DISTINCT a.id) as assignees
  FROM tasks t
  LEFT JOIN task_assignees a ON t.id = a.task_id
  WHERE t.status != 'done'
  UNION ALL
  SELECT
    e.id, e.workspace_id, e.domain_id, e.title, NULL,
    e.start_at, NULL, 'event' as item_type,
    ARRAY_AGG(DISTINCT a.id) as attendees
  FROM events e
  LEFT JOIN event_attendees a ON e.id = a.event_id;

CREATE INDEX hub_feed_workspace_domain ON hub_feed(workspace_id, domain_id, due_at DESC);
```

### Backend RPC

```sql
CREATE OR REPLACE FUNCTION hub_feed(p_workspace_id uuid, p_domain_id uuid DEFAULT NULL)
RETURNS TABLE(...)
AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM hub_feed
  WHERE workspace_id = p_workspace_id
    AND (p_domain_id IS NULL OR domain_id = p_domain_id)
    AND due_at >= NOW()
    AND due_at <= NOW() + INTERVAL '30 days'
  ORDER BY due_at ASC, priority DESC;
END;
$$ LANGUAGE plpgsql STABLE;
```

### Frontend Store

```typescript
// src/stores/hub.ts
export const hubStore = createQuery({
  queryKey: ['hub', { workspace: $workspaceId, domain: $domainId }],
  queryFn: async () => {
    return supabase.rpc('hub_feed', {
      p_workspace_id: $workspaceId,
      p_domain_id: $domainId
    });
  },
  staleTime: 30000, // 30s
});
```

---

## Alternatives Considered

| Alternative | Pros | Cons | Why Not Chosen |
|-------------|------|------|----------------|
| **Client-side aggregation** | Simple logic | N+1 queries, slow on mobile, no caching | High load on frontend |
| **Federated query** | Distributed | Complex, harder to test, RLS enforcement difficult | Centralized Postgres is simpler |
| **GraphQL** | Strongly typed | Adds complexity, another library, slower | REST+RPC is sufficient |
| **CRDT for real-time** | Offline-first | Overkill for MVP, complexity, cost | Supabase Realtime sufficient |

---

## Related Decisions

- ADR-002: Row-Level Security Strategy (hub requires RLS isolation)
- ADR-003: Notification Outbox Pattern (hub triggers notifications)
- Constitution: Incremental Delivery (feature flags)

---

## Testing Strategy

### Contract Tests
- Hub RPC returns correct fields
- RLS prevents cross-domain access
- Filters work as expected
- Performance targets met (P95 < 250ms)

### RLS Tests
- User can only see assigned/authored items
- Domain scoping enforced
- Workspace boundaries respected

### E2E Tests
- Hub displays today's items
- Real-time updates work
- Domain switcher works
- Search filters work

---

## References

- Specification: [spec.md](../../specs/001-central-hub/spec.md) - User Story 1
- Plan: [plan.md](../../specs/001-central-hub/plan.md) - Phase 3
- Tasks: [tasks.md](../../specs/001-central-hub/tasks.md) - T025-T042

---

## Sign-Off

- [ ] Backend Engineer: Implement RPC and materialized view
- [ ] Frontend Engineer: Implement hub UI and stores
- [ ] QA: Verify contract, RLS, and e2e tests
- [ ] Tech Lead: Code review
- [ ] Architecture: Approve

---

## History

| Date | Status | Notes |
|------|--------|-------|
| 2025-10-28 | Accepted | Initial decision for central hub implementation |
