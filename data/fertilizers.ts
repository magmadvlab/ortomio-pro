/**
 * Fertilizers Database
 * Database completo di prodotti fertilizzanti: organici, minerali, correttivi, microelementi, sovesci
 */

import { Garden } from '../types';

export interface FertilizerProduct {
  id: string;
  name: string;
  type: 'organic' | 'mineral' | 'corrective' | 'microelement';
  category:
    | 'manure'
    | 'compost'
    | 'humus'
    | 'bone_meal'
    | 'blood_meal'
    | 'npk'
    | 'slow_release'
    | 'foliar'
    | 'lime'
    | 'sulfur'
    | 'gypsum'
    | 'iron'
    | 'boron'
    | 'zinc'
    | 'manganese';
  npk?: { n: number; p: number; k: number }; // Per prodotti NPK
  organicMatter?: number; // % sostanza organica
  phEffect?: 'acidifying' | 'alkalizing' | 'neutral';
  applicationTiming: 'pre_planting' | 'top_dressing' | 'post_harvest' | 'all_season';
  applicationMethod: 'incorporated' | 'surface' | 'fertigation' | 'foliar';
  dosagePerSqm: { min: number; max: number; unit: string }; // g/m² o L/m²
  incompatibilities?: string[]; // ID prodotti incompatibili
  notes?: string;
  costPerUnit?: number; // €/kg o €/L
  suitableSoilTypes?: Garden['soilType'][];
  suitablePlants?: string[]; // Piante che beneficiano particolarmente
}

export interface CoverCrop {
  name: string;
  family: string;
  sowingPeriod: { start: number; end: number }; // Mesi (1-12)
  incorporationPeriod: { start: number; end: number }; // Mesi
  nitrogenFixation: boolean;
  biomassProduction: 'low' | 'medium' | 'high';
  cnRatio: number;
  depth?: number; // cm profondità radici
  notes?: string;
}

/**
 * Database prodotti fertilizzanti organici
 */
