/**
 * Phytoproducts Database
 * Database completo prodotti fitofarmaci: bio, convenzionali, trappole
 */

export interface PhytoProduct {
  id: string;
  name: string;
  type: 'bio' | 'conventional';
  category: 'fungicide' | 'insecticide' | 'repellent' | 'trap';
  activeIngredient?: string;
  targetPests?: string[]; // ['afidi', 'tripidi']
  targetDiseases?: string[]; // ['peronospora', 'oidio']
  dosage: { min: number; max: number; unit: string }; // g/L o mL/L
  applicationMethod: 'foliar' | 'systemic' | 'soil' | 'trap';
  frequencyDays: number; // Giorni tra trattamenti
  safetyInterval: number; // Giorni di carenza (0 = nessuna carenza)
  requiresLicense: boolean;
  allowedInOrganic: boolean;
  weatherConditions: {
    minTemp?: number; // °C minima
    maxTemp?: number; // °C massima
    noRainHours: number; // Ore senza pioggia dopo trattamento
    windMax?: number; // km/h massimo vento
    bestTime?: 'morning' | 'evening' | 'anytime';
  };
  incompatibilities?: string[]; // ID prodotti incompatibili
  notes?: string;
  costPerUnit?: number; // €/L o €/kg
  effectiveness?: 'low' | 'medium' | 'high'; // Efficacia generale
}

/**
 * Prodotti bio - Fungicidi
 */
export const bioFungicides: PhytoProduct[] = [
  {
    id: 'rame_poltiglia',
    name: 'Rame - Poltiglia Bordolese',
    type: 'bio',
    category: 'fungicide',
    activeIngredient: 'Rame (Cu)',
    targetDiseases: ['peronospora', 'batteriosi', 'ticchiolatura'],
    dosage: { min: 20, max: 30, unit: 'g/L' },
    applicationMethod: 'foliar',
    frequencyDays: 14,
    safetyInterval: 7,
    requiresLicense: false,
    allowedInOrganic: true,
    weatherConditions: {
      minTemp: 5,
      maxTemp: 25,
      noRainHours: 12,
      windMax: 15,
      bestTime: 'morning',
    },
    notes: 'Non usare in fioritura (tossico per api). Evitare accumulo nel terreno.',
    costPerUnit: 8.0,
    effectiveness: 'high',
  },
  {
    id: 'rame_idrossido',
    name: 'Rame - Idrossido',
    type: 'bio',
    category: 'fungicide',
    activeIngredient: 'Rame (Cu)',
    targetDiseases: ['peronospora', 'batteriosi'],
    dosage: { min: 15, max: 25, unit: 'g/L' },
    applicationMethod: 'foliar',
    frequencyDays: 14,
    safetyInterval: 7,
    requiresLicense: false,
    allowedInOrganic: true,
    weatherConditions: {
      minTemp: 5,
      maxTemp: 25,
      noRainHours: 12,
      windMax: 15,
      bestTime: 'morning',
    },
    notes: 'Più delicato della poltiglia bordolese. Meno rischio fitotossicità.',
    costPerUnit: 10.0,
    effectiveness: 'high',
  },
  {
    id: 'zolfo',
    name: 'Zolfo Bagnabile',
    type: 'bio',
    category: 'fungicide',
    activeIngredient: 'Zolfo (S)',
    targetDiseases: ['oidio', 'ticchiolatura'],
    dosage: { min: 5, max: 8, unit: 'g/L' },
    applicationMethod: 'foliar',
    frequencyDays: 10,
    safetyInterval: 0,
    requiresLicense: false,
    allowedInOrganic: true,
    weatherConditions: {
      minTemp: 10,
      maxTemp: 30,
      noRainHours: 6,
      windMax: 20,
      bestTime: 'morning',
    },
    incompatibilities: ['rame_poltiglia', 'rame_idrossido'],
    notes: 'Non usare sopra 30°C (fitotossico). Non mescolare con rame.',
    costPerUnit: 5.0,
    effectiveness: 'medium',
  },
  {
    id: 'bicarbonato_potassio',
    name: 'Bicarbonato di Potassio',
    type: 'bio',
    category: 'fungicide',
    activeIngredient: 'Bicarbonato di Potassio',
    targetDiseases: ['oidio'],
    dosage: { min: 5, max: 10, unit: 'g/L' },
    applicationMethod: 'foliar',
    frequencyDays: 7,
    safetyInterval: 0,
    requiresLicense: false,
    allowedInOrganic: true,
    weatherConditions: {
      minTemp: 10,
      maxTemp: 30,
      noRainHours: 6,
      bestTime: 'anytime',
    },
    notes: 'Nessun tempo di carenza. Può essere usato fino a raccolta.',
    costPerUnit: 12.0,
    effectiveness: 'medium',
  },
  {
    id: 'propoli',
    name: 'Propoli',
    type: 'bio',
    category: 'fungicide',
    activeIngredient: 'Propoli',
    targetDiseases: ['oidio', 'batteriosi'],
    dosage: { min: 2, max: 5, unit: 'mL/L' },
    applicationMethod: 'foliar',
    frequencyDays: 7,
    safetyInterval: 0,
    requiresLicense: false,
    allowedInOrganic: true,
    weatherConditions: {
      minTemp: 5,
      maxTemp: 35,
      noRainHours: 4,
      bestTime: 'anytime',
    },
    notes: 'Efficacia preventiva. Nessun tempo di carenza.',
    costPerUnit: 25.0,
    effectiveness: 'low',
  },
];

