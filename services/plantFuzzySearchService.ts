/**
 * Servizio Fuzzy Search per piante
 * Implementa ricerca a 2 passaggi: synonyms → canonical
 * Usa pg_trgm per fuzzy matching su Supabase
 */

import { normalizeText, similarity } from '../utils/textNormalizer';
import { getSupabaseClient } from '../config/supabase';
import { ArchetypeId } from '../types/archetypes';
import { plantSynonymsSeed, plantTaxonomySeed } from '../data/plantTaxonomySeed';

/**
 * Risultato della ricerca fuzzy
 */
export interface FuzzySearchResult {
  plantId: string;
  plantName: string;
  archetypeId: string;
  familyId: string;
  functionalCategory: string;
  confidence: number;
  matchType: 'synonym' | 'canonical' | 'partial';
  matchedText: string;
  similarityScore?: number;
}

/**
 * Fuzzy search con 2 passaggi:
 * 1. Synonyms first (più preciso)
 * 2. Canonical fallback (se non trova sinonimi)
 * 
 * @param userInput Input utente (es. "burattino", "pummador", "barattiere")
 * @param locale Locale per ricerca (default: "it")
 * @param archetypeId Archetipo selezionato (opzionale, per filtrare risultati)
 * @returns Array di risultati ordinati per confidence e relevance
 */
export async function fuzzySearchPlant(
  userInput: string,
  locale: string = 'it',
  archetypeId?: ArchetypeId
): Promise<FuzzySearchResult[]> {
  if (!userInput || userInput.trim().length < 2) {
    return [];
  }

  const normalized = normalizeText(userInput);
  const supabase = getSupabaseClient();

  // Se Supabase non è disponibile, fallback a ricerca locale
  if (!supabase) {
    return fuzzySearchLocal(normalized, locale, archetypeId);
  }

  try {
    // Passaggio 1: Cerca nei sinonimi (più preciso)
    const synonymMatches = await searchSynonyms(supabase, normalized, locale, archetypeId);

    // Passaggio 2: Se non trova, cerca nei nomi canonici
    const canonicalMatches = synonymMatches.length === 0
      ? await searchCanonical(supabase, normalized, archetypeId)
      : [];

    // Combina risultati e ordina
    const allMatches = [...synonymMatches, ...canonicalMatches];

    // Ordina: confidence alta → archetipo selezionato → globali
    return allMatches
      .sort((a, b) => {
        // Prima per confidence
        if (b.confidence !== a.confidence) {
          return b.confidence - a.confidence;
        }

        // Poi per similarity score se disponibile
        if (a.similarityScore !== undefined && b.similarityScore !== undefined) {
          if (b.similarityScore !== a.similarityScore) {
            return b.similarityScore - a.similarityScore;
          }
        }

        // Poi per archetipo selezionato
        if (archetypeId) {
          if (a.archetypeId === archetypeId && b.archetypeId !== archetypeId) return -1;
          if (b.archetypeId === archetypeId && a.archetypeId !== archetypeId) return 1;
        }

        return 0;
      })
      .slice(0, 3); // Max 3 suggerimenti
  } catch (error) {
    console.error('Error in fuzzySearchPlant:', error);
    // Fallback a ricerca locale in caso di errore
    return fuzzySearchLocal(normalized, locale, archetypeId);
  }
}

/**
 * Cerca nei sinonimi usando funzione SQL search_plant_synonyms
 */
async function searchSynonyms(
  supabase: any,
  normalized: string,
  locale: string,
  archetypeId?: ArchetypeId
): Promise<FuzzySearchResult[]> {
  try {
    const { data, error } = await supabase.rpc('search_plant_synonyms', {
      search_query: normalized,
      search_locale: locale,
      filter_archetype_id: archetypeId || null,
      similarity_threshold: 0.3,
      result_limit: 10
    });

    if (error) {
      console.error('Error in searchSynonyms:', error);
      return [];
    }

    return (data || []).map((row: any) => ({
      plantId: row.plant_id,
      plantName: row.plant_name,
      archetypeId: row.archetype_id,
      familyId: row.family_id,
      functionalCategory: row.functional_category,
      confidence: parseFloat(row.confidence) * (row.similarity_score || 1.0),
      matchType: 'synonym' as const,
      matchedText: row.synonym,
      similarityScore: parseFloat(row.similarity_score || 0)
    }));
  } catch (error) {
    console.error('Error in searchSynonyms:', error);
    return [];
  }
}

