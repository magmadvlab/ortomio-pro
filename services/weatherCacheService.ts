/**
 * Weather Cache Service
 * Caches weather forecasts to reduce API calls
 * TTL: 24 hours
 */

import { WeatherForecast } from './weatherService';
import { getSupabaseClient } from '../config/supabase';

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const LOCAL_STORAGE_KEY = 'ortoWeatherCache';

interface CachedForecast {
  lat: number;
  lng: number;
  forecast: WeatherForecast[];
  cachedAt: number;
  expiresAt: number;
}

/**
 * Get cached forecast or null if expired/not found
 */
export const getCachedForecast = async (
  lat: number,
  lng: number
): Promise<WeatherForecast[] | null> => {
  const supabase = getSupabaseClient();
  const cacheKey = `${lat.toFixed(4)}_${lng.toFixed(4)}`;
  const today = new Date().toISOString().split('T')[0];

  if (supabase) {
    try {
      // Try Supabase cache
      const { data, error } = await supabase
        .from('weather_cache')
        .select('forecast, cached_at')
        .eq('lat_lng', cacheKey)
        .eq('date', today)
        .single();

      if (!error && data) {
        const cachedAt = new Date(data.cached_at).getTime();
        const age = Date.now() - cachedAt;

        if (age < CACHE_TTL_MS) {
          return data.forecast as WeatherForecast[];
        }
      }
    } catch (err) {
      // Silently fall through to localStorage cache
      // This can happen if table doesn't exist in local dev
    }
  }

  // Fallback to localStorage
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (saved) {
    try {
      const cache = JSON.parse(saved) as CachedForecast[];
      const cached = cache.find(
        c => Math.abs(c.lat - lat) < 0.01 && Math.abs(c.lng - lng) < 0.01
      );

      if (cached && cached.expiresAt > Date.now()) {
        return cached.forecast;
      }
    } catch (e) {
      console.error('Error reading weather cache from localStorage', e);
    }
  }

  return null;
};

/**
 * Cache forecast
 */
export const cacheForecast = async (
  lat: number,
  lng: number,
  forecast: WeatherForecast[]
): Promise<void> => {
  const supabase = getSupabaseClient();
  const cacheKey = `${lat.toFixed(4)}_${lng.toFixed(4)}`;
  const today = new Date().toISOString().split('T')[0];

  if (supabase) {
    try {
      // Cache in Supabase
      const { error } = await supabase
        .from('weather_cache')
        .upsert({
          lat_lng: cacheKey,
          date: today,
          forecast,
          cached_at: new Date().toISOString(),
        }, {
          onConflict: 'lat_lng,date',
        });

      if (error) {
        // Table might not exist in local dev - use localStorage
        cacheForecastLocal(lat, lng, forecast);
      }
      return;
    } catch (err) {
      // Silently fall back to localStorage
      cacheForecastLocal(lat, lng, forecast);
      return;
    }
  }

  // Fallback to localStorage
  cacheForecastLocal(lat, lng, forecast);
}

/**
 * Cache forecast in localStorage
 */
const cacheForecastLocal = (
  lat: number,
  lng: number,
  forecast: WeatherForecast[]
): void => {
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  let cache: CachedForecast[] = [];

  if (saved) {
    try {
      cache = JSON.parse(saved) as CachedForecast[];
    } catch (e) {
      console.error('Error parsing weather cache', e);
    }
  }

  // Remove expired entries
  cache = cache.filter(c => c.expiresAt > Date.now());

  // Add new entry
  const now = Date.now();
  cache.push({
    lat,
    lng,
    forecast,
    cachedAt: now,
    expiresAt: now + CACHE_TTL_MS,
  });

  // Keep only last 10 entries
  if (cache.length > 10) {
    cache = cache.slice(-10);
  }

  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cache));
};

/**
 * Cleanup expired cache entries
 */
export const cleanupExpiredCache = async (): Promise<void> => {
  const supabase = getSupabaseClient();

  if (supabase) {
    // Delete entries older than 2 days
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    
    await supabase
      .from('weather_cache')
      .delete()
      .lt('cached_at', twoDaysAgo.toISOString());
  }

  // Cleanup localStorage
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (saved) {
    try {
      const cache = JSON.parse(saved) as CachedForecast[];
      const valid = cache.filter(c => c.expiresAt > Date.now());
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(valid));
    } catch (e) {
      console.error('Error cleaning up weather cache', e);
    }
  }
};

