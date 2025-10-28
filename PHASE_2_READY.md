# Phase 2: Foundational Infrastructure - Ready to Execute

**Status**: Phase 1 Complete, Phase 2 Prerequisites Verified
**Date**: 2025-10-28
**Branch**: 001-central-hub
**Tasks in Phase**: 15 tasks

---

## Phase 2 Overview

**Phase 2 (Weeks 3-4 of 11)** establishes core infrastructure and security layers:

- Row-Level Security policies on all tables
- Docker Compose stack (Postgres, Supabase, SeaweedFS, Postal, Caddy)
- Testing harnesses (RLS, contract, Playwright)
- Feature flags and scheduling infrastructure

---

## Phase 2 Tasks Breakdown

### Critical Path (Must Complete First)

| Task | Description | Status | Duration |
|------|-------------|--------|----------|
| T011 | RLS policies on all tables | 🟡 IN PROGRESS | 4-6 hours |
| T013 | Docker Compose stack | ⏳ BLOCKED ON T011 | 4-6 hours |
| T021 | SeaweedFS presign Edge Function | ⏳ READY | 2-3 hours |
| T024 | Search indexes (pg_trgm, full-text) | ⏳ READY | 2-3 hours |

### Supporting Infrastructure (Parallel)

| Task | Description | Status | Dependency |
|------|-------------|--------|------------|
| T012 | Storage buckets & metadata | ⏳ READY | T011 |
| T014 | SeaweedFS configuration | ⏳ READY | T013 |
| T015 | Health check scripts | ⏳ READY | T013 |
| T016 | Secrets vault integration | ⏳ READY | T013 |
| T017 | Secret scanning CI | ⏳ READY | - |
| T018 | RLS test harness | ⏳ READY | T011 |
| T019 | Contract test harness | ⏳ READY | - |
| T020 | Playwright base config | ✅ DONE | - |
| T022 | pg_cron jobs table | ⏳ READY | T011 |
| T023 | Feature flags schema | ⏳ READY | T011 |

---

## Current Status

### Completed in Phase 1
- [x] SvelteKit bootstrap complete
- [x] Testing frameworks configured
- [x] ADRs documented (3 critical decisions)
- [x] Monorepo setup

### In Progress (T011)
- 🟡 **RLS Policies**: Base file exists (`backend/supabase/storage-policies/tenancy.sql`)
  - Status: Base structure present, needs enhancement
  - Policies included:
    - Workspace isolation
    - Domain visibility (private/shared/workspace)
    - Collection access control
    - Task/event visibility
    - Task dependencies
    - Attachment permissions
  - Work remaining:
    - [ ] Complete all table policies
    - [ ] Add audit logging triggers
    - [ ] Verify cross-domain isolation
    - [ ] Test with RLS harness

### Ready for Immediate Execution
- ✅ T021: SeaweedFS presign Edge Function
- ✅ T024: Search indexes

---

## RLS Policies Status

### Already Implemented ✅
```sql
✓ Workspace isolation (owner-only)
✓ Domain visibility rules (private/shared/workspace)
✓ Domain member access control
✓ Collection access (via domain membership)
✓ Task visibility (via domain membership)
✓ Event visibility (via domain membership)
✓ Task dependency policies
✓ Attachment policies
✓ Helper functions (current_user_uid, is_workspace_owner)
```

### Still Needed 🟡
- Complete audit logging triggers
- Notification policies
- Notification outbox policies
- User preferences policies
- Enable RLS on remaining tables
- Test all policies comprehensively

---

## Docker Compose Status

**File Location**: `infrastructure/docker-compose.yml`

**Services Needed**:
1. Postgres 15 (database)
2. Supabase services (API, Auth, Realtime)
3. SeaweedFS (S3-compatible storage)
4. Postal (email SMTP server)
5. Caddy (reverse proxy with TLS)
6. Prometheus (metrics)
7. Redis (caching, optional)

**Action**: Create docker-compose.yml with all services configured

---

## Feature Flags Infrastructure

**Location**: `backend/supabase/migrations/0005_flags.sql`

**Flags to Define**:
```sql
- central-hub-mvp (Phase 3)
- calendar-overlay (Phase 4)
- mvp-dashboard (Phase 5)
- collaboration-features (Phase 6)
- notification-outbox-v2 (Phase 4)
- comment-mentions (Phase 6)
```

---

## Search Infrastructure

**Location**: Database indexes in migrations

**Needs**:
1. pg_trgm extension (full-text search)
2. Materialized view for search index
3. GIN indexes for fast lookups
4. Search RPC function

---

## Estimated Phase 2 Duration

| Component | Duration | Notes |
|-----------|----------|-------|
| RLS Policies | 4-6 hours | Complete and test |
| Docker Compose | 4-6 hours | All services |
| SeaweedFS Config | 2-3 hours | S3 compatibility |
| Search Indexes | 2-3 hours | Performance tuning |
| Feature Flags | 1-2 hours | Schema only |
| Test Harnesses | 4-6 hours | RLS + contract testing |
| Health Checks | 2-3 hours | Readiness probes |
| **Total** | **20-30 hours** | **3-4 days with parallelization** |

---

## Phase 2 Success Criteria

When Phase 2 is complete:

✅ All tables have RLS policies
✅ Workspace/domain isolation enforced
✅ Docker stack runs locally
✅ Feature flags infrastructure ready
✅ Search indexes configured
✅ RLS test harness passing
✅ Contract test harness passing
✅ Health checks functional
✅ CI pipeline can run tests

