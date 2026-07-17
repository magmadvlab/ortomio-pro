export type DiaryEventType = 'operation' | 'observation' | 'result' | 'issue' | 'milestone' | 'weather' | 'ai_suggestion'
export type DiaryEventCategory = 'seeding' | 'growth' | 'care' | 'protection' | 'harvest' | 'analysis' | 'planning'
export type DiaryEventSource = 'manual' | 'task' | 'device' | 'automation' | 'ai' | 'import'

export interface DiaryEvent {
  id: string
  gardenId: string
  zoneId?: string
  fieldRowId?: string
  plantId?: string
  taskId?: string
  authorId?: string
  date: string
  time: string
  type: DiaryEventType
  category: DiaryEventCategory
  title: string
  description: string
  source: DiaryEventSource
  status: 'active' | 'voided'
  operationData?: Record<string, any>
  results?: Record<string, any>
  gpsLocation?: { lat: number; lng: number }
  photos?: string[]
  attachments?: Array<{ url: string; name?: string; mimeType?: string }>
  verified: boolean
  aiGenerated?: boolean
  correlatedEntries?: string[]
  tags?: string[]
  performance?: { efficiency: number; effectiveness: number; roi: number; timeToResult: number }
  idempotencyKey?: string
  revision: number
  createdAt: string
  updatedAt: string
  voidedAt?: string
  voidReason?: string
}

export type DiaryEventCreate = Omit<DiaryEvent, 'id' | 'revision' | 'createdAt' | 'updatedAt' | 'status'> & {
  status?: DiaryEvent['status']
}
