'use client'

import React, { useState, useEffect } from 'react'
import { 
  MapPin, 
  Plus, 
  Edit3, 
  Trash2, 
  Settings, 
  Droplets,
  AlertCircle,
  CheckCircle,
  X,
  Save,
  Eye,
  Activity
} from 'lucide-react'
import { Garden } from '@/types'
import { IrrigationZone, IrrigationSystem } from '@/types/irrigation'
import { advancedIrrigationService } from '@/services/advancedIrrigationService'

interface IrrigationZoneManagerProps {
  garden: Garden
  onZoneSelect?: (zone: IrrigationZone) => void
  onSystemConfig?: (zoneId: string) => void
}

interface ZoneFormData {
  name: string
  description: string
  areaSqm: number
  soilType: 'clay' | 'loam' | 'sand' | 'mixed'
  slopePercentage: number
  sunExposure: 'full' | 'partial' | 'shade'
  drainageQuality: 'excellent' | 'good' | 'fair' | 'poor'
  waterRetention: 'high' | 'medium' | 'low'
  phLevel?: number
  organicMatterPercentage?: number
}

const initialFormData: ZoneFormData = {
  name: '',
  description: '',
  areaSqm: 0,
  soilType: 'loam',
  slopePercentage: 0,
  sunExposure: 'full',
  drainageQuality: 'good',
  waterRetention: 'medium',
  phLevel: undefined,
  organicMatterPercentage: undefined
}

