export interface NormalizedCoordinates {
  latitude: number;
  longitude: number;
}

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const parsed = Number(trimmed);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

function isValidCoordinates(latitude: number, longitude: number): boolean {
  return (
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

export function normalizeGeoCoordinates(input: unknown): NormalizedCoordinates | undefined {
  if (!input || typeof input !== 'object') return undefined;

  const record = input as Record<string, unknown>;

  const latitude = toFiniteNumber(record.latitude ?? record.lat);
  const longitude = toFiniteNumber(record.longitude ?? record.lon ?? record.lng);

  if (
    latitude !== null &&
    longitude !== null &&
    isValidCoordinates(latitude, longitude)
  ) {
    return { latitude, longitude };
  }

  if (record.coordinates && typeof record.coordinates === 'object') {
    const nested = normalizeGeoCoordinates(record.coordinates);
    if (nested) return nested;
  }

  if (record.location && typeof record.location === 'object') {
    const locationRecord = record.location as Record<string, unknown>;
    const nested = normalizeGeoCoordinates(locationRecord.coordinates ?? locationRecord);
    if (nested) return nested;
  }

  return undefined;
}

export function hasGeoCoordinates(input: unknown): boolean {
  return !!normalizeGeoCoordinates(input);
}
