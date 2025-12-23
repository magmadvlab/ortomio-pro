import { NextRequest, NextResponse } from 'next/server'
import { verifyTier } from '@/lib/auth.server'
import { getSupabaseClient, isSupabaseAvailable } from '@/lib/auth.server'
import {
  calculateSeasonalWindows,
  classifyGardenType,
} from '@/services/seasonalSunWindows'
import {
  suggestPlantsForGardenType,
} from '@/services/seasonalPlantSuggestions'
import { Obstacle3D } from '@/services/preciseSunCalculator'

/**
 * GET /api/garden/sun-exposure/plant-suggestions
 * Suggerisce piante per tipo orto
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const gardenId = searchParams.get('gardenId')
    const yearParam = searchParams.get('year')
    
    if (!gardenId) {
      return NextResponse.json(
        { error: 'missing_garden_id' },
        { status: 400 }
      )
    }
    
    const targetYear = yearParam ? parseInt(yearParam) : new Date().getFullYear()
    
    // In locale senza Supabase, restituisci calcolo mock
    if (!isSupabaseAvailable()) {
      const mockObstacles: Obstacle3D[] = []
      const mockLat = 41.9028
      const mockLng = 12.4964
      
      const windows = calculateSeasonalWindows(mockLat, mockLng, mockObstacles, targetYear)
      const classification = classifyGardenType(windows)
      const suggestions = suggestPlantsForGardenType(
        classification,
        windows,
        mockLat,
        mockLng,
        mockObstacles,
        targetYear
      )
      
      return NextResponse.json({
        suggestions,
        classification,
      })
    }
    
    // Verify user authentication
    const result = await verifyTier(request, [])
    
    // Se non autenticato, restituisci suggerimenti mock invece di errore 401
    // Questo permette al client di mostrare suggerimenti anche senza autenticazione
    if ('error' in result) {
      if (result.status === 401) {
        // Utente non autenticato: restituisci suggerimenti mock basati su coordinate di default
        const mockObstacles: Obstacle3D[] = []
        const mockLat = 41.9028 // Roma
        const mockLng = 12.4964
        
        const windows = calculateSeasonalWindows(mockLat, mockLng, mockObstacles, targetYear)
        const classification = classifyGardenType(windows)
        const suggestions = suggestPlantsForGardenType(
          classification,
          windows,
          mockLat,
          mockLng,
          mockObstacles,
          targetYear
        )
        
        // Serializza le date per la risposta JSON
        const serializedSuggestions = suggestions.map(s => ({
          ...s,
          plantingWindow: {
            start: s.plantingWindow.start.toISOString(),
            end: s.plantingWindow.end.toISOString(),
          },
        }))
        
        return NextResponse.json({
          suggestions: serializedSuggestions,
          classification,
        })
      }
      // Altri errori: restituisci errore
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
    const suggestions = suggestPlantsForGardenType(
      classification,
      windows,
      lat,
      lng,
      obstacles,
      targetYear
    )
    
    // Serializza le date per la risposta JSON
    const serializedSuggestions = suggestions.map(s => ({
      ...s,
      plantingWindow: {
        start: s.plantingWindow.start.toISOString(),
        end: s.plantingWindow.end.toISOString(),
      },
    }))
    
    return NextResponse.json({
      suggestions: serializedSuggestions,
      classification,
    })
  } catch (error: any) {
    console.error('Plant suggestions GET error:', error)
    return NextResponse.json(
      { error: 'internal_error', message: error.message },
      { status: 500 }
    )
  }
}

