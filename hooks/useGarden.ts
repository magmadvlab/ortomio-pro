/**
 * Hook per gestione giardino corrente
 */

import { useState, useEffect } from 'react';
import { Garden } from '../types';

// Mock data per testing - in produzione collegare al database
const mockGarden: Garden = {
  id: 'garden-1',
  name: 'Orto Principale',
  coordinates: {
    latitude: 45.0,
    longitude: 9.0
  },
  sizeSqMeters: 1000,
  soilType: 'Loamy',
  soilPh: 6.5,
  createdAt: new Date().toISOString(),
  sunExposure: 'FullSun',
  dailySunHours: 8,
  aspectDirection: 'South',
  windProtection: 'Medium'
};

export function useGarden() {
  const [currentGarden, setCurrentGarden] = useState<Garden | null>(mockGarden);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // In produzione, qui caricheresti il giardino dal database
  useEffect(() => {
    // Simula caricamento
    setLoading(true);
    setTimeout(() => {
      setCurrentGarden(mockGarden);
      setLoading(false);
    }, 100);
  }, []);

  const selectGarden = (garden: Garden) => {
    setCurrentGarden(garden);
  };

  const updateGarden = (updates: Partial<Garden>) => {
    if (currentGarden) {
      setCurrentGarden({ ...currentGarden, ...updates });
    }
  };

  return {
    currentGarden,
    loading,
    error,
    selectGarden,
    updateGarden
  };
}