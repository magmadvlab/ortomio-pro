#!/usr/bin/env node

/**
 * Mobile Comprehensive Test Suite
 * Test completo per verificare ottimizzazione mobile di OrtoMio
 */

import fs from 'fs';
import path from 'path';

console.log('🔍 MOBILE COMPREHENSIVE TEST SUITE - OrtoMio');
console.log('='.repeat(60));

// Test Results Storage
const testResults = {
  components: [],
  pages: [],
  issues: [],
  recommendations: [],
  score: 0
};

/**
 * Analizza un file per problemi mobile
 */
function analyzeFile(filePath, content) {
  const issues = [];
  const recommendations = [];
  
  // Test 1: Responsive Design Classes
  const responsiveClasses = [
    'sm:', 'md:', 'lg:', 'xl:', '2xl:',
    'grid-cols-1', 'flex-col', 'flex-wrap',
    'w-full', 'max-w-', 'min-w-'
  ];
  
  const hasResponsive = responsiveClasses.some(cls => content.includes(cls));
  if (!hasResponsive) {
    issues.push('❌ Mancano classi responsive Tailwind');
    recommendations.push('Aggiungere breakpoint responsive (sm:, md:, lg:)');
  }
  
  // Test 2: Touch Target Size (min 44px)
  const buttonPatterns = [
    /className="[^"]*p-1[^"]*"/g,
    /className="[^"]*p-2[^"]*"/g,
    /size={12}/g,
    /size={16}/g
  ];
  
  buttonPatterns.forEach(pattern => {
    if (pattern.test(content)) {
      issues.push('⚠️ Possibili touch target troppo piccoli (<44px)');
      recommendations.push('Usare padding minimo p-3 e icone size={20} o maggiori');
    }
  });
  
  // Test 3: Fixed Width Elements
  const fixedWidthPatterns = [
    /w-\d{3,}/g,  // w-100, w-200, etc
    /min-w-\d{3,}/g,
    /max-w-\d{3,}/g
  ];
  
  fixedWidthPatterns.forEach(pattern => {
    if (pattern.test(content)) {
      issues.push('⚠️ Possibili larghezze fisse che potrebbero causare overflow');
      recommendations.push('Usare larghezze relative o max-width responsive');
    }
  });
  
  // Test 4: Horizontal Scroll Prevention
  if (content.includes('overflow-x-auto') && !content.includes('whitespace-nowrap')) {
    issues.push('⚠️ Scroll orizzontale senza whitespace-nowrap');
    recommendations.push('Aggiungere whitespace-nowrap per elementi scrollabili');
  }
  
  // Test 5: Mobile Menu Implementation
  if (filePath.includes('Menu') || filePath.includes('Navigation')) {
    if (!content.includes('md:hidden') && !content.includes('lg:hidden')) {
      issues.push('❌ Menu mobile non implementato correttamente');
      recommendations.push('Implementare toggle mobile con md:hidden/lg:block');
    }
  }
  
  // Test 6: Form Input Optimization
  if (content.includes('<input') || content.includes('input')) {
    if (!content.includes('text-base') && !content.includes('text-lg')) {
      issues.push('⚠️ Input potrebbero essere troppo piccoli per mobile');
      recommendations.push('Usare text-base o text-lg per input mobile-friendly');
    }
  }
  
  // Test 7: Modal/Dialog Mobile Optimization
  if (content.includes('modal') || content.includes('Modal') || content.includes('Dialog')) {
    if (!content.includes('max-h-') && !content.includes('overflow-y-auto')) {
      issues.push('⚠️ Modal potrebbero non essere ottimizzati per mobile');
      recommendations.push('Aggiungere max-height e scroll per modal mobile');
    }
  }
  
  return { issues, recommendations };
}

/**
 * Scansiona directory per file React/TypeScript
 */