/**
 * Cerca nei nomi canonici usando funzione SQL search_plant_canonical
 */
async function searchCanonical(
  supabase: any,
  normalized: string,
  archetypeId?: ArchetypeId
): Promise<FuzzySearchResult[]> {
  try {
    const { data, error } = await supabase.rpc('search_plant_canonical', {
      search_query: normalized,
      filter_archetype_id: archetypeId || null,
      similarity_threshold: 0.3,
      result_limit: 10
    });

    if (error) {
      console.error('Error in searchCanonical:', error);
      return [];
    }

    return (data || []).map((row: any) => ({
      plantId: row.plant_id,
      plantName: row.plant_name,
      archetypeId: row.archetype_id,
      familyId: row.family_id,
      functionalCategory: row.functional_category,
      confidence: parseFloat(row.similarity_score || 0.8),
      matchType: 'canonical' as const,
      matchedText: row.plant_name,
      similarityScore: parseFloat(row.similarity_score || 0)
    }));
  } catch (error) {
    console.error('Error in searchCanonical:', error);
    return [];
  }
}

/**
 * Fallback a ricerca locale (quando Supabase non è disponibile)
 * Usa dati seed per ricerca in-memory
 */
function fuzzySearchLocal(
  normalized: string,
  locale: string,
  archetypeId?: ArchetypeId
): FuzzySearchResult[] {
  const results: FuzzySearchResult[] = [];

  // Cerca nei sinonimi
  for (const synonym of plantSynonymsSeed) {
    if (synonym.locale !== locale && synonym.locale !== 'it') continue;
    if (archetypeId) {
      const taxonomy = plantTaxonomySeed.find((p: any) => p.plantId === synonym.plantId);
      if (taxonomy?.archetypeId !== archetypeId) continue;
    }

    const sim = similarity(normalized, synonym.normalizedSynonym);
    if (sim >= 0.7) {
      const taxonomy = plantTaxonomySeed.find((p: any) => p.plantId === synonym.plantId);
      if (taxonomy) {
        results.push({
          plantId: taxonomy.plantId,
          plantName: taxonomy.names.it,
          archetypeId: taxonomy.archetypeId,
          familyId: taxonomy.familyId,
          functionalCategory: taxonomy.functionalCategory,
          confidence: synonym.confidence * sim,
          matchType: 'synonym',
          matchedText: synonym.synonym,
          similarityScore: sim
        });
      }
    }
  }

  // Se non trova sinonimi, cerca nei nomi canonici
  if (results.length === 0) {
    for (const taxonomy of plantTaxonomySeed) {
      if (archetypeId && taxonomy.archetypeId !== archetypeId) continue;

      const sim = similarity(normalized, normalizeText(taxonomy.names.it));
      if (sim >= 0.7) {
        results.push({
          plantId: taxonomy.plantId,
          plantName: taxonomy.names.it,
          archetypeId: taxonomy.archetypeId,
          familyId: taxonomy.familyId,
          functionalCategory: taxonomy.functionalCategory,
          confidence: sim,
          matchType: 'canonical',
          matchedText: taxonomy.names.it,
          similarityScore: sim
        });
      }
    }
  }

  // Ordina e limita
  return results
    .sort((a, b) => {
      if (b.confidence !== a.confidence) return b.confidence - a.confidence;
      if (archetypeId) {
        if (a.archetypeId === archetypeId && b.archetypeId !== archetypeId) return -1;
        if (b.archetypeId === archetypeId && a.archetypeId !== archetypeId) return 1;
      }
      return 0;
    })
    .slice(0, 3);
}
