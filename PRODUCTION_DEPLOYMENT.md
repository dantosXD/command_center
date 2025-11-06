# Production Deployment Guide

This guide provides step-by-step instructions for deploying Command Center to production.

## Prerequisites

- Node.js 18+ (check `.nvmrc`)
- pnpm package manager
- Docker and Docker Compose
- Supabase CLI
- Access to production servers

## Pre-Deployment Checklist

### 1. Code Quality
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] Code linted and formatted

### 2. Security
- [ ] RLS policies tested
- [ ] Secrets in vault
- [ ] HTTPS configured
- [ ] CORS configured

### 3. Performance
- [ ] Database indexes optimized
- [ ] Load testing completed
- [ ] Bundle size optimized

### 4. Monitoring
- [ ] Error tracking configured
- [ ] Logging ready
- [ ] Dashboards created
- [ ] Alerts configured

## Quick Deploy

```bash
# 1. Build
pnpm install --frozen-lockfile
pnpm --filter frontend build

# 2. Deploy infrastructure
docker-compose -f docker-compose.prod.yml up -d

# 3. Run migrations
supabase migration up --environment production

# 4. Deploy functions
supabase functions deploy --environment production

# 5. Verify
curl https://your-domain.com/health
```

## Performance Targets

- P95 Read Latency: ≤ 250ms
- P95 Write Latency: ≤ 400ms
- Hub Render: ≤ 1.5s
- Availability: 99.5%

See full deployment guide in CLAUDE.md
