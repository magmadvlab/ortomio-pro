#!/bin/bash
echo "☁️  Switching to REMOTE database..."
LATEST_BACKUP=$(ls -t .env.local.backup_* 2>/dev/null | head -n1)
if [ -n "$LATEST_BACKUP" ]; then
    cp "$LATEST_BACKUP" .env.local
    echo "✅ Now using REMOTE database"
else
    echo "❌ No backup found, keeping current config"
fi
echo "🚀 Run: npm run dev"