function scanDirectory(dir, basePath = '') {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const relativePath = path.join(basePath, file);
    
    if (fs.statSync(fullPath).isDirectory()) {
      // Skip node_modules, .git, .next
      if (!['node_modules', '.git', '.next', 'dist', 'build'].includes(file)) {
        scanDirectory(fullPath, relativePath);
      }
    } else if (file.match(/\.(tsx?|jsx?)$/)) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const analysis = analyzeFile(relativePath, content);
        
        if (analysis.issues.length > 0 || analysis.recommendations.length > 0) {
          const result = {
            file: relativePath,
            issues: analysis.issues,
            recommendations: analysis.recommendations,
            score: Math.max(0, 100 - (analysis.issues.length * 10))
          };
          
          if (relativePath.includes('components/')) {
            testResults.components.push(result);
          } else if (relativePath.includes('app/') || relativePath.includes('pages/')) {
            testResults.pages.push(result);
          }
          
          testResults.issues.push(...analysis.issues);
          testResults.recommendations.push(...analysis.recommendations);
        }
      } catch (error) {
        console.log(`⚠️ Errore lettura file ${relativePath}: ${error.message}`);
      }
    }
  }
}

/**
 * Test specifici per componenti critici
 */
function testCriticalComponents() {
  console.log('\n🎯 TEST COMPONENTI CRITICI');
  console.log('-'.repeat(40));
  
  const criticalComponents = [
    'components/shared/MobileMenu.tsx',
    'components/progress/AchievementsTab.tsx',
    'app/(dashboard)/app/progress/page.tsx',
    'components/prescription/PrescriptionMapsDashboard.tsx',
    'components/ndvi/NDVIDashboard.tsx',
    'components/plants/SmartPlantManager.tsx',
    'components/garden/DailyGardenReport.tsx'
  ];
  
  criticalComponents.forEach(componentPath => {
    if (fs.existsSync(componentPath)) {
      console.log(`\n📱 Testing: ${componentPath}`);
      const content = fs.readFileSync(componentPath, 'utf8');
      
      // Test responsive grid
      const hasResponsiveGrid = /grid-cols-1.*md:grid-cols-|flex-col.*md:flex-row/.test(content);
      console.log(`  Grid Responsive: ${hasResponsiveGrid ? '✅' : '❌'}`);
      
      // Test touch targets
      const hasTouchTargets = content.includes('p-3') || content.includes('p-4') || content.includes('py-3');
      console.log(`  Touch Targets: ${hasTouchTargets ? '✅' : '❌'}`);
      
      // Test mobile breakpoints
      const hasMobileBreakpoints = content.includes('sm:') || content.includes('md:');
      console.log(`  Mobile Breakpoints: ${hasMobileBreakpoints ? '✅' : '❌'}`);
      
      // Test overflow handling
      const hasOverflowHandling = content.includes('overflow-') || content.includes('max-w-');
      console.log(`  Overflow Handling: ${hasOverflowHandling ? '✅' : '❌'}`);
      
    } else {
      console.log(`❌ File non trovato: ${componentPath}`);
    }
  });
}

/**
 * Test CSS e Tailwind Configuration
 */
function testTailwindConfig() {
  console.log('\n🎨 TEST TAILWIND CONFIGURATION');
  console.log('-'.repeat(40));
  
  if (fs.existsSync('tailwind.config.js')) {
    const config = fs.readFileSync('tailwind.config.js', 'utf8');
    
    // Test responsive breakpoints
    const hasCustomBreakpoints = config.includes('screens:') || config.includes('breakpoints:');
    console.log(`  Custom Breakpoints: ${hasCustomBreakpoints ? '✅' : '⚠️'}`);
    
    // Test mobile-first approach
    const hasMobileFirst = config.includes('mobile') || config.includes('sm:');
    console.log(`  Mobile-First Config: ${hasMobileFirst ? '✅' : '⚠️'}`);
    
  } else {
    console.log('❌ tailwind.config.js non trovato');
  }
}

