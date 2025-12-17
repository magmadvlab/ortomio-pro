/**
 * Database aliases predefiniti per vitigni italiani e cultivar olivo
 * Tutti gli aliases mappano agli archetypes L1 (Vite) o L2 (Olivo)
 * Il defaultVarietyType suggerisce l'obiettivo principale (vino/tavola, olio/mensa)
 */

import { CropAlias } from '../types/archetypes';

export const vineOliveAliases: Array<Omit<CropAlias, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>> = [
  // ========================================
  // VITI (L1) - Generici
  // ========================================
  { aliasText: 'uva', archetypeId: 'L1', confidence: 0.6 },
  { aliasText: 'vite', archetypeId: 'L1', confidence: 0.9 },
  { aliasText: 'vite da vino', archetypeId: 'L1', confidence: 0.9, defaultVarietyType: 'Wine' },
  { aliasText: 'vite da tavola', archetypeId: 'L1', confidence: 0.9, defaultVarietyType: 'Table' },
  { aliasText: 'vigneto', archetypeId: 'L1', confidence: 0.8 },
  
  // ========================================
  // VITI (L1) - Vitigni Rossi Italiani
  // ========================================
  { aliasText: 'aglianico', archetypeId: 'L1', confidence: 0.9, defaultVarietyType: 'Wine' },
  { aliasText: 'primitivo', archetypeId: 'L1', confidence: 0.9, defaultVarietyType: 'Wine' },
  { aliasText: 'negroamaro', archetypeId: 'L1', confidence: 0.9, defaultVarietyType: 'Wine' },
  { aliasText: 'nero davola', archetypeId: 'L1', confidence: 0.9, defaultVarietyType: 'Wine' },
  { aliasText: 'nero d avola', archetypeId: 'L1', confidence: 0.9, defaultVarietyType: 'Wine' },
  { aliasText: 'sangiovese', archetypeId: 'L1', confidence: 0.8, defaultVarietyType: 'Wine' },
  { aliasText: 'montepulciano', archetypeId: 'L1', confidence: 0.8, defaultVarietyType: 'Wine' },
  { aliasText: 'barbera', archetypeId: 'L1', confidence: 0.8, defaultVarietyType: 'Wine' },
  { aliasText: 'dolcetto', archetypeId: 'L1', confidence: 0.7, defaultVarietyType: 'Wine' },
  { aliasText: 'nebbiolo', archetypeId: 'L1', confidence: 0.8, defaultVarietyType: 'Wine' },
  { aliasText: 'corvina', archetypeId: 'L1', confidence: 0.7, defaultVarietyType: 'Wine' },
  { aliasText: 'refosco', archetypeId: 'L1', confidence: 0.7, defaultVarietyType: 'Wine' },
  { aliasText: 'lagrein', archetypeId: 'L1', confidence: 0.7, defaultVarietyType: 'Wine' },
  { aliasText: 'teroldego', archetypeId: 'L1', confidence: 0.7, defaultVarietyType: 'Wine' },
  { aliasText: 'schiava', archetypeId: 'L1', confidence: 0.6, defaultVarietyType: 'Wine' },
  
  // ========================================
  // VITI (L1) - Vitigni Bianchi Italiani
  // ========================================
  { aliasText: 'fiano', archetypeId: 'L1', confidence: 0.8, defaultVarietyType: 'Wine' },
  { aliasText: 'greco', archetypeId: 'L1', confidence: 0.7, defaultVarietyType: 'Wine' },
  { aliasText: 'greco di tufo', archetypeId: 'L1', confidence: 0.8, defaultVarietyType: 'Wine' },
  { aliasText: 'falanghina', archetypeId: 'L1', confidence: 0.7, defaultVarietyType: 'Wine' },
  { aliasText: 'cataratto', archetypeId: 'L1', confidence: 0.7, defaultVarietyType: 'Wine' },
  { aliasText: 'grillo', archetypeId: 'L1', confidence: 0.7, defaultVarietyType: 'Wine' },
  { aliasText: 'inzolia', archetypeId: 'L1', confidence: 0.7, defaultVarietyType: 'Wine' },
  { aliasText: 'vermentino', archetypeId: 'L1', confidence: 0.7, defaultVarietyType: 'Wine' },
  { aliasText: 'trebbiano', archetypeId: 'L1', confidence: 0.7, defaultVarietyType: 'Wine' },
  { aliasText: 'garganega', archetypeId: 'L1', confidence: 0.7, defaultVarietyType: 'Wine' },
  { aliasText: 'cortese', archetypeId: 'L1', confidence: 0.6, defaultVarietyType: 'Wine' },
  { aliasText: 'arnels', archetypeId: 'L1', confidence: 0.6, defaultVarietyType: 'Wine' },
  { aliasText: 'ribolla gialla', archetypeId: 'L1', confidence: 0.7, defaultVarietyType: 'Wine' },
  { aliasText: 'pinot grigio', archetypeId: 'L1', confidence: 0.8, defaultVarietyType: 'Wine' },
  { aliasText: 'pinot bianco', archetypeId: 'L1', confidence: 0.7, defaultVarietyType: 'Wine' },
  
  // ========================================
  // VITI (L1) - Vitigni Internazionali
  // ========================================
  { aliasText: 'syrah', archetypeId: 'L1', confidence: 0.8, defaultVarietyType: 'Wine' },
  { aliasText: 'cabernet sauvignon', archetypeId: 'L1', confidence: 0.8, defaultVarietyType: 'Wine' },
  { aliasText: 'merlot', archetypeId: 'L1', confidence: 0.8, defaultVarietyType: 'Wine' },
  { aliasText: 'chardonnay', archetypeId: 'L1', confidence: 0.8, defaultVarietyType: 'Wine' },
  { aliasText: 'pinot nero', archetypeId: 'L1', confidence: 0.8, defaultVarietyType: 'Wine' },
  { aliasText: 'pinot noir', archetypeId: 'L1', confidence: 0.8, defaultVarietyType: 'Wine' },
  { aliasText: 'sauvignon blanc', archetypeId: 'L1', confidence: 0.7, defaultVarietyType: 'Wine' },
  { aliasText: 'riesling', archetypeId: 'L1', confidence: 0.7, defaultVarietyType: 'Wine' },
  
  // ========================================
  // VITI (L1) - Uve da Tavola
  // ========================================
  { aliasText: 'italia', archetypeId: 'L1', confidence: 0.7, defaultVarietyType: 'Table' },
  { aliasText: 'red globe', archetypeId: 'L1', confidence: 0.7, defaultVarietyType: 'Table' },
  { aliasText: 'victoria', archetypeId: 'L1', confidence: 0.6, defaultVarietyType: 'Table' },
  { aliasText: 'uva fragola', archetypeId: 'L1', confidence: 0.7, defaultVarietyType: 'Table' },
  { aliasText: 'uva regina', archetypeId: 'L1', confidence: 0.6, defaultVarietyType: 'Table' },
  { aliasText: 'uva apirena', archetypeId: 'L1', confidence: 0.6, defaultVarietyType: 'Table' },
  
  // ========================================
  // OLIVI (L2) - Generici
  // ========================================
  { aliasText: 'ulivo', archetypeId: 'L2', confidence: 0.9 },
  { aliasText: 'olivo', archetypeId: 'L2', confidence: 0.9 },
  { aliasText: 'oliva', archetypeId: 'L2', confidence: 0.6 },
  { aliasText: 'oliveto', archetypeId: 'L2', confidence: 0.8 },
  
  // ========================================
  // OLIVI (L2) - Cultivar da Olio (Puglia)
  // ========================================
  { aliasText: 'coratina', archetypeId: 'L2', confidence: 0.9, defaultVarietyType: 'Oil' },
  { aliasText: 'ogliarola', archetypeId: 'L2', confidence: 0.7, defaultVarietyType: 'Oil' },
  { aliasText: 'ogliarola barese', archetypeId: 'L2', confidence: 0.7, defaultVarietyType: 'Oil' },
  { aliasText: 'peranzana', archetypeId: 'L2', confidence: 0.7, defaultVarietyType: 'Oil' },
  { aliasText: 'cima di bitonto', archetypeId: 'L2', confidence: 0.7, defaultVarietyType: 'Oil' },
  { aliasText: 'cima di mola', archetypeId: 'L2', confidence: 0.6, defaultVarietyType: 'Oil' },
  
  // ========================================
  // OLIVI (L2) - Cultivar da Olio (Toscana/Umbria)
  // ========================================
  { aliasText: 'frantoio', archetypeId: 'L2', confidence: 0.8, defaultVarietyType: 'Oil' },
  { aliasText: 'leccino', archetypeId: 'L2', confidence: 0.8, defaultVarietyType: 'Oil' },
  { aliasText: 'moraiolo', archetypeId: 'L2', confidence: 0.7, defaultVarietyType: 'Oil' },
  { aliasText: 'pendolino', archetypeId: 'L2', confidence: 0.7, defaultVarietyType: 'Oil' },
  { aliasText: 'maurino', archetypeId: 'L2', confidence: 0.6, defaultVarietyType: 'Oil' },
  
  // ========================================
  // OLIVI (L2) - Cultivar da Olio (Sicilia)
  // ========================================
  { aliasText: 'biancolilla', archetypeId: 'L2', confidence: 0.6, defaultVarietyType: 'Oil' },
  { aliasText: 'cerasuola', archetypeId: 'L2', confidence: 0.6, defaultVarietyType: 'Oil' },
  { aliasText: 'tonda iblea', archetypeId: 'L2', confidence: 0.6, defaultVarietyType: 'Oil' },
  { aliasText: 'nocellara etnea', archetypeId: 'L2', confidence: 0.6, defaultVarietyType: 'Oil' },
  
  // ========================================
  // OLIVI (L2) - Cultivar da Olio (Calabria)
  // ========================================
  { aliasText: 'carolea', archetypeId: 'L2', confidence: 0.7, defaultVarietyType: 'Oil' },
  { aliasText: 'rossanese', archetypeId: 'L2', confidence: 0.6, defaultVarietyType: 'Oil' },
  { aliasText: 'ottobratica', archetypeId: 'L2', confidence: 0.6, defaultVarietyType: 'Oil' },
  
  // ========================================
  // OLIVI (L2) - Cultivar da Olio (Liguria)
  // ========================================
  { aliasText: 'taggiasca', archetypeId: 'L2', confidence: 0.7, defaultVarietyType: 'Dual-purpose' },
  { aliasText: 'casaliva', archetypeId: 'L2', confidence: 0.6, defaultVarietyType: 'Dual-purpose' },
  
  // ========================================
  // OLIVI (L2) - Cultivar da Mensa
  // ========================================
  { aliasText: 'nocellara del belice', archetypeId: 'L2', confidence: 0.8, defaultVarietyType: 'Table' },
  { aliasText: 'itrana', archetypeId: 'L2', confidence: 0.7, defaultVarietyType: 'Table' },
  { aliasText: 'ascolana tenera', archetypeId: 'L2', confidence: 0.7, defaultVarietyType: 'Table' },
  { aliasText: 'santagatese', archetypeId: 'L2', confidence: 0.6, defaultVarietyType: 'Table' },
  { aliasText: 'grossa di cassano', archetypeId: 'L2', confidence: 0.6, defaultVarietyType: 'Table' },
  { aliasText: 'bella di cerignola', archetypeId: 'L2', confidence: 0.6, defaultVarietyType: 'Table' },
];

/**
 * Ottiene tutti gli aliases predefiniti per vite e olivo
 */
export const getAllVineOliveAliases = (): Array<Omit<CropAlias, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>> => {
  return vineOliveAliases;
};

