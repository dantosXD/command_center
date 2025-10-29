# Quick Start to Production

**Status**: Ready to deploy in 2-3 hours

## Prerequisites Checklist

- [ ] Docker and Docker Compose installed
- [ ] Node.js 22+ installed
- [ ] pnpm installed
- [ ] PostgreSQL client (psql) installed
- [ ] Domain name configured (optional for local)

## Step 1: Start Infrastructure (10 minutes)

```bash
# Start Docker Compose stack
cd infrastructure
docker-compose up -d

# Verify services are healthy
docker-compose ps

# Check logs
docker-compose logs -f postgres
```

## Step 2: Database Setup (15 minutes)

```bash
# Set database URL
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/command_center"

# Apply all migrations
for migration in backend/supabase/migrations/*.sql; do
  echo "Applying: $migration"
  psql $DATABASE_URL < $migration
done

# Load seed data
psql $DATABASE_URL < backend/supabase/seeds/dev.sql

# Verify
psql $DATABASE_URL -c "SELECT COUNT(*) FROM tasks;"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM events;"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM domains;"
```

## Step 3: Run Tests (30 minutes)

```bash
# Run all test suites
pnpm test

# Or run individually
pnpm --filter frontend test          # Unit tests
pnpm test:contract                   # API tests
pnpm test:rls                        # Security tests
pnpm test:accessibility              # WCAG tests
pnpm --filter frontend test:e2e      # E2E tests
```

## Step 4: Start Development Server (5 minutes)

```bash
# Start frontend dev server
pnpm --filter frontend dev

# Open browser
open http://localhost:5173

# Test login
# Email: test@example.com
# Password: (create via Supabase UI or seed data)
```

## Step 5: Deploy to Production (1-2 hours)

```bash
# Option A: Self-hosted (Docker Compose)
./scripts/deploy-prod.sh yourdomain.com admin@yourdomain.com

# Option B: Staging first
./scripts/deploy-staging.sh
# Test at staging.yourdomain.com
# Then: ./scripts/deploy-prod.sh

# Option C: Manual deployment
# 1. Build frontend
pnpm --filter frontend build

# 2. Deploy static files to CDN
# 3. Configure reverse proxy (Caddy/Nginx)
# 4. Set up SSL certificates
# 5. Configure environment variables
```

## Step 6: Post-Deployment Verification (15 minutes)

```bash
# Check services
curl https://yourdomain.com/api/health

# Check database
psql $DATABASE_URL -c "SELECT COUNT(*) FROM tasks;"

# Check logs
docker-compose logs -f --tail=100

# Run smoke tests
pnpm test:e2e --config=playwright.prod.config.ts
```

## Common Issues

### Docker services won't start
```bash
# Check ports
lsof -i :5432
lsof -i :54321

# Restart services
docker-compose down
docker-compose up -d
```

### Database connection fails
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Test connection
psql postgresql://postgres:postgres@localhost:5432/command_center -c "\l"

# Check logs
docker-compose logs postgres
```

### Build fails
```bash
# Clear cache
rm -rf .svelte-kit node_modules
pnpm install
pnpm --filter frontend build
```

### Tests fail
```bash
# Ensure database is seeded
psql $DATABASE_URL < backend/supabase/seeds/dev.sql

# Run tests with verbose output
pnpm --filter frontend test -- --reporter=verbose
```

## Production Checklist

- [ ] All tests passing
- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] Secrets in vault (not .env files)
- [ ] SSL certificates configured
- [ ] Firewall rules set
- [ ] Backups configured
- [ ] Monitoring set up (Grafana)
- [ ] Logging configured (Loki)
- [ ] Alert rules defined
- [ ] Runbook documented
- [ ] Team trained

## Support

- Documentation: `CLAUDE.md`
- Deployment Guide: `PRODUCTION_DEPLOYMENT.md`
- Constitution: `.specify/memory/constitution.md`
- Issues: Report to project maintainer

---

**Ready to deploy!** Follow these steps and you'll be live in 2-3 hours.
