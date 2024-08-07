#!/bin/bash
set -euo pipefail
export DATABASE_URL="postgres://${SEC_DB_USER}:${SEC_DB_PASSWORD}@${SEC_DB_HOST}:${SEC_DB_PORT}/${SEC_DB_NAME}"
set -x
export DBMATE_MIGRATIONS_DIR="./db/migrations"
dbmate --wait --wait-timeout=60s up
# npm run seed-offerings
npm run server