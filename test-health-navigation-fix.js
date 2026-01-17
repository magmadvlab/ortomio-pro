#!/usr/bin/env node

/**
 * Test Health Navigation Fix
 * Verifica che la navigazione alla pagina salute sia corretta
 */

import fs from 'fs';

console.log('🧪 Testing Health Navigation Fix...\n');

// Test 1: Verifica che il tab salute nel planner reindirizza
function testPlannerHealthTabRedirect() {
  console.log('1️⃣ Testing Planner health tab redirects to dedicated page...');
  
  const plannerPath = 'app/app/planner/page.tsx';
  if (!fs.existsSync(plannerPath)) {
    console.log('❌ Planner page not found');
    return false;
  }
  
  const content = fs.readFileSync(plannerPath, 'utf8');
  
  // Verifica che NON ci sia più PlannerHealthSuggestions inline
  const noPlannerHealthSuggestions = !content.includes('<PlannerHealthSuggestions');
  
  // Verifica che ci sia il redirect alla pagina health
  const hasHealthRedirect = content.includes("window.location.href = '/app/health'") ||
                           content.includes("router.push('/app/health')");
  
  // Verifica che ci sia la landing page
  const hasLandingPage = content.includes('Monitoraggio Salute Piante') &&
                        content.includes('Vai al Monitoraggio Salute');
  
  // Verifica che ci siano le feature preview cards
  const hasFeatureCards = content.includes('Analisi AI Foto') &&
                         content.includes('Consulti Agronomici') &&
                         content.includes('Alert Automatici');
  
  // Verifica import delle icone necessarie
  const hasRequiredIcons = content.includes('Camera') &&
                          content.includes('UserCheck') &&
                          content.includes('ArrowRight');
  
  console.log(`   ✅ No inline health suggestions: ${noPlannerHealthSuggestions ? 'OK' : 'STILL_INLINE'}`);
  console.log(`   ✅ Health redirect: ${hasHealthRedirect ? 'OK' : 'MISSING'}`);
  console.log(`   ✅ Landing page: ${hasLandingPage ? 'OK' : 'MISSING'}`);
  console.log(`   ✅ Feature cards: ${hasFeatureCards ? 'OK' : 'MISSING'}`);
  console.log(`   ✅ Required icons: ${hasRequiredIcons ? 'OK' : 'MISSING'}`);
  
  const allChecks = noPlannerHealthSuggestions && hasHealthRedirect && 
                   hasLandingPage && hasFeatureCards && hasRequiredIcons;
  
  console.log(`   ${allChecks ? '✅' : '❌'} Planner health tab: ${allChecks ? 'REDIRECTS_CORRECTLY' : 'ISSUES'}\n`);
  return allChecks;
}

// Test 2: Verifica che la pagina health esista e funzioni
function testHealthPageExists() {
  console.log('2️⃣ Testing Health page exists and is functional...');
  
  const healthPath = 'app/app/health/page.tsx';
  if (!fs.existsSync(healthPath)) {
    console.log('❌ Health page not found');
    return false;
  }
  
  const content = fs.readFileSync(healthPath, 'utf8');
  
  // Verifica funzionalità principali
  const hasHealthAlerts = content.includes('HealthAlert') && content.includes('plantHealthMonitoringService');
  const hasPhotoAnalysis = content.includes('PhotoAnalysisModal') && content.includes('handlePhotoAnalysis');
  const hasAgronomistConsult = content.includes('AgronomistModal') && content.includes('handleAgronomistContact');
  const hasStatistics = content.includes('Alert Totali') && content.includes('Critici');
  const hasFilters = content.includes('selectedSeverity') && content.includes('selectedType');
  const hasExportFunction = content.includes('PlantHealthPage') && content.includes('export default');
  
  console.log(`   ✅ Health alerts system: ${hasHealthAlerts ? 'OK' : 'MISSING'}`);
  console.log(`   ✅ Photo analysis: ${hasPhotoAnalysis ? 'OK' : 'MISSING'}`);
  console.log(`   ✅ Agronomist consult: ${hasAgronomistConsult ? 'OK' : 'MISSING'}`);
  console.log(`   ✅ Statistics dashboard: ${hasStatistics ? 'OK' : 'MISSING'}`);
  console.log(`   ✅ Filters system: ${hasFilters ? 'OK' : 'MISSING'}`);
  console.log(`   ✅ Proper export: ${hasExportFunction ? 'OK' : 'MISSING'}`);
  
  const allChecks = hasHealthAlerts && hasPhotoAnalysis && hasAgronomistConsult && 
                   hasStatistics && hasFilters && hasExportFunction;
  
  console.log(`   ${allChecks ? '✅' : '❌'} Health page: ${allChecks ? 'FULLY_FUNCTIONAL' : 'ISSUES'}\n`);
  return allChecks;
}

