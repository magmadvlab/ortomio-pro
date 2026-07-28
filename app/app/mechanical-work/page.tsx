'use client'

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { BarChart3, Calendar, Clock, MapPin, Plus, Tractor, Wrench, X } from 'lucide-react'
import type { Garden, MechanicalWorkRecord } from '@/types'
import { useStorage } from '@/packages/core/hooks/useStorage'
import TaskExecutionBanner from '@/components/shared/TaskExecutionBanner'
import { MechanicalWorkLogForm } from '@/components/mechanicalWork/MechanicalWorkLogForm'
import { buildMechanicalMeasuredFeedback } from '@/services/agronomicMeasuredFeedbackService'
import { buildMechanicalOperatorEvidence } from '@/services/agronomicOperatorEvidenceService'
import { finalizeTaskExecutionPostAction } from '@/services/taskExecutionPostActionService'
import { appendSourceTaskReference } from '@/services/taskExecutionTraceService'
import type { MechanicalWorkLog } from '@/services/mechanicalWorkService'
import type { TaskExecutionContext } from '@/services/taskExecutionLaunchService'
import {
  buildMechanicalExecutionBootstrapState,
  buildTaskExecutionNotes,
  parseTaskExecutionContext,
} from '@/services/taskExecutionOrchestratorService'
import {
  calculateMechanicalWorkStats,
  formatMechanicalWorkType,
} from '@/lib/mechanical-work/mechanicalWorkStats'

type MechanicalTab = 'overview' | 'records' | 'analytics'

const TABS = [
  { id: 'overview', label: 'Panoramica', icon: BarChart3 },
  { id: 'records', label: 'Registro', icon: Tractor },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
] satisfies Array<{ id: MechanicalTab; label: string; icon: typeof Tractor }>

