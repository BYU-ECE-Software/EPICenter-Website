# =============================================
# FILE: scripts/create-migration.sh
# =============================================
#!/bin/bash
set -e

# This script creates a new migration locally
# Run this whenever you change your Prisma schema

if [ -z "$1" ]; then
    echo "Usage: ./scripts/create-migration.sh <migration-name>"
    echo "Example: ./scripts/create-migration.sh add_user_roles"
    exit 1
fi

MIGRATION_NAME=$1

echo "📝 Creating migration: $MIGRATION_NAME"

# Create migration
npx prisma migrate dev --name $MIGRATION_NAME

echo "✅ Migration created successfully!"
echo "📦 Don't forget to commit the migration files:"
echo "   git add prisma/migrations/"
echo "   git commit -m 'Add migration: $MIGRATION_NAME'"