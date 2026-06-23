import type { FieldAlert, AlertSeverity, WeatherData } from '@/types/fieldAlerts';

function makeAlert(
  gardenId: string,
  category: FieldAlert['category'],
  severity: AlertSeverity,
  message: string,
  meta?: Record<string, unknown>
): FieldAlert {
  const computedAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  return { gardenId, category, severity, message, computedAt, expiresAt, meta };
}

// ─── WATER ────────────────────────────────────────────────────────────────────
export function checkWaterAlert(
  gardenId: string,
  irrigationDates: string[],   // ISO timestamps delle ultime irrigazioni
  weather: WeatherData,
  today: Date
): FieldAlert {
  const totalPrecipMm = weather.daily.precipitation_sum.reduce((a, b) => a + b, 0);

  const lastIrrigationDate = irrigationDates.length > 0
    ? new Date(Math.max(...irrigationDates.map(d => new Date(d).getTime())))
    : null;

  const daysSinceIrrigation = lastIrrigationDate
    ? Math.floor((today.getTime() - lastIrrigationDate.getTime()) / 86400000)
    : null; // null = no irrigation history known

  // Stima deficit: ETP semplificata = 4mm/giorno per estate mediterranea
  const etpWeek = 28;
  const deficit = etpWeek - totalPrecipMm;

  // Recent irrigation (≤3 days) means soil is adequately hydrated
  if (daysSinceIrrigation !== null && daysSinceIrrigation <= 3) {
    return makeAlert(gardenId, 'water', 'ok', 'Idratazione adeguata');
  }

  // Known irrigation history that is 5+ days stale combined with high deficit → critical
  if (daysSinceIrrigation !== null && daysSinceIrrigation >= 5 && deficit > 25) {
    return makeAlert(gardenId, 'water', 'critical',
      `Deficit idrico critico: ${Math.round(deficit)}mm · ultima irrigazione ${daysSinceIrrigation}gg fa`,
      { deficit, daysSinceIrrigation }
    );
  }
  if (deficit > 10) {
    return makeAlert(gardenId, 'water', 'warning',
      `Deficit idrico: ${Math.round(deficit)}mm negli ultimi 7gg`,
      { deficit }
    );
  }
  return makeAlert(gardenId, 'water', 'ok', 'Idratazione adeguata');
}

// ─── TREATMENT ────────────────────────────────────────────────────────────────
export function checkTreatmentAlert(
  gardenId: string,
  pendingTreatments: Array<{ nextDueDate: string }>,
  today: Date
): FieldAlert {
  if (pendingTreatments.length === 0) {
    return makeAlert(gardenId, 'treatment', 'ok', 'Nessun trattamento in scadenza');
  }

  const todayMs = today.getTime();
  let mostUrgentDiff = Infinity; // positivo = futuro, negativo = scaduto

  for (const t of pendingTreatments) {
    const dueMs = new Date(t.nextDueDate).getTime();
    const diff = Math.floor((dueMs - todayMs) / 86400000); // giorni
    if (diff < mostUrgentDiff) mostUrgentDiff = diff;
  }

  if (mostUrgentDiff < 0) {
    return makeAlert(gardenId, 'treatment', 'critical',
      `Trattamento scaduto da ${Math.abs(mostUrgentDiff)} giorno/i`,
      { daysOverdue: Math.abs(mostUrgentDiff) }
    );
  }
  if (mostUrgentDiff <= 2) {
    return makeAlert(gardenId, 'treatment', 'warning',
      `Trattamento in scadenza tra ${mostUrgentDiff} giorno/i`,
      { daysUntilDue: mostUrgentDiff }
    );
  }
  return makeAlert(gardenId, 'treatment', 'ok', 'Trattamenti nella norma');
}

// ─── HEAT ─────────────────────────────────────────────────────────────────────
const HEAT_WARNING_THRESHOLD = 35  // °C
const HEAT_CRITICAL_THRESHOLD = 40 // °C
const CONSECUTIVE_DAYS_FOR_WARNING = 2

export function checkHeatAlert(
  gardenId: string,
  weather: WeatherData
): FieldAlert {
  const temps = weather.daily.temperature_2m_max;

  if (temps.some(t => t >= HEAT_CRITICAL_THRESHOLD)) {
    return makeAlert(gardenId, 'heat', 'critical',
      `Temperature critiche: ${Math.max(...temps).toFixed(0)}°C previsti`,
      { maxTemp: Math.max(...temps) }
    );
  }

  let consecutiveHot = 0;
  for (const t of temps) {
    if (t >= HEAT_WARNING_THRESHOLD) {
      consecutiveHot++;
      if (consecutiveHot >= CONSECUTIVE_DAYS_FOR_WARNING) {
        return makeAlert(gardenId, 'heat', 'warning',
          `${consecutiveHot} giorni consecutivi sopra ${HEAT_WARNING_THRESHOLD}°C`,
          { consecutiveDays: consecutiveHot }
        );
      }
    } else {
      consecutiveHot = 0;
    }
  }

  return makeAlert(gardenId, 'heat', 'ok', 'Temperature nella norma');
}

// ─── DISEASE (modello Mills semplificato: gg pioggia come proxy bagnatura fogliare) ──
export function checkDiseaseAlert(
  gardenId: string,
  weather: WeatherData
): FieldAlert {
  const rainyDays = weather.daily.precipitation_sum.filter(mm => mm > 1).length;

  if (rainyDays >= 5) {
    return makeAlert(gardenId, 'disease', 'critical',
      `Rischio malattia critico: ${rainyDays} giorni piovosi negli ultimi 7gg`,
      { rainyDays }
    );
  }
  if (rainyDays >= 3) {
    return makeAlert(gardenId, 'disease', 'warning',
      `Rischio peronospora/oidio: ${rainyDays} giorni piovosi recenti`,
      { rainyDays }
    );
  }
  return makeAlert(gardenId, 'disease', 'ok', 'Condizioni sfavorevoli alle malattie');
}

// ─── HARVEST ──────────────────────────────────────────────────────────────────
export function checkHarvestAlert(
  gardenId: string,
  plants: Array<{ expectedHarvestDate: string; harvested: boolean }>,
  today: Date
): FieldAlert {
  const readyPlants = plants.filter(p => !p.harvested);
  if (readyPlants.length === 0) {
    return makeAlert(gardenId, 'harvest', 'ok', 'Nessuna coltura in prossimità di raccolta');
  }

  const todayMs = today.getTime();
  let mostUrgent = { diff: Infinity, date: '' };

  for (const p of readyPlants) {
    const harvestMs = new Date(p.expectedHarvestDate).getTime();
    const diff = Math.floor((harvestMs - todayMs) / 86400000);
    if (diff < mostUrgent.diff) mostUrgent = { diff, date: p.expectedHarvestDate };
  }

  if (mostUrgent.diff < 0) {
    return makeAlert(gardenId, 'harvest', 'critical',
      `Finestra di raccolta aperta da ${Math.abs(mostUrgent.diff)} giorni — agire subito`,
      { daysOverdue: Math.abs(mostUrgent.diff) }
    );
  }
  if (mostUrgent.diff <= 7) {
    return makeAlert(gardenId, 'harvest', 'warning',
      `Raccolta prevista tra ${mostUrgent.diff} giorni`,
      { daysUntilHarvest: mostUrgent.diff }
    );
  }
  return makeAlert(gardenId, 'harvest', 'ok', 'Nessuna raccolta imminente');
}
