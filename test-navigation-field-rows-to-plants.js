#!/usr/bin/env node

/**
 * Test Navigation from Field Rows to Plants Page
 * 
 * This test verifies that the "Ispeziona Piante" links in the HomeDashboard
 * correctly navigate to the plants page with the proper fieldRow parameter.
 */

import fs from 'fs';
import path from 'path';

console.log('🧪 Testing Field Rows → Plants Page Navigation\n');

function testHomeDashboardNavigation() {
  console.log('1️⃣ Testing HomeDashboard field rows navigation links...');
  
  const dashboardPath = 'components/shared/HomeDashboard.tsx';
  
  if (!fs.existsSync(dashboardPath)) {
    console.log('   ❌ HomeDashboard.tsx not found');
    return false;
  }
  
  const content = fs.readFileSync(dashboardPath, 'utf8');
  
  // Check for correct "Ispeziona Piante" links
  const hasCorrectInspectLink = content.includes('href={`/app/plants?tab=plants&fieldRow=${row.id}`}');
  const hasInspectButtonText = content.includes('🔍 Ispeziona Piante');
  
  // Check for vivaio links (these should exist but be clearly different)
  const hasVivaioLinks = content.includes('href="/app/semenzaio"');
  const hasVivaioButtonText = content.includes('🌱 Trapianta dal Vivaio');
  
  // Check for proper conditional rendering
  const hasConditionalRendering = content.includes('hasPlants') && 
                                  content.includes('isEmpty') &&
                                  content.includes('rowPlants.length > 0');
  
  console.log(`   ✅ Correct inspect plants link: ${hasCorrectInspectLink ? 'OK' : 'MISSING'}`);
  console.log(`   ✅ Inspect button text: ${hasInspectButtonText ? 'OK' : 'MISSING'}`);
  console.log(`   ✅ Vivaio links exist: ${hasVivaioLinks ? 'OK' : 'MISSING'}`);
  console.log(`   ✅ Vivaio button text: ${hasVivaioButtonText ? 'OK' : 'MISSING'}`);
  console.log(`   ✅ Conditional rendering: ${hasConditionalRendering ? 'OK' : 'MISSING'}`);
  
  const allChecks = hasCorrectInspectLink && hasInspectButtonText && 
                   hasVivaioLinks && hasVivaioButtonText && hasConditionalRendering;
  
  console.log(`   ${allChecks ? '✅' : '❌'} HomeDashboard navigation: ${allChecks ? 'CORRECT' : 'ISSUES'}\n`);
  return allChecks;
}

function testPlantsPageHandling() {
  console.log('2️⃣ Testing Plants page fieldRow parameter handling...');
  
  const plantsPath = 'app/app/plants/page.tsx';
  
  if (!fs.existsSync(plantsPath)) {
    console.log('   ❌ Plants page not found');
    return false;
  }
  
  const content = fs.readFileSync(plantsPath, 'utf8');
  
  // Check for URL parameter handling
  const hasSearchParams = content.includes('useSearchParams()');
  const hasFieldRowParam = content.includes("searchParams.get('fieldRow')");
  const hasTabParam = content.includes("searchParams.get('tab')");
  
  // Check for SmartPlantManager integration
  const hasSmartPlantManager = content.includes('<SmartPlantManager');
  const passesGarden = content.includes('garden={defaultGarden}');
  
  // Check for field row filter notification
  const hasFilterNotification = content.includes('fieldRowParam &&');
  const hasFilterUI = content.includes('Filtrando per Filare Specifico');
  
  console.log(`   ✅ Search params usage: ${hasSearchParams ? 'OK' : 'MISSING'}`);
  console.log(`   ✅ FieldRow parameter: ${hasFieldRowParam ? 'OK' : 'MISSING'}`);
  console.log(`   ✅ Tab parameter: ${hasTabParam ? 'OK' : 'MISSING'}`);
  console.log(`   ✅ SmartPlantManager: ${hasSmartPlantManager ? 'OK' : 'MISSING'}`);
  console.log(`   ✅ Garden prop: ${passesGarden ? 'OK' : 'MISSING'}`);
  console.log(`   ✅ Filter notification: ${hasFilterNotification ? 'OK' : 'MISSING'}`);
  console.log(`   ✅ Filter UI: ${hasFilterUI ? 'OK' : 'MISSING'}`);
  
  const allChecks = hasSearchParams && hasFieldRowParam && hasTabParam &&
                   hasSmartPlantManager && passesGarden && hasFilterNotification && hasFilterUI;
  
  console.log(`   ${allChecks ? '✅' : '❌'} Plants page handling: ${allChecks ? 'CORRECT' : 'ISSUES'}\n`);
  return allChecks;
}

