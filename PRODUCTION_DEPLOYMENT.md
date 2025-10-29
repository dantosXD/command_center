# Production Deployment Guide - Command Center

**Status**: Production-ready self-hosted infrastructure
**Last Updated**: October 2025
**Phase**: MVP Phase 2 Complete

---

## Table of Contents
1. [Deployment Options](#deployment-options)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Docker Compose Self-Hosted Deployment](#docker-compose-self-hosted-deployment)
4. [Security & RLS Validation](#security--rls-validation)
5. [Monitoring & Logging](#monitoring--logging)
6. [Disaster Recovery](#disaster-recovery)
7. [Troubleshooting](#troubleshooting)

---

## Deployment Options

### Option A: Docker Compose (Self-Hosted) - RECOMMENDED FOR MVP ✓

**Best for**: VPS, dedicated servers, on-premise deployments

**Services Included**:
- PostgreSQL 15 (primary database)
- Supabase Auth (GoTrue) - user authentication
- PostgREST - auto-generated REST API
- Supabase Realtime - WebSocket subscriptions
- SeaweedFS - S3-compatible object storage
- Postal - SMTP email server
- Caddy - reverse proxy with automatic TLS
- Redis - caching (Phase 5+)
- Prometheus + Grafana - monitoring
- Loki - logging aggregation

**Pros**:
- ✓ Simple deployment (`docker-compose up`)
- ✓ No vendor lock-in
- ✓ Full feature parity
- ✓ Cost-effective ($5-50/month on basic VPS)
- ✓ Complete control over infrastructure

**Cons**:
- Requires manual ops (backups, scaling, updates)
- Single server failure = downtime (mitigate with backups)

**Cost Estimate**: $10-30/month (2GB RAM, 20GB SSD VPS)

---

### Option B: Kubernetes (k3s) - FOR SCALE

**Best for**: High availability, multi-node clusters, auto-scaling

**Requires**: Knowledge of Kubernetes, container orchestration

**Status**: Future roadmap (Phase 6+)

---

### Option C: Cloud-Hosted Hybrid

**Frontend**: Vercel/Netlify
**Backend**: Supabase cloud (managed)
**Status**: Not recommended for MVP (vendor lock-in, higher cost)

---

## Pre-Deployment Checklist

### Security & Secrets
- [ ] Generate new JWT secrets (min 32 chars, use `openssl rand -base64 32`)
- [ ] Store secrets in vault (never commit to git)
  - `GOTRUE_JWT_SECRET`
  - `PGRST_JWT_SECRET`
  - `POSTAL_API_KEY`
  - Database passwords
- [ ] Enable HTTPS (Caddy auto-generates with Let's Encrypt)
- [ ] Configure firewall rules
  - Block direct database access (only from PostgREST)
  - Block direct Auth service (only from frontend)
  - Allow HTTPS (443), HTTP (80), SSH (22) only

### Database & RLS
- [ ] All tables have explicit RLS policies ✓ (pre-configured)
- [ ] Test RLS isolation: cross-domain access blocked
- [ ] Create database user with minimal permissions (not postgres)
- [ ] Enable Point-in-Time Recovery (PITR) backups
- [ ] Run backup before deployment: `pg_dump -h localhost -U postgres command_center > backup.sql`

### Frontend & Environment
- [ ] Set production environment variables:
  ```env
  VITE_SUPABASE_URL=https://api.yourdomain.com  # Your Caddy reverse proxy
  VITE_SUPABASE_ANON_KEY=your_anon_key
  NODE_ENV=production
  ```
- [ ] Build frontend: `pnpm --filter frontend build`
- [ ] Test production build locally: `pnpm --filter frontend preview`

### Testing
- [ ] All tests pass: `pnpm test` ✓
- [ ] Contract tests validate API schema ✓
- [ ] RLS isolation tests pass ✓
- [ ] E2E smoke tests pass: `pnpm test:e2e`
- [ ] Accessibility audit: `pnpm test:accessibility`

### Monitoring & Alerting
- [ ] Prometheus scrape targets configured
- [ ] Grafana dashboards set up
- [ ] Alert rules for:
  - Database connection failures
  - High CPU/memory usage
  - API response time > 1s
  - RLS policy violations
- [ ] Log aggregation (Loki) enabled
- [ ] Sentry (error tracking) configured (optional)

---

## Docker Compose Self-Hosted Deployment

### Prerequisites

1. **VPS Setup** (e.g., DigitalOcean, Linode, Hetzner)
   - 2GB+ RAM, 20GB+ SSD
   - Ubuntu 22.04 LTS or similar
   - SSH access

2. **Install Docker & Docker Compose**
   ```bash
   curl -fsSL https://get.docker.com | sudo sh
   sudo usermod -aG docker $USER

   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
     -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

3. **Clone Repository**
   ```bash
   git clone https://github.com/yourusername/command_center.git
   cd command_center
   ```

### Step 1: Prepare Environment

```bash
# Create production env file
cat > .env.production << 'EOF'
# Database
POSTGRES_USER=command_center
POSTGRES_PASSWORD=<generate-strong-password>
POSTGRES_DB=command_center

# Auth (GoTrue)
GOTRUE_JWT_SECRET=<generate-32-char-secret>
GOTRUE_JWT_EXP=3600
GOTRUE_SITE_URL=https://yourdomain.com
GOTRUE_URI_ALLOW_LIST=https://yourdomain.com
GOTRUE_SMTP_HOST=postal
GOTRUE_SMTP_FROM_EMAIL=noreply@yourdomain.com

# API (PostgREST)
PGRST_JWT_SECRET=<same-as-gotrue-secret>
PGRST_OPENAPI_SERVER_PROXY_URL=https://yourdomain.com/api

# Postal (Email)
POSTAL_API_KEY=<generate-postal-key>
POSTAL_FROM_EMAIL=noreply@yourdomain.com

# Caddy (Reverse Proxy)
CADDY_DOMAIN=yourdomain.com
CADDY_EMAIL=admin@yourdomain.com  # For Let's Encrypt

# Frontend
VITE_SUPABASE_URL=https://yourdomain.com/api
VITE_SUPABASE_ANON_KEY=<copy-from-auth-service>
EOF

# Restrict permissions
chmod 600 .env.production
```

### Step 2: Update docker-compose.yml

Edit `infrastructure/docker-compose.yml`:

```yaml
# Replace environment variables
postgres:
  environment:
    POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}  # From .env.production

supabase_auth:
  environment:
    GOTRUE_JWT_SECRET: ${GOTRUE_JWT_SECRET}
    GOTRUE_SITE_URL: ${GOTRUE_SITE_URL}

postgrest:
  environment:
    PGRST_JWT_SECRET: ${PGRST_JWT_SECRET}

# Enable persistent volumes
volumes:
  postgres_data:
    driver: local
  seaweedfs_data:
    driver: local
  redis_data:
    driver: local
```

### Step 3: Start Services

```bash
# From infrastructure/ directory
cd infrastructure
docker-compose up -d

# Check status
docker-compose ps
docker-compose logs -f postgres  # Watch database startup

# Verify all services are healthy
docker-compose ps --format "{{.Names}}\t{{.Status}}"
```

### Step 4: Run Database Migrations

```bash
# Migrations auto-run on first startup from /docker-entrypoint-initdb.d
# Verify schema created:
docker-compose exec postgres psql -U postgres -d command_center -c "\dt"

# If migrations didn't run, apply manually:
docker-compose exec postgres psql -U postgres -d command_center < ../backend/supabase/migrations/001-init.sql
```

### Step 5: Deploy Frontend

```bash
# Build production frontend
pnpm --filter frontend build

# Copy to Caddy static directory (or use separate nginx container)
docker cp frontend/build <caddy-container>:/srv/www/

# Or use Docker volume:
# volumes:
#   - ./frontend/build:/srv/www:ro
```

### Step 6: Configure Reverse Proxy (Caddy)

Create `Caddyfile`:

```caddyfile
yourdomain.com {
  # Frontend (SPA)
  root /srv/www
  try_files {path} {path}/ /index.html

  # API reverse proxy
  handle /api/* {
    reverse_proxy postgrest:3000
  }

  # Auth service
  handle /auth/* {
    reverse_proxy supabase_auth:9999
  }

  # Realtime WebSocket
  handle /realtime/* {
    reverse_proxy realtime:4000
  }

  # S3 storage (SeaweedFS)
  handle /s3/* {
    reverse_proxy seaweedfs-s3:8333
  }

  # File browser (pgAdmin)
  handle /admin/* {
    reverse_proxy pgadmin:5050
  }

  # Automatic HTTPS with Let's Encrypt
  encode gzip
}
```

### Step 7: Health Check & Validation

```bash
# Test frontend
curl https://yourdomain.com

# Test API
curl https://yourdomain.com/api/rpc/get_user_profile

# Test auth
curl -X POST https://yourdomain.com/auth/v1/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Check database connection
docker-compose exec postgres psql -U postgres -d command_center \
  -c "SELECT count(*) FROM information_schema.tables;"
```

---

## Security & RLS Validation

### RLS Policy Audit

Before going live, verify all tables have RLS enabled:

```sql
-- Connect to database
docker-compose exec postgres psql -U postgres -d command_center

-- List all tables with RLS status
SELECT schemaname, tablename,
       (SELECT count(*) FROM pg_policies
        WHERE pg_policies.tablename = pg_tables.tablename) as policy_count,
       (SELECT count(*) FROM information_schema.table_constraints
        WHERE table_name = pg_tables.tablename AND constraint_type = 'PRIMARY KEY') as has_pk
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Enable RLS on any missing tables
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- List all policies
SELECT tablename, policyname FROM pg_policies;
```

### Cross-Domain Isolation Test

```sql
-- Create test users in different domains
INSERT INTO auth.users (id, email) VALUES
  ('user-1', 'alice@test.com'),
  ('user-2', 'bob@test.com');

INSERT INTO domains (id, name, owner_id) VALUES
  ('domain-1', 'Alice Work', 'user-1'),
  ('domain-2', 'Bob Work', 'user-2');

INSERT INTO tasks (id, domain_id, title, user_id) VALUES
  ('task-1', 'domain-1', 'Alice Task', 'user-1'),
  ('task-2', 'domain-2', 'Bob Task', 'user-2');

-- Test cross-domain access (should fail)
SET jwt.claims.sub = 'user-1';  -- Impersonate user-1
SELECT * FROM tasks;  -- Should return only task-1

SET jwt.claims.sub = 'user-2';  -- Impersonate user-2
SELECT * FROM tasks;  -- Should return only task-2
```

---

## Monitoring & Logging

### Prometheus Metrics

Access at `https://yourdomain.com/prometheus`

**Key Metrics to Monitor**:
- `pg_up` - PostgreSQL availability
- `postgrest_requests_total` - API request volume
- `postgrest_request_duration_seconds` - API latency (P50, P95, P99)
- `container_memory_usage_bytes` - Memory usage per service
- `container_cpu_usage_seconds` - CPU usage per service

### Grafana Dashboards

Access at `https://yourdomain.com/grafana`

**Recommended Dashboards**:
1. **System Overview**: CPU, Memory, Disk, Network
2. **Database Performance**: Connections, Slow Queries, Cache Hit Ratio
3. **API Health**: Request Rate, Latency, Error Rate
4. **RLS Violations**: Failed policy checks, access denials

### Alert Rules

Create `prometheus-rules.yml`:

```yaml
groups:
  - name: command_center
    rules:
      - alert: PostgreSQLDown
        expr: pg_up == 0
        for: 1m
        annotations:
          summary: PostgreSQL is down

      - alert: APILatency
        expr: postgrest_request_duration_seconds{quantile="0.95"} > 1
        for: 5m
        annotations:
          summary: API P95 latency > 1s

      - alert: RLSViolation
        expr: increase(rls_violations_total[5m]) > 10
        annotations:
          summary: High RLS policy violations
```

### Log Aggregation (Loki)

Access logs at `https://yourdomain.com/loki`

```bash
# View logs for specific service
docker-compose logs -f postgrest

# Or via Loki dashboard (Grafana)
# Query: {job="postgrest"} | grep "error"
```

---

## Disaster Recovery

### Backup Strategy

**Daily Backups** (automated via cron):

```bash
# Create backup script: /opt/backups/backup.sh
#!/bin/bash
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Database backup
docker-compose exec -T postgres pg_dump -U postgres command_center \
  | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +7 -delete

# Upload to S3 (optional)
aws s3 cp $BACKUP_DIR/db_$DATE.sql.gz s3://backup-bucket/

echo "Backup completed: db_$DATE.sql.gz"
```

**Add to crontab**:
```bash
# Daily backup at 2 AM
0 2 * * * /opt/backups/backup.sh

# Weekly full backup to S3
0 3 0 * * /opt/backups/backup.sh && aws s3 sync /opt/backups s3://backup-bucket/
```

### Restore from Backup

```bash
# Stop services
docker-compose down

# Restore database
gunzip < /opt/backups/db_<date>.sql.gz | \
  docker-compose exec -T postgres psql -U postgres

# Restart services
docker-compose up -d
```

### Disaster Recovery Drill

Monthly checklist:
- [ ] Restore from backup to staging environment
- [ ] Verify all data intact
- [ ] Test RLS policies still work
- [ ] Validate frontend can authenticate
- [ ] Document restore time (target: < 30 min)

---

## Troubleshooting

### PostgreSQL Connection Issues

```bash
# Check if Postgres is running
docker-compose ps postgres

# View logs
docker-compose logs postgres

# Test connection manually
docker-compose exec postgres psql -U postgres -d command_center -c "SELECT 1"

# Check port binding
docker-compose port postgres 5432
```

### API (PostgREST) Not Responding

```bash
# Check service health
docker-compose exec postgrest curl http://localhost:3000/health

# View logs for errors
docker-compose logs postgrest | grep -i error

# Verify JWT secret matches
docker-compose exec postgrest env | grep PGRST_JWT_SECRET
```

### Auth (GoTrue) Issues

```bash
# Check SMTP configuration (email sending)
docker-compose logs supabase_auth | grep -i "smtp\|email"

# Test SMTP connection (Postal)
docker-compose exec postal telnet localhost 25

# Verify JWT secret matches PostgREST
docker-compose exec supabase_auth env | grep GOTRUE_JWT_SECRET
```

### RLS Policy Violations

```bash
# Monitor policy violations in real-time
docker-compose logs -f postgres | grep "policy"

# Check applied policies
docker-compose exec postgres psql -U postgres -d command_center \
  -c "SELECT * FROM pg_policies;"

# Test specific policy
SET ROLE authenticated;
SET jwt.claims.sub = 'test-user-id';
SELECT * FROM tasks;  -- Should respect RLS
```

### Storage (SeaweedFS) Issues

```bash
# Check volume status
docker-compose exec seaweedfs-master curl http://localhost:9333/status

# List stored files
docker-compose exec seaweedfs-filer curl http://localhost:18888/stats

# Check S3 gateway
curl -X GET http://localhost:8333/s3/
```

### Monitoring Stack Issues

```bash
# Check Prometheus targets
curl http://localhost:9090/api/v1/targets

# View Grafana logs
docker-compose logs grafana

# Reset Grafana admin password
docker-compose exec grafana grafana-cli admin reset-admin-password <newpassword>
```

### Memory/CPU High Usage

```bash
# Check per-container resource usage
docker stats

# If PostgreSQL is high:
docker-compose exec postgres psql -U postgres -d command_center \
  -c "SELECT query, calls, mean_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"

# If PostgREST is high:
# 1. Check for missing indexes on filtered columns
# 2. Review slow queries in Grafana
# 3. Consider query result caching (Redis, Phase 5+)
```

---

## Production Checklist (Go-Live)

Before deploying to production:

- [ ] All tests passing
- [ ] RLS policies validated
- [ ] Secrets in vault (not in code)
- [ ] HTTPS enabled (Caddy with Let's Encrypt)
- [ ] Firewall rules configured
- [ ] Backup automation enabled
- [ ] Monitoring dashboards set up
- [ ] Alert thresholds configured
- [ ] Disaster recovery plan documented
- [ ] Team trained on runbooks
- [ ] Load testing completed (optional)
- [ ] Security audit passed
- [ ] Accessibility audit passed (WCAG 2.2 AA)
- [ ] Database migration rollback tested
- [ ] DNS configured (yourdomain.com → VPS IP)
- [ ] SSL certificate auto-renewal verified

---

## Support & Next Steps

For questions, refer to:
- **Architecture**: `/docs/adr/` (Architectural Decision Records)
- **Infrastructure**: `infrastructure/docker-compose.yml`
- **Security**: `CLAUDE.md` > Constitution (RLS, secrets, threat models)
- **Testing**: `CLAUDE.md` > Testing Strategy
- **Monitoring**: Grafana dashboard documentation

---

**Deployment Status**: ✓ Ready for Production
**Last Verified**: October 2025
**Maintenance Window**: Sundays 2-3 AM UTC (if needed)
