#!/bin/sh
set -eu

# Wait for Postgres to be ready (simple loop; no extra tools needed)
DB_WAIT_HOST="${DB_HOST:-db}"
DB_WAIT_PORT="${DB_PORT:-5432}"
DB_WAIT_USER="${POSTGRES_USER:-postgres}"

echo "Waiting for Postgres to accept connections..."
until pg_isready -h "$DB_WAIT_HOST" -p "$DB_WAIT_PORT" -U "$DB_WAIT_USER" >/dev/null 2>&1; do
  sleep 0.5
done
echo "db is ready."

export PORT=${PORT:-3000}

# Start your Next standalone server
exec node server.js
