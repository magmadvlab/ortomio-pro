'use client'

import React, { useState, useEffect } from 'react'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { useTier } from '@/packages/core/hooks/useTier'
import { ProFeatureGate } from '@/components/shared/ProFeatureGate'
import { FlaskConical, Plus, Calendar, Package, Droplet, MapPin, Wind, User, FileText, X } from 'lucide-react'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'

interface Treatment {
  id: string
  garden_id?: string
  crop_name: string
  treatment_date: string
  product_name: string
  active_ingredient?: string
  dosage?: number
  dosage_unit?: 'ml' | 'g' | 'kg' | 'L'
  area_treated?: number
  method?: 'spray' | 'soil' | 'seed' | 'foliar'
  reason?: 'preventive' | 'curative' | 'pest_control' | 'disease_control' | 'nutrient'
  weather_conditions?: {
    temp?: number
    humidity?: number
    wind?: string
  }
  operator_name?: string
  notes?: string
  created_at?: string
}

export default function TreatmentsPage() {
  const { storageProvider } = useStorage()
  const { isProfessional } = useTier()
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [gardens, setGardens] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedGardenId, setSelectedGardenId] = useState<string>('')
  
  // Form state
  const [formData, setFormData] = useState<Partial<Treatment>>({
    crop_name: '',
    treatment_date: format(new Date(), 'yyyy-MM-dd'),
    product_name: '',
    active_ingredient: '',
    dosage: undefined,
    dosage_unit: 'ml',
    area_treated: undefined,
    method: 'spray',
    reason: 'preventive',
    operator_name: '',
    notes: '',
    weather_conditions: {}
  })

  useEffect(() => {
    loadData()
  }, [storageProvider, selectedGardenId])

  const loadData = async () => {
    try {
      setLoading(true)
      const gardensList = await storageProvider.getGardens()
      setGardens(gardensList)
      
      if (gardensList.length > 0 && !selectedGardenId) {
        setSelectedGardenId(gardensList[0].id)
      }
      
      // Load treatments from API
      const params = new URLSearchParams()
      if (selectedGardenId) {
        params.append('garden_id', selectedGardenId)
      }
      params.append('limit', '100')
      
      const response = await fetch(`/api/treatments?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setTreatments(data.treatments || [])
      } else {
        console.error('Error loading treatments:', response.statusText)
        // In locale, mostra array vuoto se API non disponibile
        setTreatments([])
      }
    } catch (error) {
      console.error('Error loading treatments:', error)
      setTreatments([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/treatments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          garden_id: selectedGardenId || null,
          dosage: formData.dosage ? parseFloat(formData.dosage.toString()) : null,
          area_treated: formData.area_treated ? parseFloat(formData.area_treated.toString()) : null,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setTreatments([data.treatment, ...treatments])
        setShowForm(false)
        resetForm()
        loadData() // Reload to get updated list
      } else {
        const error = await response.json()
        alert(`Errore: ${error.message || 'Impossibile salvare il trattamento'}`)
      }
    } catch (error: any) {
      console.error('Error saving treatment:', error)
      alert(`Errore: ${error.message || 'Impossibile salvare il trattamento'}`)
    }
  }

  const resetForm = () => {
    setFormData({
      crop_name: '',
      treatment_date: format(new Date(), 'yyyy-MM-dd'),
      product_name: '',
      active_ingredient: '',
      dosage: undefined,
      dosage_unit: 'ml',
      area_treated: undefined,
      method: 'spray',
      reason: 'preventive',
      operator_name: '',
      notes: '',
      weather_conditions: {}
    })
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 max-w-7xl mx-auto">
      <ProFeatureGate
        feature="treatment-register"
        title="Registro Trattamenti"
        description="Registra e gestisci tutti i trattamenti effettuati sulle tue colture"
        requiredTier="PRO_PROFESSIONAL"
      >
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <FlaskConical className="text-purple-600" size={32} />
            Registro Trattamenti
          </h1>
          <p className="text-gray-600">
            Traccia tutti i trattamenti effettuati per conformità e monitoraggio
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
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
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

        {/* Pulsante Nuovo Trattamento */}
        <div className="mb-6 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {treatments.length} trattamento{treatments.length !== 1 ? 'i' : ''} registrato{treatments.length !== 1 ? 'i' : ''}
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus size={20} />
            {showForm ? 'Annulla' : 'Nuovo Trattamento'}
          </button>
        </div>

        {/* Form Nuovo Trattamento */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-2 border-purple-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Nuovo Trattamento</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Coltura *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.crop_name || ''}
                    onChange={(e) => setFormData({ ...formData, crop_name: e.target.value })}
                    placeholder="es. Pomodoro"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Calendar size={16} className="inline mr-2" />
                    Data Trattamento *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.treatment_date || ''}
                    onChange={(e) => setFormData({ ...formData, treatment_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Package size={16} className="inline mr-2" />
                    Prodotto *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.product_name || ''}
                    onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                    placeholder="es. Rame 50"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Principio Attivo
                  </label>
                  <input
                    type="text"
                    value={formData.active_ingredient || ''}
                    onChange={(e) => setFormData({ ...formData, active_ingredient: e.target.value })}
                    placeholder="es. Rame"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Droplet size={16} className="inline mr-2" />
                    Dosaggio *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      required
                      step="0.01"
                      value={formData.dosage || ''}
                      onChange={(e) => setFormData({ ...formData, dosage: parseFloat(e.target.value) || undefined })}
                      placeholder="es. 50"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                    <select
                      value={formData.dosage_unit || 'ml'}
                      onChange={(e) => setFormData({ ...formData, dosage_unit: e.target.value as any })}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="ml">ml</option>
                      <option value="g">g</option>
                      <option value="kg">kg</option>
                      <option value="L">L</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Area Trattata (m²) *
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={formData.area_treated || ''}
                    onChange={(e) => setFormData({ ...formData, area_treated: parseFloat(e.target.value) || undefined })}
                    placeholder="es. 100"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Metodo di Applicazione
                  </label>
                  <select
                    value={formData.method || 'spray'}
                    onChange={(e) => setFormData({ ...formData, method: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="spray">Spray</option>
                    <option value="soil">Suolo</option>
                    <option value="seed">Semi</option>
                    <option value="foliar">Fogliare</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Motivo
                  </label>
                  <select
                    value={formData.reason || 'preventive'}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="preventive">Preventivo</option>
                    <option value="curative">Curativo</option>
                    <option value="pest_control">Controllo Parassiti</option>
                    <option value="disease_control">Controllo Malattie</option>
                    <option value="nutrient">Nutriente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <User size={16} className="inline mr-2" />
                    Operatore
                  </label>
                  <input
                    type="text"
                    value={formData.operator_name || ''}
                    onChange={(e) => setFormData({ ...formData, operator_name: e.target.value })}
                    placeholder="Nome operatore"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
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
                  placeholder="Note aggiuntive sul trattamento..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  Salva Trattamento
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

        {/* Lista Trattamenti */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        ) : treatments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FlaskConical className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 mb-2">Nessun trattamento registrato</p>
            <p className="text-sm text-gray-500">
              Inizia registrando il tuo primo trattamento
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
                      Coltura
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Prodotto
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Dosaggio
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Area (m²)
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Metodo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Motivo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Operatore
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {treatments.map((treatment) => (
                    <tr key={treatment.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {format(new Date(treatment.treatment_date), 'dd/MM/yyyy', { locale: it })}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                        {treatment.crop_name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {treatment.product_name}
                        {treatment.active_ingredient && (
                          <span className="text-xs text-gray-500 block">
                            ({treatment.active_ingredient})
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {treatment.dosage} {treatment.dosage_unit}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {treatment.area_treated} m²
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {treatment.method}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                          {treatment.reason}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {treatment.operator_name || '-'}
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






