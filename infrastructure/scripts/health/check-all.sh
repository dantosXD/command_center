#!/bin/bash
# Health check script for Command Center infrastructure
# Phase 2: T015 - Health check scripts
# Run: ./infrastructure/scripts/health/check-all.sh

set -e

echo "=== Command Center Infrastructure Health Check ==="
echo "Time: $(date)"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counter for checks
PASSED=0
FAILED=0

# Function to check service
check_service() {
    local name=$1
    local url=$2
    local expected_status=$3

    echo -n "Checking $name... "

    if response=$(curl -s -w "\n%{http_code}" -o /tmp/response.txt "$url" 2>/dev/null); then
        http_code=$(echo "$response" | tail -n1)

        if [[ "$http_code" == "$expected_status"* ]]; then
            echo -e "${GREEN}✓ OK${NC} (HTTP $http_code)"
            ((PASSED++))
        else
            echo -e "${RED}✗ FAILED${NC} (HTTP $http_code, expected $expected_status)"
            ((FAILED++))
        fi
    else
        echo -e "${RED}✗ UNREACHABLE${NC}"
        ((FAILED++))
    fi
}

# Function to check service availability with nc
check_port() {
    local name=$1
    local host=$2
    local port=$3

    echo -n "Checking $name ($host:$port)... "

    if timeout 2 bash -c "echo >/dev/tcp/$host/$port" 2>/dev/null; then
        echo -e "${GREEN}✓ OPEN${NC}"
        ((PASSED++))
    else
        echo -e "${RED}✗ CLOSED${NC}"
        ((FAILED++))
    fi
}

echo "=== Service Connectivity ==="
check_port "PostgreSQL" "localhost" "5432"
check_port "PostgREST" "localhost" "3001"
check_port "Supabase Auth" "localhost" "9999"
check_port "Realtime" "localhost" "4000"
check_port "SeaweedFS Master" "localhost" "9333"
check_port "SeaweedFS Volume" "localhost" "8080"
check_port "SeaweedFS S3" "localhost" "8333"
check_port "Postal" "localhost" "25"
check_port "Postal API" "localhost" "5000"
check_port "Redis" "localhost" "6379"
check_port "Prometheus" "localhost" "9090"
echo ""

echo "=== Service Endpoints ==="
check_service "PostgreSQL health" "http://localhost:5432" "400"
check_service "PostgREST health" "http://localhost:3001/" "200"
check_service "Supabase Auth health" "http://localhost:9999/health" "200"
check_service "Realtime health" "http://localhost:4000/health" "200"
check_service "SeaweedFS health" "http://localhost:9333/ui/index.html" "200"
check_service "Prometheus health" "http://localhost:9090/-/healthy" "200"
echo ""

echo "=== Database Checks ==="
if command -v psql &> /dev/null; then
    echo -n "PostgreSQL connection test... "
    if PGPASSWORD=postgres psql -h localhost -U postgres -d command_center -c "SELECT 1" &>/dev/null; then
        echo -e "${GREEN}✓ OK${NC}"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC}"
        ((FAILED++))
    fi

    echo -n "PostgreSQL table check... "
    if PGPASSWORD=postgres psql -h localhost -U postgres -d command_center -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public'" &>/dev/null; then
        count=$(PGPASSWORD=postgres psql -h localhost -U postgres -d command_center -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public'")
        echo -e "${GREEN}✓ OK${NC} ($count tables)"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC}"
        ((FAILED++))
    fi
else
    echo -e "${YELLOW}⚠ psql not installed, skipping database checks${NC}"
fi
echo ""

echo "=== Docker Container Status ==="
if command -v docker &> /dev/null; then
    echo "Running containers:"
    docker ps --filter "name=command_center" --format "table {{.Names}}\t{{.Status}}"
else
    echo -e "${YELLOW}⚠ docker not installed${NC}"
fi
echo ""

echo "=== Summary ==="
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some checks failed${NC}"
    exit 1
fi