function MechanicalWorkContent() {
  const { storageProvider } = useStorage()
  const searchParams = useSearchParams()
  const [gardens, setGardens] = useState<Garden[]>([])
  const [activeGarden, setActiveGarden] = useState<Garden | null>(null)
  const [activeTab, setActiveTab] = useState<MechanicalTab>('overview')
  const [mechanicalWorks, setMechanicalWorks] = useState<MechanicalWorkRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [showExecutionForm, setShowExecutionForm] = useState(false)
  const [taskExecutionContext, setTaskExecutionContext] = useState<TaskExecutionContext | null>(null)
  const [executionInitialData, setExecutionInitialData] = useState<Partial<MechanicalWorkLog> | undefined>(undefined)
  const [consumedLaunchSignature, setConsumedLaunchSignature] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const loadGardens = async () => {
      try {
        const loadedGardens = await storageProvider.getGardens()
        if (!cancelled) {
          setGardens(loadedGardens)
          setActiveGarden((current) =>
            loadedGardens.find((garden) => garden.id === current?.id) || loadedGardens[0] || null
          )
        }
      } catch (error) {
        console.error('Error loading gardens:', error)
        if (!cancelled) setLoadError('Impossibile caricare gli orti disponibili.')
      }
    }

    void loadGardens()
    return () => {
      cancelled = true
    }
  }, [storageProvider])

  const loadMechanicalWorks = useCallback(async () => {
    if (!activeGarden) {
      setMechanicalWorks([])
      setLoading(false)
      return
    }

    setLoading(true)
    setLoadError(null)
    try {
      setMechanicalWorks(await storageProvider.getMechanicalWorks(activeGarden.id))
    } catch (error) {
      console.error('Error loading mechanical works:', error)
      setMechanicalWorks([])
      setLoadError('Impossibile leggere il registro delle lavorazioni.')
    } finally {
      setLoading(false)
    }
  }, [activeGarden, storageProvider])

  useEffect(() => {
    void loadMechanicalWorks()
  }, [loadMechanicalWorks])

  const openMechanicalExecution = useCallback((context?: TaskExecutionContext) => {
    if (!activeGarden) return

    if (context) {
      const bootstrapState = buildMechanicalExecutionBootstrapState(context, activeGarden.id)
      setExecutionInitialData(bootstrapState.initialData)
    } else {
      setExecutionInitialData({
        gardenId: activeGarden.id,
        completed: true,
      })
    }
    setActiveTab('records')
    setShowExecutionForm(true)
  }, [activeGarden])

  useEffect(() => {
    if (!activeGarden) return

    const context = parseTaskExecutionContext(searchParams, 'mechanical-work', 'Tilling')
    if (!context || consumedLaunchSignature === context.sourceTaskId) return

    setTaskExecutionContext(context)
    openMechanicalExecution(context)
    setConsumedLaunchSignature(context.sourceTaskId)
  }, [activeGarden, consumedLaunchSignature, openMechanicalExecution, searchParams])

  const handleCreateMechanicalExecution = async (log: MechanicalWorkLog) => {
    if (!activeGarden) return

    const contextNotes = buildTaskExecutionNotes(taskExecutionContext) || ''
    const deduplicatedNotes = [log.notes, contextNotes].filter((note, index, notes) => {
      return Boolean(note) && notes.indexOf(note) === index
    }) as string[]
    const mergedNotes = taskExecutionContext?.sourceTaskId
      ? appendSourceTaskReference(deduplicatedNotes.join(' | '), taskExecutionContext.sourceTaskId)
      : deduplicatedNotes.join(' | ') || undefined

    const createdWork = await storageProvider.createMechanicalWork({
      garden_id: activeGarden.id,
      bed_id: log.bedIds?.[0],
      bed_row_id: log.rowIds?.[0],
      zone_id: taskExecutionContext?.zoneId,
      work_type: log.workType,
      work_date: log.workDate,
      area_m2: log.areaCoveredSqm || 1,
      depth_cm: log.depthCm,
      equipment_type: log.equipmentType,
      equipment_attachment: log.equipmentAttachment,
      work_metadata: {
        category: 'General',
        description: deduplicatedNotes.join(' | ') || undefined,
      },
      weather_conditions: {
        temp: log.weatherConditions?.temperature,
        rain: typeof log.weatherConditions?.rainMm === 'number'
          ? log.weatherConditions.rainMm > 0
          : undefined,
      },
      operator_name: log.operatorName,
      notes: mergedNotes,
    })
    setMechanicalWorks((current) => [createdWork, ...current])

    await finalizeTaskExecutionPostAction({
      storageProvider,
      gardenId: activeGarden.id,
      sourceTaskId: taskExecutionContext?.sourceTaskId,
      operatorEvidence: buildMechanicalOperatorEvidence({ ...log, notes: mergedNotes }),
      measuredFeedback: buildMechanicalMeasuredFeedback(
        { ...log, gardenId: activeGarden.id, notes: mergedNotes },
        {
          sourceTaskId: taskExecutionContext?.sourceTaskId,
          zoneId: taskExecutionContext?.zoneId,
          rowId: taskExecutionContext?.rowId,
          plantName: taskExecutionContext?.plantName,
        }
      ),
      close: () => {
        setShowExecutionForm(false)
        setExecutionInitialData(undefined)
      },
    })
  }

  const stats = useMemo(() => calculateMechanicalWorkStats(mechanicalWorks), [mechanicalWorks])

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold text-gray-900">
            <Tractor className="text-green-500" size={28} />
            Lavorazioni Meccaniche
          </h1>
          <p className="mt-1 text-gray-600">Registra e analizza le lavorazioni realmente eseguite</p>
        </div>
        <button
          type="button"
          onClick={() => openMechanicalExecution()}
          disabled={!activeGarden}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus size={18} />
          Registra lavorazione
        </button>
      </div>

      {gardens.length > 1 && activeGarden && (
        <label className="mb-6 block max-w-sm text-sm font-medium text-gray-700">
          Orto
          <select
            value={activeGarden.id}
            onChange={(event) => {
              setActiveGarden(gardens.find((garden) => garden.id === event.target.value) || null)
            }}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
          >
            {gardens.map((garden) => (
              <option key={garden.id} value={garden.id}>{garden.name}</option>
            ))}
          </select>
        </label>
      )}

      {taskExecutionContext && (
        <TaskExecutionBanner
          context={taskExecutionContext}
          theme="mechanical"
          storageProvider={storageProvider}
          onResume={() => openMechanicalExecution(taskExecutionContext)}
          onDismiss={() => setTaskExecutionContext(null)}
        />
      )}

      {loadError && (
        <div role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {loadError}
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard icon={Tractor} label="Lavorazioni registrate" value={String(stats.totalOperations)} />
        <MetricCard icon={MapPin} label="Superficie lavorata" value={`${Math.round(stats.totalAreaSqm)} m²`} />
        <MetricCard icon={Wrench} label="Tipi attrezzatura osservati" value={String(stats.equipmentTypes)} />
      </div>

      <nav className="mb-6 flex border-b border-gray-200">
        {TABS.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium ${
                activeTab === tab.id
                  ? 'border-green-500 text-green-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          )
        })}
      </nav>

      {loading ? (
        <div className="rounded-lg border border-gray-200 bg-white p-10 text-center text-gray-600">
          Caricamento registro...
        </div>
      ) : activeTab === 'overview' ? (
        <Overview works={mechanicalWorks} onCreate={() => openMechanicalExecution()} />
      ) : activeTab === 'records' ? (
        <WorkRegister works={mechanicalWorks} onCreate={() => openMechanicalExecution()} />
      ) : (
        <MechanicalAnalytics works={mechanicalWorks} />
      )}

      {showExecutionForm && activeGarden && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Registra Lavorazione Meccanica</h2>
                <p className="text-sm text-gray-600">Il salvataggio aggiorna il registro persistente.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowExecutionForm(false)}
                aria-label="Chiudi registrazione lavorazione"
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <MechanicalWorkLogForm
                garden={activeGarden}
                initialData={executionInitialData || {
                  gardenId: activeGarden.id,
                  completed: true,
                }}
                sourceTaskId={taskExecutionContext?.sourceTaskId}
                onSubmit={handleCreateMechanicalExecution}
                onCancel={() => setShowExecutionForm(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Tractor
  label: string
  value: string
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
          <Icon className="text-green-600" size={20} />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-600">{label}</p>
        </div>
      </div>
    </div>
  )
}

function Overview({ works, onCreate }: { works: MechanicalWorkRecord[]; onCreate: () => void }) {
  const recentWorks = works.slice(0, 5)
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Ultime lavorazioni</h2>
      {recentWorks.length === 0 ? (
        <EmptyRegister onCreate={onCreate} />
      ) : (
        <WorkRows works={recentWorks} />
      )}
    </section>
  )
}

