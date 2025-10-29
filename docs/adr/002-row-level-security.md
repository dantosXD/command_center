# ADR-002: Row-Level Security Strategy

**Status**: Accepted
**Date**: 2025-10-28
**Author**: Security Team
**Scope**: Data Isolation & Access Control (Platform-wide)

---

## Context

Command Center is a multi-tenant application where:
- Users belong to workspaces
- Workspaces contain domains (Home, Work, Play)
- Domains contain collections and items (tasks, events)
- Privacy is critical: users must never see cross-domain data

**Problem Statement**:
- Must enforce data isolation at the database level (Defense-in-Depth)
- Application-level access control is insufficient (can be bypassed)
- Shared database across tenants requires strong isolation
- Compliance requirements: audit logging of access patterns
- Constitutional requirement (Principle II): RLS on ALL data stores

---

## Decision

Implement Row-Level Security (RLS) as the primary access control mechanism:

1. **Tenant Isolation**:
   - All tables have `workspace_id` column
   - All RLS policies scoped to `auth.uid()` and workspace context
   - Default deny: policies explicitly allow access

2. **Domain Isolation**:
   - Collections and items have `domain_id` column
   - RLS policies enforce domain visibility rules
   - Private domains only accessible to invited members
   - Shared domains accessible to all workspace members (unless restricted)

3. **Policy Implementation**:
   - Separate RLS policy file: `backend/supabase/storage-policies/tenancy.sql`
   - One policy per table per operation (SELECT, INSERT, UPDATE, DELETE)
   - Policies reference membership and role tables
   - All policies tested with dedicated RLS test harness

4. **Audit & Monitoring**:
   - Audit log table records all privileged actions
   - Trigger on domain updates, role grants, visibility changes
   - Immutable audit log (no UPDATE, only INSERT)
   - Searchable via API with RLS

---

## Rationale

**Why Database-Level RLS**:
- Bypass-proof (no application code can override)
- Consistent across all API clients (REST, GraphQL, direct SQL)
- Enforced even for admin debugging
- Better performance (filtering at database level)
- Meets compliance and regulatory requirements

**Why Mandatory on ALL Tables**:
- Constitution Principle II: Defense-in-Depth
- Default deny approach (explicit allow only)
- No accidental permission leaks
- Easier to audit (no gaps to find)

**Why Separate Policy File**:
- Clarity: RLS policies in dedicated file
- Reviewability: Security team can audit policies
- Testability: Test harness can import policies
- Maintainability: Clear ownership and versioning

**Why Audit Logging**:
- Detect privilege escalation attempts
- Compliance: prove access was denied
- Debugging: trace data access patterns
- Forensics: investigate after security incident

---

## Consequences

**Positive Consequences**:
- Strongest possible data isolation guarantee
- Complies with Defense-in-Depth principle
- Testable via RLS test harness
- Audit trail for compliance
- Per-domain access control without code
- Easy to revoke access (policy change only)

**Negative Consequences**:
- RLS policies add database complexity
- Requires careful testing (RLS bugs are security bugs)
- Slight performance overhead (policy evaluation)
- Learning curve for team (RLS is non-obvious)
- Cannot use certain optimization techniques with RLS

**Mitigations**:
- Dedicated RLS test harness (T018)
- RLS policy code review (mandatory before merge)
- Database query analysis (EXPLAIN plans with RLS)
- Performance testing (load testing with RLS enabled)
- Team training on RLS patterns

---

## Implementation Details

### RLS Policy Template

```sql
-- Example: Tasks table
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- SELECT: User can see tasks in workspaces they're members of
CREATE POLICY tasks_select ON tasks
  FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

-- INSERT: User can create tasks in domains they have access to
CREATE POLICY tasks_insert ON tasks
  FOR INSERT
  WITH CHECK (
    domain_id IN (
      SELECT d.id FROM domains d
      INNER JOIN domain_members dm ON d.id = dm.domain_id
      WHERE d.workspace_id IN (
        SELECT workspace_id FROM workspace_members
        WHERE user_id = auth.uid()
      )
      AND dm.user_id = auth.uid()
    )
  );

-- UPDATE: User can update tasks they own or are assigned to
CREATE POLICY tasks_update ON tasks
  FOR UPDATE
  USING (
    created_by = auth.uid()
    OR id IN (
      SELECT task_id FROM task_assignees
      WHERE user_id = auth.uid()
    )
  );

-- DELETE: Only creator can delete
CREATE POLICY tasks_delete ON tasks
  FOR DELETE
  USING (created_by = auth.uid());
```

