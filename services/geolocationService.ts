export interface GeolocationOptions {
  timeout?: number;
  enableHighAccuracy?: boolean;
  maximumAge?: number;
}

export interface GeolocationResult {
  success: boolean;
  latitude?: number;
  longitude?: number;
  accuracy?: number; // Precisione in metri
  altitude?: number | null;
  altitudeAccuracy?: number | null;
  error?: string;
  errorCode?: number;
}

// Cache globale per evitare chiamate multiple simultanee
let pendingRequest: Promise<GeolocationResult> | null = null;
let lastSuccessResult: GeolocationResult | null = null;
let lastSuccessTime: number = 0;
const CACHE_DURATION = 300000; // 5 minuti

/**
 * Rileva se siamo su dispositivo mobile
 */
const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
  
  // Verifica anche la larghezza dello schermo
  const isMobileScreen = window.innerWidth <= 768;
  
  return mobileRegex.test(userAgent.toLowerCase()) || isMobileScreen;
};

/**
 * Funzione migliorata per geolocalizzazione con ottimizzazioni per desktop/mobile
 * Migliorata per distinguere serre/campi vicini (richiede maggiore precisione)
 */
export const getCurrentPosition = async (
  options: GeolocationOptions = {}
): Promise<GeolocationResult> => {
  const isMobile = isMobileDevice();
  
  // Ottimizzazioni diverse per desktop e mobile
  // Migliorata precisione: anche su desktop prova GPS se disponibile per distinguere posizioni vicine
  const {
    timeout = isMobile ? 30000 : 15000, // Mobile: 30s, Desktop: 15s (aumentato per permettere GPS)
    enableHighAccuracy = options.enableHighAccuracy ?? true, // Default: sempre alta precisione per distinguere serre vicine
    maximumAge = isMobile ? 30000 : 60000, // Ridotto: Mobile 30s, Desktop 1 minuto (dati più freschi)
  } = options;

  // Se c'è già una richiesta in corso, ritorna quella invece di crearne una nuova
  if (pendingRequest) {
    return pendingRequest;
  }

  // Se abbiamo un risultato recente in cache, usalo
  const now = Date.now();
  if (lastSuccessResult && lastSuccessResult.success && (now - lastSuccessTime) < maximumAge) {
    return Promise.resolve(lastSuccessResult);
  }

  // Verifica se i permessi sono stati negati
  const permissionDenied = localStorage.getItem('geolocation_permission_denied') === 'true';
  if (permissionDenied) {
    return Promise.resolve({
      success: false,
      error: "Permesso di geolocalizzazione negato",
      errorCode: 1,
    });
  }

  pendingRequest = new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({
        success: false,
        error: "Geolocalizzazione non supportata dal browser",
        errorCode: 0,
      });
      return;
    }

    // Timeout per evitare attese infinite
    const timeoutId = setTimeout(() => {
      resolve({
        success: false,
        error: isMobile 
          ? "Timeout GPS: assicurati che il GPS sia attivo e che ci sia visibilità del cielo."
          : "Timeout: la richiesta di posizione ha impiegato troppo tempo. Verifica i permessi nelle impostazioni del browser.",
        errorCode: 3, // TIMEOUT
      });
    }, timeout);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeoutId);
        const result: GeolocationResult = {
          success: true,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy, // Precisione in metri
          altitude: position.coords.altitude,
          altitudeAccuracy: position.coords.altitudeAccuracy,
        };
        // Salva in cache
        lastSuccessResult = result;
        lastSuccessTime = Date.now();
        pendingRequest = null;
        resolve(result);
      },
      (error) => {
        clearTimeout(timeoutId);
        
        // Filtra errori non critici (kCLErrorLocationUnknown è spesso temporaneo)
        const errorMessageText = error.message || '';
        const isLocationUnknown = errorMessageText.includes('kCLErrorLocationUnknown') || 
                                 errorMessageText.includes('locationUnknown') ||
                                 errorMessageText.includes('LocationUnknown');
        
        // Se è un errore temporaneo e abbiamo una posizione in cache valida, usala
        if (isLocationUnknown && lastSuccessResult?.success) {
          const cacheAge = Date.now() - lastSuccessTime;
          // Usa cache se ha meno di 10 minuti
          if (cacheAge < 600000) {
            pendingRequest = null;
            resolve(lastSuccessResult);
            return;
          }
        }
        
        let errorMessage = "Errore sconosciuto nella geolocalizzazione";
        let errorCode = error.code;

        switch (error.code) {
          case 1: // PERMISSION_DENIED
            errorMessage = isMobile
              ? "Permesso GPS negato. Abilita la geolocalizzazione nelle impostazioni del dispositivo."
              : "Permesso di geolocalizzazione negato. Abilita la geolocalizzazione nelle impostazioni del browser.";
            // Salva flag per evitare chiamate future
            localStorage.setItem('geolocation_permission_denied', 'true');
            break;
          case 2: // POSITION_UNAVAILABLE
            if (isLocationUnknown) {
              // Errore temporaneo, non critico
              errorMessage = "Posizione temporaneamente non disponibile. Riprova tra qualche secondo.";
              // Salva timestamp per evitare retry immediati ma permettere retry dopo un po'
              localStorage.setItem('geolocation_failed_time', Date.now().toString());
            } else {
              errorMessage = isMobile
                ? "GPS non disponibile. Verifica che il GPS sia attivo e che ci sia visibilità del cielo."
                : "Posizione non disponibile. Verifica la connessione internet.";
              localStorage.setItem('geolocation_failed_time', Date.now().toString());
            }
            break;
          case 3: // TIMEOUT
            errorMessage = isMobile
              ? "Timeout GPS: il GPS sta impiegando troppo tempo. Assicurati di essere all'aperto con visibilità del cielo."
              : "Timeout: la richiesta ha impiegato troppo tempo. Riprova o verifica la connessione.";
            break;
          default:
            // Per errori sconosciuti (incluso kCLErrorLocationUnknown), usa messaggio generico
            if (isLocationUnknown) {
              errorMessage = "Posizione temporaneamente non disponibile. Riprova tra qualche secondo.";
              errorCode = 2; // Trattalo come POSITION_UNAVAILABLE
            } else {
              errorMessage = `Errore geolocalizzazione: ${error.message || "Errore sconosciuto"}`;
            }
        }

        const result: GeolocationResult = {
          success: false,
          error: errorMessage,
          errorCode,
        };
        pendingRequest = null;
        resolve(result);
      },
      {
        timeout,
        enableHighAccuracy,
        maximumAge,
      }
    );
  });

  return pendingRequest;
};

