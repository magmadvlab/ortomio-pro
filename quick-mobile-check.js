/**
 * Quick Mobile Check
 * Controllo rapido dei principali problemi mobile
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Quick Mobile Check - OrtoMio');
console.log('=' .repeat(50));

// Check key components for mobile issues
const componentsToCheck = [
  'components/prescription/PrescriptionMapsDashboard.tsx',
  'components/ndvi/NDVIDashboard.tsx',
  'components/plants/SmartPlantManager.tsx',
  'app/(dashboard)/layout.tsx',
  'components/garden/GardenView.tsx'
];

let totalIssues = 0;
const issues = [];

componentsToCheck.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    console.log(`\n📄 Checking: ${filePath}`);
    
    const content = fs.readFileSync(filePath, 'utf8');
    const fileIssues = [];
    
    // Check 1: Missing responsive classes
    if (content.includes('className') && !content.includes('sm:') && !content.includes('md:')) {
      fileIssues.push('❌ Missing responsive breakpoints (sm:, md:, lg:)');
    }
    
    // Check 2: Fixed widths
    const fixedWidths = content.match(/w-\[\d+px\]/g);
    if (fixedWidths) {
      fileIssues.push(`❌ Fixed pixel widths found: ${fixedWidths.join(', ')}`);
    }
    
    // Check 3: Small touch targets
    if (content.includes('p-1') || content.includes('px-1') || content.includes('py-1')) {
      fileIssues.push('❌ Small padding detected - may affect touch targets');
    }
    
    // Check 4: Missing mobile navigation
    if (content.includes('nav') && !content.includes('hidden') && !content.includes('md:block')) {
      fileIssues.push('❌ Navigation without mobile responsive hiding');
    }
    
    // Check 5: Large containers
    if (content.includes('max-w-7xl') || content.includes('max-w-6xl')) {
      fileIssues.push('⚠️ Very large containers - may not work well on mobile');
    }
    
    // Check 6: Grid without responsive
    if (content.includes('grid-cols-') && !content.includes('sm:grid-cols') && !content.includes('md:grid-cols')) {
      fileIssues.push('❌ Grid layout without responsive columns');
    }
    
    if (fileIssues.length === 0) {
      console.log('   ✅ No obvious mobile issues found');
    } else {
      fileIssues.forEach(issue => console.log(`   ${issue}`));
      totalIssues += fileIssues.length;
      issues.push({ file: filePath, issues: fileIssues });
    }
  } else {
    console.log(`   ⚠️ File not found: ${filePath}`);
  }
});

console.log('\n📊 SUMMARY');
console.log('=' .repeat(30));
console.log(`Total issues found: ${totalIssues}`);

if (totalIssues > 0) {
  console.log('\n🔧 RECOMMENDED FIXES:');
  console.log('1. Add responsive breakpoints: sm:, md:, lg:');
  console.log('2. Replace fixed widths with responsive alternatives');
  console.log('3. Increase touch target sizes (min p-3)');
  console.log('4. Implement mobile navigation patterns');
  console.log('5. Use responsive grid columns');
  
  console.log('\n📱 NEXT STEPS:');
  console.log('1. Open mobile-testing-suite.html in browser');
  console.log('2. Test OrtoMio at http://localhost:3000');
  console.log('3. Fix issues starting with highest priority files');
} else {
  console.log('\n🎉 Great! No obvious mobile issues detected.');
}

// Generate simple fix script
const fixScript = `#!/bin/bash
# Quick Mobile Fixes for OrtoMio

echo "🔧 Applying quick mobile fixes..."

# Add this to your components that need mobile fixes:
# 1. Replace fixed widths with responsive
# 2. Add responsive breakpoints
# 3. Increase touch targets

echo "✅ Manual fixes required - see mobile-issues-report.md for details"
`;

fs.writeFileSync('apply-mobile-fixes.sh', fixScript);
console.log('\n📄 Generated: apply-mobile-fixes.sh');