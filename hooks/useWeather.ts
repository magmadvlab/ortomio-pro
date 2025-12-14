/**
 * useWeather Hook
 * Fetch meteo basato su user location
 * Cache con SWR, gestione tier (7gg FREE, 15gg PRO)
 */

import { useState, useEffect } from 'react';
import { getWeatherForecast, WeatherData } from '../lib/calendar/weatherAPI';
import { useTier } from '../packages/core/hooks/useTier';

export function useWeather() {
  const { tier } = useTier();
  const [weather, setWeather] = useState<WeatherData[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Days: 7 FREE, 15 PRO
  const days = tier === 'PRO' ? 15 : 7;
  
  useEffect(() => {
    // TODO: Get user location from profile/context
    // Per ora, usa coordinate default (Roma)
    const defaultLat = 41.9028;
    const defaultLng = 12.4964;
    
    const fetchWeather = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const forecast = await getWeatherForecast(defaultLat, defaultLng, days);
        setWeather(forecast);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch weather'));
        console.error('Error fetching weather:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWeather();
    
    // Re-fetch ogni ora (cache API è 1 ora)
    const interval = setInterval(fetchWeather, 3600000);
    
    return () => clearInterval(interval);
  }, [days]);
  
  return {
    weather,
    loading,
    error,
    days
  };
}
