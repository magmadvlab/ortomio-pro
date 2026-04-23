/**
 * Land Zone Service
 * Gestione macro-zone del terreno per rotazione colture
 * Versione semplificata: nome + superficie, nessun GPS
 */

import { getSupabaseClient } from '@/config/supabase'

const getLandZoneSupabaseClient = () => {
  const supabase = getSupabaseClient()
  if (!supabase) {
    throw new Error('Supabase client not available')
  }

  return supabase
}

export interface LandZone {
  id: string
  garden_id: string
  user_id: string
  zone_name: string
  zone_code?: string
  area_hectares: number
  current_status: 'active' | 'resting'
  status_since: string
  soil_type?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface SoilMemory {
  id: string
  land_zone_id: string
  garden_id: string
  user_id: string
  field_row_id?: string
  crop_name: string
  crop_variety?: string
  crop_family: string
  crop_type?: string
  planting_date: string
  harvest_date?: string
  days_to_harvest?: number
  season_year: number
  season_type?: string
  yield_kg?: number
  yield_per_hectare?: number
  quality_rating?: number
  nitrogen_impact?: number
  fertilization_type?: string
  irrigation_method?: string
  treatments_count?: number
  success_score?: number
  planting_context?: any
  created_at: string
}

export interface ZoneRotationSuggestion {
  family: string
  reason: string
  score: number
  nitrogen_benefit: 'high' | 'medium' | 'low'
}

export interface ZoneSoilHealth {
  zone_id: string
  zone_name: string
  health_score: number
  nitrogen_balance: number
  diversity_score: number
  recent_crops_count: number
  recommendation: string
}

export interface ZoneHistoryEntry {
  crop_name: string
  crop_family: string
  planting_date: string
  harvest_date?: string
  yield_kg?: number
  quality_rating?: number
  success_score?: number
  season_year: number
  season_type?: string
}

/**
 * Ottiene tutte le zone di un orto
 */
export async function getLandZones(gardenId: string): Promise<LandZone[]> {
  try {
    const supabase = getLandZoneSupabaseClient()
    const { data, error } = await supabase
      .from('land_zones')
      .select('*')
      .eq('garden_id', gardenId)
      .order('zone_name', { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching land zones:', error)
    throw error
  }
}

/**
 * Ottiene una zona specifica
 */
export async function getLandZone(zoneId: string): Promise<LandZone | null> {
  try {
    const supabase = getLandZoneSupabaseClient()
    const { data, error } = await supabase
      .from('land_zones')
      .select('*')
      .eq('id', zoneId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching land zone:', error)
    return null
  }
}

/**
 * Crea una nuova zona
 */
export async function createLandZone(
  gardenId: string,
  userId: string,
  zoneData: {
    zone_name: string
    zone_code?: string
    area_hectares: number
    current_status?: 'active' | 'resting'
    soil_type?: string
    notes?: string
  }
): Promise<LandZone> {
  try {
    const supabase = getLandZoneSupabaseClient()
    const { data, error } = await supabase
      .from('land_zones')
      .insert({
        garden_id: gardenId,
        user_id: userId,
        ...zoneData
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating land zone:', error)
    throw error
  }
}

/**
 * Aggiorna una zona
 */
export async function updateLandZone(
  zoneId: string,
  updates: Partial<Omit<LandZone, 'id' | 'garden_id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<LandZone> {
  try {
    const supabase = getLandZoneSupabaseClient()
    const { data, error } = await supabase
      .from('land_zones')
      .update(updates)
      .eq('id', zoneId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating land zone:', error)
    throw error
  }
}

/**
 * Elimina una zona
 */
export async function deleteLandZone(zoneId: string): Promise<void> {
  try {
    const supabase = getLandZoneSupabaseClient()
    const { error } = await supabase
      .from('land_zones')
      .delete()
      .eq('id', zoneId)

    if (error) throw error
  } catch (error) {
    console.error('Error deleting land zone:', error)
    throw error
  }
}

/**
 * Cambia lo status di una zona (active <-> resting)
 */
export async function toggleZoneStatus(zoneId: string): Promise<LandZone> {
  try {
    // Get current zone
    const zone = await getLandZone(zoneId)
    if (!zone) throw new Error('Zone not found')

    // Toggle status
    const newStatus = zone.current_status === 'active' ? 'resting' : 'active'

    return await updateLandZone(zoneId, {
      current_status: newStatus,
      status_since: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error toggling zone status:', error)
    throw error
  }
}

/**
 * Ottiene suggerimenti di rotazione per una zona
 */
export async function getZoneRotationSuggestions(
  zoneId: string,
  yearsBack: number = 4
): Promise<ZoneRotationSuggestion[]> {
  try {
    const supabase = getLandZoneSupabaseClient()
    const { data, error } = await supabase
      .rpc('get_zone_rotation_suggestions', {
        zone_id: zoneId,
        years_back: yearsBack
      })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching zone rotation suggestions:', error)
    return []
  }
}

/**
 * Calcola la salute del terreno di una zona
 */
export async function calculateZoneSoilHealth(zoneId: string): Promise<ZoneSoilHealth | null> {
  try {
    const supabase = getLandZoneSupabaseClient()
    const { data, error } = await supabase
      .rpc('calculate_zone_soil_health', {
        zone_id: zoneId
      })

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error calculating zone soil health:', error)
    return null
  }
}

/**
 * Ottiene lo storico completo di una zona
 */
export async function getZoneHistory(
  zoneId: string,
  yearsBack: number = 10
): Promise<ZoneHistoryEntry[]> {
  try {
    const supabase = getLandZoneSupabaseClient()
    const { data, error } = await supabase
      .rpc('get_zone_history', {
        zone_id: zoneId,
        years_back: yearsBack
      })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching zone history:', error)
    return []
  }
}

/**
 * Ottiene la memoria del terreno per una zona
 */
export async function getZoneSoilMemory(zoneId: string): Promise<SoilMemory[]> {
  try {
    const supabase = getLandZoneSupabaseClient()
    const { data, error } = await supabase
      .from('soil_memory')
      .select('*')
      .eq('land_zone_id', zoneId)
      .order('planting_date', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching zone soil memory:', error)
    return []
  }
}

/**
 * Conta i filari attivi in una zona
 */
export async function countActiveFieldRowsInZone(zoneId: string): Promise<number> {
  try {
    const supabase = getLandZoneSupabaseClient()
    const { count, error } = await supabase
      .from('garden_rows')
      .select('*', { count: 'exact', head: true })
      .eq('land_zone_id', zoneId)
      .eq('is_active', true)

    if (error) throw error
    return count || 0
  } catch (error) {
    console.error('Error counting field rows in zone:', error)
    return 0
  }
}

/**
 * Ottiene i filari di una zona
 */
export async function getFieldRowsInZone(zoneId: string): Promise<any[]> {
  try {
    const supabase = getLandZoneSupabaseClient()
    const { data, error } = await supabase
      .from('garden_rows')
      .select('*')
      .eq('land_zone_id', zoneId)
      .eq('is_active', true)
      .order('row_number', { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching field rows in zone:', error)
    return []
  }
}

/**
 * Ottiene statistiche aggregate per una zona
 */
export async function getZoneStats(zoneId: string): Promise<{
  totalFieldRows: number
  totalPlants: number
  activeFieldRows: number
  totalYieldKg: number
  avgQualityRating: number
  lastCropFamily?: string
}> {
  try {
    const supabase = getLandZoneSupabaseClient()
    
    // Count field rows
    const fieldRowsCount = await countActiveFieldRowsInZone(zoneId)

    // Get soil memory stats
    const { data: memoryData, error: memoryError } = await supabase
      .from('soil_memory')
      .select('yield_kg, quality_rating, crop_family, planting_date')
      .eq('land_zone_id', zoneId)
      .order('planting_date', { ascending: false })

    if (memoryError) throw memoryError

    const totalYieldKg = memoryData?.reduce((sum: number, m: any) => sum + (m.yield_kg || 0), 0) || 0
    const avgQualityRating = memoryData?.length 
      ? memoryData.reduce((sum: number, m: any) => sum + (m.quality_rating || 0), 0) / memoryData.length
      : 0
    const lastCropFamily = memoryData?.[0]?.crop_family

    return {
      totalFieldRows: fieldRowsCount,
      totalPlants: 0, // TODO: Calculate from field rows
      activeFieldRows: fieldRowsCount,
      totalYieldKg,
      avgQualityRating: Math.round(avgQualityRating * 10) / 10,
      lastCropFamily
    }
  } catch (error) {
    console.error('Error fetching zone stats:', error)
    return {
      totalFieldRows: 0,
      totalPlants: 0,
      activeFieldRows: 0,
      totalYieldKg: 0,
      avgQualityRating: 0
    }
  }
}
