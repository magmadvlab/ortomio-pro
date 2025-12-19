/**
 * Script per generare migrazione SQL per aggiornare plant_taxonomy e plant_synonyms
 * dal database locale TypeScript al database Supabase online
 */

import { writeFileSync } from 'fs';
import { join } from 'path';
import { plantMasterSheets } from '../data/plantMasterSheets';
import { getAllSpecializedMasterSheets } from '../data/specializedCropMasterSheets';
import { plantAliases } from '../data/plantAliases';
import { PlantMasterSheet } from '../types';

// Mappatura nutrientCategory → functional_category
const functionalCategoryMap: Record<string, string> = {
  'FRUITING': 'FRUIT',
  'LEAF': 'LEAF',
  'LEAFY': 'LEAF', // Variante comune
  'ROOT': 'ROOT',
  'AROMATIC': 'AROMATIC',
  'LEGUME': 'LEGUME',
};

// Mappatura famiglie botaniche non standard
const familyMapping: Record<string, string> = {
  'Asparagaceae': 'Amaryllidaceae', // Asparago → Amaryllidaceae
  'Caprifoliaceae': 'Asteraceae', // Valeriana → Asteraceae
  'Aizoaceae': 'Amaranthaceae', // Spinacio neozelandese → Amaranthaceae
  'Portulacaceae': 'Amaranthaceae', // Portulaca → Amaranthaceae
  'Convolvulaceae': 'Solanaceae', // Patata dolce → Solanaceae (simile)
};

// Mappatura automatica archetype_id basata su famiglia e categoria
const archetypeMapping: Record<string, Record<string, string>> = {
  'Solanaceae': { 'FRUIT': 'A1', 'ROOT': 'A1' },
  'Cucurbitaceae': { 'FRUIT': 'A2' },
  'Brassicaceae': { 'LEAF': 'A3', 'ROOT': 'A3' },
  'Fabaceae': { 'LEGUME': 'A4' },
  'Amaryllidaceae': { 'ROOT': 'A5' },
  'Apiaceae': { 'ROOT': 'A6', 'LEAF': 'A6', 'AROMATIC': 'A6' },
  'Asteraceae': { 'LEAF': 'A7' },
  'Amaranthaceae': { 'LEAF': 'A8', 'ROOT': 'A8' },
  'Lamiaceae': { 'AROMATIC': 'A9' },
  'Rosaceae': { 'SPECIALIZED': 'A10' }, // Drupacee e frutti di bosco
  'Rutaceae': { 'SPECIALIZED': 'A12' }, // Agrumi
  'Poaceae': { 'LEGUME': 'A4' }, // Cereali come legumi
  'Moraceae': { 'SPECIALIZED': 'A10' }, // Gelso
  'Rhamnaceae': { 'SPECIALIZED': 'A10' }, // Giuggiolo
  'Ericaceae': { 'SPECIALIZED': 'A10' }, // Corbezzolo, mirtillo
  'Myrtaceae': { 'SPECIALIZED': 'A10' }, // Mirto
  'Cornaceae': { 'SPECIALIZED': 'A10' }, // Corniolo
  'Adoxaceae': { 'SPECIALIZED': 'A10' }, // Sambuco
  'Grossulariaceae': { 'SPECIALIZED': 'A10' }, // Ribes, uva spina
  'Vitaceae': { 'SPECIALIZED': 'A11' }, // Vite
  'Oleaceae': { 'SPECIALIZED': 'A11' }, // Olivo
  'Caricaceae': { 'SPECIALIZED': 'A10' }, // Papaya
  'Anacardiaceae': { 'SPECIALIZED': 'A10' }, // Mango
  'Lauraceae': { 'SPECIALIZED': 'A10' }, // Avocado
  'Bromeliaceae': { 'SPECIALIZED': 'A10' }, // Ananas
  'Musaceae': { 'SPECIALIZED': 'A10' }, // Banano
};

// Famiglie botaniche da aggiungere se non esistono
const additionalFamilies: Record<string, string[]> = {
  'Ericaceae': ['Ericacee'],
  'Grossulariaceae': ['Grossulariacee'],
  'Moraceae': ['Moracee'],
  'Rhamnaceae': ['Rhamnacee'],
  'Myrtaceae': ['Mirtacee'],
  'Cornaceae': ['Cornacee'],
  'Adoxaceae': ['Adoxacee'],
  'Vitaceae': ['Vitacee'],
  'Oleaceae': ['Oleacee'],
  'Caricaceae': ['Caricacee'],
  'Anacardiaceae': ['Anacardiacee'],
  'Lauraceae': ['Lauracee'],
  'Bromeliaceae': ['Bromeliacee'],
  'Musaceae': ['Musacee'],
};

// Normalizza stringa per sinonimi (lowercase, rimuove accenti base)
function normalizeSynonym(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // Rimuove accenti
}

