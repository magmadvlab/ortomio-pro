/**
 * Soil State Service
 * Gestisce stato fisico del terreno (compattazione, drenaggio, lavorabilità)
 */

import { Garden } from '../types';

export interface SoilState {
  zoneId: string;
  gardenId: string;
  compaction: number; // 0-1, 0 = molto compatto, 1 = molto arieggiato
  drainage: 'poor' | 'moderate' | 'good' | 'excellent';
  workableDepth: number; // cm profondità lavorabile
  lastWorkDate?: Date;
  lastWorkType?: 'Plowing' | 'Tilling' | 'Sarchiatura' | 'Rincalzatura';
  lastRainDate?: Date;
  lastRainAmount?: number; // mm
}

/**
 * Aggiorna stato terreno
 */
export async function updateSoilState(
  gardenId: string,
  zoneId: string,
  state: Partial<SoilState>
): Promise<void> {
  const response = await fetch('/api/garden/soil-state', {
    method: 'PUT',
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ gardenId, zoneId, state }),
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body?.error || 'soil_state_update_failed');
}

/**
 * Recupera stato terreno
 */
export async function getSoilState(
  gardenId: string,
  zoneId: string
): Promise<SoilState | null> {
  const response = await fetch(
    `/api/garden/soil-state?garden_id=${encodeURIComponent(gardenId)}&zone_id=${encodeURIComponent(zoneId)}`,
    { credentials: 'include', cache: 'no-store' },
  );
  const body = await response.json();
  if (!response.ok) throw new Error(body?.error || 'soil_state_read_failed');
  if (!body.state) return null;
  return {
    gardenId: body.state.garden_id,
    zoneId: body.state.zone_id,
    compaction: Number(body.state.compaction),
    drainage: body.state.drainage,
    workableDepth: Number(body.state.workable_depth_cm),
    lastWorkDate: body.state.last_work_date ? new Date(body.state.last_work_date) : undefined,
    lastWorkType: body.state.last_work_type || undefined,
    lastRainDate: body.state.last_rain_date ? new Date(body.state.last_rain_date) : undefined,
    lastRainAmount: body.state.last_rain_amount_mm === null
      ? undefined
      : Number(body.state.last_rain_amount_mm),
  };
}

/**
 * Calcola se terreno è lavorabile
 */
export async function calculateWorkability(
  soilState: SoilState,
  garden: Garden,
  weatherForecast?: { tempMin?: number; tempMax?: number; precipitation?: number }
): Promise<{ isWorkable: boolean; reason: string; daysUntilWorkable?: number }> {
  // Verifica temperatura
  if (weatherForecast?.tempMin !== undefined && weatherForecast.tempMin < 0) {
    return {
      isWorkable: false,
      reason: 'Terreno ghiacciato. Temperatura minima prevista: ' + weatherForecast.tempMin.toFixed(1) + '°C',
    };
  }

  // Verifica pioggia recente
  if (soilState.lastRainDate) {
    const daysSinceRain = Math.ceil(
      (new Date().getTime() - soilState.lastRainDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const rainAmount = soilState.lastRainAmount || 0;

    // Terreno argilloso: 4-5 giorni dopo pioggia
    // Terreno sabbioso: 1-2 giorni dopo pioggia
    const requiredDays = garden.soilType === 'Clay' ? 5 : garden.soilType === 'Sandy' ? 2 : 3;

    if (daysSinceRain < requiredDays && rainAmount > 10) {
      return {
        isWorkable: false,
        reason: `Terreno troppo umido. Pioggia di ${rainAmount}mm ${daysSinceRain} giorni fa.`,
        daysUntilWorkable: requiredDays - daysSinceRain,
      };
    }
  }

  return {
    isWorkable: true,
    reason: 'Terreno in tempera, pronto per lavorazione',
  };
}

/**
 * Suggerisce lavorazione terreno
 */
export async function suggestSoilWork(
  soilState: SoilState,
  garden: Garden,
  plannedPlanting?: { plantName: string; date: Date }
): Promise<{ workType: string; urgency: 'low' | 'medium' | 'high'; reason: string } | null> {
  // Verifica se terreno è compattato
  if (soilState.compaction < 0.5) {
    return {
      workType: 'Sarchiatura',
      urgency: 'medium',
      reason: 'Terreno compattato. Sarchiatura migliorerà aerazione e drenaggio.',
    };
  }

  // Verifica se serve vangatura per nuova piantagione
  if (plannedPlanting) {
    const daysUntilPlanting = Math.ceil(
      (plannedPlanting.date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilPlanting <= 7 && !soilState.lastWorkDate) {
      return {
        workType: 'Vangatura',
        urgency: 'high',
        reason: `Piantagione di ${plannedPlanting.plantName} prevista tra ${daysUntilPlanting} giorni. Vangatura necessaria.`,
      };
    }
  }

  return null;
}
