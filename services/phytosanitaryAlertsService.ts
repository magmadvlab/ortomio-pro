/**
 * Phytosanitary Alerts Service
 * Integra segnalazioni fitosanitarie regionali
 */

export interface PhytosanitaryAlert {
  id: string;
  region: string;
  plantName?: string;
  disease?: string;
  pest?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  date: Date;
  description: string;
  recommendedActions: string[];
  affectedAreas?: string[];
}

/**
 * Recupera alert fitosanitari regionali
 */
export async function getRegionalAlerts(
  region: string,
  startDate?: Date,
  endDate?: Date
): Promise<PhytosanitaryAlert[]> {
  // TODO: Integrare con servizi regionali (es. Regione Lombardia, Regione Toscana, ecc.)
  // Per ora, mock basato su stagione
  const alerts: PhytosanitaryAlert[] = [];
  const now = new Date();
  const month = now.getMonth() + 1;

  // Alert stagionali comuni
  if (month >= 5 && month <= 7) {
    // Primavera/estate: peronospora pomodoro
    alerts.push({
      id: 'peronospora-tomato-' + now.getTime(),
      region,
      plantName: 'Pomodoro',
      disease: 'Peronospora',
      severity: 'high',
      date: now,
      description: 'Segnalazioni di peronospora su pomodoro in aumento nella regione',
      recommendedActions: [
        'Trattamenti preventivi con rame',
        'Evitare irrigazione fogliare',
        'Migliorare aerazione',
      ],
    });
  }

  if (month >= 6 && month <= 8) {
    // Estate: afidi
    alerts.push({
      id: 'afidi-' + now.getTime(),
      region,
      pest: 'Afidi',
      severity: 'medium',
      date: now,
      description: 'Presenza di afidi in aumento',
      recommendedActions: [
        'Controlli settimanali',
        'Trattamenti con piretro naturale se necessario',
        'Promuovere insetti utili (coccinelle)',
      ],
    });
  }

  return alerts;
}

/**
 * Verifica rischio per pianta specifica
 */
export async function checkPlantRisk(
  plantName: string,
  region: string
): Promise<{ risk: 'low' | 'medium' | 'high'; alerts: PhytosanitaryAlert[] }> {
  const alerts = await getRegionalAlerts(region);
  const relevantAlerts = alerts.filter(
    (a) => !a.plantName || a.plantName.toLowerCase().includes(plantName.toLowerCase())
  );

  if (relevantAlerts.length === 0) {
    return { risk: 'low', alerts: [] };
  }

  const hasHighSeverity = relevantAlerts.some((a) => a.severity === 'high' || a.severity === 'critical');
  const risk = hasHighSeverity ? 'high' : relevantAlerts.length > 2 ? 'medium' : 'low';

  return { risk, alerts: relevantAlerts };
}

/**
 * Recupera trattamenti raccomandati per alert
 */
export function getRecommendedTreatments(alert: PhytosanitaryAlert): string[] {
  return alert.recommendedActions || [];
}

