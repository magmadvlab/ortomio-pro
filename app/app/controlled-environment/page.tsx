'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Activity,
  ArrowLeft,
  Beaker,
  Droplets,
  Fish,
  Leaf,
  Plus,
  RefreshCw,
  Settings,
  Waves,
} from 'lucide-react'
import { useStorage } from '@/packages/core/hooks/useStorage'
import type { Garden } from '@/types'
import type {
  ControlledEnvironmentDashboardData,
  ControlledEnvironmentOperationType,
} from '@/types/controlledEnvironment'
import {
  getControlledEnvironmentType,
  isControlledEnvironmentGarden,
  loadControlledEnvironmentDashboard,
} from '@/services/controlledEnvironmentService'
import { executeBulkUnifiedOperation } from '@/services/unifiedOperationsService'
import { ReadingForm } from '@/components/hydroponic/ReadingForm'

type TabKey = 'overview' | 'structures' | 'solution' | 'readings' | 'plants'
type ReadingMode = 'hydroponic' | 'aquaponic' | 'greenhouse'

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: 'overview', label: 'Panoramica' },
  { key: 'structures', label: 'Strutture' },
  { key: 'solution', label: 'Loop & Soluzione' },
  { key: 'readings', label: 'Letture' },
  { key: 'plants', label: 'Piante & Siti' },
]

const BASE_OPERATION_OPTIONS: ControlledEnvironmentOperationType[] = [
  'solution_top_up',
  'solution_change',
  'ph_adjustment',
  'ec_adjustment',
  'flush',
]

const GENERIC_OPERATION_OPTIONS: ControlledEnvironmentOperationType[] = [
  'inspection',
  'transplant',
  'pruning',
  'treatment',
]

const AQUAPONIC_OPERATION_OPTIONS: ControlledEnvironmentOperationType[] = [
  'water_test',
  'fish_feed',
  'biofilter_maintenance',
]

function getReadingMode(garden: Garden | null): ReadingMode | null {
  if (!garden) {
    return null
  }
  if (garden.aquaponicConfig) {
    return 'aquaponic'
  }
  if (garden.hydroponicConfig || garden.aeroponicConfig) {
    return 'hydroponic'
  }
  if (garden.gardenType === 'Greenhouse' || garden.gardenType === 'Tunnel' || garden.gardenType === 'Indoor') {
    return 'greenhouse'
  }
  return null
}

function getOperationOptions(garden: Garden | null): ControlledEnvironmentOperationType[] {
  if (!garden) {
    return [...GENERIC_OPERATION_OPTIONS, ...BASE_OPERATION_OPTIONS]
  }
  if (garden.gardenType === 'Greenhouse' || garden.gardenType === 'Tunnel' || garden.gardenType === 'Indoor') {
    return GENERIC_OPERATION_OPTIONS
  }
  return garden.aquaponicConfig
    ? [...GENERIC_OPERATION_OPTIONS, ...BASE_OPERATION_OPTIONS, ...AQUAPONIC_OPERATION_OPTIONS]
    : [...GENERIC_OPERATION_OPTIONS, ...BASE_OPERATION_OPTIONS]
}

function formatOperationLabel(operationType: string): string {
  return operationType
    .split('_')
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(' ')
}

