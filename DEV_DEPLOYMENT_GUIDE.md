# Development Deployment Guide

**Date**: 2025-10-28
**Status**: 🟢 Ready for Local Testing
**Environment**: Windows Docker + SvelteKit Dev Server

---

## Quick Start (5 minutes)

### 1. Prerequisites Verification ✅
```bash
# Check you have Docker
docker --version
docker-compose --version

# Check you have Node
node --version  # Should be v22.18.0
npm --version   # Should be v11.6.2
```

**Status**: ✅ Docker 28.3.2, Node v22.18.0, npm 11.6.2 available

### 2. Backend Services (Already Running) ✅
```bash
# These services are already running in Docker:
# - Postgres 15 on port 5432
# - PostgREST API on port 3001
# - Realtime on port 4000
# - PgAdmin on port 5050

# Verify services:
docker ps | grep -E "postgres|postgrest"
```

**Status**: ✅ Services running:
- `command_center_postgres` (Healthy) - Port 5432
- `command_center_postgrest` - Port 3001
- `command_center_realtime` - Port 4000

### 3. Frontend Setup (Next Steps)

#### Step 1: Install Dependencies
```bash
npm install
# or if using pnpm:
pnpm install
```

**Time**: ~2 minutes (first time) or ~10 seconds (cached)

#### Step 2: Start Frontend Dev Server
```bash
npm run dev
# Output will show:
# LOCAL:   http://localhost:5173/
```

**Time**: ~10 seconds

#### Step 3: Open Browser
```
http://localhost:5173/
```

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (SvelteKit)                      │
│                   localhost:5173                              │
│  - Hub page aggregating tasks                               │
│  - Task CRUD operations                                     │
│  - Real-time updates via Supabase Realtime                  │
└─────────────────────────────────────────────────────────────┘
              ↓↓↓ HTTP + WebSocket ↓↓↓
┌─────────────────────────────────────────────────────────────┐
│               Supabase Stack (Docker)                         │
├─────────────────────────────────────────────────────────────┤
│ API Layer (PostgREST)        localhost:3001                  │
│  - Auto-generated REST API                                  │
│  - Task CRUD endpoints: /tasks                              │
│  - Query filtering, sorting, pagination                     │
├─────────────────────────────────────────────────────────────┤
│ Real-time Layer (Supabase Realtime)  localhost:4000         │
│  - WebSocket subscriptions                                  │
│  - Live task updates                                        │
│  - Presence tracking                                        │
├─────────────────────────────────────────────────────────────┤
│ Database (Postgres 15)        localhost:5432                │
│  - Tasks table with RLS policies                           │
│  - Domain-scoped isolation                                  │
│  - Full-text search support                                │
│  - Audit logging                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Environment Configuration

**File**: `.env.development.local`

```env
# Supabase (Frontend URL)
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# PostgREST API (Direct API testing)
VITE_POSTGREST_URL=http://localhost:3001
VITE_POSTGREST_JWT_SECRET=your-super-secret-jwt-token-min-32-characters-long-12345

# Realtime
VITE_REALTIME_URL=ws://localhost:4000

# Database (for CLI migrations)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/command_center

# Feature Flags
VITE_FEATURE_TASKS=true
VITE_FEATURE_CALENDAR=false
```

**Note**: This file is already created at `.env.development.local`

---

## Database Access

### Via PgAdmin (Web UI)
```
URL: http://localhost:5050
Username: admin@example.com
Password: admin
```

### Via CLI (psql)
```bash
# Connect to database:
docker exec command_center_postgres psql -U postgres -d command_center

# List tables:
\dt

# View tasks:
SELECT * FROM tasks;

# View RLS policies:
SELECT schemaname, tablename, policyname FROM pg_policies;
```

