#!/bin/bash
set -euo pipefail

export DATABASE_URL="postgres://${SEC_DB_USER}:${SEC_DB_PASSWORD}@${SEC_DB_HOST}:${SEC_DB_PORT}/${SEC_DB_NAME}"

set -x
export DBMATE_MIGRATIONS_DIR="./db/migrations"

# Log before running dbmate
echo "Running dbmate to apply migrations..."
dbmate --wait --wait-timeout=60s up

# Log before starting the server
echo "Starting the Node.js server..."

npm run example-create-issuer
npm run seed-offerings
# npm run seed-offerings
npm run server