export default function ControlledEnvironmentPage() {
  const { storageProvider, isInitialized } = useStorage()
  const searchParams = useSearchParams()
  const router = useRouter()

  const [gardens, setGardens] = useState<Garden[]>([])
  const [selectedGardenId, setSelectedGardenId] = useState<string>('')
  const [dashboard, setDashboard] = useState<ControlledEnvironmentDashboardData | null>(null)
  const [activeTab, setActiveTab] = useState<TabKey>('overview')
  const [loading, setLoading] = useState(true)
  const [savingOperation, setSavingOperation] = useState(false)
  const [showReadingForm, setShowReadingForm] = useState(false)
  const [operationType, setOperationType] = useState<ControlledEnvironmentOperationType>('inspection')
  const [operationDate, setOperationDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [operationTime, setOperationTime] = useState(() => new Date().toTimeString().slice(0, 5))
  const [quantity, setQuantity] = useState('')
  const [unit, setUnit] = useState('L')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  const selectedGarden = useMemo(
    () => gardens.find((garden) => garden.id === selectedGardenId) || null,
    [gardens, selectedGardenId]
  )
  const readingMode = getReadingMode(selectedGarden)

  useEffect(() => {
    if (!isInitialized) {
      return
    }

    const loadGardens = async () => {
      try {
        setLoading(true)
        const allGardens = await storageProvider.getGardens()
        const controlledGardens = allGardens.filter(isControlledEnvironmentGarden)
        setGardens(controlledGardens)

        const requestedGardenId = searchParams.get('garden')
        const nextGarden =
          controlledGardens.find((garden) => garden.id === requestedGardenId)
          || controlledGardens[0]
          || null

        setSelectedGardenId(nextGarden?.id || '')
      } catch (loadError) {
        console.error('Error loading controlled-environment gardens:', loadError)
        setError('Errore nel caricamento degli impianti controlled environment')
      } finally {
        setLoading(false)
      }
    }

    loadGardens()
  }, [isInitialized, searchParams, storageProvider])

  useEffect(() => {
    if (!selectedGarden) {
      setDashboard(null)
      return
    }

    const loadDashboard = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await loadControlledEnvironmentDashboard(storageProvider, selectedGarden)
        setDashboard(data)
      } catch (loadError) {
        console.error('Error loading controlled-environment dashboard:', loadError)
        setError('Errore nel caricamento del modulo operativo')
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [selectedGarden, storageProvider])

  useEffect(() => {
    if (!selectedGardenId) {
      return
    }
    router.replace(`/app/controlled-environment?garden=${selectedGardenId}`)
  }, [router, selectedGardenId])

  useEffect(() => {
    const operationOptions = getOperationOptions(selectedGarden)
    if (!operationOptions.includes(operationType)) {
      setOperationType(operationOptions[0])
    }
  }, [operationType, selectedGarden])

  const refreshDashboard = async () => {
    if (!selectedGarden) {
      return
    }
    const data = await loadControlledEnvironmentDashboard(storageProvider, selectedGarden)
    setDashboard(data)
  }

  const handleSaveOperation = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!selectedGarden || !dashboard) {
      return
    }

    try {
      setSavingOperation(true)
      setError(null)

      const parsedQuantity = quantity ? parseFloat(quantity) : undefined

      await executeBulkUnifiedOperation(storageProvider, {
        level: 'garden',
        executionMode: 'recirculating',
        gardenId: selectedGarden.id,
        environmentProfileId: dashboard.environmentProfile.id,
        reservoirId: dashboard.reservoirs[0]?.id,
        loopId: dashboard.loops[0]?.id,
        growSiteIds: dashboard.growSites.slice(0, 8).map((site) => site.id),
        operationType,
        operationDate,
        operationTime,
        quantity: parsedQuantity,
        unit,
        notes,
        sourceType: 'manual',
        actorType: 'manual',
        waterAddedLiters: operationType === 'solution_top_up' ? parsedQuantity : undefined,
        fishFeedAmountGrams: operationType === 'fish_feed' ? parsedQuantity : undefined,
      })

      setQuantity('')
      setNotes('')
      await refreshDashboard()
      setActiveTab('overview')
    } catch (saveError) {
      console.error('Error saving recirculating operation:', saveError)
      setError('Errore nel salvataggio dell\'operazione recirculating')
    } finally {
      setSavingOperation(false)
    }
  }

  if (loading && gardens.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Caricamento modulo controlled environment...</p>
      </div>
    )
  }

  if (gardens.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-xl rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">Nessun impianto controlled environment</h1>
          <p className="mt-3 text-gray-600">
            Crea o aggiorna una serra, un impianto indoor, idroponico, acquaponico o aeroponico dal wizard giardini.
          </p>
          <Link
            href="/app/settings?section=gardens"
            className="mt-6 inline-flex rounded-xl bg-cyan-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-cyan-700"
          >
            Vai ai giardini
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <Link href="/app" className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100">
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Controlled Environment</h1>
                <p className="text-sm text-slate-600">
                  Modulo operativo per loop acqua/nutrienti, ambiente protetto e siti coltivati
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <select
                value={selectedGardenId}
                onChange={(event) => setSelectedGardenId(event.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800"
              >
                {gardens.map((garden) => (
                  <option key={garden.id} value={garden.id}>
                    {garden.name}
                  </option>
                ))}
              </select>

              <Link
                href="/app/settings?section=gardens"
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
              >
                <Settings size={16} className="mr-2" />
                Impostazioni
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {selectedGarden && dashboard && (
          <>
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-3xl bg-gradient-to-br from-cyan-600 to-sky-700 p-6 text-white shadow-sm">
                <p className="text-sm uppercase tracking-[0.18em] text-cyan-100">Ambiente</p>
                <p className="mt-3 text-3xl font-bold">{getControlledEnvironmentType(selectedGarden)}</p>
                <p className="mt-2 text-sm text-cyan-100">{dashboard.environmentProfile.systemMode}</p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">Reservoir</p>
                <p className="mt-3 text-3xl font-bold text-slate-900">{dashboard.reservoirs.length}</p>
                <p className="mt-2 text-sm text-slate-600">
                  {dashboard.reservoirs[0]?.capacityLiters ? `${dashboard.reservoirs[0].capacityLiters} L nominali` : 'Derivati da config attuale'}
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">Loop & Siti</p>
                <p className="mt-3 text-3xl font-bold text-slate-900">{dashboard.growSites.length}</p>
                <p className="mt-2 text-sm text-slate-600">{dashboard.loops.length} loop, siti strutturali riapribili</p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">Storico</p>
                <p className="mt-3 text-3xl font-bold text-slate-900">{dashboard.executions.length + dashboard.readings.length}</p>
                <p className="mt-2 text-sm text-slate-600">
                  {dashboard.executions.length} execution, {dashboard.readings.length} letture recenti
                </p>
              </div>
            </section>

            <section className="mt-6 flex flex-wrap gap-2">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    activeTab === tab.key
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </section>

            {error && (
              <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            {activeTab === 'overview' && (
              <section className="mt-6 grid gap-6 lg:grid-cols-[1.3fr,0.9fr]">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900">Panoramica operativa</h2>
                    <button
                      onClick={refreshDashboard}
                      className="inline-flex items-center rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                    >
                      <RefreshCw size={14} className="mr-2" />
                      Aggiorna
                    </button>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    {dashboard.structuralInsights.map((insight) => (
                      <div key={insight} className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                        {insight}
                      </div>
                    ))}
                  </div>

                  <div className="mt-6">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Execution recenti</h3>
                    <div className="mt-3 space-y-3">
                      {dashboard.executions.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                          Nessuna execution CE registrata ancora.
                        </div>
                      )}
                      {dashboard.executions.map((execution) => (
                        <div key={execution.id} className="rounded-2xl border border-slate-200 p-4">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <p className="font-semibold text-slate-900">{formatOperationLabel(execution.operationType)}</p>
                              <p className="text-sm text-slate-500">
                                {execution.operationDate} {execution.operationTime || ''}
                              </p>
                            </div>
                            <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-800">
                              {execution.executionMode}
                            </span>
                          </div>
                          {execution.notes && <p className="mt-2 text-sm text-slate-600">{execution.notes}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-bold text-slate-900">Telemetry</h2>
                  <div className="mt-5 space-y-3">
                    {dashboard.sensorSnapshot && Object.keys(dashboard.sensorSnapshot).length > 0 ? (
                      Object.entries(dashboard.sensorSnapshot).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                          <span className="text-sm font-medium text-slate-600">{key}</span>
                          <span className="text-sm font-semibold text-slate-900">{String(value)}</span>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                        Nessun sensore CE disponibile nelle ultime 24 ore.
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'structures' && (
              <section className="mt-6 grid gap-6 xl:grid-cols-3">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <Droplets className="text-cyan-600" />
                    <h2 className="text-lg font-bold text-slate-900">Reservoir</h2>
                  </div>
                  <div className="mt-4 space-y-3">
                    {dashboard.reservoirs.map((reservoir) => (
                      <div key={reservoir.id} className="rounded-2xl bg-slate-50 p-4">
                        <p className="font-semibold text-slate-900">{reservoir.name}</p>
                        <p className="text-sm text-slate-600">
                          {reservoir.capacityLiters ? `${reservoir.capacityLiters} L` : 'Capacita non definita'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <Waves className="text-sky-600" />
                    <h2 className="text-lg font-bold text-slate-900">Loop</h2>
                  </div>
                  <div className="mt-4 space-y-3">
                    {dashboard.loops.map((loop) => (
                      <div key={loop.id} className="rounded-2xl bg-slate-50 p-4">
                        <p className="font-semibold text-slate-900">{loop.loopType}</p>
                        <p className="text-sm text-slate-600">
                          {loop.cycleFrequency ? `${loop.cycleFrequency} cicli/giorno` : 'Frequenza da completare'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <Leaf className="text-emerald-600" />
                    <h2 className="text-lg font-bold text-slate-900">Grow Sites</h2>
                  </div>
                  <div className="mt-4 space-y-3">
                    {dashboard.growSites.slice(0, 12).map((site) => (
                      <div key={site.id} className="rounded-2xl bg-slate-50 p-4">
                        <p className="font-semibold text-slate-900">{site.siteName}</p>
                        <p className="text-sm text-slate-600">
                          {site.siteType}{site.capacityPlants ? ` - capienza ${site.capacityPlants}` : ''}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'solution' && (
              <section className="mt-6 grid gap-6 lg:grid-cols-[0.95fr,1.05fr]">
                <form onSubmit={handleSaveOperation} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <Beaker className="text-cyan-600" />
                    <h2 className="text-xl font-bold text-slate-900">Registra execution</h2>
                  </div>

                  <div className="mt-5 space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">Operation type</label>
                      <select
                        value={operationType}
                        onChange={(event) => setOperationType(event.target.value as ControlledEnvironmentOperationType)}
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
                      >
                        {getOperationOptions(selectedGarden).map((option) => (
                          <option key={option} value={option}>
                            {formatOperationLabel(option)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">Data</label>
                        <input
                          type="date"
                          value={operationDate}
                          onChange={(event) => setOperationDate(event.target.value)}
                          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">Ora</label>
                        <input
                          type="time"
                          value={operationTime}
                          onChange={(event) => setOperationTime(event.target.value)}
                          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-[1fr,120px]">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">Quantita</label>
                        <input
                          type="number"
                          value={quantity}
                          onChange={(event) => setQuantity(event.target.value)}
                          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
                          step="0.1"
                          min="0"
                          placeholder="Es. 15"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">Unita</label>
                        <input
                          type="text"
                          value={unit}
                          onChange={(event) => setUnit(event.target.value)}
                          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">Note</label>
                      <textarea
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                        rows={4}
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
                        placeholder="Eventuali target, deviazioni, cause o azioni correttive"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={savingOperation}
                      className="inline-flex items-center rounded-xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      <Plus size={16} className="mr-2" />
                      {savingOperation ? 'Salvataggio...' : 'Registra execution'}
                    </button>
                  </div>
                </form>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <Activity className="text-sky-600" />
                    <h2 className="text-xl font-bold text-slate-900">Stato soluzione e ambiente</h2>
                  </div>

                  <div className="mt-5 space-y-3">
                    {dashboard.readings.slice(0, 8).map((reading) => (
                      <div key={reading.id} className="rounded-2xl bg-slate-50 p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="font-semibold text-slate-900">{reading.title}</p>
                            <p className="text-sm text-slate-500">{new Date(reading.recordedAt).toLocaleString()}</p>
                          </div>
                          <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                            {reading.sourceKind}
                          </span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {Object.entries(reading.metrics).map(([key, value]) => (
                            <span key={key} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700">
                              {key}: {String(value)}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'readings' && (
              <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Letture e osservazioni</h2>
                    <p className="text-sm text-slate-600">
                      Dual-write attivo: le nuove letture vengono agganciate anche all'observation ledger CE.
                    </p>
                  </div>

                  {readingMode && (
                    <button
                      onClick={() => setShowReadingForm(true)}
                      className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
                    >
                      <Plus size={16} className="mr-2" />
                      Nuova lettura
                    </button>
                  )}
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {dashboard.readings.map((reading) => (
                    <div key={reading.id} className="rounded-2xl border border-slate-200 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-slate-900">{reading.title}</p>
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                          {reading.sourceKind}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-500">{new Date(reading.recordedAt).toLocaleString()}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {Object.entries(reading.metrics).map(([key, value]) => (
                          <span key={key} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                            {key}: {String(value)}
                          </span>
                        ))}
                      </div>
                      {reading.notes && <p className="mt-3 text-sm text-slate-600">{reading.notes}</p>}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {activeTab === 'plants' && (
              <section className="mt-6 grid gap-6 lg:grid-cols-[0.7fr,1.3fr]">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <Leaf className="text-emerald-600" />
                    <h2 className="text-xl font-bold text-slate-900">Piante collegate</h2>
                  </div>
                  <p className="mt-4 text-4xl font-bold text-slate-900">{dashboard.linkedPlantCount}</p>
                  <p className="mt-2 text-sm text-slate-600">
                    Conteggio piante disponibili nel backbone, da collegare progressivamente a grow site e batch.
                  </p>

                  {selectedGarden.aquaponicConfig && (
                    <div className="mt-6 rounded-2xl bg-sky-50 p-4 text-sm text-sky-900">
                      <div className="flex items-center gap-2 font-semibold">
                        <Fish size={16} />
                        Modulo pesci pronto per estensione
                      </div>
                      <p className="mt-2">
                        Biomassa corrente: {selectedGarden.aquaponicConfig.fishTank.fishBiomass || 'n/d'} kg
                      </p>
                    </div>
                  )}
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-bold text-slate-900">Siti coltivati</h2>
                  <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {dashboard.growSites.map((site) => (
                      <div key={site.id} className="rounded-2xl bg-slate-50 p-4">
                        <p className="font-semibold text-slate-900">{site.siteName}</p>
                        <p className="mt-1 text-sm text-slate-600">{site.siteType}</p>
                        <p className="mt-3 text-sm text-slate-500">
                          {site.capacityPlants ? `Capienza ${site.capacityPlants} piante` : 'Capienza da completare'}
                        </p>
                        {site.zoneLikeLabel && (
                          <p className="mt-1 text-sm text-slate-500">Posizione: {site.zoneLikeLabel}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {showReadingForm && selectedGarden && readingMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white">
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
              <h2 className="text-lg font-bold text-slate-900">Nuova lettura controlled environment</h2>
              <button onClick={() => setShowReadingForm(false)} className="text-sm font-medium text-slate-500 hover:text-slate-700">
                Chiudi
              </button>
            </div>
            <div className="p-5">
              <ReadingForm
                garden={selectedGarden}
                readingType={readingMode}
                onComplete={async () => {
                  setShowReadingForm(false)
                  await refreshDashboard()
                }}
                onCancel={() => setShowReadingForm(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
