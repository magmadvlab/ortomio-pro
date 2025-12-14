/**
 * Tillage Tools Database
 * Database attrezzi per lavorazioni terra: manuali e meccanici
 */

import { Garden } from '../types';

export interface TillageTool {
  id: string;
  name: string;
  type: 'manual' | 'mechanical';
  category: 'primary' | 'complementary';
  workDepth: { min: number; max: number }; // cm
  suitableSoilTypes: Garden['soilType'][];
  suitableArea: { min: number; max?: number }; // m²
  maintenanceRequired: boolean;
  maintenanceInterval?: number; // giorni
  cost?: number; // €
  notes?: string;
}

/**
 * Attrezzi manuali
 */
export const manualTools: TillageTool[] = [
  {
    id: 'vanga',
    name: 'Vanga',
    type: 'manual',
    category: 'primary',
    workDepth: { min: 20, max: 40 },
    suitableSoilTypes: ['Loamy', 'Clay', 'Sandy'],
    suitableArea: { min: 0, max: 200 },
    maintenanceRequired: true,
    maintenanceInterval: 90, // Affilatura ogni 3 mesi
    notes: 'Attrezzo principale per vangatura. Affilare regolarmente.',
  },
  {
    id: 'zappa',
    name: 'Zappa',
    type: 'manual',
    category: 'complementary',
    workDepth: { min: 5, max: 15 },
    suitableSoilTypes: ['Loamy', 'Clay', 'Sandy'],
    suitableArea: { min: 0, max: 500 },
    maintenanceRequired: true,
    maintenanceInterval: 60,
    notes: 'Per lavorazioni superficiali e sarchiatura.',
  },
  {
    id: 'forca',
    name: 'Forca',
    type: 'manual',
    category: 'complementary',
    workDepth: { min: 15, max: 30 },
    suitableSoilTypes: ['Clay', 'Loamy'],
    suitableArea: { min: 0, max: 300 },
    maintenanceRequired: false,
    notes: 'Ottima per terreni argillosi. Non taglia radici come vanga.',
  },
  {
    id: 'estirpatore',
    name: 'Estirpatore',
    type: 'manual',
    category: 'complementary',
    workDepth: { min: 10, max: 20 },
    suitableSoilTypes: ['Loamy', 'Sandy'],
    suitableArea: { min: 0, max: 200 },
    maintenanceRequired: true,
    maintenanceInterval: 90,
    notes: 'Per rimuovere radici e sassi.',
  },
  {
    id: 'sarchiatore',
    name: 'Sarchiatore',
    type: 'manual',
    category: 'complementary',
    workDepth: { min: 3, max: 8 },
    suitableSoilTypes: ['Loamy', 'Clay', 'Sandy'],
    suitableArea: { min: 0, max: 1000 },
    maintenanceRequired: true,
    maintenanceInterval: 30,
    notes: 'Per sarchiatura tra file colture.',
  },
  {
    id: 'rastrello',
    name: 'Rastrello',
    type: 'manual',
    category: 'complementary',
    workDepth: { min: 0, max: 5 },
    suitableSoilTypes: ['Loamy', 'Sandy'],
    suitableArea: { min: 0, max: 500 },
    maintenanceRequired: false,
    notes: 'Per affinare terreno pre-semina.',
  },
];

/**
 * Attrezzi meccanici
 */
export const mechanicalTools: TillageTool[] = [
  {
    id: 'motozappa',
    name: 'Motozappa',
    type: 'mechanical',
    category: 'primary',
    workDepth: { min: 15, max: 25 },
    suitableSoilTypes: ['Loamy', 'Sandy'],
    suitableArea: { min: 100, max: 2000 },
    maintenanceRequired: true,
    maintenanceInterval: 180, // Manutenzione ogni 6 mesi
    cost: 300,
    notes: 'Per aree medie. Attenzione a non creare suola di lavorazione.',
  },
  {
    id: 'motocoltivatore',
    name: 'Motocoltivatore',
    type: 'mechanical',
    category: 'primary',
    workDepth: { min: 20, max: 35 },
    suitableSoilTypes: ['Loamy', 'Clay', 'Sandy'],
    suitableArea: { min: 500, max: 5000 },
    maintenanceRequired: true,
    maintenanceInterval: 180,
    cost: 2000,
    notes: 'Per aree grandi. Più versatile della motozappa.',
  },
  {
    id: 'trattore_aratro',
    name: 'Trattore con Aratro',
    type: 'mechanical',
    category: 'primary',
    workDepth: { min: 25, max: 40 },
    suitableSoilTypes: ['Loamy', 'Clay'],
    suitableArea: { min: 2000 },
    maintenanceRequired: true,
    maintenanceInterval: 365,
    cost: 15000,
    notes: 'Solo per superfici molto grandi. Evita inversione strati.',
  },
  {
    id: 'trattore_fresatrice',
    name: 'Trattore con Fresatrice',
    type: 'mechanical',
    category: 'primary',
    workDepth: { min: 15, max: 30 },
    suitableSoilTypes: ['Loamy', 'Sandy'],
    suitableArea: { min: 1000 },
    maintenanceRequired: true,
    maintenanceInterval: 180,
    cost: 12000,
    notes: 'Per preparazione letto semina su grandi superfici.',
  },
];

/**
 * Tutti gli attrezzi
 */
export const allTillageTools: TillageTool[] = [...manualTools, ...mechanicalTools];

/**
 * Helper functions
 */
export function getToolById(id: string): TillageTool | undefined {
  return allTillageTools.find((t) => t.id === id);
}

export function getToolsByType(type: 'manual' | 'mechanical'): TillageTool[] {
  return allTillageTools.filter((t) => t.type === type);
}

export function getToolsForArea(area: number): TillageTool[] {
  return allTillageTools.filter((t) => {
    return area >= t.suitableArea.min && (!t.suitableArea.max || area <= t.suitableArea.max);
  });
}

export function getToolsForSoilType(soilType: Garden['soilType']): TillageTool[] {
  return allTillageTools.filter((t) => t.suitableSoilTypes.includes(soilType));
}

