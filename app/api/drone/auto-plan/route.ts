/**
 * API endpoint for Automatic Drone Flight Planning
 */

import { NextRequest, NextResponse } from 'next/server'
import { droneIntegrationService } from '@/services/droneIntegrationService'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { gardenId } = body

    if (!gardenId) {
      return NextResponse.json(
        { error: 'Garden ID is required' },
        { status: 400 }
      )
    }

    const flightPlan = await droneIntegrationService.generateAutomaticFlightPlan(gardenId)

    return NextResponse.json({
      success: true,
      data: flightPlan
    })

  } catch (error) {
    console.error('Error generating automatic flight plan:', error)
    return NextResponse.json(
      { error: 'Failed to generate automatic flight plan' },
      { status: 500 }
    )
  }
}