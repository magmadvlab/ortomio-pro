import { PlantMasterSheet, VarietyMapping, BehavioralTag, SpecificPlantInfo } from '../types';
import { plantMasterSheets, behavioralTags } from '../data/plantMasterSheets';
import { varietyMappings } from '../data/varietyMappings';
import { getAllSpecializedMasterSheets } from '../data/specializedCropMasterSheets';
import { getPlantTaxonomy, getPlantArchetype } from './plantTaxonomyService';
import { ArchetypeId } from '../types/archetypes';
import { normalizeToCanonical } from '../data/plantAliases';

// Cache semplice per getMasterSheetSync per evitare chiamate ripetute durante il rendering
const masterSheetCache = new Map<string, PlantMasterSheet | null>();

/**
 * Trova la scheda master per una specie (include anche colture specializzate)
 * Arricchita con archetypeId dalla taxonomy se disponibile
 */
export const getMasterSheet = async (speciesName: string): Promise<PlantMasterSheet | null> => {
  const normalized = speciesName.toLowerCase().trim();
  
  // Cerca prima nelle piante base
  const baseMatch = plantMasterSheets.find(sheet => 
    sheet.id === normalized ||
    sheet.commonName.toLowerCase().includes(normalized) ||
    sheet.scientificName.toLowerCase().includes(normalized) ||
    sheet.commonName.toLowerCase() === normalized
  );
  
  if (baseMatch) {
    // Arricchisci con archetypeId dalla taxonomy
    const archetypeId = await getPlantArchetype(normalized);
    if (archetypeId) {
      return { ...baseMatch, archetypeId } as PlantMasterSheet & { archetypeId?: ArchetypeId };
    }
    return baseMatch;
  }
  
  // Cerca nelle colture specializzate
  const specializedSheets = getAllSpecializedMasterSheets();
  const specializedMatch = specializedSheets.find(sheet => 
    sheet.id === normalized ||
    sheet.commonName.toLowerCase().includes(normalized) ||
    sheet.scientificName.toLowerCase().includes(normalized) ||
    sheet.commonName.toLowerCase() === normalized
  );
  
  if (specializedMatch) {
    // Arricchisci con archetypeId dalla taxonomy
    const archetypeId = await getPlantArchetype(normalized);
    if (archetypeId) {
      return { ...specializedMatch, archetypeId } as PlantMasterSheet & { archetypeId?: ArchetypeId };
    }
    return specializedMatch;
  }
  
  return null;
};

/**
 * Versione sincrona di getMasterSheet (per retrocompatibilità)
 * Non include archetypeId
 */
/**
 * Normalizza un nome di pianta per il matching (gestisce plurali/singolari italiani)
 */
