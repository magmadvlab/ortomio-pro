'use client'

import React, { useState, useEffect } from 'react'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { useTier } from '@/packages/core/hooks/useTier'
import { ProFeatureGate } from '@/components/shared/ProFeatureGate'
import { Tractor, Plus, Calendar, MapPin, Ruler, Wrench, FileText, Loader2, AlertTriangle, Sparkles } from 'lucide-react'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import { suggestTillageWork, TillageWork, calculateTemperaTiming } from '@/logic/tillageEngine'

interface MechanicalWork {
  id: string
  garden_id?: string
  work_type: 'Plowing' | 'Tilling'
  work_date: string
  area_m2: number
  depth_cm?: number
  equipment_type?: 'Tractor' | 'Manual'
  weather_conditions?: {
    temp?: number
    humidity?: number
    wind?: string
    rain?: boolean
  }
  operator_name?: string
  notes?: string
  created_at?: string
}

export default function MechanicalWorkPage() {
  const { storageProvider } = useStorage()
  const { isProfessional } = useTier()
  const [works, setWorks] = useState<MechanicalWork[]>([])
  const [gardens, setGardens] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedGardenId, setSelectedGardenId] = useState<string>('')
  
  // Tillage Engine - Suggerimenti lavorazioni
  const [tillageRecommendation, setTillageRecommendation] = useState<TillageWork | null>(null)
  const [loadingRecommendations, setLoadingRecommendations] = useState(false)
  const [temperaTiming, setTemperaTiming] = useState<{ isTempera: boolean; date?: Date; reason: string } | null>(null)
  
  // Form state
  const [formData, setFormData] = useState<Partial<MechanicalWork>>({
    work_type: 'Plowing',
    work_date: format(new Date(), 'yyyy-MM-dd'),
    area_m2: undefined,
    depth_cm: undefined,
    equipment_type: 'Tractor',
    operator_name: '',
    notes: '',
    weather_conditions: {}
  })

  useEffect(() => {
    loadData()
  }, [storageProvider, selectedGardenId])

  // Carica suggerimenti lavorazioni quando cambia giardino
  useEffect(() => {
    const loadRecommendations = async () => {
      if (!selectedGardenId) {
        setTillageRecommendation(null)
        return
      }

      const selectedGarden = gardens.find(g => g.id === selectedGardenId)
      if (!selectedGarden || !selectedGarden.coordinates) {
        setTillageRecommendation(null)
        return
      }

      setLoadingRecommendations(true)
      try {
        // Calcola suggerimenti lavorazioni (usa garden.id come zoneId)
        const recommendation = await suggestTillageWork(
          selectedGarden,
          selectedGarden.id, // zoneId
          undefined, // soilState - TODO: caricare da soilStateService
          undefined // plannedPlanting - TODO: caricare da tasks
        )
        setTillageRecommendation(recommendation)

        // Calcola timing "terreno in tempera"
        if (selectedGarden.coordinates) {
          try {
            // Usa data pioggia recente (semplificato - in produzione caricare da meteo)
            const lastRainDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 giorni fa
            const lastRainAmount = 10 // mm - TODO: caricare da meteo reale
            
            const temperaResult = await calculateTemperaTiming(
              selectedGarden,
              lastRainDate,
              lastRainAmount
            )
            setTemperaTiming(temperaResult)
          } catch (error) {
            console.error('Error calculating tempera timing:', error)
          }
        }
      } catch (error) {
        console.error('Error loading tillage recommendations:', error)
      } finally {
        setLoadingRecommendations(false)
      }
    }

    loadRecommendations()
  }, [selectedGardenId, gardens])

  const loadData = async () => {
    try {
      setLoading(true)
      const gardensList = await storageProvider.getGardens()
      setGardens(gardensList)
      
      if (gardensList.length > 0 && !selectedGardenId) {
        setSelectedGardenId(gardensList[0].id)
      }
      
      // Load works from API
      const params = new URLSearchParams()
      if (selectedGardenId) {
        params.append('garden_id', selectedGardenId)
      }
      params.append('limit', '100')
      
      const response = await fetch(`/api/mechanical-work?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setWorks(data.works || [])
      } else {
        console.error('Error loading mechanical works:', response.statusText)
        setWorks([])
      }
    } catch (error) {
      console.error('Error loading mechanical works:', error)
      setWorks([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/mechanical-work', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          garden_id: selectedGardenId || null,
          area_m2: formData.area_m2 ? parseFloat(formData.area_m2.toString()) : null,
          depth_cm: formData.depth_cm ? parseFloat(formData.depth_cm.toString()) : null,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setWorks([data.work, ...works])
        setShowForm(false)
        resetForm()
        loadData()
      } else {
        const error = await response.json()
        alert(`Errore: ${error.message || 'Impossibile salvare la lavorazione'}`)
      }
    } catch (error: any) {
      console.error('Error saving mechanical work:', error)
      alert(`Errore: ${error.message || 'Impossibile salvare la lavorazione'}`)
    }
  }

  const resetForm = () => {
    setFormData({
      work_type: 'Plowing',
      work_date: format(new Date(), 'yyyy-MM-dd'),
      area_m2: undefined,
      depth_cm: undefined,
      equipment_type: 'Tractor',
      operator_name: '',
      notes: '',
      weather_conditions: {}
    })
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 max-w-7xl mx-auto">
      <ProFeatureGate
        feature="mechanical-work-register"
        title="Registro Lavorazioni Meccaniche"
        description="Registra e gestisci arature e fresature per terreni più grandi"
        requiredTier="PRO_PROFESSIONAL"
      >
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Tractor className="text-orange-600" size={32} />
            Lavorazioni Meccaniche
          </h1>
          <p className="text-gray-600">
            Traccia arature e fresature per terreni che utilizzano trattori e attrezzature
          </p>
        </div>

        {/* Filtro Giardino */}
        {gardens.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin size={16} className="inline mr-2" />
              Filtra per Giardino
            </label>
            <select
              value={selectedGardenId}
              onChange={(e) => setSelectedGardenId(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Tutti i giardini</option>
              {gardens.map(garden => (
                <option key={garden.id} value={garden.id}>
                  {garden.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Pulsante Nuova Lavorazione */}
        <div className="mb-6 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {works.length} lavorazione{works.length !== 1 ? 'i' : ''} registrata{works.length !== 1 ? 'e' : ''}
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Plus size={20} />
            {showForm ? 'Annulla' : 'Nuova Lavorazione'}
          </button>
        </div>

        {/* Form Nuova Lavorazione */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-2 border-orange-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Nuova Lavorazione Meccanica</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo Lavorazione *
                  </label>
                  <select
                    required
                    value={formData.work_type || 'Plowing'}
                    onChange={(e) => setFormData({ ...formData, work_type: e.target.value as 'Plowing' | 'Tilling' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="Plowing">Aratura</option>
                    <option value="Tilling">Fresatura</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Calendar size={16} className="inline mr-2" />
                    Data Lavorazione *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.work_date || ''}
                    onChange={(e) => setFormData({ ...formData, work_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Area Lavorata (m²) *
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={formData.area_m2 || ''}
                    onChange={(e) => setFormData({ ...formData, area_m2: parseFloat(e.target.value) || undefined })}
                    placeholder="es. 1000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Ruler size={16} className="inline mr-2" />
                    Profondità (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.depth_cm || ''}
                    onChange={(e) => setFormData({ ...formData, depth_cm: parseFloat(e.target.value) || undefined })}
                    placeholder="es. 30"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Wrench size={16} className="inline mr-2" />
                    Attrezzatura
                  </label>
                  <select
                    value={formData.equipment_type || 'Tractor'}
                    onChange={(e) => setFormData({ ...formData, equipment_type: e.target.value as 'Tractor' | 'Manual' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="Tractor">Trattore</option>
                    <option value="Manual">Manuale</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Operatore
                  </label>
                  <input
                    type="text"
                    value={formData.operator_name || ''}
                    onChange={(e) => setFormData({ ...formData, operator_name: e.target.value })}
                    placeholder="Nome operatore"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FileText size={16} className="inline mr-2" />
                  Note
                </label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Note aggiuntive sulla lavorazione..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                >
                  Salva Lavorazione
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    resetForm()
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Annulla
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista Lavorazioni */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        ) : works.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Tractor className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 mb-2">Nessuna lavorazione registrata</p>
            <p className="text-sm text-gray-500">
              Inizia registrando la tua prima lavorazione meccanica
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Area (m²)
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Profondità (cm)
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Attrezzatura
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Operatore
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {works.map((work) => (
                    <tr key={work.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {format(new Date(work.work_date), 'dd/MM/yyyy', { locale: it })}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                        <span className={`px-2 py-1 rounded text-xs ${
                          work.work_type === 'Plowing' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {work.work_type === 'Plowing' ? 'Aratura' : 'Fresatura'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {work.area_m2} m²
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {work.depth_cm ? `${work.depth_cm} cm` : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                          {work.equipment_type === 'Tractor' ? 'Trattore' : 'Manuale'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {work.operator_name || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </ProFeatureGate>
    </div>
  )
}





