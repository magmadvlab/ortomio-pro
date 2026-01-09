/**
 * Tipi per categorie di frutteti
 * Le categorie sono utilizzate per organizzazione UI e profili tecnici
 * Tutti i frutteti usano l'archetype L3 come base
 */

export type FruitTreeCategory = 
  | 'DRUPACEE'      // 🍑 Pesche, Albicocche, Prugne, Ciliegie
  | 'POMACEE'       // 🍎 Mele, Pere, Cotogne
  | 'AGRUMI'        // 🍊 Limoni, Arance, Mandarini
  | 'FRUTTA_GUSCIO' // 🌰 Noci, Nocciole, Mandorle
  | 'MEDITERRANEA'  // 🌿 Fichi, Melograni, Cachi
  | 'KIWI'          // 🥝 Kiwi
  | 'ESOTICHE';     // 🥑 Avocado, Mango, Papaya

export interface FruitTreeCategoryInfo {
  id: FruitTreeCategory;
  label: string;
  icon: string;
  botanicalFamily: string;
  examples: string[];
  profileId: string; // ID CropProfile associato
}

/**
 * Informazioni per ogni categoria di frutteto
 * Utilizzate nel wizard di creazione per mostrare opzioni all'utente
 */
export const fruitTreeCategories: FruitTreeCategoryInfo[] = [
  {
    id: 'DRUPACEE',
    label: 'Drupacee',
    icon: '🍑',
    botanicalFamily: 'Rosaceae',
    examples: ['pesco', 'albicocco', 'prugna', 'ciliegio', 'nettarina', 'susino'],
    profileId: 'l3-drupacee-profile'
  },
  {
    id: 'POMACEE',
    label: 'Pomacee',
    icon: '🍎',
    botanicalFamily: 'Rosaceae',
    examples: ['melo', 'pero', 'cotogno', 'nespola'],
    profileId: 'l3-pomacee-profile'
  },
  {
    id: 'AGRUMI',
    label: 'Agrumi',
    icon: '🍊',
    botanicalFamily: 'Rutaceae',
    examples: ['limone', 'arancia', 'mandarino', 'pompelmo', 'cedro', 'bergamotto'],
    profileId: 'l3-agrumi-profile'
  },
  {
    id: 'FRUTTA_GUSCIO',
    label: 'Frutta a Guscio',
    icon: '🌰',
    botanicalFamily: 'Juglandaceae/Betulaceae/Anacardiaceae/Fagaceae/Rosaceae',
    // Nota: Rosaceae per mandorlo (Prunus dulcis) quando considerato come frutta guscio
    examples: ['noce', 'nocciola', 'mandorla', 'pistacchio', 'castagna'],
    profileId: 'l3-frutta-guscio-profile'
  },
  {
    id: 'MEDITERRANEA',
    label: 'Mediterranei Speciali',
    icon: '🌿',
    botanicalFamily: 'Moraceae/Lythraceae/Ebenaceae/Rhamnaceae/Fabaceae',
    examples: ['fico', 'melograno', 'caco', 'giuggiola', 'carrubo'],
    profileId: 'l3-mediterranea-profile'
  },
  {
    id: 'KIWI',
    label: 'Kiwi',
    icon: '🥝',
    botanicalFamily: 'Actinidiaceae',
    examples: ['kiwi', 'actinidia'],
    profileId: 'l3-kiwi-profile'
  },
  {
    id: 'ESOTICHE',
    label: 'Esotiche/Subtropicali',
    icon: '🥑',
    botanicalFamily: 'Lauraceae/Anacardiaceae/Caricaceae/Passifloraceae',
    examples: ['avocado', 'mango', 'papaya', 'litchi', 'passion fruit', 'guava'],
    profileId: 'l3-esotiche-profile'
  }
];

/**
 * Ottiene informazioni categoria per ID
 */
export const getCategoryInfo = (category: FruitTreeCategory): FruitTreeCategoryInfo | undefined => {
  return fruitTreeCategories.find(c => c.id === category);
};

/**
 * Ottiene tutte le categorie disponibili
 */
export const getAllCategories = (): FruitTreeCategoryInfo[] => {
  return fruitTreeCategories;
};

