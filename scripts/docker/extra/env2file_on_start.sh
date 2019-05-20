#!/bin/bash
set -e

if [[ -z "${SHUTTRE_API_BASE_URL}" ]]; then
  echo "Environment variable 'SHUTTRE_API_BASE_URL' is not set. Shutting down..."
  exit 1
fi

echo "Writing the following to /app/shutt.re/build/spaConfig.js:"
echo "const shuttreApiBaseUrl = \"${SHUTTRE_API_BASE_URL}\";"
echo "const shuttreApiBaseUrl = \"${SHUTTRE_API_BASE_URL}\";" > /app/shutt.re/build/spaConfig.js

echo "Starting nginx..."
exec "$@"
