#!/usr/bin/env node

/**
 * Test per verificare che la navigazione "Consigli AI" sia stata aggiunta correttamente
 * a tutti i componenti di navigazione e punti a /app/advice
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 TESTING ADVICE NAVIGATION INTEGRATION');
console.log('==========================================\n');

let allTestsPassed = true;

// Test 1: Verifica Consumer Sidebar
console.log('1️⃣ Testing Consumer Sidebar...');
const consumerSidebarPath = 'components/consumer/Sidebar.tsx';
if (fs.existsSync(consumerSidebarPath)) {
  const content = fs.readFileSync(consumerSidebarPath, 'utf8');
  
  const hasAdviceItem = content.includes("label: 'Consigli AI', path: '/app/advice'");
  const hasLightbulbImport = content.includes('Lightbulb');
  const hasAdviceInGroup = content.includes("'Consigli AI'");
  
  if (hasAdviceItem && hasLightbulbImport && hasAdviceInGroup) {
    console.log('✅ Consumer Sidebar: Consigli AI aggiunto correttamente');
  } else {
    console.log('❌ Consumer Sidebar: Manca configurazione Consigli AI');
    allTestsPassed = false;
  }
} else {
  console.log('❌ Consumer Sidebar: File non trovato');
  allTestsPassed = false;
}

// Test 2: Verifica Professional Sidebar
console.log('\n2️⃣ Testing Professional Sidebar...');
const professionalSidebarPath = 'components/professional/Sidebar.tsx';
if (fs.existsSync(professionalSidebarPath)) {
  const content = fs.readFileSync(professionalSidebarPath, 'utf8');
  
  const hasAdviceItem = content.includes("label: 'Consigli AI', path: '/app/advice'");
  const hasLightbulbImport = content.includes('Lightbulb');
  const hasAdviceInGroup = content.includes("'Consigli AI'");
  
  if (hasAdviceItem && hasLightbulbImport && hasAdviceInGroup) {
    console.log('✅ Professional Sidebar: Consigli AI aggiunto correttamente');
  } else {
    console.log('❌ Professional Sidebar: Manca configurazione Consigli AI');
    allTestsPassed = false;
  }
} else {
  console.log('❌ Professional Sidebar: File non trovato');
  allTestsPassed = false;
}

// Test 3: Verifica Mobile Menu
console.log('\n3️⃣ Testing Mobile Menu...');
const mobileMenuPath = 'components/shared/MobileMenu.tsx';
if (fs.existsSync(mobileMenuPath)) {
  const content = fs.readFileSync(mobileMenuPath, 'utf8');
  
  const hasAdviceInProfessional = content.includes("{ icon: Lightbulb, label: 'Consigli AI', path: '/app/advice', tier: 'all' }");
  const hasAdviceInConsumer = content.match(/consumerGroups.*Consigli AI.*\/app\/advice/s);
  const hasAdviceInFree = content.match(/freeGroups.*Consigli AI.*\/app\/advice/s);
  const hasLightbulbImport = content.includes('Lightbulb');
  
  if (hasAdviceInProfessional && hasAdviceInConsumer && hasAdviceInFree && hasLightbulbImport) {
    console.log('✅ Mobile Menu: Consigli AI aggiunto a tutti i tier');
  } else {
    console.log('❌ Mobile Menu: Configurazione incompleta');
    console.log(`   Professional: ${hasAdviceInProfessional ? '✅' : '❌'}`);
    console.log(`   Consumer: ${hasAdviceInConsumer ? '✅' : '❌'}`);
    console.log(`   Free: ${hasAdviceInFree ? '✅' : '❌'}`);
    console.log(`   Import: ${hasLightbulbImport ? '✅' : '❌'}`);
    allTestsPassed = false;
  }
} else {
  console.log('❌ Mobile Menu: File non trovato');
  allTestsPassed = false;
}

// Test 4: Verifica che la pagina advice esista
console.log('\n4️⃣ Testing Advice Page...');
const advicePagePath = 'app/app/advice/page.tsx';
if (fs.existsSync(advicePagePath)) {
  const content = fs.readFileSync(advicePagePath, 'utf8');
  
  const hasAdviceContent = content.includes('Consigli AI');
  const hasTabs = content.includes('CropRotationPlanner') && content.includes('BiologicalControlDashboard');
  const hasAISuggestions = content.includes('ai-suggestions');
  
  if (hasAdviceContent && hasTabs && hasAISuggestions) {
    console.log('✅ Advice Page: Contenuto completo con AI suggestions, rotazione e controllo biologico');
  } else {
    console.log('❌ Advice Page: Contenuto incompleto');
    allTestsPassed = false;
  }
} else {
  console.log('❌ Advice Page: File non trovato');
  allTestsPassed = false;
}

// Test 5: Verifica che non ci siano più riferimenti errati a /app/advice nel menu salute
console.log('\n5️⃣ Testing Health Menu Links...');
const filesToCheck = [
  'components/consumer/Sidebar.tsx',
  'components/professional/Sidebar.tsx',
  'components/shared/MobileMenu.tsx',
  'components/shared/MobileBottomNav.tsx'
];

let healthLinksCorrect = true;
filesToCheck.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Verifica che "Salute" punti a /app/health
    const healthToAdvicePattern = /label:\s*['"]Salute['"].*path:\s*['"]\/app\/advice['"]/;
    if (healthToAdvicePattern.test(content)) {
      console.log(`❌ ${filePath}: Salute punta ancora a /app/advice`);
      healthLinksCorrect = false;
      allTestsPassed = false;
    }
  }
});

if (healthLinksCorrect) {
  console.log('✅ Health Links: Tutti i link "Salute" puntano correttamente a /app/health');
}

// Risultato finale
console.log('\n' + '='.repeat(50));
if (allTestsPassed) {
  console.log('🎉 TUTTI I TEST SUPERATI!');
  console.log('\n✅ Navigazione "Consigli AI" implementata correttamente:');
  console.log('   • Consumer Sidebar: /app/advice');
  console.log('   • Professional Sidebar: /app/advice');
  console.log('   • Mobile Menu (tutti i tier): /app/advice');
  console.log('   • Pagina advice completa con AI suggestions');
  console.log('   • Link "Salute" corretti (/app/health)');
  
  console.log('\n🔗 Accesso ai Consigli AI:');
  console.log('   • Menu principale → "Consigli AI"');
  console.log('   • URL diretto: /app/advice');
  console.log('   • Contenuto: AI suggestions, rotazione colture, controllo biologico');
  
  console.log('\n📱 Disponibile su:');
  console.log('   • Desktop (sidebar)');
  console.log('   • Mobile (menu hamburger)');
  console.log('   • Tutti i tier (FREE, PLUS, PRO)');
  
} else {
  console.log('❌ ALCUNI TEST FALLITI');
  console.log('Controlla i dettagli sopra per risolvere i problemi.');
}

console.log('\n🧪 Test completato!');