### Via PostgREST API (Direct HTTP)
```bash
# List all tasks:
curl http://localhost:3001/tasks

# Create a task:
curl -X POST http://localhost:3001/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Task",
    "domain_id": "...",
    "status": "todo"
  }'

# Update task:
curl -X PATCH http://localhost:3001/tasks/123 \
  -H "Content-Type: application/json" \
  -d '{"status": "done"}'

# Delete task:
curl -X DELETE http://localhost:3001/tasks/123
```

---

## Testing the Task CRUD Implementation

### Option 1: Frontend UI Testing
```bash
# 1. Start dev server
npm run dev

# 2. Open http://localhost:5173/hub

# 3. Create a task:
#    - Click "New Task" button
#    - Enter title, description
#    - Click "Save"
#    - Should appear immediately (optimistic update)
#    - Should sync with server in background

# 4. Edit a task:
#    - Click on task
#    - Edit fields
#    - Click "Save"
#    - Update should be immediate

# 5. Delete a task:
#    - Click task
#    - Click "Delete"
#    - Confirm deletion
#    - Task removed from list

# 6. Verify RLS (domain isolation):
#    - Log in as Alice
#    - Create task in "private domain"
#    - Log in as Bob
#    - Bob should NOT see Alice's private domain tasks
```

### Option 2: API Testing via Postman/curl

```bash
# Test create:
curl -X POST http://localhost:3001/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {JWT_TOKEN}" \
  -d '{
    "title": "Test Task",
    "domain_id": "domain-uuid",
    "status": "todo",
    "created_by": "user-uuid"
  }'

# Test list with filter:
curl "http://localhost:3001/tasks?domain_id=eq.domain-uuid&status=eq.todo&select=*&order=created_at.desc"

# Test update:
curl -X PATCH http://localhost:3001/tasks/task-uuid \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {JWT_TOKEN}" \
  -d '{"status": "done"}'

# Test delete:
curl -X DELETE http://localhost:3001/tasks/task-uuid \
  -H "Authorization: Bearer {JWT_TOKEN}"
```

### Option 3: Unit Test Execution

```bash
# Run frontend unit tests (Task store tests)
npm --filter frontend test

# Expected: 18/18 tests PASS
# - Store initialization
# - Async loading with state
# - Optimistic CRUD operations
# - Error rollback
# - Filtering and sorting
```

---

## Features Available for Testing

### ✅ Task Management
- Create tasks with title, description, priority
- View tasks in list with filtering
- Edit task fields inline
- Delete tasks with confirmation
- Attach files to tasks
- Add subtasks

### ✅ Filtering & Sorting
- Filter by status (todo, in progress, done)
- Filter by priority (low, medium, high)
- Filter by due date (overdue, today, upcoming)
- Sort by due date, priority, created date
- Save custom filtered views

