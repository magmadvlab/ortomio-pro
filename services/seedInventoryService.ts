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
  packets.push(packet);
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
    packets[index] = { ...packets[index], ...updates };
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
 * Ottiene i semi con quantità bassa
 */
export const getLowStockSeeds = (gardenId: string): SeedPacket[] => {
  const packets = getSeedPackets(gardenId);
  return packets.filter(p => 
    (p.quantityRemaining === 'Low' || p.quantityRemaining === 'Medium') &&
    p.quantityRemaining !== 'Empty'
  );
};

/**
 * Usa semi per una semina (riduce la quantità)
 */
export const useSeedForPlanting = (gardenId: string, packetId: string, quantity: number = 1): boolean => {
  const packets = loadFromStorage(gardenId);
  const packet = packets.find(p => p.id === packetId);
  
  if (!packet || packet.quantityRemaining === 'Empty') {
    return false;
  }
  
  // Logica di riduzione quantità
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




