#!/bin/bash
echo "🏠 Switching to LOCAL database..."
cp .env.local.development .env.local
echo "✅ Now using LOCAL database"
echo "🚀 Run: npm run dev"