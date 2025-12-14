import { NextRequest, NextResponse } from 'next/server'
import { verifyTier } from '@/lib/auth.server'
import { getSupabaseClient, isSupabaseAvailable } from '@/lib/auth.server'

/**
 * GET /api/paziente/richieste-rinnovo
 * Ottiene le richieste di rinnovo, filtrate per stato se specificato
 */
export async function GET(request: NextRequest) {
  try {
    // In locale senza Supabase, restituisci dati mock
    if (!isSupabaseAvailable()) {
      const { searchParams } = new URL(request.url)
      const stato = searchParams.get('stato')
      
      const mockData = [
        {
          id: '1',
          pazienteId: 'p1',
          pazienteNome: 'Mario Rossi',
          dataRichiesta: '2024-01-15',
          dataScadenza: '2024-02-15',
          stato: 'in_attesa',
          note: 'Richiesta di rinnovo abbonamento trimestrale'
        },
        {
          id: '2',
          pazienteId: 'p2',
          pazienteNome: 'Luigi Bianchi',
          dataRichiesta: '2024-01-10',
          dataScadenza: '2024-02-10',
          stato: 'in_attesa',
          note: 'Richiesta di rinnovo abbonamento mensile'
        },
        {
          id: '3',
          pazienteId: 'p3',
          pazienteNome: 'Anna Verdi',
          dataRichiesta: '2024-01-05',
          dataScadenza: '2024-02-05',
          stato: 'approvata',
          note: 'Rinnovo approvato'
        },
        {
          id: '4',
          pazienteId: 'p4',
          pazienteNome: 'Giuseppe Neri',
          dataRichiesta: '2024-01-01',
          dataScadenza: '2024-02-01',
          stato: 'rifiutata',
          note: 'Rinnovo rifiutato - motivo: pagamento non ricevuto'
        }
      ]
      
      let filtered = mockData
      if (stato && stato !== 'tutti') {
        filtered = mockData.filter(r => r.stato === stato)
      }
      
      return NextResponse.json({ richieste: filtered })
    }

    // Verify tier (potrebbe essere PRO_PROFESSIONAL o altro a seconda dei requisiti)
    const result = await verifyTier(request, ['PRO_PROFESSIONAL', 'PRO_CONSUMER'])
    
    if ('error' in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      )
    }
    
    const { user } = result
    const { searchParams } = new URL(request.url)
    const stato = searchParams.get('stato')
    
    const supabase = getSupabaseClient()
    
    // TODO: Quando la tabella sarà creata, sostituire con query reale
    // Esempio di query:
    /*
    let query = supabase
      .from('richieste_rinnovo')
      .select('*')
      .order('data_richiesta', { ascending: false })
    
    if (stato && stato !== 'tutti') {
      query = query.eq('stato', stato)
    }
    
    const { data: richieste, error } = await query
    
    if (error) {
      throw error
    }
    
    return NextResponse.json({ richieste: richieste || [] })
    */
    
    // Per ora restituisci dati mock anche con Supabase disponibile
    // (fino a quando la tabella non sarà creata)
    const mockData = [
      {
        id: '1',
        pazienteId: 'p1',
        pazienteNome: 'Mario Rossi',
        dataRichiesta: '2024-01-15',
        dataScadenza: '2024-02-15',
        stato: 'in_attesa',
        note: 'Richiesta di rinnovo abbonamento trimestrale'
      },
      {
        id: '2',
        pazienteId: 'p2',
        pazienteNome: 'Luigi Bianchi',
        dataRichiesta: '2024-01-10',
        dataScadenza: '2024-02-10',
        stato: 'in_attesa',
        note: 'Richiesta di rinnovo abbonamento mensile'
      },
      {
        id: '3',
        pazienteId: 'p3',
        pazienteNome: 'Anna Verdi',
        dataRichiesta: '2024-01-05',
        dataScadenza: '2024-02-05',
        stato: 'approvata',
        note: 'Rinnovo approvato'
      }
    ]
    
    let filtered = mockData
    if (stato && stato !== 'tutti') {
      filtered = mockData.filter(r => r.stato === stato)
    }
    
    return NextResponse.json({ richieste: filtered })
  } catch (error: any) {
    console.error('Richieste rinnovo GET error:', error)
    return NextResponse.json(
      { error: 'internal_error', message: error.message },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/paziente/richieste-rinnovo
 * Aggiorna lo stato di una richiesta di rinnovo (approva/rifiuta)
 */
export async function PATCH(request: NextRequest) {
  try {
    // In locale senza Supabase, simula successo
    if (!isSupabaseAvailable()) {
      const body = await request.json()
      const { id, azione } = body // azione: 'approva' | 'rifiuta'
      
      const nuovoStato = azione === 'approva' ? 'approvata' : 'rifiutata'
      
      return NextResponse.json({
        success: true,
        richiesta: {
          id,
          stato: nuovoStato,
          updated_at: new Date().toISOString()
        }
      })
    }

    // Verify tier
    const result = await verifyTier(request, ['PRO_PROFESSIONAL', 'PRO_CONSUMER'])
    
    if ('error' in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      )
    }
    
    const { user } = result
    const body = await request.json()
    const { id, azione } = body // azione: 'approva' | 'rifiuta'
    
    if (!id || !azione) {
      return NextResponse.json(
        { error: 'missing_required_fields', message: 'id e azione sono obbligatori' },
        { status: 400 }
      )
    }
    
    if (!['approva', 'rifiuta'].includes(azione)) {
      return NextResponse.json(
        { error: 'invalid_action', message: 'azione deve essere "approva" o "rifiuta"' },
        { status: 400 }
      )
    }
    
    const nuovoStato = azione === 'approva' ? 'approvata' : 'rifiutata'
    const supabase = getSupabaseClient()
    
    // TODO: Quando la tabella sarà creata, sostituire con update reale
    // Esempio di query:
    /*
    const { data: richiesta, error } = await supabase
      .from('richieste_rinnovo')
      .update({
        stato: nuovoStato,
        updated_at: new Date().toISOString(),
        approvato_da: user.id,
        approvato_il: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      throw error
    }
    
    return NextResponse.json({ success: true, richiesta })
    */
    
    // Per ora restituisci successo mock
    return NextResponse.json({
      success: true,
      richiesta: {
        id,
        stato: nuovoStato,
        updated_at: new Date().toISOString()
      }
    })
  } catch (error: any) {
    console.error('Richieste rinnovo PATCH error:', error)
    return NextResponse.json(
      { error: 'internal_error', message: error.message },
      { status: 500 }
    )
  }
}


