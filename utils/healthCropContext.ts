import type { Garden } from '@/types'

export type HealthCropContextId = 'generic' | 'orchard' | 'olive' | 'vineyard'

export interface HealthCropContext {
  id: HealthCropContextId
  title: string
  subtitle: string
  areaLabel: string
  entitySingular: string
  entityPlural: string
  monitoringIntervalDays: number
  focusTitle: string
  focusDescription: string
}

const HEALTH_CONTEXTS: Record<HealthCropContextId, HealthCropContext> = {
  generic: {
    id: 'generic',
    title: 'Salute delle Piante',
    subtitle: 'Monitoraggio AI e consulti specialistici',
    areaLabel: 'area coltivata',
    entitySingular: 'pianta',
    entityPlural: 'piante',
    monitoringIntervalDays: 14,
    focusTitle: 'Focus operativo',
    focusDescription: 'Controlli visivi, sintomi fogliari e reazioni rapide agli stress.',
  },
  orchard: {
    id: 'orchard',
    title: 'Salute del Frutteto',
    subtitle: 'Monitoraggio fenologico, fitosanitario e controlli mirati sugli alberi da frutto',
    areaLabel: 'frutteto',
    entitySingular: 'albero',
    entityPlural: 'alberi',
    monitoringIntervalDays: 10,
    focusTitle: 'Focus frutteto',
    focusDescription: 'Verifica allegagione, carpocapsa, ticchiolatura e regolarita dei controlli chioma-frutto.',
  },
  olive: {
    id: 'olive',
    title: 'Salute dell\'Oliveto',
    subtitle: 'Monitoraggio olivi, pressione di mosca olearia e stress idrico',
    areaLabel: 'oliveto',
    entitySingular: 'olivo',
    entityPlural: 'olivi',
    monitoringIntervalDays: 10,
    focusTitle: 'Focus oliveto',
    focusDescription: 'Controlla mosca, occhio di pavone, invaiatura e uniformita idrica tra gli olivi.',
  },
  vineyard: {
    id: 'vineyard',
    title: 'Salute del Vigneto',
    subtitle: 'Monitoraggio vite per vite, rischio fungino e gestione della maturazione',
    areaLabel: 'vigneto',
    entitySingular: 'vite',
    entityPlural: 'viti',
    monitoringIntervalDays: 7,
    focusTitle: 'Focus vigneto',
    focusDescription: 'Sorveglia peronospora, oidio, stress termico e andamento della maturazione dei grappoli.',
  },
}

export function inferHealthCropContext(garden?: Garden | null): HealthCropContext {
  if (!garden) {
    return HEALTH_CONTEXTS.generic
  }

  if (garden.gardenType === 'Vineyard' || garden.vineyardConfig) {
    return HEALTH_CONTEXTS.vineyard
  }

  if (garden.gardenType === 'OliveGrove' || garden.oliveGroveConfig) {
    return HEALTH_CONTEXTS.olive
  }

  if (garden.gardenType === 'Orchard' || garden.orchardConfig) {
    return HEALTH_CONTEXTS.orchard
  }

  return HEALTH_CONTEXTS.generic
}
