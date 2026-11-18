import { NextRequest, NextResponse } from 'next/server'
import { verifyTier, getSupabaseClient } from '@/lib/auth.server'
import { publicConfiguration } from '@/services/apiConfiguration.server'
export async function GET(request: NextRequest, { params }: { params: Promise<{ serviceType: string }> }) {
  const auth = await verifyTier(request, ['FREE', 'PLUS', 'PRO'])
  if ('error' in auth) return NextResponse.json({ message: auth.error }, { status: auth.status })
  const { serviceType } = await params
  const { data, error } = await getSupabaseClient().from('api_configurations').select('*').eq('user_id', auth.user.id).eq('service_name', serviceType).eq('is_active', true).order('is_default', { ascending: false }).order('updated_at', { ascending: false }).limit(1).maybeSingle()
  if (error) return NextResponse.json({ message: 'Configurazione non disponibile.' }, { status: 500 })
  return NextResponse.json({ configuration: data ? publicConfiguration(data) : null }, { headers: { 'Cache-Control': 'no-store' } })
}
