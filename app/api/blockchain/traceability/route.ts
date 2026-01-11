/**
 * API endpoint for Blockchain Traceability
 */

import { NextRequest, NextResponse } from 'next/server'
import { blockchainTraceabilityService } from '@/services/blockchainTraceabilityService'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const gardenId = searchParams.get('gardenId')

    if (productId) {
      // Get specific product traceability
      const chain = await blockchainTraceabilityService.getTraceabilityChain(productId)
      
      if (!chain) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: chain
      })
    }

    if (gardenId) {
      // Get all chains for garden
      const chains = await blockchainTraceabilityService.getAllChains(gardenId)
      
      return NextResponse.json({
        success: true,
        data: chains
      })
    }

    return NextResponse.json(
      { error: 'Product ID or Garden ID is required' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Error fetching traceability data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch traceability data' },
      { status: 500 }
    )
  }
}