/**
 * Servizio ricerca fuzzy per colture
 * Implementa pipeline: exact match → fuzzy match → fallback griglia archetipi
 */

import { IStorageProvider } from '../packages/core/storage/interface';
import { normalizeText, similarity, getFuzzyThreshold, normalizeFruitTreeName, normalizeVineOliveName } from '../utils/textNormalizer';
import { CropAlias, OfficialCrop, ArchetypeId } from '../types/archetypes';
import { getArchetypeById } from '../services/archetypeService';
import { fruitTreeAliases } from '../data/fruitTreeAliases';
import { vineOliveAliases } from '../data/vineOliveAliases';

export interface SearchResult {
  type: 'exact_crop' | 'exact_alias' | 'fuzzy_crop' | 'fuzzy_alias';
  name: string;
  archetypeId: ArchetypeId;
  archetypeLabel: string;
  archetypeIcon: string;
  score: number; // 0-1, più alto = migliore match
  source: 'crop' | 'alias';
  originalText?: string; // Per alias, mostra testo originale
  cropId?: string; // ID crop se disponibile
  aliasId?: string; // ID alias se disponibile
  defaultVarietyType?: 'Wine' | 'Table' | 'Oil' | 'Dual-purpose'; // Per L1/L2, suggerisce varietyType
}

export interface FuzzySearchResult {
  exactMatch: SearchResult | null;
  fuzzyMatches: SearchResult[];
  shouldShowArchetypeGrid: boolean;
}

/**
 * Pipeline completa di ricerca: exact → fuzzy → fallback archetipi
 * 
 * @param storageProvider Provider storage (Supabase o LocalStorage)
 * @param query Query di ricerca (nome coltura inserito dall'utente)
 * @param region Regione opzionale per boost risultati locali
 * @param province Provincia opzionale per boost risultati locali
 * @returns Risultati ricerca con exact match, fuzzy matches e flag per griglia archetipi
 */
