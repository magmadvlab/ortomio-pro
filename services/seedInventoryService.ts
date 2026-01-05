import { SeedPacket } from '../types';

const STORAGE_PREFIX = 'seedPackets_';

/**
 * Salva i semi in localStorage
 */
const saveToStorage = (gardenId: string, packets: SeedPacket[]) => {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${gardenId}`, JSON.stringify(packets));
  } catch (error) {
    console.error('Error saving seed packets:', error);
  }
};

/**
 * Carica i semi da localStorage
 */
const loadFromStorage = (gardenId: string): SeedPacket[] => {
  try {
    const stored = localStorage.getItem(`${STORAGE_PREFIX}${gardenId}`);
    if (stored) {
      return JSON.parse(stored) as SeedPacket[];
    }
  } catch (error) {
    console.error('Error loading seed packets:', error);
  }
  return [];
};

/**
 * Aggiunge un nuovo pacchetto di semi
 */
export const addSeedPacket = (packet: SeedPacket): void => {
  const packets = loadFromStorage(packet.gardenId);
  
  // Se initialQuantity è specificato ma currentQuantity no, imposta currentQuantity = initialQuantity
  const finalPacket: SeedPacket = {
    ...packet,
    currentQuantity: packet.currentQuantity !== undefined 
      ? packet.currentQuantity 
      : packet.initialQuantity,
    // Calcola quantityRemaining se abbiamo quantità numerica
    quantityRemaining: packet.initialQuantity !== undefined || packet.currentQuantity !== undefined
      ? calculateQuantityRemaining(
          packet.currentQuantity !== undefined ? packet.currentQuantity : packet.initialQuantity,
          packet.initialQuantity
        )
      : packet.quantityRemaining || 'High'
  };
  
  packets.push(finalPacket);
  saveToStorage(packet.gardenId, packets);
};

/**
 * Ottiene tutti i pacchetti di semi per un orto
 */
export const getSeedPackets = (gardenId: string): SeedPacket[] => {
  return loadFromStorage(gardenId);
};

/**
 * Aggiorna un pacchetto di semi esistente
 */
export const updateSeedPacket = (gardenId: string, id: string, updates: Partial<SeedPacket>): void => {
  const packets = loadFromStorage(gardenId);
  const index = packets.findIndex(p => p.id === id);
  if (index !== -1) {
    const updated = { ...packets[index], ...updates };
    
    // Se currentQuantity o initialQuantity sono stati aggiornati, ricalcola quantityRemaining
    if (updates.currentQuantity !== undefined || updates.initialQuantity !== undefined) {
      updated.quantityRemaining = calculateQuantityRemaining(
        updated.currentQuantity,
        updated.initialQuantity
      );
    }
    
    packets[index] = updated;
    saveToStorage(gardenId, packets);
  }
};

/**
 * Consuma semi dalla banca per una semina
 * Scala automaticamente la quantità e aggiorna lo stato
 */
export const consumeSeedsForSowing = (
  gardenId: string, 
  varietyName: string, 
  seedsUsed: number
): { success: boolean; message: string; updatedPacket?: SeedPacket } => {
  const packets = loadFromStorage(gardenId);
  
  // Trova il pacchetto corrispondente (per nome varietà)
  const packetIndex = packets.findIndex(p => 
    p.varietyName.toLowerCase() === varietyName.toLowerCase()
  );
  
  if (packetIndex === -1) {
    return {
      success: false,
      message: `Nessun pacchetto trovato per ${varietyName}. Aggiungi prima i semi alla banca.`
    };
  }
  
  const packet = packets[packetIndex];
  
  // Verifica disponibilità
  if (packet.quantityRemaining === 'Empty') {
    return {
      success: false,
      message: `Pacchetto ${varietyName} vuoto. Acquista nuovi semi.`
    };
  }
  
  // Se abbiamo quantità numerica, scala esattamente
  if (packet.currentQuantity !== undefined) {
    if (packet.currentQuantity < seedsUsed) {
      return {
        success: false,
        message: `Semi insufficienti. Disponibili: ${packet.currentQuantity}, richiesti: ${seedsUsed}`
      };
    }
    
    // Scala la quantità
    const newQuantity = packet.currentQuantity - seedsUsed;
    const updatedPacket = {
      ...packet,
      currentQuantity: newQuantity,
      quantityRemaining: calculateQuantityRemaining(newQuantity, packet.initialQuantity),
      isOpen: true // Marca come aperto dopo primo uso
    };
    
    packets[packetIndex] = updatedPacket;
    saveToStorage(gardenId, packets);
    
    return {
      success: true,
      message: `Utilizzati ${seedsUsed} semi di ${varietyName}. Rimanenti: ${newQuantity}`,
      updatedPacket
    };
  }
  
  // Se abbiamo solo quantità qualitativa, scala di categoria
  let newQuantityRemaining = packet.quantityRemaining;
  if (seedsUsed > 50) {
    // Semina grande, scala di molto
    newQuantityRemaining = packet.quantityRemaining === 'High' ? 'Medium' : 
                          packet.quantityRemaining === 'Medium' ? 'Low' : 'Empty';
  } else if (seedsUsed > 20) {
    // Semina media
    newQuantityRemaining = packet.quantityRemaining === 'High' ? 'High' : 
                          packet.quantityRemaining === 'Medium' ? 'Low' : 'Empty';
  }
  // Semina piccola (< 20 semi) non scala la categoria
  
  const updatedPacket = {
    ...packet,
    quantityRemaining: newQuantityRemaining,
    isOpen: true
  };
  
  packets[packetIndex] = updatedPacket;
  saveToStorage(gardenId, packets);
  
  return {
    success: true,
    message: `Utilizzati ${seedsUsed} semi di ${varietyName}. Stato: ${newQuantityRemaining}`,
    updatedPacket
  };
};

/**
 * Ottiene i semi disponibili per una pianta specifica
 */
export const getAvailableSeedsForPlant = (gardenId: string, plantName: string): SeedPacket[] => {
  const packets = getSeedPackets(gardenId);
  
  return packets.filter(p => {
    // Match esatto per nome varietà
    if (p.varietyName.toLowerCase().includes(plantName.toLowerCase())) {
      return true;
    }
    
    // Match per nome specie
    if (p.speciesName.toLowerCase().includes(plantName.toLowerCase())) {
      return true;
    }
    
    return false;
  }).filter(p => p.quantityRemaining !== 'Empty'); // Solo pacchetti non vuoti
};

/**
 * Registra il risultato della germinazione
 * Collega semi piantati con piantine nate
 */
export const recordGerminationResult = (
  gardenId: string,
  batchId: string,
  seedsPlanted: number,
  seedlingsGerminated: number,
  varietyName: string
): { germinationRate: number; efficiency: string } => {
  const germinationRate = seedsPlanted > 0 ? (seedlingsGerminated / seedsPlanted) * 100 : 0;
  
  // Determina efficienza
  let efficiency = 'Scarsa';
  if (germinationRate >= 80) efficiency = 'Ottima';
  else if (germinationRate >= 60) efficiency = 'Buona';
  else if (germinationRate >= 40) efficiency = 'Media';
  
  // Salva statistiche germinazione (potrebbe essere salvato in localStorage o database)
  const germinationStats = {
    batchId,
    varietyName,
    seedsPlanted,
    seedlingsGerminated,
    germinationRate,
    efficiency,
    date: new Date().toISOString()
  };
  
  // Salva in localStorage per ora (in futuro potrebbe andare in database)
  const statsKey = `germinationStats_${gardenId}`;
  const existingStats = JSON.parse(localStorage.getItem(statsKey) || '[]');
  existingStats.push(germinationStats);
  localStorage.setItem(statsKey, JSON.stringify(existingStats));
  
  return { germinationRate, efficiency };
};

/**
 * Ottiene le statistiche di germinazione per una varietà
 */
export const getGerminationStatsForVariety = (gardenId: string, varietyName: string) => {
  const statsKey = `germinationStats_${gardenId}`;
  const allStats = JSON.parse(localStorage.getItem(statsKey) || '[]');
  
  const varietyStats = allStats.filter((stat: any) => 
    stat.varietyName.toLowerCase() === varietyName.toLowerCase()
  );
  
  if (varietyStats.length === 0) return null;
  
  // Calcola media
  const totalSeeds = varietyStats.reduce((sum: number, stat: any) => sum + stat.seedsPlanted, 0);
  const totalGerminated = varietyStats.reduce((sum: number, stat: any) => sum + stat.seedlingsGerminated, 0);
  const averageRate = totalSeeds > 0 ? (totalGerminated / totalSeeds) * 100 : 0;
  
  return {
    totalBatches: varietyStats.length,
    totalSeeds,
    totalGerminated,
    averageRate,
    lastBatch: varietyStats[varietyStats.length - 1]
  };
};

/**
 * Ottiene i semi in scadenza (quest'anno o prossimo anno)
 */
export const getExpiringSeeds = (gardenId: string, currentYear: number): SeedPacket[] => {
  const packets = getSeedPackets(gardenId);
  return packets.filter(p => 
    p.expiryYear <= currentYear + 1 && 
    p.quantityRemaining !== 'Empty'
  ).sort((a, b) => a.expiryYear - b.expiryYear);
};

/**
 * Calcola quantityRemaining basato su currentQuantity
 */
const calculateQuantityRemaining = (
  currentQuantity?: number, 
  initialQuantity?: number
): SeedPacket['quantityRemaining'] => {
  if (currentQuantity === undefined || currentQuantity === null) {
    return 'High'; // Default se non specificato
  }
  
  if (currentQuantity === 0) return 'Empty';
  
  // Se abbiamo initialQuantity, calcola percentuale
  if (initialQuantity && initialQuantity > 0) {
    const percentage = (currentQuantity / initialQuantity) * 100;
    if (percentage >= 75) return 'High';
    if (percentage >= 50) return 'Medium';
    if (percentage >= 25) return 'Low';
    return 'Empty';
  }
  
  // Fallback su valori assoluti
  if (currentQuantity >= 50) return 'High';
  if (currentQuantity >= 20) return 'Medium';
  if (currentQuantity >= 1) return 'Low';
  return 'Empty';
};

/**
 * Ottiene i semi con quantità bassa
 */
export const getLowStockSeeds = (gardenId: string): SeedPacket[] => {
  const packets = getSeedPackets(gardenId);
  return packets.filter(p => 
    p.quantityRemaining === 'Low' || p.quantityRemaining === 'Medium'
  );
};

/**
 * Usa semi per una semina (riduce la quantità numerica precisa)
 */
export const useSeedForPlanting = (gardenId: string, packetId: string, quantity: number = 1): boolean => {
  const packets = loadFromStorage(gardenId);
  const packet = packets.find(p => p.id === packetId);
  
  if (!packet) {
    return false;
  }
  
  // Se abbiamo quantità numerica, usala per calcolo preciso
  if (packet.currentQuantity !== undefined && packet.currentQuantity !== null) {
    const newQuantity = Math.max(0, packet.currentQuantity - quantity);
    const newQuantityRemaining = calculateQuantityRemaining(newQuantity, packet.initialQuantity);
    
    updateSeedPacket(gardenId, packetId, {
      currentQuantity: newQuantity,
      quantityRemaining: newQuantityRemaining
    });
    return newQuantity >= 0;
  }
  
  // Fallback su logica vecchia (per retrocompatibilità con pacchetti senza quantità numerica)
  if (packet.quantityRemaining === 'Empty') {
    return false;
  }
  
  const quantityMap: Record<string, number> = {
    'High': 3,
    'Medium': 2,
    'Low': 1,
    'Empty': 0
  };
  
  const currentValue = quantityMap[packet.quantityRemaining];
  const newValue = Math.max(0, currentValue - quantity);
  
  let newQuantity: SeedPacket['quantityRemaining'];
  if (newValue >= 3) {
    newQuantity = 'High';
  } else if (newValue >= 2) {
    newQuantity = 'Medium';
  } else if (newValue >= 1) {
    newQuantity = 'Low';
  } else {
    newQuantity = 'Empty';
  }
  
  updateSeedPacket(gardenId, packetId, { quantityRemaining: newQuantity });
  return true;
};

/**
 * Trova semi disponibili per una varietà/specie
 */
export const findSeedsForPlant = (
  gardenId: string, 
  speciesName: string, 
  varietyName?: string
): SeedPacket[] => {
  const packets = getSeedPackets(gardenId);
  return packets.filter(p => {
    const speciesMatch = p.speciesName.toLowerCase() === speciesName.toLowerCase();
    const varietyMatch = !varietyName || 
      p.varietyName.toLowerCase() === varietyName.toLowerCase();
    return speciesMatch && varietyMatch && p.quantityRemaining !== 'Empty';
  });
};

/**
 * Ottiene i semi scaduti (anno passato)
 */
export const getExpiredSeeds = (gardenId: string, currentYear: number): SeedPacket[] => {
  const packets = getSeedPackets(gardenId);
  return packets.filter(p => p.expiryYear < currentYear);
};

/**
 * Controlla se è Gennaio e mostra alert per semi scaduti
 */
export const shouldShowJanuaryAlert = (): boolean => {
  const month = new Date().getMonth() + 1;
  return month === 1; // Gennaio
};





