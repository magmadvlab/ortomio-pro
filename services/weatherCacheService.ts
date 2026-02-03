/**
 * Weather Cache Service
 * Caches weather forecasts to reduce API calls
 * TTL: 24 hours
 */

import { WeatherForecast } from './weatherService';
import { getSupabaseClient } from '../config/supabase';

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const LOCAL_STORAGE_KEY = 'ortoWeatherCache';

// Request deduplication - prevent multiple simultaneous requests for same location
const pendingRequests = new Map<string, Promise<WeatherForecast[] | null>>();

interface CachedForecast {
  lat: number;
  lng: number;
  forecast: WeatherForecast[];
  cachedAt: number;
  expiresAt: number;
}

/**
 * Get cached forecast or null if expired/not found
 * Includes request deduplication to prevent multiple simultaneous requests
 */
export const getCachedForecast = async (
  lat: number,
  lng: number
): Promise<WeatherForecast[] | null> => {
  const cacheKey = `${lat.toFixed(4)}_${lng.toFixed(4)}`;
  
  // Check if there's already a pending request for this location
  const pending = pendingRequests.get(cacheKey);
  if (pending) {
    console.log('⏳ Weather cache: Reusing pending request for', cacheKey);
    return pending;
  }
  
  // Create new request promise
  const requestPromise = (async () => {
    try {
      // Try localStorage FIRST (faster and no network errors)
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        try {
          const cache = JSON.parse(saved) as CachedForecast[];
          const cached = cache.find(
            c => Math.abs(c.lat - lat) < 0.01 && Math.abs(c.lng - lng) < 0.01
          );

          if (cached && cached.expiresAt > Date.now()) {
            console.log('✅ Weather cache: Found in localStorage for', cacheKey);
            return cached.forecast;
          }
        } catch (e) {
          console.error('Error reading weather cache from localStorage', e);
        }
      }

      // Skip Supabase cache completely to avoid 406 errors
      // The daily_weather_log table seems to have RLS issues
      // We'll rely on localStorage which is faster and more reliable
      console.log('ℹ️ Weather cache: Using localStorage only (Supabase cache disabled)');
      
      // Note: Supabase cache disabled due to table access issues
      // This actually improves performance as localStorage is faster

      return null;
    } finally {
      // Clean up pending request
      pendingRequests.delete(cacheKey);
    }
  })();
  
  // Store pending request
  pendingRequests.set(cacheKey, requestPromise);
  
  return requestPromise;
};

/**
 * Cache forecast
 */
export const cacheForecast = async (
  lat: number,
  lng: number,
  forecast: WeatherForecast[]
): Promise<void> => {
  const cacheKey = `${lat.toFixed(4)}_${lng.toFixed(4)}`;
  const today = new Date().toISOString().split('T')[0];

  // ALWAYS cache in localStorage first (reliable, no network issues)
  cacheForecastLocal(lat, lng, forecast);
  console.log('✅ Weather cache: Saved to localStorage for', cacheKey);

  // Skip Supabase cache to avoid 406 errors - localStorage is sufficient and faster
  console.log('ℹ️ Weather cache: Supabase cache disabled (using localStorage only)');
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

