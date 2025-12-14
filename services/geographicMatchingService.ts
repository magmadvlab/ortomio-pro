/**
 * Geographic Matching Service
 * Calculates plant feasibility based on user location and USDA zones
 */

import { ExoticFruitCrop, FeasibilityResult, ExoticFruitVariety } from '../types/exoticFruit';
import { getCurrentPositionWithRetry, getDefaultCoordinates } from './geolocationService';

export interface UserLocation {
  lat: number;
  lon: number;
  altitude?: number;
  usdaZone?: string;
  distanceFromSea?: number;
  city?: string;
  region?: string;
}

/**
 * USDA Zone mapping for Italy (approximate)
 * Based on minimum winter temperatures
 */
const USDA_ZONE_MAP: Record<string, { min: number; max: number }> = {
  '7a': { min: -17.8, max: -15.0 },
  '7b': { min: -15.0, max: -12.2 },
  '8a': { min: -12.2, max: -9.4 },
  '8b': { min: -9.4, max: -6.7 },
  '9a': { min: -6.7, max: -3.9 },
  '9b': { min: -3.9, max: -1.1 },
  '10a': { min: -1.1, max: 1.7 },
  '10b': { min: 1.7, max: 4.4 },
  '11': { min: 4.4, max: 10.0 },
};

/**
 * Estimate USDA zone from latitude and altitude
 * This is a simplified approximation - for production, use a proper climate API
 */
export const estimateUsdaZone = (lat: number, altitude: number = 0): string => {
  // Base zone from latitude (Italy ranges from ~36°N to ~47°N)
  let baseZone = 9; // Default for central Italy
  
  if (lat < 38) {
    // Sicily, southern Calabria
    baseZone = altitude < 200 ? 10 : altitude < 500 ? 9 : 8;
  } else if (lat < 40) {
    // Southern Italy
    baseZone = altitude < 300 ? 9 : altitude < 800 ? 8 : 7;
  } else if (lat < 42) {
    // Central Italy
    baseZone = altitude < 200 ? 9 : altitude < 600 ? 8 : 7;
  } else if (lat < 45) {
    // Northern Italy
    baseZone = altitude < 100 ? 8 : altitude < 400 ? 7 : 6;
  } else {
    // Alpine regions
    baseZone = altitude < 300 ? 7 : altitude < 800 ? 6 : 5;
  }
  
  // Convert to USDA zone string
  if (baseZone >= 10) return '10a';
  if (baseZone >= 9) return lat < 38 && altitude < 200 ? '10a' : '9b';
  if (baseZone >= 8) return '8b';
  if (baseZone >= 7) return '8a';
  return '7b';
};

/**
 * Auto-detect USDA zone from coordinates
 * Uses browser geolocation if available, otherwise estimates from coordinates
 */
export const detectUsdaZone = async (
  lat: number,
  lon: number,
  altitude?: number
): Promise<string> => {
  // If altitude provided, use it
  if (altitude !== undefined) {
    return estimateUsdaZone(lat, altitude);
  }
  
  // Try to get altitude from API (simplified - in production use proper elevation API)
  // For now, estimate based on latitude
  return estimateUsdaZone(lat, 0);
};

/**
 * Calculate distance from sea (simplified approximation)
 * In production, use proper geospatial calculation
 */
const estimateDistanceFromSea = (lat: number, lon: number): number => {
  // Simplified: Italy is surrounded by sea, so estimate based on distance from coastlines
  // This is a rough approximation - for production use proper coastline distance calculation
  
  // Major Italian coastlines (simplified)
  const coasts = [
    { lat: 44.4, lon: 8.9 }, // Genoa
    { lat: 41.9, lon: 12.5 }, // Rome
    { lat: 40.8, lon: 14.3 }, // Naples
    { lat: 38.1, lon: 13.4 }, // Palermo
    { lat: 36.9, lon: 14.7 }, // Catania
  ];
  
  let minDistance = Infinity;
  for (const coast of coasts) {
    const distance = Math.sqrt(
      Math.pow(lat - coast.lat, 2) + Math.pow(lon - coast.lon, 2)
    ) * 111; // Convert degrees to km (approximate)
    minDistance = Math.min(minDistance, distance);
  }
  
  return Math.round(minDistance);
};

