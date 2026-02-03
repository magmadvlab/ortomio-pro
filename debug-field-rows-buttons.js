#!/usr/bin/env node

/**
 * Debug Field Rows Buttons
 * 
 * Analizza tutti i pulsanti nella sezione field rows per identificare
 * quale pulsante l'utente sta cliccando che porta al vivaio
 */

import fs from 'fs';

console.log('🔍 Debug Field Rows Buttons\n');

function analyzeFieldRowsButtons() {
  console.log('1️⃣ Analyzing all buttons in field rows section...');
  
  const dashboardPath = 'components/shared/HomeDashboard.tsx';
  
  if (!fs.existsSync(dashboardPath)) {
    console.log('   ❌ HomeDashboard.tsx not found');
    return false;
  }
  
  const content = fs.readFileSync(dashboardPath, 'utf8');
  
  // Trova tutti i link nella sezione field rows
  const fieldRowsSection = content.match(/Field Rows Widget[\s\S]*?{\/\* Link Rapidi/);
  
  if (!fieldRowsSection) {
    console.log('   ❌ Field rows section not found');
    return false;
  }
  
  const sectionContent = fieldRowsSection[0];
  
  // Estrai tutti i link con href
  const linkMatches = sectionContent.matchAll(/<Link[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/Link>/g);
  
  console.log('   📋 Found buttons in field rows section:\n');
  
  let buttonIndex = 1;
  for (const match of linkMatches) {
    const href = match[1];
    const content = match[2];
    
    // Estrai il testo del pulsante (rimuovi JSX e whitespace)
    const buttonText = content
      .replace(/<[^>]*>/g, '') // Rimuovi tag HTML/JSX
      .replace(/\s+/g, ' ')    // Normalizza whitespace
      .replace(/\{[^}]*\}/g, '') // Rimuovi espressioni JSX
      .trim();
    
    const destination = href.includes('plants') ? '🟢 PLANTS PAGE' : 
                       href.includes('semenzaio') ? '🔴 VIVAIO PAGE' :
                       href.includes('settings') ? '⚙️ SETTINGS' :
                       href.includes('irrigation') ? '💧 IRRIGATION' : '❓ OTHER';
    
    console.log(`   ${buttonIndex}. "${buttonText}"`);
    console.log(`      → ${href}`);
    console.log(`      → ${destination}\n`);
    
    buttonIndex++;
  }
  
  return true;
}

function findProblemButton() {
  console.log('2️⃣ Looking for "Apri Vivaio" button...');
  
  const dashboardPath = 'components/shared/HomeDashboard.tsx';
  const content = fs.readFileSync(dashboardPath, 'utf8');
  
  // Cerca "Apri Vivaio" nel testo
  const apriVivaioMatch = content.includes('Apri Vivaio');
  
  if (apriVivaioMatch) {
    console.log('   ✅ Found "Apri Vivaio" text in code');
    
    // Trova il contesto
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      if (line.includes('Apri Vivaio')) {
        console.log(`   📍 Line ${index + 1}: ${line.trim()}`);
      }
    });
  } else {
    console.log('   ❌ "Apri Vivaio" text not found in code');
    console.log('   💡 The text might be generated dynamically or in another component');
  }
  
  // Cerca pattern simili
  const vivaioPatterns = [
    'Vai al Vivaio',
    'Trapianta dal Vivaio', 
    'Vivaio →',
    'Apri Vivaio',
    'Gestisci Vivaio'
  ];
  
  console.log('\n   🔍 Searching for vivaio-related button texts:');
  vivaioPatterns.forEach(pattern => {
    if (content.includes(pattern)) {
      console.log(`   ✅ Found: "${pattern}"`);
      
      // Trova il link associato
      const lines = content.split('\n');
      lines.forEach((line, index) => {
        if (line.includes(pattern)) {
          // Cerca il link nelle righe precedenti
          for (let i = Math.max(0, index - 5); i <= Math.min(lines.length - 1, index + 2); i++) {
            if (lines[i].includes('href=')) {
              const hrefMatch = lines[i].match(/href="([^"]*)"/);
              if (hrefMatch) {
                console.log(`      → Links to: ${hrefMatch[1]}`);
              }
            }
          }
        }
      });
    } else {
      console.log(`   ❌ Not found: "${pattern}"`);
    }
  });
}

function generateSolution() {
  console.log('\n3️⃣ Generating solution...\n');
  
  console.log('🎯 PROBLEM IDENTIFICATION:');
  console.log('   The user sees "Apri Vivaio" button that goes to vivaio');
  console.log('   But expects to see plants for the field row\n');
  
  console.log('💡 POSSIBLE CAUSES:');
  console.log('   1. User clicking wrong button (vivaio instead of plants)');
  console.log('   2. Button text is confusing or misleading');
  console.log('   3. Plants button not visible or prominent enough');
  console.log('   4. Field row has no plants, so only vivaio options shown\n');
  
  console.log('🔧 SOLUTION:');
  console.log('   1. Make plants button more prominent and clear');
  console.log('   2. Change button text to be more explicit');
  console.log('   3. Add visual separation between different actions');
  console.log('   4. Show clear labels for what each button does\n');
}

// Run analysis
analyzeFieldRowsButtons();
findProblemButton();
generateSolution();

console.log('🎯 NEXT STEPS:');
console.log('   1. Check which specific button user is clicking');
console.log('   2. Improve button labeling and visual hierarchy');
console.log('   3. Test with actual field row data');
console.log('   4. Ensure plants button is always visible when appropriate\n');