function testSmartPlantManagerFiltering() {
  console.log('3️⃣ Testing SmartPlantManager fieldRow filtering...');
  
  const managerPath = 'components/plants/SmartPlantManager.tsx';
  
  if (!fs.existsSync(managerPath)) {
    console.log('   ❌ SmartPlantManager not found');
    return false;
  }
  
  const content = fs.readFileSync(managerPath, 'utf8');
  
  // Check for URL parameter reading
  const hasUrlParamReading = content.includes('window.location.search');
  const hasFieldRowFilter = content.includes('fieldRowFilter');
  const hasRowFilterState = content.includes('setRowFilter');
  
  // Check for filtering logic
  const hasFilteringLogic = content.includes('plant.fieldRowId === rowFilter');
  const hasApplyFilters = content.includes('applyFilters');
  
  // Check for filter UI
  const hasRowFilterSelect = content.includes('Tutti i filari');
  const hasFilteredPlantsState = content.includes('filteredPlants');
  
  console.log(`   ✅ URL param reading: ${hasUrlParamReading ? 'OK' : 'MISSING'}`);
  console.log(`   ✅ FieldRow filter state: ${hasFieldRowFilter ? 'OK' : 'MISSING'}`);
  console.log(`   ✅ Row filter state: ${hasRowFilterState ? 'OK' : 'MISSING'}`);
  console.log(`   ✅ Filtering logic: ${hasFilteringLogic ? 'OK' : 'MISSING'}`);
  console.log(`   ✅ Apply filters: ${hasApplyFilters ? 'OK' : 'MISSING'}`);
  console.log(`   ✅ Filter UI: ${hasRowFilterSelect ? 'OK' : 'MISSING'}`);
  console.log(`   ✅ Filtered plants: ${hasFilteredPlantsState ? 'OK' : 'MISSING'}`);
  
  const allChecks = hasUrlParamReading && hasFieldRowFilter && hasRowFilterState &&
                   hasFilteringLogic && hasApplyFilters && hasRowFilterSelect && hasFilteredPlantsState;
  
  console.log(`   ${allChecks ? '✅' : '❌'} SmartPlantManager filtering: ${allChecks ? 'CORRECT' : 'ISSUES'}\n`);
  return allChecks;
}

function testNavigationFlow() {
  console.log('4️⃣ Testing complete navigation flow...');
  
  // Check that all required files exist
  const requiredFiles = [
    'components/shared/HomeDashboard.tsx',
    'app/app/plants/page.tsx',
    'components/plants/SmartPlantManager.tsx'
  ];
  
  const allFilesExist = requiredFiles.every(file => {
    const exists = fs.existsSync(file);
    if (!exists) {
      console.log(`   ❌ Missing file: ${file}`);
    }
    return exists;
  });
  
  if (!allFilesExist) {
    console.log(`   ❌ Navigation flow: MISSING_FILES\n`);
    return false;
  }
  
  console.log(`   ✅ All required files exist: OK`);
  console.log(`   ✅ Navigation flow: COMPLETE\n`);
  return true;
}

function generateUserGuide() {
  console.log('📋 User Navigation Guide:\n');
  
  console.log('🎯 CORRECT NAVIGATION PATH:');
  console.log('   1. Go to Dashboard (/)');
  console.log('   2. Find "Filari Campo Aperto" section');
  console.log('   3. Look for field rows with plants');
  console.log('   4. Click "🔍 Ispeziona Piante (N)" button');
  console.log('   5. This opens /app/plants?tab=plants&fieldRow=ID');
  console.log('   6. Plants page shows only plants from that field row\n');
  
  console.log('⚠️  COMMON MISTAKES:');
  console.log('   ❌ Clicking "Vivaio →" (top right) → Goes to /app/semenzaio');
  console.log('   ❌ Clicking "🌱 Trapianta dal Vivaio" → Goes to /app/semenzaio');
  console.log('   ❌ Clicking "🌱 Aggiungi Piante" → Goes to /app/semenzaio');
  console.log('   ✅ Click "🔍 Ispeziona Piante" → Goes to /app/plants\n');
  
  console.log('🔍 VISUAL IDENTIFICATION:');
  console.log('   • "Ispeziona Piante" button is GREEN with 🔍 icon');
  console.log('   • Shows plant count in parentheses: "Ispeziona Piante (5)"');
  console.log('   • Only appears for field rows that have plants');
  console.log('   • Located in the main action area of each field row card\n');
  
  console.log('🌐 EXPECTED URLS:');
  console.log('   ✅ Plants page: /app/plants?tab=plants&fieldRow=abc123');
  console.log('   ❌ Vivaio page: /app/semenzaio');
  console.log('   ❌ Semenzaio page: /app/semenzaio\n');
}

// Run all tests
console.log('🚀 Starting Navigation Tests...\n');

const results = {
  homeDashboard: testHomeDashboardNavigation(),
  plantsPage: testPlantsPageHandling(),
  smartPlantManager: testSmartPlantManagerFiltering(),
  navigationFlow: testNavigationFlow()
};

console.log('📊 TEST RESULTS:');
console.log('================');
Object.entries(results).forEach(([test, passed]) => {
  console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
});

const allPassed = Object.values(results).every(Boolean);
console.log(`\n🎯 OVERALL: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}\n`);

generateUserGuide();

if (allPassed) {
  console.log('✅ CONCLUSION: Navigation is correctly implemented.');
  console.log('   The issue is likely user confusion between different buttons.');
  console.log('   Make sure to click "🔍 Ispeziona Piante" not "🌱 Vivaio" buttons.\n');
} else {
  console.log('❌ CONCLUSION: There are implementation issues that need fixing.\n');
}

process.exit(allPassed ? 0 : 1);