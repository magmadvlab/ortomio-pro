/**
 * API endpoint for AI Predictions
 */

import { NextRequest, NextResponse } from 'next/server'
import { aiPredictiveEngine } from '@/services/aiPredictiveEngine'
import { buildAIGroundingContext } from '@/services/aiGroundingService'
import { resolveGardenContext } from '@/services/gardenContextResolverService'
import { getDefaultStorageProvider } from '@/packages/core/storage/factory'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { gardenId, garden, weatherData, soilData, plantHealthData, tasks } = body

    if (!gardenId) {
      return NextResponse.json(
        { error: 'Garden ID is required' },
        { status: 400 }
      )
    }

    const storageProvider = getDefaultStorageProvider()
    const resolvedContext = await resolveGardenContext(storageProvider, gardenId).catch(() => null)
    const groundingGarden = resolvedContext?.garden || garden || null

    const grounding = groundingGarden
      ? buildAIGroundingContext({
          id: groundingGarden.id || gardenId,
          name: groundingGarden.name,
          gardenType: groundingGarden.gardenType,
          primaryCrop: groundingGarden.primaryCrop,
          indoorConfig: groundingGarden.indoorConfig,
          hydroponicConfig: groundingGarden.hydroponicConfig,
          aquaponicConfig: groundingGarden.aquaponicConfig,
          aeroponicConfig: groundingGarden.aeroponicConfig,
          greenhouseConfig: groundingGarden.greenhouseConfig,
          hasIndoor: groundingGarden.hasIndoor,
          hasGreenhouse: groundingGarden.hasGreenhouse,
        })
      : resolvedContext
        ? buildAIGroundingContext({
            id: resolvedContext.garden.id || gardenId,
            name: resolvedContext.garden.name,
            gardenType: resolvedContext.garden.gardenType,
            primaryCrop: resolvedContext.garden.primaryCrop,
            indoorConfig: resolvedContext.garden.indoorConfig,
            hydroponicConfig: resolvedContext.garden.hydroponicConfig,
            aquaponicConfig: resolvedContext.garden.aquaponicConfig,
            aeroponicConfig: resolvedContext.garden.aeroponicConfig,
            greenhouseConfig: resolvedContext.garden.greenhouseConfig,
            hasIndoor: resolvedContext.garden.hasIndoor,
            hasGreenhouse: resolvedContext.garden.hasGreenhouse,
          })
        : null

    // Generate AI predictions
    const [
      diseasePredicitions,
      yieldPredictions,
      resourceOptimizations
    ] = await Promise.all([
      aiPredictiveEngine.predictDiseases(gardenId, weatherData, soilData, plantHealthData, tasks),
      aiPredictiveEngine.predictYield(gardenId, weatherData, soilData, plantHealthData, tasks),
      aiPredictiveEngine.optimizeResources(gardenId, weatherData, soilData, plantHealthData, tasks)
    ])

    return NextResponse.json({
      success: true,
      data: {
        diseasePredicitions,
        yieldPredictions,
        resourceOptimizations,
        generatedAt: new Date().toISOString(),
        grounding,
      }
    })

  } catch (error) {
    console.error('Error generating AI predictions:', error)
    return NextResponse.json(
      { error: 'Failed to generate AI predictions' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const gardenId = searchParams.get('gardenId')

    if (!gardenId) {
      return NextResponse.json(
        { error: 'Garden ID is required' },
        { status: 400 }
      )
    }

    // Mock data for demonstration
    const mockWeatherData = {
      temperature: { current: 22, min: 18, max: 28, forecast15Days: Array(15).fill(0).map(() => 20 + Math.random() * 10) },
      humidity: 65,
      precipitation: { current: 0, forecast15Days: Array(15).fill(0).map(() => Math.random() * 5) },
      windSpeed: 8,
      pressure: 1013,
      uvIndex: 6,
      soilTemperature: 20
    }

    const mockSoilData = {
      ph: 6.8,
      ec: 1.2,
      moisture: 45,
      temperature: 20,
      nutrients: { nitrogen: 25, phosphorus: 18, potassium: 180, organicMatter: 3.5 },
      compaction: 15,
      lastAnalysis: new Date().toISOString()
    }

    const mockPlantHealthData = [
      {
        plantId: 'plant_1',
        healthScore: 85,
        growthStage: 'Flowering',
        stressIndicators: [],
        diseases: [],
        pests: [],
        nutritionalStatus: { nitrogen: 'ADEQUATE' as const, phosphorus: 'ADEQUATE' as const, potassium: 'ADEQUATE' as const },
        lastUpdate: new Date().toISOString()
      }
    ]

    // Generate predictions with mock data
    const [
      diseasePredicitions,
      yieldPredictions,
      resourceOptimizations
    ] = await Promise.all([
      aiPredictiveEngine.predictDiseases(gardenId, mockWeatherData, mockSoilData, mockPlantHealthData, []),
      aiPredictiveEngine.predictYield(gardenId, mockWeatherData, mockSoilData, mockPlantHealthData, []),
      aiPredictiveEngine.optimizeResources(gardenId, mockWeatherData, mockSoilData, mockPlantHealthData, [])
    ])

    return NextResponse.json({
      success: true,
      data: {
        diseasePredicitions,
        yieldPredictions,
        resourceOptimizations,
        generatedAt: new Date().toISOString(),
        grounding: null,
      }
    })

  } catch (error) {
    console.error('Error fetching AI predictions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch AI predictions' },
      { status: 500 }
    )
  }
}
