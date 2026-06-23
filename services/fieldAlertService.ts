import type { FieldAlert } from '@/types/fieldAlerts';

interface CacheEntry {
  alerts: FieldAlert[]
  ts: number
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minuti
const cache = new Map<string, CacheEntry>();

export function clearFieldAlertsCache(): void {
  cache.clear();
}

export async function getFieldAlerts(
  gardenId: string,
  supabaseFunctionsUrl: string
): Promise<FieldAlert[]> {
  const cached = cache.get(gardenId);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return cached.alerts;
  }

  try {
    const res = await fetch(`${supabaseFunctionsUrl}/compute-field-alerts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gardenId }),
    });

    if (!res.ok) return [];

    const { alerts } = await res.json() as { alerts: FieldAlert[] };
    cache.set(gardenId, { alerts, ts: Date.now() });
    return alerts;
  } catch {
    return [];
  }
}
