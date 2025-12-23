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
 * Elimina un pacchetto di semi
 */
export const deleteSeedPacket = (gardenId: string, id: string): void => {
  const packets = loadFromStorage(gardenId);
  const filtered = packets.filter(p => p.id !== id);
  saveToStorage(gardenId, filtered);
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





