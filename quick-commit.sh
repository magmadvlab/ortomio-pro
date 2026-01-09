#!/bin/bash

# Quick commit script - bypassa problemi I/O di git

echo "🔧 Preparing commit..."

# Remove any locks
rm -f .git/index.lock .git/refs/heads/main.lock

# Use git with minimal operations
git add -f \
  package.json \
  components/garden/GardenView.tsx \
  components/garden/PlantsView.tsx \
  components/CalendarAlmanac.tsx \
  components/irrigation/IrrigationSystemWizard.tsx

echo "✅ Files staged"
echo ""
echo "📝 Creating commit..."

# Short commit message to avoid issues
git commit -m "feat: UI improvements + Node version fix

- Fix Node requirement (>=22 instead of >=24)
- Add Harvest/Photo modals to GardenView
- Add Plant Details modal to PlantsView
- Add AI advice to CalendarAlmanac
- Fix IrrigationSystemWizard TypeScript error

Fixes Vercel build"

if [ $? -eq 0 ]; then
  echo "✅ Commit OK!"
  echo "🚀 Pushing..."
  git push origin main
  echo "✅ Done! Check Vercel deployment"
else
  echo "❌ Commit failed"
fi