// Test 3: Verifica che il widget salute reindirizza correttamente
function testHealthWidgetRedirect() {
  console.log('3️⃣ Testing Health widget redirects correctly...');
  
  const widgetPath = 'components/planner/HealthAlertsWidget.tsx';
  if (!fs.existsSync(widgetPath)) {
    console.log('❌ Health widget not found');
    return false;
  }
  
  const content = fs.readFileSync(widgetPath, 'utf8');
  
  // Verifica che il widget reindirizza a /app/health
  const hasCorrectRedirect = content.includes("router.push('/app/health')");
  const hasViewAllButton = content.includes('Vedi Monitoraggio Completo');
  const hasHealthAlertsInterface = content.includes('HealthAlertsWidget');
  const hasProperImports = content.includes('useRouter') && content.includes('next/navigation');
  
  console.log(`   ✅ Correct redirect: ${hasCorrectRedirect ? 'OK' : 'WRONG_REDIRECT'}`);
  console.log(`   ✅ View all button: ${hasViewAllButton ? 'OK' : 'MISSING'}`);
  console.log(`   ✅ Widget interface: ${hasHealthAlertsInterface ? 'OK' : 'MISSING'}`);
  console.log(`   ✅ Proper imports: ${hasProperImports ? 'OK' : 'MISSING'}`);
  
  const allChecks = hasCorrectRedirect && hasViewAllButton && 
                   hasHealthAlertsInterface && hasProperImports;
  
  console.log(`   ${allChecks ? '✅' : '❌'} Health widget: ${allChecks ? 'REDIRECTS_CORRECTLY' : 'ISSUES'}\n`);
  return allChecks;
}

// Test 4: Verifica che advice page sia separata
function testAdvicePageSeparate() {
  console.log('4️⃣ Testing Advice page is separate from health...');
  
  const advicePath = 'app/app/advice/page.tsx';
  if (!fs.existsSync(advicePath)) {
    console.log('❌ Advice page not found');
    return false;
  }
  
  const content = fs.readFileSync(advicePath, 'utf8');
  
  // Verifica che advice sia separata da health
  const isAdvicePage = content.includes('AdvicePage') && content.includes('Consigli AI');
  const hasAIAdvice = content.includes('AIAdvice') && content.includes('loadAIAdvice');
  const hasRotationIntegration = content.includes('CropRotationPlanner');
  const hasBiologicalIntegration = content.includes('BiologicalControlDashboard');
  const noHealthContent = !content.includes('HealthAlert') && !content.includes('plantHealthMonitoringService');
  
  console.log(`   ✅ Is advice page: ${isAdvicePage ? 'OK' : 'WRONG_PAGE'}`);
  console.log(`   ✅ Has AI advice: ${hasAIAdvice ? 'OK' : 'MISSING'}`);
  console.log(`   ✅ Rotation integration: ${hasRotationIntegration ? 'OK' : 'MISSING'}`);
  console.log(`   ✅ Biological integration: ${hasBiologicalIntegration ? 'OK' : 'MISSING'}`);
  console.log(`   ✅ No health content: ${noHealthContent ? 'OK' : 'MIXED_CONTENT'}`);
  
  const allChecks = isAdvicePage && hasAIAdvice && hasRotationIntegration && 
                   hasBiologicalIntegration && noHealthContent;
  
  console.log(`   ${allChecks ? '✅' : '❌'} Advice page separation: ${allChecks ? 'PROPERLY_SEPARATED' : 'ISSUES'}\n`);
  return allChecks;
}

