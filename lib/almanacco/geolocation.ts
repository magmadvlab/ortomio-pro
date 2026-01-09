/**
 * Geolocation Service - Auto-detect Regione
 * Usa Browser Geolocation API + Nominatim/OpenStreetMap (gratis, no API key)
 * Reverse geocoding per ottenere regione, provincia, comune
 */

export interface UserLocation {
  lat: number;
  lng: number;
  regione: string; // 'basilicata', 'puglia', etc. (normalized)
  provincia: string; // 'Matera', 'Bari', etc.
  comune?: string; // Opzionale
  zona: 'nord' | 'centro' | 'sud' | 'isole';
  clima: 'alpino' | 'continentale' | 'mediterraneo' | 'subtropicale';
  manual: boolean; // true se inserito manualmente dall'utente
}

/**
 * Ottiene location utente (auto-detect o manuale)
 * @returns UserLocation o null se fallisce
 */
export async function getUserLocation(): Promise<UserLocation | null> {
  try {
    // 1. Tenta geolocalizzazione browser
    const coords = await getBrowserLocation();
    
    // 2. Reverse geocoding per ottenere regione
    const location = await reverseGeocode(coords.lat, coords.lng);
    
    if (!location) {
      return null;
    }
    
    return {
      lat: coords.lat,
      lng: coords.lng,
      regione: normalizeRegione(location.regione),
      provincia: location.provincia || '',
      comune: location.comune,
      zona: getZonaFromRegione(location.regione),
      clima: determineClima(coords.lat, location.regione),
      manual: false
    };
  } catch (error) {
    // Log solo se non è un errore di permesso già gestito (evita spam nella console)
    const errorCode = (error as GeolocationPositionError)?.code;
    if (errorCode !== 1) { // Non loggare PERMISSION_DENIED ripetutamente
      // Log solo una volta, non ogni volta che viene chiamato
      if (!geolocationFailed) {
        console.warn('Geolocation not available, using manual selection');
      }
    }
    // Fallback: return null → UI mostra selezione manuale
    return null;
  }
}

// Flag per tracciare se la geolocalizzazione è già fallita (evita chiamate ripetute)
let geolocationFailed = false;
let geolocationPermissionDenied = false;

/**
 * Browser Geolocation API
 */
function getBrowserLocation(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      geolocationFailed = true;
      reject(new Error('Geolocation not supported'));
      return;
    }

    // Se i permessi sono già stati negati, evita di chiamare di nuovo
    if (geolocationPermissionDenied) {
      reject(new Error('Permission denied'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Reset flag se la geolocalizzazione funziona
        geolocationFailed = false;
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        // Filtra errori non critici per evitare spam nella console
        const errorMessage = error.message || '';
        const isLocationUnknown = errorMessage.includes('kCLErrorLocationUnknown') || 
                                 errorMessage.includes('locationUnknown') ||
                                 errorMessage.includes('LocationUnknown');
        
        // Gestisci errori silenziosamente per evitare log ripetuti
        if (error.code === 1) {
          // PERMISSION_DENIED - non ritentare
          geolocationPermissionDenied = true;
        } else if (!isLocationUnknown) {
          // Solo loggare errori critici, non quelli temporanei
          geolocationFailed = true;
          // Reset flag dopo 5 minuti per permettere retry
          setTimeout(() => {
            geolocationFailed = false;
          }, 300000);
        }
        // Per locationUnknown, non loggare (è temporaneo e non critico)
        
        reject(error);
      },
      { 
        timeout: 5000,
        enableHighAccuracy: false, // Ridotto per evitare errori su alcuni dispositivi
        maximumAge: 300000 // Cache 5 minuti
      }
    );
  });
}

/**
 * Reverse Geocoding con Nominatim (OpenStreetMap) - GRATUITO!
 * @param lat Latitudine
 * @param lng Longitudine
 * @returns Dati geografici (regione, provincia, comune)
 */
