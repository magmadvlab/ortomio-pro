/**
 * API endpoint for NFT Certificate Generation
 */

import { NextRequest, NextResponse } from 'next/server'
import { blockchainTraceabilityService } from '@/services/blockchainTraceabilityService'
import { accessErrorResponse, requireGardenAccess } from '@/lib/auth.server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, gardenId, certificateData } = body

    if (!productId || !gardenId || !certificateData) {
      return NextResponse.json(
        { error: 'Product ID, garden ID and certificate data are required' },
        { status: 400 }
      )
    }
    await requireGardenAccess(request, gardenId)

    const nftCertificate = await blockchainTraceabilityService.generateNFTCertificate(productId, gardenId, certificateData)

    return NextResponse.json({
      success: true,
      data: nftCertificate
    })

  } catch (error) {
    const accessResponse = accessErrorResponse(error)
    if (accessResponse) return accessResponse
    console.error('Error generating NFT certificate:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate NFT certificate' },
      { status: 500 }
    )
  }
}
