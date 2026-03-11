/**
 * Field Row Crop History Service
 * Gestisce lo storico completo delle colture per ogni filare
 * con rotazione intelligente e tracciamento contesto
 */

import { getSupabaseClient } from '@/config/supabase';
import { createOperationContextService, OperationContext, OperationContextWeatherSource } from './operationContextService';

// ============================================
// TYPES
// ============================================

export interface PlantingContext {
  weather: {
    temp: number;
    humidity: number;
    condition: string;
    source?: OperationContextWeatherSource;
  };
  moon: {
    phase: string;
    emoji: string;
    illumination: number;
    waxing: boolean;
  };
  season: string;
  daylight: {
    sunrise: string;
    sunset: string;
    hours: number;
  };
  gps?: {
    lat: number;
    lng: number;
  };
}

export interface CropHistoryEntry {
  id: string;
  garden_row_id: string;
  garden_id: string;
  user_id: string;
  
  // Dati Coltura
  crop_name: string;
  crop_variety?: string;
  crop_family: string;
  crop_type: string;
  
  // Date
  planting_date: string;
  harvest_date?: string;
  days_to_harvest?: number;
  
  // Contesto
  planting_context: PlantingContext;
  
  // Performance
  yield_kg?: number;
  quality_rating?: number;
  health_issues: string[];
  
  // Gestione
  irrigation_method?: string;
  fertilization_type?: string;
  treatments_count: number;
  
  // Note
  notes?: string;
  success_factors: string[];
  problems: string[];
  
  // AI
  ai_recommendations: any;
  rotation_score?: number;
  
  created_at: string;
  updated_at: string;
}

export interface RotationSuggestion {
  family: string;
  reason: string;
  score: number;
}

export interface RotationAnalysis {
  row_id: string;
  row_name: string;
  total_crops: number;
  families_used: number;
  last_planting?: string;
  avg_rotation_score: number;
  avg_quality: number;
  total_yield_kg: number;
}

// ============================================
// CROP FAMILIES DATABASE
// ============================================

export const CROP_FAMILIES = {
  'Solanacee': ['pomodoro', 'peperone', 'melanzana', 'patata'],
  'Leguminose': ['fagiolo', 'pisello', 'fava', 'cece', 'lenticchia'],
  'Crucifere': ['cavolo', 'cavolfiore', 'broccolo', 'rapa', 'ravanello'],
  'Cucurbitacee': ['zucchina', 'zucca', 'cetriolo', 'melone', 'anguria'],
  'Liliacee': ['cipolla', 'aglio', 'porro', 'scalogno'],
  'Composite': ['lattuga', 'cicoria', 'carciofo', 'girasole'],
  'Ombrellifere': ['carota', 'sedano', 'prezzemolo', 'finocchio'],
  'Chenopodiacee': ['bietola', 'spinacio', 'barbabietola']
};

export const CROP_TYPES = {
  'frutto': ['pomodoro', 'peperone', 'melanzana', 'zucchina', 'cetriolo'],
  'foglia': ['lattuga', 'spinacio', 'bietola', 'cavolo'],
  'radice': ['carota', 'rapa', 'ravanello', 'barbabietola'],
  'bulbo': ['cipolla', 'aglio', 'porro'],
  'legume': ['fagiolo', 'pisello', 'fava', 'cece']
};

function getRequiredSupabaseClient() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase client not available');
  }
  return supabase;
}

