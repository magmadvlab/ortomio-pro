'use client'

import { useState, useEffect, Suspense } from 'react'
import { Tractor, Calendar, MapPin, Settings, Plus, BarChart3, X, ArrowLeft, ArrowRight, Wrench, Cog, Clock } from 'lucide-react'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { Garden } from '@/types'
import LocationSelector from '@/components/shared/LocationSelector'

interface MechanicalWorkConfig {
  id: string
  gardenId: string
  gardenName: string
  zoneId?: string
  zoneName?: string
  fieldRowId?: string
  fieldRowName?: string
  sectionId?: string
  sectionName?: string
  workType: 'tillage' | 'pruning' | 'mowing' | 'harvesting' | 'planting' | 'weeding' | 'mulching'
  equipmentId?: string
  equipmentName: string
  operatorName?: string
  estimatedDuration: number // hours
  fuelConsumption?: number // L/h
  schedule: {
    frequency: 'once' | 'weekly' | 'monthly' | 'seasonal' | 'custom'
    startDate: string
    endDate?: string
    times: string[] // HH:MM format
    daysOfWeek?: number[] // 0-6, Sunday = 0
  }
  notes?: string
}

interface Equipment {
  id: string
  name: string
  type: 'tractor' | 'cultivator' | 'mower' | 'harvester' | 'sprayer' | 'seeder' | 'plow' | 'disc' | 'other'
  brand?: string
  model?: string
  power?: number // HP
  fuelType: 'diesel' | 'gasoline' | 'electric' | 'manual'
  fuelConsumption?: number // L/h
  maintenanceDate?: string
  notes?: string
}

