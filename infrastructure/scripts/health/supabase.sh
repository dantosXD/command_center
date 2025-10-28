#!/bin/bash
set -euo pipefail

# Health checks for Supabase services
# Usage: ./supabase.sh

POSTGRES_HOST="localhost"
POSTGRES_PORT="5432"
POSTGRES_USER="postgres"
POSTGRES_DB="postgres"

STUDIO_URL="http://localhost:54323"
KONG_URL="http://localhost:54321"
AUTH_URL="http://localhost:54321/auth/v1"
REST_URL="http://localhost:54321/rest/v1"

echo "=== Supabase Health Checks ==="

check_postgres() {
  echo -n "Postgres: "
  if PGPASSWORD="postgres" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT 1;" >/dev/null 2>&1; then
    echo "OK"
  else
    echo "FAIL"
    exit 1
  fi
}

check_studio() {
  echo -n "Studio: "
  if curl -sf "${STUDIO_URL}/profile" >/dev/null; then
    echo "OK"
  else
    echo "FAIL"
    exit 1
  fi
}

check_kong() {
  echo -n "Kong Gateway: "
  if curl -sf "${KONG_URL}/" >/dev/null; then
    echo "OK"
  else
    echo "FAIL"
    exit 1
  fi
}

check_auth() {
  echo -n "Auth: "
  if curl -sf "${AUTH_URL}/settings" >/dev/null; then
    echo "OK"
  else
    echo "FAIL"
    exit 1
  fi
}

check_rest() {
  echo -n "REST: "
  if curl -sf "${REST_URL}/" >/dev/null; then
    echo "OK"
  else
    echo "FAIL"
    exit 1
  fi
}

check_postgres
check_studio
check_kong
check_auth
check_rest

echo "All Supabase components healthy."
