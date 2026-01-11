/**
 * API endpoint for Drone Flight Plans
 */

import { NextRequest, NextResponse } from 'next/server'
import { droneIntegrationService } from '@/services/droneIntegrationService'

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

    const flightPlans = await droneIntegrationService.getFlightPlans(gardenId)

    return NextResponse.json({
      success: true,
      data: flightPlans
    })

  } catch (error) {
    console.error('Error fetching flight plans:', error)
    return NextResponse.json(
      { error: 'Failed to fetch flight plans' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { gardenId, type, options } = body

    if (!gardenId || !type) {
      return NextResponse.json(
        { error: 'Garden ID and flight type are required' },
        { status: 400 }
      )
    }

    const flightPlan = await droneIntegrationService.createFlightPlan(gardenId, type, options || {})

    return NextResponse.json({
      success: true,
      data: flightPlan
    })

  } catch (error) {
    console.error('Error creating flight plan:', error)
    return NextResponse.json(
      { error: 'Failed to create flight plan' },
      { status: 500 }
    )
  }
}