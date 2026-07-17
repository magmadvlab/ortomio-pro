/**
 * API endpoint for Blockchain Record Creation
 */

import { NextRequest, NextResponse } from 'next/server'
import { blockchainTraceabilityService } from '@/services/blockchainTraceabilityService'
import { accessErrorResponse, requireGardenAccess } from '@/lib/auth.server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, gardenId, plantId, data } = body

    if (!type || !gardenId || !data) {
      return NextResponse.json(
        { error: 'Type, garden ID, and data are required' },
        { status: 400 }
      )
    }
    await requireGardenAccess(request, gardenId)

    let record

    switch (type) {
      case 'SEED':
        if (!plantId) {
          return NextResponse.json(
            { error: 'Plant ID is required for seed planting records' },
            { status: 400 }
          )
        }
        record = await blockchainTraceabilityService.recordSeedPlanting(gardenId, plantId, data)
        break

      case 'PLANT':
        if (!plantId) {
          return NextResponse.json(
            { error: 'Plant ID is required for plant growth records' },
            { status: 400 }
          )
        }
        record = await blockchainTraceabilityService.recordPlantGrowth(plantId, data)
        break

      case 'TREATMENT':
        if (!plantId) {
          return NextResponse.json(
            { error: 'Plant ID is required for treatment records' },
            { status: 400 }
          )
        }
        record = await blockchainTraceabilityService.recordTreatment(plantId, data)
        break

      case 'HARVEST':
        if (!plantId) {
          return NextResponse.json(
            { error: 'Plant ID is required for harvest records' },
            { status: 400 }
          )
        }
        record = await blockchainTraceabilityService.recordHarvest(plantId, data)
        break

      default:
        return NextResponse.json(
          { error: 'Invalid record type' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      data: record
    })

  } catch (error) {
    const accessResponse = accessErrorResponse(error)
    if (accessResponse) return accessResponse
    console.error('Error creating blockchain record:', error)
    return NextResponse.json(
      { error: 'Failed to create blockchain record' },
      { status: 500 }
    )
  }
}