// Determina archetype_id in base a famiglia, categoria e cropType
function determineArchetype(
  family: string,
  functionalCategory: string,
  cropType?: string
): string {
  // Se è una coltura specializzata, usa SPECIALIZED
  if (cropType && ['FruitTree', 'Strawberry', 'Olive', 'Vine', 'ExoticFruit', 'Berry', 'Raspberry'].includes(cropType)) {
    // Mappature specifiche per colture specializzate
    if (family === 'Rutaceae') return 'A12'; // Agrumi
    if (family === 'Vitaceae') return 'A11'; // Vite
    if (family === 'Oleaceae') return 'A11'; // Olivo
    if (family === 'Rosaceae') {
      // Distingui tra drupacee (A10) e pomacee (A11)
      if (cropType === 'FruitTree') {
        // Verifica se è pomo o drupa dal treeType se disponibile
        return 'A10'; // Default drupacee
      }
      return 'A10'; // Fragole, lamponi, etc.
    }
    return 'A10'; // Default per altre colture specializzate
  }

  // Mappatura standard per ortaggi
  const familyMapping = archetypeMapping[family];
  if (familyMapping) {
    const categoryMapping = familyMapping[functionalCategory];
    if (categoryMapping) {
      return categoryMapping;
    }
    // Fallback: usa la prima categoria disponibile per la famiglia
    return Object.values(familyMapping)[0] || 'A1';
  }

  // Default fallback
  return 'A1';
}

// Determina tags in base a categoria e cropType
function determineTags(
  functionalCategory: string,
  cropType?: string,
  nutrientCategory?: string
): string[] {
  const tags: string[] = [];

  if (cropType) {
    if (['FruitTree', 'Strawberry', 'Olive', 'Vine', 'ExoticFruit', 'Berry', 'Raspberry'].includes(cropType)) {
      tags.push('frutteto');
    } else {
      tags.push('orto');
    }
  } else {
    tags.push('orto');
  }

  // Aggiungi tag stagionale se disponibile (da nutrientCategory o altri indicatori)
  if (functionalCategory === 'FRUIT' && !cropType) {
    tags.push('estivo');
  } else if (functionalCategory === 'LEAF' && !cropType) {
    tags.push('invernale');
  } else if (functionalCategory === 'ROOT' && !cropType) {
    tags.push('primaverile');
  }

  return tags;
}

// Genera nome JSONB per plant_taxonomy
function generateNames(commonName: string, scientificName?: string): string {
  const names: Record<string, string> = {
    it: commonName.charAt(0).toUpperCase() + commonName.slice(1).toLowerCase()
  };

  if (scientificName) {
    names.en = scientificName.split(' ')[0]; // Prima parola del nome scientifico come fallback
  }

  return JSON.stringify(names);
}

// Genera SQL per plant_families
function generateFamiliesSQL(): string {
  const families = new Set<string>();
  
  // Raccogli tutte le famiglie dai master sheets
  [...plantMasterSheets, ...getAllSpecializedMasterSheets()].forEach(sheet => {
    if (sheet.family) {
      families.add(sheet.family);
    }
  });

  const familyInserts = Array.from(families)
    .filter(family => additionalFamilies[family]) // Solo famiglie nuove
    .map(family => {
      const commonNames = additionalFamilies[family];
      return `  ('${family}', '${family}', ARRAY[${commonNames.map(n => `'${n}'`).join(', ')}])`;
    });

  if (familyInserts.length === 0) {
    return '-- Nessuna nuova famiglia botanica da aggiungere\n';
  }

  return `-- Nuove famiglie botaniche
INSERT INTO plant_families (id, name, common_names) VALUES
${familyInserts.join(',\n')}
ON CONFLICT (id) DO NOTHING;

`;
}