/**
 * Funzione con retry automatico (utile su mobile)
 */
export const getCurrentPositionWithRetry = async (
  maxRetries: number = 2,
  options: GeolocationOptions = {}
): Promise<GeolocationResult> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const result = await getCurrentPosition(options);
    
    if (result.success) {
      return result;
    }

    // Se è un errore di permesso, non ritentare (l'utente deve dare il permesso manualmente)
    if (result.errorCode === 1) {
      return result;
    }
    
    // Se è un errore temporaneo (locationUnknown), ritenta con backoff più lungo
    const isTemporaryError = result.error?.includes('temporaneamente') || 
                             result.error?.includes('locationUnknown') ||
                             result.error?.includes('LocationUnknown');
    
    if (isTemporaryError && attempt < maxRetries) {
      // Backoff più lungo per errori temporanei: 2s, 5s, 10s
      await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
      continue;
    }

    // Aspetta prima di ritentare (solo se non è l'ultimo tentativo)
    if (attempt < maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt)); // Backoff: 1s, 2s
    }
  }

  // Se tutti i tentativi falliscono, restituisci l'ultimo errore
  return await getCurrentPosition(options);
};

/**
 * Funzione per forzare nuova lettura GPS con alta precisione
 * Utile quando si devono distinguere serre/campi vicini
 */
export const getCurrentPositionForceRefresh = async (
  options: GeolocationOptions = {}
): Promise<GeolocationResult> => {
  // Pulisci cache per forzare nuova lettura
  lastSuccessResult = null;
  lastSuccessTime = 0;
  pendingRequest = null;
  
  // Forza alta precisione e nessuna cache
  return getCurrentPosition({
    ...options,
    enableHighAccuracy: true, // Sempre GPS per massima precisione
    maximumAge: 0, // Non usare cache
    timeout: options.timeout ?? 20000, // Timeout più lungo per GPS
  });
};

/**
 * Ottiene posizione con precisione garantita (accetta solo se accuracy < threshold metri)
 * Utile per distinguere serre/campi a pochi metri di distanza
 */
export const getCurrentPositionWithAccuracy = async (
  maxAccuracyMeters: number = 20, // Default: accetta solo se precisione < 20m
  maxRetries: number = 3,
  options: GeolocationOptions = {}
): Promise<GeolocationResult> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const result = await getCurrentPosition({
      ...options,
      enableHighAccuracy: true, // Sempre GPS
      maximumAge: attempt === 1 ? (options.maximumAge ?? 0) : 0, // Prima chiamata può usare cache, poi no
    });
    
    if (result.success && result.accuracy !== undefined) {
      if (result.accuracy <= maxAccuracyMeters) {
        return result; // Precisione sufficiente
      }
      
      // Precisione insufficiente, ritenta se non è l'ultimo tentativo
      if (attempt < maxRetries) {
        // Aspetta prima di ritentare (GPS ha bisogno di tempo)
        await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
        // Forza nuova lettura
        lastSuccessResult = null;
        lastSuccessTime = 0;
      }
    } else if (result.success) {
      // Se non abbiamo accuracy ma success è true, accettiamo comunque
      return result;
    }
    
    // Se è un errore di permesso, non ritentare
    if (result.errorCode === 1) {
      return result;
    }
  }
  
  // Se tutti i tentativi falliscono o precisione insufficiente, restituisci l'ultimo risultato
  return await getCurrentPosition({
    ...options,
    enableHighAccuracy: true,
    maximumAge: 0,
  });
};

/**
 * Coordinate di default (Roma) come fallback
 */
export const getDefaultCoordinates = (): { latitude: number; longitude: number } => {
  return {
    latitude: 41.9028,
    longitude: 12.4964,
  };
};






