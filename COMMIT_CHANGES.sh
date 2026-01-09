#!/bin/bash

# Script per committare e pushare le modifiche UI
# Esegui con: bash COMMIT_CHANGES.sh

echo "🔧 Rimuovo lock git se presente..."
rm -f .git/index.lock

echo "📝 Staging files..."
git add \
  components/garden/GardenView.tsx \
  components/garden/PlantsView.tsx \
  components/CalendarAlmanac.tsx \
  components/irrigation/IrrigationSystemWizard.tsx \
  components/harvest/HarvestRegistrationModal.tsx \
  components/camera/PhotoCaptureModal.tsx \
  TEST_UI_IMPROVEMENTS.md

echo "✅ Files staged. Stato:"
git status --short

echo ""
echo "💾 Creating commit..."
git commit -m "feat: Enhance UI with Journal patterns and fix incomplete features

✨ New Features:
- Add Harvest Registration modal in GardenView quick actions
- Add Photo Capture modal in GardenView quick actions
- Implement Plant Details modal in PlantsView with full info
- Add AI nutrition and health advice to CalendarAlmanac

🐛 Bug Fixes:
- Fix harvest log ID tracking (use real ID instead of 'completed')
- Fix TypeScript error in IrrigationSystemWizard (bedIds/rowIds)
- Fix TODO placeholders in GardenView quick actions

🎨 UI Improvements:
- Apply Journal UI color patterns to calendar (semantic colors)
- Add colored advice cards (blue=Fosforo, green=Azoto, etc.)
- Improve modal navigation flows
- Add related tasks section in plant details

📝 Files Modified:
- components/garden/GardenView.tsx (+91 lines)
- components/garden/PlantsView.tsx (+146 lines)
- components/CalendarAlmanac.tsx (+117 lines)
- components/irrigation/IrrigationSystemWizard.tsx (+13 lines)
- TEST_UI_IMPROVEMENTS.md (new test guide)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

if [ $? -eq 0 ]; then
  echo "✅ Commit created successfully!"
  echo ""
  echo "🚀 Pushing to GitHub..."
  git push origin main

  if [ $? -eq 0 ]; then
    echo "✅ Push successful!"
    echo "🌐 Vercel will deploy automatically"
    echo "📊 Check deployment: https://vercel.com/magmadvlab"
  else
    echo "❌ Push failed. Try manually or check network."
  fi
else
  echo "❌ Commit failed. Check git status manually."
fi