export const organicFertilizers: FertilizerProduct[] = [
  // Letame
  {
    id: 'manure_bovine',
    name: 'Letame Bovino',
    type: 'organic',
    category: 'manure',
    npk: { n: 0.6, p: 0.3, k: 0.5 },
    organicMatter: 25,
    phEffect: 'neutral',
    applicationTiming: 'pre_planting',
    applicationMethod: 'incorporated',
    dosagePerSqm: { min: 3000, max: 5000, unit: 'g/m²' },
    notes: 'Deve essere ben maturo (minimo 6 mesi). Ottimo per migliorare struttura terreno.',
    suitableSoilTypes: ['Clay', 'Loamy'],
  },
  {
    id: 'manure_equine',
    name: 'Letame Equino',
    type: 'organic',
    category: 'manure',
    npk: { n: 0.7, p: 0.3, k: 0.6 },
    organicMatter: 30,
    phEffect: 'neutral',
    applicationTiming: 'pre_planting',
    applicationMethod: 'incorporated',
    dosagePerSqm: { min: 2500, max: 4000, unit: 'g/m²' },
    notes: 'Più ricco di azoto rispetto a bovino. Ottimo per compostaggio.',
  },
  {
    id: 'manure_ovine',
    name: 'Letame Ovino',
    type: 'organic',
    category: 'manure',
    npk: { n: 0.8, p: 0.5, k: 0.7 },
    organicMatter: 35,
    phEffect: 'neutral',
    applicationTiming: 'pre_planting',
    applicationMethod: 'incorporated',
    dosagePerSqm: { min: 2000, max: 3500, unit: 'g/m²' },
    notes: 'Molto ricco, usare con moderazione. Ottimo per ortaggi esigenti.',
  },
  {
    id: 'manure_poultry',
    name: 'Pollina',
    type: 'organic',
    category: 'manure',
    npk: { n: 1.5, p: 1.2, k: 0.8 },
    organicMatter: 40,
    phEffect: 'acidifying',
    applicationTiming: 'pre_planting',
    applicationMethod: 'incorporated',
    dosagePerSqm: { min: 500, max: 1000, unit: 'g/m²' },
    notes: 'Molto ricco di azoto. Usare con cautela, può bruciare radici se non maturo.',
    incompatibilities: ['lime_dolomite'],
  },

  // Compost
  {
    id: 'compost_mature',
    name: 'Compost Maturo',
    type: 'organic',
    category: 'compost',
    npk: { n: 0.5, p: 0.3, k: 0.5 },
    organicMatter: 50,
    phEffect: 'neutral',
    applicationTiming: 'all_season',
    applicationMethod: 'incorporated',
    dosagePerSqm: { min: 2000, max: 4000, unit: 'g/m²' },
    notes: 'Compost ben maturo (minimo 6 mesi). Migliora struttura e fertilità terreno.',
  },
  {
    id: 'compost_fresh',
    name: 'Compost Fresco',
    type: 'organic',
    category: 'compost',
    npk: { n: 0.3, p: 0.2, k: 0.3 },
    organicMatter: 40,
    phEffect: 'neutral',
    applicationTiming: 'pre_planting',
    applicationMethod: 'incorporated',
    dosagePerSqm: { min: 3000, max: 5000, unit: 'g/m²' },
    notes: 'Compost giovane (2-4 mesi). Usare solo in pre-impianto, non a contatto radici.',
  },

  // Humus
  {
    id: 'humus_worm',
    name: 'Humus di Lombrico',
    type: 'organic',
    category: 'humus',
    npk: { n: 1.0, p: 0.8, k: 0.6 },
    organicMatter: 60,
    phEffect: 'neutral',
    applicationTiming: 'all_season',
    applicationMethod: 'surface',
    dosagePerSqm: { min: 500, max: 1000, unit: 'g/m²' },
    notes: 'Molto ricco e bilanciato. Può essere usato anche in copertura.',
    costPerUnit: 8.0, // €/kg
  },

  // Farine
  {
    id: 'bone_meal',
    name: 'Cornunghia',
    type: 'organic',
    category: 'bone_meal',
    npk: { n: 3.0, p: 15.0, k: 0 },
    organicMatter: 0,
    phEffect: 'neutral',
    applicationTiming: 'pre_planting',
    applicationMethod: 'incorporated',
    dosagePerSqm: { min: 50, max: 100, unit: 'g/m²' },
    notes: 'Ricco di fosforo. Ottimo per radicazione e fioritura. Lenta cessione.',
    suitablePlants: ['Pomodoro', 'Peperone', 'Melanzana'],
    costPerUnit: 12.0,
  },
  {
    id: 'blood_meal',
    name: 'Farina di Sangue',
    type: 'organic',
    category: 'blood_meal',
    npk: { n: 12.0, p: 1.0, k: 0.5 },
    organicMatter: 0,
    phEffect: 'acidifying',
    applicationTiming: 'top_dressing',
    applicationMethod: 'surface',
    dosagePerSqm: { min: 30, max: 60, unit: 'g/m²' },
    notes: 'Ricco di azoto, rapida cessione. Usare con moderazione per evitare eccesso azoto.',
    incompatibilities: ['lime_dolomite'],
    costPerUnit: 15.0,
  },

  // Bokashi
  {
    id: 'bokashi',
    name: 'Bokashi',
    type: 'organic',
    category: 'compost',
    npk: { n: 1.5, p: 0.8, k: 0.6 },
    organicMatter: 45,
    phEffect: 'acidifying',
    applicationTiming: 'pre_planting',
    applicationMethod: 'incorporated',
    dosagePerSqm: { min: 1000, max: 2000, unit: 'g/m²' },
    notes: 'Compost fermentato giapponese. Più veloce del compost tradizionale.',
  },
];

/**
 * Database prodotti fertilizzanti minerali
 */
