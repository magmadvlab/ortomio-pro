// supabase/functions/compute-field-alerts/index.ts
// Deno runtime — non usare import da @/ qui, usa URL o path relativi

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  checkWaterAlert,
  checkTreatmentAlert,
  checkHeatAlert,
  checkDiseaseAlert,
  checkHarvestAlert,
} from '../../services/fieldAlertCheckers.ts';
import { fetchWeatherForecast } from '../../services/openMeteoService.ts';
import type { FieldAlert } from '../../types/fieldAlerts.ts';

const CACHE_TTL_MINUTES = 30;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  try {
    const { gardenId } = await req.json() as { gardenId: string };
    if (!gardenId) {
      return new Response(JSON.stringify({ error: 'gardenId required' }), { status: 400, headers: CORS_HEADERS });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // 1. Controlla cache
    const now = new Date();
    const { data: cached } = await supabase
      .from('field_alerts')
      .select('*')
      .eq('garden_id', gardenId)
      .gt('expires_at', now.toISOString())
      .limit(10);

    if (cached && cached.length > 0) {
      const alerts: FieldAlert[] = cached.map((r: Record<string, unknown>) => ({
        id: r.id as string,
        gardenId: r.garden_id as string,
        category: r.category as FieldAlert['category'],
        severity: r.severity as FieldAlert['severity'],
        message: r.message as string,
        computedAt: r.computed_at as string,
        expiresAt: r.expires_at as string,
        meta: r.meta as Record<string, unknown> | undefined,
      }));
      return Response.json({ alerts, fromCache: true, computedAt: alerts[0].computedAt }, { headers: CORS_HEADERS });
    }

    // 2. Leggi garden
    const { data: garden, error: gardenError } = await supabase
      .from('gardens')
      .select('id, name, coordinates')
      .eq('id', gardenId)
      .single();

    if (gardenError || !garden) {
      return new Response(JSON.stringify({ error: 'Garden not found' }), { status: 404, headers: CORS_HEADERS });
    }

    const coords = garden.coordinates as { latitude: number; longitude: number } | null;

    // 3. Fetch meteo (fallback a Roma se no coordinate)
    let weather;
    try {
      weather = await fetchWeatherForecast(
        coords?.latitude ?? 41.9,
        coords?.longitude ?? 12.5
      );
    } catch {
      weather = null;
    }

    // 4. Leggi dati dal DB
    const todayIso = now.toISOString().split('T')[0];
    const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000).toISOString();

    const [treatmentsResult, irrigationsResult, plantsResult] = await Promise.allSettled([
      supabase.from('treatment_records').select('next_due_date').eq('garden_id', gardenId).gte('next_due_date', sevenDaysAgo),
      supabase.from('watering_logs').select('created_at').eq('garden_id', gardenId).gte('created_at', sevenDaysAgo),
      supabase.from('plants').select('expected_harvest_date, harvested').eq('garden_id', gardenId),
    ]);
    const treatments = treatmentsResult.status === 'fulfilled' ? treatmentsResult.value.data ?? [] : [];
    const irrigations = irrigationsResult.status === 'fulfilled' ? irrigationsResult.value.data ?? [] : [];
    const plants = plantsResult.status === 'fulfilled' ? plantsResult.value.data ?? [] : [];

    // 5. Esegui checker
    const today = now;
    const dummyWeather = weather ?? {
      daily: {
        time: Array(7).fill(todayIso),
        temperature_2m_max: Array(7).fill(25),
        temperature_2m_min: Array(7).fill(15),
        precipitation_sum: Array(7).fill(0),
        sunshine_duration: Array(7).fill(36000),
        precipitation_probability_max: Array(7).fill(10),
        windspeed_10m_max: Array(7).fill(10),
      }
    };

    const irrigationDates = (irrigations ?? []).map((r: Record<string, string>) => r.created_at);
    const pendingTreatments = (treatments ?? [])
      .filter((r: Record<string, string>) => r.next_due_date)
      .map((r: Record<string, string>) => ({ nextDueDate: r.next_due_date }));
    const plantList = (plants ?? [])
      .filter((r: Record<string, unknown>) => r.expected_harvest_date)
      .map((r: Record<string, unknown>) => ({
        expectedHarvestDate: r.expected_harvest_date as string,
        harvested: Boolean(r.harvested),
      }));

    const alerts: FieldAlert[] = [
      checkWaterAlert(gardenId, irrigationDates, dummyWeather, today),
      checkTreatmentAlert(gardenId, pendingTreatments, today),
      checkHeatAlert(gardenId, dummyWeather),
      checkDiseaseAlert(gardenId, dummyWeather),
      checkHarvestAlert(gardenId, plantList, today),
    ];

    // 6. Scrivi in DB (insert first, then delete old — atomicity)
    const expiresAt = new Date(now.getTime() + CACHE_TTL_MINUTES * 60 * 1000).toISOString();
    const { error: insertError } = await supabase.from('field_alerts').insert(
      alerts.map(a => ({
        garden_id: a.gardenId,
        category: a.category,
        severity: a.severity,
        message: a.message,
        computed_at: a.computedAt,
        expires_at: expiresAt,
        meta: a.meta ?? null,
      }))
    );
    if (insertError) {
      console.error('Failed to insert field alerts:', insertError);
    }
    // Delete old alerts only after insert succeeded
    await supabase.from('field_alerts').delete().eq('garden_id', gardenId)
      .lt('computed_at', now.toISOString());

    return Response.json({ alerts, fromCache: false, computedAt: now.toISOString() }, { headers: CORS_HEADERS });

  } catch (err) {
    console.error('compute-field-alerts error:', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: CORS_HEADERS });
  }
});
