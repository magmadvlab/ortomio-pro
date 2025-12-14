/**
 * useUserLocation Hook
 * Auto-detect location al primo accesso
 * Salva in profiles table
 * Fallback a selezione manuale
 */

import { useState, useEffect } from 'react';
import { getUserLocation, createManualLocation, UserLocation, regioniItaliane } from '../lib/almanacco/geolocation';

export function useUserLocation() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [showManualSelect, setShowManualSelect] = useState(false);
  
  useEffect(() => {
    // Verifica se location già salvata in localStorage
    const saved = localStorage.getItem('user_location');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setLocation(parsed);
        return;
      } catch (e) {
        // Invalid saved data, continue to auto-detect
      }
    }
    
    // Verifica se la geolocalizzazione è già stata negata o è fallita recentemente
    const geolocationDenied = localStorage.getItem('geolocation_permission_denied');
    const geolocationFailedTime = localStorage.getItem('geolocation_failed_time');
    
    if (geolocationDenied === 'true') {
      // Permessi negati, mostra direttamente selezione manuale senza tentare
      setShowManualSelect(true);
      return;
    }
    
    // Se è fallita meno di 5 minuti fa, non ritentare immediatamente
    if (geolocationFailedTime) {
      const failedTime = parseInt(geolocationFailedTime, 10);
      const now = Date.now();
      if (now - failedTime < 300000) { // 5 minuti
        setShowManualSelect(true);
        return;
      }
    }
    
    // Auto-detect location
    detectLocation();
  }, []);
  
  const detectLocation = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const detected = await getUserLocation();
      
      if (detected) {
        setLocation(detected);
        // Salva in localStorage
        localStorage.setItem('user_location', JSON.stringify(detected));
        // Rimuovi flag di errore se la geolocalizzazione funziona
        localStorage.removeItem('geolocation_permission_denied');
        localStorage.removeItem('geolocation_failed_time');
      } else {
        // Fallback: mostra selezione manuale
        // Salva timestamp del fallimento per evitare chiamate ripetute
        localStorage.setItem('geolocation_failed_time', Date.now().toString());
        setShowManualSelect(true);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Location detection failed');
      setError(error);
      
      // Se è un errore di permesso negato, salva il flag
      if (error.message.includes('Permission') || error.message.includes('permission')) {
        localStorage.setItem('geolocation_permission_denied', 'true');
      } else {
        // Altri errori: salva timestamp per evitare retry immediati
        localStorage.setItem('geolocation_failed_time', Date.now().toString());
      }
      
      setShowManualSelect(true);
    } finally {
      setLoading(false);
    }
  };
  
  const setManualLocation = (regione: string, provincia: string, comune?: string) => {
    const manual = createManualLocation(regione, provincia, comune);
    setLocation(manual);
    localStorage.setItem('user_location', JSON.stringify(manual));
    setShowManualSelect(false);
  };
  
  return {
    location,
    loading,
    error,
    showManualSelect,
    detectLocation,
    setManualLocation,
    regioniItaliane
  };
}
