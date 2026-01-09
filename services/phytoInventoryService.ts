/**
 * Phyto Inventory Service
 * Gestisce inventario prodotti fitofarmaci, scorte, scadenze
 */

import { PhytoProduct } from '../data/phytoproducts';
import { UrgentAlert } from '../types';

export interface PhytoInventoryItem {
  id: string;
  gardenId: string;
  productId: string;
  productName: string;
  productType: PhytoProduct['type'];
  category: PhytoProduct['category'];
  quantity: number;
  unit: 'L' | 'kg' | 'units';
  expiryDate?: Date;
  safetyIntervalDays?: number;
  requiresLicense: boolean;
  allowedInOrganic: boolean;
  costPerUnit?: number;
  supplier?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Recupera inventario fitofarmaci
 */
export async function getPhytoInventory(gardenId: string): Promise<PhytoInventoryItem[]> {
  // TODO: Implementare recupero da Supabase
  const storageKey = `phyto_inventory_${gardenId}`;
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
export async function addPhytoProduct(
  gardenId: string,
  product: PhytoProduct,
  quantity: number,
  expiryDate?: Date,
  cost?: number,
  supplier?: string
): Promise<PhytoInventoryItem> {
  const inventory = await getPhytoInventory(gardenId);

  const existing = inventory.find((item) => item.productId === product.id);

  const newItem: PhytoInventoryItem = {
    id: existing?.id || `phyto_${Date.now()}`,
    gardenId,
    productId: product.id,
    productName: product.name,
    productType: product.type,
    category: product.category,
    quantity: existing ? existing.quantity + quantity : quantity,
    unit: product.dosage.unit.includes('mL') || product.dosage.unit.includes('L') ? 'L' : product.dosage.unit.includes('g') ? 'kg' : 'units',
    expiryDate,
    safetyIntervalDays: product.safetyInterval,
    requiresLicense: product.requiresLicense,
    allowedInOrganic: product.allowedInOrganic,
    costPerUnit: cost,
    supplier,
    createdAt: existing?.createdAt || new Date(),
    updatedAt: new Date(),
  };

  const updatedInventory = existing
    ? inventory.map((item) => (item.id === existing.id ? newItem : item))
    : [...inventory, newItem];

  const storageKey = `phyto_inventory_${gardenId}`;
  localStorage.setItem(storageKey, JSON.stringify(updatedInventory));

  return newItem;
}

/**
 * Verifica prodotti in scadenza
 */
export async function checkExpiryAlerts(gardenId: string): Promise<UrgentAlert[]> {
  const alerts: UrgentAlert[] = [];
  const inventory = await getPhytoInventory(gardenId);

  for (const item of inventory) {
    if (item.expiryDate) {
      const daysUntilExpiry = Math.ceil(
        (item.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysUntilExpiry < 0) {
        alerts.push({
          type: 'Planning',
          message: `⚠️ Prodotto scaduto: ${item.productName}`,
          action: 'Rimuovi dall\'inventario o smaltisci correttamente',
          blockOperations: false,
        });
      } else if (daysUntilExpiry <= 30) {
        alerts.push({
          type: 'Planning',
          message: `⚠️ Prodotto in scadenza: ${item.productName} (${daysUntilExpiry} giorni)`,
          action: 'Usa prima della scadenza o rinnova',
          blockOperations: false,
        });
      }
    }
  }

  return alerts;
}

/**
 * Verifica scorte basse
 */
export async function checkLowStock(
  gardenId: string,
  season: 'Spring' | 'Summer' | 'Autumn' | 'Winter'
): Promise<Array<{ item: PhytoInventoryItem; reason: string; urgency: 'low' | 'medium' | 'high' }>> {
  const inventory = await getPhytoInventory(gardenId);
  const lowStockItems: Array<{
    item: PhytoInventoryItem;
    reason: string;
    urgency: 'low' | 'medium' | 'high';
  }> = [];

  for (const item of inventory) {
    const minThreshold = item.unit === 'units' ? 5 : 0.5; // 5 trappole o 0.5L/kg

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
  }

  return lowStockItems;
}

/**
 * Prodotti necessari per trattamenti pianificati
 */
export async function getRequiredProducts(
  plannedTreatments: Array<{ productId: string; quantityNeeded: number; unit: string }>
): Promise<Array<{ productId: string; productName: string; needed: number; available: number; unit: string }>> {
  // TODO: Implementare logica completa
  return [];
}

