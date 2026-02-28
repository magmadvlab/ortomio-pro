/**
 * Geocoding Service
 * Reverse geocoding usando OpenStreetMap Nominatim API (gratuita)
 * Converte coordinate (lat, lng) in nome di località
 */

export interface LocationInfo {
  name: string; // Nome della località (es: "Bologna")
  municipality: string; // Comune (es: "Bologna")
  province?: string; // Provincia (es: "BO")
  region?: string; // Regione (es: "Emilia-Romagna")
  country: string; // Paese (es: "Italia")
  displayName: string; // Nome completo per visualizzazione
}

interface NominatimResponse {
  name?: string;
  address?: {
    village?: string;
    town?: string;
    city?: string;
    county?: string;
    state?: string;
    country?: string;
  };
  type?: string;
}

// Cache per evitare troppe chiamate API
const geocodingCache = new Map<string, LocationInfo>();

/**
 * Genera chiave cache per coordinate
 */
function getCacheKey(lat: number, lng: number): string {
  return `${lat.toFixed(4)}_${lng.toFixed(4)}`;
}

/**
 * Recupera informazioni sulla località da coordinate (reverse geocoding)
 * Usa OpenStreetMap Nominatim API
 * 
 * @param lat Latitudine
 * @param lng Longitudine
 * @returns Informazioni sulla località o null se errore
 */
export async function getLocationFromCoordinates(lat: number, lng: number): Promise<LocationInfo | null> {
  const cacheKey = getCacheKey(lat, lng);
  
  // Controlla cache
  if (geocodingCache.has(cacheKey)) {
    return geocodingCache.get(cacheKey)!;
  }

  try {
    // Nominatim API - reverse geocoding
    // https://nominatim.org/release-docs/latest/api/Reverse/
    const url = new URL('https://nominatim.openstreetmap.org/reverse');
    url.searchParams.set('lat', lat.toString());
    url.searchParams.set('lon', lng.toString());
    url.searchParams.set('format', 'json');
    url.searchParams.set('zoom', '16'); // Livello di dettaglio (16 = streets)
    url.searchParams.set('email', 'app@ortomioapp.it'); // Required per Nominatim

    const response = await fetch(url.toString(), {
      headers: {
        'Accept-Language': 'it'
      }
    });

    if (!response.ok) {
      console.warn(`Nominatim API error: ${response.status} for coordinates ${lat}, ${lng}`);
      return null;
    }

    const data: NominatimResponse = await response.json();

    if (!data.address) {
      return null;
    }

    const address = data.address;
    
    // Estrai informazioni dalla risposta
    // Priorità: city > town > village
    const municipality = address.city || address.town || address.village || 'Sconosciuto';
    const province = address.county?.split(' ')[0] || undefined; // Es: "Bologna" -> "BO"
    const region = address.state;
    const country = address.country || 'Italia';

    // Nome per visualizzazione
    let displayName = municipality;
    if (province) displayName += `, ${province}`;
    if (region) displayName += `, ${region}`;

    const locationInfo: LocationInfo = {
      name: municipality,
      municipality,
      province,
      region,
      country,
      displayName
    };

    // Salva in cache
    geocodingCache.set(cacheKey, locationInfo);

    return locationInfo;
  } catch (error) {
    console.error(`Error in reverse geocoding for ${lat}, ${lng}:`, error);
    return null;
  }
}

/**
 * Estima il nome della provincia da latitudine
 * Fallback quando reverse geocoding non disponibile
 * 
 * Mapping approssimativo per comuni Italiani
 */