/**
 * Prodotti bio - Insetticidi
 */
export const bioInsecticides: PhytoProduct[] = [
  {
    id: 'piretro',
    name: 'Piretro Naturale',
    type: 'bio',
    category: 'insecticide',
    activeIngredient: 'Piretrine',
    targetPests: ['afidi', 'tripidi', 'altiche', 'mosche'],
    dosage: { min: 2, max: 4, unit: 'mL/L' },
    applicationMethod: 'foliar',
    frequencyDays: 7,
    safetyInterval: 3,
    requiresLicense: false,
    allowedInOrganic: true,
    weatherConditions: {
      minTemp: 10,
      maxTemp: 25,
      noRainHours: 6,
      windMax: 10,
      bestTime: 'evening',
    },
    notes: 'Tossico per api. Usare solo la sera quando api non sono attive.',
    costPerUnit: 15.0,
    effectiveness: 'high',
  },
  {
    id: 'olio_neem',
    name: 'Olio di Neem',
    type: 'bio',
    category: 'insecticide',
    activeIngredient: 'Azadiractina',
    targetPests: ['afidi', 'cocciniglie', 'tripidi', 'acari'],
    dosage: { min: 2, max: 5, unit: 'mL/L' },
    applicationMethod: 'foliar',
    frequencyDays: 10,
    safetyInterval: 0,
    requiresLicense: false,
    allowedInOrganic: true,
    weatherConditions: {
      minTemp: 15,
      maxTemp: 30,
      noRainHours: 8,
      windMax: 15,
      bestTime: 'evening',
    },
    notes: 'Repellente e insetticida. Agisce per ingestione e contatto.',
    costPerUnit: 20.0,
    effectiveness: 'medium',
  },
  {
    id: 'olio_bianco',
    name: 'Olio Bianco Minerale',
    type: 'bio',
    category: 'insecticide',
    activeIngredient: 'Olio minerale',
    targetPests: ['cocciniglie', 'afidi', 'acari'],
    dosage: { min: 10, max: 20, unit: 'mL/L' },
    applicationMethod: 'foliar',
    frequencyDays: 14,
    safetyInterval: 0,
    requiresLicense: false,
    allowedInOrganic: true,
    weatherConditions: {
      minTemp: 5,
      maxTemp: 25,
      noRainHours: 12,
      windMax: 10,
      bestTime: 'anytime',
    },
    notes: 'Usare in inverno su piante spoglie. Soffoca insetti.',
    costPerUnit: 8.0,
    effectiveness: 'high',
  },
  {
    id: 'bacillus_thuringiensis',
    name: 'Bacillus thuringiensis',
    type: 'bio',
    category: 'insecticide',
    activeIngredient: 'Bt (Bacillus thuringiensis)',
    targetPests: ['lepidotteri', 'bruchi'],
    dosage: { min: 1, max: 2, unit: 'g/L' },
    applicationMethod: 'foliar',
    frequencyDays: 7,
    safetyInterval: 0,
    requiresLicense: false,
    allowedInOrganic: true,
    weatherConditions: {
      minTemp: 15,
      maxTemp: 30,
      noRainHours: 8,
      bestTime: 'evening',
    },
    notes: 'Selettivo per bruchi. Non dannoso per insetti utili.',
    costPerUnit: 18.0,
    effectiveness: 'high',
  },
  {
    id: 'sapone_molle',
    name: 'Sapone Molle Potassico',
    type: 'bio',
    category: 'insecticide',
    activeIngredient: 'Sapone potassico',
    targetPests: ['afidi', 'cocciniglie', 'acari'],
    dosage: { min: 10, max: 20, unit: 'mL/L' },
    applicationMethod: 'foliar',
    frequencyDays: 5,
    safetyInterval: 0,
    requiresLicense: false,
    allowedInOrganic: true,
    weatherConditions: {
      minTemp: 10,
      maxTemp: 30,
      noRainHours: 4,
      bestTime: 'anytime',
    },
    notes: 'Soffoca insetti. Nessun tempo di carenza.',
    costPerUnit: 6.0,
    effectiveness: 'medium',
  },
  {
    id: 'spinosad',
    name: 'Spinosad',
    type: 'bio',
    category: 'insecticide',
    activeIngredient: 'Spinosad',
    targetPests: ['tripidi', 'lepidotteri', 'coleotteri'],
    dosage: { min: 0.5, max: 1, unit: 'mL/L' },
    applicationMethod: 'foliar',
    frequencyDays: 7,
    safetyInterval: 3,
    requiresLicense: false,
    allowedInOrganic: true,
    weatherConditions: {
      minTemp: 15,
      maxTemp: 30,
      noRainHours: 8,
      windMax: 15,
      bestTime: 'evening',
    },
    notes: 'Tossico per api. Usare solo la sera.',
    costPerUnit: 22.0,
    effectiveness: 'high',
  },
];

