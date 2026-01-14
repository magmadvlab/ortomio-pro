'use client'

import React, { useState, useEffect } from 'react'
import {
  Calendar,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  Leaf,
  MapPin,
  Clock,
  TrendingUp,
  RefreshCw
} from 'lucide-react'
import { useGarden } from '@/packages/core/hooks/useGarden'
import { classicPlannerService, PlantingPlan, PlantingSuggestion } from '@/services/classicPlannerService'
import LocationSelector from '@/components/shared/LocationSelector'

export default function ClassicPlannerWithRotation() {
  const { activeGarden } = useGarden()
  const [loading, setLoading] = useState(false)
  const [plans, setPlans] = useState<PlantingPlan[]>([])
  const [suggestions, setSuggestions] = useState<PlantingSuggestion[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<{
    gardenId?: string
    zoneId?: string
    fieldRowId?: string
    sectionId?: string
  }>({})
  
  const [newPlan, setNewPlan] = useState({
    plantName: '',
    plantFamily: '',
    quantity: 1,
    plannedPlantingDate: new Date().toISOString().split('T')[0],
    notes: ''
  })

  const [filterStatus, setFilterStatus] = useState<PlantingPlan['status'] | 'ALL'>('ALL')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (activeGarden) {
      loadPlans()
    }
  }, [activeGarden, filterStatus])

  useEffect(() => {
    if (selectedLocation.fieldRowId) {
      loadSuggestions()
    }
  }, [selectedLocation])

  const loadPlans = async () => {
    if (!activeGarden) return
    
    try {
      setLoading(true)
      const filters: any = {}
      if (filterStatus !== 'ALL') filters.status = filterStatus
      
      const data = await classicPlannerService.getPlans(activeGarden.id, filters)
      setPlans(data)
    } catch (error) {
      console.error('Error loading plans:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadSuggestions = async () => {
    if (!activeGarden) return
    
    try {
      const data = await classicPlannerService.getSuggestionsForLocation(
        activeGarden.id,
        selectedLocation.fieldRowId,
        selectedLocation.zoneId
      )
      setSuggestions(data)
    } catch (error) {
      console.error('Error loading suggestions:', error)
    }
  }

  const handleCreatePlan = async () => {
    if (!activeGarden || !newPlan.plantName) return
    
    try {
      await classicPlannerService.createPlan({
        gardenId: activeGarden.id,
        zoneId: selectedLocation.zoneId,
        fieldRowId: selectedLocation.fieldRowId,
        fieldRowSectionId: selectedLocation.sectionId,
        plantName: newPlan.plantName,
        plantFamily: newPlan.plantFamily,
        quantity: newPlan.quantity,
        plannedPlantingDate: newPlan.plannedPlantingDate,
        notes: newPlan.notes
      })
      
      await loadPlans()
      setShowCreateModal(false)
      setNewPlan({
        plantName: '',
        plantFamily: '',
        quantity: 1,
        plannedPlantingDate: new Date().toISOString().split('T')[0],
        notes: ''
      })
    } catch (error) {
      console.error('Error creating plan:', error)
    }
  }

  const handleUpdateStatus = async (planId: string, status: PlantingPlan['status']) => {
    try {
      const data: any = {}
      if (status === 'PLANTED') {
        data.actualPlantingDate = new Date().toISOString().split('T')[0]
      } else if (status === 'HARVESTED') {
        data.actualHarvestDate = new Date().toISOString().split('T')[0]
      }
      
      await classicPlannerService.updatePlanStatus(planId, status, data)
      await loadPlans()
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const handleUseSuggestion = (suggestion: PlantingSuggestion) => {
    setNewPlan({
      plantName: suggestion.plantName,
      plantFamily: suggestion.plantFamily,
      quantity: 1,
      plannedPlantingDate: suggestion.idealPlantingDates.optimal,
      notes: `Suggerito da AI: ${suggestion.reason}`
    })
  }

  const getStatusColor = (status: PlantingPlan['status']) => {
    switch (status) {
      case 'PLANNED': return 'text-gray-600 bg-gray-100'
      case 'PLANTED': return 'text-blue-600 bg-blue-100'
      case 'GROWING': return 'text-green-600 bg-green-100'
      case 'HARVESTED': return 'text-purple-600 bg-purple-100'
      case 'CANCELLED': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getRotationScoreColor = (score?: number) => {
    if (!score) return 'text-gray-600'
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-blue-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  const filteredPlans = plans.filter(plan => {
    if (searchTerm) {
      return plan.plantName.toLowerCase().includes(searchTerm.toLowerCase())
    }
    return true
  })

  if (!activeGarden) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <Calendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Seleziona un Orto
        </h2>
        <p className="text-gray-600">
          Seleziona un orto per pianificare le coltivazioni
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg">
            <Calendar className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Planner Classico
            </h1>
            <p className="text-gray-600">
              Pianifica coltivazioni con rotazione intelligente
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus size={16} />
          Nuova Pianificazione
        </button>
      </div>

      {/* AI Integration Banner */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <RefreshCw className="h-6 w-6 text-green-600" />
          <div>
            <h3 className="font-semibold text-green-900">
              🧠 Integrazione Rotazione Colture
            </h3>
            <p className="text-sm text-green-800">
              Il planner analizza automaticamente la storia dei filari e suggerisce colture ottimali • 
              Score rotazione visualizzato • Warnings per scelte non ottimali • 
              Tracking automatico per storia
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cerca pianta..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          
          <Filter size={20} className="text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="ALL">Tutti gli stati</option>
            <option value="PLANNED">Pianificati</option>
            <option value="PLANTED">Piantati</option>
            <option value="GROWING">In Crescita</option>
            <option value="HARVESTED">Raccolti</option>
            <option value="CANCELLED">Annullati</option>
          </select>
        </div>
      </div>

      {/* Plans List */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento pianificazioni...</p>
        </div>
      ) : filteredPlans.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <Calendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Nessuna Pianificazione
          </h3>
          <p className="text-gray-600 mb-4">
            Inizia a pianificare le tue coltivazioni
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Crea Prima Pianificazione
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPlans.map((plan) => (
            <div key={plan.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Leaf className="h-6 w-6 text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-900">{plan.plantName}</h3>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {plan.plantFamily}
                    </span>
                    <div className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(plan.status)}`}>
                      {plan.status}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span>📅 Pianificato: {new Date(plan.plannedPlantingDate).toLocaleDateString('it-IT')}</span>
                    {plan.actualPlantingDate && (
                      <span>🌱 Piantato: {new Date(plan.actualPlantingDate).toLocaleDateString('it-IT')}</span>
                    )}
                    {plan.actualHarvestDate && (
                      <span>🌾 Raccolto: {new Date(plan.actualHarvestDate).toLocaleDateString('it-IT')}</span>
                    )}
                    <span>📦 Quantità: {plan.quantity}</span>
                  </div>

                  {/* Rotation Info */}
                  {plan.fieldRowId && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <RefreshCw size={16} className="text-green-600" />
                        <span className="font-medium text-gray-900">Rotazione Colture</span>
                        {plan.followsRotationAdvice ? (
                          <CheckCircle size={16} className="text-green-600" />
                        ) : (
                          <AlertTriangle size={16} className="text-yellow-600" />
                        )}
                      </div>
                      
                      {plan.rotationScore && (
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm text-gray-600">Score:</span>
                          <span className={`text-sm font-bold ${getRotationScoreColor(plan.rotationScore)}`}>
                            {plan.rotationScore}/100
                          </span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-500 ${
                                plan.rotationScore >= 80 ? 'bg-green-500' :
                                plan.rotationScore >= 60 ? 'bg-blue-500' :
                                plan.rotationScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${plan.rotationScore}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                      
                      {plan.rotationWarnings && plan.rotationWarnings.length > 0 && (
                        <div className="space-y-1">
                          {plan.rotationWarnings.map((warning, index) => (
                            <p key={index} className="text-xs text-yellow-700">
                              {warning}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {plan.notes && (
                    <p className="text-sm text-gray-600 italic">📝 {plan.notes}</p>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {plan.status === 'PLANNED' && (
                    <button
                      onClick={() => handleUpdateStatus(plan.id, 'PLANTED')}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                    >
                      Piantato
                    </button>
                  )}
                  {plan.status === 'PLANTED' && (
                    <button
                      onClick={() => handleUpdateStatus(plan.id, 'GROWING')}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                    >
                      In Crescita
                    </button>
                  )}
                  {plan.status === 'GROWING' && (
                    <button
                      onClick={() => handleUpdateStatus(plan.id, 'HARVESTED')}
                      className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors"
                    >
                      Raccolto
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full my-8">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Nuova Pianificazione</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Location Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Posizione (Opzionale - per rotazione intelligente)
                </label>
                <LocationSelector
                  garden={activeGarden}
                  value={{
                    gardenId: selectedLocation.gardenId,
                    zoneId: selectedLocation.zoneId,
                    fieldRowId: selectedLocation.fieldRowId,
                    sectionId: selectedLocation.sectionId
                  }}
                  onChange={(location) => setSelectedLocation(location)}
                  showSections={true}
                />
              </div>

              {/* AI Suggestions */}
              {suggestions.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                    <TrendingUp size={16} />
                    Suggerimenti AI per questa posizione
                  </h4>
                  <div className="space-y-2">
                    {suggestions.slice(0, 3).map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleUseSuggestion(suggestion)}
                        className="w-full text-left p-3 bg-white rounded-lg hover:bg-green-50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-900">{suggestion.plantName}</span>
                          <span className="text-sm font-bold text-green-600">Score: {suggestion.score}</span>
                        </div>
                        <p className="text-xs text-gray-600">{suggestion.reason}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Plant Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Pianta *
                  </label>
                  <input
                    type="text"
                    value={newPlan.plantName}
                    onChange={(e) => setNewPlan(prev => ({ ...prev, plantName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Es: Pomodoro"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Famiglia Botanica *
                  </label>
                  <input
                    type="text"
                    value={newPlan.plantFamily}
                    onChange={(e) => setNewPlan(prev => ({ ...prev, plantFamily: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Es: Solanaceae"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantità
                  </label>
                  <input
                    type="number"
                    value={newPlan.quantity}
                    onChange={(e) => setNewPlan(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Pianificata
                  </label>
                  <input
                    type="date"
                    value={newPlan.plannedPlantingDate}
                    onChange={(e) => setNewPlan(prev => ({ ...prev, plannedPlantingDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note
                </label>
                <textarea
                  value={newPlan.notes}
                  onChange={(e) => setNewPlan(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Note aggiuntive..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={handleCreatePlan}
                disabled={!newPlan.plantName || !newPlan.plantFamily}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Crea Pianificazione
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
