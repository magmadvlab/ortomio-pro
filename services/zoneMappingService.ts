/**
 * Zone Mapping Service
 * Gestisce la zonazione dell'orto per agricoltura di precisione
 */

import { SupabaseClient } from '@supabase/supabase-js';

export interface GardenZone {
  id: string;
  gardenId: string;
  name: string;
  description?: string;
  coordinates: Array<{ x: number; y: number }>; // Coordinate poligono in cm relativi al Visual Planner
  soilType?: 'Clay' | 'Sandy' | 'Loamy' | 'Peaty' | 'Chalky' | 'Silty';
  soilPh?: number;
  waterCapacity?: number; // mm/m
  soilDepthCm?: number;
  sunExposure?: 'FullSun' | 'PartSun' | 'Shade';
  dailySunHours?: number;
  areaSqMeters?: number;
  color: string;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateZoneInput {
  gardenId: string;
  name: string;
  description?: string;
  coordinates: Array<{ x: number; y: number }>;
  soilType?: 'Clay' | 'Sandy' | 'Loamy' | 'Peaty' | 'Chalky' | 'Silty';
  soilPh?: number;
  waterCapacity?: number;
  soilDepthCm?: number;
  sunExposure?: 'FullSun' | 'PartSun' | 'Shade';
  dailySunHours?: number;
  color?: string;
}

/**
 * Crea una nuova zona nell'orto
 */
export async function createZone(
  supabase: SupabaseClient,
  input: CreateZoneInput
): Promise<GardenZone> {
  // Calcola area approssimativa dalla bounding box delle coordinate
  const areaSqMeters = calculateZoneArea(input.coordinates);

  const { data, error } = await supabase
    .from('garden_zones')
    .insert({
      garden_id: input.gardenId,
      name: input.name,
      description: input.description,
      coordinates: input.coordinates,
      soil_type: input.soilType,
      soil_ph: input.soilPh,
      water_capacity: input.waterCapacity,
      soil_depth_cm: input.soilDepthCm,
      sun_exposure: input.sunExposure,
      daily_sun_hours: input.dailySunHours,
      area_sq_meters: areaSqMeters,
      color: input.color || generateZoneColor(),
      order_index: 0 // Verrà aggiornato dopo
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create zone: ${error.message}`);
  }

  return mapZoneFromDB(data);
}

/**
 * Recupera tutte le zone di un orto
 */
export async function getZonesByGarden(
  supabase: SupabaseClient,
  gardenId: string
): Promise<GardenZone[]> {
  const { data, error } = await supabase
    .from('garden_zones')
    .select('*')
    .eq('garden_id', gardenId)
    .order('order_index', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch zones: ${error.message}`);
  }

  return (data || []).map(mapZoneFromDB);
}

/**
 * Aggiorna una zona esistente
 */
export async function updateZone(
  supabase: SupabaseClient,
  zoneId: string,
  updates: Partial<CreateZoneInput>
): Promise<GardenZone> {
  const updateData: any = {};

  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.coordinates !== undefined) {
    updateData.coordinates = updates.coordinates;
    updateData.area_sq_meters = calculateZoneArea(updates.coordinates);
  }
  if (updates.soilType !== undefined) updateData.soil_type = updates.soilType;
  if (updates.soilPh !== undefined) updateData.soil_ph = updates.soilPh;
  if (updates.waterCapacity !== undefined) updateData.water_capacity = updates.waterCapacity;
  if (updates.soilDepthCm !== undefined) updateData.soil_depth_cm = updates.soilDepthCm;
  if (updates.sunExposure !== undefined) updateData.sun_exposure = updates.sunExposure;
  if (updates.dailySunHours !== undefined) updateData.daily_sun_hours = updates.dailySunHours;
  if (updates.color !== undefined) updateData.color = updates.color;

  const { data, error } = await supabase
    .from('garden_zones')
    .update(updateData)
    .eq('id', zoneId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update zone: ${error.message}`);
  }

  return mapZoneFromDB(data);
}

/**
 * Elimina una zona
 */
export async function deleteZone(
  supabase: SupabaseClient,
  zoneId: string
): Promise<void> {
  const { error } = await supabase
    .from('garden_zones')
    .delete()
    .eq('id', zoneId);

  if (error) {
    throw new Error(`Failed to delete zone: ${error.message}`);
  }
}

/**
 * Trova la zona che contiene un punto specifico
 */
export function findZoneForPoint(
  zones: GardenZone[],
  point: { x: number; y: number }
): GardenZone | null {
  for (const zone of zones) {
    if (isPointInPolygon(point, zone.coordinates)) {
      return zone;
    }
  }
  return null;
}

/**
 * Verifica se un punto è dentro un poligono (Point-in-Polygon algorithm)
 */
function isPointInPolygon(
  point: { x: number; y: number },
  polygon: Array<{ x: number; y: number }>
): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;

    const intersect = ((yi > point.y) !== (yj > point.y)) &&
      (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Calcola area approssimativa di una zona da coordinate poligono
 * Usa Shoelace formula per calcolo area poligono
 */
function calculateZoneArea(coordinates: Array<{ x: number; y: number }>): number {
  if (coordinates.length < 3) {
    return 0;
  }

  // Shoelace formula per area poligono
  let area = 0;
  for (let i = 0; i < coordinates.length; i++) {
    const j = (i + 1) % coordinates.length;
    area += coordinates[i].x * coordinates[j].y;
    area -= coordinates[j].x * coordinates[i].y;
  }
  area = Math.abs(area) / 2;

  // Converti da cm² a m² (assumendo coordinate in cm)
  // Per calcolo preciso serve conoscere scala Visual Planner
  // Per ora restituisce valore approssimativo
  const areaM2 = area / 10000; // 1 m² = 10000 cm²

  return Math.max(0.1, areaM2); // Minimo 0.1 m²
}

/**
 * Genera colore casuale per zona
 */
function generateZoneColor(): string {
  const colors = [
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#84cc16', // lime
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Mappa dati da database a tipo TypeScript
 */
function mapZoneFromDB(db: any): GardenZone {
  return {
    id: db.id,
    gardenId: db.garden_id,
    name: db.name,
    description: db.description,
    coordinates: db.coordinates || [],
    soilType: db.soil_type,
    soilPh: db.soil_ph ? Number(db.soil_ph) : undefined,
    waterCapacity: db.water_capacity ? Number(db.water_capacity) : undefined,
    soilDepthCm: db.soil_depth_cm,
    sunExposure: db.sun_exposure,
    dailySunHours: db.daily_sun_hours,
    areaSqMeters: db.area_sq_meters ? Number(db.area_sq_meters) : undefined,
    color: db.color || '#3b82f6',
    orderIndex: db.order_index || 0,
    createdAt: db.created_at,
    updatedAt: db.updated_at
  };
}