### Audit Log Implementation

```sql
-- Immutable audit log
CREATE TABLE audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id),
  actor_id uuid NOT NULL REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id uuid,
  old_values jsonb,
  new_values jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Only workspace members can see their workspace's audit log
CREATE POLICY audit_log_select ON audit_log
  FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

-- Prevent all writes except via trigger
CREATE POLICY audit_log_deny_write ON audit_log
  FOR INSERT, UPDATE, DELETE
  USING (FALSE);

-- Trigger to log domain visibility changes
CREATE OR REPLACE FUNCTION log_domain_update()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log(workspace_id, actor_id, action, resource_type, resource_id, old_values, new_values)
  VALUES(
    NEW.workspace_id,
    auth.uid(),
    'UPDATE',
    'domain',
    NEW.id,
    jsonb_build_object('visibility', OLD.visibility),
    jsonb_build_object('visibility', NEW.visibility)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER domain_update_audit
AFTER UPDATE ON domains
FOR EACH ROW
WHEN (OLD.visibility IS DISTINCT FROM NEW.visibility)
EXECUTE FUNCTION log_domain_update();
```

---

## Testing Strategy

### RLS Test Harness (T018)

```typescript
// tests/rls/workspace-isolation.spec.ts
describe('Workspace Isolation', () => {
  it('user cannot see workspace they are not a member of', async () => {
    // User A in workspace 1
    // User B in workspace 2
    // User A queries User B's workspace
    // Result: Empty result set (RLS blocks access)
  });

  it('user cannot see domain in different workspace', async () => {
    // Domain D in workspace W2
    // User U in workspace W1
    // User U queries domain D
    // Result: RLS policy denies access
  });
});

describe('Domain Visibility', () => {
  it('private domain only visible to invited members', async () => {
    // Domain D marked private in workspace W
    // User U invited to domain D
    // User V not invited
    // U can see D, V cannot
  });

  it('shared domain visible to all workspace members', async () => {
    // Domain D marked shared in workspace W
    // Users U and V both in workspace W
    // Both can see D
  });
});

describe('Task Ownership', () => {
  it('user can only update tasks they created or are assigned to', async () => {
    // Task T created by User A
    // User B not assigned
    // User B attempts update
    // Result: RLS denies update
  });
});
```

---

## Alternatives Considered

| Alternative | Pros | Cons | Why Not Chosen |
|-------------|------|------|----------------|
| **Application-level checks** | Simple code | Bypassable, inconsistent | Doesn't satisfy Defense-in-Depth |
| **Per-tenant database** | Maximum isolation | Expensive (N databases), hard to manage | Not scalable for MVP |
| **JWT claims** | Fast to check | Can be forged, only in API layer | Not sufficient, needs RLS |
| **Attribute-based RLS** | Flexible | Complex, harder to test | Role-based simpler for MVP |

---

## Related Decisions

- ADR-001: Central Hub Architecture (uses RLS for hub_feed)
- ADR-003: Notification Outbox Pattern (audits notification access)
- Constitution: Defense-in-Depth Security (mandatory principle)

---

## Rollout Plan

1. **Phase 2**: Implement base RLS policies on core tables
2. **T018**: Build RLS test harness
3. **T044-T046**: Extend RLS tests per phase
4. **Before GA**: Security audit of all policies
5. **Production**: Enable RLS on all tables (no disable option)

---

## References

- Supabase RLS Documentation: https://supabase.com/docs/guides/auth/row-level-security
- Constitution: `.specify/memory/constitution.md` (Principle II)
- Specification: `specs/001-central-hub/spec.md` (Security section)

---

## Sign-Off

- [ ] Security Lead: Threat model review
- [ ] Database Architect: Schema review
- [ ] Backend Lead: Implementation review
- [ ] QA Lead: Test coverage verification

---

## History

| Date | Status | Notes |
|------|--------|-------|
| 2025-10-28 | Accepted | Initial RLS strategy for multi-tenant isolation |
