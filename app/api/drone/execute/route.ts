/**
 * API endpoint for Drone Flight Execution
 */

import { NextRequest, NextResponse } from 'next/server'
import { droneIntegrationService } from '@/services/droneIntegrationService'
import { accessErrorResponse, requireGardenAccess } from '@/lib/auth.server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { flightPlanId, mode } = body

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
    if (mode !== 'simulation') {
      return NextResponse.json({ error: 'drone_provider_unavailable', message: 'Questo modulo e un simulatore missione. Specifica mode=simulation per il laboratorio.' }, { status: 501 })
    }
    const results = await droneIntegrationService.simulateFlightPlan(flightPlanId)

    return NextResponse.json({
      success: true,
      simulated: true,
      certificationEligible: false,
      operationalLedgerEligible: false,
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
