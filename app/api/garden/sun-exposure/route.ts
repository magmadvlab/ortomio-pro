import { NextRequest, NextResponse } from 'next/server'
import { verifyTier } from '@/lib/auth'
import { getSupabaseClient, isSupabaseAvailable } from '@/lib/auth'
import {
  calculateDailySunHours,
  calculateMonthlySunHours,
  calculateOptimalPeriod,
  getExposureType,
  Obstacle3D,
} from '@/services/preciseSunCalculator'
import {
  calculateSeasonalWindows,
  classifyGardenType,
} from '@/services/seasonalSunWindows'
import {
  suggestPlantsForGardenType,
} from '@/services/seasonalPlantSuggestions'
import {
  findPlantingWindows,
} from '@/services/plantingWindowOptimizer'

/**
 * GET /api/garden/sun-exposure
 * Calcola esposizione solare per un giardino in una data specifica
 * 
 * Query params:
 * - gardenId: ID del giardino
 * - date: Data ISO (opzionale, default: oggi)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const gardenId = searchParams.get('gardenId')
    const dateParam = searchParams.get('date')
    
    if (!gardenId) {
      return NextResponse.json(
        { error: 'missing_garden_id' },
        { status: 400 }
      )
    }
    
    const targetDate = dateParam ? new Date(dateParam) : new Date()
    
    // In locale senza Supabase, restituisci calcolo mock
    if (!isSupabaseAvailable()) {
      // Mock data per sviluppo locale
      const mockObstacles: Obstacle3D[] = []
      const mockLat = 41.9028 // Roma
      const mockLng = 12.4964
      
      const dailyHours = calculateDailySunHours(mockLat, mockLng, targetDate, mockObstacles)
      
      return NextResponse.json({
        date: targetDate.toISOString().split('T')[0],
        dailySunHours: dailyHours,
        exposure: getExposureType(dailyHours),
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
    
    // Ottieni ostacoli del giardino
    const { data: obstaclesData, error: obstaclesError } = await supabase
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
    
    const dailyHours = calculateDailySunHours(lat, lng, targetDate, obstacles)
    
    return NextResponse.json({
      date: targetDate.toISOString().split('T')[0],
      dailySunHours: dailyHours,
      exposure: getExposureType(dailyHours),
      obstaclesCount: obstacles.length,
    })
  } catch (error: any) {
    console.error('Sun exposure GET error:', error)
    return NextResponse.json(
      { error: 'internal_error', message: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/garden/sun-exposure/monthly
 * Calcola ore di sole mensili per un giardino
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
      
      const monthlyHours = []
      for (let month = 1; month <= 12; month++) {
        const monthly = calculateMonthlySunHours(mockLat, mockLng, targetYear, month, mockObstacles)
        monthlyHours.push(monthly)
      }
      
      return NextResponse.json({ monthlySunHours: monthlyHours })
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
    
    const monthlyHours = []
    for (let month = 1; month <= 12; month++) {
      const monthly = calculateMonthlySunHours(lat, lng, targetYear, month, obstacles)
      monthlyHours.push(monthly)
    }
    
    return NextResponse.json({ monthlySunHours: monthlyHours })
  } catch (error: any) {
    console.error('Monthly sun hours POST error:', error)
    return NextResponse.json(
      { error: 'internal_error', message: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/garden/sun-exposure/optimal-period
 * Calcola periodo ottimale per un giardino
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { gardenId, minSunHours } = body
    
    if (!gardenId) {
      return NextResponse.json(
        { error: 'missing_garden_id' },
        { status: 400 }
      )
    }
    
    const targetMinSunHours = minSunHours || 6
    
    // In locale senza Supabase, restituisci calcolo mock
    if (!isSupabaseAvailable()) {
      const mockObstacles: Obstacle3D[] = []
      const mockLat = 41.9028
      const mockLng = 12.4964
      
      const optimal = calculateOptimalPeriod(mockLat, mockLng, mockObstacles, targetMinSunHours)
      
      return NextResponse.json(optimal)
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
    
    const optimal = calculateOptimalPeriod(lat, lng, obstacles, targetMinSunHours)
    
    return NextResponse.json(optimal)
  } catch (error: any) {
    console.error('Optimal period PUT error:', error)
    return NextResponse.json(
      { error: 'internal_error', message: error.message },
      { status: 500 }
    )
  }
}

