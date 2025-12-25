

'use client'

import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { IrrigationSystem, IrrigationZone, WateringLog } from '@/types/irrigation'
import { IrrigationMetrics } from '@/components/irrigation/IrrigationMetrics'
import { IrrigationSystemCard } from '@/components/irrigation/IrrigationSystemCard'
import { IrrigationZoneList } from '@/components/irrigation/IrrigationZoneList'
import { WateringHistory } from '@/components/irrigation/WateringHistory'
import { IrrigationZoneWizard } from '@/components/irrigation/IrrigationZoneWizard'
import { WateringLogForm } from '@/components/irrigation/WateringLogForm'
import { IrrigationSystemModal } from '@/components/irrigation/IrrigationSystemModal'
import { IrrigationZoneEditModal } from '@/components/irrigation/IrrigationZoneEditModal'
import { Droplets, Plus, FileText, Settings } from 'lucide-react'

function IrrigationContent() {
  const { storageProvider } = useStorage()
  const searchParams = useSearchParams()

  const [gardensLoaded, setGardensLoaded] = useState(false)
  const [activeGardenId, setActiveGardenId] = useState<string | null>(null)

  const [systems, setSystems] = useState<IrrigationSystem[]>([])
  const [zones, setZones] = useState<IrrigationZone[]>([])
  const [logs, setLogs] = useState<WateringLog[]>([])

  const [selectedSystemId, setSelectedSystemId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [showZoneWizard, setShowZoneWizard] = useState(false)
  const [showLogForm, setShowLogForm] = useState(false)
  const [selectedZoneForLog, setSelectedZoneForLog] = useState<IrrigationZone | null>(null)

  // Nuovi stati per modal
  const [showSystemModal, setShowSystemModal] = useState(false)
  const [editingSystem, setEditingSystem] = useState<IrrigationSystem | null>(null)
  const [showZoneEditModal, setShowZoneEditModal] = useState(false)
  const [editingZone, setEditingZone] = useState<IrrigationZone | null>(null)

  const didAutoCreateSystemRef = useRef(false)
  const didAutoOpenWizardRef = useRef(false)

  const requestedGardenId = searchParams.get('gardenId')
  const requestedWizard = searchParams.get('wizard')

  useEffect(() => {
    const init = async () => {
      try {
        const gardens = await storageProvider.getGardens()
        if (gardens.length > 0) {
          const nextGardenId = requestedGardenId || gardens[0].id
          setActiveGardenId(nextGardenId)
        }
      } finally {
        setGardensLoaded(true)
      }
    }
    init()
  }, [storageProvider, requestedGardenId])

  const loadIrrigationData = async (gardenId: string) => {
    setLoading(true)
    try {
      const systemsData = await storageProvider.getIrrigationSystems(gardenId)
      setSystems(systemsData)

      const draftSystemId =
        requestedWizard === 'design'
          ? (systemsData.find((s) => (s.name || '').toLowerCase().includes('bozza'))?.id ?? null)
          : null

      const defaultSystemId = draftSystemId || selectedSystemId || systemsData[0]?.id || null
      setSelectedSystemId(defaultSystemId)

      if (!defaultSystemId) {
        setZones([])
        setLogs([])

        // Design flow: if requested via query param and no system exists, create a default system then open the zone wizard
        if (requestedWizard === 'design' && !didAutoCreateSystemRef.current) {
          didAutoCreateSystemRef.current = true
          const createdSystem = await storageProvider.createIrrigationSystem({
            gardenId,
            name: 'Impianto Irrigazione',
            type: 'Drip',
            waterSource: 'Municipal',
            pressureBar: 2.0,
            hasTimer: true,
            hasValve: true,
            notes: 'Creato automaticamente dal wizard di progettazione'
          })

          setSystems([createdSystem])
          setSelectedSystemId(createdSystem.id)
          setShowZoneWizard(true)
        }
        return
      }

      const zonesData = await storageProvider.getIrrigationZones(defaultSystemId)
      setZones(zonesData)

      // Design flow: when arriving from Director CTA, auto-open wizard on the selected (draft) system.
      if (requestedWizard === 'design' && !didAutoOpenWizardRef.current) {
        didAutoOpenWizardRef.current = true
        setShowZoneWizard(true)
      }

      // Carica log per tutte le zone del sistema
      const logsData = (
        await Promise.all(
          zonesData.map((z) => storageProvider.getWateringLogs(z.id))
        )
      ).flat()

      setLogs(logsData)
    } catch (error) {
      console.error('Error loading irrigation data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!activeGardenId) return
    loadIrrigationData(activeGardenId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeGardenId])

  const selectedSystem = useMemo(() => {
    if (!selectedSystemId) return null
    return systems.find((s) => s.id === selectedSystemId) || null
  }, [selectedSystemId, systems])

  const selectedSystemZones = useMemo(() => {
    if (!selectedSystem) return []
    return zones.filter((z) => z.systemId === selectedSystem.id)
  }, [zones, selectedSystem])

  const selectedSystemLogs = useMemo(() => {
    const zoneIds = new Set(selectedSystemZones.map((z) => z.id))
    return logs.filter((l) => zoneIds.has(l.zoneId))
  }, [logs, selectedSystemZones])

  // Calcola statistiche per il banner
  const bannerStats = useMemo(() => {
    const today = new Date().toDateString()
    const logsToday = selectedSystemLogs.filter(log => {
      const logDate = new Date(log.wateredAt || log.date).toDateString()
      return logDate === today
    })
    const litersToday = logsToday.reduce((sum, log) => sum + (log.litersApplied || 0), 0)

    return {
      logsToday: logsToday.length,
      litersToday: Math.round(litersToday)
    }
  }, [selectedSystemLogs])

  const handleCreateZone = async (zone: IrrigationZone) => {
    if (!activeGardenId || !selectedSystem) return

    const created = await storageProvider.createIrrigationZone({
      systemId: selectedSystem.id,
      gardenId: activeGardenId,
      name: zone.name,
      areaSqm: zone.areaSqm,
      method: zone.method,
      flowRateLph: zone.flowRateLph,
      plantTypes: zone.plantTypes,
      isAutomated: zone.isAutomated,
      schedule: zone.schedule,
      lastWateredAt: zone.lastWateredAt,
      valveId: zone.valveId,
      bedIds: zone.bedIds || [],
      plantTaskIds: zone.plantTaskIds || [],
      notes: zone.notes,
      calculatedFromComponents: zone.calculatedFromComponents
    })

    setZones((prev) => [created, ...prev])
    setShowZoneWizard(false)
  }

  const handleLogWatering = async (log: Omit<WateringLog, 'id' | 'createdAt'>) => {
    try {
      const created = await storageProvider.logWatering({
        zoneId: log.zoneId,
        gardenId: activeGardenId || undefined,
        wateredAt: log.wateredAt || new Date().toISOString(),
        date: log.date,
        durationMinutes: log.durationMinutes,
        litersApplied: log.litersApplied,
        method: log.method,
        weatherCondition: log.weatherCondition,
        soilMoistureBefore: log.soilMoistureBefore,
        soilMoistureAfter: log.soilMoistureAfter,
        airTemperatureC: log.airTemperatureC,
        notes: log.notes,
        valveId: log.valveId,
        completed: log.completed
      })

      setLogs((prev) => [created, ...prev])

      // Aggiorna lastWateredAt sulla zona in memoria + su storage
      const nowIso = created.wateredAt || new Date().toISOString()
      const newDate = nowIso.split('T')[0]
      setZones((prev) => prev.map((z) => (z.id === created.zoneId ? { ...z, lastWateredAt: nowIso } : z)))
      await storageProvider.updateIrrigationZone(created.zoneId, { lastWateredAt: nowIso })

      setShowLogForm(false)
      setSelectedZoneForLog(null)

      // Se possibile, aggiorna anche la tabella watering_logs (già fatto) e lascia al trigger DB il sync su last_watered_at
      // Qui aggiorniamo lastWateredAt (campo TS) per UI immediata.

      // Nota: non ricarichiamo tutto per evitare UI jump.
      void newDate
    } catch (error) {
      console.error('Error logging watering:', error)
    }
  }

  // Handler nuovi modal
  const handleCreateSystem = async (systemData: Omit<IrrigationSystem, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!activeGardenId) return

    const created = await storageProvider.createIrrigationSystem(systemData)
    setSystems((prev) => [created, ...prev])
    setSelectedSystemId(created.id)
    setShowSystemModal(false)
    setEditingSystem(null)
  }

  const handleUpdateSystem = async (systemData: Omit<IrrigationSystem, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingSystem) return

    await storageProvider.updateIrrigationSystem(editingSystem.id, systemData)
    setSystems((prev) => prev.map(s => s.id === editingSystem.id ? { ...s, ...systemData } : s))
    setShowSystemModal(false)
    setEditingSystem(null)
  }

  const handleUpdateZone = async (zoneId: string, updates: Partial<IrrigationZone>) => {
    await storageProvider.updateIrrigationZone(zoneId, updates)
    setZones((prev) => prev.map(z => z.id === zoneId ? { ...z, ...updates } : z))
    setShowZoneEditModal(false)
    setEditingZone(null)
  }

  if (!gardensLoaded || loading) {
    return (
      <div className="p-6">
        <div className="text-gray-600">Caricamento...</div>
      </div>
    )
  }

  if (!activeGardenId) {
    return (
      <div className="p-6">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">💧 Irrigazione</h1>
          <p className="text-gray-600">Crea prima un giardino per configurare l'irrigazione.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 relative">
      {/* Modern Header - allineato ai mockup HTML */}
      <div className="border-b bg-white -mx-6 -mt-6 px-6 py-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Droplets size={32} className="text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Irrigazione</h1>
              <p className="text-sm text-gray-600">Gestione sistemi e zone irrigue</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setShowSystemModal(true)}
              variant="outline"
              size="sm"
            >
              <Settings size={16} className="mr-2" />
              Nuovo Sistema
            </Button>
            <Button
              onClick={() => {
                setSelectedZoneForLog(null)
                setShowLogForm(true)
              }}
              variant="outline"
              size="sm"
              disabled={!selectedSystem}
            >
              <FileText size={16} className="mr-2" />
              Registra
            </Button>
            <Button
              onClick={() => setShowZoneWizard(true)}
              variant="primary"
              size="sm"
              disabled={!selectedSystem}
            >
              <Plus size={16} className="mr-2" />
              Nuova Zona
            </Button>
          </div>
        </div>
      </div>

      {/* Status Banner - stile Smart Hub */}
      {selectedSystem && (
        <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl p-6 text-white flex items-center gap-6">
          <Droplets size={48} />
          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-1">Sistema Irrigazione Attivo</h2>
            <p className="text-sm opacity-90">
              {selectedSystemZones.length} zone configurate • {selectedSystem.name}
            </p>
          </div>
          <div className="flex gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold">{bannerStats.logsToday}</div>
              <div className="text-xs opacity-90">Irrigazioni Oggi</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{bannerStats.litersToday}L</div>
              <div className="text-xs opacity-90">Litri Usati</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">24/7</div>
              <div className="text-xs opacity-90">Monitoraggio</div>
            </div>
          </div>
        </div>
      )}

      <IrrigationMetrics systems={systems} zones={selectedSystemZones} logs={selectedSystemLogs} />

      {systems.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="mx-auto w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
            <Droplets size={48} className="text-blue-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Nessun Sistema Irrigazione</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Configura il tuo primo impianto irriguo per gestire zone, programmare irrigazioni e monitorare i consumi.
          </p>
          <Button
            onClick={() => setShowSystemModal(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus size={20} className="mr-2" />
            Crea Primo Sistema
          </Button>
        </Card>
      ) : (
        <>
          {/* Modern Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {systems.map((system) => {
                const isActive = selectedSystemId === system.id
                const systemZones = zones.filter(z => z.systemId === system.id)

                return (
                  <button
                    key={system.id}
                    onClick={async () => {
                      setSelectedSystemId(system.id)
                      const zonesData = await storageProvider.getIrrigationZones(system.id)
                      setZones(zonesData)
                      const logsData = (await Promise.all(zonesData.map((z) => storageProvider.getWateringLogs(z.id)))).flat()
                      setLogs(logsData)
                    }}
                    className={`
                      group inline-flex items-center border-b-2 py-4 px-1 text-sm font-medium transition-colors
                      ${isActive
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }
                    `}
                  >
                    <Droplets
                      size={18}
                      className={`mr-2 ${isActive ? 'text-blue-600' : 'text-gray-400'}`}
                    />
                    <span>{system.name}</span>
                    <span className={`
                      ml-3 hidden rounded-full py-0.5 px-2.5 text-xs font-medium md:inline-block
                      ${isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-900'}
                    `}>
                      {systemZones.length}
                    </span>
                  </button>
                )
              })}
            </nav>
          </div>

          {selectedSystem && (
            <>
              <IrrigationSystemCard
                system={selectedSystem}
                onEdit={() => {
                  setEditingSystem(selectedSystem)
                  setShowSystemModal(true)
                }}
                onDelete={async () => {
                  if (!confirm(`Eliminare il sistema "${selectedSystem.name}"?`)) return
                  await storageProvider.deleteIrrigationSystem(selectedSystem.id)
                  setSystems((prev) => prev.filter((s) => s.id !== selectedSystem.id))
                  setSelectedSystemId(null)
                  setZones([])
                  setLogs([])
                }}
              />

              <IrrigationZoneList
                zones={selectedSystemZones}
                onEditZone={(zone) => {
                  setEditingZone(zone)
                  setShowZoneEditModal(true)
                }}
                onDeleteZone={async (zone) => {
                  if (!confirm(`Eliminare la zona "${zone.name}"?`)) return
                  await storageProvider.deleteIrrigationZone(zone.id)
                  setZones((prev) => prev.filter((z) => z.id !== zone.id))
                  setLogs((prev) => prev.filter((l) => l.zoneId !== zone.id))
                }}
                onWaterZone={(zone) => {
                  setSelectedZoneForLog(zone)
                  setShowLogForm(true)
                }}
              />

              <WateringHistory logs={selectedSystemLogs} />
            </>
          )}
        </>
      )}

      {showZoneWizard && selectedSystem && (
        <IrrigationZoneWizard
          garden={{ id: activeGardenId } as any}
          beds={[]}
          systemId={selectedSystem.id}
          onComplete={handleCreateZone}
          onCancel={() => setShowZoneWizard(false)}
        />
      )}

      {showLogForm && (
        selectedZoneForLog ? (
          <WateringLogForm
            zones={selectedSystemZones}
            preselectedZone={selectedZoneForLog}
            onSubmit={handleLogWatering}
            onCancel={() => {
              setShowLogForm(false)
              setSelectedZoneForLog(null)
            }}
          />
        ) : (
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Seleziona una zona</h3>
                <p className="text-sm text-gray-600">Scegli una zona per registrare l'irrigazione.</p>
              </div>
              <Button variant="outline" onClick={() => setShowLogForm(false)}>Chiudi</Button>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {selectedSystemZones.map((z) => (
                <button
                  key={z.id}
                  onClick={() => {
                    setSelectedZoneForLog(z)
                  }}
                  className="text-left p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="font-semibold text-gray-900">{z.name}</div>
                  <div className="text-sm text-gray-600">{z.flowRateLph} L/h</div>
                </button>
              ))}
            </div>
          </Card>
        )
      )}

      {/* System Modal */}
      {showSystemModal && activeGardenId && (
        <IrrigationSystemModal
          system={editingSystem}
          gardenId={activeGardenId}
          onSubmit={editingSystem ? handleUpdateSystem : handleCreateSystem}
          onCancel={() => {
            setShowSystemModal(false)
            setEditingSystem(null)
          }}
        />
      )}

      {/* Zone Edit Modal */}
      {showZoneEditModal && editingZone && (
        <IrrigationZoneEditModal
          zone={editingZone}
          onSubmit={handleUpdateZone}
          onCancel={() => {
            setShowZoneEditModal(false)
            setEditingZone(null)
          }}
        />
      )}

      {/* FAB Button - stile Smart Hub */}
      {selectedSystem && (
        <button
          onClick={() => setShowZoneWizard(true)}
          className="fixed bottom-8 right-8 w-16 h-16 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-50"
          title="Aggiungi Zona"
        >
          <Plus size={28} />
        </button>
      )}
    </div>
  )
}

export default function IrrigationPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Caricamento...</div>}>
      <IrrigationContent />
    </Suspense>
  )
}