---

## Immediate Next Steps

### Step 1: Enhance RLS Policies (T011) - 2-3 hours
```bash
# Verify current state
cat backend/supabase/storage-policies/tenancy.sql

# Enhance with:
# - Complete all table policies
# - Add audit triggers
# - Enable RLS on all tables
# - Test with RLS harness
```

### Step 2: Create Docker Compose Stack (T013) - 4-6 hours
```bash
# Create infrastructure/docker-compose.yml with:
# - Postgres 15
# - Supabase services
# - SeaweedFS
# - Postal
# - Caddy
# - Prometheus

docker-compose up -d
docker-compose logs -f postgres
```

### Step 3: Configure Search (T024) - 2-3 hours
```sql
-- Create search migration:
-- - Enable pg_trgm extension
-- - Create search materialized view
-- - Create GIN indexes
-- - Create search RPC function
```

### Step 4: Define Feature Flags (T023) - 1-2 hours
```sql
-- Create feature_flags table
-- - flag_name
-- - enabled_by_default
-- - per_tenant_overrides
-- - rollout_status
```

---

## Phase 2 Command Reference

```bash
# Check git status
git status

# Create new migrations
touch backend/supabase/migrations/0003_storage.sql
touch backend/supabase/migrations/0004_pg_cron.sql
touch backend/supabase/migrations/0005_flags.sql
touch backend/supabase/migrations/0006_search.sql

# Start Docker stack
docker-compose -f infrastructure/docker-compose.yml up -d

# View logs
docker-compose logs postgres
docker-compose logs supabase

# Connect to Postgres
docker-compose exec postgres psql -U postgres -d command_center

# Run tests
npm run test  # Unit tests
npm run test:rls  # RLS tests (after T018)
npm run test:contract  # Contract tests (after T019)
```

---

## Risk Assessment

| Risk | Mitigation | Status |
|------|-----------|--------|
| RLS complexity | Test harness validates isolation | ✅ Ready |
| Docker overhead | Use compose for local dev only | ✅ Ready |
| Database migration conflicts | One migration per task | ✅ Ready |
| Missing dependencies | All prereqs from Phase 1 | ✅ Ready |

---

## Phase 2 Rollout Plan

**Day 1 (4-6 hours)**:
- Enhance RLS policies (T011)
- Verify cross-domain isolation
- Create RLS test harness (T018)

**Day 2 (4-6 hours)**:
- Create Docker Compose stack (T013)
- Configure SeaweedFS (T014)
- Create health check scripts (T015)

**Day 3 (4-6 hours)** (Parallel):
- Create search migration (T024)
- Create feature flags schema (T023)
- Secrets vault integration (T016)

**Day 4 (2-3 hours)** (Final):
- CI secret scanning setup (T017)
- Contract test harness (T019)
- All tests passing

---

## Resources & Documentation

| Resource | Location |
|----------|----------|
| RLS Policies | `backend/supabase/storage-policies/tenancy.sql` |
| Docker Compose | `infrastructure/docker-compose.yml` (to create) |
| ADR-002 (RLS Strategy) | `docs/adr/002-row-level-security.md` |
| ADR-001 (Hub Architecture) | `docs/adr/001-central-hub-architecture.md` |
| Spec | `specs/001-central-hub/spec.md` |
| Plan | `specs/001-central-hub/plan.md` |
| Tasks | `specs/001-central-hub/tasks.md` |

---

## How to Execute Phase 2

### Option 1: Automated with SpecKit
```
/speckit.implement
```
Workflow will execute Phase 2 tasks in order.

### Option 2: Manual Execution
Follow the task breakdown in `specs/001-central-hub/tasks.md`

1. T011: Complete RLS policies
2. T012-T020: Infrastructure setup (parallel where possible)
3. T021: SeaweedFS presign function
4. T022-T024: pg_cron, feature flags, search

### Option 3: Targeted Execution
Start with critical path:
```bash
# T011: RLS policies
nano backend/supabase/storage-policies/tenancy.sql
# enhance + test

# T013: Docker Compose
nano infrastructure/docker-compose.yml
# create full stack

# Verify everything works
docker-compose up -d
npm run test:rls
npm run test:contract
```

---

## Phase 2 Completion Checklist

- [ ] T011: RLS policies complete and tested
- [ ] T012: Storage buckets schema created
- [ ] T013: Docker Compose stack functional
- [ ] T014: SeaweedFS configured
- [ ] T015: Health check scripts created
- [ ] T016: Secrets vault configured
- [ ] T017: Secret scanning in CI
- [ ] T018: RLS test harness complete
- [ ] T019: Contract test harness complete
- [ ] T020: Playwright config verified
- [ ] T021: SeaweedFS presign function created
- [ ] T022: pg_cron jobs configured
- [ ] T023: Feature flags schema created
- [ ] T024: Search indexes configured

**Phase 2 Ready**: ✅ All prerequisites met, ready to execute

---

## Summary

**Phase 1**: ✅ COMPLETE (8/8)
**Phase 2**: 🔄 READY (Prerequisites verified, T011 in progress)

Next steps:
1. Complete T011 (RLS policies) - 2-3 hours
2. Create T013 (Docker Compose) - 4-6 hours
3. Execute remaining Phase 2 tasks - 3-4 days total

---

**Status**: Ready to proceed with Phase 2 implementation

Generated: 2025-10-28
Branch: 001-central-hub