function MechanicalWorkContent() {
  const { storageProvider } = useStorage()
  const [gardens, setGardens] = useState<Garden[]>([])
  const [activeGarden, setActiveGarden] = useState<Garden | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'operations' | 'equipment' | 'schedule' | 'analytics'>('overview')
  const [showWorkWizard, setShowWorkWizard] = useState(false)
  const [showEquipmentModal, setShowEquipmentModal] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [mechanicalConfigs, setMechanicalConfigs] = useState<MechanicalWorkConfig[]>([])
  const [equipment, setEquipment] = useState<Equipment[]>([])

  useEffect(() => {
    const loadGardens = async () => {
      try {
        const loadedGardens = await storageProvider.getGardens()
        setGardens(loadedGardens)
        if (loadedGardens.length > 0) {
          setActiveGarden(loadedGardens[0])
        }
        // Load existing configs and equipment
        loadMechanicalConfigs()
        loadEquipment()
      } catch (error) {
        console.error('Error loading gardens:', error)
      }
    }
    loadGardens()
  }, [storageProvider])

  const loadMechanicalConfigs = async () => {
    try {
      // Simulate loading mechanical work configs from storage
      const configs: MechanicalWorkConfig[] = []
      setMechanicalConfigs(configs)
    } catch (error) {
      console.error('Error loading mechanical configs:', error)
    }
  }

  const loadEquipment = async () => {
    try {
      // Simulate loading equipment from storage
      const equipmentList: Equipment[] = [
        {
          id: '1',
          name: 'Trattore John Deere 5055E',
          type: 'tractor',
          brand: 'John Deere',
          model: '5055E',
          power: 55,
          fuelType: 'diesel',
          fuelConsumption: 8.5,
          maintenanceDate: '2024-03-15'
        },
        {
          id: '2',
          name: 'Motozappa Honda FG110',
          type: 'cultivator',
          brand: 'Honda',
          model: 'FG110',
          power: 4,
          fuelType: 'gasoline',
          fuelConsumption: 1.2
        }
      ]
      setEquipment(equipmentList)
    } catch (error) {
      console.error('Error loading equipment:', error)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Tractor className="text-green-500" size={28} />
          Lavorazioni Meccaniche
        </h1>
        <p className="text-gray-600 mt-1">Gestisci lavorazioni, attrezzature e macchinari</p>
      </div>

      {/* Statistiche Rapide */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Tractor className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{mechanicalConfigs.length}</p>
              <p className="text-sm text-gray-600">Lavorazioni</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Wrench className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{equipment.length}</p>
              <p className="text-sm text-gray-600">Attrezzature</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="text-purple-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">3</p>
              <p className="text-sm text-gray-600">Programmate</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="text-orange-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">24h</p>
              <p className="text-sm text-gray-600">Ore Lavoro</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          {/* Desktop: Single row */}
          <nav className="hidden md:flex -mb-px space-x-8">
            {[
              { id: 'overview', label: 'Panoramica', icon: BarChart3 },
              { id: 'operations', label: 'Lavorazioni', icon: Tractor },
              { id: 'equipment', label: 'Attrezzature', icon: Wrench },
              { id: 'schedule', label: 'Calendario', icon: Calendar },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              )
            })}
          </nav>

          {/* Mobile: Two rows */}
          <div className="md:hidden">
            {/* First row - Main tabs */}
            <nav className="flex space-x-4 border-b border-gray-100 -mb-px">
              {[
                { id: 'overview', label: 'Panoramica', icon: BarChart3 },
                { id: 'operations', label: 'Lavorazioni', icon: Tractor },
                { id: 'equipment', label: 'Attrezzature', icon: Wrench }
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-1 py-3 px-2 border-b-2 font-medium text-xs transition-colors flex-1 justify-center ${
                      activeTab === tab.id
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={14} />
                    <span className="truncate">{tab.label}</span>
                  </button>
                )
              })}
            </nav>

            {/* Second row - Additional tabs */}
            <nav className="flex space-x-4 -mb-px">
              {[
                { id: 'schedule', label: 'Calendario', icon: Calendar },
                { id: 'analytics', label: 'Analytics', icon: BarChart3 }
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-1 py-3 px-2 border-b-2 font-medium text-xs transition-colors flex-1 justify-center ${
                      activeTab === tab.id
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={14} />
                    <span className="truncate">{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Contenuto */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Azioni Rapide */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Azioni Rapide</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                onClick={() => setShowWorkWizard(true)}
                className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
              >
                <Plus className="text-green-600" size={20} />
                <div className="text-left">
                  <p className="font-medium text-green-900">Nuova Lavorazione</p>
                  <p className="text-sm text-green-700">Programma lavorazione</p>
                </div>
              </button>
              
              <button 
                onClick={() => setShowEquipmentModal(true)}
                className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <Wrench className="text-blue-600" size={20} />
                <div className="text-left">
                  <p className="font-medium text-blue-900">Gestisci Attrezzature</p>
                  <p className="text-sm text-blue-700">Aggiungi macchinari</p>
                </div>
              </button>
              
              <button 
                onClick={() => setShowAnalytics(true)}
                className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
              >
                <BarChart3 className="text-purple-600" size={20} />
                <div className="text-left">
                  <p className="font-medium text-purple-900">Visualizza Report</p>
                  <p className="text-sm text-purple-700">Analisi prestazioni</p>
                </div>
              </button>
            </div>
          </div>

          {/* Prossime Lavorazioni */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Prossime Lavorazioni</h2>
            {mechanicalConfigs.length === 0 ? (
              <div className="text-center py-8">
                <Tractor className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-gray-600 mb-2">Nessuna lavorazione programmata</p>
                <p className="text-sm text-gray-500 mb-4">Inizia programmando la tua prima lavorazione</p>
                <button 
                  onClick={() => setShowWorkWizard(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Programma Lavorazione
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {mechanicalConfigs.slice(0, 3).map((config) => (
                  <div key={config.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Tractor className="text-green-600" size={20} />
                      <div>
                        <h4 className="font-medium text-gray-900">{config.equipmentName}</h4>
                        <p className="text-sm text-gray-600">
                          {config.sectionName || config.fieldRowName || config.zoneName || config.gardenName}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {config.workType === 'tillage' ? 'Lavorazione' :
                         config.workType === 'pruning' ? 'Potatura' :
                         config.workType === 'mowing' ? 'Sfalcio' :
                         config.workType === 'harvesting' ? 'Raccolta' :
                         config.workType === 'planting' ? 'Semina' :
                         config.workType === 'weeding' ? 'Diserbo' : 'Pacciamatura'}
                      </p>
                      <p className="text-xs text-gray-500">{config.estimatedDuration}h stimato</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'operations' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center py-12">
            <Tractor className="mx-auto mb-4 text-green-500" size={48} />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Gestione Lavorazioni</h2>
            <p className="text-gray-600 mb-6">
              Programma e monitora le lavorazioni meccaniche delle tue colture
            </p>
            <button 
              onClick={() => setShowWorkWizard(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Aggiungi Lavorazione
            </button>
          </div>
        </div>
      )}

      {activeTab === 'equipment' && (
        <div className="space-y-6">
          {/* Equipment List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Attrezzature e Macchinari</h2>
              <button 
                onClick={() => setShowEquipmentModal(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} />
                Aggiungi Attrezzatura
              </button>
            </div>

            {equipment.length === 0 ? (
              <div className="text-center py-8">
                <Wrench className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-gray-600 mb-2">Nessuna attrezzatura registrata</p>
                <p className="text-sm text-gray-500 mb-4">Aggiungi i tuoi macchinari per una gestione completa</p>
                <button 
                  onClick={() => setShowEquipmentModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Aggiungi Prima Attrezzatura
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {equipment.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        {item.type === 'tractor' ? <Tractor className="text-blue-600" size={20} /> :
                         <Wrench className="text-blue-600" size={20} />}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-600">
                          {item.brand} {item.model}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tipo:</span>
                        <span className="font-medium">
                          {item.type === 'tractor' ? 'Trattore' :
                           item.type === 'cultivator' ? 'Motozappa' :
                           item.type === 'mower' ? 'Tosaerba' :
                           item.type === 'harvester' ? 'Mietitrice' :
                           item.type === 'sprayer' ? 'Irroratrice' :
                           item.type === 'seeder' ? 'Seminatrice' :
                           item.type === 'plow' ? 'Aratro' :
                           item.type === 'disc' ? 'Erpice' : 'Altro'}
                        </span>
                      </div>
                      {item.power && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Potenza:</span>
                          <span className="font-medium">{item.power} HP</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Carburante:</span>
                        <span className="font-medium">
                          {item.fuelType === 'diesel' ? 'Diesel' :
                           item.fuelType === 'gasoline' ? 'Benzina' :
                           item.fuelType === 'electric' ? 'Elettrico' : 'Manuale'}
                        </span>
                      </div>
                      {item.fuelConsumption && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Consumo:</span>
                          <span className="font-medium">{item.fuelConsumption} L/h</span>
                        </div>
                      )}
                      {item.maintenanceDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Ultima manutenzione:</span>
                          <span className="font-medium">{new Date(item.maintenanceDate).toLocaleDateString('it-IT')}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-200 transition-colors">
                        Modifica
                      </button>
                      <button className="flex-1 bg-green-100 text-green-700 px-3 py-2 rounded text-sm hover:bg-green-200 transition-colors">
                        Usa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'schedule' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center py-12">
            <Calendar className="mx-auto mb-4 text-blue-500" size={48} />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Calendario Lavorazioni</h2>
            <p className="text-gray-600 mb-6">
              Visualizza e pianifica le lavorazioni nel tempo
            </p>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              Visualizza Calendario
            </button>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center py-12">
            <BarChart3 className="mx-auto mb-4 text-purple-500" size={48} />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Analytics Lavorazioni</h2>
            <p className="text-gray-600 mb-6">
              Analizza costi, tempi ed efficienza delle lavorazioni
            </p>
            <button 
              onClick={() => setShowAnalytics(true)}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Visualizza Report
            </button>
          </div>
        </div>
      )}

      {/* Mechanical Work Configuration Wizard */}
      {showWorkWizard && (
        <MechanicalWorkWizard
          gardens={gardens}
          equipment={equipment}
          onClose={() => setShowWorkWizard(false)}
          onSave={(config) => {
            setMechanicalConfigs(prev => [...prev, config])
            setShowWorkWizard(false)
          }}
        />
      )}

      {/* Equipment Modal */}
      {showEquipmentModal && (
        <EquipmentModal
          onClose={() => setShowEquipmentModal(false)}
          onSave={(newEquipment) => {
            setEquipment(prev => [...prev, newEquipment])
            setShowEquipmentModal(false)
          }}
        />
      )}

      {/* Analytics Modal */}
      {showAnalytics && (
        <MechanicalAnalyticsModal
          onClose={() => setShowAnalytics(false)}
          mechanicalConfigs={mechanicalConfigs}
          equipment={equipment}
        />
      )}
    </div>
  )
}

// Mechanical Work Configuration Wizard Component
interface MechanicalWorkWizardProps {
  gardens: Garden[]
  equipment: Equipment[]
  onClose: () => void
  onSave: (config: MechanicalWorkConfig) => void
}

function MechanicalWorkWizard({ gardens, equipment, onClose, onSave }: MechanicalWorkWizardProps) {
  const [step, setStep] = useState<'garden' | 'location' | 'work' | 'schedule'>('garden')
  const [selectedGarden, setSelectedGarden] = useState<Garden | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<any>(null)
  const [workConfig, setWorkConfig] = useState({
    workType: 'tillage' as const,
    equipmentId: '',
    equipmentName: '',
    operatorName: '',
    estimatedDuration: 2,
    fuelConsumption: 8,
    notes: ''
  })
  const [scheduleConfig, setScheduleConfig] = useState({
    frequency: 'once' as const,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    times: ['08:00'],
    daysOfWeek: [1, 2, 3, 4, 5, 6, 0] // All days
  })

  const handleNext = () => {
    if (step === 'garden' && selectedGarden) {
      setStep('location')
    } else if (step === 'location') {
      setStep('work')
    } else if (step === 'work') {
      setStep('schedule')
    }
  }

  const handleBack = () => {
    if (step === 'location') {
      setStep('garden')
    } else if (step === 'work') {
      setStep('location')
    } else if (step === 'schedule') {
      setStep('work')
    }
  }

  const handleSave = () => {
    if (!selectedGarden) return

    const config: MechanicalWorkConfig = {
      id: crypto.randomUUID(),
      gardenId: selectedGarden.id,
      gardenName: selectedGarden.name,
      zoneId: selectedLocation?.zoneId,
      zoneName: selectedLocation?.zoneName,
      fieldRowId: selectedLocation?.fieldRowId,
      fieldRowName: selectedLocation?.fieldRowName,
      sectionId: selectedLocation?.sectionId,
      sectionName: selectedLocation?.sectionName,
      ...workConfig,
      schedule: scheduleConfig
    }

    onSave(config)
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Configura Lavorazione</h2>
            <p className="text-sm text-gray-600">
              {step === 'garden' && 'Seleziona il giardino'}
              {step === 'location' && 'Scegli zona o filare'}
              {step === 'work' && 'Configura lavorazione'}
              {step === 'schedule' && 'Imposta programmazione'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Garden Selection */}
          {step === 'garden' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Seleziona Giardino/Orto</h3>
              
              {gardens.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">Nessun giardino disponibile</p>
                  <p className="text-sm text-gray-500 mt-2">Crea un giardino per configurare le lavorazioni</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {gardens.map((garden) => (
                    <button
                      key={garden.id}
                      onClick={() => setSelectedGarden(garden)}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        selectedGarden?.id === garden.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <MapPin className="text-green-600" size={20} />
                        <div>
                          <h4 className="font-semibold text-gray-900">{garden.name}</h4>
                          <p className="text-sm text-gray-600">
                            {(garden as any).location || 'Posizione non specificata'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Tipo: {(garden as any).type === 'vegetable' ? 'Orto' : 
                                   (garden as any).type === 'fruit' ? 'Frutteto' :
                                   (garden as any).type === 'olive' ? 'Uliveto' :
                                   (garden as any).type === 'vineyard' ? 'Vigneto' : 'Giardino'}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Location Selection */}
          {step === 'location' && selectedGarden && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Seleziona Area di Lavorazione</h3>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-green-800">
                  <strong>Giardino selezionato:</strong> {selectedGarden.name}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Scegli zona, filare o porzione specifica
                  </label>
                  <LocationSelector
                    garden={selectedGarden}
                    onLocationChange={(location) => {
                      setSelectedLocation(location)
                    }}
                    placeholder="Seleziona area da lavorare..."
                  />
                </div>

                {selectedLocation && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-800">
                      <strong>Area selezionata:</strong> {selectedLocation.fullLocationName}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Work Configuration */}
          {step === 'work' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Configura Lavorazione</h3>
              
              {/* Work Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo di Lavorazione
                </label>
                <select
                  value={workConfig.workType}
                  onChange={(e) => setWorkConfig(prev => ({ ...prev, workType: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="tillage">Lavorazione del Terreno</option>
                  <option value="pruning">Potatura</option>
                  <option value="mowing">Sfalcio</option>
                  <option value="harvesting">Raccolta</option>
                  <option value="planting">Semina/Trapianto</option>
                  <option value="weeding">Diserbo</option>
                  <option value="mulching">Pacciamatura</option>
                </select>
              </div>

              {/* Equipment Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attrezzatura/Macchinario
                </label>
                <select
                  value={workConfig.equipmentId}
                  onChange={(e) => {
                    const selectedEquipment = equipment.find(eq => eq.id === e.target.value)
                    setWorkConfig(prev => ({ 
                      ...prev, 
                      equipmentId: e.target.value,
                      equipmentName: selectedEquipment?.name || '',
                      fuelConsumption: selectedEquipment?.fuelConsumption || 0
                    }))
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Seleziona attrezzatura...</option>
                  {equipment.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.brand} {item.model})
                    </option>
                  ))}
                </select>
                {equipment.length === 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    Nessuna attrezzatura disponibile. Aggiungine una dalla sezione Attrezzature.
                  </p>
                )}
              </div>

              {/* Manual Equipment Name (if no equipment selected) */}
              {!workConfig.equipmentId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Attrezzatura (manuale)
                  </label>
                  <input
                    type="text"
                    value={workConfig.equipmentName}
                    onChange={(e) => setWorkConfig(prev => ({ ...prev, equipmentName: e.target.value }))}
                    placeholder="Es: Trattore, Motozappa, Decespugliatore..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              )}

              {/* Operator and Duration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Operatore (opzionale)
                  </label>
                  <input
                    type="text"
                    value={workConfig.operatorName}
                    onChange={(e) => setWorkConfig(prev => ({ ...prev, operatorName: e.target.value }))}
                    placeholder="Nome operatore..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durata Stimata (ore)
                  </label>
                  <input
                    type="number"
                    value={workConfig.estimatedDuration}
                    onChange={(e) => setWorkConfig(prev => ({ ...prev, estimatedDuration: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    min="0.5"
                    step="0.5"
                  />
                </div>
              </div>

              {/* Fuel Consumption */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Consumo Carburante (L/h)
                </label>
                <input
                  type="number"
                  value={workConfig.fuelConsumption}
                  onChange={(e) => setWorkConfig(prev => ({ ...prev, fuelConsumption: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  min="0"
                  step="0.1"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note (opzionale)
                </label>
                <textarea
                  value={workConfig.notes}
                  onChange={(e) => setWorkConfig(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Note aggiuntive sulla lavorazione..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          )}

          {/* Step 4: Schedule Configuration */}
          {step === 'schedule' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Programmazione Lavorazione</h3>
              
              {/* Frequency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frequenza
                </label>
                <select
                  value={scheduleConfig.frequency}
                  onChange={(e) => setScheduleConfig(prev => ({ ...prev, frequency: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="once">Una volta</option>
                  <option value="weekly">Settimanale</option>
                  <option value="monthly">Mensile</option>
                  <option value="seasonal">Stagionale</option>
                  <option value="custom">Personalizzata</option>
                </select>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Inizio
                </label>
                <input
                  type="date"
                  value={scheduleConfig.startDate}
                  onChange={(e) => setScheduleConfig(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* End Date (for recurring) */}
              {scheduleConfig.frequency !== 'once' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Fine (opzionale)
                  </label>
                  <input
                    type="date"
                    value={scheduleConfig.endDate}
                    onChange={(e) => setScheduleConfig(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              )}

              {/* Times */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Orari di Inizio
                </label>
                <div className="space-y-2">
                  {scheduleConfig.times.map((time, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => {
                          const newTimes = [...scheduleConfig.times]
                          newTimes[index] = e.target.value
                          setScheduleConfig(prev => ({ ...prev, times: newTimes }))
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                      {scheduleConfig.times.length > 1 && (
                        <button
                          onClick={() => {
                            const newTimes = scheduleConfig.times.filter((_, i) => i !== index)
                            setScheduleConfig(prev => ({ ...prev, times: newTimes }))
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      setScheduleConfig(prev => ({ ...prev, times: [...prev.times, '12:00'] }))
                    }}
                    className="flex items-center gap-2 text-green-600 hover:text-green-800 text-sm"
                  >
                    <Plus size={16} />
                    Aggiungi Orario
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 bg-gray-50 px-6 py-4 flex justify-between">
          <button
            onClick={step === 'garden' ? onClose : handleBack}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ArrowLeft size={16} />
            {step === 'garden' ? 'Annulla' : 'Indietro'}
          </button>
          
          <button
            onClick={step === 'schedule' ? handleSave : handleNext}
            disabled={
              (step === 'garden' && !selectedGarden) ||
              (step === 'work' && !workConfig.equipmentName)
            }
            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {step === 'schedule' ? 'Salva Lavorazione' : 'Avanti'}
            {step !== 'schedule' && <ArrowRight size={16} />}
          </button>
        </div>
      </div>
    </div>
  )
}

// Equipment Modal Component
interface EquipmentModalProps {
  onClose: () => void
  onSave: (equipment: Equipment) => void
}

function EquipmentModal({ onClose, onSave }: EquipmentModalProps) {
  const [equipmentData, setEquipmentData] = useState({
    name: '',
    type: 'tractor' as const,
    brand: '',
    model: '',
    power: 0,
    fuelType: 'diesel' as const,
    fuelConsumption: 0,
    maintenanceDate: '',
    notes: ''
  })

  const handleSave = () => {
    if (!equipmentData.name) return

    const equipment: Equipment = {
      id: crypto.randomUUID(),
      ...equipmentData,
      power: equipmentData.power || undefined,
      fuelConsumption: equipmentData.fuelConsumption || undefined,
      maintenanceDate: equipmentData.maintenanceDate || undefined
    }

    onSave(equipment)
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Aggiungi Attrezzatura</h2>
            <p className="text-sm text-gray-600">Registra un nuovo macchinario o attrezzo</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome Attrezzatura *
            </label>
            <input
              type="text"
              value={equipmentData.name}
              onChange={(e) => setEquipmentData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Es: Trattore John Deere 5055E"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo
            </label>
            <select
              value={equipmentData.type}
              onChange={(e) => setEquipmentData(prev => ({ ...prev, type: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="tractor">Trattore</option>
              <option value="cultivator">Motozappa</option>
              <option value="mower">Tosaerba</option>
              <option value="harvester">Mietitrice</option>
              <option value="sprayer">Irroratrice</option>
              <option value="seeder">Seminatrice</option>
              <option value="plow">Aratro</option>
              <option value="disc">Erpice</option>
              <option value="other">Altro</option>
            </select>
          </div>

          {/* Brand and Model */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marca
              </label>
              <input
                type="text"
                value={equipmentData.brand}
                onChange={(e) => setEquipmentData(prev => ({ ...prev, brand: e.target.value }))}
                placeholder="Es: John Deere, Honda, Kubota..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Modello
              </label>
              <input
                type="text"
                value={equipmentData.model}
                onChange={(e) => setEquipmentData(prev => ({ ...prev, model: e.target.value }))}
                placeholder="Es: 5055E, FG110..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Power and Fuel Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Potenza (HP)
              </label>
              <input
                type="number"
                value={equipmentData.power}
                onChange={(e) => setEquipmentData(prev => ({ ...prev, power: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min="0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo Carburante
              </label>
              <select
                value={equipmentData.fuelType}
                onChange={(e) => setEquipmentData(prev => ({ ...prev, fuelType: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="diesel">Diesel</option>
                <option value="gasoline">Benzina</option>
                <option value="electric">Elettrico</option>
                <option value="manual">Manuale</option>
              </select>
            </div>
          </div>

          {/* Fuel Consumption */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Consumo Carburante (L/h)
            </label>
            <input
              type="number"
              value={equipmentData.fuelConsumption}
              onChange={(e) => setEquipmentData(prev => ({ ...prev, fuelConsumption: parseFloat(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              min="0"
              step="0.1"
            />
          </div>

          {/* Maintenance Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ultima Manutenzione
            </label>
            <input
              type="date"
              value={equipmentData.maintenanceDate}
              onChange={(e) => setEquipmentData(prev => ({ ...prev, maintenanceDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note
            </label>
            <textarea
              value={equipmentData.notes}
              onChange={(e) => setEquipmentData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Note aggiuntive sull'attrezzatura..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 bg-gray-50 px-6 py-4 flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Annulla
          </button>
          
          <button
            onClick={handleSave}
            disabled={!equipmentData.name}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Salva Attrezzatura
          </button>
        </div>
      </div>
    </div>
  )
}

// Mechanical Analytics Modal Component
interface MechanicalAnalyticsModalProps {
  onClose: () => void
  mechanicalConfigs: MechanicalWorkConfig[]
  equipment: Equipment[]
}

function MechanicalAnalyticsModal({ onClose, mechanicalConfigs, equipment }: MechanicalAnalyticsModalProps) {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  // Mock analytics data
  const analyticsData = {
    totalOperations: 18,
    totalHours: 45,
    fuelConsumed: 156, // liters
    costThisMonth: 280, // euros
    efficiency: 88, // percentage
    operationsByType: [
      { type: 'Lavorazione', count: 8, hours: 18, cost: 120 },
      { type: 'Potatura', count: 5, hours: 12, cost: 80 },
      { type: 'Sfalcio', count: 3, hours: 8, cost: 50 },
      { type: 'Raccolta', count: 2, hours: 7, cost: 30 }
    ],
    equipmentUsage: equipment.map((item, index) => ({
      name: item.name,
      type: item.type,
      hours: 8 + Math.random() * 15,
      fuelUsed: 20 + Math.random() * 40,
      operations: 2 + Math.floor(Math.random() * 6),
      efficiency: 80 + Math.random() * 20
    })),
    monthlyTrend: [220, 245, 280], // last 3 months costs
    weeklyHours: [6, 8, 5, 9, 7, 4, 6] // last 7 days
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Analytics Lavorazioni</h2>
            <p className="text-sm text-gray-600">Analisi costi, tempi ed efficienza</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-3">
                <Tractor className="text-green-600" size={24} />
                <div>
                  <p className="text-2xl font-bold text-green-900">{analyticsData.totalOperations}</p>
                  <p className="text-sm text-green-700">Lavorazioni</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-3">
                <Clock className="text-blue-600" size={24} />
                <div>
                  <p className="text-2xl font-bold text-blue-900">{analyticsData.totalHours}h</p>
                  <p className="text-sm text-blue-700">Ore Lavoro</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center gap-3">
                <BarChart3 className="text-purple-600" size={24} />
                <div>
                  <p className="text-2xl font-bold text-purple-900">{analyticsData.efficiency}%</p>
                  <p className="text-sm text-purple-700">Efficienza</p>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <div className="flex items-center gap-3">
                <span className="text-orange-600 text-2xl">€</span>
                <div>
                  <p className="text-2xl font-bold text-orange-900">{analyticsData.costThisMonth}</p>
                  <p className="text-sm text-orange-700">Costo Mensile</p>
                </div>
              </div>
            </div>
          </div>

          {/* Operations by Type Chart */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Lavorazioni per Tipo</h3>
            <div className="space-y-4">
              {analyticsData.operationsByType.map((operation, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{operation.type}</h4>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                      <span>🔄 {operation.count} operazioni</span>
                      <span>⏱️ {operation.hours}h</span>
                      <span>💰 €{operation.cost}</span>
                    </div>
                  </div>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(operation.count / Math.max(...analyticsData.operationsByType.map(t => t.count))) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Equipment Usage */}
          {analyticsData.equipmentUsage.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Utilizzo Attrezzature</h3>
              <div className="space-y-4">
                {analyticsData.equipmentUsage.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <span>⏱️ {Math.round(item.hours)}h</span>
                        <span>⛽ {Math.round(item.fuelUsed)}L</span>
                        <span>🔄 {item.operations} operazioni</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">{Math.round(item.efficiency)}%</div>
                      <div className="text-xs text-gray-500">efficienza</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weekly Hours Chart */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ore Lavoro Settimanali</h3>
            <div className="flex items-end justify-between h-40 gap-2">
              {analyticsData.weeklyHours.map((hours, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div 
                    className="bg-green-500 rounded-t w-full transition-all duration-500"
                    style={{ height: `${(hours / Math.max(...analyticsData.weeklyHours)) * 100}%` }}
                  ></div>
                  <p className="text-xs text-gray-600 mt-2">
                    {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'][index]}
                  </p>
                  <p className="text-xs font-medium text-gray-800">{hours}h</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-4">💡 Raccomandazioni AI</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <p className="text-sm text-green-800">
                  Considera la manutenzione preventiva per le attrezzature con più di 50 ore di utilizzo
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <p className="text-sm text-green-800">
                  Ottimizza i percorsi di lavorazione per ridurre il consumo di carburante del 15%
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <p className="text-sm text-green-800">
                  Programma le lavorazioni nelle ore più fresche per migliorare l'efficienza operativa
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 bg-gray-50 px-6 py-4 flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Chiudi
          </button>
          <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            Esporta Report
          </button>
        </div>
      </div>
    </div>
  )
}

export default function MechanicalWorkPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <Tractor className="w-12 h-12 text-gray-400 mx-auto mb-3 animate-pulse" />
          <p className="text-gray-600">Caricamento...</p>
        </div>
      </div>
    }>
      <MechanicalWorkContent />
    </Suspense>
  )
}