export const mineralFertilizers: FertilizerProduct[] = [
  // NPK Standard
  {
    id: 'npk_15_15_15',
    name: 'NPK 15-15-15',
    type: 'mineral',
    category: 'npk',
    npk: { n: 15, p: 15, k: 15 },
    phEffect: 'neutral',
    applicationTiming: 'top_dressing',
    applicationMethod: 'fertigation',
    dosagePerSqm: { min: 30, max: 50, unit: 'g/m²' },
    notes: 'Bilanciato per uso generale. Rapida cessione.',
    costPerUnit: 2.5,
  },
  {
    id: 'npk_20_10_10',
    name: 'NPK 20-10-10',
    type: 'mineral',
    category: 'npk',
    npk: { n: 20, p: 10, k: 10 },
    phEffect: 'neutral',
    applicationTiming: 'top_dressing',
    applicationMethod: 'fertigation',
    dosagePerSqm: { min: 25, max: 40, unit: 'g/m²' },
    notes: 'Ricco di azoto. Per crescita vegetativa.',
    suitablePlants: ['Lattuga', 'Spinaci', 'Basilico'],
  },
  {
    id: 'npk_10_20_20',
    name: 'NPK 10-20-20',
    type: 'mineral',
    category: 'npk',
    npk: { n: 10, p: 20, k: 20 },
    phEffect: 'neutral',
    applicationTiming: 'top_dressing',
    applicationMethod: 'fertigation',
    dosagePerSqm: { min: 30, max: 50, unit: 'g/m²' },
    notes: 'Ricco di fosforo e potassio. Per fioritura e fruttificazione.',
    suitablePlants: ['Pomodoro', 'Peperone', 'Zucchina'],
  },

  // Lenta cessione
  {
    id: 'slow_release_14_7_14',
    name: 'Concime Lenta Cessione 14-7-14',
    type: 'mineral',
    category: 'slow_release',
    npk: { n: 14, p: 7, k: 14 },
    phEffect: 'neutral',
    applicationTiming: 'pre_planting',
    applicationMethod: 'incorporated',
    dosagePerSqm: { min: 40, max: 60, unit: 'g/m²' },
    notes: 'Rilascio graduale per 3-4 mesi. Una sola applicazione per stagione.',
    costPerUnit: 4.0,
  },

  // Fogliari
  {
    id: 'foliar_npk_20_20_20',
    name: 'Concime Fogliare NPK 20-20-20',
    type: 'mineral',
    category: 'foliar',
    npk: { n: 20, p: 20, k: 20 },
    phEffect: 'neutral',
    applicationTiming: 'top_dressing',
    applicationMethod: 'foliar',
    dosagePerSqm: { min: 2, max: 3, unit: 'g/L' },
    notes: 'Assorbimento rapido via fogliare. Usare al mattino o sera, mai in pieno sole.',
  },
];

/**
 * Database correttivi pH
 */
export const correctiveFertilizers: FertilizerProduct[] = [
  {
    id: 'lime_dolomite',
    name: 'Calce Dolomitica',
    type: 'corrective',
    category: 'lime',
    phEffect: 'alkalizing',
    applicationTiming: 'pre_planting',
    applicationMethod: 'incorporated',
    dosagePerSqm: { min: 100, max: 200, unit: 'g/m²' },
    notes: 'Aumenta pH terreno. Usare solo se pH < 6.5. Non mescolare con letame fresco.',
    incompatibilities: ['manure_poultry', 'blood_meal', 'sulfur'],
  },
  {
    id: 'sulfur',
    name: 'Zolfo',
    type: 'corrective',
    category: 'sulfur',
    phEffect: 'acidifying',
    applicationTiming: 'pre_planting',
    applicationMethod: 'incorporated',
    dosagePerSqm: { min: 50, max: 100, unit: 'g/m²' },
    notes: 'Riduce pH terreno. Usare solo se pH > 7.5. Effetto lento (mesi).',
    incompatibilities: ['lime_dolomite'],
  },
  {
    id: 'gypsum',
    name: 'Gesso',
    type: 'corrective',
    category: 'gypsum',
    phEffect: 'neutral',
    applicationTiming: 'pre_planting',
    applicationMethod: 'incorporated',
    dosagePerSqm: { min: 200, max: 400, unit: 'g/m²' },
    notes: 'Migliora struttura terreni argillosi senza cambiare pH.',
    suitableSoilTypes: ['Clay'],
  },
];

/**
 * Database microelementi
 */
