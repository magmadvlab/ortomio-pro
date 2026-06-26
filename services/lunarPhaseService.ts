/**
 * Lunar Phase Service
 * Calcola la fase lunare corrente basandosi sul ciclo sinodico.
 * Usato in agricoltura biodinamica per decisioni di potatura, semina, raccolta.
 */

export type LunarPhase =
  | 'new_moon'
  | 'waxing_crescent'
  | 'first_quarter'
  | 'waxing_gibbous'
  | 'full_moon'
  | 'waning_gibbous'
  | 'last_quarter'
  | 'waning_crescent'

const SYNODIC_CYCLE = 29.53058867
const REF_NEW_MOON = new Date('2000-01-06T18:14:00Z').getTime()
const MS_PER_DAY = 86400000

/**
 * Calcola la fase lunare per una data specifica.
 * Basato sul ciclo sinodico medio di 29.53058867 giorni.
 * Luna nuova di riferimento: 2000-01-06T18:14:00Z
 */
export function getLunarPhase(date: Date): LunarPhase {
  const daysSinceRef = (date.getTime() - REF_NEW_MOON) / MS_PER_DAY
  const pos = ((daysSinceRef % SYNODIC_CYCLE) + SYNODIC_CYCLE) % SYNODIC_CYCLE

  if (pos < 1.85) return 'new_moon'
  if (pos < 7.38) return 'waxing_crescent'
  if (pos < 9.22) return 'first_quarter'
  if (pos < 14.77) return 'waxing_gibbous'
  if (pos < 16.61) return 'full_moon'
  if (pos < 22.15) return 'waning_gibbous'
  if (pos < 23.99) return 'last_quarter'
  return 'waning_crescent'
}

/**
 * Lookup table delle attività biodinamiche favorevoli per ogni fase lunare
 */
const LUNAR_ACTIVITIES: Record<LunarPhase, string[]> = {
  new_moon: ['piantagione', 'semina radici', 'riposo vegetativo'],
  waxing_crescent: ['semina', 'trapianto', 'potatura verde'],
  first_quarter: ['semina frutta', 'irrigazione', 'concimazione fogliare'],
  waxing_gibbous: ['raccolta frutti', 'potatura produzione', 'concimazione'],
  full_moon: ['raccolta', 'conservazione', 'lavorazione prodotti'],
  waning_gibbous: ['potatura secco', 'trattamenti preventivi', 'propagazione'],
  last_quarter: ['lavorazione terreno', 'sarchiatura', 'trattamenti'],
  waning_crescent: ['riposo', 'preparazione terreno', 'compostaggio'],
}

/**
 * Restituisce le attività biodinamiche favorevoli per una fase lunare
 */
export function getLunarActivities(phase: LunarPhase): string[] {
  return LUNAR_ACTIVITIES[phase]
}

const PHASE_DISPLAY_NAMES: Record<LunarPhase, string> = {
  new_moon: 'Luna nuova',
  waxing_crescent: 'Luna crescente',
  first_quarter: 'Primo quarto',
  waxing_gibbous: 'Gibbosa crescente',
  full_moon: 'Luna piena',
  waning_gibbous: 'Gibbosa calante',
  last_quarter: 'Ultimo quarto',
  waning_crescent: 'Luna calante',
}

export function getPhaseDisplayName(phase: LunarPhase): string {
  return PHASE_DISPLAY_NAMES[phase]
}
