# =============================================
# FILE: scripts/reset-db.sh
# =============================================
#!/bin/bash
set -e

echo "⚠️  WARNING: This will delete all data in the database!"
read -p "Are you sure? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Aborted."
    exit 0
fi

echo "🗑️  Stopping services..."
docker-compose down

echo "🗑️  Removing database volume..."
docker volume rm epicenter-website_postgres_data 2>/dev/null || true

echo "🔄 Restarting services..."
./deploy.sh

echo "✅ Database reset complete!"