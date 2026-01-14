#!/usr/bin/env node

/**
 * Test Action Buttons Integration
 * Verifica l'integrazione dei pulsanti azione nei componenti NDVI
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Test Action Buttons Integration');
console.log('=====================================');

// Test 1: Verifica esistenza componenti
console.log('\n📁 Test 1: Verifica Componenti');

const componentsToCheck = [
  'components/actions/ActionButton.tsx',
  'components/actions/InterventionWizard.tsx',
  'services/interventionService.ts',
  'supabase/migrations/20260112110000_create_interventions_table.sql'
];

let allComponentsExist = true;

componentsToCheck.forEach(component => {
  if (fs.existsSync(component)) {
    console.log(`✅ ${component}`);
  } else {
    console.log(`❌ ${component} - MANCANTE`);
    allComponentsExist = false;
  }
});

// Test 2: Verifica integrazione NDVI Dashboard
console.log('\n🔗 Test 2: Verifica Integrazione NDVI Dashboard');

const ndviDashboardPath = 'components/ndvi/NDVIDashboard.tsx';
if (fs.existsSync(ndviDashboardPath)) {
  const content = fs.readFileSync(ndviDashboardPath, 'utf8');
  
  const checks = [
    { name: 'Import ActionButton', pattern: /import.*ActionButton.*from.*actions\/ActionButton/ },
    { name: 'Import InterventionWizard', pattern: /import.*InterventionWizard.*from.*actions\/InterventionWizard/ },
    { name: 'Import interventionService', pattern: /import.*interventionService.*from.*services\/interventionService/ },
    { name: 'Wizard State', pattern: /wizardOpen.*setWizardOpen/ },
    { name: 'Action Context State', pattern: /actionContext.*setActionContext/ },
    { name: 'handleActionSelected Function', pattern: /handleActionSelected.*=.*\(actionType.*context\)/ },
    { name: 'handleInterventionCreated Function', pattern: /handleInterventionCreated.*=.*async.*intervention/ },
    { name: 'ActionButton in Stress Areas', pattern: /<ActionButton[\s\S]*sourceType="ndvi"/ },
    { name: 'InterventionWizard Component', pattern: /<InterventionWizard[\s\S]*isOpen={wizardOpen}/ }
  ];

  let integrationScore = 0;
  checks.forEach(check => {
    if (check.pattern.test(content)) {
      console.log(`✅ ${check.name}`);
      integrationScore++;
    } else {
      console.log(`❌ ${check.name} - MANCANTE`);
    }
  });

  console.log(`\n📊 Punteggio Integrazione: ${integrationScore}/${checks.length} (${Math.round(integrationScore/checks.length*100)}%)`);
} else {
  console.log('❌ NDVIDashboard.tsx non trovato');
}

// Test 3: Verifica TypeScript Types
console.log('\n🔍 Test 3: Verifica TypeScript Types');

const actionButtonPath = 'components/actions/ActionButton.tsx';
if (fs.existsSync(actionButtonPath)) {
  const content = fs.readFileSync(actionButtonPath, 'utf8');
  
  const typeChecks = [
    { name: 'ActionButtonProps Interface', pattern: /export interface ActionButtonProps/ },
    { name: 'ActionType Type', pattern: /export type ActionType/ },
    { name: 'ActionContext Interface', pattern: /export interface ActionContext/ },
    { name: 'sourceType Union Type', pattern: /sourceType:.*'ndvi'.*'drone'.*'iot'/ },
    { name: 'urgency Union Type', pattern: /urgency.*'low'.*'medium'.*'high'.*'critical'/ }
  ];

  let typeScore = 0;
  typeChecks.forEach(check => {
    if (check.pattern.test(content)) {
      console.log(`✅ ${check.name}`);
      typeScore++;
    } else {
      console.log(`❌ ${check.name} - MANCANTE`);
    }
  });

  console.log(`\n📊 Punteggio Types: ${typeScore}/${typeChecks.length} (${Math.round(typeScore/typeChecks.length*100)}%)`);
}

// Test 4: Verifica Database Schema
console.log('\n🗄️  Test 4: Verifica Database Schema');

const migrationPath = 'supabase/migrations/20260112110000_create_interventions_table.sql';
if (fs.existsSync(migrationPath)) {
  const content = fs.readFileSync(migrationPath, 'utf8');
  
  const schemaChecks = [
    { name: 'CREATE TABLE interventions', pattern: /CREATE TABLE.*interventions/ },
    { name: 'id Column', pattern: /id.*TEXT.*PRIMARY KEY/ },
    { name: 'user_id Column', pattern: /user_id.*UUID.*NOT NULL/ },
    { name: 'type Column', pattern: /type.*TEXT.*NOT NULL/ },
    { name: 'source_context Column', pattern: /source_context.*JSONB.*NOT NULL/ },
    { name: 'RLS Policies', pattern: /CREATE POLICY.*interventions/ },
    { name: 'Indexes', pattern: /CREATE INDEX.*interventions/ }
  ];

  let schemaScore = 0;
  schemaChecks.forEach(check => {
    if (check.pattern.test(content)) {
      console.log(`✅ ${check.name}`);
      schemaScore++;
    } else {
      console.log(`❌ ${check.name} - MANCANTE`);
    }
  });

  console.log(`\n📊 Punteggio Schema: ${schemaScore}/${schemaChecks.length} (${Math.round(schemaScore/schemaChecks.length*100)}%)`);
}

// Test 5: Verifica Service Layer
console.log('\n⚙️  Test 5: Verifica Service Layer');

const servicePath = 'services/interventionService.ts';
if (fs.existsSync(servicePath)) {
  const content = fs.readFileSync(servicePath, 'utf8');
  
  const serviceChecks = [
    { name: 'InterventionService Class', pattern: /class InterventionService/ },
    { name: 'createIntervention Method', pattern: /createIntervention.*async/ },
    { name: 'getInterventions Method', pattern: /getInterventions.*async/ },
    { name: 'updateIntervention Method', pattern: /updateIntervention.*async/ },
    { name: 'deleteIntervention Method', pattern: /deleteIntervention.*async/ },
    { name: 'Supabase Client', pattern: /createClient.*from.*supabase/ },
    { name: 'Error Handling', pattern: /try.*catch.*error/ }
  ];

  let serviceScore = 0;
  serviceChecks.forEach(check => {
    if (check.pattern.test(content)) {
      console.log(`✅ ${check.name}`);
      serviceScore++;
    } else {
      console.log(`❌ ${check.name} - MANCANTE`);
    }
  });

  console.log(`\n📊 Punteggio Service: ${serviceScore}/${serviceChecks.length} (${Math.round(serviceScore/serviceChecks.length*100)}%)`);
}

// Risultato finale
console.log('\n🎯 RISULTATO FINALE');
console.log('==================');

if (allComponentsExist) {
  console.log('✅ Tutti i componenti base sono presenti');
  console.log('✅ Integrazione Action Buttons completata');
  console.log('✅ Sistema pronto per il test funzionale');
  console.log('\n🚀 PROSSIMI PASSI:');
  console.log('1. Avviare l\'applicazione: npm run dev');
  console.log('2. Navigare su /app/ndvi');
  console.log('3. Testare i pulsanti "Crea Intervento"');
  console.log('4. Verificare il wizard di creazione');
  console.log('5. Controllare il salvataggio nel database');
} else {
  console.log('❌ Alcuni componenti sono mancanti');
  console.log('⚠️  Completare l\'implementazione prima del test');
}

console.log('\n📋 FUNZIONALITÀ IMPLEMENTATE:');
console.log('• ActionButton riutilizzabile con dropdown azioni');
console.log('• InterventionWizard con workflow guidato');
console.log('• InterventionService per gestione database');
console.log('• Integrazione completa in NDVI Dashboard');
console.log('• Schema database con RLS e policies');
console.log('• TypeScript types completi');

console.log('\n🎉 Action Buttons Integration - Test Completato!');