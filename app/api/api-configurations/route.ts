import { NextRequest, NextResponse } from 'next/server';
import { verifyTier } from '@/lib/auth.server';
import { getSupabaseClient, isSupabaseAvailable } from '@/lib/auth.server';

export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseAvailable()) {
      return NextResponse.json({ configurations: [] });
    }

    const result = await verifyTier(request, ['FREE', 'PRO']);
    
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    
    const { user } = result;
    const supabase = getSupabaseClient();
    
    const { data: configurations, error } = await supabase
      .from('api_configurations')
      .select('*')
      .eq('user_id', user.id)
      .order('service_type', { ascending: true })
      .order('is_default', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    // Non restituire api_key_encrypted per sicurezza
    const safeConfigs = (configurations || []).map((config: any) => ({
      id: config.id,
      user_id: config.user_id,
      service_type: config.service_type,
      provider_name: config.provider_name,
      config: config.config,
      is_active: config.is_active,
      is_default: config.is_default,
      last_used_at: config.last_used_at,
      last_error: config.last_error,
      usage_count: config.usage_count,
      created_at: config.created_at,
      updated_at: config.updated_at,
    }));
    
    return NextResponse.json({ configurations: safeConfigs });
  } catch (error: any) {
    console.error('API configurations GET error:', error);
    return NextResponse.json(
      { error: 'internal_error', message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseAvailable()) {
      return NextResponse.json({ error: 'supabase_unavailable' }, { status: 500 });
    }

    const result = await verifyTier(request, ['FREE', 'PRO']);
    
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    
    const { user } = result;
    const body = await request.json();
    
    const {
      service_type,
      provider_name,
      api_key,
      config,
      is_default,
      is_active,
    } = body;
    
    // Validazione
    if (!service_type || !provider_name || !api_key) {
      return NextResponse.json(
        { error: 'missing_required_fields', message: 'Campi obbligatori: service_type, provider_name, api_key' },
        { status: 400 }
      );
    }
    
    // Valida service_type
    const validServiceTypes = [
      'ai_gemini', 'ai_openai', 'ai_anthropic', 'ai_ollama', 'ai_local',
      'weather_openmeteo', 'weather_weatherapi', 'weather_openweathermap', 'weather_custom'
    ];
    
    if (!validServiceTypes.includes(service_type)) {
      return NextResponse.json(
        { error: 'invalid_service_type', message: `Tipo servizio non valido: ${service_type}` },
        { status: 400 }
      );
    }
    
    // Cripta API key (semplificato - in produzione usa criptazione più sicura)
    const encryptedKey = Buffer.from(api_key).toString('base64');
    
    const supabase = getSupabaseClient();
    
    // Se is_default = true, imposta altri a false
    if (is_default) {
      await supabase
        .from('api_configurations')
        .update({ is_default: false })
        .eq('user_id', user.id)
        .eq('service_type', service_type)
        .eq('is_default', true);
    }
    
    const { data: configuration, error } = await supabase
      .from('api_configurations')
      .insert({
        user_id: user.id,
        service_type,
        provider_name,
        api_key_encrypted: encryptedKey,
        config: config || {},
        is_active: is_active ?? true,
        is_default: is_default ?? false,
      })
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    // Non restituire api_key_encrypted
    const safeConfig = {
      id: configuration.id,
      user_id: configuration.user_id,
      service_type: configuration.service_type,
      provider_name: configuration.provider_name,
      config: configuration.config,
      is_active: configuration.is_active,
      is_default: configuration.is_default,
      last_used_at: configuration.last_used_at,
      last_error: configuration.last_error,
      usage_count: configuration.usage_count,
    };
    
    return NextResponse.json({ configuration: safeConfig }, { status: 201 });
  } catch (error: any) {
    console.error('API configurations POST error:', error);
    return NextResponse.json(
      { error: 'internal_error', message: error.message },
      { status: 500 }
    );
  }
}

