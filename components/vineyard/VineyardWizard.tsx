'use client'

import React, { useState, useEffect } from 'react'
import { VineyardWizardData, VineyardType, VineyardTrainingSystem, VarietyInfo, RootstockInfo } from '@/types/vineyard'
import { vineyardService } from '@/services/vineyardService'
import { 
  Grape, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Plus, 
  Trash2, 
  Upload,
  MapPin,
  Calendar,
  Ruler,
  Sprout,
  Settings,
  AlertCircle,
  Info,
  Wine,
  X
} from 'lucide-react'

interface VineyardWizardProps {
  gardenId: string
  onComplete: (vineyardId: string) => void
  onCancel: () => void
}

export default function VineyardWizard({ gardenId, onComplete, onCancel }: VineyardWizardProps) {
  const [wizardData, setWizardData] = useState<VineyardWizardData>({
    step: 1,
    totalSteps: 5,
    basicInfo: {
      gardenId,
      name: '',
      vineyardType: 'wine'
    },
    layout: {
      rowSpacingM: 2.5,
      vineSpacingM: 1.2,
      trainingSystem: 'guyot'
    },
    varieties: {
      mainVarieties: [],
      rootstockTypes: []
    },
    vines: {
      plantingMethod: 'manual',
      vineData: []
    },
    management: {
      organicCertified: false,
      precisionManagement: false
    }
  })

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const vineyardTypes: { value: VineyardType; label: string; icon: string }[] = [
    { value: 'wine', label: 'Da Vino', icon: '🍷' },
    { value: 'table', label: 'Da Tavola', icon: '🍇' },
    { value: 'raisin', label: 'Da Uva Passa', icon: '🫐' },
    { value: 'mixed', label: 'Misto', icon: '🍾' }
  ]

  const trainingSystemOptions: Array<{ value: VineyardTrainingSystem; label: string; description: string }> = [
    { value: 'guyot', label: 'Guyot', description: 'Sistema tradizionale con tralcio a frutto' },
    { value: 'cordon', label: 'Cordone Speronato', description: 'Branche permanenti con speroni' },
    { value: 'pergola', label: 'Pergola', description: 'Sistema tradizionale a pergolato' },
    { value: 'sylvoz', label: 'Sylvoz', description: 'Sistema meccanizzabile' },
    { value: 'tendone', label: 'Tendone', description: 'Per uve da tavola' }
  ]

  const commonVarieties = [
    // Vini rossi
    { name: 'Sangiovese', type: 'red', region: 'Toscana' },
    { name: 'Nebbiolo', type: 'red', region: 'Piemonte' },
    { name: 'Montepulciano', type: 'red', region: 'Abruzzo' },
    { name: 'Primitivo', type: 'red', region: 'Puglia' },
    { name: 'Barbera', type: 'red', region: 'Piemonte' },
    { name: 'Dolcetto', type: 'red', region: 'Piemonte' },
    { name: 'Aglianico', type: 'red', region: 'Campania' },
    // Vini bianchi
    { name: 'Pinot Grigio', type: 'white', region: 'Veneto' },
    { name: 'Trebbiano', type: 'white', region: 'Centro Italia' },
    { name: 'Vermentino', type: 'white', region: 'Sardegna' },
    { name: 'Falanghina', type: 'white', region: 'Campania' },
    { name: 'Fiano', type: 'white', region: 'Campania' },
    { name: 'Greco', type: 'white', region: 'Campania' },
    // Uve da tavola
    { name: 'Italia', type: 'table', region: 'Puglia' },
    { name: 'Red Globe', type: 'table', region: 'Sicilia' },
    { name: 'Victoria', type: 'table', region: 'Puglia' }
  ]

  const commonRootstocks = [
    { name: '1103P', vigor: 'high', soilType: 'Calcareo, siccitoso' },
    { name: '110R', vigor: 'high', soilType: 'Calcareo, argilloso' },
    { name: 'SO4', vigor: 'medium', soilType: 'Acido, fertile' },
    { name: '5BB', vigor: 'medium', soilType: 'Calcareo, umido' },
    { name: '420A', vigor: 'low', soilType: 'Calcareo, secco' },
    { name: '161-49C', vigor: 'medium', soilType: 'Calcareo, fertile' }
  ]

  const nextStep = () => {
    if (validateCurrentStep()) {
      setWizardData(prev => ({ ...prev, step: prev.step + 1 }))
      setErrors({})
    }
  }

  const prevStep = () => {
    setWizardData(prev => ({ ...prev, step: prev.step - 1 }))
    setErrors({})
  }

  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {}

    switch (wizardData.step) {
      case 1:
        if (!wizardData.basicInfo?.name?.trim()) {
          newErrors.name = 'Nome vigneto richiesto'
        }
        if (!wizardData.basicInfo?.vineyardType) {
          newErrors.vineyardType = 'Tipo vigneto richiesto'
        }
        break
      case 2:
        if (!wizardData.layout?.rowSpacingM || wizardData.layout.rowSpacingM <= 0) {
          newErrors.rowSpacing = 'Distanza tra filari richiesta'
        }
        if (!wizardData.layout?.vineSpacingM || wizardData.layout.vineSpacingM <= 0) {
          newErrors.vineSpacing = 'Distanza tra viti richiesta'
        }
        break
      case 3:
        if (!wizardData.varieties?.mainVarieties?.length) {
          newErrors.varieties = 'Almeno una varietà richiesta'
        }
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const addVariety = () => {
    const newVariety: VarietyInfo = {
      variety: '',
      percentage: 0,
      wineStyle: 'red'
    }
    setWizardData(prev => ({
      ...prev,
      varieties: {
        ...prev.varieties!,
        mainVarieties: [...(prev.varieties?.mainVarieties || []), newVariety]
      }
    }))
  }

  const updateVariety = (index: number, field: keyof VarietyInfo, value: any) => {
    setWizardData(prev => ({
      ...prev,
      varieties: {
        ...prev.varieties!,
        mainVarieties: prev.varieties!.mainVarieties.map((variety, i) =>
          i === index ? { ...variety, [field]: value } : variety
        )
      }
    }))
  }

  const removeVariety = (index: number) => {
    setWizardData(prev => ({
      ...prev,
      varieties: {
        ...prev.varieties!,
        mainVarieties: prev.varieties!.mainVarieties.filter((_, i) => i !== index)
      }
    }))
  }

  const addRootstock = () => {
    const newRootstock: RootstockInfo = {
      rootstock: '',
      percentage: 0,
      characteristics: [],
      soilAdaptation: [],
      vigorControl: 'standard',
      phylloxeraResistance: true
    }
    setWizardData(prev => ({
      ...prev,
      varieties: {
        ...prev.varieties!,
        rootstockTypes: [...(prev.varieties?.rootstockTypes || []), newRootstock]
      }
    }))
  }

  const updateRootstock = (index: number, field: keyof RootstockInfo, value: any) => {
    setWizardData(prev => ({
      ...prev,
      varieties: {
        ...prev.varieties!,
        rootstockTypes: prev.varieties!.rootstockTypes.map((rootstock, i) =>
          i === index ? { ...rootstock, [field]: value } : rootstock
        )
      }
    }))
  }

  const removeRootstock = (index: number) => {
    setWizardData(prev => ({
      ...prev,
      varieties: {
        ...prev.varieties!,
        rootstockTypes: prev.varieties!.rootstockTypes.filter((_, i) => i !== index)
      }
    }))
  }

  const handleComplete = async () => {
    try {
      setLoading(true)
      const vineyard = await vineyardService.createVineyardFromWizard(wizardData)
      onComplete(vineyard.id)
    } catch (error) {
      console.error('Error creating vineyard:', error)
      setErrors({ general: 'Errore durante la creazione del vigneto' })
    } finally {
      setLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (wizardData.step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6 sm:mb-8">
              <Grape className="mx-auto text-purple-600 mb-4" size={48} />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Informazioni Base</h2>
              <p className="text-gray-600 text-sm sm:text-base">Configura le informazioni principali del tuo vigneto</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome Vigneto *
              </label>
              <input
                type="text"
                value={wizardData.basicInfo?.name || ''}
                onChange={(e) => setWizardData(prev => ({
                  ...prev,
                  basicInfo: { ...prev.basicInfo!, name: e.target.value }
                }))}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 min-h-[44px] touch-manipulation"
                placeholder="es. Vigneto del Sole"
                style={{ fontSize: '16px' }} // Prevent iOS zoom
              />
              {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrizione
              </label>
              <textarea
                value={wizardData.basicInfo?.description || ''}
                onChange={(e) => setWizardData(prev => ({
                  ...prev,
                  basicInfo: { ...prev.basicInfo!, description: e.target.value }
                }))}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 min-h-[44px] touch-manipulation"
                rows={3}
                placeholder="Descrizione del vigneto..."
                style={{ fontSize: '16px' }} // Prevent iOS zoom
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Tipo di Vigneto *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {vineyardTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setWizardData(prev => ({
                      ...prev,
                      basicInfo: { ...prev.basicInfo!, vineyardType: type.value }
                    }))}
                    className={`p-3 sm:p-4 border-2 rounded-lg text-left transition-colors min-h-[60px] touch-manipulation ${
                      wizardData.basicInfo?.vineyardType === type.value
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl sm:text-2xl">{type.icon}</span>
                      <span className="font-medium text-sm sm:text-base">{type.label}</span>
                    </div>
                  </button>
                ))}
              </div>
              {errors.vineyardType && <p className="text-red-600 text-sm mt-1">{errors.vineyardType}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data di Impianto
                </label>
                <input
                  type="date"
                  value={wizardData.basicInfo?.establishedDate || ''}
                  onChange={(e) => setWizardData(prev => ({
                    ...prev,
                    basicInfo: { ...prev.basicInfo!, establishedDate: e.target.value }
                  }))}
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 min-h-[44px] touch-manipulation"
                  style={{ fontSize: '16px' }} // Prevent iOS zoom
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Superficie (m²)
                </label>
                <input
                  type="number"
                  value={wizardData.basicInfo?.totalAreaSqm || ''}
                  onChange={(e) => setWizardData(prev => ({
                    ...prev,
                    basicInfo: { ...prev.basicInfo!, totalAreaSqm: parseFloat(e.target.value) || undefined }
                  }))}
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 min-h-[44px] touch-manipulation"
                  placeholder="10000"
                  inputMode="numeric"
                  style={{ fontSize: '16px' }} // Prevent iOS zoom
                />
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6 sm:mb-8">
              <Ruler className="mx-auto text-purple-600 mb-4" size={48} />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Layout e Design</h2>
              <p className="text-gray-600 text-sm sm:text-base">Configura la disposizione e il sistema di allevamento</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Distanza tra Filari (m) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={wizardData.layout?.rowSpacingM || ''}
                  onChange={(e) => setWizardData(prev => ({
                    ...prev,
                    layout: { ...prev.layout!, rowSpacingM: parseFloat(e.target.value) || 0 }
                  }))}
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 min-h-[44px] touch-manipulation"
                  placeholder="2.5"
                  inputMode="decimal"
                  style={{ fontSize: '16px' }} // Prevent iOS zoom
                />
                {errors.rowSpacing && <p className="text-red-600 text-sm mt-1">{errors.rowSpacing}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Distanza tra Viti (m) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={wizardData.layout?.vineSpacingM || ''}
                  onChange={(e) => setWizardData(prev => ({
                    ...prev,
                    layout: { ...prev.layout!, vineSpacingM: parseFloat(e.target.value) || 0 }
                  }))}
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 min-h-[44px] touch-manipulation"
                  placeholder="1.2"
                  inputMode="decimal"
                  style={{ fontSize: '16px' }} // Prevent iOS zoom
                />
                {errors.vineSpacing && <p className="text-red-600 text-sm mt-1">{errors.vineSpacing}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Sistema di Allevamento
              </label>
              <div className="space-y-3">
                {trainingSystemOptions.map((system) => (
                  <button
                    key={system.value}
                    type="button"
                    onClick={() => setWizardData(prev => ({
                      ...prev,
                      layout: { ...prev.layout!, trainingSystem: system.value }
                    }))}
                    className={`w-full p-3 sm:p-4 border-2 rounded-lg text-left transition-colors min-h-[60px] touch-manipulation ${
                      wizardData.layout?.trainingSystem === system.value
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900 text-sm sm:text-base">{system.label}</div>
                    <div className="text-xs sm:text-sm text-gray-600 mt-1">{system.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sistema di Irrigazione
              </label>
              <select
                value={wizardData.layout?.irrigationSystem || ''}
                onChange={(e) => setWizardData(prev => ({
                  ...prev,
                  layout: { ...prev.layout!, irrigationSystem: e.target.value }
                }))}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 min-h-[44px] touch-manipulation"
                style={{ fontSize: '16px' }} // Prevent iOS zoom
              >
                <option value="">Seleziona sistema</option>
                <option value="drip">Goccia</option>
                <option value="sprinkler">Aspersione</option>
                <option value="micro_sprinkler">Micro-aspersione</option>
                <option value="flood">Scorrimento</option>
                <option value="none">Nessuno (asciutto)</option>
              </select>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6 sm:mb-8">
              <Sprout className="mx-auto text-purple-600 mb-4" size={48} />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Varietà e Portinnesti</h2>
              <p className="text-gray-600 text-sm sm:text-base">Configura le varietà di uva e i portinnesti</p>
            </div>

            {/* Varietà */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
                <h3 className="text-lg font-semibold text-gray-900">Varietà di Uva *</h3>
                <button
                  type="button"
                  onClick={addVariety}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 min-h-[44px] touch-manipulation"
                >
                  <Plus size={20} />
                  Aggiungi Varietà
                </button>
              </div>

              {wizardData.varieties?.mainVarieties?.map((variety, index) => (
                <div key={index} className="p-3 sm:p-4 border border-gray-200 rounded-lg mb-3">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Varietà
                        </label>
                        <select
                          value={variety.variety}
                          onChange={(e) => updateVariety(index, 'variety', e.target.value)}
                          className="w-full px-3 py-3 text-base border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 min-h-[44px] touch-manipulation"
                          style={{ fontSize: '16px' }} // Prevent iOS zoom
                        >
                          <option value="">Seleziona varietà</option>
                          {commonVarieties.map((v) => (
                            <option key={v.name} value={v.name}>
                              {v.name} ({v.type === 'red' ? 'Rosso' : v.type === 'white' ? 'Bianco' : 'Tavola'})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Percentuale (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={variety.percentage}
                          onChange={(e) => updateVariety(index, 'percentage', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-3 text-base border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 min-h-[44px] touch-manipulation"
                          inputMode="numeric"
                          style={{ fontSize: '16px' }} // Prevent iOS zoom
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeVariety(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded min-h-[44px] min-w-[44px] touch-manipulation"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {errors.varieties && <p className="text-red-600 text-sm">{errors.varieties}</p>}
            </div>

            {/* Portinnesti */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
                <h3 className="text-lg font-semibold text-gray-900">Portinnesti</h3>
                <button
                  type="button"
                  onClick={addRootstock}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 min-h-[44px] touch-manipulation"
                >
                  <Plus size={20} />
                  Aggiungi Portinnesto
                </button>
              </div>

              {wizardData.varieties?.rootstockTypes?.map((rootstock, index) => (
                <div key={index} className="p-3 sm:p-4 border border-gray-200 rounded-lg mb-3">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Portinnesto
                        </label>
                        <select
                          value={rootstock.rootstock}
                          onChange={(e) => updateRootstock(index, 'rootstock', e.target.value)}
                          className="w-full px-3 py-3 text-base border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 min-h-[44px] touch-manipulation"
                          style={{ fontSize: '16px' }} // Prevent iOS zoom
                        >
                          <option value="">Seleziona portinnesto</option>
                          {commonRootstocks.map((r) => (
                            <option key={r.name} value={r.name}>
                              {r.name} - {r.soilType}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Percentuale (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={rootstock.percentage}
                          onChange={(e) => updateRootstock(index, 'percentage', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-3 text-base border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 min-h-[44px] touch-manipulation"
                          inputMode="numeric"
                          style={{ fontSize: '16px' }} // Prevent iOS zoom
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeRootstock(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded min-h-[44px] min-w-[44px] touch-manipulation"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6 sm:mb-8">
              <MapPin className="mx-auto text-purple-600 mb-4" size={48} />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Impianto Viti</h2>
              <p className="text-gray-600 text-sm sm:text-base">Configura il metodo di registrazione delle viti</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Metodo di Registrazione
                </label>
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setWizardData(prev => ({
                      ...prev,
                      vines: { ...prev.vines!, plantingMethod: 'manual' }
                    }))}
                    className={`w-full p-3 sm:p-4 border-2 rounded-lg text-left transition-colors min-h-[60px] touch-manipulation ${
                      wizardData.vines?.plantingMethod === 'manual'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900 text-sm sm:text-base">Registrazione Manuale</div>
                    <div className="text-xs sm:text-sm text-gray-600 mt-1">
                      Registra le viti una per una durante l'utilizzo dell'app
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setWizardData(prev => ({
                      ...prev,
                      vines: { ...prev.vines!, plantingMethod: 'bulk' }
                    }))}
                    className={`w-full p-3 sm:p-4 border-2 rounded-lg text-left transition-colors min-h-[60px] touch-manipulation ${
                      wizardData.vines?.plantingMethod === 'bulk'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900 text-sm sm:text-base">Creazione in Blocco</div>
                    <div className="text-xs sm:text-sm text-gray-600 mt-1">
                      Crea automaticamente le viti basandosi sul layout del vigneto
                    </div>
                  </button>
                </div>
              </div>

              {wizardData.vines?.plantingMethod === 'bulk' && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Info className="text-blue-600 flex-shrink-0 mt-1" size={20} />
                    <div>
                      <h4 className="font-medium text-blue-900 mb-2 text-sm sm:text-base">Creazione Automatica</h4>
                      <p className="text-xs sm:text-sm text-blue-800 mb-3">
                        Le viti verranno create automaticamente basandosi sui parametri del layout:
                      </p>
                      <ul className="text-xs sm:text-sm text-blue-800 space-y-1">
                        <li>• Distanza tra filari: {wizardData.layout?.rowSpacingM}m</li>
                        <li>• Distanza tra viti: {wizardData.layout?.vineSpacingM}m</li>
                        <li>• Superficie: {wizardData.basicInfo?.totalAreaSqm}m²</li>
                        <li>• Viti stimate: {wizardData.basicInfo?.totalAreaSqm && wizardData.layout?.rowSpacingM && wizardData.layout?.vineSpacingM 
                          ? Math.floor(wizardData.basicInfo.totalAreaSqm / (wizardData.layout.rowSpacingM * wizardData.layout.vineSpacingM))
                          : 'N/A'}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Settings className="mx-auto text-purple-600 mb-4" size={48} />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Impostazioni di Gestione</h2>
              <p className="text-gray-600">Configura le opzioni avanzate di gestione</p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Certificazione Biologica</h3>
                  <p className="text-sm text-gray-600">Il vigneto è certificato biologico</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={wizardData.management?.organicCertified || false}
                    onChange={(e) => setWizardData(prev => ({
                      ...prev,
                      management: { ...prev.management!, organicCertified: e.target.checked }
                    }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Gestione di Precisione</h3>
                  <p className="text-sm text-gray-600">Abilita funzionalità avanzate di monitoraggio</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={wizardData.management?.precisionManagement || false}
                    onChange={(e) => setWizardData(prev => ({
                      ...prev,
                      management: { ...prev.management!, precisionManagement: e.target.checked }
                    }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zona Climatica
                  </label>
                  <select
                    value={wizardData.management?.climateZone || ''}
                    onChange={(e) => setWizardData(prev => ({
                      ...prev,
                      management: { ...prev.management!, climateZone: e.target.value }
                    }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Seleziona zona</option>
                    <option value="mediterranean">Mediterranea</option>
                    <option value="continental">Continentale</option>
                    <option value="alpine">Alpina</option>
                    <option value="coastal">Costiera</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo di Suolo
                  </label>
                  <select
                    value={wizardData.management?.soilType || ''}
                    onChange={(e) => setWizardData(prev => ({
                      ...prev,
                      management: { ...prev.management!, soilType: e.target.value }
                    }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Seleziona tipo</option>
                    <option value="clay">Argilloso</option>
                    <option value="sandy">Sabbioso</option>
                    <option value="loamy">Franco</option>
                    <option value="calcareous">Calcareo</option>
                    <option value="volcanic">Vulcanico</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Riepilogo */}
            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Riepilogo Configurazione</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Nome:</span>{' '}
                  <span className="font-medium">{wizardData.basicInfo?.name}</span>
                </div>
                <div>
                  <span className="text-gray-600">Tipo:</span>{' '}
                  <span className="font-medium">
                    {vineyardTypes.find(t => t.value === wizardData.basicInfo?.vineyardType)?.label}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Superficie:</span>{' '}
                  <span className="font-medium">{wizardData.basicInfo?.totalAreaSqm || 'N/A'} m²</span>
                </div>
                <div>
                  <span className="text-gray-600">Sistema:</span>{' '}
                  <span className="font-medium">
                    {trainingSystemOptions.find(s => s.value === wizardData.layout?.trainingSystem)?.label}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Varietà:</span>{' '}
                  <span className="font-medium">{wizardData.varieties?.mainVarieties?.length || 0}</span>
                </div>
                <div>
                  <span className="text-gray-600">Biologico:</span>{' '}
                  <span className="font-medium">{wizardData.management?.organicCertified ? 'Sì' : 'No'}</span>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-2 sm:p-4">
      <div className="bg-white rounded-lg sm:rounded-2xl shadow-2xl w-full max-w-[95vw] sm:max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wine className="text-purple-600" size={24} />
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">Nuovo Vigneto</h1>
            </div>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Chiudi"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 mb-2">
              <span>Passo {wizardData.step} di {wizardData.totalSteps}</span>
              <span>{Math.round((wizardData.step / wizardData.totalSteps) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(wizardData.step / wizardData.totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {renderStepContent()}
          
          {errors.general && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle size={16} />
                <span className="text-sm">{errors.general}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-4 sm:p-6 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 sm:items-center sm:justify-between">
            <button
              onClick={prevStep}
              disabled={wizardData.step === 1}
              className="flex items-center justify-center gap-2 px-4 py-3 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] touch-manipulation order-2 sm:order-1"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">Indietro</span>
            </button>

            <div className="flex items-center gap-3 order-1 sm:order-2">
              {wizardData.step < wizardData.totalSteps ? (
                <button
                  onClick={nextStep}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 min-h-[44px] touch-manipulation"
                >
                  Avanti
                  <ArrowRight size={20} />
                </button>
              ) : (
                <button
                  onClick={handleComplete}
                  disabled={loading}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 min-h-[44px] touch-manipulation"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Creazione...
                    </>
                  ) : (
                    <>
                      <Check size={20} />
                      Completa
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
