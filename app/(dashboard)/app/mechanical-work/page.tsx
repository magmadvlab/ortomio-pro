'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { useTier } from '@/packages/core/hooks/useTier'
import { ProFeatureGate } from '@/components/shared/ProFeatureGate'
import { Tractor, Plus, Calendar, MapPin, Ruler, Wrench, FileText, Loader2, AlertTriangle, Sparkles } from 'lucide-react'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import { suggestTillageWork, TillageWork, calculateTemperaTiming } from '@/logic/tillageEngine'
import { getMechanicalWorksForCrop, cropMechanicalWorksConfig } from '@/data/cropMechanicalWork'

// Work types
type WorkType = 
  // Suolo (esistenti)
  | 'Plowing' | 'Subsoiling' | 'Harrowing' | 'Tilling' | 'Rolling' | 'Hoeing' | 'EarthingUp' | 'Mulching' | 'PostSowingRolling'
  // Preparazione Terreno (nuove)
  | 'Clearing' | 'Stumping' | 'StoneRemoval' | 'Leveling' | 'DeepSubsoiling'
  | 'Digging' | 'DeepHarrowing' | 'Crumbling' | 'Scraping' | 'SurfaceLeveling'
  // Tecniche Moderne
  | 'MinimumTillage' | 'StripTillage' | 'NoTill'
  // Chioma
  | 'FormativePruning' | 'MaintenancePruning' | 'RejuvenationPruning' | 'SummerPruning' | 'WinterPruning'
  | 'Thinning' | 'Suckering' | 'Defoliation' | 'Tying' | 'OliveShredding' | 'RunnerManagement'
  | 'StrawberryMulching' | 'StrawberryCleaning' | 'CaneRemoval' | 'TipPruning' | 'RaspberryTying'
  | 'SuckerThinning' | 'FruitBagging' | 'ExoticThinning' | 'Shredding'
  // Generale
  | 'Topping' | 'Pruning'

// Work category
type WorkCategory = 'Soil' | 'Canopy' | 'General'

// Equipment types
type EquipmentType = 
  // Trattore e attrezzi trattore
  | 'Tractor' | 'RotaryHarrow' | 'Shredder' | 'FertilizerSpreader' | 'Seeder'
  | 'Topper' | 'Defoliator' | 'PrePruner' | 'Thinner'
  // Piccoli mezzi
  | 'Rototiller' | 'Cultivator' | 'Mower' | 'BrushCutter' | 'TrackedCart' | 'BackpackSprayer'
  // Attrezzi elettrificati
  | 'ElectricTier' | 'ElectricPruner' | 'TelescopicPruner'
  // Manuale
  | 'Manual'

