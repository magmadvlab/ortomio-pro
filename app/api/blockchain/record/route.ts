/**
 * API endpoint for Blockchain Record Creation
 */

import { NextRequest, NextResponse } from 'next/server'
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

    return NextResponse.json({
      error: 'blockchain_lab_only',
      message: 'Nessun provider blockchain reale e configurato; hash sintetici non possono creare evidenza commerciale.',
      simulated: true,
      certificationEligible: false,
    }, { status: 501 })

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
