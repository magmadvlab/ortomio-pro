#!/usr/bin/env node

/**
 * Script per analizzare e confrontare le pagine tra vecchia e nuova app
 */

const fs = require('fs');
const path = require('path');

const NEW_APP_DIR = 'app/app';
const OLD_APP_DIR = 'vcchiortomio/vecchia app/app/(dashboard)/app';

// Funzione per ottenere tutte le pagine in una directory
function getPages(dir, basePath = '') {
  const pages = [];
  
  try {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const item of items) {
      if (item.name.startsWith('.')) continue;
      
      const fullPath = path.join(dir, item.name);
      const relativePath = path.join(basePath, item.name);
      
      if (item.isDirectory()) {
        // Cerca page.tsx nella directory
        const pagePath = path.join(fullPath, 'page.tsx');
        if (fs.existsSync(pagePath)) {
          pages.push({
            route: '/' + relativePath.replace(/\\/g, '/'),
            path: pagePath,
            exists: true
          });
        }
        
        // Ricorsione nelle sottodirectory
        pages.push(...getPages(fullPath, relativePath));
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }
  
  return pages;
}

// Funzione per leggere il contenuto di un file
function readFileContent(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    return null;
  }
}

// Funzione per analizzare i componenti importati
function analyzeImports(content) {
  if (!content) return [];
  
  const importRegex = /import\s+(?:{[^}]+}|[^from]+)\s+from\s+['"]([^'"]+)['"]/g;
  const imports = [];
  let match;
  
  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }
  
  return imports;
}

// Funzione per contare le linee di codice
function countLines(content) {
  if (!content) return 0;
  return content.split('\n').length;
}

// Funzione per estrarre i componenti principali
function extractMainComponents(content) {
  if (!content) return [];
  
  const componentRegex = /<([A-Z][a-zA-Z0-9]*)/g;
  const components = new Set();
  let match;
  
  while ((match = componentRegex.exec(content)) !== null) {
    components.add(match[1]);
  }
  
  return Array.from(components);
}

console.log('🔍 Analisi Pagine: Vecchia App vs Nuova App\n');
console.log('='.repeat(80));

// Ottieni tutte le pagine
const newPages = getPages(NEW_APP_DIR);
const oldPages = getPages(OLD_APP_DIR);

console.log(`\n📊 Statistiche Generali:`);
console.log(`   Nuova App: ${newPages.length} pagine`);
console.log(`   Vecchia App: ${oldPages.length} pagine`);

// Crea mappa delle pagine per confronto
const newPagesMap = new Map(newPages.map(p => [p.route, p]));
const oldPagesMap = new Map(oldPages.map(p => [p.route, p]));

// Pagine solo nella nuova app
const onlyInNew = newPages.filter(p => !oldPagesMap.has(p.route));
console.log(`\n✅ Pagine SOLO nella Nuova App: ${onlyInNew.length}`);
onlyInNew.forEach(p => console.log(`   - ${p.route}`));

// Pagine solo nella vecchia app
const onlyInOld = oldPages.filter(p => !newPagesMap.has(p.route));
console.log(`\n⚠️  Pagine SOLO nella Vecchia App: ${onlyInOld.length}`);
onlyInOld.forEach(p => console.log(`   - ${p.route}`));

// Pagine in entrambe
const inBoth = newPages.filter(p => oldPagesMap.has(p.route));
console.log(`\n🔄 Pagine in ENTRAMBE le App: ${inBoth.length}`);

// Analisi dettagliata delle pagine comuni
console.log(`\n${'='.repeat(80)}`);
console.log('📋 ANALISI DETTAGLIATA PAGINE COMUNI\n');

const analysis = [];

for (const newPage of inBoth) {
  const oldPage = oldPagesMap.get(newPage.route);
  
  const newContent = readFileContent(newPage.path);
  const oldContent = readFileContent(oldPage.path);
  
  const newLines = countLines(newContent);
  const oldLines = countLines(oldContent);
  
  const newImports = analyzeImports(newContent);
  const oldImports = analyzeImports(oldContent);
  
  const newComponents = extractMainComponents(newContent);
  const oldComponents = extractMainComponents(oldContent);
  
  analysis.push({
    route: newPage.route,
    newLines,
    oldLines,
    linesDiff: newLines - oldLines,
    newImports: newImports.length,
    oldImports: oldImports.length,
    newComponents,
    oldComponents,
    identical: newContent === oldContent
  });
}

// Ordina per differenza di linee
analysis.sort((a, b) => Math.abs(b.linesDiff) - Math.abs(a.linesDiff));

// Mostra top 10 pagine con maggiori differenze
console.log('🔝 Top 10 Pagine con Maggiori Differenze:\n');
analysis.slice(0, 10).forEach((item, index) => {
  console.log(`${index + 1}. ${item.route}`);
  console.log(`   Linee: ${item.oldLines} (vecchia) → ${item.newLines} (nuova) [${item.linesDiff > 0 ? '+' : ''}${item.linesDiff}]`);
  console.log(`   Import: ${item.oldImports} → ${item.newImports}`);
  console.log(`   Componenti: ${item.oldComponents.length} → ${item.newComponents.length}`);
  console.log('');
});

// Pagine identiche
const identical = analysis.filter(a => a.identical);
console.log(`\n✨ Pagine Identiche: ${identical.length}`);
identical.forEach(p => console.log(`   - ${p.route}`));

// Salva report completo in JSON
const report = {
  timestamp: new Date().toISOString(),
  summary: {
    newAppPages: newPages.length,
    oldAppPages: oldPages.length,
    onlyInNew: onlyInNew.length,
    onlyInOld: onlyInOld.length,
    inBoth: inBoth.length,
    identical: identical.length
  },
  onlyInNew: onlyInNew.map(p => p.route),
  onlyInOld: onlyInOld.map(p => p.route),
  detailedAnalysis: analysis
};

fs.writeFileSync('pages-comparison-report.json', JSON.stringify(report, null, 2));
console.log(`\n💾 Report completo salvato in: pages-comparison-report.json`);

console.log(`\n${'='.repeat(80)}`);
console.log('✅ Analisi completata!\n');
