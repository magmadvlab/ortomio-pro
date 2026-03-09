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
    const normalized = trimmed.replace(',', '.');
    const parsed = Number(normalized);
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
  if (!input) return undefined;

  if (typeof input === 'string') {
    const parts = input
      .split(/[;, ]+/)
      .map((part) => part.trim())
      .filter(Boolean);

    if (parts.length >= 2) {
      const lat = toFiniteNumber(parts[0]);
      const lon = toFiniteNumber(parts[1]);
      if (lat !== null && lon !== null && isValidCoordinates(lat, lon)) {
        return { latitude: lat, longitude: lon };
      }
    }
  }

  if (Array.isArray(input) && input.length >= 2) {
    const first = toFiniteNumber(input[0]);
    const second = toFiniteNumber(input[1]);
    if (first !== null && second !== null) {
      if (isValidCoordinates(first, second)) {
        return { latitude: first, longitude: second };
      }
      if (isValidCoordinates(second, first)) {
        return { latitude: second, longitude: first };
      }
    }
  }

  if (typeof input !== 'object') return undefined;

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