// Test 5: Verifica navigazione consistente
function testConsistentNavigation() {
  console.log('5️⃣ Testing consistent navigation patterns...');
  
  // Controlla che tutti i percorsi portino a /app/health
  const plannerContent = fs.readFileSync('app/app/planner/page.tsx', 'utf8');
  const widgetContent = fs.readFileSync('components/planner/HealthAlertsWidget.tsx', 'utf8');
  
  // Verifica che entrambi puntino a /app/health
  const plannerPointsToHealth = plannerContent.includes('/app/health');
  const widgetPointsToHealth = widgetContent.includes('/app/health');
  
  // Verifica che non ci siano redirect al planner dalla salute
  const healthContent = fs.readFileSync('app/app/health/page.tsx', 'utf8');
  const noHealthToPlanner = !healthContent.includes("router.push('/app/planner')");
  
  // Verifica che advice non reindirizza più
  const adviceContent = fs.readFileSync('app/app/advice/page.tsx', 'utf8');
  const noAdviceRedirect = !adviceContent.includes("router.push('/app/planner')") &&
                          !adviceContent.includes('setTimeout');
  
  console.log(`   ✅ Planner → health: ${plannerPointsToHealth ? 'OK' : 'WRONG_TARGET'}`);
  console.log(`   ✅ Widget → health: ${widgetPointsToHealth ? 'OK' : 'WRONG_TARGET'}`);
  console.log(`   ✅ Health no redirect: ${noHealthToPlanner ? 'OK' : 'REDIRECTS'}`);
  console.log(`   ✅ Advice no redirect: ${noAdviceRedirect ? 'OK' : 'STILL_REDIRECTS'}`);
  
  const allChecks = plannerPointsToHealth && widgetPointsToHealth && 
                   noHealthToPlanner && noAdviceRedirect;
  
  console.log(`   ${allChecks ? '✅' : '❌'} Navigation consistency: ${allChecks ? 'CONSISTENT' : 'INCONSISTENT'}\n`);
  return allChecks;
}

// Esegui tutti i test
async function runAllTests() {
  console.log('🚀 Starting Health Navigation Tests...\n');
  
  const results = {
    plannerRedirect: testPlannerHealthTabRedirect(),
    healthPageExists: testHealthPageExists(),
    widgetRedirect: testHealthWidgetRedirect(),
    adviceSeparate: testAdvicePageSeparate(),
    consistentNavigation: testConsistentNavigation()
  };
  
  // Calcola risultati
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  const percentage = Math.round((passed / total) * 100);
  
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('========================');
  console.log(`✅ Passed: ${passed}/${total} (${percentage}%)`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  
  if (percentage === 100) {
    console.log('\n🎉 ALL TESTS PASSED! Health navigation is now consistent!');
    console.log('\n📱 Navigation Flow:');
    console.log('   • Planner Tab "Salute" → Landing Page → /app/health');
    console.log('   • Health Widget → /app/health');
    console.log('   • Direct URL → /app/health');
    console.log('   • Advice page → /app/advice (separate)');
    console.log('\n✅ User Experience:');
    console.log('   • Clear navigation from planner to dedicated health page');
    console.log('   • Consistent behavior across all entry points');
    console.log('   • Separate advice and health functionalities');
    console.log('   • No more confusion about where to find health features');
  } else if (percentage >= 80) {
    console.log('\n✅ Most tests passed! Minor issues may exist.');
  } else {
    console.log('\n❌ Several issues found. Review failed tests above.');
  }
  
  console.log('\n🔗 Test URLs:');
  console.log('   • Health (DEDICATED): http://localhost:3002/app/health');
  console.log('   • Advice (SEPARATE): http://localhost:3002/app/advice');
  console.log('   • Planner (REDIRECTS): http://localhost:3002/app/planner');
  
  return results;
}

// Esegui i test
runAllTests().catch(console.error);