export const searchCropWithFuzzy = async (
  storageProvider: IStorageProvider,
  query: string,
  region?: string,
  province?: string
): Promise<FuzzySearchResult> => {
  const normalizedQuery = normalizeText(query);
  
  // Query troppo corte: skip fuzzy, mostra griglia
  if (normalizedQuery.length < 2) {
    return {
      exactMatch: null,
      fuzzyMatches: [],
      shouldShowArchetypeGrid: true
    };
  }
  
  // Pre-processing: normalizza nomi alberi da frutto
  const fruitTreeNormalized = normalizeFruitTreeName(query);
  const searchQueries = [normalizedQuery];
  if (fruitTreeNormalized.normalized !== normalizedQuery) {
    searchQueries.push(fruitTreeNormalized.normalized);
    // Aggiungi anche varietà possibili
    fruitTreeNormalized.possibleVarieties.forEach(v => {
      const normalized = normalizeText(v);
      if (normalized && !searchQueries.includes(normalized)) {
        searchQueries.push(normalized);
      }
    });
  }
  
  // Pre-processing: normalizza nomi vitigni/cultivar olivo
  const vineOliveNormalized = normalizeVineOliveName(query);
  if (vineOliveNormalized.normalized !== normalizedQuery) {
    searchQueries.push(vineOliveNormalized.normalized);
    vineOliveNormalized.possibleVarieties.forEach(v => {
      const normalized = normalizeText(v);
      if (normalized && !searchQueries.includes(normalized)) {
        searchQueries.push(normalized);
      }
    });
  }
  
  // Verifica se la query potrebbe essere vite o olivo
  const isLikelyVineOlive = vineOliveAliases.some(alias => {
    const normalizedAlias = normalizeText(alias.aliasText);
    return searchQueries.some(q => normalizedAlias.includes(q) || q.includes(normalizedAlias));
  });
  
  // Verifica se la query potrebbe essere un albero da frutto
  const isLikelyFruitTree = fruitTreeAliases.some(alias => {
    const normalizedAlias = normalizeText(alias.aliasText);
    return searchQueries.some(q => normalizedAlias.includes(q) || q.includes(normalizedAlias));
  });

  // STEP 1: Exact match su crops (case-insensitive su name)
  try {
    const exactCrop = await storageProvider.getOfficialCrop(query);
    if (exactCrop) {
      const archetype = getArchetypeById(exactCrop.archetypeId);
      if (archetype) {
        return {
          exactMatch: {
            type: 'exact_crop',
            name: exactCrop.name,
            archetypeId: exactCrop.archetypeId,
            archetypeLabel: archetype.label,
            archetypeIcon: archetype.icon,
            score: 1.0,
            source: 'crop',
            cropId: exactCrop.id
          },
          fuzzyMatches: [],
          shouldShowArchetypeGrid: false
        };
      }
    }
  } catch (error) {
    console.error('Error in exact crop search:', error);
  }

  // STEP 2: Exact match su aliases (con geolocalizzazione se disponibile)
  // Prima cerca negli aliases predefiniti per vite/olivo (priorità alta)
  if (isLikelyVineOlive) {
    for (const searchQuery of searchQueries) {
      const exactVineOliveAlias = vineOliveAliases.find(alias => {
        const normalizedAlias = normalizeText(alias.aliasText);
        return normalizedAlias === searchQuery;
      });
      
      if (exactVineOliveAlias) {
        const archetype = getArchetypeById(exactVineOliveAlias.archetypeId);
        if (archetype) {
          return {
            exactMatch: {
              type: 'exact_alias',
              name: exactVineOliveAlias.aliasText,
              archetypeId: exactVineOliveAlias.archetypeId,
              archetypeLabel: archetype.label,
              archetypeIcon: archetype.icon,
              score: 1.0,
              source: 'alias',
              originalText: exactVineOliveAlias.aliasText,
              defaultVarietyType: exactVineOliveAlias.defaultVarietyType
            },
            fuzzyMatches: [],
            shouldShowArchetypeGrid: false
          };
        }
      }
    }
  }
  
  // Poi cerca negli aliases predefiniti per alberi da frutto
  if (isLikelyFruitTree) {
    for (const searchQuery of searchQueries) {
      const exactFruitAlias = fruitTreeAliases.find(alias => {
        const normalizedAlias = normalizeText(alias.aliasText);
        return normalizedAlias === searchQuery;
      });
      
      if (exactFruitAlias) {
        const archetype = getArchetypeById(exactFruitAlias.archetypeId);
        if (archetype) {
          return {
            exactMatch: {
              type: 'exact_alias',
              name: exactFruitAlias.aliasText,
              archetypeId: exactFruitAlias.archetypeId,
              archetypeLabel: archetype.label,
              archetypeIcon: archetype.icon,
              score: 1.0,
              source: 'alias',
              originalText: exactFruitAlias.aliasText
            },
            fuzzyMatches: [],
            shouldShowArchetypeGrid: false
          };
        }
      }
    }
  }
  
  // Poi cerca negli aliases del database
  try {
    const exactAlias = await storageProvider.searchAlias(query, region, province);
    if (exactAlias) {
      const archetype = getArchetypeById(exactAlias.archetypeId);
      if (archetype) {
        return {
          exactMatch: {
            type: 'exact_alias',
            name: exactAlias.aliasText,
            archetypeId: exactAlias.archetypeId,
            archetypeLabel: archetype.label,
            archetypeIcon: archetype.icon,
            score: 1.0,
            source: 'alias',
            originalText: exactAlias.aliasText,
            aliasId: exactAlias.id
          },
          fuzzyMatches: [],
          shouldShowArchetypeGrid: false
        };
      }
    }
  } catch (error) {
    console.error('Error in exact alias search:', error);
  }

  // STEP 3: Fuzzy search (solo se nessun exact match)
  const threshold = getFuzzyThreshold(normalizedQuery.length);
  const fuzzyMatches: SearchResult[] = [];

  // 3a. Fuzzy su crops (limita a 200 più comuni per performance)
  try {
    // Ottieni lista crops per fuzzy search
    // Per MVP: cerca con query vuota per ottenere lista completa (limitata a 200)
    const allCrops = await storageProvider.searchOfficialCrops('');
    
    for (const crop of allCrops.slice(0, 200)) {
      const normalizedCrop = normalizeText(crop.name);
      const sim = similarity(normalizedQuery, normalizedCrop);
      
      if (sim >= threshold) {
        const archetype = getArchetypeById(crop.archetypeId);
        if (archetype) {
          fuzzyMatches.push({
            type: 'fuzzy_crop',
            name: crop.name,
            archetypeId: crop.archetypeId,
            archetypeLabel: archetype.label,
            archetypeIcon: archetype.icon,
            score: sim,
            source: 'crop',
            cropId: crop.id
          });
        }
      }
    }
  } catch (error) {
    console.error('Error in fuzzy crop search:', error);
  }

  // 3b. Fuzzy su aliases (solo quelli con confidence alta per evitare falsi positivi)
  // Prima cerca negli aliases predefiniti per vite/olivo (priorità alta)
  if (isLikelyVineOlive) {
    for (const searchQuery of searchQueries) {
      for (const alias of vineOliveAliases) {
        const normalizedAlias = normalizeText(alias.aliasText);
        const sim = similarity(searchQuery, normalizedAlias);
        
        if (sim >= threshold) {
          // Boost per aliases con confidence alta
          let boostedScore = sim;
          if (alias.confidence >= 0.9) {
            boostedScore = Math.min(1.0, sim + 0.05);
          }
          
          const archetype = getArchetypeById(alias.archetypeId);
          if (archetype) {
            fuzzyMatches.push({
              type: 'fuzzy_alias',
              name: alias.aliasText,
              archetypeId: alias.archetypeId,
              archetypeLabel: archetype.label,
              archetypeIcon: archetype.icon,
              score: boostedScore,
              source: 'alias',
              originalText: alias.aliasText,
              // Includi defaultVarietyType se disponibile
              defaultVarietyType: alias.defaultVarietyType
            });
          }
        }
      }
    }
  }
  
  // Poi cerca negli aliases predefiniti per alberi da frutto
  if (isLikelyFruitTree) {
    for (const searchQuery of searchQueries) {
      for (const alias of fruitTreeAliases) {
        const normalizedAlias = normalizeText(alias.aliasText);
        const sim = similarity(searchQuery, normalizedAlias);
        
        if (sim >= threshold) {
          // Boost per aliases con confidence alta
          let boostedScore = sim;
          if (alias.confidence >= 0.9) {
            boostedScore = Math.min(1.0, sim + 0.05);
          }
          
          const archetype = getArchetypeById(alias.archetypeId);
          if (archetype) {
            fuzzyMatches.push({
              type: 'fuzzy_alias',
              name: alias.aliasText,
              archetypeId: alias.archetypeId,
              archetypeLabel: archetype.label,
              archetypeIcon: archetype.icon,
              score: boostedScore,
              source: 'alias',
              originalText: alias.aliasText
            });
          }
        }
      }
    }
  }
  
  // Poi cerca negli aliases del database
  try {
    // Ottieni tutti gli aliases (più efficiente che iterare per archetype)
    const allAliases = await storageProvider.getAllAliases();
    
    // Filtra solo aliases con confidence >= 0.7
    const highConfidenceAliases = allAliases.filter(a => a.confidence >= 0.7);
    
    for (const searchQuery of searchQueries) {
      for (const alias of highConfidenceAliases) {
        const normalizedAlias = normalizeText(alias.aliasText);
        const sim = similarity(searchQuery, normalizedAlias);
        
        if (sim >= threshold) {
          // Boost per aliases locali (stessa regione/provincia)
          let boostedScore = sim;
          if (region && alias.region === region) {
            boostedScore = Math.min(1.0, sim + 0.1);
          }
          if (province && alias.province === province) {
            boostedScore = Math.min(1.0, sim + 0.15);
          }
          
          const archetype = getArchetypeById(alias.archetypeId);
          if (archetype) {
            fuzzyMatches.push({
              type: 'fuzzy_alias',
              name: alias.aliasText,
              archetypeId: alias.archetypeId,
              archetypeLabel: archetype.label,
              archetypeIcon: archetype.icon,
              score: boostedScore,
              source: 'alias',
              originalText: alias.aliasText,
              aliasId: alias.id
            });
          }
        }
      }
    }
  } catch (error) {
    console.error('Error in fuzzy alias search:', error);
  }

  // Ordina risultati per score (migliori prima) e rimuovi duplicati
  // Se stesso nome appare sia come crop che alias, preferisci crop
  const uniqueMatches = new Map<string, SearchResult>();
  fuzzyMatches.sort((a, b) => {
    // Ordina per score decrescente
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    // A parità di score, preferisci crop su alias
    if (a.source !== b.source) {
      return a.source === 'crop' ? -1 : 1;
    }
    return 0;
  });

  // Rimuovi duplicati (stesso nome + stesso archetipo)
  for (const match of fuzzyMatches) {
    const key = `${match.name.toLowerCase()}_${match.archetypeId}`;
    if (!uniqueMatches.has(key)) {
      uniqueMatches.set(key, match);
    }
  }

  const topFuzzy = Array.from(uniqueMatches.values()).slice(0, 5);

  return {
    exactMatch: null,
    fuzzyMatches: topFuzzy,
    shouldShowArchetypeGrid: topFuzzy.length === 0
  };
};

