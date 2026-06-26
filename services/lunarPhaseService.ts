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
