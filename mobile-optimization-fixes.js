#!/usr/bin/env node

/**
 * Mobile Optimization Fixes
 * Script per applicare automaticamente le ottimizzazioni mobile più comuni
 */

import fs from 'fs';
import path from 'path';

console.log('🔧 MOBILE OPTIMIZATION FIXES - OrtoMio');
console.log('='.repeat(50));

const fixes = {
  applied: 0,
  files: 0,
  errors: 0
};

/**
 * Applica fix comuni per mobile optimization
 */
function applyMobileFixes(filePath, content) {
  let modified = content;
  let changes = [];

  // Fix 1: Touch targets troppo piccoli
  const smallPaddingFixes = [
    { from: /className="([^"]*?)p-1([^"]*?)"/g, to: 'className="$1p-3$2"', desc: 'p-1 → p-3 (touch target)' },
    { from: /className="([^"]*?)p-2([^"]*?)"/g, to: 'className="$1p-3$2"', desc: 'p-2 → p-3 (touch target)' },
    { from: /size={12}/g, to: 'size={20}', desc: 'icon size 12 → 20' },
    { from: /size={14}/g, to: 'size={20}', desc: 'icon size 14 → 20' },
    { from: /size={16}/g, to: 'size={20}', desc: 'icon size 16 → 20' }
  ];

  smallPaddingFixes.forEach(fix => {
    if (fix.from.test(modified)) {
      modified = modified.replace(fix.from, fix.to);
      changes.push(fix.desc);
    }
  });

  // Fix 2: Aggiungere responsive breakpoints
  const responsiveFixes = [
    { 
      from: /className="([^"]*?)grid-cols-(\d+)([^"]*?)"/g, 
      to: 'className="$1grid-cols-1 md:grid-cols-$2$3"', 
      desc: 'grid responsive' 
    },
    { 
      from: /className="([^"]*?)flex-row([^"]*?)"/g, 
      to: 'className="$1flex-col md:flex-row$2"', 
      desc: 'flex responsive' 
    },
    { 
      from: /className="([^"]*?)text-xl([^"]*?)"/g, 
      to: 'className="$1text-lg md:text-xl$2"', 
      desc: 'text responsive' 
    },
    { 
      from: /className="([^"]*?)text-2xl([^"]*?)"/g, 
      to: 'className="$1text-xl md:text-2xl$2"', 
      desc: 'text responsive' 
    }
  ];

  responsiveFixes.forEach(fix => {
    if (fix.from.test(modified)) {
      modified = modified.replace(fix.from, fix.to);
      changes.push(fix.desc);
    }
  });

  // Fix 3: Input mobile-friendly
  const inputFixes = [
    { 
      from: /className="([^"]*?)px-3 py-2([^"]*?)"/g, 
      to: 'className="$1px-4 py-3 text-base$2"', 
      desc: 'input mobile size' 
    }
  ];

  inputFixes.forEach(fix => {
    if (fix.from.test(modified)) {
      modified = modified.replace(fix.from, fix.to);
      changes.push(fix.desc);
    }
  });

  // Fix 4: Modal mobile optimization
  if (content.includes('modal') || content.includes('Modal')) {
    const modalFixes = [
      { 
        from: /className="([^"]*?)max-w-md([^"]*?)"/g, 
        to: 'className="$1max-w-[90vw] md:max-w-md max-h-[90vh] overflow-y-auto$2"', 
        desc: 'modal mobile size' 
      }
    ];

    modalFixes.forEach(fix => {
      if (fix.from.test(modified)) {
        modified = modified.replace(fix.from, fix.to);
        changes.push(fix.desc);
      }
    });
  }

  // Fix 5: Overflow prevention
  const overflowFixes = [
    { 
      from: /className="([^"]*?)w-\d{3,}([^"]*?)"/g, 
      to: 'className="$1w-full max-w-sm$2"', 
      desc: 'prevent overflow' 
    }
  ];

  overflowFixes.forEach(fix => {
    if (fix.from.test(modified)) {
      modified = modified.replace(fix.from, fix.to);
      changes.push(fix.desc);
    }
  });

  return { modified, changes };
}

/**
 * Processa un singolo file
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const { modified, changes } = applyMobileFixes(filePath, content);
    
    if (changes.length > 0) {
      fs.writeFileSync(filePath, modified);
      console.log(`✅ ${filePath}: ${changes.length} fixes applied`);
      changes.forEach(change => console.log(`   • ${change}`));
      fixes.applied += changes.length;
    }
    
    fixes.files++;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    fixes.errors++;
  }
}

/**
 * Scansiona directory
 */
function scanDirectory(dir, basePath = '') {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const relativePath = path.join(basePath, file);
    
    if (fs.statSync(fullPath).isDirectory()) {
      if (!['node_modules', '.git', '.next', 'dist', 'build'].includes(file)) {
        scanDirectory(fullPath, relativePath);
      }
    } else if (file.match(/\.(tsx?|jsx?)$/)) {
      processFile(fullPath);
    }
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🚀 Applicazione fix mobile automatici...\n');
  
  // Processa componenti critici prima
  const criticalFiles = [
    'components/Journal.tsx',
    'components/shared/HarvestPromptModal.tsx',
    'components/Advice.tsx',
    'components/CalendarAlmanac.tsx',
    'components/CustomCropsDashboard.tsx'
  ];
  
  console.log('🎯 PROCESSING CRITICAL FILES');
  console.log('-'.repeat(30));
  
  criticalFiles.forEach(file => {
    if (fs.existsSync(file)) {
      processFile(file);
    }
  });
  
  console.log('\n🔍 PROCESSING ALL COMPONENTS');
  console.log('-'.repeat(30));
  
  // Processa tutti i componenti
  scanDirectory('./components', 'components');
  
  // Report finale
  console.log('\n📊 MOBILE FIXES REPORT');
  console.log('='.repeat(30));
  console.log(`📁 Files Processed: ${fixes.files}`);
  console.log(`✅ Fixes Applied: ${fixes.applied}`);
  console.log(`❌ Errors: ${fixes.errors}`);
  
  if (fixes.applied > 0) {
    console.log('\n🎉 Mobile optimization fixes applied successfully!');
    console.log('💡 Run the mobile test again to see improvements.');
  } else {
    console.log('\n⚠️ No fixes were needed or applicable.');
  }
}

// Run the fixes
main();