function estimateProvinceFromCoordinates(lat: number, lng: number): string {
  // Mapping semplificato di province Italiane per coordinate
  // Basato su centroidi geografici approssimativi
  
  const provinces: Array<{
    name: string;
    lat: number;
    lng: number;
    radius: number; // approssimativo in gradi
  }> = [
    { name: 'Roma', lat: 41.9028, lng: 12.4964, radius: 0.5 },
    { name: 'Milano', lat: 45.4642, lng: 9.1900, radius: 0.5 },
    { name: 'Napoli', lat: 40.8518, lng: 14.2681, radius: 0.5 },
    { name: 'Torino', lat: 45.0703, lng: 7.6869, radius: 0.5 },
    { name: 'Firenze', lat: 43.7696, lng: 11.2558, radius: 0.5 },
    { name: 'Bologna', lat: 44.4939, lng: 11.3431, radius: 0.5 },
    { name: 'Palermo', lat: 38.1157, lng: 13.3615, radius: 0.5 },
    { name: 'Genova', lat: 44.4056, lng: 8.9463, radius: 0.5 },
    { name: 'Venezia', lat: 45.4408, lng: 12.3155, radius: 0.5 },
    { name: 'Verona', lat: 45.4384, lng: 10.9916, radius: 0.5 },
  ];

  // Calcola distanza dalla prima provincia più vicina
  let nearestProvince = 'Italia';
  let minDistance = Infinity;

  for (const province of provinces) {
    const distance = Math.sqrt(
      Math.pow(lat - province.lat, 2) + Math.pow(lng - province.lng, 2)
    );
    if (distance < minDistance) {
      minDistance = distance;
      nearestProvince = province.name;
    }
  }

  return nearestProvince;
}

/**
 * Fallback quando reverse geocoding fallisce
 * Usa coordinate per stimare una provincia Italiana
 * 
 * @param lat Latitudine
 * @param lng Longitudine
 * @returns LocationInfo con fallback
 */
export function getEstimatedLocationFallback(lat: number, lng: number): LocationInfo {
  const estimatedProvince = estimateProvinceFromCoordinates(lat, lng);
  
  return {
    name: estimatedProvince,
    municipality: estimatedProvince,
    province: estimatedProvince,
    region: 'Italia',
    country: 'Italia',
    displayName: `${estimatedProvince}, Italia (stima)`
  };
}

/**
 * Wrapper che tenta reverse geocoding con fallback
 * 
 * @param lat Latitudine
 * @param lng Longitudine
 * @returns Informazioni sulla località con fallback a stima se necessario
 */
export async function getLocationInfo(lat: number, lng: number): Promise<LocationInfo> {
  // Tenta reverse geocoding
  const location = await getLocationFromCoordinates(lat, lng);
  
  if (location) {
    return location;
  }

  // Fallback a stima
  console.warn(`Reverse geocoding failed for ${lat}, ${lng}. Using estimated location fallback.`);
  return getEstimatedLocationFallback(lat, lng);
}

/**
 * Formatta LocationInfo per visualizzazione in UI
 * Esempio: "Bologna, BO"
 */
export function formatLocationForDisplay(location: LocationInfo): string {
  if (location.province) {
    return `${location.municipality}, ${location.province}`;
  }
  return location.municipality;
}

/**
 * Formatta LocationInfo per visualizzazione dettagliata
 * Esempio: "Bologna, Emilia-Romagna, Italia"
 */
export function formatLocationDetailed(location: LocationInfo): string {
  const parts = [location.municipality];
  if (location.region) parts.push(location.region);
  if (location.country) parts.push(location.country);
  return parts.join(', ');
}

/**
 * Converte direzione in gradi a direzione cardinale
 * 
 * @param degrees Gradi (0-360)
 * @returns Direzione cardinale (N, NE, E, SE, S, SW, W, NW)
 */
export function degreesToCardinal(degrees: number): string {
  // Normalizza a 0-360
  const normalized = ((degrees + 360) % 360 + 360) % 360;
  
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round((normalized % 360) / 45) % 8;
  
  return directions[index];
}

/**
 * Formatta direzione del vento per visualizzazione
 * 
 * @param degrees Gradi (0-360) oppure undefined
 * @returns Stringa con direzione (es: "N (360°)") oppure "-"
 */
export function formatWindDirection(degrees?: number): string {
  if (degrees === undefined || degrees === null) return '-';
  
  const cardinal = degreesToCardinal(degrees);
  return `${cardinal} (${Math.round(degrees)}°)`;
}
