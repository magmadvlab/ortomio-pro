/**
 * Definizione completa degli archetipi
 * 12 archetipi principali + sub-griglie per gestione nomi locali
 */

import { CropArchetype, ArchetypeId } from '../types/archetypes';

export const archetypes: CropArchetype[] = [
  // Archetipi principali (A1-A12)
  {
    id: 'A1',
    label: 'Solanacee da frutto',
    icon: '🍅',
    botanicalFamily: 'Solanaceae',
    defaultProfileId: 'a1-profile',
    examples: ['pomodoro', 'pomodori', 'peperone', 'peperoni', 'peperoncino', 'peperoncini', 'melanzana', 'melanzane']
  },
  {
    id: 'A2',
    label: 'Cucurbitacee fresche',
    icon: '🥒',
    botanicalFamily: 'Cucurbitaceae',
    defaultProfileId: 'a2-profile',
    examples: ['cetriolo', 'cetrioli', 'zucchina', 'zucchine', 'carosello', 'caroselli', 'barattiere', 'barattieri']
  },
  {
    id: 'A3',
    label: 'Cucurbitacee grosse',
    icon: '🍈',
    botanicalFamily: 'Cucurbitaceae',
    defaultProfileId: 'a3-profile',
    examples: ['melone', 'meloni', 'anguria', 'angurie', 'zucca', 'zucche']
  },
  {
    id: 'A4',
    label: 'Insalate',
    icon: '🥬',
    botanicalFamily: 'Asteraceae',
    defaultProfileId: 'a4-profile',
    examples: ['lattuga', 'lattughe', 'radicchio', 'radicchi', 'cicoria', 'cicorie', 'rucola', 'romana', 'gentilina', 'iceberg']
  },
  {
    id: 'A5',
    label: 'Foglie robuste',
    icon: '🥬',
    botanicalFamily: 'Amaranthaceae',
    defaultProfileId: 'a5-profile',
    examples: ['bietola', 'bietole', 'spinacio', 'spinaci']
  },
  {
    id: 'A6',
    label: 'Brassiche',
    icon: '🥦',
    botanicalFamily: 'Brassicaceae',
    defaultProfileId: 'a6-profile',
    examples: ['cavolo', 'cavoli', 'broccolo', 'broccoli', 'cavolfiore', 'cavolfiori', 'ravanello', 'ravanelli', 'cavolo nero']
  },
  {
    id: 'A7',
    label: 'Bulbi',
    icon: '🧅',
    botanicalFamily: 'Amaryllidaceae',
    defaultProfileId: 'a7-profile',
    examples: ['cipolla', 'cipolle', 'aglio', 'porro', 'porri', 'scalogno']
  },
  {
    id: 'A8',
    label: 'Radici & tuberi',
    icon: '🥕',
    botanicalFamily: 'Apiaceae/Solanaceae',
    defaultProfileId: 'a8-profile',
    examples: ['carota', 'carote', 'patata', 'patate', 'barbabietola', 'barbabietole', 'rapa', 'rape']
  },
  {
    id: 'A9',
    label: 'Legumi',
    icon: '🫘',
    botanicalFamily: 'Fabaceae',
    defaultProfileId: 'a9-profile',
    examples: ['fagiolo', 'fagioli', 'pisello', 'piselli', 'fava', 'fave', 'cece', 'ceci', 'fagiolino', 'fagiolini']
  },
  {
    id: 'A10',
    label: 'Aromatiche',
    icon: '🌿',
    botanicalFamily: 'Lamiaceae/Apiaceae',
    defaultProfileId: 'a10-profile',
    examples: ['basilico', 'rosmarino', 'salvia', 'prezzemolo', 'menta', 'timo', 'origano', 'maggiorana']
  },
  {
    id: 'A11',
    label: 'Piccoli frutti',
    icon: '🫐',
    botanicalFamily: 'Rosaceae/Ericaceae',
    defaultProfileId: 'a11-profile',
    examples: ['fragola', 'lampone', 'mirtillo', 'mora']
  },
  {
    id: 'A12',
    label: 'Colture legnose',
    icon: '🌳',
    botanicalFamily: 'Varie',
    defaultProfileId: 'a12-profile',
    examples: ['frutteto', 'olivo', 'vite']
  },
  
  // Sub-griglia A12 → L1/L2/L3
  {
    id: 'L1',
    label: 'Vite',
    icon: '🍇',
    botanicalFamily: 'Vitaceae',
    defaultProfileId: 'l1-profile',
    parentArchetypeId: 'A12',
    examples: ['uva da vino', 'uva da tavola']
  },
  {
    id: 'L2',
    label: 'Olivo',
    icon: '🫒',
    botanicalFamily: 'Oleaceae',
    defaultProfileId: 'l2-profile',
    parentArchetypeId: 'A12',
    examples: ['olio', 'mensa']
  },
  {
    id: 'L3',
    label: 'Albero da frutto',
    icon: '🌳',
    botanicalFamily: 'Varie',
    defaultProfileId: 'l3-profile',
    parentArchetypeId: 'A12',
    examples: ['melo', 'pesco', 'agrumi', 'avocado']
  },
  
  // Sub-griglia L3 → Agrumi/Drupacee/Pomacee/Esotiche
  {
    id: 'L3_CITRUS',
    label: 'Agrumi',
    icon: '🍊',
    botanicalFamily: 'Rutaceae',
    defaultProfileId: 'l3-profile',
    parentArchetypeId: 'L3',
    examples: ['limone', 'arancia', 'mandarino', 'pomelo']
  },
  {
    id: 'L3_STONE',
    label: 'Drupacee',
    icon: '🍑',
    botanicalFamily: 'Rosaceae',
    defaultProfileId: 'l3-profile',
    parentArchetypeId: 'L3',
    examples: ['pesco', 'albicocco', 'ciliegio', 'susino']
  },
  {
    id: 'L3_POME',
    label: 'Pomacee',
    icon: '🍎',
    botanicalFamily: 'Rosaceae',
    defaultProfileId: 'l3-profile',
    parentArchetypeId: 'L3',
    examples: ['melo', 'pero', 'cotogno']
  },
  {
    id: 'L3_EXOTIC',
    label: 'Esotiche',
    icon: '🥑',
    botanicalFamily: 'Varie',
    defaultProfileId: 'l3-profile',
    parentArchetypeId: 'L3',
    examples: ['avocado', 'mango', 'litchi', 'papaya']
  }
];

/**
 * Ottiene archetipo per ID
 */
export const getArchetypeById = (id: ArchetypeId): CropArchetype | undefined => {
  return archetypes.find(a => a.id === id);
};

/**
 * Ottiene tutti gli archetipi principali (A1-A12)
 */
export const getMainArchetypes = (): CropArchetype[] => {
  return archetypes.filter(a => a.id.startsWith('A') && a.id.length === 2);
};

/**
 * Ottiene sub-archetipi per un archetipo padre
 */
export const getSubArchetypes = (parentId: ArchetypeId): CropArchetype[] => {
  return archetypes.filter(a => a.parentArchetypeId === parentId);
};

/**
 * Verifica se un archetipo ha sub-griglie
 */
export const hasSubArchetypes = (id: ArchetypeId): boolean => {
  return archetypes.some(a => a.parentArchetypeId === id);
};

