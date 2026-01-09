/**
 * Fertilizer Inventory Service
 * Gestisce inventario prodotti fertilizzanti, scorte, alert
 */

import { FertilizerProduct } from '../data/fertilizers';
import { UrgentAlert } from '../types';

export interface FertilizerInventoryItem {
  id: string;
  gardenId: string;
  productId: string;
  productName: string;
  productType: FertilizerProduct['type'];
  category: FertilizerProduct['category'];
  quantity: number;
  unit: 'kg' | 'L' | 'bags';
  expiryDate?: Date;
  costPerUnit?: number;
  supplier?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlannedFertilizerUsage {
  productId: string;
  productName: string;
  quantityNeeded: number;
  unit: string;
  timing: 'pre_planting' | 'top_dressing' | 'post_harvest';
  season: 'Spring' | 'Summer' | 'Autumn' | 'Winter';
  urgency: 'low' | 'medium' | 'high';
}

/**
 * Recupera inventario fertilizzanti
 */
export async function getFertilizerInventory(gardenId: string): Promise<FertilizerInventoryItem[]> {
  // TODO: Implementare recupero da Supabase
  // Per ora, mock da localStorage
  const storageKey = `fertilizer_inventory_${gardenId}`;
  const stored = localStorage.getItem(storageKey);
  if (stored) {
    return JSON.parse(stored).map((item: any) => ({
      ...item,
      expiryDate: item.expiryDate ? new Date(item.expiryDate) : undefined,
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt),
    }));
  }
  return [];
}

/**
 * Aggiunge prodotto all'inventario
 */
export async function addFertilizerProduct(
  gardenId: string,
  product: FertilizerProduct,
  quantity: number,
  cost?: number,
  expiryDate?: Date,
  supplier?: string
): Promise<FertilizerInventoryItem> {
  const inventory = await getFertilizerInventory(gardenId);

  // Verifica se prodotto già esiste
  const existing = inventory.find((item) => item.productId === product.id);

  const newItem: FertilizerInventoryItem = {
    id: existing?.id || `fert_${Date.now()}`,
    gardenId,
    productId: product.id,
    productName: product.name,
    productType: product.type,
    category: product.category,
    quantity: existing ? existing.quantity + quantity : quantity,
    unit: product.dosagePerSqm.unit.includes('g') ? 'kg' : 'L',
    expiryDate,
    costPerUnit: cost,
    supplier,
    createdAt: existing?.createdAt || new Date(),
    updatedAt: new Date(),
  };

  // Aggiorna inventario
  const updatedInventory = existing
    ? inventory.map((item) => (item.id === existing.id ? newItem : item))
    : [...inventory, newItem];

  // Salva in localStorage (temporaneo)
  const storageKey = `fertilizer_inventory_${gardenId}`;
  localStorage.setItem(storageKey, JSON.stringify(updatedInventory));

  return newItem;
}

/**
 * Aggiorna quantità prodotto
 */
export async function updateFertilizerQuantity(
  productId: string,
  gardenId: string,
  quantity: number
): Promise<void> {
  const inventory = await getFertilizerInventory(gardenId);
  const item = inventory.find((i) => i.id === productId);

  if (!item) {
    throw new Error(`Prodotto ${productId} non trovato nell'inventario`);
  }

  item.quantity = quantity;
  item.updatedAt = new Date();

  const storageKey = `fertilizer_inventory_${gardenId}`;
  localStorage.setItem(storageKey, JSON.stringify(inventory));
}

/**
 * Verifica scorte basse
 */
