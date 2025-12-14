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
      } else {
        // Fallback: mostra selezione manuale
        setShowManualSelect(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Location detection failed'));
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