/**
 * Prodotti bio - Repellenti/Barriere
 */
export const bioRepellents: PhytoProduct[] = [
  {
    id: 'caolino',
    name: 'Caolino',
    type: 'bio',
    category: 'repellent',
    activeIngredient: 'Caolino',
    targetPests: ['mosca', 'cimice', 'tignola'],
    dosage: { min: 50, max: 100, unit: 'g/L' },
    applicationMethod: 'foliar',
    frequencyDays: 14,
    safetyInterval: 0,
    requiresLicense: false,
    allowedInOrganic: true,
    weatherConditions: {
      minTemp: 10,
      maxTemp: 35,
      noRainHours: 24,
      bestTime: 'morning',
    },
    notes: 'Barriera fisica. Protegge da scottature solari. Si lava con pioggia.',
    costPerUnit: 3.0,
    effectiveness: 'medium',
  },
  {
    id: 'farina_roccia',
    name: 'Farina di Roccia',
    type: 'bio',
    category: 'repellent',
    activeIngredient: 'Silicati',
    targetPests: ['lumache', 'chiocciole'],
    dosage: { min: 100, max: 200, unit: 'g/m²' },
    applicationMethod: 'soil',
    frequencyDays: 0,
    safetyInterval: 0,
    requiresLicense: false,
    allowedInOrganic: true,
    weatherConditions: {
      noRainHours: 0,
      bestTime: 'anytime',
    },
    notes: 'Barriera fisica per lumache. Si rinnova dopo pioggia.',
    costPerUnit: 2.0,
    effectiveness: 'medium',
  },
];

/**
 * Trappole
 */
export const traps: PhytoProduct[] = [
  {
    id: 'trappola_cromotropica_gialla',
    name: 'Trappola Cromotropica Gialla',
    type: 'bio',
    category: 'trap',
    targetPests: ['tripidi', 'mosche bianche', 'afidi alati'],
    dosage: { min: 1, max: 1, unit: 'units/m²' },
    applicationMethod: 'trap',
    frequencyDays: 30,
    safetyInterval: 0,
    requiresLicense: false,
    allowedInOrganic: true,
    weatherConditions: {
      noRainHours: 0,
      bestTime: 'anytime',
    },
    notes: 'Attrae insetti volanti. Sostituire ogni 30 giorni o quando piena.',
    costPerUnit: 2.0,
    effectiveness: 'medium',
  },
  {
    id: 'trappola_cromotropica_blu',
    name: 'Trappola Cromotropica Blu',
    type: 'bio',
    category: 'trap',
    targetPests: ['tripidi'],
    dosage: { min: 1, max: 1, unit: 'units/m²' },
    applicationMethod: 'trap',
    frequencyDays: 30,
    safetyInterval: 0,
    requiresLicense: false,
    allowedInOrganic: true,
    weatherConditions: {
      noRainHours: 0,
      bestTime: 'anytime',
    },
    notes: 'Specifica per tripidi. Più efficace del giallo per questa specie.',
    costPerUnit: 2.0,
    effectiveness: 'high',
  },
  {
    id: 'trappola_feromonica_carpocapsa',
    name: 'Trappola Feromonica Carpocapsa',
    type: 'bio',
    category: 'trap',
    targetPests: ['carpocapsa'],
    dosage: { min: 1, max: 2, unit: 'units/pianta' },
    applicationMethod: 'trap',
    frequencyDays: 60,
    safetyInterval: 0,
    requiresLicense: false,
    allowedInOrganic: true,
    weatherConditions: {
      noRainHours: 0,
      bestTime: 'anytime',
    },
    notes: 'Feromone specifico per carpocapsa. Monitoraggio e cattura massale.',
    costPerUnit: 8.0,
    effectiveness: 'high',
  },
  {
    id: 'trappola_alimentare_mosca',
    name: 'Trappola Alimentare Mosca',
    type: 'bio',
    category: 'trap',
    targetPests: ['mosca della frutta', 'mosca dell\'olivo'],
    dosage: { min: 1, max: 2, unit: 'units/pianta' },
    applicationMethod: 'trap',
    frequencyDays: 14,
    safetyInterval: 0,
    requiresLicense: false,
    allowedInOrganic: true,
    weatherConditions: {
      noRainHours: 0,
      bestTime: 'anytime',
    },
    notes: 'Esche alimentari. Sostituire ogni 2 settimane.',
    costPerUnit: 5.0,
    effectiveness: 'medium',
  },
];

