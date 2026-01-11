'use client'

import React, { useState, useEffect } from 'react'
import { X, MapPin, Ruler, Info, Grid, Layers, TreeDeciduous, Sun, Trash2, Plus, Edit2 } from 'lucide-react'
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
  const [soilPh, setSoilPh] = useState(garden.soilPh?.toString() || '')

  // Structures state
  const [beds, setBeds] = useState<GardenBed[]>([])
  const [rows, setRows] = useState<GardenRow[]>([])
  const [fieldRows, setFieldRows] = useState<any[]>([]) // Filari campo aperto (field_rows)

  // Editable structure config
  const [pots, setPots] = useState<Array<{ count: number; diameter: number }>>(
    garden.structureConfig?.pots || []
  )
  const [containers, setContainers] = useState<Array<{ count: number; length: number; width: number; height: number }>>(
    garden.structureConfig?.containers || []
  )
  const [raisedBeds, setRaisedBeds] = useState<Array<{ count: number; length: number; width: number; height: number }>>(
    garden.structureConfig?.beds || []
  )
  const [tanks, setTanks] = useState<Array<{ count: number; length: number; width: number; height: number }>>(
    garden.structureConfig?.tanks || []
  )

  // Field row editing state
  const [editingFieldRow, setEditingFieldRow] = useState<any | null>(null)
  const [fieldRowForm, setFieldRowForm] = useState({
    name: '',
    rowNumber: 1,
    lengthMeters: 10,
    distanceFromPreviousRow: 100,
    cultivar: '',
    plantSpacing: 50, // cm - Distanza tra piante nel filare
    plantedDate: '', // Data semina/trapianto
    orientation: '' as '' | 'N-S' | 'E-W' | 'NE-SW' | 'NW-SE'
  })

  // Bulk creation state
  const [showBulkForm, setShowBulkForm] = useState(false)
  const [bulkFieldRowForm, setBulkFieldRowForm] = useState({
    count: 4,
    prefix: 'Filare',
    startNumber: 1,
    lengthMeters: 10,
    distanceFromPreviousRow: 100,
    cultivar: '',
    plantSpacing: 50,
    orientation: '' as '' | 'N-S' | 'E-W' | 'NE-SW' | 'NW-SE'
  })

  useEffect(() => {
    if (isOpen) {
      loadGardenStructures()
    }
  }, [isOpen, garden.id])

  const loadGardenStructures = async () => {
    try {
      // Carica aiuole/letti
      const gardenBeds = await storageProvider.getGardenBeds(garden.id)
      setBeds(gardenBeds || [])

      // Carica filari delle aiuole
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

      // Carica filari del campo aperto (field_rows)
      const openFieldRows = await storageProvider.getFieldRows(garden.id)
      setFieldRows(openFieldRows || [])
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
        } : undefined,
        soilPh: soilPh ? parseFloat(soilPh) : undefined,
        structureConfig: {
          ...garden.structureConfig,
          pots: pots.length > 0 ? pots : undefined,
          containers: containers.length > 0 ? containers : undefined,
          beds: raisedBeds.length > 0 ? raisedBeds : undefined,
          tanks: tanks.length > 0 ? tanks : undefined
        }
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

  const handleCreateGreenhouseBed = async () => {
    if (!garden.greenhouseConfig) return

    try {
      setLoading(true)

      const ghConfig = garden.greenhouseConfig

      // Calculate area from greenhouse dimensions
      const lengthCm = (ghConfig.length || 0) * 100
      const widthCm = (ghConfig.width || 0) * 100
      const areaSqMeters = (ghConfig.length || 0) * (ghConfig.width || 0)

      const newBed: Omit<GardenBed, 'id' | 'createdAt' | 'updatedAt'> = {
        gardenId: garden.id,
        name: `Serra ${ghConfig.structureType}`,
        bedType: 'Greenhouse',
        shape: 'Rectangle',
        lengthCm: lengthCm > 0 ? lengthCm : undefined,
        widthCm: widthCm > 0 ? widthCm : undefined,
        areaSqMeters: areaSqMeters > 0 ? areaSqMeters : undefined,
        structureType: 'Greenhouse',
        structureId: garden.id, // Link back to garden's greenhouse config
        isCovered: true,
        notes: `Letto serra creato automaticamente da configurazione ${ghConfig.structureType}`
      }

      await storageProvider.createGardenBed(newBed)
      alert('✅ Letto serra creato! Ora puoi aggiungere filari per tracciare le tue coltivazioni.')

      // Reload beds to show the new greenhouse bed
      await loadGardenStructures()
    } catch (error) {
      console.error('Error creating greenhouse bed:', error)
      alert('❌ Errore durante la creazione del letto serra')
    } finally {
      setLoading(false)
    }
  }

  const handleStartNewFieldRow = () => {
    setEditingFieldRow(null)
    setFieldRowForm({
      name: `Filare ${fieldRows.length + 1}`,
      rowNumber: fieldRows.length + 1,
      lengthMeters: 10,
      distanceFromPreviousRow: 100,
      cultivar: '',
      plantSpacing: 50,
      plantedDate: '',
      orientation: ''
    })
  }

  const handleEditFieldRow = (row: any) => {
    setEditingFieldRow(row)
    setFieldRowForm({
      name: row.name || '',
      rowNumber: row.row_number || row.rowNumber || 1,
      lengthMeters: row.length_meters || row.lengthMeters || 10,
      distanceFromPreviousRow: row.distance_from_previous_row || row.distanceFromPreviousRow || 100,
      cultivar: row.cultivar || '',
      plantSpacing: row.plant_spacing || row.plantSpacing || 50,
      plantedDate: row.planted_date || row.plantedDate || '',
      orientation: (row.orientation || '') as '' | 'N-S' | 'E-W' | 'NE-SW' | 'NW-SE'
    })
  }

  const handleSaveFieldRow = async () => {
    try {
      setLoading(true)

      const fieldRowData = {
        name: fieldRowForm.name,
        rowNumber: fieldRowForm.rowNumber,
        lengthMeters: fieldRowForm.lengthMeters,
        distanceFromPreviousRow: fieldRowForm.distanceFromPreviousRow || undefined,
        cultivar: fieldRowForm.cultivar || undefined,
        plantSpacing: fieldRowForm.plantSpacing || undefined,
        plantedDate: fieldRowForm.plantedDate || undefined,
        orientation: fieldRowForm.orientation || undefined
      }

      if (editingFieldRow) {
        // Update existing field row
        await storageProvider.updateFieldRow(editingFieldRow.id, fieldRowData)
        alert('✅ Filare aggiornato con successo')
      } else {
        // Create new field row
        await storageProvider.createFieldRow({
          gardenId: garden.id,
          ...fieldRowData,
          isActive: true
        })
        alert('✅ Filare creato con successo')
      }

      await loadGardenStructures()
      setEditingFieldRow(null)
    } catch (error) {
      console.error('Error saving field row:', error)
      alert('❌ Errore durante il salvataggio del filare')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteFieldRow = async (rowId: string, rowName: string) => {
    if (!confirm(`Sei sicuro di voler eliminare il filare "${rowName}"?`)) return

    try {
      setLoading(true)
      await storageProvider.deleteFieldRow(rowId)
      alert('✅ Filare eliminato con successo')
      await loadGardenStructures()
    } catch (error) {
      console.error('Error deleting field row:', error)
      alert('❌ Errore durante l\'eliminazione del filare')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelFieldRowEdit = () => {
    setEditingFieldRow(null)
    setFieldRowForm({
      name: '',
      rowNumber: 1,
      lengthMeters: 10,
      distanceFromPreviousRow: 100,
      cultivar: '',
      plantSpacing: 50,
      plantedDate: '',
      orientation: ''
    })
  }

  const handleBulkCreateFieldRows = async () => {
    try {
      setLoading(true)

      const rowsToCreate = []
      for (let i = 0; i < bulkFieldRowForm.count; i++) {
        const rowNumber = bulkFieldRowForm.startNumber + i
        rowsToCreate.push({
          gardenId: garden.id,
          name: `${bulkFieldRowForm.prefix} ${rowNumber}`,
          rowNumber: rowNumber,
          lengthMeters: bulkFieldRowForm.lengthMeters,
          distanceFromPreviousRow: bulkFieldRowForm.distanceFromPreviousRow,
          cultivar: bulkFieldRowForm.cultivar || undefined,
          plantSpacing: bulkFieldRowForm.plantSpacing,
          plantedDate: undefined,
          orientation: bulkFieldRowForm.orientation || undefined,
          isActive: true
        })
      }

      // Create all rows
      for (const rowData of rowsToCreate) {
        await storageProvider.createFieldRow(rowData)
      }

      alert(`✅ ${bulkFieldRowForm.count} filari creati con successo`)
      await loadGardenStructures()
      setShowBulkForm(false)
    } catch (error) {
      console.error('Error bulk creating field rows:', error)
      alert('❌ Errore durante la creazione multipla dei filari')
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
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">Modifica Orto</h2>
            <p className="text-sm text-gray-600 mt-1">{garden.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 px-6 pt-4 border-b border-gray-200 overflow-x-auto">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div className="flex items-center gap-3 mb-3">
                  <MapPin size={18} className="text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Coordinate GPS (opzionale)</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Latitudine</label>
                    <input
                      type="number"
                      value={latitude}
                      onChange={(e) => setLatitude(parseFloat(e.target.value))}
                      className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg text-sm"
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
                      className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg text-sm"
                      placeholder="12.4964"
                      step="0.0001"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <TreeDeciduous size={18} className="text-green-600" />
                  <h3 className="font-semibold text-gray-900">Terreno</h3>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    pH del Terreno (opzionale)
                  </label>
                  <input
                    type="number"
                    value={soilPh}
                    onChange={(e) => setSoilPh(e.target.value)}
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg text-sm"
                    placeholder="Es. 6.5"
                    step="0.1"
                    min="0"
                    max="14"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Scala pH: 0-14 (acido &lt; 7 &lt; basico). Ortaggi: 6.0-7.0 ideale
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Riepilogo</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Area: {formatArea(sizeSqMeters, sizeUnit)}</li>
                  {latitude && longitude && (
                    <li>• GPS: {latitude.toFixed(4)}, {longitude.toFixed(4)}</li>
                  )}
                  {soilPh && (
                    <li>• pH Terreno: {parseFloat(soilPh).toFixed(1)}</li>
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
              {/* Vasi */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">🪴 Vasi</h3>
                  <button
                    onClick={() => setPots([...pots, { count: 1, diameter: 30 }])}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    + Aggiungi
                  </button>
                </div>

                {pots.length > 0 ? (
                  <div className="space-y-2">
                    {pots.map((pot, index) => (
                      <div key={index} className="flex items-center gap-3 bg-white rounded-lg p-3">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Numero vasi</label>
                            <input
                              type="number"
                              value={pot.count}
                              onChange={(e) => {
                                const newPots = [...pots]
                                newPots[index].count = parseInt(e.target.value) || 1
                                setPots(newPots)
                              }}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              min="1"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Diametro (cm)</label>
                            <input
                              type="number"
                              value={pot.diameter}
                              onChange={(e) => {
                                const newPots = [...pots]
                                newPots[index].diameter = parseInt(e.target.value) || 30
                                setPots(newPots)
                              }}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              min="10"
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => setPots(pots.filter((_, i) => i !== index))}
                          className="p-3 text-red-600 hover:bg-red-50 rounded"
                          title="Elimina"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-2">Nessun vaso configurato</p>
                )}
              </div>

              {/* Contenitori */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">📦 Contenitori</h3>
                  <button
                    onClick={() => setContainers([...containers, { count: 1, length: 100, width: 50, height: 30 }])}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                  >
                    + Aggiungi
                  </button>
                </div>

                {containers.length > 0 ? (
                  <div className="space-y-2">
                    {containers.map((container, index) => (
                      <div key={index} className="flex items-center gap-3 bg-white rounded-lg p-3">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">N°</label>
                            <input
                              type="number"
                              value={container.count}
                              onChange={(e) => {
                                const newContainers = [...containers]
                                newContainers[index].count = parseInt(e.target.value) || 1
                                setContainers(newContainers)
                              }}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              min="1"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">L (cm)</label>
                            <input
                              type="number"
                              value={container.length}
                              onChange={(e) => {
                                const newContainers = [...containers]
                                newContainers[index].length = parseInt(e.target.value) || 100
                                setContainers(newContainers)
                              }}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              min="10"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">W (cm)</label>
                            <input
                              type="number"
                              value={container.width}
                              onChange={(e) => {
                                const newContainers = [...containers]
                                newContainers[index].width = parseInt(e.target.value) || 50
                                setContainers(newContainers)
                              }}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              min="10"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">H (cm)</label>
                            <input
                              type="number"
                              value={container.height}
                              onChange={(e) => {
                                const newContainers = [...containers]
                                newContainers[index].height = parseInt(e.target.value) || 30
                                setContainers(newContainers)
                              }}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              min="10"
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => setContainers(containers.filter((_, i) => i !== index))}
                          className="p-3 text-red-600 hover:bg-red-50 rounded"
                          title="Elimina"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-2">Nessun contenitore configurato</p>
                )}
              </div>

              {/* Letti Rialzati */}
              <div className="bg-yellow-50 border border-yellow-full max-w-sm rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">🛏️ Letti Rialzati</h3>
                  <button
                    onClick={() => setRaisedBeds([...raisedBeds, { count: 1, length: 200, width: 100, height: 40 }])}
                    className="px-3 py-1 bg-yellow-full max-w-sm text-white text-sm rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    + Aggiungi
                  </button>
                </div>

                {raisedBeds.length > 0 ? (
                  <div className="space-y-2">
                    {raisedBeds.map((bed, index) => (
                      <div key={index} className="flex items-center gap-3 bg-white rounded-lg p-3">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">N°</label>
                            <input
                              type="number"
                              value={bed.count}
                              onChange={(e) => {
                                const newBeds = [...raisedBeds]
                                newBeds[index].count = parseInt(e.target.value) || 1
                                setRaisedBeds(newBeds)
                              }}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              min="1"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">L (cm)</label>
                            <input
                              type="number"
                              value={bed.length}
                              onChange={(e) => {
                                const newBeds = [...raisedBeds]
                                newBeds[index].length = parseInt(e.target.value) || 200
                                setRaisedBeds(newBeds)
                              }}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              min="10"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">W (cm)</label>
                            <input
                              type="number"
                              value={bed.width}
                              onChange={(e) => {
                                const newBeds = [...raisedBeds]
                                newBeds[index].width = parseInt(e.target.value) || 100
                                setRaisedBeds(newBeds)
                              }}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              min="10"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">H (cm)</label>
                            <input
                              type="number"
                              value={bed.height}
                              onChange={(e) => {
                                const newBeds = [...raisedBeds]
                                newBeds[index].height = parseInt(e.target.value) || 40
                                setRaisedBeds(newBeds)
                              }}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              min="10"
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => setRaisedBeds(raisedBeds.filter((_, i) => i !== index))}
                          className="p-3 text-red-600 hover:bg-red-50 rounded"
                          title="Elimina"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-2">Nessun letto rialzato configurato</p>
                )}
              </div>

              {/* Vasche / Bancali Grandi */}
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {garden.gardenType === 'Aquaponic' ? '🐟 Vasche Acquaponiche' : '🏗️ Bancali Grandi'}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">
                      {garden.gardenType === 'Aquaponic'
                        ? 'Vasche per sistema acquaponico (pesci + piante)'
                        : 'Grandi contenitori tipo cassoni (es. 150×75×50cm)'}
                    </p>
                  </div>
                  <button
                    onClick={() => setTanks([...tanks, { count: 1, length: 150, width: 75, height: 50 }])}
                    className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    + Aggiungi
                  </button>
                </div>

                {tanks.length > 0 ? (
                  <div className="space-y-2">
                    {tanks.map((tank, index) => (
                      <div key={index} className="flex items-center gap-3 bg-white rounded-lg p-3">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">N°</label>
                            <input
                              type="number"
                              value={tank.count}
                              onChange={(e) => {
                                const newTanks = [...tanks]
                                newTanks[index].count = parseInt(e.target.value) || 1
                                setTanks(newTanks)
                              }}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              min="1"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">L (cm)</label>
                            <input
                              type="number"
                              value={tank.length}
                              onChange={(e) => {
                                const newTanks = [...tanks]
                                newTanks[index].length = parseInt(e.target.value) || 150
                                setTanks(newTanks)
                              }}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              min="10"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">W (cm)</label>
                            <input
                              type="number"
                              value={tank.width}
                              onChange={(e) => {
                                const newTanks = [...tanks]
                                newTanks[index].width = parseInt(e.target.value) || 75
                                setTanks(newTanks)
                              }}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              min="10"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">H (cm)</label>
                            <input
                              type="number"
                              value={tank.height}
                              onChange={(e) => {
                                const newTanks = [...tanks]
                                newTanks[index].height = parseInt(e.target.value) || 50
                                setTanks(newTanks)
                              }}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              min="10"
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => setTanks(tanks.filter((_, i) => i !== index))}
                          className="p-3 text-red-600 hover:bg-red-50 rounded"
                          title="Elimina"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-2">
                    {garden.gardenType === 'Aquaponic' ? 'Nessuna vasca acquaponica configurata' : 'Nessun bancale grande configurato'}
                  </p>
                )}
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
                          <div>
                            <h4 className="font-medium text-gray-900">{bed.name}</h4>
                            {bed.bedType === 'Greenhouse' && (
                              <span className="text-xs text-purple-600">🏠 Serra</span>
                            )}
                          </div>
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

              {/* Filari Campo Aperto */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">🌾 Filari Campo Aperto</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {fieldRows.length > 0 ? `Gestisci i ${fieldRows.length} filari del tuo campo` : 'Aggiungi filari al tuo campo'}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleStartNewFieldRow}
                      disabled={loading}
                      className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-3"
                    >
                      <Plus size={16} />
                      Nuovo
                    </button>
                    <button
                      onClick={() => setShowBulkForm(!showBulkForm)}
                      disabled={loading}
                      className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-3"
                    >
                      <Layers size={16} />
                      Crea Multipli
                    </button>
                  </div>
                </div>

                {/* Form di modifica/creazione */}
                {(editingFieldRow !== null || fieldRowForm.name) && (
                  <div className="bg-white rounded-lg p-4 mb-3 border-2 border-green-300">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      {editingFieldRow ? 'Modifica Filare' : 'Nuovo Filare'}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Nome</label>
                        <input
                          type="text"
                          value={fieldRowForm.name}
                          onChange={(e) => setFieldRowForm({ ...fieldRowForm, name: e.target.value })}
                          className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg text-sm"
                          placeholder="Es. Filare 1"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Numero</label>
                        <input
                          type="number"
                          min={1}
                          value={fieldRowForm.rowNumber}
                          onChange={(e) => setFieldRowForm({ ...fieldRowForm, rowNumber: parseInt(e.target.value) || 1 })}
                          className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Lunghezza (m)</label>
                        <input
                          type="number"
                          min={0}
                          step={0.1}
                          value={fieldRowForm.lengthMeters}
                          onChange={(e) => setFieldRowForm({ ...fieldRowForm, lengthMeters: parseFloat(e.target.value) || 0 })}
                          className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Distanza dal precedente (cm)</label>
                        <input
                          type="number"
                          min={0}
                          value={fieldRowForm.distanceFromPreviousRow}
                          onChange={(e) => setFieldRowForm({ ...fieldRowForm, distanceFromPreviousRow: parseInt(e.target.value) || 0 })}
                          className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg text-sm"
                          placeholder="Es. 100"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Coltura (opzionale)</label>
                        <input
                          type="text"
                          value={fieldRowForm.cultivar}
                          onChange={(e) => setFieldRowForm({ ...fieldRowForm, cultivar: e.target.value })}
                          className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg text-sm"
                          placeholder="Es. Pomodoro Datterino"
                        />
                      </div>

                      {/* Campi avanzati - Accordion espandibile */}
                      <div className="md:col-span-2 mt-3 border-t pt-3">
                        <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                              Spaziatura piante (cm)
                              <span className="text-gray-400 font-normal ml-1">- Auto-calc numero piante</span>
                            </label>
                            <input
                              type="number"
                              min={0}
                              value={fieldRowForm.plantSpacing}
                              onChange={(e) => setFieldRowForm({ ...fieldRowForm, plantSpacing: parseInt(e.target.value) || 0 })}
                              className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg text-sm"
                              placeholder="Es. 50"
                            />
                            {fieldRowForm.plantSpacing > 0 && fieldRowForm.lengthMeters > 0 && (
                              <p className="text-xs text-green-600 mt-1">
                                ≈ {Math.floor((fieldRowForm.lengthMeters * 100) / fieldRowForm.plantSpacing)} piante
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Data semina/trapianto</label>
                            <input
                              type="date"
                              value={fieldRowForm.plantedDate}
                              onChange={(e) => setFieldRowForm({ ...fieldRowForm, plantedDate: e.target.value })}
                              className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Orientamento filare</label>
                            <select
                              value={fieldRowForm.orientation}
                              onChange={(e) => setFieldRowForm({ ...fieldRowForm, orientation: e.target.value as any })}
                              className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg text-sm"
                            >
                              <option value="">Non specificato</option>
                              <option value="N-S">Nord-Sud (N-S)</option>
                              <option value="E-W">Est-Ovest (E-W)</option>
                              <option value="NE-SW">Nord-Est / Sud-Ovest</option>
                              <option value="NW-SE">Nord-Ovest / Sud-Est</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-4">
                      <button
                        onClick={handleSaveFieldRow}
                        disabled={loading || !fieldRowForm.name || fieldRowForm.lengthMeters <= 0}
                        className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        {loading ? 'Salvataggio...' : 'Salva'}
                      </button>
                      <button
                        onClick={handleCancelFieldRowEdit}
                        disabled={loading}
                        className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        Annulla
                      </button>
                    </div>
                  </div>
                )}

                {/* Form creazione multipla */}
                {showBulkForm && (
                  <div className="bg-blue-50 rounded-lg p-4 mb-3 border-2 border-blue-300">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-3">
                      <Layers size={18} />
                      Crea Filari Multipli
                    </h4>
                    <p className="text-xs text-gray-600 mb-3">
                      Crea più filari contemporaneamente con le stesse caratteristiche di base
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Numero filari da creare</label>
                        <input
                          type="number"
                          min={1}
                          max={50}
                          value={bulkFieldRowForm.count}
                          onChange={(e) => setBulkFieldRowForm({ ...bulkFieldRowForm, count: parseInt(e.target.value) || 1 })}
                          className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Prefisso nome</label>
                        <input
                          type="text"
                          value={bulkFieldRowForm.prefix}
                          onChange={(e) => setBulkFieldRowForm({ ...bulkFieldRowForm, prefix: e.target.value })}
                          className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg text-sm"
                          placeholder="Es. Filare"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Risultato: {bulkFieldRowForm.prefix} {bulkFieldRowForm.startNumber}, {bulkFieldRowForm.prefix} {bulkFieldRowForm.startNumber + 1}, ...
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Numero di partenza</label>
                        <input
                          type="number"
                          min={1}
                          value={bulkFieldRowForm.startNumber}
                          onChange={(e) => setBulkFieldRowForm({ ...bulkFieldRowForm, startNumber: parseInt(e.target.value) || 1 })}
                          className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Lunghezza (m)</label>
                        <input
                          type="number"
                          min={0}
                          step={0.1}
                          value={bulkFieldRowForm.lengthMeters}
                          onChange={(e) => setBulkFieldRowForm({ ...bulkFieldRowForm, lengthMeters: parseFloat(e.target.value) || 0 })}
                          className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Distanza tra filari (cm)</label>
                        <input
                          type="number"
                          min={0}
                          value={bulkFieldRowForm.distanceFromPreviousRow}
                          onChange={(e) => setBulkFieldRowForm({ ...bulkFieldRowForm, distanceFromPreviousRow: parseInt(e.target.value) || 0 })}
                          className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg text-sm"
                          placeholder="Es. 100"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Spaziatura piante (cm)</label>
                        <input
                          type="number"
                          min={0}
                          value={bulkFieldRowForm.plantSpacing}
                          onChange={(e) => setBulkFieldRowForm({ ...bulkFieldRowForm, plantSpacing: parseInt(e.target.value) || 0 })}
                          className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg text-sm"
                          placeholder="Es. 50"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Coltura (opzionale)</label>
                        <input
                          type="text"
                          value={bulkFieldRowForm.cultivar}
                          onChange={(e) => setBulkFieldRowForm({ ...bulkFieldRowForm, cultivar: e.target.value })}
                          className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg text-sm"
                          placeholder="Es. Pomodoro Datterino"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Orientamento</label>
                        <select
                          value={bulkFieldRowForm.orientation}
                          onChange={(e) => setBulkFieldRowForm({ ...bulkFieldRowForm, orientation: e.target.value as any })}
                          className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg text-sm"
                        >
                          <option value="">Non specificato</option>
                          <option value="N-S">Nord-Sud (N-S)</option>
                          <option value="E-W">Est-Ovest (E-W)</option>
                          <option value="NE-SW">Nord-Est / Sud-Ovest</option>
                          <option value="NW-SE">Nord-Ovest / Sud-Est</option>
                        </select>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                      <p className="text-sm font-semibold text-blue-900 mb-1">Anteprima</p>
                      <p className="text-xs text-blue-800">
                        Verranno creati <strong>{bulkFieldRowForm.count} filari</strong> da <strong>{bulkFieldRowForm.prefix} {bulkFieldRowForm.startNumber}</strong> a <strong>{bulkFieldRowForm.prefix} {bulkFieldRowForm.startNumber + bulkFieldRowForm.count - 1}</strong>,
                        ognuno lungo <strong>{bulkFieldRowForm.lengthMeters}m</strong> con distanza di <strong>{bulkFieldRowForm.distanceFromPreviousRow}cm</strong> dal precedente.
                      </p>
                    </div>
                    <div className="flex items-center gap-3 mt-4">
                      <button
                        onClick={handleBulkCreateFieldRows}
                        disabled={loading || bulkFieldRowForm.count <= 0 || bulkFieldRowForm.lengthMeters <= 0 || !bulkFieldRowForm.prefix}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-3"
                      >
                        {loading ? 'Creazione...' : `Crea ${bulkFieldRowForm.count} Filari`}
                      </button>
                      <button
                        onClick={() => setShowBulkForm(false)}
                        disabled={loading}
                        className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        Annulla
                      </button>
                    </div>
                  </div>
                )}

                {/* Lista filari */}
                {fieldRows.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {fieldRows.map((row, index) => (
                      <div key={row.id} className="bg-white rounded-lg p-3 flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-gray-900">{row.name}</span>
                            <span className="text-xs text-gray-500">#{row.row_number || index + 1}</span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-600 flex-wrap">
                            <span>📏 {row.length_meters}m</span>
                            {row.distance_from_previous_row && (
                              <span>↔️ {row.distance_from_previous_row}cm</span>
                            )}
                            {row.plant_spacing && (
                              <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                                🌱 {row.plant_spacing}cm → {row.plant_count || '?'} piante
                              </span>
                            )}
                            {row.cultivar && (
                              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                {row.cultivar}
                              </span>
                            )}
                            {row.orientation && (
                              <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                                🧭 {row.orientation}
                              </span>
                            )}
                            {row.planted_date && (
                              <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                📅 {new Date(row.planted_date).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleEditFieldRow(row)}
                            disabled={loading}
                            className="p-3 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
                            title="Modifica filare"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteFieldRow(row.id, row.name)}
                            disabled={loading}
                            className="p-3 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                            title="Elimina filare"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Nessun filare configurato. Clicca "Nuovo Filare" per iniziare.
                  </p>
                )}
              </div>

              {/* Greenhouse Bed Creation */}
              {garden.greenhouseConfig && !beds.some(b => b.bedType === 'Greenhouse') && (
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                  <h4 className="font-semibold text-purple-900 mb-2">🏠 Serra Configurata</h4>
                  <p className="text-sm text-purple-700 mb-3">
                    Hai una serra configurata ({garden.greenhouseConfig.structureType}). Crea un letto in serra per tracciare irrigazione, fertilizzazioni e produzioni scalari.
                  </p>
                  <button
                    onClick={handleCreateGreenhouseBed}
                    disabled={loading}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                  >
                    {loading ? 'Creazione...' : 'Crea Letto in Serra'}
                  </button>
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-full max-w-sm rounded-xl p-4">
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
                      <div className="flex items-center gap-3 mb-1">
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
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-900">🏔️ Altitudine</span>
                        <span className="text-sm text-gray-600">{garden.altitudeMeters}m s.l.m.</span>
                      </div>
                    </div>
                  )}

                  {garden.sunExposure && (
                    <div className="bg-white rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <Sun size={16} className="text-yellow-full max-w-sm" />
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
                      <div className="flex items-center gap-3">
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

              <div className="bg-yellow-50 border border-yellow-full max-w-sm rounded-xl p-4">
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
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-3"
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
