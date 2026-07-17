/**
 * API endpoint for NFT Certificate Generation
 */

import { NextRequest, NextResponse } from 'next/server'
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

    return NextResponse.json({
      error: 'nft_lab_only', message: 'Mint NFT disabilitato: nessun provider blockchain reale configurato.',
      simulated: true, certificationEligible: false,
    }, { status: 501 })

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
