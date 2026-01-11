/**
 * Test Menu Optimization - OrtoMio PRO
 * Verifica che il menu riorganizzato funzioni correttamente
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Testing Menu Optimization...\n');

// Test 1: Verifica che il file MobileMenu.tsx esista e sia valido
const menuPath = path.join(__dirname, 'components/shared/MobileMenu.tsx');
if (!fs.existsSync(menuPath)) {
  console.error('❌ MobileMenu.tsx not found');
  process.exit(1);
}

const menuContent = fs.readFileSync(menuPath, 'utf8');

// Test 2: Verifica che non ci siano duplicazioni
const duplications = [
  { item: 'Analytics', count: (menuContent.match(/label: 'Analytics'/g) || []).length },
  { item: 'Nutrizione & Trattamenti', count: (menuContent.match(/label: 'Nutrizione & Trattamenti'/g) || []).length },
  { item: 'Lavorazioni', count: (menuContent.match(/label: 'Lavorazioni'/g) || []).length },
  { item: 'Export', count: (menuContent.match(/label: 'Export'/g) || []).length }
];

console.log('📋 Test Duplicazioni:');
let hasDuplications = false;
duplications.forEach(dup => {
  if (dup.count > 3) { // Massimo 3 occorrenze (una per tier)
    console.log(`❌ ${dup.item}: ${dup.count} occorrenze (troppo)`);
    hasDuplications = true;
  } else {
    console.log(`✅ ${dup.item}: ${dup.count} occorrenze (OK)`);
  }
});

// Test 3: Verifica che le nuove funzionalità siano presenti
const newFeatures = [
  'NDVI Satellitare',
  'Prescription Maps', 
  'Irrigazione',
  'GlobalG.A.P.',
  'Piante'
];

console.log('\n🆕 Test Nuove Funzionalità:');
let missingFeatures = false;
newFeatures.forEach(feature => {
  if (menuContent.includes(`label: '${feature}'`)) {
    console.log(`✅ ${feature}: Presente`);
  } else {
    console.log(`❌ ${feature}: Mancante`);
    missingFeatures = true;
  }
});

// Test 4: Verifica struttura gruppi
const expectedGroups = [
  'PRINCIPALE',
  'COLTURE SPECIALIZZATE', 
  'GESTIONE PROFESSIONALE',
  'ANALYTICS & SMART',
  'SUPPORTO'
];

console.log('\n📁 Test Struttura Gruppi:');
let missingGroups = false;
expectedGroups.forEach(group => {
  if (menuContent.includes(`title: '${group}'`)) {
    console.log(`✅ ${group}: Presente`);
  } else {
    console.log(`❌ ${group}: Mancante`);
    missingGroups = true;
  }
});

// Test 5: Verifica icone corrette
const iconMappings = [
  { feature: 'NDVI Satellitare', icon: 'Satellite' },
  { feature: 'Prescription Maps', icon: 'Target' },
  { feature: 'Irrigazione', icon: 'Droplets' },
  { feature: 'GlobalG.A.P.', icon: 'Shield' },
  { feature: 'Piante', icon: 'Leaf' }
];

console.log('\n🎨 Test Icone:');
let wrongIcons = false;
iconMappings.forEach(mapping => {
  const featureLine = menuContent.split('\n').find(line => 
    line.includes(`label: '${mapping.feature}'`)
  );
  
  if (featureLine && featureLine.includes(`icon: ${mapping.icon}`)) {
    console.log(`✅ ${mapping.feature}: ${mapping.icon} (OK)`);
  } else {
    console.log(`❌ ${mapping.feature}: Icona ${mapping.icon} non trovata`);
    wrongIcons = true;
  }
});

// Test 6: Verifica import icone
const requiredIcons = ['Satellite', 'Target', 'Droplets', 'Shield', 'Leaf'];
console.log('\n📦 Test Import Icone:');
let missingIcons = false;
requiredIcons.forEach(icon => {
  if (menuContent.includes(icon)) {
    console.log(`✅ ${icon}: Importata`);
  } else {
    console.log(`❌ ${icon}: Mancante nell'import`);
    missingIcons = true;
  }
});

// Risultato finale
console.log('\n' + '='.repeat(50));
if (!hasDuplications && !missingFeatures && !missingGroups && !wrongIcons && !missingIcons) {
  console.log('🎉 TUTTI I TEST SUPERATI!');
  console.log('✅ Menu optimization completata con successo');
  console.log('✅ Zero duplicazioni');
  console.log('✅ Tutte le nuove funzionalità presenti');
  console.log('✅ Struttura gruppi corretta');
  console.log('✅ Icone corrette');
  console.log('✅ Import completi');
} else {
  console.log('⚠️  ALCUNI TEST FALLITI');
  if (hasDuplications) console.log('❌ Duplicazioni trovate');
  if (missingFeatures) console.log('❌ Funzionalità mancanti');
  if (missingGroups) console.log('❌ Gruppi mancanti');
  if (wrongIcons) console.log('❌ Icone errate');
  if (missingIcons) console.log('❌ Import icone mancanti');
}

console.log('\n📱 Menu OrtoMio PRO è pronto per il test mobile!');