function mapOperationContextToPlantingContext(
  context: OperationContext,
  gps?: { lat: number; lng: number }
): PlantingContext {
  return {
    weather: {
      temp: context.weather.temperature,
      humidity: context.weather.humidity,
      condition: context.weather.condition,
      source: context.weather.source
    },
    moon: {
      phase: context.lunar.phase,
      emoji: context.lunar.phaseEmoji,
      illumination: context.lunar.illumination,
      waxing: context.lunar.isWaxing
    },
    season: context.season,
    daylight: {
      sunrise: context.daylight.sunrise,
      sunset: context.daylight.sunset,
      hours: context.daylight.hoursOfLight
    },
    gps
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Determina la famiglia botanica di una coltura
 */
export function getCropFamily(cropName: string): string {
  const normalizedName = cropName.toLowerCase();
  
  for (const [family, crops] of Object.entries(CROP_FAMILIES)) {
    if (crops.some(crop => normalizedName.includes(crop))) {
      return family;
    }
  }
  
  return 'Altro';
}

/**
 * Determina il tipo di coltura
 */
export function getCropType(cropName: string): string {
  const normalizedName = cropName.toLowerCase();
  
  for (const [type, crops] of Object.entries(CROP_TYPES)) {
    if (crops.some(crop => normalizedName.includes(crop))) {
      return type;
    }
  }
  
  return 'altro';
}

/**
 * Cattura il contesto di impianto (meteo, luna, stagione)
 */
export async function capturePlantingContext(
  gardenId: string,
  gps?: { lat: number; lng: number },
  plantingDate?: Date
): Promise<PlantingContext> {
  const operationContextService = createOperationContextService();
  const effectiveDate = plantingDate || new Date();

  try {
    const supabase = getRequiredSupabaseClient();
    
    // Ottieni coordinate se non fornite
    let coordinates = gps;
    if (!coordinates) {
      const { data: garden } = await supabase
        .from('gardens')
        .select('gps_coordinates')
        .eq('id', gardenId)
        .single();
      
      if (garden?.gps_coordinates) {
        coordinates = garden.gps_coordinates;
      }
    }

    const context = coordinates
      ? await operationContextService.getOperationContext(
          coordinates.lat,
          coordinates.lng,
          effectiveDate
        )
      : operationContextService.buildEstimatedContext(effectiveDate, gps?.lat || 45);

    return mapOperationContextToPlantingContext(context, coordinates);
  } catch (error) {
    console.error('Error capturing planting context:', error);

    return mapOperationContextToPlantingContext(
      operationContextService.buildFallbackContext(effectiveDate, gps?.lat || 45),
      gps
    );
  }
}

// ============================================
// CRUD OPERATIONS
// ============================================

/**
 * Registra una nuova coltura nello storico
 */
export async function recordCropPlanting(data: {
  gardenRowId: string;
  gardenId: string;
  cropName: string;
  cropVariety?: string;
  plantingDate?: Date;
  notes?: string;
  gps?: { lat: number; lng: number };
}): Promise<CropHistoryEntry | null> {
  try {
    const supabase = getRequiredSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    // Cattura contesto
    const plantingDate = data.plantingDate || new Date();
    const context = await capturePlantingContext(data.gardenId, data.gps, plantingDate);
    
    // Determina famiglia e tipo
    const cropFamily = getCropFamily(data.cropName);
    const cropType = getCropType(data.cropName);
    
    // Calcola rotation score
    const rotationScore = await calculateRotationScore(
      data.gardenRowId,
      cropFamily
    );
    
    const entry = {
      garden_row_id: data.gardenRowId,
      garden_id: data.gardenId,
      user_id: user.id,
      crop_name: data.cropName,
      crop_variety: data.cropVariety,
      crop_family: cropFamily,
      crop_type: cropType,
      planting_date: plantingDate.toISOString(),
      planting_context: context,
      rotation_score: rotationScore,
      notes: data.notes,
      health_issues: [],
      success_factors: [],
      problems: [],
      treatments_count: 0,
      ai_recommendations: {}
    };
    
    const { data: result, error } = await supabase
      .from('field_row_crop_history')
      .insert(entry)
      .select()
      .single();
    
    if (error) throw error;
    
    return result;
  } catch (error) {
    console.error('Error recording crop planting:', error);
    return null;
  }
}

/**
 * Registra il raccolto di una coltura
 */
export async function recordCropHarvest(
  historyId: string,
  data: {
    harvestDate?: Date;
    yieldKg?: number;
    qualityRating?: number;
    notes?: string;
    successFactors?: string[];
    problems?: string[];
  }
): Promise<boolean> {
  try {
    const supabase = getRequiredSupabaseClient();
    const harvestDate = data.harvestDate || new Date();
    
    // Calcola giorni al raccolto
    const { data: history } = await supabase
      .from('field_row_crop_history')
      .select('planting_date')
      .eq('id', historyId)
      .single();
    
    let daysToHarvest = 0;
    if (history) {
      const plantingDate = new Date(history.planting_date);
      daysToHarvest = Math.floor(
        (harvestDate.getTime() - plantingDate.getTime()) / (1000 * 60 * 60 * 24)
      );
    }
    
    const { error } = await supabase
      .from('field_row_crop_history')
      .update({
        harvest_date: harvestDate.toISOString(),
        days_to_harvest: daysToHarvest,
        yield_kg: data.yieldKg,
        quality_rating: data.qualityRating,
        notes: data.notes,
        success_factors: data.successFactors || [],
        problems: data.problems || []
      })
      .eq('id', historyId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error recording crop harvest:', error);
    return false;
  }
}

/**
 * Ottiene lo storico di un filare
 */
export async function getFieldRowHistory(
  rowId: string
): Promise<CropHistoryEntry[]> {
  try {
    const supabase = getRequiredSupabaseClient();
    const { data, error } = await supabase
      .from('field_row_crop_history')
      .select('*')
      .eq('garden_row_id', rowId)
      .order('planting_date', { ascending: false });
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error getting field row history:', error);
    return [];
  }
}

/**
 * Calcola il punteggio di rotazione per una nuova coltura
 */
export async function calculateRotationScore(
  rowId: string,
  newCropFamily: string
): Promise<number> {
  try {
    const supabase = getRequiredSupabaseClient();
    const { data, error } = await supabase
      .rpc('calculate_rotation_score', {
        row_id: rowId,
        new_crop_family: newCropFamily
      });
    
    if (error) throw error;
    
    return data || 100;
  } catch (error) {
    console.error('Error calculating rotation score:', error);
    return 100; // Default: nessuna penalità
  }
}

/**
 * Ottiene suggerimenti di rotazione per un filare
 */
export async function getRotationSuggestions(
  rowId: string
): Promise<RotationSuggestion[]> {
  try {
    const supabase = getRequiredSupabaseClient();
    const { data, error } = await supabase
      .rpc('get_rotation_suggestions', {
        row_id: rowId
      });
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error getting rotation suggestions:', error);
    return [];
  }
}

/**
 * Ottiene l'analisi di rotazione per tutti i filari di un orto
 */
export async function getGardenRotationAnalysis(
  gardenId: string
): Promise<RotationAnalysis[]> {
  try {
    const supabase = getRequiredSupabaseClient();
    const { data, error } = await supabase
      .from('field_row_rotation_analysis')
      .select('*')
      .eq('garden_id', gardenId);
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error getting garden rotation analysis:', error);
    return [];
  }
}

/**
 * Aggiorna le performance di una coltura
 */
export async function updateCropPerformance(
  historyId: string,
  data: {
    yieldKg?: number;
    qualityRating?: number;
    healthIssues?: string[];
    treatmentsCount?: number;
    irrigationMethod?: string;
    fertilizationType?: string;
  }
): Promise<boolean> {
  try {
    const supabase = getRequiredSupabaseClient();
    const updates: any = {};
    
    if (data.yieldKg !== undefined) updates.yield_kg = data.yieldKg;
    if (data.qualityRating !== undefined) updates.quality_rating = data.qualityRating;
    if (data.healthIssues !== undefined) updates.health_issues = data.healthIssues;
    if (data.treatmentsCount !== undefined) updates.treatments_count = data.treatmentsCount;
    if (data.irrigationMethod !== undefined) updates.irrigation_method = data.irrigationMethod;
    if (data.fertilizationType !== undefined) updates.fertilization_type = data.fertilizationType;
    
    const { error } = await supabase
      .from('field_row_crop_history')
      .update(updates)
      .eq('id', historyId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error updating crop performance:', error);
    return false;
  }
}

/**
 * Ottiene statistiche per famiglia di colture
 */
export async function getCropFamilyStats(): Promise<any[]> {
  try {
    const supabase = getRequiredSupabaseClient();
    const { data, error } = await supabase
      .from('crop_performance_by_family')
      .select('*');
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error getting crop family stats:', error);
    return [];
  }
}

export const fieldRowCropHistoryService = {
  recordCropPlanting,
  recordCropHarvest,
  getFieldRowHistory,
  calculateRotationScore,
  getRotationSuggestions,
  getGardenRotationAnalysis,
  updateCropPerformance,
  getCropFamilyStats,
  capturePlantingContext,
  getCropFamily,
  getCropType,
  CROP_FAMILIES,
  CROP_TYPES
};