// Genera SQL per plant_taxonomy
function generateTaxonomySQL(): string {
  const allSheets = [...plantMasterSheets, ...getAllSpecializedMasterSheets()];
  const taxonomyInserts: string[] = [];

  for (const sheet of allSheets) {
    const plantId = sheet.id;
    const commonName = sheet.commonName || sheet.id;
    let family = sheet.family || 'Unknown';
    
    // Applica mappatura famiglie non standard
    if (familyMapping[family]) {
      family = familyMapping[family];
    }
    
    const nutrientCategory = (sheet as any).nutrientCategory || 'FRUITING';
    let functionalCategory = functionalCategoryMap[nutrientCategory] || 'FRUIT';
    
    // Se è una coltura specializzata, usa SPECIALIZED (ma NON per aromatiche)
    const cropType = (sheet as any).cropType;
    const isAromatic = functionalCategory === 'AROMATIC' || nutrientCategory === 'AROMATIC' || 
                       family === 'Lamiaceae' || (sheet as any).cropType === 'Aromatic';
    
    // Le aromatiche sono sempre AROMATIC, non SPECIALIZED
    if (isAromatic) {
      functionalCategory = 'AROMATIC';
    } else if (cropType && ['FruitTree', 'Strawberry', 'Olive', 'Vine', 'ExoticFruit', 'Berry', 'Raspberry'].includes(cropType)) {
      functionalCategory = 'SPECIALIZED';
    }
    
    const finalFunctionalCategory = functionalCategory;
    
    const archetypeId = determineArchetype(family, finalFunctionalCategory, cropType);
    const tags = determineTags(finalFunctionalCategory, cropType, nutrientCategory);
    const names = generateNames(commonName, sheet.scientificName);

    taxonomyInserts.push(
      `  ('${plantId}', '${names.replace(/'/g, "''")}'::jsonb, '${family}', '${archetypeId}', '${finalFunctionalCategory}', ARRAY[${tags.map(t => `'${t}'`).join(', ')}])`
    );
  }

  return `-- Aggiornamento plant_taxonomy
INSERT INTO plant_taxonomy (plant_id, names, family_id, archetype_id, functional_category, tags) VALUES
${taxonomyInserts.join(',\n')}
ON CONFLICT (plant_id) DO UPDATE SET
  names = EXCLUDED.names,
  family_id = EXCLUDED.family_id,
  archetype_id = EXCLUDED.archetype_id,
  functional_category = EXCLUDED.functional_category,
  tags = EXCLUDED.tags,
  updated_at = NOW();

`;
}

// Genera SQL per plant_synonyms
function generateSynonymsSQL(): string {
  const synonymInserts: string[] = [];

  // Processa plantAliases
  for (const aliasGroup of plantAliases) {
    const canonical = aliasGroup.canonical;
    
    for (const alias of aliasGroup.aliases) {
      const normalized = normalizeSynonym(alias);
      synonymInserts.push(
        `  ('${alias.replace(/'/g, "''")}', '${normalized.replace(/'/g, "''")}', '${canonical}', 'it', 1.0, 'system')`
      );
    }
  }

  // Aggiungi plurali comuni per tutte le piante
  const allSheets = [...plantMasterSheets, ...getAllSpecializedMasterSheets()];
  const processedPlurals = new Set<string>();

  for (const sheet of allSheets) {
    const plantId = sheet.id;
    const commonName = (sheet.commonName || sheet.id).toLowerCase();
    
    // Genera plurali comuni italiani
    let plural = '';
    if (commonName.endsWith('o')) {
      plural = commonName.slice(0, -1) + 'i';
    } else if (commonName.endsWith('a')) {
      plural = commonName.slice(0, -1) + 'e';
    } else if (commonName.endsWith('e')) {
      plural = commonName + 'i';
    }

    if (plural && plural !== plantId && !processedPlurals.has(`${plural}-${plantId}`)) {
      const normalized = normalizeSynonym(plural);
      synonymInserts.push(
        `  ('${plural.replace(/'/g, "''")}', '${normalized.replace(/'/g, "''")}', '${plantId}', 'it', 1.0, 'system')`
      );
      processedPlurals.add(`${plural}-${plantId}`);
    }
  }

  if (synonymInserts.length === 0) {
    return '-- Nessun sinonimo da aggiungere\n';
  }

  return `-- Inserimento sinonimi
INSERT INTO plant_synonyms (synonym, normalized_synonym, plant_id, locale, confidence, source) VALUES
${synonymInserts.join(',\n')}
ON CONFLICT (synonym, locale) DO NOTHING;

`;
}

// Funzione principale
function generateMigration(): void {
  console.log('🌱 Generazione migrazione SQL per plant_taxonomy...\n');

  const sqlParts: string[] = [
    '-- ============================================',
    '-- MIGRAZIONE: Aggiornamento plant_taxonomy e plant_synonyms',
    '-- Generato automaticamente da generatePlantTaxonomyMigration.ts',
    `-- Data: ${new Date().toISOString()}`,
    '-- ============================================\n',
    generateFamiliesSQL(),
    generateTaxonomySQL(),
    generateSynonymsSQL(),
  ];

  const sql = sqlParts.join('\n');
  const outputPath = join(process.cwd(), 'database', 'migrations', 'update_plant_taxonomy_from_local.sql');
  
  writeFileSync(outputPath, sql, 'utf-8');
  
  console.log(`✅ Migrazione SQL generata con successo!`);
  console.log(`📁 File: ${outputPath}`);
  console.log(`\n📊 Statistiche:`);
  console.log(`   - Piante totali: ${[...plantMasterSheets, ...getAllSpecializedMasterSheets()].length}`);
  console.log(`   - Sinonimi totali: ${plantAliases.reduce((sum, a) => sum + a.aliases.length, 0)}`);
  console.log(`\n⚠️  IMPORTANTE: Verifica il file SQL prima di applicarlo al database online!`);
}

// Esegui
generateMigration();

