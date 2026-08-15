import { NextRequest, NextResponse } from 'next/server'
import { isSupabaseAvailable } from '@/lib/auth.server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const company = formData.get('company') as string | null
    const type = formData.get('type') as string
    const message = formData.get('message') as string
    const includeSystemInfo = formData.get('includeSystemInfo') === 'true'
    const systemInfo = formData.get('systemInfo') as string | null
    const screenshot = formData.get('screenshot') as File | null

    if (!name || !email || !type || !message || (type === 'guided_trial' && !company)) {
      return NextResponse.json({ error: 'Tutti i campi obbligatori devono essere compilati' }, { status: 400 })
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Email non valida' }, { status: 400 })
    }

    if (!isSupabaseAvailable()) {
      return NextResponse.json({ error: 'cloud_storage_unavailable' }, { status: 503 })
    }

    const { getSupabaseClient } = await import('@/lib/auth')
    const supabase = getSupabaseClient()
    let systemInfoJson = null
    if (systemInfo) {
      try { systemInfoJson = JSON.parse(systemInfo) } catch (error) { console.error('Error parsing system info:', error) }
    }

    let screenshotUrl = null
    if (screenshot) {
      try {
        const screenshotBuffer = await screenshot.arrayBuffer()
        const fileName = `support-${Date.now()}-${screenshot.name}`
        const { data: uploadData, error: uploadError } = await supabase.storage.from('support-screenshots').upload(fileName, screenshotBuffer, { contentType: screenshot.type, upsert: false })
        if (!uploadError && uploadData) screenshotUrl = supabase.storage.from('support-screenshots').getPublicUrl(fileName).data?.publicUrl || null
      } catch (error) { console.error('Error uploading screenshot:', error) }
    }

    const storedMessage = type === 'guided_trial' && company ? `Azienda: ${company}\n\n${message}` : message
    const { error: dbError } = await supabase.from('support_requests').insert({ name, email, type, message: storedMessage, screenshot_url: screenshotUrl, system_info: includeSystemInfo ? systemInfoJson : null, status: 'open' })
    if (dbError) throw dbError

    return NextResponse.json({ success: true, message: 'Richiesta inviata con successo' }, { status: 200 })
  } catch (error) {
    console.error('Error processing support request:', error)
    return NextResponse.json({ error: 'Errore nel processamento della richiesta' }, { status: 500 })
  }
}