function WorkRegister({ works, onCreate }: { works: MechanicalWorkRecord[]; onCreate: () => void }) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Registro persistito</h2>
        <button
          type="button"
          onClick={onCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700"
        >
          <Plus size={16} />
          Nuova
        </button>
      </div>
      {works.length === 0 ? <EmptyRegister onCreate={onCreate} /> : <WorkRows works={works} />}
    </section>
  )
}

function EmptyRegister({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="py-10 text-center">
      <Tractor className="mx-auto mb-3 text-gray-400" size={42} />
      <p className="font-medium text-gray-900">Nessuna lavorazione registrata</p>
      <p className="mt-1 text-sm text-gray-600">Aggiungi soltanto operazioni realmente eseguite.</p>
      <button
        type="button"
        onClick={onCreate}
        className="mt-4 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
      >
        Registra prima lavorazione
      </button>
    </div>
  )
}

function WorkRows({ works }: { works: MechanicalWorkRecord[] }) {
  return (
    <div className="divide-y divide-gray-100">
      {works.map((work) => (
        <article key={work.id} className="grid gap-3 py-4 md:grid-cols-[1fr_auto]">
          <div>
            <h3 className="font-medium text-gray-900">{formatMechanicalWorkType(work.work_type)}</h3>
            <p className="mt-1 text-sm text-gray-600">
              {work.equipment_type || 'Attrezzatura non registrata'}
              {work.operator_name ? ` · ${work.operator_name}` : ''}
            </p>
            {work.notes && <p className="mt-2 text-sm text-gray-700">{work.notes}</p>}
          </div>
          <div className="text-left text-sm text-gray-600 md:text-right">
            <p className="flex items-center gap-1 md:justify-end">
              <Calendar size={14} />
              {new Date(work.work_date).toLocaleDateString('it-IT')}
            </p>
            <p className="mt-1">{Math.round(work.area_m2)} m²</p>
          </div>
        </article>
      ))}
    </div>
  )
}

function MechanicalAnalytics({ works }: { works: MechanicalWorkRecord[] }) {
  const stats = calculateMechanicalWorkStats(works)
  return (
    <section className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard icon={Tractor} label="Lavorazioni" value={String(stats.totalOperations)} />
        <MetricCard icon={MapPin} label="Superficie totale" value={`${Math.round(stats.totalAreaSqm)} m²`} />
        <MetricCard
          icon={Clock}
          label="Costo osservato nel mese"
          value={stats.monthlyObservedCost == null ? 'n/d' : `€${stats.monthlyObservedCost.toFixed(2)}`}
        />
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Lavorazioni per tipo</h2>
        {stats.operationsByType.length === 0 ? (
          <p className="text-sm text-gray-600">Dati insufficienti.</p>
        ) : (
          <div className="space-y-3">
            {stats.operationsByType.map((item) => (
              <div key={item.type} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                <span className="font-medium text-gray-900">{formatMechanicalWorkType(item.type)}</span>
                <span className="text-sm text-gray-700">{item.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default function MechanicalWorkPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <div className="text-center">
          <Tractor className="mx-auto mb-3 h-12 w-12 animate-pulse text-gray-400" />
          <p className="text-gray-600">Caricamento...</p>
        </div>
      </div>
    }>
      <MechanicalWorkContent />
    </Suspense>
  )
}
