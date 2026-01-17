'use client'

import React, { useState, useEffect } from 'react'
import { OrchardWizardData, OrchardType, VarietyInfo, RootstockInfo } from '@/types/orchard'
import { orchardService } from '@/services/orchardService'
import { 
  TreePine, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Plus, 
  Trash2, 
  Upload,
  MapPin,
  Calendar,
  Ruler,
  Seedling,
  Settings,
  AlertCircle,
  Info
} from 'lucide-react'

interface OrchardWizardProps {
  gardenId: string
  onComplete: (orchardId: string) => void
  onCancel: () => void
}

export default function OrchardWizard({ gardenId, onComplete, onCancel }: OrchardWizardProps) {
  const [wizardData, setWizardData] = useState<OrchardWizardData>({
    step: 1,
    totalSteps: 5,
    basicInfo: {
      gardenId,
      name: '',
      orchardType: 'mixed'
    },
    layout: {
      rowSpacingM: 4.0,
      treeSpacingM: 3.0,
      trainingSystem: 'vase'
    },
    varieties: {
      mainVarieties: [],
      rootstockTypes: []
    },
    trees: {
      plantingMethod: 'manual',
      treeData: []
    },
    management: {
      organicCertified: false,
      precisionManagement: false
    }
  })

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const orchardTypes: { value: OrchardType; label: string; icon: string }[] = [
    { value: 'apple', label: 'Meleto', icon: '🍎' },
    { value: 'pear', label: 'Pereto', icon: '🍐' },
    { value: 'peach', label: 'Pescheto', icon: '🍑' },
    { value: 'cherry', label: 'Ceraseto', icon: '🍒' },
    { value: 'citrus', label: 'Agrumeto', icon: '🍊' },
    { value: 'olive', label: 'Oliveto', icon: '🫒' },
    { value: 'walnut', label: 'Noccioleto', icon: '🥜' },
    { value: 'mixed', label: 'Misto', icon: '🌳' }
  ]

  const trainingSystemOptions = [
    { value: 'vase', label: 'Vaso', description: 'Forma tradizionale aperta' },
    { value: 'central_leader', label: 'Fusetto', description: 'Asse centrale con branche' },
    { value: 'palmette', label: 'Palmetta', description: 'Forma appiattita per alta densità' },
    { value: 'espalier', label: 'Spalliera', description: 'Forma bidimensionale' },
    { value: 'bush', label: 'Cespuglio', description: 'Forma libera bassa' }
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
          newErrors.name = 'Nome frutteto richiesto'
        }
        if (!wizardData.basicInfo?.orchardType) {
          newErrors.orchardType = 'Tipo frutteto richiesto'
        }
        break
      case 2:
        if (!wizardData.layout?.rowSpacingM || wizardData.layout.rowSpacingM <= 0) {
          newErrors.rowSpacing = 'Distanza tra filari richiesta'
        }
        if (!wizardData.layout?.treeSpacingM || wizardData.layout.treeSpacingM <= 0) {
          newErrors.treeSpacing = 'Distanza tra piante richiesta'
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

  const handleComplete = async () => {
    try {
      setLoading(true)
      const orchard = await orchardService.createOrchardFromWizard(wizardData)
      onComplete(orchard.id)
    } catch (error) {
      console.error('Error creating orchard:', error)
      setErrors({ general: 'Errore nella creazione del frutteto' })
    } finally {
      setLoading(false)
    }
  }

  const addVariety = () => {
    const newVariety: VarietyInfo = {
      variety: '',
      percentage: 0,
      plantingDate: '',
      expectedYield: 0,
      harvestPeriod: '',
      notes: ''
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
      vigorControl: 'standard'
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

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {Array.from({ length: wizardData.totalSteps }, (_, i) => (
        <React.Fragment key={i}>
          <div className={`
            w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
            ${i + 1 < wizardData.step 
              ? 'bg-green-600 text-white' 
              : i + 1 === wizardData.step 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-600'
            }
          `}>
            {i + 1 < wizardData.step ? <Check size={16} /> : i + 1}
          </div>
          {i < wizardData.totalSteps - 1 && (
            <div className={`
              w-12 h-1 mx-2
              ${i + 1 < wizardData.step ? 'bg-green-600' : 'bg-gray-200'}
            `} />
          )}
        </React.Fragment>
      ))}
    </div>
  )

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <TreePine className="mx-auto text-green-600 mb-4" size={48} />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Informazioni Base</h2>
        <p className="text-gray-600">Iniziamo con le informazioni di base del tuo frutteto</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nome Frutteto *
        </label>
        <input
          type="text"
          value={wizardData.basicInfo?.name || ''}
          onChange={(e) => setWizardData(prev => ({
            ...prev,
            basicInfo: { ...prev.basicInfo!, name: e.target.value }
          }))}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="es. Frutteto Nord, Meleto Principale..."
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
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
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          rows={3}
          placeholder="Descrizione del frutteto, note particolari..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Tipo Frutteto *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {orchardTypes.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setWizardData(prev => ({
                ...prev,
                basicInfo: { ...prev.basicInfo!, orchardType: type.value }
              }))}
              className={`
                p-4 border-2 rounded-lg text-center transition-all
                ${wizardData.basicInfo?.orchardType === type.value
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <div className="text-2xl mb-2">{type.icon}</div>
              <div className="text-sm font-medium">{type.label}</div>
            </button>
          ))}
        </div>
        {errors.orchardType && <p className="text-red-500 text-sm mt-1">{errors.orchardType}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data Impianto
          </label>
          <input
            type="date"
            value={wizardData.basicInfo?.establishedDate || ''}
            onChange={(e) => setWizardData(prev => ({
              ...prev,
              basicInfo: { ...prev.basicInfo!, establishedDate: e.target.value }
            }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
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
              basicInfo: { ...prev.basicInfo!, totalAreaSqm: parseFloat(e.target.value) || 0 }
            }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            placeholder="0"
            min="0"
          />
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Ruler className="mx-auto text-blue-600 mb-4" size={48} />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Layout e Progettazione</h2>
        <p className="text-gray-600">Configura le distanze e il sistema di allevamento</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 ${
              errors.rowSpacing ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="4.0"
            min="0.1"
          />
          {errors.rowSpacing && <p className="text-red-500 text-sm mt-1">{errors.rowSpacing}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Distanza tra Piante (m) *
          </label>
          <input
            type="number"
            step="0.1"
            value={wizardData.layout?.treeSpacingM || ''}
            onChange={(e) => setWizardData(prev => ({
              ...prev,
              layout: { ...prev.layout!, treeSpacingM: parseFloat(e.target.value) || 0 }
            }))}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 ${
              errors.treeSpacing ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="3.0"
            min="0.1"
          />
          {errors.treeSpacing && <p className="text-red-500 text-sm mt-1">{errors.treeSpacing}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Sistema di Allevamento
        </label>
        <div className="space-y-3">
          {trainingSystemOptions.map((system) => (
            <label key={system.value} className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name="trainingSystem"
                value={system.value}
                checked={wizardData.layout?.trainingSystem === system.value}
                onChange={(e) => setWizardData(prev => ({
                  ...prev,
                  layout: { ...prev.layout!, trainingSystem: e.target.value }
                }))}
                className="mt-1"
              />
              <div>
                <div className="font-medium text-gray-900">{system.label}</div>
                <div className="text-sm text-gray-600">{system.description}</div>
              </div>
            </label>
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
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
        >
          <option value="">Seleziona sistema irrigazione</option>
          <option value="drip">Goccia</option>
          <option value="micro_sprinkler">Microirrigazione</option>
          <option value="sprinkler">Aspersione</option>
          <option value="flood">Scorrimento</option>
          <option value="none">Nessuno (asciutto)</option>
        </select>
      </div>

      {wizardData.layout?.rowSpacingM && wizardData.layout?.treeSpacingM && wizardData.basicInfo?.totalAreaSqm && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="text-blue-600 flex-shrink-0 mt-1" size={20} />
            <div>
              <h4 className="font-medium text-blue-900 mb-2">Calcolo Densità</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <div>
                  Piante per ettaro: <strong>
                    {Math.round(10000 / (wizardData.layout.rowSpacingM * wizardData.layout.treeSpacingM))}
                  </strong>
                </div>
                <div>
                  Piante totali stimate: <strong>
                    {Math.round((wizardData.basicInfo.totalAreaSqm / 10000) * (10000 / (wizardData.layout.rowSpacingM * wizardData.layout.treeSpacingM)))}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Seedling className="mx-auto text-green-600 mb-4" size={48} />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Varietà e Portinnesti</h2>
        <p className="text-gray-600">Configura le varietà e i portinnesti del frutteto</p>
      </div>

      {/* Varietà */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Varietà Principali</h3>
          <button
            type="button"
            onClick={addVariety}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus size={16} />
            Aggiungi Varietà
          </button>
        </div>

        {wizardData.varieties?.mainVarieties?.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <Seedling className="mx-auto text-gray-400 mb-2" size={32} />
            <p className="text-gray-600">Nessuna varietà aggiunta</p>
            <button
              type="button"
              onClick={addVariety}
              className="mt-2 text-green-600 hover:text-green-700"
            >
              Aggiungi la prima varietà
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {wizardData.varieties!.mainVarieties.map((variety, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">Varietà {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeVariety(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome Varietà *
                    </label>
                    <input
                      type="text"
                      value={variety.variety}
                      onChange={(e) => updateVariety(index, 'variety', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                      placeholder="es. Golden Delicious"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Percentuale (%)
                    </label>
                    <input
                      type="number"
                      value={variety.percentage}
                      onChange={(e) => updateVariety(index, 'percentage', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                      placeholder="0"
                      min="0"
                      max="100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Periodo Raccolta
                    </label>
                    <input
                      type="text"
                      value={variety.harvestPeriod || ''}
                      onChange={(e) => updateVariety(index, 'harvestPeriod', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                      placeholder="es. Settembre-Ottobre"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Resa Attesa (kg/pianta)
                    </label>
                    <input
                      type="number"
                      value={variety.expectedYield || ''}
                      onChange={(e) => updateVariety(index, 'expectedYield', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Note
                  </label>
                  <textarea
                    value={variety.notes || ''}
                    onChange={(e) => updateVariety(index, 'notes', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                    rows={2}
                    placeholder="Note sulla varietà..."
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {errors.varieties && <p className="text-red-500 text-sm mt-1">{errors.varieties}</p>}
      </div>

      {/* Portinnesti */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Portinnesti</h3>
          <button
            type="button"
            onClick={addRootstock}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={16} />
            Aggiungi Portinnesto
          </button>
        </div>

        {wizardData.varieties?.rootstockTypes?.length === 0 ? (
          <div className="text-center py-6 border border-gray-200 rounded-lg bg-gray-50">
            <p className="text-gray-600 text-sm">Nessun portinnesto specificato (opzionale)</p>
          </div>
        ) : (
          <div className="space-y-4">
            {wizardData.varieties!.rootstockTypes.map((rootstock, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 bg-blue-50">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">Portinnesto {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeRootstock(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome Portinnesto
                    </label>
                    <input
                      type="text"
                      value={rootstock.rootstock}
                      onChange={(e) => updateRootstock(index, 'rootstock', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      placeholder="es. M9, M26, Franco"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Percentuale (%)
                    </label>
                    <input
                      type="number"
                      value={rootstock.percentage}
                      onChange={(e) => updateRootstock(index, 'percentage', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                      min="0"
                      max="100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Controllo Vigoria
                    </label>
                    <select
                      value={rootstock.vigorControl}
                      onChange={(e) => updateRootstock(index, 'vigorControl', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="dwarfing">Nanizzante</option>
                      <option value="semi_dwarfing">Semi-nanizzante</option>
                      <option value="standard">Standard</option>
                      <option value="vigorous">Vigoroso</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <MapPin className="mx-auto text-purple-600 mb-4" size={48} />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Piantumazione Alberi</h2>
        <p className="text-gray-600">Scegli come aggiungere gli alberi al frutteto</p>
      </div>

      <div className="space-y-4">
        <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
          <input
            type="radio"
            name="plantingMethod"
            value="manual"
            checked={wizardData.trees?.plantingMethod === 'manual'}
            onChange={(e) => setWizardData(prev => ({
              ...prev,
              trees: { ...prev.trees!, plantingMethod: e.target.value as any }
            }))}
            className="mt-1"
          />
          <div>
            <div className="font-medium text-gray-900">Aggiunta Manuale</div>
            <div className="text-sm text-gray-600">Aggiungi gli alberi uno per uno dopo la creazione</div>
          </div>
        </label>

        <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
          <input
            type="radio"
            name="plantingMethod"
            value="bulk"
            checked={wizardData.trees?.plantingMethod === 'bulk'}
            onChange={(e) => setWizardData(prev => ({
              ...prev,
              trees: { ...prev.trees!, plantingMethod: e.target.value as any }
            }))}
            className="mt-1"
          />
          <div>
            <div className="font-medium text-gray-900">Creazione Automatica</div>
            <div className="text-sm text-gray-600">Genera automaticamente gli alberi basandosi sul layout</div>
          </div>
        </label>

        <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer opacity-50">
          <input
            type="radio"
            name="plantingMethod"
            value="import"
            disabled
            className="mt-1"
          />
          <div>
            <div className="font-medium text-gray-900">Importazione da File</div>
            <div className="text-sm text-gray-600">Importa da file CSV/Excel (disponibile prossimamente)</div>
          </div>
        </label>
      </div>

      {wizardData.trees?.plantingMethod === 'bulk' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-yellow-600 flex-shrink-0 mt-1" size={20} />
            <div>
              <h4 className="font-medium text-yellow-900 mb-1">Creazione Automatica</h4>
              <p className="text-sm text-yellow-800">
                Verranno creati automaticamente gli alberi basandosi sul layout configurato. 
                Potrai modificare i dettagli di ogni albero successivamente.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Settings className="mx-auto text-gray-600 mb-4" size={48} />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Impostazioni Gestione</h2>
        <p className="text-gray-600">Configura le impostazioni di gestione del frutteto</p>
      </div>

      <div className="space-y-6">
        <div className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg">
          <input
            type="checkbox"
            id="organicCertified"
            checked={wizardData.management?.organicCertified || false}
            onChange={(e) => setWizardData(prev => ({
              ...prev,
              management: { ...prev.management!, organicCertified: e.target.checked }
            }))}
            className="mt-1"
          />
          <div>
            <label htmlFor="organicCertified" className="font-medium text-gray-900 cursor-pointer">
              Certificazione Biologica
            </label>
            <p className="text-sm text-gray-600">
              Il frutteto è certificato biologico o in conversione
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg">
          <input
            type="checkbox"
            id="precisionManagement"
            checked={wizardData.management?.precisionManagement || false}
            onChange={(e) => setWizardData(prev => ({
              ...prev,
              management: { ...prev.management!, precisionManagement: e.target.checked }
            }))}
            className="mt-1"
          />
          <div>
            <label htmlFor="precisionManagement" className="font-medium text-gray-900 cursor-pointer">
              Gestione di Precisione
            </label>
            <p className="text-sm text-gray-600">
              Abilita funzionalità avanzate per la gestione di precisione
            </p>
          </div>
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">Seleziona zona climatica</option>
              <option value="mediterranean">Mediterraneo</option>
              <option value="continental">Continentale</option>
              <option value="alpine">Alpino</option>
              <option value="subtropical">Subtropicale</option>
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">Seleziona tipo di suolo</option>
              <option value="clay">Argilloso</option>
              <option value="sandy">Sabbioso</option>
              <option value="loamy">Franco</option>
              <option value="rocky">Roccioso</option>
              <option value="mixed">Misto</option>
            </select>
          </div>
        </div>
      </div>

      {/* Riepilogo */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Riepilogo Configurazione</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Nome:</span>
            <span className="font-medium">{wizardData.basicInfo?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tipo:</span>
            <span className="font-medium">
              {orchardTypes.find(t => t.value === wizardData.basicInfo?.orchardType)?.label}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Superficie:</span>
            <span className="font-medium">{wizardData.basicInfo?.totalAreaSqm || 0} m²</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Sesto impianto:</span>
            <span className="font-medium">
              {wizardData.layout?.rowSpacingM} × {wizardData.layout?.treeSpacingM} m
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Varietà:</span>
            <span className="font-medium">{wizardData.varieties?.mainVarieties?.length || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Biologico:</span>
            <span className="font-medium">{wizardData.management?.organicCertified ? 'Sì' : 'No'}</span>
          </div>
        </div>
      </div>

      {errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{errors.general}</p>
        </div>
      )}
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-4">
          <h1 className="text-2xl font-bold">Creazione Frutteto</h1>
          <p className="text-green-100">Passo {wizardData.step} di {wizardData.totalSteps}</p>
        </div>

        {/* Content */}
        <div className="p-6">
          {renderStepIndicator()}

          {wizardData.step === 1 && renderStep1()}
          {wizardData.step === 2 && renderStep2()}
          {wizardData.step === 3 && renderStep3()}
          {wizardData.step === 4 && renderStep4()}
          {wizardData.step === 5 && renderStep5()}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 bg-gray-50 px-6 py-4 flex justify-between">
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Annulla
            </button>
            {wizardData.step > 1 && (
              <button
                onClick={prevStep}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <ArrowLeft size={16} />
                Indietro
              </button>
            )}
          </div>

          <div>
            {wizardData.step < wizardData.totalSteps ? (
              <button
                onClick={nextStep}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Avanti
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Creazione...' : 'Crea Frutteto'}
                <Check size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}