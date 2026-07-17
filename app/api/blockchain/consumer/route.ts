/**
 * API endpoint for Consumer Traceability App
 */

import { NextRequest, NextResponse } from 'next/server'
import { blockchainTraceabilityService } from '@/services/blockchainTraceabilityService'
import { accessErrorResponse, requireUser } from '@/lib/auth.server'

export async function GET(request: NextRequest) {
  try {
    await requireUser(request)
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    const traceabilityData = await blockchainTraceabilityService.getConsumerTraceability(productId)

    return NextResponse.json({
      success: true,
      simulated: true,
      certificationEligible: false,
      data: traceabilityData
    })

  } catch (error) {
    const accessResponse = accessErrorResponse(error)
    if (accessResponse) return accessResponse
    console.error('Error fetching consumer traceability:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch traceability data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireUser(request)
    const body = await request.json()
    const { productId } = body

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      error: 'traceability_demo_only', message: 'QR commerciale disabilitato: il ledger disponibile e simulato.',
      simulated: true, certificationEligible: false,
    }, { status: 501 })

  } catch (error) {
    const accessResponse = accessErrorResponse(error)
    if (accessResponse) return accessResponse
    console.error('Error generating consumer QR:', error)
    return NextResponse.json(
      { error: 'Failed to generate consumer QR' },
      { status: 500 }
    )
  }
}
