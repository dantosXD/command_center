#!/bin/bash
set -euo pipefail

# Health checks for SeaweedFS services
# Usage: ./seaweedfs.sh

BASE_URL_MASTER="http://localhost:9333"
BASE_URL_VOLUME="http://localhost:8080"
BASE_URL_FILER="http://localhost:8888"
BASE_URL_S3="http://localhost:8333"

echo "=== SeaweedFS Health Checks ==="

check_master() {
  echo -n "Master: "
  if curl -sf "${BASE_URL_MASTER}/cluster/status" >/dev/null; then
    echo "OK"
  else
    echo "FAIL"
    exit 1
  fi
}

check_volume() {
  echo -n "Volume: "
  if curl -sf "${BASE_URL_VOLUME}/status" >/dev/null; then
    echo "OK"
  else
    echo "FAIL"
    exit 1
  fi
}

check_filer() {
  echo -n "Filer: "
  if curl -sf "${BASE_URL_FILER}/" >/dev/null; then
    echo "OK"
  else
    echo "FAIL"
    exit 1
  fi
}

check_s3() {
  echo -n "S3 gateway: "
  if curl -sf "${BASE_URL_S3}/health" >/dev/null; then
    echo "OK"
  else
    echo "FAIL"
    exit 1
  fi
}

check_master
check_volume
check_filer
check_s3

echo "All SeaweedFS components healthy."
