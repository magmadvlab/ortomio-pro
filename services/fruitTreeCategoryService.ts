/**
 * Servizio per mapping e gestione categorie frutteti
 * Mappa master sheets e varietà a categorie frutteto
 */

import { FruitTreeCrop } from '../types/fruitTree';
import { FruitTreeCategory, getCategoryInfo } from '../types/orchardTypes';
import { getProfileForCategory } from '../data/fruitTreeProfiles';
import { CropProfile } from '../types/archetypes';

/**
 * Determina categoria frutteto da master sheet
 */
export function getCategoryForMasterSheet(master: FruitTreeCrop): FruitTreeCategory | null {
  if (!master) return null;
  
  const name = master.commonName?.toLowerCase() || '';
  const treeType = master.treeType;
  const family = master.family?.toLowerCase() || '';
  
  // Agrumi (Rutaceae)
  if (treeType === 'Citrus' || 
      name.includes('limone') || 
      name.includes('arancia') || 
      name.includes('mandarino') ||
      name.includes('pompelmo') ||
      name.includes('cedro') ||
      name.includes('bergamotto') ||
      name.includes('kumquat') ||
      family.includes('rutaceae')) {
    return 'AGRUMI';
  }
  
  // Drupacee (Stone fruits - Rosaceae, genere Prunus)
  if (treeType === 'Stone' ||
      name.includes('pesco') ||
      name.includes('pesca') ||
      name.includes('albicocco') ||
      name.includes('albicocca') ||
      name.includes('prugna') ||
      name.includes('susino') ||
      name.includes('ciliegio') ||
      name.includes('ciliegia') ||
      name.includes('nettarina') ||
      name.includes('nettarino') ||
      (name.includes('mandorlo') && !name.includes('mandorla'))) { // Mandorlo come albero = drupacea
    return 'DRUPACEE';
  }
  
  // Pomacee (Pome fruits - Rosaceae)
  if (treeType === 'Pome' ||
      name.includes('melo') ||
      name.includes('mela') ||
      name.includes('pero') ||
      name.includes('pera') ||
      name.includes('cotogno') ||
      name.includes('cotogna') ||
      name.includes('nespola') ||
      name.includes('nespolo')) {
    return 'POMACEE';
  }
  
  // Frutta a guscio (Nut) - categoria gestionale
  if (treeType === 'Nut' ||
      name.includes('noce') ||
      name.includes('nocciola') ||
      name.includes('nocciolo') ||
      name.includes('mandorla') || // Mandorla come prodotto = frutta guscio
      name.includes('pistacchio') ||
      name.includes('castagna') ||
      name.includes('castagno') ||
      family.includes('juglandaceae') ||
      family.includes('betulaceae') ||
      family.includes('anacardiaceae') ||
      family.includes('fagaceae')) {
    return 'FRUTTA_GUSCIO';
  }
  
  // Mediterranea speciale
  if (name.includes('fico') ||
      name.includes('melograno') ||
      name.includes('melagrana') ||
      name.includes('caco') ||
      name.includes('cachi') ||
      name.includes('giuggiola') ||
      name.includes('giuggiolo') ||
      name.includes('carrubo') ||
      name.includes('carruba') ||
      family.includes('moraceae') ||
      family.includes('punicaceae') ||
      family.includes('lythraceae') ||
      family.includes('ebenaceae') ||
      family.includes('rhamnaceae') ||
      family.includes('fabaceae')) {
    return 'MEDITERRANEA';
  }
  
  // Kiwi
  if (name.includes('kiwi') ||
      name.includes('actinidia') ||
      family.includes('actinidiaceae')) {
    return 'KIWI';
  }
  
  // Esotiche/Subtropicali
  if (name.includes('avocado') ||
      name.includes('mango') ||
      name.includes('papaya') ||
      name.includes('litchi') ||
      name.includes('lychee') ||
      name.includes('passion') ||
      name.includes('guava') ||
      name.includes('ananas') ||
      treeType === 'Exotic') {
    return 'ESOTICHE';
  }
  
  return null;
}

/**
 * Ottiene CropProfile per categoria
 * Wrapper per la funzione da data/fruitTreeProfiles
 */
export function getProfileForCategoryWrapper(category: FruitTreeCategory): CropProfile {
  return getProfileForCategory(category);
}

/**
 * Verifica se una categoria è compatibile con la categoria del frutteto esistente
 */
export function isCategoryCompatible(
  treeCategory: FruitTreeCategory | null,
  orchardCategory: FruitTreeCategory | null
): boolean {
  if (!treeCategory || !orchardCategory) return false;
  
  // Se stessa categoria, compatibile
  if (treeCategory === orchardCategory) return true;
  
  // Eccezioni: alcune categorie possono coesistere
  // Es: frutteto misto con DRUPACEE e POMACEE (entrambe Rosaceae)
  if ((treeCategory === 'DRUPACEE' && orchardCategory === 'POMACEE') ||
      (treeCategory === 'POMACEE' && orchardCategory === 'DRUPACEE')) {
    return true; // Entrambe Rosaceae, possono coesistere
  }
  
  return false;
}

/**
 * Ottiene informazioni categoria da nome varietà (fuzzy)
 */
export function getCategoryFromVarietyName(varietyName: string): FruitTreeCategory | null {
  const normalized = varietyName.toLowerCase().trim();
  
  // Crea un master sheet temporaneo per il mapping
  const tempMaster: Partial<FruitTreeCrop> = {
    commonName: varietyName,
    treeType: undefined,
    family: undefined
  };
  
  // Prova a determinare treeType dal nome
  if (normalized.includes('melo') || normalized.includes('mela') || 
      normalized.includes('pero') || normalized.includes('pera')) {
    tempMaster.treeType = 'Pome';
  } else if (normalized.includes('pesco') || normalized.includes('pesca') ||
             normalized.includes('albicocco') || normalized.includes('ciliegio') ||
             (normalized.includes('mandorlo') && !normalized.includes('mandorla'))) {
    // Mandorlo (albero) = Stone (drupacea)
    tempMaster.treeType = 'Stone';
  } else if (normalized.includes('limone') || normalized.includes('arancia') ||
             normalized.includes('mandarino')) {
    tempMaster.treeType = 'Citrus';
  } else if (normalized.includes('noce') || normalized.includes('nocciola') ||
             normalized.includes('mandorla')) {
    // Mandorla (prodotto) = Nut (frutta guscio)
    tempMaster.treeType = 'Nut';
  }
  
  return getCategoryForMasterSheet(tempMaster as FruitTreeCrop);
}

