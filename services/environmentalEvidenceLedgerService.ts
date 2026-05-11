export type EnvironmentalEvidenceKind =
  | 'weather_history'
  | 'weather_forecast'
  | 'irrigation_context'
  | 'water_quality'
  | 'soil_signal'
  | 'sensor_signal'
  | 'manual_observation'

export interface EnvironmentalEvidenceRecord {
  id: string
  gardenId: string
  fieldRowId?: string
  zoneId?: string
  kind: EnvironmentalEvidenceKind
  source: string
  confidence: number
  summary: string
  createdAt: string
}

const STORE_KEY = 'ortomio:environmental-evidence:v1'

function isBrowser() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function readStore(): EnvironmentalEvidenceRecord[] {
  if (!isBrowser()) return []
  try {
    const raw = window.localStorage.getItem(STORE_KEY)
    return raw ? JSON.parse(raw) as EnvironmentalEvidenceRecord[] : []
  } catch {
    return []
  }
}

function writeStore(records: EnvironmentalEvidenceRecord[]) {
  if (!isBrowser()) return
  window.localStorage.setItem(STORE_KEY, JSON.stringify(records))
}

export const environmentalEvidenceLedgerService = {
  record(entry: Omit<EnvironmentalEvidenceRecord, 'id' | 'createdAt'>): EnvironmentalEvidenceRecord {
    const record: EnvironmentalEvidenceRecord = {
      ...entry,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }
    const records = readStore()
    records.unshift(record)
    writeStore(records.slice(0, 500))
    return record
  },

  list(gardenId?: string): EnvironmentalEvidenceRecord[] {
    const records = readStore()
    return gardenId ? records.filter(record => record.gardenId === gardenId) : records
  },

  summarize(gardenId?: string): {
    count: number
    avgConfidence: number
    latest?: EnvironmentalEvidenceRecord
  } {
    const records = this.list(gardenId)
    const avgConfidence = records.length
      ? Math.round(records.reduce((sum, record) => sum + record.confidence, 0) / records.length)
      : 0

    return {
      count: records.length,
      avgConfidence,
      latest: records[0],
    }
  }
}