/**
 * Prodotti convenzionali (con warning)
 */
export const conventionalProducts: PhytoProduct[] = [
  {
    id: 'deltametrina',
    name: 'Deltametrina',
    type: 'conventional',
    category: 'insecticide',
    activeIngredient: 'Deltametrina',
    targetPests: ['afidi', 'lepidotteri', 'coleotteri'],
    dosage: { min: 0.5, max: 1, unit: 'mL/L' },
    applicationMethod: 'foliar',
    frequencyDays: 14,
    safetyInterval: 7,
    requiresLicense: true,
    allowedInOrganic: false,
    weatherConditions: {
      minTemp: 10,
      maxTemp: 25,
      noRainHours: 12,
      windMax: 10,
      bestTime: 'evening',
    },
    notes: '⚠️ PRODOTTO CHIMICO. Richiede patentino. Tossico per api e ambiente acquatico.',
    costPerUnit: 15.0,
    effectiveness: 'high',
  },
  {
    id: 'azoxystrobin',
    name: 'Azoxystrobin',
    type: 'conventional',
    category: 'fungicide',
    activeIngredient: 'Azoxystrobin',
    targetDiseases: ['peronospora', 'oidio', 'alternaria'],
    dosage: { min: 0.5, max: 1, unit: 'mL/L' },
    applicationMethod: 'foliar',
    frequencyDays: 10,
    safetyInterval: 14,
    requiresLicense: true,
    allowedInOrganic: false,
    weatherConditions: {
      minTemp: 10,
      maxTemp: 30,
      noRainHours: 6,
      bestTime: 'anytime',
    },
    notes: '⚠️ PRODOTTO CHIMICO. Richiede patentino. Tempo di carenza lungo.',
    costPerUnit: 25.0,
    effectiveness: 'high',
  },
];

/**
 * Tutti i prodotti fitofarmaci
 */
export const allPhytoproducts: PhytoProduct[] = [
  ...bioFungicides,
  ...bioInsecticides,
  ...bioRepellents,
  ...traps,
  ...conventionalProducts,
];

/**
 * Helper functions
 */
export function getPhytoProductById(id: string): PhytoProduct | undefined {
  return allPhytoproducts.find((p) => p.id === id);
}

export function getPhytoProductsByType(type: 'bio' | 'conventional'): PhytoProduct[] {
  return allPhytoproducts.filter((p) => p.type === type);
}

export function getPhytoProductsByCategory(category: PhytoProduct['category']): PhytoProduct[] {
  return allPhytoproducts.filter((p) => p.category === category);
}

export function getPhytoProductsForPest(pest: string): PhytoProduct[] {
  return allPhytoproducts.filter(
    (p) => p.targetPests?.some((tp) => tp.toLowerCase().includes(pest.toLowerCase()))
  );
}

export function getPhytoProductsForDisease(disease: string): PhytoProduct[] {
  return allPhytoproducts.filter(
    (p) => p.targetDiseases?.some((td) => td.toLowerCase().includes(disease.toLowerCase()))
  );
}

export function getBioProducts(): PhytoProduct[] {
  return allPhytoproducts.filter((p) => p.type === 'bio');
}

export function getProductsWithoutSafetyInterval(): PhytoProduct[] {
  return allPhytoproducts.filter((p) => p.safetyInterval === 0);
}

