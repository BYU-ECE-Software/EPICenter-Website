#!/bin/sh
set -e

echo "🔍 Running Prisma migrations..."
echo "Using DATABASE_URL: ${DATABASE_URL}"

# Optional: small wait loop in case DB is up but not yet accepting connections.
# `depends_on: condition: service_healthy` already helps a lot,
# so this is just extra safety.
until npx prisma migrate status --schema=/app/prisma/schema.prisma >/dev/null 2>&1; do
  echo "⏳ Waiting for database to be reachable..."
  sleep 2
done

echo "✅ Database reachable, applying migrations..."
npx prisma migrate deploy --schema=/app/prisma/schema.prisma
echo "🎉 Migrations applied successfully!"
