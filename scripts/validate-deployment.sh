#!/bin/bash

##############################################################################
# Deployment Validation Script
# Comprehensive checks before deploying to production
# Usage: ./scripts/validate-deployment.sh [environment]
##############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-production}
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                           ║${NC}"
echo -e "${BLUE}║     Command Center - Deployment Validation ($ENVIRONMENT)     ║${NC}"
echo -e "${BLUE}║                                                           ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

cd "$PROJECT_ROOT"

# Track validation results
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNINGS=0

# Function to run a validation check
validate() {
    local name=$1
    local command=$2
    local critical=${3:-true}

    echo -n "  Checking: $name ... "
    ((TOTAL_CHECKS++))

    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC}"
        ((PASSED_CHECKS++))
        return 0
    else
        if [ "$critical" = "true" ]; then
            echo -e "${RED}✗ FAILED${NC}"
            ((FAILED_CHECKS++))
        else
            echo -e "${YELLOW}⚠ WARNING${NC}"
            ((WARNINGS++))
        fi
        return 1
    fi
}

# 1. Environment Checks
echo -e "${BLUE}[1/8] Environment Checks${NC}"
validate "Node.js installed" "command -v node"
validate "pnpm installed" "command -v pnpm"
validate "psql installed" "command -v psql" false
validate "docker installed" "command -v docker" false
validate "git installed" "command -v git"

# 2. Dependencies
echo ""
echo -e "${BLUE}[2/8] Dependency Checks${NC}"
validate "node_modules exists" "[ -d node_modules ]"
validate "frontend dependencies" "[ -d frontend/node_modules ]"
validate "lockfile exists" "[ -f pnpm-lock.yaml ]"

# 3. Configuration Files
echo ""
echo -e "${BLUE}[3/8] Configuration Files${NC}"
validate "package.json exists" "[ -f package.json ]"
validate "tsconfig.json exists" "[ -f tsconfig.json ]"
validate "frontend config" "[ -f frontend/svelte.config.js ]"
validate ".gitignore exists" "[ -f .gitignore ]"

if [ "$ENVIRONMENT" = "production" ]; then
    validate ".env.production exists" "[ -f .env.production ]" false
else
    validate ".env.local exists" "[ -f .env.local ]" false
fi

# 4. Database Migrations
echo ""
echo -e "${BLUE}[4/8] Database Migrations${NC}"
MIGRATION_COUNT=$(ls -1 backend/supabase/migrations/*.sql 2>/dev/null | wc -l)
echo "  Found $MIGRATION_COUNT migration files"
validate "migrations directory exists" "[ -d backend/supabase/migrations ]"
validate "at least one migration" "[ $MIGRATION_COUNT -gt 0 ]"
validate "seed data exists" "[ -f backend/supabase/seeds/dev.sql ]" false

# 5. TypeScript Build
echo ""
echo -e "${BLUE}[5/8] TypeScript Validation${NC}"
echo -n "  Running type check ... "
if pnpm --filter frontend check > /tmp/typecheck.log 2>&1; then
    echo -e "${GREEN}✓${NC}"
    ((PASSED_CHECKS++))
else
    # Check if only warnings
    if grep -q "Warn:" /tmp/typecheck.log; then
        echo -e "${YELLOW}⚠ WARNINGS${NC}"
        ((WARNINGS++))
        TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    else
        echo -e "${RED}✗ ERRORS${NC}"
        ((FAILED_CHECKS++))
        TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
        cat /tmp/typecheck.log
    fi
fi

# 6. Production Build
echo ""
echo -e "${BLUE}[6/8] Production Build${NC}"
echo -n "  Building frontend ... "
if pnpm --filter frontend build > /tmp/build.log 2>&1; then
    echo -e "${GREEN}✓${NC}"
    ((PASSED_CHECKS++))
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

    # Check build output size
    if [ -d "frontend/.svelte-kit/output" ]; then
        BUILD_SIZE=$(du -sh frontend/.svelte-kit/output | cut -f1)
        echo "  Build size: $BUILD_SIZE"
    fi
else
    echo -e "${RED}✗ FAILED${NC}"
    ((FAILED_CHECKS++))
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    cat /tmp/build.log
fi

# 7. Security Checks
echo ""
echo -e "${BLUE}[7/8] Security Checks${NC}"
validate "No .env in git" "! git ls-files | grep -q '^\.env$'"
validate "No secrets in repo" "! git grep -i 'password.*=.*[^x]' || true"
validate "RLS migrations exist" "grep -rq 'ENABLE ROW LEVEL SECURITY' backend/supabase/migrations/" false
validate ".env files gitignored" "grep -q '\.env' .gitignore"

# 8. Code Quality
echo ""
echo -e "${BLUE}[8/8] Code Quality${NC}"
validate "No console.logs in components" "! find frontend/src/components -name '*.svelte' -exec grep -l 'console\.log' {} \;" false
validate "No TypeScript any types" "! grep -r ': any' frontend/src/lib frontend/src/routes 2>/dev/null" false
validate "Documentation exists" "[ -f CLAUDE.md ]"
validate "README exists" "[ -f README.md ] || [ -f CLAUDE.md ]"

# Summary
echo ""
echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                           ║${NC}"
echo -e "${BLUE}║              Validation Summary                           ║${NC}"
echo -e "${BLUE}║                                                           ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "  Total Checks:    $TOTAL_CHECKS"
echo -e "  ${GREEN}Passed:          $PASSED_CHECKS${NC}"
echo -e "  ${RED}Failed:          $FAILED_CHECKS${NC}"
echo -e "  ${YELLOW}Warnings:        $WARNINGS${NC}"
echo ""

# Calculate pass rate
PASS_RATE=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))
echo "  Pass Rate:       $PASS_RATE%"
echo ""

# Deployment readiness decision
if [ $FAILED_CHECKS -eq 0 ]; then
    if [ $WARNINGS -eq 0 ]; then
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${GREEN}✓ All checks passed! Deployment ready.${NC}"
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        exit 0
    else
        echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${YELLOW}⚠ Checks passed with $WARNINGS warnings. Review before deploying.${NC}"
        echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        exit 0
    fi
else
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}✗ $FAILED_CHECKS critical checks failed. Fix before deploying.${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    exit 1
fi
