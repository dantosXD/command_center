# Row-Level Security (RLS) Governance Runbook

**Owner**: Security Lead | **Review Frequency**: Monthly | **Last Updated**: 2025-10-28

## Overview

Command Center enforces strict Row-Level Security (RLS) policies across all tables. This runbook ensures:
1. Every new table ships with RLS enabled
2. Policies are explicitly defined and tested
3. Cross-domain access leaks are < 0.1% (target)
4. Secrets remain protected via managed vaults

## Table RLS Checklist

Before merging any data model change:

- [ ] Table created with `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`
- [ ] All columns are accessible to authenticated users only
- [ ] Workspace-scoped tables filter by `workspace_id` + user role
- [ ] Domain-scoped tables filter by `domain_id` + user role
- [ ] RLS tests pass: `pnpm test:rls`
- [ ] Security review completed (sign-off in PR)

## Core Policies (Phase 1)

### Workspaces Table

```sql
-- Workspace members can view their workspace
CREATE POLICY workspace_select ON workspaces
  FOR SELECT USING (
    id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

-- Only workspace admins can update
CREATE POLICY workspace_update ON workspaces
  FOR UPDATE USING (
    id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
```

### Domains Table

```sql
-- Users see domains they're members of
CREATE POLICY domain_select ON domains
  FOR SELECT USING (
    id IN (
      SELECT domain_id FROM domain_members
      WHERE user_id = auth.uid()
    )
  );

-- Domain owners/admins can update
CREATE POLICY domain_update ON domains
  FOR UPDATE USING (
    id IN (
      SELECT domain_id FROM domain_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );
```

### Tasks Table

```sql
-- Tasks are visible to users who have access to the domain
CREATE POLICY task_select ON tasks
  FOR SELECT USING (
    domain_id IN (
      SELECT domain_id FROM domain_members
      WHERE user_id = auth.uid()
    )
  );

-- Task owners or domain admins can update
CREATE POLICY task_update ON tasks
  FOR UPDATE USING (
    domain_id IN (
      SELECT domain_id FROM domain_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
    OR assigned_to = auth.uid()
  );
```

## Testing RLS Policies

### Unit Test Example

```typescript
// tests/rls/domain-visibility.spec.ts
import { describe, it, expect, beforeAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

describe('Domain RLS: Cross-domain access isolation', () => {
  let alice: ReturnType<typeof createClient>;
  let bob: ReturnType<typeof createClient>;

  beforeAll(async () => {
    // Create two authenticated Supabase clients as different users
    alice = createClient(SUPABASE_URL, ANON_KEY, {
      auth: { persistSession: false }
    });
    bob = createClient(SUPABASE_URL, ANON_KEY, {
      auth: { persistSession: false }
    });

    // Sign in as different users
    await alice.auth.signInWithPassword({ email: 'alice@test.local', password: 'password' });
    await bob.auth.signInWithPassword({ email: 'bob@test.local', password: 'password' });
  });

  it('should prevent Bob from viewing Alice\'s private domain', async () => {
    // Create Alice's domain (private)
    const { data: aliceDomain } = await alice.from('domains')
      .insert({ name: 'Alice Work', visibility: 'private' })
      .select()
      .single();

    // Try to select as Bob
    const { data: result, error } = await bob.from('domains')
      .select('*')
      .eq('id', aliceDomain.id);

    // Should return empty, not an error
    expect(result).toEqual([]);
    expect(error).toBeNull();
  });

  it('should allow Bob to view workspace domains he\'s a member of', async () => {
    // Create a workspace domain and add Bob
    const { data: domain } = await alice.from('domains')
      .insert({ name: 'Shared Project', visibility: 'workspace' })
      .select()
      .single();

    await alice.from('domain_members').insert({
      domain_id: domain.id,
      user_id: bob.auth.user!.id,
      role: 'member',
    });

    // Bob can now see it
    const { data: result } = await bob.from('domains')
      .select('*')
      .eq('id', domain.id);

    expect(result).toHaveLength(1);
  });
});
```

## Running RLS Test Suite