export const microelementFertilizers: FertilizerProduct[] = [
  {
    id: 'iron_chelate',
    name: 'Ferro Chelato',
    type: 'microelement',
    category: 'iron',
    phEffect: 'neutral',
    applicationTiming: 'top_dressing',
    applicationMethod: 'foliar',
    dosagePerSqm: { min: 1, max: 2, unit: 'g/L' },
    notes: 'Per carenze di ferro (clorosi ferrica). Assorbimento migliore via fogliare.',
    suitablePlants: ['Pomodoro', 'Peperone'],
  },
  {
    id: 'boron',
    name: 'Boro',
    type: 'microelement',
    category: 'boron',
    phEffect: 'neutral',
    applicationTiming: 'top_dressing',
    applicationMethod: 'foliar',
    dosagePerSqm: { min: 0.5, max: 1, unit: 'g/L' },
    notes: 'Importante per fioritura e allegagione. Usare con cautela, dosi eccessive sono tossiche.',
    suitablePlants: ['Pomodoro', 'Peperone', 'Zucchina'],
  },
  {
    id: 'zinc',
    name: 'Zinco',
    type: 'microelement',
    category: 'zinc',
    phEffect: 'neutral',
    applicationTiming: 'top_dressing',
    applicationMethod: 'foliar',
    dosagePerSqm: { min: 0.5, max: 1, unit: 'g/L' },
    notes: 'Importante per crescita vegetativa. Carenze comuni in terreni alcalini.',
  },
];

/**
 * Database sovesci
 */
export const coverCrops: CoverCrop[] = [
  {
    name: 'Senape',
    family: 'Brassicaceae',
    sowingPeriod: { start: 8, end: 10 }, // Agosto-Ottobre
    incorporationPeriod: { start: 3, end: 4 }, // Marzo-Aprile
    nitrogenFixation: false,
    biomassProduction: 'high',
    cnRatio: 20,
    depth: 30,
    notes: 'Biofumigante naturale. Controlla nematodi e funghi patogeni.',
  },
  {
    name: 'Favino',
    family: 'Leguminose',
    sowingPeriod: { start: 9, end: 11 }, // Settembre-Novembre
    incorporationPeriod: { start: 3, end: 5 }, // Marzo-Maggio
    nitrogenFixation: true,
    biomassProduction: 'medium',
    cnRatio: 15,
    depth: 40,
    notes: 'Fissa azoto atmosferico. Ottimo prima di piante esigenti.',
  },
  {
    name: 'Veccia',
    family: 'Leguminose',
    sowingPeriod: { start: 9, end: 10 }, // Settembre-Ottobre
    incorporationPeriod: { start: 4, end: 5 }, // Aprile-Maggio
    nitrogenFixation: true,
    biomassProduction: 'high',
    cnRatio: 12,
    depth: 50,
    notes: 'Fissa molto azoto. Ottima biomassa per compostaggio.',
  },
  {
    name: 'Trifoglio',
    family: 'Leguminose',
    sowingPeriod: { start: 3, end: 5 }, // Marzo-Maggio
    incorporationPeriod: { start: 6, end: 8 }, // Giugno-Agosto
    nitrogenFixation: true,
    biomassProduction: 'low',
    cnRatio: 18,
    depth: 20,
    notes: 'Perenne, può essere lasciato come pacciamatura viva.',
  },
];

/**
 * Tutti i prodotti fertilizzanti
 */
export const allFertilizers: FertilizerProduct[] = [
  ...organicFertilizers,
  ...mineralFertilizers,
  ...correctiveFertilizers,
  ...microelementFertilizers,
];

/**
 * Helper functions
 */
export function getFertilizerById(id: string): FertilizerProduct | undefined {
  return allFertilizers.find((f) => f.id === id);
}

export function getFertilizersByType(type: FertilizerProduct['type']): FertilizerProduct[] {
  return allFertilizers.filter((f) => f.type === type);
}

export function getFertilizersByCategory(category: FertilizerProduct['category']): FertilizerProduct[] {
  return allFertilizers.filter((f) => f.category === category);
}

export function getCoverCropByName(name: string): CoverCrop | undefined {
  return coverCrops.find((c) => c.name.toLowerCase() === name.toLowerCase());
}

export function getAllCoverCrops(): CoverCrop[] {
  return coverCrops;
}

