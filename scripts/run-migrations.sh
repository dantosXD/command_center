#!/bin/bash

##############################################################################
# Database Migration Runner
# Applies all migrations in order to a PostgreSQL database
# Usage: ./scripts/run-migrations.sh [database-url]
##############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
MIGRATIONS_DIR="$PROJECT_ROOT/backend/supabase/migrations"
SEEDS_DIR="$PROJECT_ROOT/backend/supabase/seeds"

# Database URL from argument or environment
DATABASE_URL=${1:-$DATABASE_URL}

if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}ERROR: Database URL not provided${NC}"
    echo "Usage: $0 <database-url>"
    echo "   or: DATABASE_URL=<url> $0"
    echo ""
    echo "Example: $0 postgresql://postgres:postgres@localhost:5432/command_center"
    exit 1
fi

echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                ║${NC}"
echo -e "${BLUE}║     Command Center - Migration Runner         ║${NC}"
echo -e "${BLUE}║                                                ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo -e "${RED}ERROR: psql command not found${NC}"
    echo "Please install PostgreSQL client tools"
    exit 1
fi

# Test database connection
echo -e "${YELLOW}[1/4] Testing database connection...${NC}"
if psql "$DATABASE_URL" -c "SELECT version();" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Database connection successful${NC}"
else
    echo -e "${RED}✗ Database connection failed${NC}"
    exit 1
fi

# Check migrations directory
echo ""
echo -e "${YELLOW}[2/4] Checking migrations directory...${NC}"
if [ ! -d "$MIGRATIONS_DIR" ]; then
    echo -e "${RED}ERROR: Migrations directory not found: $MIGRATIONS_DIR${NC}"
    exit 1
fi

MIGRATION_COUNT=$(ls -1 "$MIGRATIONS_DIR"/*.sql 2>/dev/null | wc -l)
echo -e "${GREEN}✓ Found $MIGRATION_COUNT migration files${NC}"

# Apply migrations
echo ""
echo -e "${YELLOW}[3/4] Applying migrations...${NC}"

SUCCESS_COUNT=0
FAILED_COUNT=0

for migration in "$MIGRATIONS_DIR"/*.sql; do
    if [ -f "$migration" ]; then
        MIGRATION_NAME=$(basename "$migration")
        echo -n "  Applying: $MIGRATION_NAME ... "

        if psql "$DATABASE_URL" -f "$migration" > /dev/null 2>&1; then
            echo -e "${GREEN}✓${NC}"
            ((SUCCESS_COUNT++))
        else
            echo -e "${RED}✗${NC}"
            ((FAILED_COUNT++))
            echo -e "${RED}    Error applying migration: $MIGRATION_NAME${NC}"
            # Continue with other migrations instead of exiting
        fi
    fi
done

echo ""
echo -e "${GREEN}✓ Migrations applied: $SUCCESS_COUNT successful${NC}"
if [ $FAILED_COUNT -gt 0 ]; then
    echo -e "${YELLOW}⚠ Migrations failed: $FAILED_COUNT${NC}"
fi

# Optional: Load seed data
echo ""
echo -e "${YELLOW}[4/4] Seed data (optional)${NC}"
read -p "Do you want to load seed data? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if [ -f "$SEEDS_DIR/dev.sql" ]; then
        echo -n "  Loading seed data ... "
        if psql "$DATABASE_URL" -f "$SEEDS_DIR/dev.sql" > /dev/null 2>&1; then
            echo -e "${GREEN}✓${NC}"
        else
            echo -e "${RED}✗ Failed to load seed data${NC}"
        fi
    else
        echo -e "${YELLOW}⚠ Seed file not found: $SEEDS_DIR/dev.sql${NC}"
    fi
else
    echo "  Skipping seed data"
fi

# Verify database state
echo ""
echo -e "${BLUE}Database Summary:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

psql "$DATABASE_URL" -c "
SELECT
    'Workspaces' as entity,
    COUNT(*) as count
FROM public.workspaces
UNION ALL
SELECT 'Domains', COUNT(*) FROM public.domains
UNION ALL
SELECT 'Tasks', COUNT(*) FROM public.tasks
UNION ALL
SELECT 'Events', COUNT(*) FROM public.events
UNION ALL
SELECT 'Collections', COUNT(*) FROM public.collections
UNION ALL
SELECT 'Feature Flags', COUNT(*) FROM public.feature_flags;
" 2>/dev/null || echo "Note: Some tables may not exist yet"

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✓ Migration process complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
