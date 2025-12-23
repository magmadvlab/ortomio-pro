import { NextRequest, NextResponse } from 'next/server';
import { verifyTier } from '@/lib/auth.server';
import { getSupabaseClient, isSupabaseAvailable } from '@/lib/auth.server';

/**
 * GET /api/api-configurations/[serviceType]
 * Recupera configurazione API attiva per un tipo servizio specifico
 * Restituisce anche api_key decriptata per uso interno del sistema
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ serviceType: string }> }
) {
  try {
    if (!isSupabaseAvailable()) {
      return NextResponse.json({ configuration: null });
    }

    const result = await verifyTier(request, ['FREE', 'PRO']);
    
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    
    const { user } = result;
    const { serviceType } = await params;
    const supabase = getSupabaseClient();
    
    const { data: configuration, error } = await supabase
      .from('api_configurations')
      .select('*')
      .eq('user_id', user.id)
      .eq('service_type', serviceType)
      .eq('is_active', true)
      .order('is_default', { ascending: false })
      .order('last_used_at', { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle();
    
    if (error) {
      console.error('API configuration GET error:', error);
      return NextResponse.json({ configuration: null });
    }
    
    if (!configuration) {
      return NextResponse.json({ configuration: null });
    }
    
    // Decripta API key per uso interno
    const apiKey = Buffer.from(configuration.api_key_encrypted, 'base64').toString('utf-8');
    
    // Restituisci configurazione con api_key decriptata
    return NextResponse.json({
      configuration: {
        id: configuration.id,
        user_id: configuration.user_id,
        service_type: configuration.service_type,
        provider_name: configuration.provider_name,
        api_key: apiKey,
        config: configuration.config,
        is_active: configuration.is_active,
        is_default: configuration.is_default,
        last_used_at: configuration.last_used_at,
        last_error: configuration.last_error,
        usage_count: configuration.usage_count,
      }
    });
  } catch (error: any) {
    console.error('API configuration GET error:', error);
    return NextResponse.json(
      { error: 'internal_error', message: error.message },
      { status: 500 }
    );
  }
}

