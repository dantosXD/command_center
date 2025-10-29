# Local Development Runbook

## Prerequisites

- **Node.js**: Check `.nvmrc` for required version (currently 20+)
- **pnpm**: Install globally (`npm install -g pnpm`)
- **Docker**: Required for database and infrastructure services
- **Docker Compose**: For orchestrating dev stack

## Initial Setup

### 1. Clone and Install Dependencies

```bash
# From repository root
pnpm install
```

### 2. Start Infrastructure Stack

```bash
# From repository root
docker-compose up -d

# Verify services are running
docker-compose ps
```

This starts:
- **Postgres 15** (port 5432)
- **PostgREST** API (port 3000)
- **Supabase GoTrue** Auth (port 9999)
- **Supabase Realtime** (port 4000)
- **Postal** Email service (port 5000)
- **SeaweedFS** Object storage (port 8333)
- **Caddy** Reverse proxy/TLS (port 443, 80)
- **Prometheus** Metrics (port 9090)

### 3. Run Database Migrations

```bash
# Via Supabase CLI (if installed)
supabase migration up

# Or manually via psql
psql postgresql://postgres:postgres@localhost:5432/command_center < backend/supabase/migrations/0001_init.sql
psql postgresql://postgres:postgres@localhost:5432/command_center < backend/supabase/migrations/0002_core_entities.sql
# ... repeat for all migrations
```

### 4. Environment Variables

Create `.env.local` in the monorepo root:

```env
# Supabase
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_DB_PASSWORD=postgres

# SeaweedFS (presigned URLs)
SEAWEEDFS_S3_ENDPOINT=http://localhost:8333

# Feature flags (Phase 5+)
FEATURE_CENTRAL_HUB_MVP=true
```

## Development Workflow

### Run Frontend Dev Server

```bash
pnpm --filter frontend dev
```

Access at http://localhost:5173

### Run Backend Edge Functions Locally

```bash
# Requires Supabase CLI
supabase functions serve
```

### Type Checking

```bash
# Frontend
pnpm --filter frontend check

# Both
pnpm --filter frontend check && npm exec -- pnpm fmt
```

### Linting

```bash
# Frontend
pnpm --filter frontend lint

# Backend (Deno)
pnpm fmt  # or: deno fmt backend/supabase/functions
deno lint backend/supabase/functions
```

### Testing

```bash
# Frontend unit tests
pnpm --filter frontend test

# Contract tests (requires Postgres)
pnpm test:contract

# RLS tests (requires Postgres)
pnpm test:rls

# Accessibility tests
pnpm test:accessibility

# E2E tests (Playwright)
pnpm --filter frontend test:e2e
pnpm --filter frontend test:e2e:ui  # Open Playwright UI
```

## Building for Production

```bash
# Frontend
pnpm --filter frontend build

# Backend (Edge Functions)
supabase functions deploy
```

## Debugging

### Database Connection Issues

```bash
# Test Postgres connection
docker-compose exec postgres psql -U postgres -d command_center -c "SELECT 1"

# View Postgres logs
docker-compose logs -f postgres
```

### PostgREST API Issues

```bash
# Check PostgREST is running
curl http://localhost:3000/rest/v1/workspaces

# View PostgREST logs
docker-compose logs -f postgrest
```

### Frontend HMR Issues

If hot reload stops working:
1. Restart the dev server: `Ctrl+C` then `pnpm --filter frontend dev`
2. Clear Vite cache: `rm -rf frontend/.vite frontend/node_modules/.vite`

### Edge Function Errors

```bash
# Check if function exists
supabase functions list

# Deploy specific function
supabase functions deploy presign --debug

# View Edge Function logs
supabase functions logs presign
```

## Cleanup

### Stop Infrastructure Stack

```bash
docker-compose down
```

### Full Reset (Database)

```bash
# Remove all containers and volumes
docker-compose down -v

# Restart and run migrations
docker-compose up -d
# Then re-run migrations as in Initial Setup step 3
```

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Port already in use | Another service occupies port | `docker-compose down` then check `netstat -an` |
| RLS tests fail | Migrations didn't run | Verify all migrations applied: `psql -c "\dt"` |
| Frontend won't build | Missing .env.local | Create `.env.local` with Supabase credentials |
| E2E tests timeout | Service not ready | Run `docker-compose up -d` and wait 10s before tests |

## Next Steps

- See [DEPLOYMENT.md](DEPLOYMENT.md) for staging/production runbooks
- See [ARCHITECTURE.md](../adr/001-central-hub-architecture.md) for system design details
- See [RLS_GUIDE.md](RLS_GUIDE.md) for Row-Level Security governance