interface MechanicalWork {
  id: string
  garden_id?: string
  work_type: WorkType
  work_date: string
  area_m2: number
  depth_cm?: number
  equipment_type?: EquipmentType
  equipment_attachment?: string // Attrezzo specifico quando equipment_type = 'Tractor'
  work_metadata?: {
    category?: WorkCategory
    cropId?: string
    cropName?: string
    period?: { month?: number[]; phenologicalPhase?: string; daysAfterSowing?: number }
    equipment?: string[]
    standardCost?: number
    description?: string
  }
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
  const { isPro } = useTier()
  const [works, setWorks] = useState<MechanicalWork[]>([])
  const [gardens, setGardens] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedGardenId, setSelectedGardenId] = useState<string>('')
  const [selectedCropId, setSelectedCropId] = useState<string>('')

  // Micro-zone tracking
  const [beds, setBeds] = useState<any[]>([])
  const [rows, setRows] = useState<any[]>([])
  const [selectedBedId, setSelectedBedId] = useState<string>('')
  const [selectedRowId, setSelectedRowId] = useState<string>('')
  
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
    equipment_attachment: '',
    operator_name: '',
    notes: '',
    weather_conditions: {},
    work_metadata: {}
  })
  
  useEffect(() => {
    loadData()
  }, [storageProvider, selectedGardenId])

  // Carica beds e rows quando cambia il garden
  useEffect(() => {
    const loadGardenStructure = async () => {
      if (!selectedGardenId) {
        setBeds([])
        setRows([])
        setSelectedBedId('')
        setSelectedRowId('')
        return
      }

      try {
        // Carica aiuole
        const gardenBeds = await storageProvider.getGardenBeds(selectedGardenId)
        setBeds(gardenBeds || [])

        // Carica file se ci sono aiuole
        if (gardenBeds && gardenBeds.length > 0) {
          const allRows: any[] = []
          for (const bed of gardenBeds) {
            const bedRows = await storageProvider.getGardenRows(bed.id)
            if (bedRows) {
              allRows.push(...bedRows)
            }
          }
          setRows(allRows)
        } else {
          setRows([])
        }
      } catch (error) {
        console.error('Error loading garden structure:', error)
        setBeds([])
        setRows([])
      }
    }

    loadGardenStructure()
  }, [selectedGardenId, storageProvider])
  
  // Ottieni lavorazioni suggerite per la coltura selezionata
  const suggestedWorks = useMemo(() => {
    return selectedCropId ? getMechanicalWorksForCrop(selectedCropId) : []
  }, [selectedCropId])

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
      
      // Load works from storageProvider
      const worksList = await storageProvider.getMechanicalWorks(selectedGardenId || undefined)
      // Convert MechanicalWorkRecord to MechanicalWork format for component
      setWorks(worksList.map(w => ({
        id: w.id,
        garden_id: w.garden_id,
        work_type: w.work_type,
        work_date: w.work_date,
        area_m2: w.area_m2,
        depth_cm: w.depth_cm,
        equipment_type: w.equipment_type as EquipmentType | undefined,
        equipment_attachment: w.equipment_attachment,
        work_metadata: w.work_metadata,
        weather_conditions: w.weather_conditions,
        operator_name: w.operator_name,
        notes: w.notes,
        created_at: w.created_at,
      })))
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
      const newWork = await storageProvider.createMechanicalWork({
        garden_id: selectedGardenId || undefined,
        bed_id: selectedBedId || undefined,
        row_id: selectedRowId || undefined,
        work_type: formData.work_type!,
        work_date: formData.work_date!,
        area_m2: formData.area_m2 ? parseFloat(formData.area_m2.toString()) : 0,
        depth_cm: formData.depth_cm ? parseFloat(formData.depth_cm.toString()) : undefined,
        equipment_type: formData.equipment_type,
        equipment_attachment: formData.equipment_type === 'Tractor' ? (formData.equipment_attachment || undefined) : undefined,
        work_metadata: formData.work_metadata,
        weather_conditions: formData.weather_conditions,
        operator_name: formData.operator_name,
        notes: formData.notes,
      })
      
      // Convert to component format and add to list
      setWorks([{
        id: newWork.id,
        garden_id: newWork.garden_id,
        work_type: newWork.work_type,
        work_date: newWork.work_date,
        area_m2: newWork.area_m2,
        depth_cm: newWork.depth_cm,
        equipment_type: newWork.equipment_type as EquipmentType | undefined,
        equipment_attachment: newWork.equipment_attachment,
        work_metadata: newWork.work_metadata,
        weather_conditions: newWork.weather_conditions,
        operator_name: newWork.operator_name,
        notes: newWork.notes,
        created_at: newWork.created_at,
      }, ...works])
      setShowForm(false)
      resetForm()
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
      equipment_attachment: '',
      operator_name: '',
      notes: '',
      weather_conditions: {},
      work_metadata: {}
    })
    setSelectedCropId('')
    setSelectedBedId('')
    setSelectedRowId('')
  }

  // Filtra tipi di lavorazione in base al tipo di garden
  const getAvailableWorkTypes = () => {
    const selectedGarden = gardens.find(g => g.id === selectedGardenId)
    if (!selectedGarden) return [] // Nessun garden selezionato

    const gardenType = selectedGarden.type || 'outdoor'

    // Lavorazioni non applicabili a sistemi indoor
    const outdoorOnlyWorks: WorkType[] = [
      'Plowing', 'Subsoiling', 'Harrowing', 'Tilling', 'Rolling', 'Hoeing', 'EarthingUp',
      'PostSowingRolling', 'Clearing', 'Stumping', 'StoneRemoval', 'Leveling', 'DeepSubsoiling',
      'Digging', 'DeepHarrowing', 'Crumbling', 'Scraping', 'SurfaceLeveling',
      'MinimumTillage', 'StripTillage', 'NoTill'
    ]

    // Se è indoor (aeroponic, hydroponic, aquaponic), escludi lavorazioni suolo
    if (['aeroponic', 'hydroponic', 'aquaponic'].includes(gardenType)) {
      return [
        // Solo lavorazioni chioma/gestione piante
        'FormativePruning', 'MaintenancePruning', 'RejuvenationPruning', 'SummerPruning', 'WinterPruning',
        'Thinning', 'Suckering', 'Defoliation', 'Tying', 'Mulching',
        'OliveShredding', 'RunnerManagement', 'StrawberryMulching', 'StrawberryCleaning',
        'CaneRemoval', 'TipPruning', 'RaspberryTying', 'SuckerThinning', 'FruitBagging',
        'ExoticThinning', 'Shredding', 'Topping', 'Pruning'
      ] as WorkType[]
    }

    // Per outdoor/raised-bed, tutte le lavorazioni sono disponibili
    return [
      // Suolo
      'Plowing', 'Subsoiling', 'Harrowing', 'Tilling', 'Rolling', 'Hoeing', 'EarthingUp', 'Mulching', 'PostSowingRolling',
      // Preparazione
      'Clearing', 'Stumping', 'StoneRemoval', 'Leveling', 'DeepSubsoiling', 'Digging', 'DeepHarrowing', 'Crumbling', 'Scraping', 'SurfaceLeveling',
      // Moderne
      'MinimumTillage', 'StripTillage', 'NoTill',
      // Chioma
      'FormativePruning', 'MaintenancePruning', 'RejuvenationPruning', 'SummerPruning', 'WinterPruning',
      'Thinning', 'Suckering', 'Defoliation', 'Tying', 'OliveShredding', 'RunnerManagement',
      'StrawberryMulching', 'StrawberryCleaning', 'CaneRemoval', 'TipPruning', 'RaspberryTying',
      'SuckerThinning', 'FruitBagging', 'ExoticThinning', 'Shredding',
      // Generale
      'Topping', 'Pruning'
    ] as WorkType[]
  }
  
  // Quando cambia la coltura, suggerisci lavorazioni
  useEffect(() => {
    if (selectedCropId && suggestedWorks.length > 0) {
      // Pre-compila con la prima lavorazione suggerita critica, o la prima disponibile
      const criticalWork = suggestedWorks.find(w => w.critical) || suggestedWorks[0]
      if (criticalWork) {
        setFormData(prev => ({
          ...prev,
          work_type: criticalWork.workType as WorkType,
          work_metadata: {
            category: criticalWork.category,
            cropId: selectedCropId,
            cropName: cropMechanicalWorksConfig.find(c => c.cropId === selectedCropId)?.cropName || '',
            description: criticalWork.description,
            equipment: criticalWork.equipmentSuggested
          }
        }))
      }
    }
  }, [selectedCropId, suggestedWorks])

  // Get work category
  const getWorkCategory = (type: WorkType): WorkCategory => {
    const soilWorks: WorkType[] = [
      // Suolo (esistenti)
      'Plowing', 'Subsoiling', 'Harrowing', 'Tilling', 'Rolling', 'Hoeing', 'EarthingUp', 'Mulching', 'PostSowingRolling',
      // Preparazione Terreno (nuove)
      'Clearing', 'Stumping', 'StoneRemoval', 'Leveling', 'DeepSubsoiling',
      'Digging', 'DeepHarrowing', 'Crumbling', 'Scraping', 'SurfaceLeveling',
      // Tecniche Moderne
      'MinimumTillage', 'StripTillage', 'NoTill'
    ]
    const canopyWorks: WorkType[] = ['FormativePruning', 'MaintenancePruning', 'RejuvenationPruning', 'SummerPruning', 'WinterPruning', 'Thinning', 'Suckering', 'Defoliation', 'Tying', 'OliveShredding', 'RunnerManagement', 'StrawberryMulching', 'StrawberryCleaning', 'CaneRemoval', 'TipPruning', 'RaspberryTying', 'SuckerThinning', 'FruitBagging', 'ExoticThinning', 'Shredding']
    
    if (soilWorks.includes(type)) return 'Soil'
    if (canopyWorks.includes(type)) return 'Canopy'
    return 'General'
  }

  // Translation functions
  const translateWorkType = (type: WorkType): string => {
    const translations: Record<WorkType, string> = {
      // Suolo (esistenti)
      'Plowing': 'Aratura',
      'Subsoiling': 'Ripuntatura / Subsolatura',
      'Harrowing': 'Erpicatura / Frangizzolatura',
      'Tilling': 'Fresatura',
      'Rolling': 'Livellamento / Rullatura',
      'Hoeing': 'Sarchiatura',
      'EarthingUp': 'Rincalzatura',
      'Mulching': 'Pacciamatura',
      'PostSowingRolling': 'Rullatura Post-Semina',
      // Preparazione Terreno (nuove)
      'Clearing': 'Disboscamento',
      'Stumping': 'Estirpazione Ceppi',
      'StoneRemoval': 'Rimozione Pietre',
      'Leveling': 'Livellamento',
      'DeepSubsoiling': 'Ripuntatura Profonda',
      'Digging': 'Scavo',
      'DeepHarrowing': 'Erpicatura Profonda',
      'Crumbling': 'Frangizzolatura',
      'Scraping': 'Raschiamento',
      'SurfaceLeveling': 'Livellamento Superficie',
      // Tecniche Moderne
      'MinimumTillage': 'Lavorazione Minima',
      'StripTillage': 'Lavorazione a Strisce',
      'NoTill': 'No-Till',
      // Chioma
      'FormativePruning': 'Potatura di Formazione',
      'MaintenancePruning': 'Potatura di Produzione',
      'RejuvenationPruning': 'Potatura di Ringiovanimento',
      'SummerPruning': 'Potatura Verde',
      'WinterPruning': 'Potatura Secca (Guyot/Cordone)',
      'Thinning': 'Diradamento Frutti',
      'Suckering': 'Potatura Verde / Scacchiatura',
      'Defoliation': 'Defogliazione',
      'Tying': 'Legatura / Palizzamento',
      'OliveShredding': 'Trinciatura Residui',
      'RunnerManagement': 'Gestione Stoloni (Runners)',
      'StrawberryMulching': 'Pacciamatura ai Filari',
      'StrawberryCleaning': 'Pulizia Foglie e Frutti',
      'CaneRemoval': 'Potatura Canne Vecchie',
      'TipPruning': 'Tip-Pruning / Cimatura',
      'RaspberryTying': 'Legatura a Fili',
      'SuckerThinning': 'Diradamento Polloni',
      'FruitBagging': 'Insacchettamento Frutti',
      'ExoticThinning': 'Diradamento Frutticini',
      'Shredding': 'Trinciatura Inerbimento',
      // Generale
      'Topping': 'Cimatura',
      'Pruning': 'Potatura'
    }
    return translations[type] || type
  }

  const translateEquipmentType = (type?: EquipmentType): string => {
    if (!type) return '-'
    const translations: Record<EquipmentType, string> = {
      // Trattore e attrezzi trattore
      'Tractor': 'Trattore',
      'RotaryHarrow': 'Erpice Rotante',
      'Shredder': 'Trincia',
      'FertilizerSpreader': 'Spandiconcime',
      'Seeder': 'Seminatrice',
      'Topper': 'Cimatrice',
      'Defoliator': 'Defogliatrice',
      'PrePruner': 'Pre-potatrice',
      'Thinner': 'Diradatrice Meccanica',
      // Piccoli mezzi
      'Rototiller': 'Motozappa',
      'Cultivator': 'Motocoltivatore',
      'Mower': 'Motofalciatrice',
      'BrushCutter': 'Decespugliatore',
      'TrackedCart': 'Motocarriola',
      'BackpackSprayer': 'Atomizzatore a spalla',
      // Attrezzi elettrificati
      'ElectricTier': 'Legatrice Elettrica',
      'ElectricPruner': 'Forbice Elettrica',
      'TelescopicPruner': 'Svettatoio Telescopico',
      // Manuale
      'Manual': 'Manuale'
    }
    return translations[type] || type
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 max-w-7xl mx-auto">
      <ProFeatureGate
        feature="mechanical-work-register"
        title="Registro Lavorazioni Meccaniche"
        description="Registra e gestisci arature e fresature per terreni più grandi"
        requiredTier="PRO"
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
              {/* Selettore Orto */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Orto/Giardino *
                </label>
                <select
                  required
                  value={selectedGardenId}
                  onChange={(e) => setSelectedGardenId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Seleziona orto...</option>
                  {gardens.map(garden => (
                    <option key={garden.id} value={garden.id}>
                      {garden.name} ({garden.type || 'outdoor'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Selettori Micro-Zone (se disponibili) */}
              {selectedGardenId && beds.length > 0 && (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <MapPin size={18} className="text-blue-600" />
                    Dove (opzionale)
                  </h3>

                  {/* Bed selector */}
                  <div className="mb-3">
                    <label className="text-xs font-semibold text-gray-700 mb-2 block">
                      Aiuola/Letto
                    </label>
                    <select
                      value={selectedBedId}
                      onChange={(e) => setSelectedBedId(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Tutto l'orto</option>
                      {beds.map(bed => (
                        <option key={bed.id} value={bed.id}>{bed.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Row selector */}
                  {rows.length > 0 && selectedBedId && (
                    <div>
                      <label className="text-xs font-semibold text-gray-700 mb-2 block">
                        Fila/Filare
                      </label>
                      <select
                        value={selectedRowId}
                        onChange={(e) => setSelectedRowId(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Tutta l'aiuola</option>
                        {rows.filter(row => row.bedId === selectedBedId).map(row => (
                          <option key={row.id} value={row.id}>{row.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Campo Coltura (opzionale) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Coltura (opzionale)
                  </label>
                  <select
                    value={selectedCropId}
                    onChange={(e) => setSelectedCropId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Nessuna coltura specifica</option>
                    {cropMechanicalWorksConfig.map(crop => (
                      <option key={crop.cropId} value={crop.cropId}>
                        {crop.cropName}
                      </option>
                    ))}
                  </select>
                  {selectedCropId && suggestedWorks.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      {suggestedWorks.length} lavorazione{suggestedWorks.length !== 1 ? 'i' : ''} suggerita{suggestedWorks.length !== 1 ? 'e' : ''} per questa coltura
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo Lavorazione *
                  </label>
                  {!selectedGardenId ? (
                    <div className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm">
                      Seleziona prima un orto
                    </div>
                  ) : (
                    <select
                      required
                      value={formData.work_type || getAvailableWorkTypes()[0]}
                      onChange={(e) => {
                        const newWorkType = e.target.value as WorkType
                        const category = getWorkCategory(newWorkType)
                        setFormData({
                          ...formData,
                          work_type: newWorkType,
                          work_metadata: {
                            ...formData.work_metadata,
                            category,
                            cropId: selectedCropId || undefined,
                            cropName: selectedCropId ? cropMechanicalWorksConfig.find(c => c.cropId === selectedCropId)?.cropName : undefined
                          }
                        })
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    >
                      {getAvailableWorkTypes().includes('Plowing' as WorkType) && (
                        <optgroup label="Suolo">
                          <option value="Plowing">Aratura</option>
                          <option value="Subsoiling">Ripuntatura / Subsolatura</option>
                          <option value="Harrowing">Erpicatura / Frangizzolatura</option>
                          <option value="Tilling">Fresatura</option>
                          <option value="Rolling">Livellamento / Rullatura</option>
                          <option value="Hoeing">Sarchiatura</option>
                          <option value="EarthingUp">Rincalzatura</option>
                          <option value="Mulching">Pacciamatura</option>
                          <option value="PostSowingRolling">Rullatura Post-Semina</option>
                        </optgroup>
                      )}
                      {getAvailableWorkTypes().includes('Clearing' as WorkType) && (
                        <optgroup label="Preparazione Terreno">
                          <option value="Clearing">Disboscamento</option>
                          <option value="Stumping">Estirpazione Ceppi</option>
                          <option value="StoneRemoval">Rimozione Pietre</option>
                          <option value="Leveling">Livellamento</option>
                          <option value="DeepSubsoiling">Ripuntatura Profonda</option>
                          <option value="Digging">Scavo</option>
                          <option value="DeepHarrowing">Erpicatura Profonda</option>
                          <option value="Crumbling">Frangizzolatura</option>
                          <option value="Scraping">Raschiamento</option>
                          <option value="SurfaceLeveling">Livellamento Superficie</option>
                        </optgroup>
                      )}
                      {getAvailableWorkTypes().includes('MinimumTillage' as WorkType) && (
                        <optgroup label="Tecniche Moderne">
                          <option value="MinimumTillage">Lavorazione Minima</option>
                          <option value="StripTillage">Lavorazione a Strisce</option>
                          <option value="NoTill">No-Till</option>
                        </optgroup>
                      )}
                      <optgroup label="Chioma">
                        <option value="FormativePruning">Potatura di Formazione</option>
                        <option value="MaintenancePruning">Potatura di Produzione</option>
                        <option value="RejuvenationPruning">Potatura di Ringiovanimento</option>
                        <option value="SummerPruning">Potatura Verde</option>
                        <option value="WinterPruning">Potatura Secca (Guyot/Cordone)</option>
                        <option value="Thinning">Diradamento Frutti</option>
                        <option value="Suckering">Potatura Verde / Scacchiatura</option>
                        <option value="Defoliation">Defogliazione</option>
                        <option value="Tying">Legatura / Palizzamento</option>
                        <option value="OliveShredding">Trinciatura Residui</option>
                        <option value="RunnerManagement">Gestione Stoloni (Runners)</option>
                        <option value="StrawberryMulching">Pacciamatura ai Filari</option>
                        <option value="StrawberryCleaning">Pulizia Foglie e Frutti</option>
                        <option value="CaneRemoval">Potatura Canne Vecchie</option>
                        <option value="TipPruning">Tip-Pruning / Cimatura</option>
                        <option value="RaspberryTying">Legatura a Fili</option>
                        <option value="SuckerThinning">Diradamento Polloni</option>
                        <option value="FruitBagging">Insacchettamento Frutti</option>
                        <option value="ExoticThinning">Diradamento Frutticini</option>
                        <option value="Shredding">Trinciatura Inerbimento</option>
                      </optgroup>
                      <optgroup label="Generale">
                        <option value="Topping">Cimatura</option>
                        <option value="Pruning">Potatura</option>
                      </optgroup>
                    </select>
                  )}
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
                    onChange={(e) => setFormData({ ...formData, equipment_type: e.target.value as EquipmentType, equipment_attachment: e.target.value === 'Tractor' ? formData.equipment_attachment : '' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <optgroup label="Trattore e Attrezzi">
                      <option value="Tractor">Trattore</option>
                      <option value="RotaryHarrow">Erpice Rotante</option>
                      <option value="Shredder">Trincia</option>
                      <option value="FertilizerSpreader">Spandiconcime</option>
                      <option value="Seeder">Seminatrice</option>
                      <option value="Topper">Cimatrice</option>
                      <option value="Defoliator">Defogliatrice</option>
                      <option value="PrePruner">Pre-potatrice</option>
                      <option value="Thinner">Diradatrice Meccanica</option>
                    </optgroup>
                    <optgroup label="Piccoli Mezzi">
                      <option value="Rototiller">Motozappa</option>
                      <option value="Cultivator">Motocoltivatore</option>
                      <option value="Mower">Motofalciatrice</option>
                      <option value="BrushCutter">Decespugliatore</option>
                      <option value="TrackedCart">Motocarriola</option>
                      <option value="BackpackSprayer">Atomizzatore a spalla</option>
                    </optgroup>
                    <optgroup label="Attrezzi Manuali Elettrificati">
                      <option value="ElectricTier">Legatrice Elettrica</option>
                      <option value="ElectricPruner">Forbice Elettrica</option>
                      <option value="TelescopicPruner">Svettatoio Telescopico</option>
                    </optgroup>
                    <optgroup label="Manuale">
                      <option value="Manual">Manuale</option>
                    </optgroup>
                  </select>
                </div>
                
                {formData.equipment_type === 'Tractor' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Attrezzo Specifico
                    </label>
                    <input
                      type="text"
                      value={formData.equipment_attachment || ''}
                      onChange={(e) => setFormData({ ...formData, equipment_attachment: e.target.value })}
                      placeholder="es. Aratro, Fresa, Erpice..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                )}

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
                        <div className="flex flex-col gap-1">
                          <span className={`px-2 py-1 rounded text-xs inline-block ${
                            getWorkCategory(work.work_type) === 'Soil'
                              ? 'bg-blue-100 text-blue-800'
                              : getWorkCategory(work.work_type) === 'Canopy'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {translateWorkType(work.work_type)}
                          </span>
                          {work.work_metadata?.category && (
                            <span className="text-xs text-gray-500">
                              {work.work_metadata.category === 'Soil' ? 'Suolo' : 
                               work.work_metadata.category === 'Canopy' ? 'Chioma' : 'Generale'}
                              {work.work_metadata.cropName && ` • ${work.work_metadata.cropName}`}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {work.area_m2} m²
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {work.depth_cm ? `${work.depth_cm} cm` : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                          {translateEquipmentType(work.equipment_type)}
                          {work.equipment_attachment && ` - ${work.equipment_attachment}`}
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





