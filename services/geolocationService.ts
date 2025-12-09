export interface GeolocationOptions {
  timeout?: number;
  enableHighAccuracy?: boolean;
  maximumAge?: number;
}

export interface GeolocationResult {
  success: boolean;
  latitude?: number;
  longitude?: number;
  error?: string;
  errorCode?: number;
}

/**
 * Funzione migliorata per geolocalizzazione con gestione errori specifica per mobile
 */
export const getCurrentPosition = async (
  options: GeolocationOptions = {}
): Promise<GeolocationResult> => {
  const {
    timeout = 20000, // 20 secondi su mobile (più tempo per i permessi)
    enableHighAccuracy = false, // False per risparmiare batteria e velocità
    maximumAge = 300000, // 5 minuti - accetta posizione cached se recente
  } = options;

  return new Promise((resolve) => {
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
        error: "Timeout: la richiesta di posizione ha impiegato troppo tempo. Verifica i permessi GPS nelle impostazioni del dispositivo.",
        errorCode: 3, // TIMEOUT
      });
    }, timeout);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeoutId);
        resolve({
          success: true,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        clearTimeout(timeoutId);
        let errorMessage = "Errore sconosciuto nella geolocalizzazione";
        let errorCode = error.code;

        switch (error.code) {
          case 1: // PERMISSION_DENIED
            errorMessage = "Permesso di geolocalizzazione negato. Abilita la geolocalizzazione nelle impostazioni del browser o dell'app.";
            break;
          case 2: // POSITION_UNAVAILABLE
            errorMessage = "Posizione non disponibile. Verifica che il GPS sia attivo sul dispositivo.";
            break;
          case 3: // TIMEOUT
            errorMessage = "Timeout: la richiesta ha impiegato troppo tempo. Riprova o verifica la connessione.";
            break;
          default:
            errorMessage = `Errore geolocalizzazione: ${error.message || "Errore sconosciuto"}`;
        }

        resolve({
          success: false,
          error: errorMessage,
          errorCode,
        });
      },
      {
        timeout,
        enableHighAccuracy,
        maximumAge,
      }
    );
  });
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

    // Aspetta prima di ritentare (solo se non è l'ultimo tentativo)
    if (attempt < maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt)); // Backoff: 1s, 2s
    }
  }

  // Se tutti i tentativi falliscono, restituisci l'ultimo errore
  return await getCurrentPosition(options);
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





