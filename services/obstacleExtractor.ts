/**
 * Obstacle Extractor
 * Estrae ostacoli 3D da foto 360° o input manuale per calcolo esposizione solare
 */

import { analyzePanoramic360, PanoramicAnalysis } from './photoAnalysisService';
import { Obstacle3D } from './preciseSunCalculator';

/**
 * Converte direzione cardinale/intercardinale in azimut (0-360°)
 * 0° = Nord, 90° = Est, 180° = Sud, 270° = Ovest
 */
function directionToAzimuth(direction: string): number {
  const directions: Record<string, number> = {
    'North': 0,
    'Northeast': 45,
    'East': 90,
    'Southeast': 135,
    'South': 180,
    'Southwest': 225,
    'West': 270,
    'Northwest': 315,
    'N': 0,
    'NE': 45,
    'E': 90,
    'SE': 135,
    'S': 180,
    'SW': 225,
    'W': 270,
    'NW': 315,
  };
  
  return directions[direction] ?? 0;
}

/**
 * Stima altezza ostacolo basata su tipo e altezza relativa
 */
function estimateObstacleHeight(
  type: 'Building' | 'Tree' | 'Mountain' | 'Other',
  heightCategory: 'Low' | 'Medium' | 'High'
): number {
  const heightMap: Record<string, Record<string, number>> = {
    'Building': {
      'Low': 5,
      'Medium': 10,
      'High': 20,
    },
    'Tree': {
      'Low': 4,
      'Medium': 8,
      'High': 15,
    },
    'Mountain': {
      'Low': 50,
      'Medium': 200,
      'High': 500,
    },
    'Other': {
      'Low': 3,
      'Medium': 6,
      'High': 12,
    },
  };
  
  return heightMap[type]?.[heightCategory] ?? 10;
}

/**
 * Stima distanza ostacolo basata su altezza e dimensione apparente
 * Più grande appare nella foto = più vicino
 */
function estimateObstacleDistance(
  height: number,
  heightCategory: 'Low' | 'Medium' | 'High',
  type: 'Building' | 'Tree' | 'Mountain' | 'Other'
): number {
  // Stima base: distanza tipica = 2-3x altezza per edifici/alberi
  // Per montagne, distanza molto maggiore
  if (type === 'Mountain') {
    return height * 10; // Montagne sono molto lontane
  }
  
  // Per edifici e alberi, stima più conservativa
  const multiplier = heightCategory === 'High' ? 2.5 : heightCategory === 'Medium' ? 2 : 1.5;
  return height * multiplier;
}

/**
 * Estrae ostacoli 3D da una foto panoramica 360°
 * 
 * @param photo360Base64 Foto 360° codificata in base64
 * @param lat Latitudine (per calcoli futuri più precisi)
 * @param lng Longitudine (per calcoli futuri più precisi)
 * @param photoNorthOffset Offset in gradi (0-360) tra Nord reale e Nord nella foto. Default: 0
 * @returns Array di ostacoli 3D identificati con azimuth corretti
 */
export async function extractObstaclesFrom360(
  photo360Base64: string,
  lat: number,
  lng: number,
  photoNorthOffset: number = 0
): Promise<Obstacle3D[]> {
  try {
    // Usa analisi AI esistente per identificare ostacoli
    const analysis: PanoramicAnalysis = await analyzePanoramic360(photo360Base64);
    
    // Converti ostacoli identificati dall'AI in ostacoli 3D
    const obstacles: Obstacle3D[] = analysis.obstacles.map(obs => {
      // Azimuth dall'AI è relativo al Nord nella foto
      const aiAzimuth = directionToAzimuth(obs.direction);
      
      // Applica offset per correggere al Nord reale
      // Se la foto è ruotata di X gradi, tutti gli azimuth devono essere corretti di X gradi
      let correctedAzimuth = (aiAzimuth + photoNorthOffset) % 360;
      if (correctedAzimuth < 0) correctedAzimuth += 360;
      
      const height = estimateObstacleHeight(obs.type, obs.height);
      const distance = estimateObstacleDistance(height, obs.height, obs.type);
      
      // Stima larghezza angolare basata su tipo
      // Edifici: più larghi (30-45°), alberi: più stretti (15-30°)
      let widthDegrees = 30; // Default
      if (obs.type === 'Building') {
        widthDegrees = obs.height === 'High' ? 45 : 30;
      } else if (obs.type === 'Tree') {
        widthDegrees = obs.height === 'High' ? 25 : 15;
      } else if (obs.type === 'Mountain') {
        widthDegrees = 60; // Montagne coprono più direzioni
      }
      
      return {
        azimuth: correctedAzimuth, // Usa azimuth corretto
        height,
        distance,
        widthDegrees,
        type: obs.type,
      };
    });
    
    return obstacles;
  } catch (error) {
    console.error('Error extracting obstacles from 360 photo:', error);
    throw new Error('Failed to extract obstacles from photo');
  }
}

