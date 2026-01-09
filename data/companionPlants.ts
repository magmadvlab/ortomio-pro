/**
 * Companion Plants Data
 * Database di relazioni tra piante (benefiche, dannose, neutrali)
 */

export interface CompanionRelationship {
  plant1: string;
  plant2: string;
  relationship: 'beneficial' | 'harmful' | 'neutral';
  reason: string; // "Azoto", "Repellente", "Ombra", "Allelopatia"
  distance?: number; // Distanza ottimale in cm
}

export interface AllelopathyInfo {
  plant: string;
  inhibitorySubstance: string;
  affectedPlants: string[];
  persistenceDays: number; // Quanti giorni dopo rimozione
}

/**
 * Database relazioni companion
 */
export const companionRelationships: CompanionRelationship[] = [
  // Benefiche
  { plant1: 'Pomodoro', plant2: 'Basilico', relationship: 'beneficial', reason: 'Repellente insetti', distance: 30 },
  { plant1: 'Pomodoro', plant2: 'Prezzemolo', relationship: 'beneficial', reason: 'Repellente', distance: 40 },
  { plant1: 'Pomodoro', plant2: 'Cipolla', relationship: 'beneficial', reason: 'Repellente afidi', distance: 30 },
  { plant1: 'Zucchina', plant2: 'Mais', relationship: 'beneficial', reason: 'Supporto', distance: 50 },
  { plant1: 'Carota', plant2: 'Cipolla', relationship: 'beneficial', reason: 'Repellente reciproco', distance: 20 },
  { plant1: 'Fagiolo', plant2: 'Mais', relationship: 'beneficial', reason: 'Azoto + supporto', distance: 30 },
  { plant1: 'Lattuga', plant2: 'Ravanello', relationship: 'beneficial', reason: 'Ciclo rapido', distance: 15 },
  
  // Dannose
  { plant1: 'Pomodoro', plant2: 'Patata', relationship: 'harmful', reason: 'Stessa famiglia, malattie comuni' },
  { plant1: 'Fagiolo', plant2: 'Aglio', relationship: 'harmful', reason: 'Inibizione crescita' },
  { plant1: 'Peperone', plant2: 'Fagiolo', relationship: 'harmful', reason: 'Competizione nutrienti' },
  { plant1: 'Cavolo', plant2: 'Pomodoro', relationship: 'harmful', reason: 'Competizione spazio' },
];

/**
 * Database allelopatia
 */
export const allelopathyInfo: AllelopathyInfo[] = [
  {
    plant: 'Noce',
    inhibitorySubstance: 'Juglone',
    affectedPlants: ['Pomodoro', 'Peperone', 'Patata', 'Pomodoro'],
    persistenceDays: 365, // Persiste per anni
  },
  {
    plant: 'Rucola',
    inhibitorySubstance: 'Glucosinolati',
    affectedPlants: ['Lattuga', 'Spinaci'],
    persistenceDays: 30,
  },
];

/**
 * Famiglie botaniche
 */
export const botanicalFamilies: Record<string, string[]> = {
  Solanacee: ['Pomodoro', 'Peperone', 'Melanzana', 'Patata'],
  Brassicacee: ['Cavolo', 'Rapa', 'Rucola', 'Broccolo'],
  Cucurbitacee: ['Zucchina', 'Cetriolo', 'Zucca', 'Melone'],
  Leguminose: ['Fagiolo', 'Pisello', 'Fava', 'Cece'],
  Ombrellifere: ['Carota', 'Finocchio', 'Prezzemolo', 'Sedano'],
  Liliacee: ['Cipolla', 'Aglio', 'Porro'],
};