/**
 * Get local climate data (simplified)
 * In production, integrate with weather API
 */
export const getLocalClimateData = async (
  lat: number,
  lon: number
): Promise<{
  lastFrostDate: string;
  firstFrostDate: string;
  avgTemp: { min: number; max: number };
  precipitation: number;
}> => {
  // Simplified estimation based on latitude
  // In production, use weather API like OpenWeatherMap, WeatherAPI, etc.
  
  const isSouth = lat < 40;
  const isNorth = lat > 45;
  
  return {
    lastFrostDate: isSouth ? '2024-03-01' : isNorth ? '2024-04-15' : '2024-03-20',
    firstFrostDate: isSouth ? '2024-12-01' : isNorth ? '2024-10-15' : '2024-11-15',
    avgTemp: {
      min: isSouth ? 8 : isNorth ? 2 : 5,
      max: isSouth ? 28 : isNorth ? 24 : 26,
    },
    precipitation: isSouth ? 600 : isNorth ? 1000 : 800, // mm/year
  };
};

/**
 * Calculate feasibility score for a plant based on user location
 */
export const calculateFeasibility = (
  plant: ExoticFruitCrop,
  userLocation: UserLocation
): FeasibilityResult => {
  const warnings: string[] = [];
  const requiredProtections: string[] = [];
  let score = 100;
  
  // Get climate compatibility data
  const climate = plant.climateCompatibility;
  if (!climate) {
    // Fallback to basic climate requirements
    return {
      feasibility: 'Possible',
      score: 50,
      requiredProtections: [],
      recommendedSystem: 'greenhouse',
      warnings: ['Dati climatici incompleti per questa pianta'],
      recommendedVariety: plant.varieties?.[0]?.name,
    };
  }
  
  // Check USDA zone compatibility
  if (userLocation.usdaZone) {
    const userZoneNum = parseFloat(userLocation.usdaZone.replace(/[a-z]/i, ''));
    const optimalZones = climate.optimalUsdaZones || climate.usdaZones;
    const compatibleZones = climate.usdaZones;
    
    if (!compatibleZones.includes(userZoneNum)) {
      score -= 40;
      warnings.push(`La tua zona USDA (${userLocation.usdaZone}) non è compatibile con questa pianta`);
    } else if (!optimalZones.includes(userZoneNum)) {
      score -= 20;
      warnings.push(`La tua zona USDA (${userLocation.usdaZone}) è al limite della compatibilità`);
    }
  }
  
  // Check altitude
  if (userLocation.altitude !== undefined && climate.maxAltitudeMeters) {
    if (userLocation.altitude > climate.maxAltitudeMeters) {
      score -= 30;
      warnings.push(`L'altitudine (${userLocation.altitude}m) supera il limite consigliato (${climate.maxAltitudeMeters}m)`);
    }
  }
  
  // Check distance from sea
  if (climate.benefitsFromSea && userLocation.distanceFromSea !== undefined) {
    if (userLocation.distanceFromSea > (climate.seaDistanceKm || 50)) {
      score -= 15;
      warnings.push(`La distanza dal mare (${userLocation.distanceFromSea}km) potrebbe limitare la crescita`);
    }
  }
  
  // Determine recommended system
  const cultivationSystems = plant.cultivationSystems;
  let recommendedSystem: 'openField' | 'container' | 'greenhouse' = 'greenhouse';
  
  if (cultivationSystems) {
    // Check open field feasibility
    if (cultivationSystems.openField?.possible) {
      const requires = cultivationSystems.openField.requires;
      if (userLocation.usdaZone && requires.minUsdaZone) {
        const userZoneNum = parseFloat(userLocation.usdaZone.replace(/[a-z]/i, ''));
        if (userZoneNum >= requires.minUsdaZone) {
          recommendedSystem = 'openField';
          if (requires.protection !== 'None') {
            requiredProtections.push(requires.protectionType || 'Protezione temporanea');
          }
        }
      }
    }
    
    // Check container feasibility
    if (cultivationSystems.container?.possible && score > 40) {
      if (recommendedSystem === 'greenhouse' && score < 60) {
        recommendedSystem = 'container';
        if (cultivationSystems.container.moveableIndoor) {
          requiredProtections.push('Spostamento indoor in inverno');
        }
      }
    }
    
    // Greenhouse requirements
    if (cultivationSystems.greenhouse?.required) {
      recommendedSystem = 'greenhouse';
      if (cultivationSystems.greenhouse.heatingRequired) {
        requiredProtections.push('Riscaldamento serra');
      }
    }
  }
  
  // Find best variety for this location
  let recommendedVariety: string | undefined;
  if (plant.varieties && plant.varieties.length > 0) {
    // Sort varieties by cold hardiness (best for user's climate)
    const sortedVarieties = [...plant.varieties].sort((a, b) => {
      // Prefer varieties with better cold hardiness for cooler zones
      if (userLocation.usdaZone) {
        const userZoneNum = parseFloat(userLocation.usdaZone.replace(/[a-z]/i, ''));
        if (userZoneNum < 9) {
          return b.coldHardiness - a.coldHardiness; // Higher cold hardiness first
        }
      }
      return 0;
    });
    
    recommendedVariety = sortedVarieties[0]?.name;
    
    // Also prefer container-friendly varieties if container system recommended
    if (recommendedSystem === 'container') {
      const containerVariety = sortedVarieties.find(v => v.containerFriendly);
      if (containerVariety) {
        recommendedVariety = containerVariety.name;
      }
    }
  }
  
  // Determine feasibility level
  let feasibility: 'Ideal' | 'Possible' | 'Difficult' | 'NotRecommended';
  if (score >= 80) {
    feasibility = 'Ideal';
  } else if (score >= 50) {
    feasibility = 'Possible';
  } else if (score >= 20) {
    feasibility = 'Difficult';
  } else {
    feasibility = 'NotRecommended';
  }
  
  // Add system-specific warnings
  if (recommendedSystem === 'greenhouse' && !cultivationSystems?.greenhouse?.required) {
    warnings.push('Serra consigliata per migliori risultati');
  }
  
  if (recommendedSystem === 'container' && cultivationSystems?.container?.moveableIndoor) {
    warnings.push('Vaso spostabile necessario per protezione invernale');
  }
  
  return {
    feasibility,
    score: Math.max(0, Math.min(100, score)),
    requiredProtections,
    recommendedVariety,
    recommendedSystem,
    warnings,
  };
};

/**
 * Get user location profile from browser geolocation
 */
export const getUserLocationProfile = async (): Promise<UserLocation | null> => {
  try {
    const result = await getCurrentPositionWithRetry(2);
    
    if (!result.success || !result.latitude || !result.longitude) {
      // Fallback to default coordinates
      const defaultCoords = getDefaultCoordinates();
      const usdaZone = await detectUsdaZone(defaultCoords.latitude, defaultCoords.longitude);
      const distanceFromSea = estimateDistanceFromSea(defaultCoords.latitude, defaultCoords.longitude);
      
      return {
        lat: defaultCoords.latitude,
        lon: defaultCoords.longitude,
        usdaZone,
        distanceFromSea,
        city: 'Roma',
        region: 'Lazio',
      };
    }
    
    const usdaZone = await detectUsdaZone(result.latitude, result.longitude);
    const distanceFromSea = estimateDistanceFromSea(result.latitude, result.longitude);
    
    return {
      lat: result.latitude,
      lon: result.longitude,
      usdaZone,
      distanceFromSea,
    };
  } catch (error) {
    console.error('Error getting user location:', error);
    return null;
  }
};

