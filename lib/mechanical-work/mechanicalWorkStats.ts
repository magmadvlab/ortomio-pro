import type { MechanicalWorkRecord } from '@/types'

export interface MechanicalWorkStats {
  totalOperations: number
  totalAreaSqm: number
  equipmentTypes: number
  monthlyObservedCost: number | null
  operationsByType: Array<{ type: string; count: number }>
}

export function calculateMechanicalWorkStats(
  works: MechanicalWorkRecord[],
  now: Date = new Date(),
): MechanicalWorkStats {
  const currentMonth = now.toISOString().slice(0, 7)
  const monthlyCosts = works
    .filter((work) => work.work_date.slice(0, 7) === currentMonth)
    .map((work) => work.work_metadata?.standardCost)
    .filter((cost): cost is number => typeof cost === 'number' && Number.isFinite(cost))
  const counts = new Map<string, number>()

  for (const work of works) {
    counts.set(work.work_type, (counts.get(work.work_type) || 0) + 1)
  }

  return {
    totalOperations: works.length,
    totalAreaSqm: works.reduce((total, work) => total + Math.max(0, work.area_m2), 0),
    equipmentTypes: new Set(
      works.map((work) => work.equipment_type?.trim()).filter((value): value is string => Boolean(value))
    ).size,
    monthlyObservedCost: monthlyCosts.length > 0
      ? monthlyCosts.reduce((total, cost) => total + cost, 0)
      : null,
    operationsByType: Array.from(counts, ([type, count]) => ({ type, count }))
      .sort((left, right) => right.count - left.count || left.type.localeCompare(right.type)),
  }
}

const WORK_TYPE_LABELS: Record<string, string> = {
  Plowing: 'Aratura',
  Subsoiling: 'Ripuntatura',
  Harrowing: 'Erpicatura',
  Tilling: 'Lavorazione terreno',
  Rolling: 'Rullatura',
  Hoeing: 'Sarchiatura',
  EarthingUp: 'Rincalzatura',
  Mulching: 'Pacciamatura',
  Mowing: 'Sfalcio',
  Pruning: 'Potatura',
  Harvesting: 'Raccolta',
  Planting: 'Semina o trapianto',
}

export function formatMechanicalWorkType(workType: string): string {
  return WORK_TYPE_LABELS[workType] || workType
}
