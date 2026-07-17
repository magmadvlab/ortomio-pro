import { NextRequest, NextResponse } from 'next/server';
import { accessErrorResponse, getSupabaseClient, isAccessError, isSupabaseAvailable, requireGardenAccess, requireUser } from '@/lib/auth.server';
import { isBypassActive } from '@/lib/auth-bypass';
import {
  saveSensorReading,
  SensorType,
  SUPPORTED_SENSOR_TYPES,
  validateCalibrationStatus,
  validateDataQualityScore,
  validatePercentageMetric,
  validateSensorValue,
} from '@/services/sensorDataService';

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
    await requireUser(request);
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
      provider,
      data_quality_score,
      calibration_status,
      battery_level_percentage,
      signal_strength,
    } = body;

    // Validazione campi obbligatori
    if (!garden_id || !sensor_type || value === undefined || !unit) {
      return NextResponse.json(
        { error: 'missing_required_fields', message: 'Campi obbligatori: garden_id, sensor_type, value, unit' },
        { status: 400 }
      );
    }

    await requireGardenAccess(request, garden_id);

    // Validazione sensor_type
    if (!SUPPORTED_SENSOR_TYPES.includes(sensor_type as SensorType)) {
      return NextResponse.json(
        { error: 'invalid_sensor_type', message: `Tipo sensore non valido: ${sensor_type}` },
        { status: 400 }
      );
    }

    // Validazione valore
    if (!validateSensorValue(sensor_type as SensorType, value)) {
      return NextResponse.json(
        { error: 'invalid_value', message: `Valore ${value} fuori range per sensore ${sensor_type}` },
        { status: 400 }
      );
    }

    if (!validateDataQualityScore(data_quality_score)) {
      return NextResponse.json(
        { error: 'invalid_data_quality_score', message: `data_quality_score non valido: ${data_quality_score}` },
        { status: 400 }
      );
    }

    if (!validateCalibrationStatus(calibration_status)) {
      return NextResponse.json(
        { error: 'invalid_calibration_status', message: `calibration_status non valido: ${calibration_status}` },
        { status: 400 }
      );
    }

    if (!validatePercentageMetric(battery_level_percentage !== undefined ? Number(battery_level_percentage) : undefined)) {
      return NextResponse.json(
        { error: 'invalid_battery_level_percentage', message: `battery_level_percentage non valido: ${battery_level_percentage}` },
        { status: 400 }
      );
    }

    if (!validatePercentageMetric(signal_strength !== undefined ? Number(signal_strength) : undefined)) {
      return NextResponse.json(
        { error: 'invalid_signal_strength', message: `signal_strength non valido: ${signal_strength}` },
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

    if (!isSupabaseAvailable()) {
      if (!isBypassActive()) {
        return NextResponse.json({ error: 'supabase_unavailable' }, { status: 503 });
      }

      return NextResponse.json({
        reading: {
          id: crypto.randomUUID(),
          ...body,
          reading_date: body.reading_date || new Date().toISOString(),
          is_simulated: body.is_simulated ?? false,
        },
      }, { status: 201 });
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ error: 'supabase_unavailable' }, { status: 500 });
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
      sensor_type: sensor_type as SensorType,
      value: parseFloat(value.toString()),
      unit,
      reading_date: reading_date || new Date().toISOString(),
      sensor_id,
      is_simulated: is_simulated ?? false,
      provider,
      data_quality_score: data_quality_score !== undefined ? Number(data_quality_score) : undefined,
      calibration_status,
      battery_level_percentage:
        battery_level_percentage !== undefined ? Number(battery_level_percentage) : undefined,
      signal_strength: signal_strength !== undefined ? Number(signal_strength) : undefined,
    });

    return NextResponse.json({ reading }, { status: 201 });
  } catch (error: unknown) {
    if (isAccessError(error)) return accessErrorResponse(error);
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Sensor readings POST error:', error);
    return NextResponse.json(
      { error: 'internal_error', message },
      { status: 500 }
    );
  }
}
