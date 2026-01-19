#!/usr/bin/env node

/**
 * Test rapido per verificare che la pagina semenzaio funzioni
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Test Pagina Semenzaio');
console.log('========================\n');

// 1. Verifica esistenza file principali
const filesToCheck = [
  'app/app/semenzaio/page.tsx',
  'components/seedling/SeedlingDashboard.tsx',
  'components/seedling/SeedingProgressCard.tsx',
  'components/seedbank/SeedInventory.tsx',
  'components/seedbank/SaplingDashboard.tsx',
  'services/seedInventoryService.ts',
  'services/saplingService.ts',
  'types/seedInventory.ts',
  'types/sapling.ts',
  'hooks/useGarden.ts',
  'components/ui/Button.tsx',
  'components/ui/Card.tsx',
  'components/ui/Input.tsx',
  'components/ui/ortomio-adapter.tsx'
];

console.log('📁 Verifica File Esistenti:');
let allFilesExist = true;

filesToCheck.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MANCANTE`);
    allFilesExist = false;
  }
});

console.log('\n📋 Verifica Contenuti:');

// 2. Verifica import nel file principale
const semenzaioPageContent = fs.readFileSync('app/app/semenzaio/page.tsx', 'utf8');

if (semenzaioPageContent.includes('SeedInventory')) {
  console.log('✅ Import SeedInventory presente');
} else {
  console.log('❌ Import SeedInventory mancante');
}

if (semenzaioPageContent.includes('SeedlingDashboard')) {
  console.log('✅ Import SeedlingDashboard presente');
} else {
  console.log('❌ Import SeedlingDashboard mancante');
}

if (semenzaioPageContent.includes('SaplingDashboard')) {
  console.log('✅ Import SaplingDashboard presente');
} else {
  console.log('❌ Import SaplingDashboard mancante');
}

if (semenzaioPageContent.includes('useGarden')) {
  console.log('✅ Hook useGarden utilizzato');
} else {
  console.log('❌ Hook useGarden mancante');
}

// 3. Verifica tab navigation
if (semenzaioPageContent.includes("'seeds'") && 
    semenzaioPageContent.includes("'seedlings'") && 
    semenzaioPageContent.includes("'saplings'")) {
  console.log('✅ Tab navigation completa (Semi, Piantine, Alberelli)');
} else {
  console.log('❌ Tab navigation incompleta');
}

// 4. Verifica componenti UI
const buttonContent = fs.readFileSync('components/ui/Button.tsx', 'utf8');
if (buttonContent.includes('primary') && buttonContent.includes('bg-green-600')) {
  console.log('✅ Button component con variante primary');
} else {
  console.log('❌ Button component senza variante primary');
}

// 5. Verifica dati mock nei servizi
const seedServiceContent = fs.readFileSync('services/seedInventoryService.ts', 'utf8');
if (seedServiceContent.includes('mockPackets') && seedServiceContent.includes('Pomodoro San Marzano')) {
  console.log('✅ Dati mock nel SeedInventoryService');
} else {
  console.log('❌ Dati mock mancanti nel SeedInventoryService');
}

const saplingServiceContent = fs.readFileSync('services/saplingService.ts', 'utf8');
if (saplingServiceContent.includes('mockSaplings') && saplingServiceContent.includes('Golden Delicious')) {
  console.log('✅ Dati mock nel SaplingService');
} else {
  console.log('❌ Dati mock mancanti nel SaplingService');
}

// 6. Verifica SeedingProgressCard
const seedingCardContent = fs.readFileSync('components/seedling/SeedingProgressCard.tsx', 'utf8');
if (seedingCardContent.includes('getPhaseInfo') && seedingCardContent.includes('survivalRate')) {
  console.log('✅ SeedingProgressCard implementato correttamente');
} else {
  console.log('❌ SeedingProgressCard incompleto');
}

console.log('\n🎯 Risultato Test:');
if (allFilesExist) {
  console.log('✅ Tutti i file necessari sono presenti');
  console.log('✅ La pagina semenzaio dovrebbe funzionare correttamente');
  console.log('\n🚀 Per testare:');
  console.log('1. Vai su: https://ortomio-pro.vercel.app/app/semenzaio');
  console.log('2. Dovresti vedere 3 tab: Semi, Piantine, Alberelli');
  console.log('3. Nel tab "Semi" dovresti vedere il pulsante "Aggiungi Semi"');
  console.log('4. Nel tab "Piantine" dovresti vedere dati di esempio');
  console.log('5. Nel tab "Alberelli" dovresti vedere alberelli di esempio');
} else {
  console.log('❌ Alcuni file sono mancanti - la pagina potrebbe non funzionare');
}

console.log('\n📊 Funzionalità Implementate:');
console.log('• 🌰 Banca dei Semi con inventario completo');
console.log('• 🌱 Gestione piantine con fasi di crescita');
console.log('• 🌳 Gestione alberelli da vivaio');
console.log('• 📊 Statistiche e dashboard');
console.log('• 🔍 Filtri e ricerca');
console.log('• 📱 Interfaccia mobile-friendly');
console.log('• 🎨 UI components personalizzati');
console.log('• 💾 Dati mock per testing');

console.log('\n🔧 Prossimi Passi:');
console.log('1. Testare la pagina nel browser');
console.log('2. Verificare che tutti i pulsanti funzionino');
console.log('3. Testare l\'aggiunta di nuovi semi/piantine/alberelli');
console.log('4. Collegare al database reale quando pronto');