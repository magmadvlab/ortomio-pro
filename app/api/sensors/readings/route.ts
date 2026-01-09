import { NextRequest, NextResponse } from 'next/server';
import { verifyTier } from '@/lib/auth.server';
import { getSupabaseClient, isSupabaseAvailable } from '@/lib/auth.server';
import { saveSensorReading, SensorType, validateSensorValue } from '@/services/sensorDataService';

// Rate limiting: max 100 letture/minuto per garden
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(gardenId: string): boolean {
  const now = Date.now();
  const key = `garden_${gardenId}`;
  const limit = rateLimitMap.get(key);

  if (!limit || now > limit.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + 60000 }); // Reset dopo 1 minuto
    return true;
  }

  if (limit.count >= 100) {
    return false; // Rate limit exceeded
  }

  limit.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // In locale senza Supabase, simula successo
    if (!isSupabaseAvailable()) {
      const body = await request.json();
      return NextResponse.json({
        reading: {
          id: crypto.randomUUID(),
          ...body,
          reading_date: body.reading_date || new Date().toISOString(),
          is_simulated: body.is_simulated ?? false,
        },
      });
    }

    // Verifica autenticazione (tier PRO non richiesto, anche FREE può avere sensori)
    const result = await verifyTier(request, ['FREE', 'PRO']);

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const { user } = result;
    const body = await request.json();

    const {
      garden_id,
      zone_id,
      irrigation_zone_id,
      sensor_type,
      value,
      unit,
      reading_date,
      sensor_id,
      is_simulated,
    } = body;

    // Validazione campi obbligatori
    if (!garden_id || !sensor_type || value === undefined || !unit) {
      return NextResponse.json(
        { error: 'missing_required_fields', message: 'Campi obbligatori: garden_id, sensor_type, value, unit' },
        { status: 400 }
      );
    }

    // Validazione sensor_type
    const validSensorTypes: SensorType[] = [
      'moisture',
      'temperature_soil',
      'temperature_air',
      'humidity_air',
      'ph',
      'ec',
      'light',
      'wind',
    ];

    if (!validSensorTypes.includes(sensor_type)) {
      return NextResponse.json(
        { error: 'invalid_sensor_type', message: `Tipo sensore non valido: ${sensor_type}` },
        { status: 400 }
      );
    }

    // Validazione valore
    if (!validateSensorValue(sensor_type, value)) {
      return NextResponse.json(
        { error: 'invalid_value', message: `Valore ${value} fuori range per sensore ${sensor_type}` },
        { status: 400 }
      );
    }

    // Rate limiting
    if (!checkRateLimit(garden_id)) {
      return NextResponse.json(
        { error: 'rate_limit_exceeded', message: 'Troppe richieste. Max 100 letture/minuto per garden.' },
        { status: 429 }
      );
    }

    // Verifica che garden appartenga all'utente
    const supabase = getSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ error: 'supabase_unavailable' }, { status: 500 });
    }

    const { data: garden, error: gardenError } = await supabase
      .from('gardens')
      .select('id, user_id')
      .eq('id', garden_id)
      .single();

    if (gardenError || !garden) {
      return NextResponse.json(
        { error: 'garden_not_found', message: `Garden ${garden_id} non trovato` },
        { status: 404 }
      );
    }

    if (garden.user_id !== user.id) {
      return NextResponse.json(
        { error: 'unauthorized', message: 'Garden non appartiene all\'utente' },
        { status: 403 }
      );
    }

    // Verifica zone_id se fornito
    if (zone_id) {
      const { data: zone, error: zoneError } = await supabase
        .from('garden_zones')
        .select('id, garden_id')
        .eq('id', zone_id)
        .single();

      if (zoneError || !zone || zone.garden_id !== garden_id) {
        return NextResponse.json(
          { error: 'zone_not_found', message: `Zone ${zone_id} non trovata o non appartiene al garden` },
          { status: 404 }
        );
      }
    }

    // Verifica irrigation_zone_id se fornito
    if (irrigation_zone_id) {
      const { data: irrigationZone, error: irrigationZoneError } = await supabase
        .from('irrigation_zones')
        .select('id, garden_id')
        .eq('id', irrigation_zone_id)
        .single();

      if (irrigationZoneError || !irrigationZone || irrigationZone.garden_id !== garden_id) {
        return NextResponse.json(
          { error: 'irrigation_zone_not_found', message: `Irrigation zone ${irrigation_zone_id} non trovata o non appartiene al garden` },
          { status: 404 }
        );
      }
    }

    // Salva lettura sensore
    const reading = await saveSensorReading({
      garden_id,
      zone_id,
      irrigation_zone_id,
      sensor_type,
      value: parseFloat(value.toString()),
      unit,
      reading_date: reading_date || new Date().toISOString(),
      sensor_id,
      is_simulated: is_simulated ?? false,
    });

    return NextResponse.json({ reading }, { status: 201 });
  } catch (error: any) {
    console.error('Sensor readings POST error:', error);
    return NextResponse.json(
      { error: 'internal_error', message: error.message },
      { status: 500 }
    );
  }
}

