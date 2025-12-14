import { NextRequest, NextResponse } from 'next/server'
import { getAdvice, searchAdvice } from '@/services/freeAdviceService'

export async function POST(request: NextRequest) {
  try {
    const { plant, issue, symptoms } = await request.json()
    
    if (!plant && !issue) {
      return NextResponse.json(
        { error: 'plant_or_issue_required' },
        { status: 400 }
      )
    }
    
    // Try exact match first
    let results: any[] = []
    
    if (plant && issue) {
      const exactMatch = getAdvice(plant, issue)
      if (exactMatch) {
        results = [exactMatch]
      }
    }
    
    // If no exact match, do fuzzy search
    if (results.length === 0) {
      results = searchAdvice({ plant, issue, symptoms })
    }
    
    // If still no results, return generic advice
    if (results.length === 0) {
      return NextResponse.json({
        advice: [
          {
            plant: plant || 'Pianta',
            issue: issue || 'Problema',
            cause: 'Non abbiamo informazioni specifiche per questo problema. Ti consigliamo di consultare un agronomo o fare upgrade a PRO per diagnosi AI personalizzata.',
            solution: 'Controlla le condizioni generali della pianta: irrigazione, esposizione solare, terreno. Verifica la presenza di parassiti o malattie visibili.',
            prevention: 'Mantieni buone pratiche agronomiche: rotazione colturale, concimazione bilanciata, monitoraggio regolare.',
            products: [],
          },
        ],
        source: 'generic',
      })
    }
    
    return NextResponse.json({
      advice: results,
      source: 'pre_generated',
    })
  } catch (error: any) {
    console.error('Free advice error:', error)
    return NextResponse.json(
      { error: 'internal_error', message: error.message },
      { status: 500 }
    )
  }
}