async function reverseGeocode(
  lat: number,
  lng: number
): Promise<{ regione: string; provincia: string; comune?: string } | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?` +
      `lat=${lat}&lon=${lng}&format=json&accept-language=it`,
      {
        headers: {
          'User-Agent': 'OrtoMio/1.0' // Richiesto da Nominatim
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.address) {
      return null;
    }
    
    return {
      regione: data.address.state || data.address.region || '', // "Basilicata", "Regione Puglia"
      provincia: data.address.province || data.address.county || '', // "Matera", "Bari"
      comune: data.address.city || data.address.town || data.address.village
    };
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
    return null;
  }
}

/**
 * Normalizza nome regione
 * Rimuove "Regione", accent, spazi, converte in lowercase
 */
function normalizeRegione(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/regione\s+/gi, '')
    .replace(/[àáâä]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/valle d'aosta/gi, 'valle-d-aosta')
    .replace(/trentino-alto adige/gi, 'trentino-alto-adige')
    .replace(/friuli-venezia giulia/gi, 'friuli-venezia-giulia')
    .replace(/emilia-romagna/gi, 'emilia-romagna')
    .trim();
}

/**
 * Mapping regione → zona geografica
 */
const regioneToZona: Record<string, UserLocation['zona']> = {
  'piemonte': 'nord',
  'valle-d-aosta': 'nord',
  'lombardia': 'nord',
  'trentino-alto-adige': 'nord',
  'veneto': 'nord',
  'friuli-venezia-giulia': 'nord',
  'liguria': 'nord',
  'emilia-romagna': 'nord',
  
  'toscana': 'centro',
  'umbria': 'centro',
  'marche': 'centro',
  'lazio': 'centro',
  'abruzzo': 'centro',
  
  'molise': 'sud',
  'campania': 'sud',
  'puglia': 'sud',
  'basilicata': 'sud',
  'calabria': 'sud',
  
  'sicilia': 'isole',
  'sardegna': 'isole'
};

function getZonaFromRegione(regione: string): UserLocation['zona'] {
  const normalized = normalizeRegione(regione);
  return regioneToZona[normalized] || 'centro';
}

/**
 * Determina clima da latitudine + regione
 */
function determineClima(lat: number, regione: string): UserLocation['clima'] {
  const reg = normalizeRegione(regione);
  
  // Montagne
  if (lat > 45.5 || ['trentino-alto-adige', 'valle-d-aosta'].includes(reg)) {
    return 'alpino';
  }
  
  // Pianura Padana
  if (lat > 44 && ['piemonte', 'lombardia', 'veneto', 'emilia-romagna'].includes(reg)) {
    return 'continentale';
  }
  
  // Sud caldo
  if (['sicilia', 'sardegna', 'calabria', 'puglia'].includes(reg)) {
    return 'subtropicale';
  }
  
  // Resto = mediterraneo
  return 'mediterraneo';
}

/**
 * Crea UserLocation da dati manuali (selezionati dall'utente)
 */
export function createManualLocation(
  regione: string,
  provincia: string,
  comune?: string
): UserLocation {
  const normalizedRegione = normalizeRegione(regione);
  
  return {
    lat: 0, // Non disponibile per selezione manuale
    lng: 0,
    regione: normalizedRegione,
    provincia,
    comune,
    zona: getZonaFromRegione(regione),
    clima: determineClima(42, regione), // Latitudine media Italia
    manual: true
  };
}

/**
 * Lista regioni italiane per selezione manuale
 */
export const regioniItaliane = [
  { nome: 'Piemonte', valore: 'piemonte', zona: 'nord' },
  { nome: 'Valle d\'Aosta', valore: 'valle-d-aosta', zona: 'nord' },
  { nome: 'Lombardia', valore: 'lombardia', zona: 'nord' },
  { nome: 'Trentino-Alto Adige', valore: 'trentino-alto-adige', zona: 'nord' },
  { nome: 'Veneto', valore: 'veneto', zona: 'nord' },
  { nome: 'Friuli-Venezia Giulia', valore: 'friuli-venezia-giulia', zona: 'nord' },
  { nome: 'Liguria', valore: 'liguria', zona: 'nord' },
  { nome: 'Emilia-Romagna', valore: 'emilia-romagna', zona: 'nord' },
  { nome: 'Toscana', valore: 'toscana', zona: 'centro' },
  { nome: 'Umbria', valore: 'umbria', zona: 'centro' },
  { nome: 'Marche', valore: 'marche', zona: 'centro' },
  { nome: 'Lazio', valore: 'lazio', zona: 'centro' },
  { nome: 'Abruzzo', valore: 'abruzzo', zona: 'centro' },
  { nome: 'Molise', valore: 'molise', zona: 'sud' },
  { nome: 'Campania', valore: 'campania', zona: 'sud' },
  { nome: 'Puglia', valore: 'puglia', zona: 'sud' },
  { nome: 'Basilicata', valore: 'basilicata', zona: 'sud' },
  { nome: 'Calabria', valore: 'calabria', zona: 'sud' },
  { nome: 'Sicilia', valore: 'sicilia', zona: 'isole' },
  { nome: 'Sardegna', valore: 'sardegna', zona: 'isole' }
];
