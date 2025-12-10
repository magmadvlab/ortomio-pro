/**
 * Sun Incidence Calculator
 * Calcola l'incidenza solare per ogni cella della griglia del giardino
 * Considera: orientamento, posizione nella griglia, ostacoli
 */

import { Garden } from '../types';

export interface SunIncidenceCell {
  x: number; // Posizione X nella griglia (0-100%)
  y: number; // Posizione Y nella griglia (0-100%)
  dailySunHours: number; // Ore di sole effettive per questa cella
  sunExposure: 'FullSun' | 'PartSun' | 'Shade';
  intensity: number; // 0-1, intensità solare relativa
}

export interface Obstacle {
  x: number; // Posizione X (0-100%)
  y: number; // Posizione Y (0-100%)
  width: number; // Larghezza (0-100%)
  height: number; // Altezza (0-100%)
  type: 'Tree' | 'Building' | 'Wall' | 'Fence';
  shadowLength: number; // Lunghezza ombra in percentuale (0-100%)
}

/**
 * Calcola l'incidenza solare per ogni cella della griglia
 * @param garden Giardino con dati microclima
 * @param gridSize Numero di celle per lato (default: 10)
 * @param obstacles Array di ostacoli che proiettano ombra
 * @returns Array di celle con incidenza solare calcolata
 */
export const calculateSunIncidence = (
  garden: Garden,
  gridSize: number = 10,
  obstacles: Obstacle[] = []
): SunIncidenceCell[] => {
  const baseSunHours = garden.dailySunHours || 6; // Default 6 ore
  const aspectDirection = garden.aspectDirection || 'South';
  const cells: SunIncidenceCell[] = [];

  // Fattori di orientamento
  // Sud: massimo sole, Nord: minimo sole
  const orientationFactor: Record<string, { x: number; y: number }> = {
    'South': { x: 0, y: 1 }, // Più sole verso Sud (y alto)
    'North': { x: 0, y: -1 }, // Meno sole verso Nord (y basso)
    'East': { x: 1, y: 0 }, // Più sole verso Est (x alto)
    'West': { x: -1, y: 0 }, // Più sole verso Ovest (x basso)
    'Flat': { x: 0, y: 0 }, // Nessuna variazione
  };

  const orientation = orientationFactor[aspectDirection] || { x: 0, y: 0 };

  // Calcola per ogni cella
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const x = (col / gridSize) * 100; // 0-100%
      const y = (row / gridSize) * 100; // 0-100%

      // 1. Calcolo base basato su posizione e orientamento
      let sunHours = baseSunHours;

      // Variazione basata su orientamento
      // Sud: +20% sole nelle celle superiori, -20% nelle inferiori
      // Nord: opposto
      const positionFactor = (orientation.x * (x / 100 - 0.5)) + (orientation.y * (y / 100 - 0.5));
      sunHours += baseSunHours * positionFactor * 0.3; // Max variazione ±30%

      // 2. Applica ombre da ostacoli
      for (const obstacle of obstacles) {
        const shadowEffect = calculateShadowEffect(x, y, obstacle);
        sunHours -= shadowEffect; // Riduce ore di sole
      }

      // 3. Bordi del giardino (meno sole se ci sono recinzioni/alberi esterni)
      const edgePenalty = calculateEdgePenalty(x, y, gridSize);
      sunHours -= edgePenalty;

      // Limita valori
      sunHours = Math.max(0, Math.min(12, sunHours));

      // Determina tipo esposizione
      let sunExposure: 'FullSun' | 'PartSun' | 'Shade';
      if (sunHours >= 8) {
        sunExposure = 'FullSun';
      } else if (sunHours >= 4) {
        sunExposure = 'PartSun';
      } else {
        sunExposure = 'Shade';
      }

      // Intensità relativa (0-1)
      const intensity = sunHours / 12;

      cells.push({
        x,
        y,
        dailySunHours: Math.round(sunHours * 10) / 10, // Arrotonda a 1 decimale
        sunExposure,
        intensity,
      });
    }
  }

  return cells;
};

/**
 * Calcola l'effetto ombra di un ostacolo su una cella
 */
const calculateShadowEffect = (
  cellX: number,
  cellY: number,
  obstacle: Obstacle
): number => {
  // Verifica se la cella è dentro l'ostacolo
  const isInsideObstacle = (
    cellX >= obstacle.x &&
    cellX <= obstacle.x + obstacle.width &&
    cellY >= obstacle.y &&
    cellY <= obstacle.y + obstacle.height
  );

  if (isInsideObstacle) {
    // Cella dentro ostacolo: ombra totale
    return 8; // Perde tutte le ore di sole
  }

  // Calcola distanza dall'ostacolo
  const centerX = obstacle.x + obstacle.width / 2;
  const centerY = obstacle.y + obstacle.height / 2;
  const distance = Math.sqrt(
    Math.pow(cellX - centerX, 2) + Math.pow(cellY - centerY, 2)
  );

  // Ombra si estende in base a shadowLength
  const shadowRadius = obstacle.shadowLength;
  if (distance <= shadowRadius) {
    // Cella nell'ombra proiettata
    const shadowIntensity = 1 - (distance / shadowRadius); // 1 (centro) -> 0 (bordo)
    return shadowIntensity * 4; // Max 4 ore perse
  }

  return 0; // Nessun effetto
};

/**
 * Calcola penalità per celle ai bordi (recinzioni, alberi esterni)
 */
const calculateEdgePenalty = (
  x: number,
  y: number,
  gridSize: number
): number => {
  const edgeThreshold = 10; // % dal bordo
  let penalty = 0;

  // Bordo sinistro
  if (x < edgeThreshold) {
    penalty += (edgeThreshold - x) / edgeThreshold * 0.5; // Max 0.5h perse
  }

  // Bordo destro
  if (x > 100 - edgeThreshold) {
    penalty += (x - (100 - edgeThreshold)) / edgeThreshold * 0.5;
  }

  // Bordo superiore (Nord)
  if (y < edgeThreshold) {
    penalty += (edgeThreshold - y) / edgeThreshold * 0.5;
  }

  // Bordo inferiore (Sud)
  if (y > 100 - edgeThreshold) {
    penalty += (y - (100 - edgeThreshold)) / edgeThreshold * 0.3; // Meno penalità a Sud
  }

  return penalty;
};

/**
 * Genera ostacoli di esempio basati su descrizione testuale
 * (Utile per onboarding futuro con descrizione ostacoli)
 */
export const parseObstaclesFromDescription = (
  description: string
): Obstacle[] => {
  // Placeholder: in futuro si può usare NLP per estrarre ostacoli da testo
  // Per ora restituisce array vuoto
  return [];
};

/**
 * Ottiene l'incidenza solare per una posizione specifica
 */
export const getSunIncidenceAtPosition = (
  cells: SunIncidenceCell[],
  x: number,
  y: number
): SunIncidenceCell | null => {
  // Trova la cella più vicina
  let closest: SunIncidenceCell | null = null;
  let minDistance = Infinity;

  for (const cell of cells) {
    const distance = Math.sqrt(
      Math.pow(cell.x - x, 2) + Math.pow(cell.y - y, 2)
    );
    if (distance < minDistance) {
      minDistance = distance;
      closest = cell;
    }
  }

  return closest;
};

