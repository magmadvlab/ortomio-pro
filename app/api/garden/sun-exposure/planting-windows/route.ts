import { NextRequest, NextResponse } from 'next/server'
import { verifyTier } from '@/lib/auth'
import { getSupabaseClient, isSupabaseAvailable } from '@/lib/auth'
import {
  calculateSeasonalWindows,
  classifyGardenType,
} from '@/services/seasonalSunWindows'
import {
  findPlantingWindows,
} from '@/services/plantingWindowOptimizer'
import { Obstacle3D } from '@/services/preciseSunCalculator'

/**
 * POST /api/garden/sun-exposure/planting-windows
 * Trova finestre impianto ottimali per un giardino
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { gardenId, year } = body
    
    if (!gardenId) {
      return NextResponse.json(
        { error: 'missing_garden_id' },
        { status: 400 }
      )
    }
    
    const targetYear = year || new Date().getFullYear()
    
    // In locale senza Supabase, restituisci calcolo mock
    if (!isSupabaseAvailable()) {
      const mockObstacles: Obstacle3D[] = []
      const mockLat = 41.9028
      const mockLng = 12.4964
      
      const windows = calculateSeasonalWindows(mockLat, mockLng, mockObstacles, targetYear)
      const classification = classifyGardenType(windows)
      const plantingWindows = findPlantingWindows(
        classification,
        windows,
        mockLat,
        mockLng,
        mockObstacles,
        targetYear
      )
      
      return NextResponse.json({
        plantingWindows,
        classification,
      })
    }
    
    // Verify user authentication
    const result = await verifyTier(request, [])
    
    if ('error' in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      )
    }
    
    const { user } = result
    const supabase = getSupabaseClient()
    
    // Ottieni giardino
    const { data: garden, error: gardenError } = await supabase
      .from('gardens')
      .select('*')
      .eq('id', gardenId)
      .eq('user_id', user.id)
      .single()
    
    if (gardenError || !garden) {
      return NextResponse.json(
        { error: 'garden_not_found' },
        { status: 404 }
      )
    }
    
    if (!garden.coordinates) {
      return NextResponse.json(
        { error: 'garden_missing_coordinates' },
        { status: 400 }
      )
    }
    
    // Ottieni ostacoli
    const { data: obstaclesData } = await supabase
      .from('garden_obstacles')
      .select('*')
      .eq('garden_id', gardenId)
    
    const obstacles: Obstacle3D[] = (obstaclesData || []).map(obs => ({
      azimuth: parseFloat(obs.azimuth),
      height: parseFloat(obs.height_meters),
      distance: parseFloat(obs.distance_meters),
      widthDegrees: parseFloat(obs.width_degrees || 30),
      type: obs.type as Obstacle3D['type'],
    }))
    
    const lat = garden.coordinates.latitude
    const lng = garden.coordinates.longitude
    
    const windows = calculateSeasonalWindows(lat, lng, obstacles, targetYear)
    const classification = classifyGardenType(windows)
    const plantingWindows = findPlantingWindows(
      classification,
      windows,
      lat,
      lng,
      obstacles,
      targetYear
    )
    
    // Serializza le date per la risposta JSON
    const serializedWindows = plantingWindows.map(w => ({
      ...w,
      startDate: w.startDate.toISOString(),
      endDate: w.endDate.toISOString(),
      adjustedStartDate: w.adjustedStartDate?.toISOString(),
    }))
    
    return NextResponse.json({
      plantingWindows: serializedWindows,
      classification,
    })
  } catch (error: any) {
    console.error('Planting windows POST error:', error)
    return NextResponse.json(
      { error: 'internal_error', message: error.message },
      { status: 500 }
    )
  }
}

