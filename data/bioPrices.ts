/**
 * Prezzi medi bio per kg (€/kg)
 * Basati su prezzi di mercato italiano per prodotti biologici
 */
export const bioPrices: Record<string, number> = {
  // Solanacee
  'POMODORO': 6,
  'PEPERONCINO': 8,
  'PEPERONE': 7,
  'MELANZANA': 5,
  
  // Cucurbitacee
  'ZUCCHINA': 4,
  'ZUCCHINO': 4,
  'CETRIOLO': 4,
  'MELONE': 3,
  'ANGURIA': 2,
  
  // Asteraceae
  'LATTUGA': 3,
  'INSALATA': 3,
  'RADICCHIO': 4,
  'RUGOLA': 12,
  'RUCOLA': 12,
  'VALERIANELLA': 8,
  
  // Brassicaceae
  'CAVOLO': 3,
  'CAVOLFIORE': 4,
  'BROCCOLO': 4,
  'CAVOLETTO': 3,
  'CAVOLO NERO': 3,
  'CAVOLO CAPPUCCIO': 3,
  
  // Leguminose
  'FAGIOLO': 6,
  'FAGIOLINO': 7,
  'PISELLO': 5,
  'FAVA': 5,
  
  // Apiaceae
  'CAROTA': 3,
  'SEDANO': 3,
  'FINOCCHIO': 3,
  'PREZZEMOLO': 15,
  
  // Amaryllidaceae
  'CIPOLLA': 2,
  'AGLIO': 8,
  'PORRO': 3,
  'SCALOGNO': 10,
  
  // Lamiaceae
  'BASILICO': 12,
  'SALVIA': 15,
  'ROSMARINO': 15,
  'MENTA': 12,
  'ORIGANO': 15,
  'TIMО': 15,
  
  // Altre
  'SPINACIO': 4,
  'BIETA': 3,
  'RAVANELLO': 4,
  'RAPANELLO': 4,
  'PATATA': 2,
  'POMODORO CILIEGINO': 7,
  'POMODORO DATTERINO': 7,
  'POMODORO CUORE DI BUE': 6,
};

/**
 * Ottiene il prezzo bio per una pianta
 * @param plantName Nome della pianta (case insensitive)
 * @returns Prezzo in €/kg, default 5€ se non trovato
 */
export const getBioPrice = (plantName: string): number => {
  const upperName = plantName.toUpperCase().trim();
  return bioPrices[upperName] || 5; // Default 5€/kg
};

