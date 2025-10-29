#!/bin/bash

##############################################################################
# Test Suite Runner
# Runs all test suites with proper environment setup
# Usage: ./scripts/run-tests.sh [suite]
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

# Test suite selection
SUITE=${1:-all}

echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                ║${NC}"
echo -e "${BLUE}║     Command Center - Test Suite Runner        ║${NC}"
echo -e "${BLUE}║                                                ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""

# Check if .env.test exists
if [ ! -f "$PROJECT_ROOT/.env.test" ]; then
    echo -e "${YELLOW}⚠ .env.test not found, using .env.local${NC}"
fi

# Track results
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to run a test suite
run_suite() {
    local name=$1
    local command=$2

    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}Running: $name${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

    ((TOTAL_TESTS++))

    if eval "$command"; then
        echo -e "${GREEN}✓ $name: PASSED${NC}"
        ((PASSED_TESTS++))
        return 0
    else
        echo -e "${RED}✗ $name: FAILED${NC}"
        ((FAILED_TESTS++))
        return 1
    fi
}

cd "$PROJECT_ROOT"

# Run selected test suites
if [ "$SUITE" = "all" ] || [ "$SUITE" = "unit" ]; then
    run_suite "Unit Tests (Frontend)" "pnpm --filter frontend test --run" || true
fi

if [ "$SUITE" = "all" ] || [ "$SUITE" = "contract" ]; then
    run_suite "Contract Tests" "pnpm test:contract" || true
fi

if [ "$SUITE" = "all" ] || [ "$SUITE" = "rls" ]; then
    run_suite "RLS Security Tests" "pnpm test:rls" || true
fi

if [ "$SUITE" = "all" ] || [ "$SUITE" = "accessibility" ]; then
    run_suite "Accessibility Tests" "pnpm test:accessibility" || true
fi

if [ "$SUITE" = "all" ] || [ "$SUITE" = "e2e" ]; then
    echo ""
    echo -e "${YELLOW}Note: E2E tests require running services${NC}"
    read -p "Run E2E tests? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        run_suite "E2E Tests" "pnpm --filter frontend test:e2e" || true
    fi
fi

# Summary
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                ║${NC}"
echo -e "${BLUE}║              Test Results Summary              ║${NC}"
echo -e "${BLUE}║                                                ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "Total Test Suites:  $TOTAL_TESTS"
echo -e "${GREEN}Passed:            $PASSED_TESTS${NC}"
echo -e "${RED}Failed:            $FAILED_TESTS${NC}"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✓ All tests passed!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    exit 0
else
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}✗ Some tests failed${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    exit 1
fi
