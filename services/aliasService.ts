/**
 * Servizio per gestione aliases (nomi locali)
 * Permette di mappare nomi dialettali/locali agli archetipi
 * 
 * NOTA: Questo servizio richiede un IStorageProvider passato come parametro
 * perché non può usare hook React. I componenti React passeranno il storageProvider.
 */

import { CropAlias, ArchetypeId } from '../types/archetypes';
import { IStorageProvider } from '../packages/core/storage/interface';

/**
 * Cerca alias per nome (con opzionale geolocalizzazione)
 * Restituisce l'alias se trovato, null altrimenti
 */
export const searchAlias = async (
  storageProvider: IStorageProvider,
  query: string,
  region?: string,
  province?: string
): Promise<CropAlias | null> => {
  try {
    // Prima cerca senza geolocalizzazione (match globale)
    const alias = await storageProvider.searchAlias(query);
    if (alias) {
      return alias;
    }
    
    // Se specificata regione/provincia, cerca con geolocalizzazione
    if (region || province) {
      const localizedAlias = await storageProvider.searchAlias(query, region, province);
      if (localizedAlias) {
        return localizedAlias;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error searching alias:', error);
    return null;
  }
};

/**
 * Crea nuovo alias
 * Utile quando utente seleziona archetipo per nome non trovato
 */
export const createAlias = async (
  storageProvider: IStorageProvider,
  aliasText: string,
  archetypeId: ArchetypeId,
  region?: string,
  province?: string,
  userId?: string,
  confidence: number = 1.0 // Default 1.0 per exact match, 0.7 per fuzzy, 0.5 per selezione manuale
): Promise<CropAlias> => {
  const newAlias: Omit<CropAlias, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'> = {
    aliasText: aliasText.toLowerCase().trim(),
    archetypeId,
    region,
    province,
    confidence: Math.max(0, Math.min(1, confidence)), // Clamp tra 0 e 1
    createdBy: userId
  };
  
  return await storageProvider.createAlias(newAlias);
};

/**
 * Aggiorna confidence di un alias
 * Utile quando utente cambia archetipo per stesso nome
 */
export const updateAliasConfidence = async (
  storageProvider: IStorageProvider,
  aliasId: string,
  confidence: number
): Promise<void> => {
  // Clamp confidence tra 0 e 1
  const clampedConfidence = Math.max(0, Math.min(1, confidence));
  
  await storageProvider.updateAliasConfidence(aliasId, clampedConfidence);
};

/**
 * Incrementa usage count di un alias
 * Chiamato quando alias viene usato con successo
 */
export const incrementAliasUsage = async (
  storageProvider: IStorageProvider,
  aliasId: string
): Promise<void> => {
  // Recupera alias corrente
  const alias = await storageProvider.getAlias(aliasId);
  if (!alias) return;
  
  // Incrementa usage count
  await storageProvider.updateAlias(aliasId, {
    usageCount: alias.usageCount + 1
  });
};

/**
 * Ottiene tutti gli aliases per un archetipo
 * Utile per vedere esempi/nomi locali per un archetipo
 */
export const getAliasesByArchetype = async (
  storageProvider: IStorageProvider,
  archetypeId: ArchetypeId
): Promise<CropAlias[]> => {
  return await storageProvider.getAliasesByArchetype(archetypeId);
};

/**
 * Cerca coltura ufficiale per nome
 * Utile per ricerca rapida nomi comuni
 */
export const searchOfficialCrop = async (
  storageProvider: IStorageProvider,
  name: string
): Promise<{ name: string; archetypeId: ArchetypeId } | null> => {
  try {
    const crop = await storageProvider.getOfficialCrop(name);
    if (crop) {
      return {
        name: crop.name,
        archetypeId: crop.archetypeId
      };
    }
    return null;
  } catch (error) {
    console.error('Error searching official crop:', error);
    return null;
  }
};