```bash
# Run all RLS tests
pnpm test:rls

# Run specific RLS test file
pnpm test:rls tests/rls/domain-visibility.spec.ts

# With verbose output
pnpm test:rls -- --reporter=verbose
```

## Adding New RLS Policies

### 1. Define in Migration

```sql
-- backend/supabase/migrations/XXX_feature_name.sql

-- Policy for new table
CREATE POLICY feature_select ON new_table
  FOR SELECT USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );
```

### 2. Write Test

Create corresponding test in `tests/rls/` to verify isolation.

### 3. Security Review

Before merge, security lead reviews:
- [ ] Policy logic is correct and airtight
- [ ] Joins are efficient (indexed columns)
- [ ] No accidental data exposure paths

## Common RLS Pitfalls

### ❌ Bad: Trusting client-side ID

```sql
-- DANGEROUS: User can change `workspace_id` in request
WHERE workspace_id = body.workspace_id
```

### ✅ Good: Verify via auth context

```sql
-- SAFE: RLS verifies user has access to this workspace
WHERE workspace_id IN (
  SELECT workspace_id FROM workspace_members
  WHERE user_id = auth.uid()
)
```

### ❌ Bad: Missing deny policy

```sql
-- Allows anyone to see data by default if no SELECT policy
```

### ✅ Good: Explicit allow + deny

```sql
-- Default deny (RLS enabled) + explicit allow
CREATE POLICY select_policy ON table
  FOR SELECT USING (user_has_access);
```

## Monitoring RLS Violations

### Enable Audit Logging

```sql
-- Log all access attempts to sensitive tables
CREATE TRIGGER audit_domain_access
AFTER SELECT ON domains
FOR EACH ROW
EXECUTE FUNCTION audit_log_access('domain_access');
```

### Query Violations

```bash
# SSH into database
psql postgresql://postgres:password@localhost:5432/command_center

# Check recent violations
SELECT * FROM audit_log
WHERE event_type = 'rls_violation'
ORDER BY created_at DESC
LIMIT 10;
```

### Alert on Violations

Sentry integration (Phase 6+) will auto-alert on RLS violation patterns:
```typescript
// Edge Function or trigger
if (rls_violation_detected) {
  Sentry.captureException(new Error('RLS Violation Detected'), {
    tags: { severity: 'critical' }
  });
}
```

## Secret Management (No Credentials in Repo)

### Vault Locations

- **Local Dev**: `.env.local` (gitignored, never commit)
- **CI/CD**: GitHub Actions Secrets (encrypted)
- **Production**: Managed vault (AWS Secrets Manager, HashiCorp Vault, etc.)

### Never Commit

```bash
# ❌ FORBIDDEN
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DB_PASSWORD=postgres_secret_123
POSTAL_API_KEY=key_xxx

# Use environment variables instead
export SUPABASE_SERVICE_ROLE_KEY=$(aws secretsmanager get-secret-value ...)
```

## Quarterly Audit Checklist

Every 3 months, security lead reviews:

- [ ] All tables have RLS enabled
- [ ] All policies follow least-privilege principle
- [ ] RLS test suite passes (0 failures)
- [ ] No cross-domain access leaks reported (audit log review)
- [ ] Secrets remain encrypted and vault-managed
- [ ] New features follow RLS patterns from Phase 1
- [ ] Performance metrics healthy (policy joins < 50ms P95)

## Escalation

**Critical RLS Violation**: Immediate response required
1. Alert on-call security lead
2. Disable affected table access (via feature flag)
3. Rollback to last known good commit
4. Root cause analysis
5. Deploy fix with RLS tests

**Non-critical Violation**: Standard triage (< 24h)
1. Log in audit trail
2. Investigate
3. Patch and test
4. Deploy with RLS tests

## References

- [Central Hub Architecture ADR](../adr/001-central-hub-architecture.md)
- [RLS Policy Details ADR](../adr/002-row-level-security.md)
- Supabase RLS docs: https://supabase.com/docs/learn/auth-deep-dive/auth-row-level-security