export async function checkLowStock(
  gardenId: string,
  season: 'Spring' | 'Summer' | 'Autumn' | 'Winter'
): Promise<Array<{ item: FertilizerInventoryItem; reason: string; urgency: 'low' | 'medium' | 'high' }>> {
  const inventory = await getFertilizerInventory(gardenId);
  const lowStockItems: Array<{
    item: FertilizerInventoryItem;
    reason: string;
    urgency: 'low' | 'medium' | 'high';
  }> = [];

  for (const item of inventory) {
    // Soglia minima: 1kg o 1L
    const minThreshold = 1;

    if (item.quantity < minThreshold) {
      lowStockItems.push({
        item,
        reason: `Scorta molto bassa: ${item.quantity}${item.unit}`,
        urgency: 'high',
      });
    } else if (item.quantity < minThreshold * 3) {
      lowStockItems.push({
        item,
        reason: `Scorta bassa: ${item.quantity}${item.unit}`,
        urgency: 'medium',
      });
    }

    // Verifica scadenze
    if (item.expiryDate) {
      const daysUntilExpiry = Math.ceil(
        (item.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysUntilExpiry < 0) {
        lowStockItems.push({
          item,
          reason: `Prodotto scaduto il ${item.expiryDate.toLocaleDateString('it-IT')}`,
          urgency: 'high',
        });
      } else if (daysUntilExpiry <= 30) {
        lowStockItems.push({
          item,
          reason: `Prodotto in scadenza tra ${daysUntilExpiry} giorni`,
          urgency: 'medium',
        });
      }
    }
  }

  return lowStockItems;
}

/**
 * Genera alert per scorte insufficienti rispetto a uso pianificato
 */
export async function getFertilizerAlerts(
  gardenId: string,
  plannedUsage: PlannedFertilizerUsage[]
): Promise<UrgentAlert[]> {
  const alerts: UrgentAlert[] = [];
  const inventory = await getFertilizerInventory(gardenId);

  // Raggruppa uso pianificato per prodotto
  const usageByProduct = new Map<string, PlannedFertilizerUsage[]>();
  for (const usage of plannedUsage) {
    if (!usageByProduct.has(usage.productId)) {
      usageByProduct.set(usage.productId, []);
    }
    usageByProduct.get(usage.productId)!.push(usage);
  }

  // Verifica scorte vs necessità
  for (const [productId, usages] of usageByProduct) {
    const totalNeeded = usages.reduce((sum, u) => sum + u.quantityNeeded, 0);
    const inventoryItem = inventory.find((i) => i.productId === productId);

    if (!inventoryItem) {
      // Prodotto necessario ma non in inventario
      alerts.push({
        type: 'Planning',
        message: `⚠️ Prodotto necessario ma non in inventario: ${usages[0].productName}`,
        action: `Aggiungi ${totalNeeded}${usages[0].unit} all'inventario per ${usages[0].season}`,
        blockOperations: false,
      });
    } else {
      const available = inventoryItem.quantity;
      const percentage = (available / totalNeeded) * 100;

      if (percentage < 20) {
        // Scorte < 20% necessità
        alerts.push({
          type: 'Planning',
          message: `⚠️ Scorte insufficienti: ${inventoryItem.productName}`,
          action: `Disponibili: ${available}${inventoryItem.unit}, necessari: ${totalNeeded}${usages[0].unit}. Aggiungi almeno ${Math.ceil(totalNeeded - available)}${usages[0].unit}`,
          blockOperations: false,
        });
      } else if (percentage < 50) {
        // Scorte < 50% necessità
        alerts.push({
          type: 'Planning',
          message: `⚠️ Scorte basse: ${inventoryItem.productName}`,
          action: `Disponibili: ${available}${inventoryItem.unit}, necessari: ${totalNeeded}${usages[0].unit}. Considera di rifornire`,
          blockOperations: false,
        });
      }
    }
  }

  // Verifica scorte basse generali
  const lowStock = await checkLowStock(gardenId, 'Summer');
  for (const { item, reason, urgency } of lowStock) {
    if (urgency === 'high') {
      alerts.push({
        type: 'Planning',
        message: `⚠️ ${reason}: ${item.productName}`,
        action: urgency === 'high' ? 'Rifornisci immediatamente' : 'Considera di rifornire',
        blockOperations: false,
      });
    }
  }

  return alerts;
}

/**
 * Suggerisce acquisto prodotto con timing
 */
export function suggestPurchaseTiming(
  productId: string,
  season: 'Spring' | 'Summer' | 'Autumn' | 'Winter'
): { message: string; urgency: 'low' | 'medium' | 'high' } {
  // Prodotti stagionali comuni
  const seasonalProducts: Record<string, { season: string; message: string }> = {
    bone_meal: {
      season: 'Autumn',
      message: 'Cornunghia quasi finita, serve per concimazione autunnale frutteto',
    },
    manure_bovine: {
      season: 'Autumn',
      message: 'Letame necessario per concimazione autunnale. Ordina ora per avere tempo di maturazione',
    },
  };

  const suggestion = seasonalProducts[productId];
  if (suggestion && suggestion.season === season) {
    return {
      message: suggestion.message,
      urgency: 'high',
    };
  }

  return {
    message: 'Considera di rifornire prima della stagione',
    urgency: 'medium',
  };
}