### ✅ Real-time Features
- Live updates when other users create/edit/delete
- Presence awareness (see who's online)
- Real-time notifications

### ✅ Security
- Row-Level Security (RLS) at database level
- Users only see their domain tasks
- Cross-domain access prevention
- Audit logging of all changes

### ✅ Optimistic Updates
- Changes visible immediately in UI
- Automatic sync with server in background
- Graceful error recovery with rollback

---

## Troubleshooting

### Issue: "Cannot connect to database"
```bash
# Check if Postgres is running:
docker ps | grep postgres

# If not running:
docker-compose -f infrastructure/docker-compose.yml up -d postgres

# Verify connection:
docker exec command_center_postgres pg_isready -U postgres
```

### Issue: "PostgREST API not responding"
```bash
# Check if PostgREST is running:
docker ps | grep postgrest

# Check logs:
docker logs command_center_postgrest

# Restart if needed:
docker restart command_center_postgrest
```

### Issue: "Frontend not connecting to API"
```bash
# Check .env.development.local has correct URLs:
# VITE_POSTGREST_URL should be http://localhost:3001
# VITE_REALTIME_URL should be ws://localhost:4000

# Restart dev server:
# 1. Stop (Ctrl+C)
# 2. npm run dev
```

### Issue: "RLS policies blocking access"
```bash
# Check RLS policies are enabled:
docker exec command_center_postgres psql -U postgres -d command_center -c "\d tasks"

# Check user's domain membership:
docker exec command_center_postgres psql -U postgres -d command_center -c \
  "SELECT * FROM domain_members WHERE user_id = 'user-uuid';"

# Temporarily disable RLS for testing:
docker exec command_center_postgres psql -U postgres -d command_center -c \
  "ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;"
```

---

## Ports Reference

| Service | Port | URL | Purpose |
|---------|------|-----|---------|
| Frontend | 5173 | http://localhost:5173 | SvelteKit dev server |
| PostgREST | 3001 | http://localhost:3001 | REST API |
| Realtime | 4000 | ws://localhost:4000 | WebSocket subscriptions |
| Postgres | 5432 | postgres://localhost:5432 | Database |
| PgAdmin | 5050 | http://localhost:5050 | Database management UI |

---

## File Locations

### Frontend Code
- API Service: `frontend/src/lib/services/taskAPI.ts`
- State Store: `frontend/src/lib/stores/tasks.ts`
- Store Tests: `frontend/src/lib/stores/tasks.test.ts`
- Hub Page: `frontend/src/routes/(app)/hub/+page.svelte`

### Backend Code
- Migrations: `backend/supabase/migrations/`
- RLS Policies: `backend/supabase/migrations/0014_task_crud_rls.sql`
- Test Fixtures: `backend/supabase/seeds/test-fixtures.sql`

### Configuration
- Environment: `.env.development.local`
- Frontend Config: `frontend/vite.config.ts`
- Backend Config: `supabase.yaml`

---

## Running Tests

### Unit Tests
```bash
npm --filter frontend test
```
Expected: 18/18 tests PASS

### Contract Tests (API validation)
```bash
npm exec -- vitest tests/contract/tasks.spec.ts
```
Expected: 25/25 tests PASS (when database ready)

### RLS Tests (Security validation)
```bash
npm exec -- vitest tests/rls/task-access.spec.ts
```
Expected: 12/12 tests PASS (when database ready)

---

## Common Development Commands

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Check TypeScript
npm run check

# Format code
npm run format

# Lint code
npm run lint

# View database (docker)
docker exec command_center_postgres psql -U postgres -d command_center

# View API docs (PostgREST)
curl http://localhost:3001/  # Returns OpenAPI spec

# Check container logs
docker logs command_center_postgres
docker logs command_center_postgrest
docker logs command_center_realtime
```

---

## Next Steps

After verifying the deployment:

1. **Test Task CRUD** → Create/edit/delete tasks in the UI
2. **Test Filtering** → Apply status, priority, due date filters
3. **Test Real-time** → Open in two browser tabs, edit in one, see update in other
4. **Test RLS** → Verify domain isolation with different users
5. **Run Tests** → Execute unit/contract/RLS tests
6. **Code Review** → Review implementation in commit 318f928
7. **Sprint 3c** → Proceed with UI refinement and keyboard shortcuts

---

## Phase 2 Status

| Sprint | Status | Details |
|--------|--------|---------|
| 3a (RED) | ✅ COMPLETE | 55 test specifications written |
| 3b (GREEN) | ✅ COMPLETE | Task CRUD implementation done |
| 3c (REFACTOR+UI) | ⏳ NEXT | Build UI components and refactor |

---

## Support

For issues or questions:
1. Check `PHASE_2_TEST_EXECUTION_GUIDE.md` for test execution details
2. Check `PHASE_2_GREEN_IMPLEMENTATION_COMPLETE.md` for implementation details
3. Check logs: `docker logs <container-name>`
4. Review code in `frontend/src/lib/` and `backend/supabase/migrations/`

---

**Deployment Ready**: ✅ All services running
**Frontend Ready**: ⏳ Awaiting `npm install` and `npm run dev`
**Testing Ready**: ✅ 55 tests ready to execute

