#!/usr/bin/env node

/**
 * Pre-Deploy Check Script (Node.js version)
 * ============================================================================
 * Questo script verifica:
 * 1. Errori TypeScript
 * 2. Suite release
 * 3. Build Next.js
 * 4. Gate readiness locale
 * 5. Igiene documentale
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
print('[1/5] Verifica TypeScript...', 'blue');
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
// 2. Suite release
// ============================================================================
print('[2/5] Suite release...', 'blue');
const testResult = runCommand('npm run test:release', 'Test release');
if (testResult.success) printSuccess(testResult.message);
else { printError(testResult.message); errorCount++; }
console.log('');

// ============================================================================
// 3. Verifica Build Next.js
// ============================================================================
if (!skipBuild) {
  print('[3/5] Verifica Build Next.js...', 'blue');
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
  printWarning('[3/5] Build Next.js: SKIPPATO (usa --skip-build per saltare)');
}
console.log('');

// ============================================================================
// 4. Gate readiness locale
// ============================================================================
print('[4/5] Gate readiness locale...', 'blue');
const readinessResult = runCommand('npm run release:check', 'Release readiness');
if (readinessResult.success) printSuccess(readinessResult.message);
else { printError(readinessResult.message); errorCount++; }
console.log('');

// ============================================================================
// 5. Igiene documentale
// ============================================================================
print('[5/5] Igiene documentale...', 'blue');
const docsResult = runCommand('npm run docs:hygiene', 'Documentazione');
if (docsResult.success) printSuccess(docsResult.message);
else { printError(docsResult.message); errorCount++; }
console.log('');

// ============================================================================
// Riepilogo
// ============================================================================
print('========================================', 'blue');
if (errorCount === 0) {
  printSuccess('Tutti i controlli superati! ✅');
  console.log('');
  print('Baseline locale pronta; il deploy richiede anche i gate remoti.', 'green');
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
