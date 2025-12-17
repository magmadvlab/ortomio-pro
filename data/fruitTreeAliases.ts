/**
 * Database aliases predefiniti per varietà locali/dialettali di alberi da frutto
 * Tutti gli aliases mappano all'archetype L3
 * La categoria viene determinata dinamicamente dal servizio di categorizzazione
 */

import { CropAlias } from '../types/archetypes';

export const fruitTreeAliases: Array<Omit<CropAlias, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>> = [
  // ========================================
  // MELE (POMACEE)
  // ========================================
  { aliasText: 'mela renetta', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'mela annurca', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'mela limoncella', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'mela golden', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'mela fuji', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'mela gala', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'mela granny smith', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'mela stark', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'mela rossa', archetypeId: 'L3', confidence: 0.85 },
  { aliasText: 'mela verde', archetypeId: 'L3', confidence: 0.85 },
  { aliasText: 'mela gialla', archetypeId: 'L3', confidence: 0.85 },
  { aliasText: 'mela delizia', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'mela imperatore', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'mela stayman', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'mela pink lady', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'mela braeburn', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'mela jonagold', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'mela red delicious', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'mela mutsu', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'mela canada', archetypeId: 'L3', confidence: 0.9 },
  
  // ========================================
  // PERE (POMACEE)
  // ========================================
  { aliasText: 'pera abate', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'pera kaiser', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'pera williams', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'pera conference', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'pera decana', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'pera coscia', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'pera spadona', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'pera martin sec', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'pera butirra', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'pera madernassa', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'pera passacrassana', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'pera rossa', archetypeId: 'L3', confidence: 0.85 },
  { aliasText: 'pera verde', archetypeId: 'L3', confidence: 0.85 },
  
  // ========================================
  // PESCHE (DRUPACEE)
  // ========================================
  { aliasText: 'pesca noce', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'pesca tabacchiera', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'pesca gialla', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'pesca bianca', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'pesca saturnina', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'pesca di bivona', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'pesca di leonforte', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'pesca settembrina', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'pesca tardiva', archetypeId: 'L3', confidence: 0.85 },
  { aliasText: 'pesca precoce', archetypeId: 'L3', confidence: 0.85 },
  { aliasText: 'nettarina', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'nettarina gialla', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'nettarina bianca', archetypeId: 'L3', confidence: 0.9 },
  
  // ========================================
  // ALBICOCCHE (DRUPACEE)
  // ========================================
  { aliasText: 'albicocca', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'albicocca di valleggia', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'albicocca reale', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'albicocca precoce', archetypeId: 'L3', confidence: 0.9 },
  
  // ========================================
  // CILIEGIE (DRUPACEE)
  // ========================================
  { aliasText: 'ciliegia', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'ciliegia durona', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'ciliegia ferrovia', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'ciliegia bigarreau', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'ciliegia moretta', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'ciliegia nera', archetypeId: 'L3', confidence: 0.85 },
  { aliasText: 'ciliegia rossa', archetypeId: 'L3', confidence: 0.85 },
  { aliasText: 'amarena', archetypeId: 'L3', confidence: 0.9 },
  
  // ========================================
  // PRUGNE/SUSINE (DRUPACEE)
  // ========================================
  { aliasText: 'prugna', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'susina', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'prugna regina', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'prugna stanley', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'prugna angeleno', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'prugna nera', archetypeId: 'L3', confidence: 0.85 },
  { aliasText: 'prugna gialla', archetypeId: 'L3', confidence: 0.85 },
  
  // Mandorlo come albero (drupacea - Prunus dulcis)
  { aliasText: 'mandorlo', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'mandorlo pugliese', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'mandorlo siciliano', archetypeId: 'L3', confidence: 0.9 },
  
  // ========================================
  // AGRUMI
  // ========================================
  { aliasText: 'limone siciliano', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'limone femminello', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'limone interdonato', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'limone lunario', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'limone zagara bianca', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'limone', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'limone giallo', archetypeId: 'L3', confidence: 0.85 },
  
  { aliasText: 'arancia tarocco', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'arancia moro', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'arancia sanguinello', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'arancia navel', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'arancia valencia', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'arancia bionda', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'arancia rossa', archetypeId: 'L3', confidence: 0.85 },
  
  { aliasText: 'mandarino', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'mandarino clementine', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'mandarino satsuma', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'mandarino tardivo', archetypeId: 'L3', confidence: 0.9 },
  
  { aliasText: 'pompelmo', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'pompelmo rosa', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'pompelmo giallo', archetypeId: 'L3', confidence: 0.9 },
  
  { aliasText: 'cedro', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'bergamotto', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'kumquat', archetypeId: 'L3', confidence: 0.9 },
  
  // ========================================
  // FRUTTA A GUSCIO
  // ========================================
  { aliasText: 'noce', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'noce comune', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'noce sorrento', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'noce franquette', archetypeId: 'L3', confidence: 0.9 },
  
  { aliasText: 'nocciola', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'nocciola tonda', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'nocciola gentile', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'nocciola romana', archetypeId: 'L3', confidence: 0.9 },
  
  { aliasText: 'mandorla', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'mandorla pugliese', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'mandorla siciliana', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'mandorla tuono', archetypeId: 'L3', confidence: 0.9 },
  
  { aliasText: 'pistacchio', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'pistacchio di bronte', archetypeId: 'L3', confidence: 0.9 },
  
  { aliasText: 'castagna', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'castagna marrone', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'marrone', archetypeId: 'L3', confidence: 0.9 },
  
  // ========================================
  // FRUTTA MEDITERRANEA
  // ========================================
  { aliasText: 'fico', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'fico nero', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'fico bianco', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'fico dottato', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'fico brogiotto', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'fico san pedro', archetypeId: 'L3', confidence: 0.9 },
  
  { aliasText: 'melograno', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'melagrana', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'melograno dolce', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'melograno acido', archetypeId: 'L3', confidence: 0.9 },
  
  { aliasText: 'caco', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'cachi', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'caco vaniglia', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'caco mela', archetypeId: 'L3', confidence: 0.9 },
  
  { aliasText: 'giuggiola', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'giuggiolo', archetypeId: 'L3', confidence: 0.9 },
  
  { aliasText: 'carrubo', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'carruba', archetypeId: 'L3', confidence: 0.9 },
  
  // ========================================
  // KIWI
  // ========================================
  { aliasText: 'kiwi', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'kiwi hayward', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'kiwi verde', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'kiwi giallo', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'actinidia', archetypeId: 'L3', confidence: 0.9 },
  
  // ========================================
  // FRUTTA ESOTICA
  // ========================================
  { aliasText: 'avocado', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'avocado hass', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'avocado fuerte', archetypeId: 'L3', confidence: 0.9 },
  
  { aliasText: 'mango', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'mango kent', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'mango keitt', archetypeId: 'L3', confidence: 0.9 },
  
  { aliasText: 'papaya', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'litchi', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'lychee', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'passion fruit', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'frutto della passione', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'guava', archetypeId: 'L3', confidence: 0.9 },
  
  // ========================================
  // VARIANTI DIALETTALI COMUNI
  // ========================================
  { aliasText: 'melo', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'pero', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'pesco', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'albicocco', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'ciliegio', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'susino', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'cotogno', archetypeId: 'L3', confidence: 0.9 },
  { aliasText: 'nespolo', archetypeId: 'L3', confidence: 0.9 },
];

/**
 * Ottiene tutti gli aliases predefiniti per alberi da frutto
 */
export const getAllFruitTreeAliases = (): Array<Omit<CropAlias, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>> => {
  return fruitTreeAliases;
};

