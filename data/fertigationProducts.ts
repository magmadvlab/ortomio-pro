/**
 * Fertigation Products Database
 * Database di fertilizzanti adatti alla fertirrigazione
 */

export interface FertigationProduct {
  id: string;
  name: string;
  type: 'Liquid' | 'Soluble' | 'Chelated';
  npk: { n: number; p: number; k: number }; // Es. { n: 20, p: 10, k: 15 }
  micronutrients?: string[]; // ['Fe', 'Zn', 'Mn', 'Cu', 'B', 'Mo']
  suitableFor: 'FRUITING' | 'LEAFY' | 'ROOT' | 'LEGUME' | 'ALL';
  phase: 'Establishment' | 'Vegetative' | 'Reproductive' | 'ALL';
  dosagePerLiter: number; // ml o grammi per litro d'acqua
  frequency: number; // Giorni tra applicazioni
  notes: string;
  organic: boolean;
}

export const fertigationProducts: FertigationProduct[] = [
  // FERTILIZZANTI BIOLOGICI LIQUIDI
  {
    id: 'bio_veg_ortica',
    name: 'Macerato di Ortica (Bio)',
    type: 'Liquid',
    npk: { n: 5, p: 1, k: 3 },
    suitableFor: 'LEAFY',
    phase: 'Vegetative',
    dosagePerLiter: 20, // ml per litro
    frequency: 7,
    notes: 'Ricco di azoto, stimola crescita fogliare. Diluire 1:20 (20ml per litro). Preparare 48h prima.',
    organic: true,
  },
  {
    id: 'bio_fruit_alghe',
    name: 'Estratto di Alghe (Bio)',
    type: 'Liquid',
    npk: { n: 2, p: 2, k: 8 },
    micronutrients: ['Fe', 'Zn', 'Mn', 'Cu'],
    suitableFor: 'FRUITING',
    phase: 'Reproductive',
    dosagePerLiter: 15, // ml per litro
    frequency: 10,
    notes: 'Potassio per fruttificazione. Contiene anche microelementi e ormoni naturali. Stimola fioritura.',
    organic: true,
  },
  {
    id: 'bio_root_consolida',
    name: 'Estratto di Consolida (Bio)',
    type: 'Liquid',
    npk: { n: 3, p: 2, k: 7 },
    suitableFor: 'ROOT',
    phase: 'Reproductive',
    dosagePerLiter: 25, // ml per litro
    frequency: 14,
    notes: 'Ricco di potassio per sviluppo radici e bulbi. Preparare macerato 2-3 settimane prima.',
    organic: true,
  },
  {
    id: 'bio_establishment',
    name: 'Propoli Agricola Liquida (Bio)',
    type: 'Liquid',
    npk: { n: 0, p: 0, k: 0 },
    micronutrients: ['Fe', 'Zn'],
    suitableFor: 'ALL',
    phase: 'Establishment',
    dosagePerLiter: 10, // ml per litro
    frequency: 14,
    notes: 'Rinforza difese naturali post-trapianto. Non è fertilizzante ma coadiuvante. Usa insieme ad altri.',
    organic: true,
  },

  // FERTILIZZANTI SOLUBILI MINERALI
  {
    id: 'npk_20_10_15',
    name: 'NPK 20-10-15 Solubile',
    type: 'Soluble',
    npk: { n: 20, p: 10, k: 15 },
    suitableFor: 'FRUITING',
    phase: 'Vegetative',
    dosagePerLiter: 2, // grammi per litro
    frequency: 14,
    notes: 'Bilanciato per fase vegetativa. Sciogliere completamente in acqua tiepida prima di aggiungere all\'irrigazione.',
    organic: false,
  },
  {
    id: 'npk_10_20_20',
    name: 'NPK 10-20-20 Solubile',
    type: 'Soluble',
    npk: { n: 10, p: 20, k: 20 },
    suitableFor: 'FRUITING',
    phase: 'Reproductive',
    dosagePerLiter: 1.5, // grammi per litro
    frequency: 10,
    notes: 'Basso azoto, alto PK per fruttificazione. Ideale per pomodori, peperoni, zucchine in produzione.',
    organic: false,
  },
  {
    id: 'npk_15_15_15',
    name: 'NPK 15-15-15 Solubile Universale',
    type: 'Soluble',
    npk: { n: 15, p: 15, k: 15 },
    suitableFor: 'ALL',
    phase: 'ALL',
    dosagePerLiter: 1.5, // grammi per litro
    frequency: 14,
    notes: 'Bilanciato per tutte le fasi. Usa come base quando non hai prodotti specifici.',
    organic: false,
  },
  {
    id: 'npk_12_12_17',
    name: 'NPK 12-12-17 Solubile',
    type: 'Soluble',
    npk: { n: 12, p: 12, k: 17 },
    suitableFor: 'ROOT',
    phase: 'Reproductive',
    dosagePerLiter: 2, // grammi per litro
    frequency: 14,
    notes: 'Alto potassio per ingrossamento radici e bulbi. Ideale per carote, cipolle, patate.',
    organic: false,
  },
  {
    id: 'npk_25_5_5',
    name: 'NPK 25-5-5 Solubile',
    type: 'Soluble',
    npk: { n: 25, p: 5, k: 5 },
    suitableFor: 'LEAFY',
    phase: 'Vegetative',
    dosagePerLiter: 1.5, // grammi per litro
    frequency: 10,
    notes: 'Alto azoto per crescita fogliare. Usa solo in fase vegetativa, sospendi prima raccolta.',
    organic: false,
  },

  // PRODOTTI CHELATI PER MICROELEMENTI
  {
    id: 'chelated_iron',
    name: 'Ferro Chelato (EDTA)',
    type: 'Chelated',
    npk: { n: 0, p: 0, k: 0 },
    micronutrients: ['Fe'],
    suitableFor: 'ALL',
    phase: 'ALL',
    dosagePerLiter: 0.5, // grammi per litro
    frequency: 21,
    notes: 'Per carenze di ferro (foglie gialle). Usa solo se necessario, non come routine.',
    organic: false,
  },
  {
    id: 'chelated_micro',
    name: 'Microelementi Chelati Completi',
    type: 'Chelated',
    npk: { n: 0, p: 0, k: 0 },
    micronutrients: ['Fe', 'Zn', 'Mn', 'Cu', 'B', 'Mo'],
    suitableFor: 'ALL',
    phase: 'ALL',
    dosagePerLiter: 0.3, // grammi per litro
    frequency: 30,
    notes: 'Mix completo microelementi. Usa ogni mese come integrazione, specialmente in terreno sabbioso.',
    organic: false,
  },

  // COADIUVANTI
  {
    id: 'humic_acid',
    name: 'Acidi Umici (Bio)',
    type: 'Liquid',
    npk: { n: 0, p: 0, k: 0 },
    micronutrients: ['Fe', 'Zn', 'Mn'],
    suitableFor: 'ALL',
    phase: 'ALL',
    dosagePerLiter: 5, // ml per litro
    frequency: 21,
    notes: 'Migliora assorbimento nutrienti e struttura terreno. Usa sempre insieme ad altri fertilizzanti, non da solo.',
    organic: true,
  },
  {
    id: 'bio_stimulant',
    name: 'Stimolante Radicale (Bio)',
    type: 'Liquid',
    npk: { n: 1, p: 3, k: 1 },
    suitableFor: 'ALL',
    phase: 'Establishment',
    dosagePerLiter: 10, // ml per litro
    frequency: 7,
    notes: 'Stimola sviluppo radicale post-trapianto. Usa solo nelle prime 2-3 settimane dopo trapianto.',
    organic: true,
  },
];

