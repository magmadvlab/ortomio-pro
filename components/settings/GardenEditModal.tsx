'use client'

import React, { useState, useEffect } from 'react'
import { X, MapPin, Ruler, Info, Grid, Layers, TreeDeciduous, Sun } from 'lucide-react'
import { Garden, GardenBed, GardenRow } from '@/types'
import { useStorage } from '@/packages/core/hooks/useStorage'

interface GardenEditModalProps {
  garden: Garden
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

type TabType = 'info' | 'structures' | 'beds' | 'climate'

export function GardenEditModal({ garden, isOpen, onClose, onSave }: GardenEditModalProps) {
  const { storageProvider } = useStorage()
  const [activeTab, setActiveTab] = useState<TabType>('info')
  const [loading, setLoading] = useState(false)

  // Form state - Basic Info
  const [name, setName] = useState(garden.name)
  const [sizeSqMeters, setSizeSqMeters] = useState(garden.sizeSqMeters)
  const [sizeUnit, setSizeUnit] = useState<'sqm' | 'are' | 'hectare'>(garden.sizeUnit || 'sqm')
  const [latitude, setLatitude] = useState(garden.coordinates?.latitude || 0)
  const [longitude, setLongitude] = useState(garden.coordinates?.longitude || 0)

  // Structures state
  const [beds, setBeds] = useState<GardenBed[]>([])
  const [rows, setRows] = useState<GardenRow[]>([])

  useEffect(() => {
    if (isOpen) {
      loadGardenStructures()
    }
  }, [isOpen, garden.id])

  const loadGardenStructures = async () => {
    try {
      const gardenBeds = await storageProvider.getGardenBeds(garden.id)
      setBeds(gardenBeds || [])

      if (gardenBeds && gardenBeds.length > 0) {
        const allRows: GardenRow[] = []
        for (const bed of gardenBeds) {
          const bedRows = await storageProvider.getGardenRows(bed.id)
          if (bedRows) {
            allRows.push(...bedRows)
          }
        }
        setRows(allRows)
      }
    } catch (error) {
      console.error('Error loading garden structures:', error)
    }
  }

  const handleSave = async () => {
    try {
      setLoading(true)

      const updates: Partial<Garden> = {
        name,
        sizeSqMeters,
        sizeUnit,
        coordinates: latitude && longitude ? {
          latitude,
          longitude
        } : undefined
      }

      await storageProvider.updateGarden(garden.id, updates)
      alert('✅ Orto aggiornato con successo')
      onSave()
      onClose()
    } catch (error) {
      console.error('Error updating garden:', error)
      alert('❌ Errore durante l\'aggiornamento dell\'orto')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const tabs = [
    { id: 'info' as TabType, label: 'Info Base', icon: Info },
    { id: 'structures' as TabType, label: 'Strutture', icon: Grid },
    { id: 'beds' as TabType, label: 'Aiuole & File', icon: Layers },
    { id: 'climate' as TabType, label: 'Clima', icon: Sun }
  ]

  const formatArea = (sqm: number, unit: string): string => {
    if (unit === 'hectare') return `${(sqm / 10000).toFixed(2)} ha`
    if (unit === 'are') return `${(sqm / 100).toFixed(1)} are`
    return `${sqm.toFixed(0)} m²`
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Modifica Orto</h2>
            <p className="text-sm text-gray-600 mt-1">{garden.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-6 pt-4 border-b border-gray-200 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors whitespace-nowrap
                  ${activeTab === tab.id
                    ? 'bg-green-50 text-green-700 border-b-2 border-green-600'
                    : 'text-gray-600 hover:bg-gray-50'
                  }
                `}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Nome Orto
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Es. Orto di Casa"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Dimensione
                  </label>
                  <input
                    type="number"
                    value={sizeSqMeters}
                    onChange={(e) => setSizeSqMeters(parseFloat(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="1000"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Unità
                  </label>
                  <select
                    value={sizeUnit}
                    onChange={(e) => setSizeUnit(e.target.value as 'sqm' | 'are' | 'hectare')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="sqm">m² (metri quadri)</option>
                    <option value="are">are</option>
                    <option value="hectare">ha (ettari)</option>
                  </select>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin size={18} className="text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Coordinate GPS (opzionale)</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Latitudine</label>
                    <input
                      type="number"
                      value={latitude}
                      onChange={(e) => setLatitude(parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="41.9028"
                      step="0.0001"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Longitudine</label>
                    <input
                      type="number"
                      value={longitude}
                      onChange={(e) => setLongitude(parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="12.4964"
                      step="0.0001"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Riepilogo</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Area: {formatArea(sizeSqMeters, sizeUnit)}</li>
                  {latitude && longitude && (
                    <li>• GPS: {latitude.toFixed(4)}, {longitude.toFixed(4)}</li>
                  )}
                  {garden.primaryCrop && (
                    <li>• Coltura principale: {garden.primaryCrop.label}</li>
                  )}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'structures' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Strutture Configurate</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Gestisci le strutture del tuo orto (serre, vasi, letti rialzati, ecc.)
                </p>

                <div className="space-y-2">
                  {garden.structureConfig?.pots && garden.structureConfig.pots.length > 0 && (
                    <div className="flex items-center justify-between bg-white rounded-lg p-3">
                      <span className="text-sm font-medium">🪴 Vasi</span>
                      <span className="text-sm text-gray-600">
                        {garden.structureConfig.pots.reduce((sum, p) => sum + p.count, 0)} vasi
                      </span>
                    </div>
                  )}
                  {garden.structureConfig?.containers && garden.structureConfig.containers.length > 0 && (
                    <div className="flex items-center justify-between bg-white rounded-lg p-3">
                      <span className="text-sm font-medium">📦 Contenitori</span>
                      <span className="text-sm text-gray-600">
                        {garden.structureConfig.containers.reduce((sum, c) => sum + c.count, 0)} contenitori
                      </span>
                    </div>
                  )}
                  {garden.structureConfig?.beds && garden.structureConfig.beds.length > 0 && (
                    <div className="flex items-center justify-between bg-white rounded-lg p-3">
                      <span className="text-sm font-medium">🛏️ Letti Rialzati</span>
                      <span className="text-sm text-gray-600">
                        {garden.structureConfig.beds.reduce((sum, b) => sum + b.count, 0)} letti
                      </span>
                    </div>
                  )}
                  {garden.structureConfig?.tanks && garden.structureConfig.tanks.length > 0 && (
                    <div className="flex items-center justify-between bg-white rounded-lg p-3">
                      <span className="text-sm font-medium">🚰 Vasche</span>
                      <span className="text-sm text-gray-600">
                        {garden.structureConfig.tanks.reduce((sum, t) => sum + t.count, 0)} vasche
                      </span>
                    </div>
                  )}
                  {beds.length > 0 && (
                    <div className="flex items-center justify-between bg-white rounded-lg p-3">
                      <span className="text-sm font-medium">🌱 Aiuole</span>
                      <span className="text-sm text-gray-600">{beds.length} aiuole</span>
                    </div>
                  )}
                  {rows.length > 0 && (
                    <div className="flex items-center justify-between bg-white rounded-lg p-3">
                      <span className="text-sm font-medium">📏 File</span>
                      <span className="text-sm text-gray-600">{rows.length} file</span>
                    </div>
                  )}
                </div>

                {!garden.structureConfig?.pots?.length &&
                 !garden.structureConfig?.containers?.length &&
                 !garden.structureConfig?.beds?.length &&
                 !garden.structureConfig?.tanks?.length &&
                 beds.length === 0 &&
                 rows.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Nessuna struttura configurata
                  </p>
                )}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <p className="text-sm text-gray-700">
                  💡 <strong>Prossimamente</strong>: Potrai gestire tutte le strutture (serre, filari, zone) direttamente da qui.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'beds' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Aiuole & File</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Visualizza e gestisci le aiuole e file del tuo orto
                </p>

                {beds.length > 0 ? (
                  <div className="space-y-3">
                    {beds.map(bed => (
                      <div key={bed.id} className="bg-white rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{bed.name}</h4>
                          {bed.lengthCm && bed.widthCm && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                              {(bed.lengthCm / 100).toFixed(1)}m × {(bed.widthCm / 100).toFixed(1)}m
                            </span>
                          )}
                          {bed.diameterCm && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                              ⌀ {(bed.diameterCm / 100).toFixed(1)}m
                            </span>
                          )}
                          {bed.areaSqMeters && !bed.lengthCm && !bed.diameterCm && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                              {bed.areaSqMeters.toFixed(1)} m²
                            </span>
                          )}
                        </div>
                        {rows.filter(r => r.bedId === bed.id).length > 0 && (
                          <div className="text-xs text-gray-600 mt-2">
                            📏 {rows.filter(r => r.bedId === bed.id).length} file
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Nessuna aiuola configurata
                  </p>
                )}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <p className="text-sm text-gray-700">
                  💡 <strong>Prossimamente</strong>: Potrai aggiungere, modificare ed eliminare aiuole e file direttamente da qui.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'climate' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Informazioni Climatiche</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Dati climatici e di esposizione solare del tuo orto
                </p>

                <div className="space-y-2">
                  {garden.coordinates && (
                    <div className="bg-white rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin size={16} className="text-blue-600" />
                        <span className="text-sm font-medium text-gray-900">Posizione GPS</span>
                      </div>
                      <p className="text-xs text-gray-600 ml-6">
                        {garden.coordinates.latitude.toFixed(4)}, {garden.coordinates.longitude.toFixed(4)}
                      </p>
                    </div>
                  )}

                  {garden.altitudeMeters && (
                    <div className="bg-white rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">🏔️ Altitudine</span>
                        <span className="text-sm text-gray-600">{garden.altitudeMeters}m s.l.m.</span>
                      </div>
                    </div>
                  )}

                  {garden.sunExposure && (
                    <div className="bg-white rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Sun size={16} className="text-yellow-600" />
                        <span className="text-sm font-medium text-gray-900">Esposizione Solare</span>
                        <span className="text-sm text-gray-600">
                          {garden.sunExposure === 'FullSun' && 'Pieno sole'}
                          {garden.sunExposure === 'PartSun' && 'Parziale'}
                          {garden.sunExposure === 'Shade' && 'Ombra'}
                        </span>
                      </div>
                    </div>
                  )}

                  {garden.dailySunHours && (
                    <div className="bg-white rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">☀️ Ore di sole</span>
                        <span className="text-sm text-gray-600">{garden.dailySunHours}h/giorno</span>
                      </div>
                    </div>
                  )}

                  {!garden.coordinates && !garden.altitudeMeters && !garden.sunExposure && !garden.dailySunHours && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Nessun dato climatico configurato
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <p className="text-sm text-gray-700">
                  💡 <strong>Prossimamente</strong>: Potrai modificare questi dati e configurare informazioni climatiche avanzate.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Annulla
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !name || sizeSqMeters <= 0}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Salvataggio...
              </>
            ) : (
              <>
                Salva Modifiche
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
