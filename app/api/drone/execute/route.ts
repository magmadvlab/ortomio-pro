/**
 * API endpoint for Drone Flight Execution
 */

import { NextRequest, NextResponse } from 'next/server'
import { droneIntegrationService } from '@/services/droneIntegrationService'
import { accessErrorResponse, requireGardenAccess } from '@/lib/auth.server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { flightPlanId } = body

    if (!flightPlanId) {
      return NextResponse.json(
        { error: 'Flight plan ID is required' },
        { status: 400 }
      )
    }

    const flightPlan = await droneIntegrationService.getFlightPlan(flightPlanId)
    if (!flightPlan) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 })
    }
    await requireGardenAccess(request, flightPlan.gardenId)

    const results = await droneIntegrationService.executeFlightPlan(flightPlanId)

    return NextResponse.json({
      success: true,
      data: results
    })

  } catch (error) {
    const accessResponse = accessErrorResponse(error)
    if (accessResponse) return accessResponse
    console.error('Error executing flight plan:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to execute flight plan' },
      { status: 500 }
    )
  }
}