/**
 * Crea ostacolo 3D da input manuale
 * 
 * @param input Dati ostacolo inseriti manualmente
 * @returns Ostacolo 3D
 */
export function parseObstaclesFromManualInput(input: {
  direction: string | number;  // Direzione cardinale o azimut (0-360)
  height: number;              // Altezza in metri
  distance: number;             // Distanza in metri
  widthDegrees?: number;       // Larghezza angolare (default: 30)
  type?: 'Building' | 'Tree' | 'Mountain' | 'Other';
}): Obstacle3D {
  let azimuth: number;
  
  // Se è un numero, è già un azimut
  if (typeof input.direction === 'number') {
    azimuth = input.direction;
  } else {
    // Altrimenti converte da direzione cardinale
    azimuth = directionToAzimuth(input.direction);
  }
  
  return {
    azimuth,
    height: input.height,
    distance: input.distance,
    widthDegrees: input.widthDegrees ?? 30,
    type: input.type ?? 'Other',
  };
}

/**
 * Valida ostacolo 3D
 */
export function validateObstacle(obstacle: Obstacle3D): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (obstacle.azimuth < 0 || obstacle.azimuth > 360) {
    errors.push('Azimut deve essere tra 0 e 360 gradi');
  }
  
  if (obstacle.height <= 0) {
    errors.push('Altezza deve essere maggiore di 0');
  }
  
  if (obstacle.distance <= 0) {
    errors.push('Distanza deve essere maggiore di 0');
  }
  
  if (obstacle.widthDegrees <= 0 || obstacle.widthDegrees > 180) {
    errors.push('Larghezza angolare deve essere tra 0 e 180 gradi');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Combina ostacoli multipli nella stessa direzione
 * Utile quando ci sono più ostacoli vicini
 */
export function mergeNearbyObstacles(
  obstacles: Obstacle3D[],
  azimuthThreshold: number = 10
): Obstacle3D[] {
  if (obstacles.length === 0) return [];
  
  const merged: Obstacle3D[] = [];
  const processed = new Set<number>();
  
  for (let i = 0; i < obstacles.length; i++) {
    if (processed.has(i)) continue;
    
    const current = obstacles[i];
    const nearby: Obstacle3D[] = [current];
    
    // Trova ostacoli vicini nella stessa direzione
    for (let j = i + 1; j < obstacles.length; j++) {
      if (processed.has(j)) continue;
      
      const other = obstacles[j];
      const azimuthDiff = Math.abs(current.azimuth - other.azimuth);
      const minAzimuthDiff = Math.min(azimuthDiff, 360 - azimuthDiff);
      
      if (minAzimuthDiff <= azimuthThreshold) {
        nearby.push(other);
        processed.add(j);
      }
    }
    
    // Se ci sono più ostacoli vicini, prendi quello più alto/bloccante
    if (nearby.length > 1) {
      const tallest = nearby.reduce((max, obs) => {
        const maxElevation = Math.atan2(max.height, max.distance);
        const obsElevation = Math.atan2(obs.height, obs.distance);
        return obsElevation > maxElevation ? obs : max;
      });
      merged.push(tallest);
    } else {
      merged.push(current);
    }
    
    processed.add(i);
  }
  
  return merged;
}

/**
 * Formatta ostacolo per visualizzazione
 */
export function formatObstacleDescription(obstacle: Obstacle3D): string {
  const directionNames: Record<number, string> = {
    0: 'Nord',
    45: 'Nord-Est',
    90: 'Est',
    135: 'Sud-Est',
    180: 'Sud',
    225: 'Sud-Ovest',
    270: 'Ovest',
    315: 'Nord-Ovest',
  };
  
  // Trova direzione più vicina
  const directions = Object.keys(directionNames).map(Number);
  const closestDir = directions.reduce((closest, dir) => {
    const currentDiff = Math.abs(obstacle.azimuth - dir);
    const closestDiff = Math.abs(obstacle.azimuth - closest);
    return currentDiff < closestDiff ? dir : closest;
  });
  
  const directionName = directionNames[closestDir] || `${Math.round(obstacle.azimuth)}°`;
  const typeName = obstacle.type === 'Building' ? 'Edificio' :
                   obstacle.type === 'Tree' ? 'Albero' :
                   obstacle.type === 'Mountain' ? 'Montagna' : 'Altro';
  
  return `${typeName} a ${directionName} (${obstacle.height}m alto, ${obstacle.distance}m di distanza)`;
}

