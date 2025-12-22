/**
 * useDeviceOrientation Hook
 * Cattura l'orientamento del dispositivo (bussola) per identificare il Nord
 * Usa DeviceOrientationEvent API quando disponibile
 */

import { useState, useEffect, useRef } from 'react';

export interface DeviceOrientationResult {
  heading: number | null; // 0-360°, 0 = Nord magnetico
  isCalibrated: boolean;
  error: string | null;
  isSupported: boolean;
}

/**
 * Hook per catturare l'orientamento del dispositivo (bussola)
 * Restituisce heading in gradi (0-360°, 0 = Nord magnetico)
 */
export function useDeviceOrientation(): DeviceOrientationResult {
  const [heading, setHeading] = useState<number | null>(null);
  const [isCalibrated, setIsCalibrated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const eventListenerRef = useRef<((event: DeviceOrientationEvent) => void) | null>(null);

  useEffect(() => {
    // Verifica supporto API
    if (typeof window === 'undefined' || !window.DeviceOrientationEvent) {
      setIsSupported(false);
      setError('DeviceOrientationEvent non supportato su questo dispositivo');
      return;
    }

    setIsSupported(true);

    // Verifica permessi (richiesto su iOS 13+)
    const requestPermission = async () => {
      if (
        typeof (DeviceOrientationEvent as any).requestPermission === 'function'
      ) {
        try {
          const permission = await (DeviceOrientationEvent as any).requestPermission();
          if (permission !== 'granted') {
            setError('Permesso bussola negato');
            return false;
          }
        } catch (err) {
          setError('Errore richiesta permesso bussola');
          return false;
        }
      }
      return true;
    };

    const startListening = async () => {
      const hasPermission = await requestPermission();
      if (!hasPermission) return;

      const handleOrientation = (event: DeviceOrientationEvent) => {
        // alpha = rotazione attorno all'asse Z (bussola), 0-360°
        // 0 = Nord, 90 = Est, 180 = Sud, 270 = Ovest
        if (event.alpha !== null && event.alpha !== undefined) {
          // Normalizza a 0-360
          let normalizedHeading = event.alpha;
          if (normalizedHeading < 0) {
            normalizedHeading += 360;
          }
          if (normalizedHeading >= 360) {
            normalizedHeading -= 360;
          }
          
          setHeading(normalizedHeading);
          
          // Considera calibrato se abbiamo un valore valido
          // (alcuni dispositivi richiedono movimento a 8 per calibrazione completa)
          setIsCalibrated(true);
        }
      };

      eventListenerRef.current = handleOrientation;
      window.addEventListener('deviceorientation', handleOrientation);
    };

    startListening().catch((err) => {
      console.error('Error starting device orientation:', err);
      setError('Errore nell\'accesso alla bussola');
    });

    // Cleanup
    return () => {
      if (eventListenerRef.current) {
        window.removeEventListener('deviceorientation', eventListenerRef.current);
      }
    };
  }, []);

  return {
    heading,
    isCalibrated,
    error,
    isSupported,
  };
}

/**
 * Ottiene heading una sola volta (non continuo)
 * Utile quando si vuole catturare solo al momento dello scatto
 */
export async function getDeviceHeadingOnce(): Promise<number | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.DeviceOrientationEvent) {
      resolve(null);
      return;
    }

    const requestPermission = async () => {
      if (
        typeof (DeviceOrientationEvent as any).requestPermission === 'function'
      ) {
        try {
          const permission = await (DeviceOrientationEvent as any).requestPermission();
          return permission === 'granted';
        } catch {
          return false;
        }
      }
      return true;
    };

    const startListening = async () => {
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        resolve(null);
        return;
      }

      const handleOrientation = (event: DeviceOrientationEvent) => {
        if (event.alpha !== null && event.alpha !== undefined) {
          let normalizedHeading = event.alpha;
          if (normalizedHeading < 0) normalizedHeading += 360;
          if (normalizedHeading >= 360) normalizedHeading -= 360;
          
          window.removeEventListener('deviceorientation', handleOrientation);
          resolve(normalizedHeading);
        }
      };

      window.addEventListener('deviceorientation', handleOrientation);
      
      // Timeout dopo 5 secondi se non riceviamo dati
      setTimeout(() => {
        window.removeEventListener('deviceorientation', handleOrientation);
        resolve(null);
      }, 5000);
    };

    startListening();
  });
}


