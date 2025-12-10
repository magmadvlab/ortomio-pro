/**
 * Companion Planting Database
 * Defines good and bad companions for each plant
 */

import { CompanionRule } from '../types';

export const companionDatabase: CompanionRule[] = [
  // Pomodoro
  {
    plantId: 'pomodoro',
    goodCompanions: ['basilico', 'carota', 'cipolla', 'prezzemolo', 'aglio'],
    badCompanions: ['cavolo', 'finocchio', 'patata'],
    benefit: 'Basilico migliora sapore e allontana afidi. Cipolla e aglio proteggono da malattie.',
    reason: 'Cavoli competono per nutrienti. Finocchio inibisce crescita.',
    distanceMin: 200, // cm
  },
  
  // Peperoncino
  {
    plantId: 'peperoncino',
    goodCompanions: ['basilico', 'origano', 'prezzemolo'],
    badCompanions: ['fagiolo', 'pisello'],
    benefit: 'Basilico e origano migliorano sapore e allontanano parassiti.',
    reason: 'Leguminose competono per spazio e nutrienti.',
    distanceMin: 200,
  },
  
  // Zucchina
  {
    plantId: 'zucchina',
    goodCompanions: ['fagiolo', 'mais', 'nasturzio'],
    badCompanions: ['patata'],
    benefit: 'Fagioli fissano azoto. Mais fornisce supporto verticale.',
    reason: 'Patate competono per spazio e nutrienti.',
    distanceMin: 300,
  },
  
  // Melanzana
  {
    plantId: 'melanzana',
    goodCompanions: ['fagiolo', 'peperone'],
    badCompanions: ['pomodoro'],
    reason: 'Pomodori e melanzane sono entrambe Solanacee - rischio malattie.',
    distanceMin: 200,
  },
  
  // Lattuga
  {
    plantId: 'lattuga',
    goodCompanions: ['carota', 'ravanello', 'fragola', 'cetriolo'],
    badCompanions: ['prezzemolo'],
    benefit: 'Ravanelli proteggono da afidi. Carote ombreggiano in estate.',
    reason: 'Prezzemolo rallenta crescita lattuga.',
    distanceMin: 150,
  },
  
  // Basilico
  {
    plantId: 'basilico',
    goodCompanions: ['pomodoro', 'peperoncino', 'peperone'],
    badCompanions: ['rucola', 'salvia'],
    benefit: 'Migliora sapore pomodori e allontana mosche.',
    reason: 'Rucola e salvia competono per spazio.',
    distanceMin: 100,
  },
  
  // Fagiolo
  {
    plantId: 'fagiolo',
    goodCompanions: ['mais', 'zucca', 'zucchina', 'cetriolo'],
    badCompanions: ['cipolla', 'aglio', 'porro'],
    benefit: 'Trio "Tre Sorelle" (mais, fagioli, zucca) - tradizione nativa americana.',
    reason: 'Cipolle inibiscono crescita leguminose.',
    distanceMin: 200,
  },
  
  // Carota
  {
    plantId: 'carota',
    goodCompanions: ['cipolla', 'aglio', 'porro', 'pomodoro', 'lattuga'],
    badCompanions: ['aneto'],
    benefit: 'Cipolle allontanano mosca della carota.',
    reason: 'Aneto inibisce crescita carote.',
    distanceMin: 150,
  },
  
  // Cipolla
  {
    plantId: 'cipolla',
    goodCompanions: ['carota', 'lattuga', 'pomodoro'],
    badCompanions: ['fagiolo', 'pisello'],
    benefit: 'Protegge carote da mosca. Allontana afidi.',
    reason: 'Inibisce crescita leguminose.',
    distanceMin: 150,
  },
  
  // Cavolo
  {
    plantId: 'cavolo',
    goodCompanions: ['pomodoro', 'sedano', 'aneto'],
    badCompanions: ['fragola', 'pomodoro'], // Contraddittorio ma comune
    benefit: 'Pomodori allontanano cavolaia.',
    reason: 'Fragole competono per nutrienti.',
    distanceMin: 300,
  },
];

/**
 * Get companion rule for a plant
 */
export const getCompanionRule = (plantId: string): CompanionRule | null => {
  return companionDatabase.find(rule => rule.plantId === plantId) || null;
};

/**
 * Get all companion rules
 */
export const getAllCompanionRules = (): CompanionRule[] => {
  return companionDatabase;
};

