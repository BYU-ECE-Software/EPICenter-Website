#!/bin/sh
set -e

echo "🔍 Checking database migration status..."

# Wait for database to be ready
echo "⏳ Waiting for database connection..."
until npx prisma db execute --stdin --schema=/app/prisma/schema.prisma <<EOF 2>/dev/null
SELECT 1;
EOF
do
  echo "Database is unavailable - sleeping"
  sleep 2
done

echo "✅ Database is ready!"

# Check if migrations directory exists and has migrations
if [ -d "/app/prisma/migrations" ] && [ "$(ls -A /app/prisma/migrations 2>/dev/null)" ]; then
    echo "📦 Found existing migrations, running migrate deploy..."
    npx prisma migrate deploy --schema=/app/prisma/schema.prisma
    echo "✅ Migrations applied successfully!"
else
    echo "⚠️  No migrations found, running db push (first-time setup)..."
    npx prisma db push --schema=/app/prisma/schema.prisma --accept-data-loss --skip-generate
    echo "✅ Database schema pushed successfully!"
    echo "⚠️  WARNING: Consider creating proper migrations for production!"
fi

echo "🎉 Database is ready to use!"