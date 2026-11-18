import type { Garden } from '@/types'

export function gardenManagementHref(garden: Pick<Garden, 'id' | 'gardenType'>): string {
  const route = garden.gardenType === 'Orchard' ? '/app/orchard'
    : garden.gardenType === 'OliveGrove' ? '/app/olives'
    : garden.gardenType === 'Vineyard' ? '/app/vineyard' : '/app/garden'
  return `${route}?garden=${encodeURIComponent(garden.id)}`
}

/** Keep an explicit target; never substitute another field for an unavailable URL target. */
export function resolveGardenSelection(gardens: Array<{ id: string }>, requested: string | null, current = ''): string {
  if (current && gardens.some(garden => garden.id === current)) return current
  if (requested) return gardens.some(garden => garden.id === requested) ? requested : ''
  return gardens[0]?.id ?? ''
}