const normalizePlantName = (name: string): string => {
  // Pulizia iniziale: rimuovi virgolette e spazi extra
  const normalized = name
    .toLowerCase()
    .trim()
    .replace(/^["']|["']$/g, '') // Rimuovi virgolette all'inizio e alla fine
    .replace(/["']/g, '') // Rimuovi tutte le virgolette rimanenti
    .trim();
  
  // Rimuovi plurali comuni italiani per normalizzare
  // -i -> (rimuovi -i)
  // -e -> (rimuovi -e) 
  // -a -> (rimuovi -a per nomi femminili plurali)
  let singular = normalized;
  
  // Gestisci plurali maschili (-i)
  if (singular.endsWith('i') && singular.length > 2) {
    singular = singular.slice(0, -1); // Rimuovi -i
  }
  // Gestisci plurali femminili (-e)
  else if (singular.endsWith('e') && singular.length > 2) {
    singular = singular.slice(0, -1) + 'a'; // Cambia -e in -a (singolare femminile)
  }
  
  return singular;
};

/**
 * Verifica se due nomi corrispondono (gestisce plurali/singolari)
 */
const matchesPlantName = (query: string, dbName: string): boolean => {
  const queryNorm = query.toLowerCase().trim();
  const dbNorm = dbName.toLowerCase().trim();
  
  // Match esatto
  if (queryNorm === dbNorm) return true;
  
  // Match bidirezionale con includes
  if (queryNorm.includes(dbNorm) || dbNorm.includes(queryNorm)) return true;
  
  // Match normalizzato (gestisce plurali)
  const querySingular = normalizePlantName(queryNorm);
  const dbSingular = normalizePlantName(dbNorm);
  
  if (querySingular === dbSingular) return true;
  if (querySingular.includes(dbSingular) || dbSingular.includes(querySingular)) return true;
  
  return false;
};

export const getMasterSheetSync = (speciesName: string): PlantMasterSheet | null => {
  // Debug: mostra valore originale
  if (speciesName && (speciesName.includes('\\') || speciesName.includes('"'))) {
    console.warn('[getMasterSheetSync] Input con virgolette/escape:', JSON.stringify(speciesName));
  }
  
  // Pulizia iniziale: rimuovi virgolette (incluse escape), spazi extra, e normalizza
  let normalized = String(speciesName || '')
    .toLowerCase()
    .trim()
    // Rimuovi tutti i backslash (gestisce \" e \')
    .replace(/\\/g, '')
    // Rimuovi virgolette all'inizio e alla fine (una o più)
    .replace(/^["']+|["']+$/g, '')
    // Rimuovi tutte le virgolette rimanenti
    .replace(/["']/g, '')
    .trim();
  
  // Debug: mostra valore dopo pulizia (solo in sviluppo)
  if (process.env.NODE_ENV === 'development' && normalized !== String(speciesName || '').toLowerCase().trim()) {
    console.debug('[getMasterSheetSync] Pulizia:', JSON.stringify(speciesName), '->', normalized);
  }
  
  // STEP 1: Normalizza sinonimi PRIMA di cercare
  const canonical = normalizeToCanonical(normalized);
  if (canonical !== normalized) {
    // Log informativo solo in sviluppo e solo per match esatti (non per varietà)
    // Evita log durante digitazione autocompletamento
    if (process.env.NODE_ENV === 'development' && normalized.split(/\s+/).length === 1) {
      console.debug('[getMasterSheetSync] [NORMALIZE]', normalized, '->', canonical);
    }
    normalized = canonical;
  }
  
  // Verifica cache prima di cercare
  if (masterSheetCache.has(normalized)) {
    return masterSheetCache.get(normalized) || null;
  }
  
  // DEBUG: Verifica che plantMasterSheets sia caricato (sempre visibile)
  if (!plantMasterSheets || plantMasterSheets.length === 0) {
    console.error('[getMasterSheetSync] ❌ plantMasterSheets è vuoto o non caricato!');
    masterSheetCache.set(normalized, null);
    return null;
  }
  
  // Log per debug solo in sviluppo e solo per prime chiamate (non dalla cache)
  if (process.env.NODE_ENV === 'development') {
    console.debug('[getMasterSheetSync] Searching for:', normalized);
  }
  
  // Cerca prima nelle piante base
  const baseMatch = plantMasterSheets.find(sheet => 
    sheet.id === normalized ||
    matchesPlantName(normalized, sheet.commonName) ||
    matchesPlantName(normalized, sheet.scientificName) ||
    sheet.commonName.toLowerCase().includes(normalized) ||
    sheet.scientificName.toLowerCase().includes(normalized)
  );
  
  if (baseMatch) {
    masterSheetCache.set(normalized, baseMatch);
    if (process.env.NODE_ENV === 'development') {
      console.debug('[getMasterSheetSync] ✅ Found:', baseMatch.commonName);
    }
    return baseMatch;
  }
  
  // Cerca nelle colture specializzate
  const specializedSheets = getAllSpecializedMasterSheets();
  const specializedMatch = specializedSheets.find(sheet => 
    sheet.id === normalized ||
    matchesPlantName(normalized, sheet.commonName) ||
    matchesPlantName(normalized, sheet.scientificName) ||
    sheet.commonName.toLowerCase().includes(normalized) ||
    sheet.scientificName.toLowerCase().includes(normalized)
  );
  
  if (specializedMatch) {
    masterSheetCache.set(normalized, specializedMatch);
    if (process.env.NODE_ENV === 'development') {
      console.debug('[getMasterSheetSync] ✅ Found specialized:', specializedMatch.commonName);
    }
    return specializedMatch;
  }
  
  // Salva null nella cache per evitare ricerche ripetute
  masterSheetCache.set(normalized, null);
  if (process.env.NODE_ENV === 'development') {
    console.warn('[getMasterSheetSync] ❌ Not found for:', normalized);
  }
  return null;
};

/**
 * Trova i tag comportamentali per una varietà
 */
export const getVarietyTags = (varietyName: string): BehavioralTag[] => {
  const normalizedVariety = varietyName.toLowerCase().trim();
  
  const mapping = varietyMappings.find(v => 
    v.varietyName.toLowerCase() === normalizedVariety ||
    v.varietyName.toLowerCase().includes(normalizedVariety) ||
    normalizedVariety.includes(v.varietyName.toLowerCase())
  );
  
  if (!mapping || !mapping.tags || mapping.tags.length === 0) {
    return [];
  }
  
  return behavioralTags.filter(tag => mapping.tags.includes(tag.id));
};

/**
 * Trova la specie da un nome varietà
 */
export const findSpeciesFromVariety = (varietyName: string): { speciesId: string; tags: string[] } | null => {
  const normalizedVariety = varietyName.toLowerCase().trim();
  
  const mapping = varietyMappings.find(v => 
    v.varietyName.toLowerCase() === normalizedVariety ||
    v.varietyName.toLowerCase().includes(normalizedVariety) ||
    normalizedVariety.includes(v.varietyName.toLowerCase())
  );
  
  if (!mapping) return null;
  
  return {
    speciesId: mapping.speciesId,
    tags: mapping.tags || []
  };
};

/**
 * Genera la guida completa combinando scheda master + tag
 * Versione asincrona con supporto archetypeId
 */
export const generateCompleteGuide = async (
  speciesName: string, 
  varietyName?: string
): Promise<{ 
  masterSheet: PlantMasterSheet; 
  tags: BehavioralTag[];
  additionalInstructions: string[];
} | null> => {
  const masterSheet = await getMasterSheet(speciesName);
  if (!masterSheet) return null;
  
  const tags = varietyName ? getVarietyTags(varietyName) : [];
  const additionalInstructions = tags.flatMap(tag => tag.additionalInstructions);
  
  return {
    masterSheet,
    tags,
    additionalInstructions
  };
};

/**
 * Versione sincrona di generateCompleteGuide (per retrocompatibilità)
 */
export const generateCompleteGuideSync = (
  speciesName: string, 
  varietyName?: string
): { 
  masterSheet: PlantMasterSheet; 
  tags: BehavioralTag[];
  additionalInstructions: string[];
} | null => {
  const masterSheet = getMasterSheetSync(speciesName);
  if (!masterSheet) return null;
  
  const tags = varietyName ? getVarietyTags(varietyName) : [];
  const additionalInstructions = tags.flatMap(tag => tag.additionalInstructions);
  
  return {
    masterSheet,
    tags,
    additionalInstructions
  };
};

/**
 * Cerca una varietà e restituisce informazioni complete (specie + tag)
 * Versione asincrona con supporto archetypeId
 */
export const getVarietyInfo = async (varietyName: string): Promise<{
  varietyName: string;
  speciesId: string;
  tags: BehavioralTag[];
  masterSheet: PlantMasterSheet | null;
} | null> => {
  const speciesInfo = findSpeciesFromVariety(varietyName);
  if (!speciesInfo) return null;
  
  const masterSheet = await getMasterSheet(speciesInfo.speciesId);
  const tags = getVarietyTags(varietyName);
  
  return {
    varietyName,
    speciesId: speciesInfo.speciesId,
    tags,
    masterSheet
  };
};

/**
 * Versione sincrona di getVarietyInfo (per retrocompatibilità)
 */
export const getVarietyInfoSync = (varietyName: string): {
  varietyName: string;
  speciesId: string;
  tags: BehavioralTag[];
  masterSheet: PlantMasterSheet | null;
} | null => {
  const speciesInfo = findSpeciesFromVariety(varietyName);
  if (!speciesInfo) return null;
  
  const masterSheet = getMasterSheetSync(speciesInfo.speciesId);
  const tags = getVarietyTags(varietyName);
  
  return {
    varietyName,
    speciesId: speciesInfo.speciesId,
    tags,
    masterSheet
  };
};

/**
 * Ottiene tutti i tag comportamentali disponibili
 */
export const getAllBehavioralTags = (): BehavioralTag[] => {
  return behavioralTags;
};

/**
 * Ottiene tutte le schede master disponibili (include anche colture specializzate)
 */
export const getAllMasterSheets = (): PlantMasterSheet[] => {
  return [
    ...plantMasterSheets,
    ...getAllSpecializedMasterSheets()
  ];
};

/**
 * Converte PlantMasterSheet in SpecificPlantInfo per uso locale
 * (senza bisogno di Gemini AI)
 */
export const convertMasterSheetToSpecificInfo = (
  masterSheet: PlantMasterSheet,
  varietyName?: string,
  lat?: number,
  lng?: number
): SpecificPlantInfo => {
  // Calcola stagione e finestre di semina/trapianto basate su data e posizione
  // Usa valori statici per evitare problemi di idratazione SSR
  // I valori dinamici verranno calcolati lato client quando necessario
  const monthNames = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 
                      'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
  
  // Calcola solo se siamo lato client, altrimenti usa valori di default
  let month = 'gennaio';
  let season = 'Inverno';
  
  if (typeof window !== 'undefined') {
    const today = new Date();
    const monthIndex = today.getMonth();
    month = monthNames[monthIndex];
    season = monthIndex >= 2 && monthIndex <= 4 ? 'Primavera' : 
             monthIndex >= 5 && monthIndex <= 7 ? 'Estate' :
             monthIndex >= 8 && monthIndex <= 10 ? 'Autunno' : 'Inverno';
  }
  
  // Costruisci finestre di semina/trapianto/raccolta dai dati master
  const seedSowingWindow = masterSheet.season === 'Spring' ? 
    'Febbraio-Marzo in semenzaio, Aprile all\'aperto' :
    masterSheet.season === 'Summer' ?
    'Marzo-Aprile in semenzaio, Maggio all\'aperto' :
    'Da calcolare in base alla stagione';
    
  const transplantWindow = masterSheet.transplanting?.when || 
    'Quando le temperature notturne sono stabili sopra i 10°C';
    
  const harvestWindow = typeof masterSheet.harvestWindow === 'string' 
    ? masterSheet.harvestWindow
    : masterSheet.harvestWindow 
      ? `Da calcolare in base alla varietà e stagione`
      : 'Da calcolare in base alla varietà e stagione';

  // Costruisci guide passo-passo dai dati master
  const sowingSteps = [
    `Passo 1: Prepara un contenitore con terriccio da semina fine`,
    `Passo 2: Semina a ${masterSheet.germination.sowingDepth}cm di profondità`,
    `Passo 3: ${masterSheet.germination.coveringNeeded ? 'Copri con pellicola trasparente' : 'Non coprire'}`,
    `Passo 4: Mantieni temperatura ${masterSheet.germination.idealTemp}`,
    `Passo 5: Innaffia delicatamente con nebulizzatore quando il terreno è asciutto`,
    `Passo 6: I germogli appariranno tra ${masterSheet.germination.emergenceDays.min} e ${masterSheet.germination.emergenceDays.max} giorni`
  ];

  const transplantSteps = [
    `Passo 1: Trapianta quando: ${masterSheet.seedlingCare.transplantWhen}`,
    `Passo 2: Prepara buca: ${masterSheet.transplanting.holeDepth}cm profonda, ${masterSheet.transplanting.holeWidth}cm larga`,
    `Passo 3: Distanza: ${masterSheet.transplanting.spacing}`,
    `Passo 4: Terreno: ${masterSheet.transplanting.soilRequirements}`,
    `Passo 5: Innaffia abbondantemente dopo il trapianto`
  ];

  const careTips = [
    `Innaffia: ${masterSheet.seedlingCare.watering}`,
    `Luce: ${masterSheet.seedlingCare.lightNeeds}`,
    `Temperatura: ${masterSheet.seedlingCare.temperature}`,
    `Controlla regolarmente per parassiti e malattie`,
    `Fertilizza ogni 3-4 settimane durante la crescita`,
    `Raccogli: ${masterSheet.baseInstructions.harvestGuide}`
  ];

  return {
    name: masterSheet.commonName,
    variety: varietyName || '',
    seedSowingWindow,
    transplantWindow,
    harvestWindow,
    notes: masterSheet.baseInstructions.introduction,
    masterSheetId: masterSheet.id,
    soil: {
      phMin: 6.0, // Default, può essere migliorato con dati specifici
      phMax: 7.0,
      typeDescription: masterSheet.transplanting?.soilRequirements || 'Terreno ben drenato'
    },
    harvest: {
      minBrix: 0,
      visualSigns: masterSheet.baseInstructions.harvestGuide || 'Raccogli quando maturo'
    },
    indoor: {
      lightHours: masterSheet.seedlingCare.lightHours || 14,
      germinationTemp: masterSheet.germination.idealTemp,
      daysToGerminate: `${masterSheet.germination.emergenceDays.min}-${masterSheet.germination.emergenceDays.max}`,
      transplantSize: masterSheet.seedlingCare.transplantWhen
    },
    irrigation: {
      frequency: masterSheet.irrigationDetails?.frequency?.vegetative || '2-3 volte a settimana',
      method: 'Alla base della pianta',
      tips: masterSheet.seedlingCare.watering
    },
    fertilizer: {
      organicType: 'Compost maturo',
      organicDosageGm2: 100,
      classicType: 'NPK bilanciato',
      classicDosageGm2: 50,
      timing: 'Alla semina e in fioritura'
    },
    guide: {
      introduction: masterSheet.baseInstructions.introduction,
      sowingSteps,
      transplantSteps,
      careTips,
      commonMistakes: masterSheet.baseInstructions.commonMistakes,
      harvestGuide: masterSheet.baseInstructions.harvestGuide
    }
  };
};