/**
 * Genera report finale
 */
function generateReport() {
  console.log('\n📊 MOBILE OPTIMIZATION REPORT');
  console.log('='.repeat(60));
  
  const totalIssues = testResults.issues.length;
  const totalFiles = testResults.components.length + testResults.pages.length;
  const averageScore = totalFiles > 0 ? 
    testResults.components.concat(testResults.pages)
      .reduce((sum, item) => sum + item.score, 0) / totalFiles : 100;
  
  console.log(`\n📈 PUNTEGGIO GENERALE: ${averageScore.toFixed(1)}/100`);
  console.log(`📁 File Analizzati: ${totalFiles}`);
  console.log(`⚠️ Issues Totali: ${totalIssues}`);
  
  // Classificazione score
  let classification = '';
  if (averageScore >= 90) classification = '🟢 ECCELLENTE';
  else if (averageScore >= 80) classification = '🟡 BUONO';
  else if (averageScore >= 70) classification = '🟠 SUFFICIENTE';
  else classification = '🔴 NECESSITA MIGLIORAMENTI';
  
  console.log(`🎯 Classificazione: ${classification}`);
  
  // Top Issues
  if (testResults.issues.length > 0) {
    console.log('\n🚨 TOP ISSUES:');
    const issueCount = {};
    testResults.issues.forEach(issue => {
      issueCount[issue] = (issueCount[issue] || 0) + 1;
    });
    
    Object.entries(issueCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .forEach(([issue, count]) => {
        console.log(`  ${issue} (${count}x)`);
      });
  }
  
  // Recommendations
  if (testResults.recommendations.length > 0) {
    console.log('\n💡 TOP RECOMMENDATIONS:');
    const recCount = {};
    testResults.recommendations.forEach(rec => {
      recCount[rec] = (recCount[rec] || 0) + 1;
    });
    
    Object.entries(recCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .forEach(([rec, count]) => {
        console.log(`  • ${rec} (${count}x)`);
      });
  }
  
  // Files with most issues
  if (testResults.components.length > 0 || testResults.pages.length > 0) {
    console.log('\n📁 FILES CON PIÙ ISSUES:');
    const allFiles = testResults.components.concat(testResults.pages);
    allFiles
      .sort((a, b) => b.issues.length - a.issues.length)
      .slice(0, 5)
      .forEach(file => {
        console.log(`  ${file.file}: ${file.issues.length} issues (Score: ${file.score})`);
      });
  }
  
  return {
    score: averageScore,
    classification,
    totalIssues,
    totalFiles,
    needsWork: averageScore < 80
  };
}

/**
 * Main execution
 */
function main() {
  console.log('🚀 Avvio test mobile comprehensive...\n');
  
  // Test critical components first
  testCriticalComponents();
  
  // Test Tailwind config
  testTailwindConfig();
  
  // Scan all files
  console.log('\n🔍 SCANSIONE FILE SISTEMA');
  console.log('-'.repeat(40));
  scanDirectory('./components', 'components');
  scanDirectory('./app', 'app');
  
  // Generate final report
  const report = generateReport();
  
  // Save detailed report
  const detailedReport = {
    timestamp: new Date().toISOString(),
    summary: report,
    components: testResults.components,
    pages: testResults.pages,
    allIssues: testResults.issues,
    allRecommendations: testResults.recommendations
  };
  
  fs.writeFileSync('mobile-test-report.json', JSON.stringify(detailedReport, null, 2));
  console.log('\n💾 Report dettagliato salvato in: mobile-test-report.json');
  
  // Exit with appropriate code
  if (report.needsWork) {
    console.log('\n⚠️ ATTENZIONE: Il sistema necessita ottimizzazioni mobile!');
    process.exit(1);
  } else {
    console.log('\n✅ Sistema mobile-friendly verificato!');
    process.exit(0);
  }
}

// Run the test
main();