'use client';

/**
 * Tabella comparativa tra specie per riferimento rapido
 * Utile per capire differenze e timing di semina
 */

export interface SpeciesComparison {
  species: string;
  family: string;
  heatingMat: 'Essential' | 'Recommended' | 'Optional' | 'Brief';
  growthSpeed: 'Slow' | 'Medium' | 'Fast' | 'Explosive';
  sowingTiming: string; // Rispetto ai peperoncini
  specialNotes: string[];
}

export const speciesComparisonTable: SpeciesComparison[] = [
  {
    species: 'Peperoncini',
    family: 'Solanaceae',
    heatingMat: 'Essential',
    growthSpeed: 'Slow',
    sowingTiming: 'Gennaio/Febbraio (base di riferimento)',
    specialNotes: [
      'Hanno bisogno di pazienza',
      'Germinazione lenta per varietà Chinense (14-28 giorni)',
      'Varietà Chinense richiedono temperatura più alta (24-28°C) rispetto ad Annuum (20-24°C)'
    ]
  },
  {
    species: 'Peperoni',
    family: 'Solanaceae',
    heatingMat: 'Recommended',
    growthSpeed: 'Medium',
    sowingTiming: 'Insieme ai peperoncini',
    specialNotes: [
      'Identici ai piccanti nella gestione',
      'Spesso germinano leggermente prima dei super-piccanti (tipo Habanero)',
      'Trattali esattamente allo stesso modo dei peperoncini piccanti'
    ]
  },
  {
    species: 'Melanzane',
    family: 'Solanaceae',
    heatingMat: 'Essential',
    growthSpeed: 'Medium',
    sowingTiming: 'Insieme o 1 settimana dopo',
    specialNotes: [
      'Foglie grandi, occupano spazio',
      'Trapianta prima se si fanno ombra',
      'Ama il caldo estremo - tappetino riscaldante fondamentale (26-28°C)',
      'Foglie molto più grandi dei peperoncini - nelle vaschette da 12 celle possono farsi ombra a vicenda'
    ]
  },
  {
    species: 'Alchechengi',
    family: 'Solanaceae',
    heatingMat: 'Recommended',
    growthSpeed: 'Medium',
    sowingTiming: 'Insieme ai peperoncini',
    specialNotes: [
      'Simile al pomodoro ma crescita iniziale lenta (tipo peperoncino)',
      'Trattalo come un peperoncino nella fase 1 e 2',
      'Tende a crescere molto disordinato/cespuglioso dopo il trapianto'
    ]
  },
  {
    species: 'Pomodori',
    family: 'Solanaceae',
    heatingMat: 'Optional',
    growthSpeed: 'Fast',
    sowingTiming: '+30/40 giorni dopo',
    specialNotes: [
      'Interra il gambo al travaso!',
      'Crescita molto veloce - gestisci spazio',
      'NON seminare insieme ai peperoncini - crescono al doppio della velocità',
      'Tende a "filare" (allungarsi) molto più dei peperoncini - luci vicinissime!',
      'Al travaso intermedio e finale: puoi interrare quasi tutto il gambo, lasciando solo il ciuffo di foglie'
    ]
  },
  {
    species: 'Zucchine',
    family: 'Cucurbitaceae',
    heatingMat: 'Brief',
    growthSpeed: 'Explosive',
    sowingTiming: '+60/80 giorni dopo',
    specialNotes: [
      'Usa vasi grandi subito',
      'Soffrono i rinvasi',
      'Semina molto tardi',
      'Germina in 2-3 giorni e diventa enorme in 10 giorni',
      'Odiano i trapianti - se rompi il pane di terra, la pianta si blocca',
      'Ideale: semina in vasetti di torba biodegradabile o cocco',
      'Tappetino: utile per germinazione veloce (24-48h), ma spegnilo subito dopo'
    ]
  },
  {
    species: 'Cetrioli',
    family: 'Cucurbitaceae',
    heatingMat: 'Brief',
    growthSpeed: 'Explosive',
    sowingTiming: '+60/80 giorni dopo',
    specialNotes: [
      'Simile alle zucchine nella gestione',
      'Crescita esplosiva',
      'Radici delicate - odiano i trapianti',
      'Semina molto tardi (aprile)'
    ]
  },
  {
    species: 'Anguria',
    family: 'Cucurbitaceae',
    heatingMat: 'Brief',
    growthSpeed: 'Explosive',
    sowingTiming: '+60/80 giorni dopo',
    specialNotes: [
      'Simile alle zucchine nella gestione',
      'Crescita esplosiva',
      'Richiede molto spazio',
      'Semina molto tardi (aprile-maggio)'
    ]
  },
  {
    species: 'Melone',
    family: 'Cucurbitaceae',
    heatingMat: 'Brief',
    growthSpeed: 'Explosive',
    sowingTiming: '+60/80 giorni dopo',
    specialNotes: [
      'Simile alle zucchine nella gestione',
      'Crescita esplosiva',
      'Richiede molto spazio',
      'Semina molto tardi (aprile-maggio)'
    ]
  }
];

/**
 * Ottiene il confronto per una specie specifica
 */
export const getSpeciesComparison = (speciesName: string): SpeciesComparison | undefined => {
  return speciesComparisonTable.find(
    comp => comp.species.toLowerCase() === speciesName.toLowerCase()
  );
};

/**
 * Ottiene tutte le specie di una famiglia botanica
 */
export const getSpeciesByFamily = (family: string): SpeciesComparison[] => {
  return speciesComparisonTable.filter(comp => comp.family === family);
};

/**
 * Ottiene specie con stessa velocità di crescita
 */
export const getSpeciesByGrowthSpeed = (speed: 'Slow' | 'Medium' | 'Fast' | 'Explosive'): SpeciesComparison[] => {
  return speciesComparisonTable.filter(comp => comp.growthSpeed === speed);
};

