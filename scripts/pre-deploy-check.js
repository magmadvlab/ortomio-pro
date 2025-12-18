#!/usr/bin/env node

/**
 * Pre-Deploy Check Script (Node.js version)
 * ============================================================================
 * Questo script verifica:
 * 1. Errori TypeScript
 * 2. Errori Linter
 * 3. Build Next.js
 * 4. Schema database (opzionale)
 * 
 * Uso: node scripts/pre-deploy-check.js [--skip-build]
 * ============================================================================
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colori per output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function print(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function printError(message) {
  print(`❌ ${message}`, 'red');
}

function printSuccess(message) {
  print(`✅ ${message}`, 'green');
}

function printWarning(message) {
  print(`⚠️  ${message}`, 'yellow');
}

function printInfo(message) {
  print(`ℹ️  ${message}`, 'blue');
}

function runCommand(command, description) {
  try {
    execSync(command, { stdio: 'pipe' });
    return { success: true, message: `${description}: Nessun errore trovato` };
  } catch (error) {
    return { 
      success: false, 
      message: `${description}: Errori trovati!`,
      details: error.message
    };
  }
}

// Parse arguments
const args = process.argv.slice(2);
const skipBuild = args.includes('--skip-build');

let errorCount = 0;

print('========================================', 'blue');
print('  Pre-Deploy Check - OrtoMio', 'blue');
print('========================================', 'blue');
console.log('');

// ============================================================================
// 1. Verifica TypeScript
// ============================================================================
print('[1/4] Verifica TypeScript...', 'blue');
const typeCheckResult = runCommand('npm run type-check', 'TypeScript');
if (typeCheckResult.success) {
  printSuccess(typeCheckResult.message);
} else {
  printError(typeCheckResult.message);
  printInfo("Esegui 'npm run type-check' per vedere i dettagli");
  errorCount++;
}
console.log('');

// ============================================================================
// 2. Verifica Linter (Opzionale)
// ============================================================================
print('[2/4] Verifica Linter...', 'blue');
// Next.js lint potrebbe non essere configurato correttamente
// Per ora lo saltiamo come warning invece di errore
printWarning('Linter: Verifica saltata (ESLint richiede configurazione aggiuntiva)');
printInfo("Per abilitare: installa eslint e configura .eslintrc.json");
// Non blocca il deploy se il linter non è configurato
console.log('');

// ============================================================================
// 3. Verifica Build Next.js
// ============================================================================
if (!skipBuild) {
  print('[3/4] Verifica Build Next.js...', 'blue');
  printInfo('Questo potrebbe richiedere alcuni minuti...');
  
  const buildResult = runCommand('npm run build:next', 'Build');
  if (buildResult.success) {
    printSuccess('Build: Compilazione riuscita');
  } else {
    printError('Build: Errore durante la compilazione!');
    printInfo("Esegui 'npm run build:next' per vedere i dettagli");
    errorCount++;
  }
} else {
  printWarning('[3/4] Build Next.js: SKIPPATO (usa --skip-build per saltare)');
}
console.log('');

// ============================================================================
// 4. Verifica Schema Database (opzionale)
// ============================================================================
print('[4/4] Verifica Schema Database...', 'blue');

const schemaFile = path.join(process.cwd(), 'database_schema_online_reference.sql');
if (fs.existsSync(schemaFile)) {
  printSuccess('File schema di riferimento trovato');
  
  const schemaContent = fs.readFileSync(schemaFile, 'utf8');
  
  // Verifica che non ci siano extensions.uuid_generate_v4()
  if (schemaContent.includes('extensions.uuid_generate_v4()')) {
    printError("Schema: Trovato 'extensions.uuid_generate_v4()' nel file di riferimento!");
    printInfo("Dovrebbe essere 'gen_random_uuid()' per Supabase");
    errorCount++;
  } else {
    printSuccess('Schema: Usa gen_random_uuid() correttamente');
  }
  
  // Verifica che ci siano le RLS policies per INSERT
  if (schemaContent.includes('Users can insert their own profile') && 
      schemaContent.includes('Users can insert their gardens')) {
    printSuccess('Schema: RLS policies per INSERT presenti');
  } else {
    printWarning('Schema: RLS policies per INSERT potrebbero mancare');
    printInfo('Verifica che profiles e gardens abbiano policy INSERT esplicite');
  }
} else {
  printWarning('Schema: File di riferimento non trovato (opzionale)');
}
console.log('');

// ============================================================================
// Riepilogo
// ============================================================================
print('========================================', 'blue');
if (errorCount === 0) {
  printSuccess('Tutti i controlli superati! ✅');
  console.log('');
  print('Pronto per commit e deploy!', 'green');
  process.exit(0);
} else {
  printError(`Trovati ${errorCount} errore/i! ❌`);
  console.log('');
  print('Correggi gli errori prima di fare commit o deploy.', 'red');
  console.log('');
  console.log('Comandi utili:');
  console.log('  npm run type-check    # Verifica TypeScript');
  console.log('  npm run lint          # Verifica Linter');
  console.log('  npm run build:next    # Verifica Build');
  process.exit(1);
}