export default function IrrigationZoneManager({
  garden,
  onZoneSelect,
  onSystemConfig
}: IrrigationZoneManagerProps) {
  const [zones, setZones] = useState<IrrigationZone[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingZone, setEditingZone] = useState<IrrigationZone | null>(null)
  const [formData, setFormData] = useState<ZoneFormData>(initialFormData)
  const [saving, setSaving] = useState(false)
  const [selectedZone, setSelectedZone] = useState<IrrigationZone | null>(null)

  useEffect(() => {
    loadZones()
  }, [garden.id])

  const loadZones = async () => {
    try {
      setLoading(true)
      setError(null)
      const zonesData = await advancedIrrigationService.getIrrigationZones(garden.id)
      setZones(zonesData)
    } catch (err) {
      console.error('Error loading zones:', err)
      setError('Errore nel caricamento delle zone')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateZone = () => {
    setEditingZone(null)
    setFormData(initialFormData)
    setShowForm(true)
  }

  const handleEditZone = (zone: IrrigationZone) => {
    setEditingZone(zone)
    setFormData({
      name: zone.name,
      description: zone.description || '',
      areaSqm: zone.areaSqm,
      soilType: zone.soilType,
      slopePercentage: zone.slopePercentage,
      sunExposure: zone.sunExposure,
      drainageQuality: zone.drainageQuality,
      waterRetention: zone.waterRetention,
      phLevel: zone.phLevel,
      organicMatterPercentage: zone.organicMatterPercentage
    })
    setShowForm(true)
  }

  const handleDeleteZone = async (zone: IrrigationZone) => {
    if (!confirm(`Sei sicuro di voler eliminare la zona "${zone.name}"?`)) {
      return
    }

    try {
      await advancedIrrigationService.deleteIrrigationZone(zone.id)
      await loadZones()
    } catch (err) {
      console.error('Error deleting zone:', err)
      setError('Errore nell\'eliminazione della zona')
    }
  }

  const handleSaveZone = async () => {
    if (!formData.name.trim()) {
      setError('Il nome della zona è obbligatorio')
      return
    }

    if (formData.areaSqm <= 0) {
      setError('L\'area deve essere maggiore di 0')
      return
    }

    try {
      setSaving(true)
      setError(null)

      const zoneData = {
        ...formData,
        gardenId: garden.id,
        isActive: true
      }

      if (editingZone) {
        await advancedIrrigationService.updateIrrigationZone(editingZone.id, zoneData)
      } else {
        await advancedIrrigationService.createIrrigationZone(zoneData)
      }

      await loadZones()
      setShowForm(false)
      setEditingZone(null)
      setFormData(initialFormData)
    } catch (err) {
      console.error('Error saving zone:', err)
      setError('Errore nel salvataggio della zona')
    } finally {
      setSaving(false)
    }
  }

  const handleZoneClick = (zone: IrrigationZone) => {
    setSelectedZone(zone)
    onZoneSelect?.(zone)
  }

  const getSoilTypeLabel = (type: string) => {
    const labels = {
      clay: 'Argilloso',
      loam: 'Franco',
      sand: 'Sabbioso',
      mixed: 'Misto'
    }
    return labels[type as keyof typeof labels] || type
  }

  const getSunExposureLabel = (exposure: string) => {
    const labels = {
      full: 'Pieno Sole',
      partial: 'Parziale',
      shade: 'Ombra'
    }
    return labels[exposure as keyof typeof labels] || exposure
  }

  const getDrainageLabel = (drainage: string) => {
    const labels = {
      excellent: 'Eccellente',
      good: 'Buono',
      fair: 'Discreto',
      poor: 'Scarso'
    }
    return labels[drainage as keyof typeof labels] || drainage
  }

  const getWaterRetentionLabel = (retention: string) => {
    const labels = {
      high: 'Alta',
      medium: 'Media',
      low: 'Bassa'
    }
    return labels[retention as keyof typeof labels] || retention
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Caricamento zone...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <MapPin className="text-blue-500" size={28} />
            Gestione Zone Irrigazione
          </h2>
          <p className="text-gray-600 mt-1">Configura e gestisci le zone di irrigazione - {garden.name}</p>
        </div>
        <button
          onClick={handleCreateZone}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Nuova Zona
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-800">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Zones Grid */}
      {zones.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {zones.map((zone) => (
            <div
              key={zone.id}
              className={`bg-white rounded-xl shadow-sm border-2 transition-all cursor-pointer ${
                selectedZone?.id === zone.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
              }`}
              onClick={() => handleZoneClick(zone)}
            >
              <div className="p-6">
                {/* Zone Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{zone.name}</h3>
                      <p className="text-sm text-gray-600">{zone.areaSqm} m²</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditZone(zone)
                      }}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Modifica Zona"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteZone(zone)
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Elimina Zona"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Zone Details */}
                <div className="space-y-3 mb-4">
                  {zone.description && (
                    <p className="text-sm text-gray-600">{zone.description}</p>
                  )}
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Terreno:</span>
                      <p className="font-medium">{getSoilTypeLabel(zone.soilType)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Esposizione:</span>
                      <p className="font-medium">{getSunExposureLabel(zone.sunExposure)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Drenaggio:</span>
                      <p className="font-medium">{getDrainageLabel(zone.drainageQuality)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Ritenzione:</span>
                      <p className="font-medium">{getWaterRetentionLabel(zone.waterRetention)}</p>
                    </div>
                  </div>

                  {zone.slopePercentage > 0 && (
                    <div className="text-sm">
                      <span className="text-gray-500">Pendenza:</span>
                      <span className="font-medium ml-1">{zone.slopePercentage}%</span>
                    </div>
                  )}

                  {zone.phLevel && (
                    <div className="text-sm">
                      <span className="text-gray-500">pH:</span>
                      <span className="font-medium ml-1">{zone.phLevel}</span>
                    </div>
                  )}
                </div>

                {/* Systems Count */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Settings size={14} />
                    <span>{zone.systems?.length || 0} sistemi configurati</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onSystemConfig?.(zone.id)
                    }}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    <Settings size={14} />
                    Sistemi
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Nessuna Zona Configurata</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Crea la tua prima zona di irrigazione per iniziare a gestire l'irrigazione del tuo giardino.
          </p>
          <button
            onClick={handleCreateZone}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
          >
            <Plus size={20} />
            Crea Prima Zona
          </button>
        </div>
      )}

      {/* Zone Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {editingZone ? 'Modifica Zona' : 'Nuova Zona Irrigazione'}
                </h2>
                <p className="text-sm text-gray-600">
                  Configura i parametri della zona per ottimizzare l'irrigazione
                </p>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Informazioni Base</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome Zona *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="es. Zona Pomodori"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Area (m²) *
                    </label>
                    <input
                      type="number"
                      value={formData.areaSqm || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, areaSqm: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                      min="0"
                      step="0.1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrizione
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Descrizione opzionale della zona..."
                  />
                </div>
              </div>

              {/* Soil Characteristics */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Caratteristiche del Terreno</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo di Terreno
                    </label>
                    <select
                      value={formData.soilType}
                      onChange={(e) => setFormData(prev => ({ ...prev, soilType: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="clay">Argilloso</option>
                      <option value="loam">Franco</option>
                      <option value="sand">Sabbioso</option>
                      <option value="mixed">Misto</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Esposizione Solare
                    </label>
                    <select
                      value={formData.sunExposure}
                      onChange={(e) => setFormData(prev => ({ ...prev, sunExposure: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="full">Pieno Sole</option>
                      <option value="partial">Parziale</option>
                      <option value="shade">Ombra</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Qualità Drenaggio
                    </label>
                    <select
                      value={formData.drainageQuality}
                      onChange={(e) => setFormData(prev => ({ ...prev, drainageQuality: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="excellent">Eccellente</option>
                      <option value="good">Buono</option>
                      <option value="fair">Discreto</option>
                      <option value="poor">Scarso</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ritenzione Idrica
                    </label>
                    <select
                      value={formData.waterRetention}
                      onChange={(e) => setFormData(prev => ({ ...prev, waterRetention: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="high">Alta</option>
                      <option value="medium">Media</option>
                      <option value="low">Bassa</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pendenza (%)
                    </label>
                    <input
                      type="number"
                      value={formData.slopePercentage || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, slopePercentage: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      pH del Terreno
                    </label>
                    <input
                      type="number"
                      value={formData.phLevel || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, phLevel: parseFloat(e.target.value) || undefined }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="7.0"
                      min="0"
                      max="14"
                      step="0.1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sostanza Organica (%)
                  </label>
                  <input
                    type="number"
                    value={formData.organicMatterPercentage || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, organicMatterPercentage: parseFloat(e.target.value) || undefined }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="3.0"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={handleSaveZone}
                disabled={saving || !formData.name.trim() || formData.areaSqm <= 0}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    {editingZone ? 'Aggiorna Zona' : 'Crea Zona'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}