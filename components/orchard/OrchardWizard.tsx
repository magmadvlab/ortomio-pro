'use client'

import React, { useState } from 'react'
import { OrchardWizardData, OrchardType, VarietyInfo, RootstockInfo } from '@/types/orchard'
import { FruitTreeCategory, fruitTreeCategories, getCategoryInfo } from '@/types/orchardTypes'
import { orchardService } from '@/services/orchardService'
import { vineyardService } from '@/services/vineyardService'
import { generateOrchardTasks, getTasksSummary } from '@/data/orchardTaskTemplates'
import { getCategoryTips, getCategoryRecommendations } from '@/data/orchardCategoryTips'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { Garden } from '@/types'
import {
  TreePine,
  CircleDot,
  Grape,
  ArrowRight,
  ArrowLeft,
  Check,
  Plus,
  Trash2,
  MapPin,
  Calendar,
  Ruler,
  Sprout,
  Settings,
  AlertCircle,
  CheckCircle,
  Info,
  Lightbulb,
  X
} from 'lucide-react'

// ============================================================================
// PROPS - Supporta entrambi i flussi di chiamata
// ============================================================================
interface OrchardWizardProps {
  /** ID del garden (da /app/orchard) */
  gardenId: string
  /** Garden completo (da GardenTypeWizard, opzionale) */
  garden?: Garden
  /** Tipo preset: 'orchard' | 'oliveGrove' | 'vineyard' (da GardenTypeWizard) */
  presetType?: 'orchard' | 'oliveGrove' | 'vineyard'
  /** Callback completamento */
  onComplete: (orchardId: string) => void
  onCancel: () => void
}

// ============================================================================
// TIPO COLTURA UNIFICATO
// ============================================================================
type CropKind = 'orchard' | 'oliveGrove' | 'vineyard'

// ============================================================================
// WIZARD UNIFICATO per Frutteto / Oliveto / Vigneto
// ============================================================================
export default function OrchardWizard({ gardenId, garden, presetType, onComplete, onCancel }: OrchardWizardProps) {
  const { storageProvider } = useStorage()

  const initialOrchardType: OrchardType = presetType === 'oliveGrove' ? 'olive' : 'mixed'
  const initialCropKind: CropKind = presetType || 'orchard'

  const [cropKind, setCropKind] = useState<CropKind>(initialCropKind)
  const [wizardData, setWizardData] = useState<OrchardWizardData>({
    step: 1,
    totalSteps: 5,
    basicInfo: {
      gardenId,
      name: garden?.name
        ? `${garden.name} - ${presetType === 'oliveGrove' ? 'Oliveto' : presetType === 'vineyard' ? 'Vigneto' : 'Frutteto'}`
        : '',
      orchardType: initialOrchardType,
    },
    layout: {
      rowSpacingM: 4.0,
      treeSpacingM: 3.0,
      trainingSystem: 'vase',
    },
    varieties: {
      mainVarieties: [],
      rootstockTypes: [],
    },
    trees: {
      plantingMethod: 'manual',
      treeData: [],
    },
    management: {
      organicCertified: false,
      precisionManagement: false,
    },
  })

  // Stato extra
  const [fruitCategory, setFruitCategory] = useState<FruitTreeCategory | ''>('')
  const [oliveType, setOliveType] = useState<'OIL' | 'TABLE' | 'DUAL_PURPOSE'>('OIL')
  const [vineType, setVineType] = useState<'WINE' | 'TABLE'>('WINE')
  const [vineTrainingSystem, setVineTrainingSystem] = useState<string>('Guyot')
  const [plantingSystem, setPlantingSystem] = useState<'TRADITIONAL' | 'INTENSIVE' | 'SUPER_INTENSIVE'>('INTENSIVE')
  const [soilPh, setSoilPh] = useState('')
  const [generateTasksFlag, setGenerateTasksFlag] = useState(true)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // ============================================================================
  // OPZIONI UI
  // ============================================================================
  const orchardTypes: { value: OrchardType; label: string; icon: string; kind: CropKind }[] = [
    { value: 'apple', label: 'Meleto', icon: '\u{1F34E}', kind: 'orchard' },
    { value: 'pear', label: 'Pereto', icon: '\u{1F350}', kind: 'orchard' },
    { value: 'peach', label: 'Pescheto', icon: '\u{1F351}', kind: 'orchard' },
    { value: 'cherry', label: 'Ceraseto', icon: '\u{1F352}', kind: 'orchard' },
    { value: 'apricot', label: 'Albicocceto', icon: '\u{1F7E0}', kind: 'orchard' },
    { value: 'plum', label: 'Susino', icon: '\u{1F7E3}', kind: 'orchard' },
    { value: 'citrus', label: 'Agrumeto', icon: '\u{1F34A}', kind: 'orchard' },
    { value: 'walnut', label: 'Noccioleto/Noce', icon: '\u{1F95C}', kind: 'orchard' },
    { value: 'olive', label: 'Oliveto', icon: '\u{1FAD2}', kind: 'oliveGrove' },
    { value: 'mixed', label: 'Misto', icon: '\u{1F333}', kind: 'orchard' },
  ]

  const trainingSystemOptions =
    cropKind === 'vineyard'
      ? [
          { value: 'Guyot', label: 'Guyot', description: 'Capo a frutto rinnovato annualmente' },
          { value: 'Cordon', label: 'Cordone Speronato', description: 'Cordone permanente orizzontale' },
          { value: 'Spalliera', label: 'Spalliera', description: 'Sviluppo verticale generico' },
          { value: 'Tendone', label: 'Tendone', description: 'Tetto orizzontale, uva da tavola' },
          { value: 'Pergola', label: 'Pergola', description: 'Sviluppo orizzontale/inclinato' },
          { value: 'Alberello', label: 'Alberello', description: 'Senza sostegni, tradizionale' },
          { value: 'Sylvoz', label: 'Sylvoz', description: 'Tralcio ad arco, meccanizzabile' },
          { value: 'GDC', label: 'GDC - Geneva Double Curtain', description: 'Doppia cortina' },
        ]
      : [
          { value: 'vase', label: 'Vaso', description: 'Forma tradizionale aperta' },
          { value: 'central_leader', label: 'Fusetto', description: 'Asse centrale con branche' },
          { value: 'palmette', label: 'Palmetta', description: 'Forma appiattita per alta densit\u00e0' },
          { value: 'espalier', label: 'Spalliera', description: 'Forma bidimensionale' },
          { value: 'bush', label: 'Cespuglio', description: 'Forma libera bassa' },
        ]

  // ============================================================================
  // NAVIGAZIONE
  // ============================================================================
  const nextStep = () => {
    if (validateCurrentStep()) {
      setWizardData((prev) => ({ ...prev, step: prev.step + 1 }))
      setErrors({})
    }
  }

  const prevStep = () => {
    setWizardData((prev) => ({ ...prev, step: prev.step - 1 }))
    setErrors({})
  }

  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {}
    switch (wizardData.step) {
      case 1:
        if (!wizardData.basicInfo?.name?.trim()) {
          newErrors.name = 'Nome richiesto'
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
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // ============================================================================
  // GESTIONE VARIETA & PORTINNESTI
  // ============================================================================
  const addVariety = () => {
    const newVariety: VarietyInfo = {
      variety: '', percentage: 0, plantingDate: '', expectedYield: 0, harvestPeriod: '', notes: '',
    }
    setWizardData((prev) => ({
      ...prev,
      varieties: {
        ...prev.varieties!,
        mainVarieties: [...(prev.varieties?.mainVarieties || []), newVariety],
      },
    }))
  }

  const updateVariety = (index: number, field: keyof VarietyInfo, value: string | number) => {
    setWizardData((prev) => ({
      ...prev,
      varieties: {
        ...prev.varieties!,
        mainVarieties: prev.varieties!.mainVarieties.map((v, i) =>
          i === index ? { ...v, [field]: value } : v
        ),
      },
    }))
  }

  const removeVariety = (index: number) => {
    setWizardData((prev) => ({
      ...prev,
      varieties: {
        ...prev.varieties!,
        mainVarieties: prev.varieties!.mainVarieties.filter((_, i) => i !== index),
      },
    }))
  }

  const addRootstock = () => {
    const newRootstock: RootstockInfo = {
      rootstock: '', percentage: 0, characteristics: [], soilAdaptation: [], vigorControl: 'standard',
    }
    setWizardData((prev) => ({
      ...prev,
      varieties: {
        ...prev.varieties!,
        rootstockTypes: [...(prev.varieties?.rootstockTypes || []), newRootstock],
      },
    }))
  }

  const updateRootstock = (index: number, field: keyof RootstockInfo, value: string | number | string[]) => {
    setWizardData((prev) => ({
      ...prev,
      varieties: {
        ...prev.varieties!,
        rootstockTypes: prev.varieties!.rootstockTypes.map((r, i) =>
          i === index ? { ...r, [field]: value } : r
        ),
      },
    }))
  }

  const removeRootstock = (index: number) => {
    setWizardData((prev) => ({
      ...prev,
      varieties: {
        ...prev.varieties!,
        rootstockTypes: prev.varieties!.rootstockTypes.filter((_, i) => i !== index),
      },
    }))
  }

  // ============================================================================
  // SALVATAGGIO
  // ============================================================================
  const handleComplete = async () => {
    try {
      setLoading(true)

      if (cropKind === 'vineyard') {
        const vineConfig = await vineyardService.createVineyardConfiguration({
          gardenId,
          name: wizardData.basicInfo?.name || 'Nuovo Vigneto',
          vineyardType: vineType === 'WINE' ? 'wine' : 'table',
          establishedDate: wizardData.basicInfo?.establishedDate,
          totalVines: 0,
          rowSpacingM: wizardData.layout?.rowSpacingM,
          vineSpacingM: wizardData.layout?.treeSpacingM,
          trainingSystem: vineTrainingSystem,
          soilType: wizardData.management?.soilType,
          irrigationSystem: wizardData.layout?.irrigationSystem,
          mainVarieties: wizardData.varieties?.mainVarieties || [],
          rootstockTypes: wizardData.varieties?.rootstockTypes || [],
          organicCertified: wizardData.management?.organicCertified || false,
          precisionManagement: wizardData.management?.precisionManagement || false,
        })
        onComplete(vineConfig.id)
      } else {
        const orchard = await orchardService.createOrchardFromWizard({
          ...wizardData,
          basicInfo: { ...wizardData.basicInfo!, gardenId },
        })

        if (generateTasksFlag && cropKind === 'orchard' && fruitCategory) {
          try {
            const plantedDate = new Date(wizardData.basicInfo?.establishedDate || new Date())
            const gardenName = garden?.name || wizardData.basicInfo?.name || ''
            const tasks = generateOrchardTasks(fruitCategory, plantedDate, gardenId, gardenName)
            for (const taskData of tasks) {
              await storageProvider.createTask(taskData)
            }
          } catch (error) {
            console.error('Error generating tasks:', error)
          }
        }

        onComplete(orchard.id)
      }
    } catch (error) {
      console.error('Error creating configuration:', error)
      setErrors({ general: 'Errore nella creazione. Riprova.' })
    } finally {
      setLoading(false)
    }
  }

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================
  const getTitle = () => {
    switch (cropKind) {
      case 'oliveGrove': return 'Creazione Oliveto'
      case 'vineyard': return 'Creazione Vigneto'
      default: return 'Creazione Frutteto'
    }
  }

  const getIcon = () => {
    switch (cropKind) {
      case 'oliveGrove': return <CircleDot className="text-green-100" size={24} />
      case 'vineyard': return <Grape className="text-green-100" size={24} />
      default: return <TreePine className="text-green-100" size={24} />
    }
  }

  const getPlantLabel = () => (cropKind === 'vineyard' ? 'Viti' : 'Alberi')

  // ============================================================================
  // STEP INDICATOR
  // ============================================================================
  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-6 sm:mb-8 px-2">
      {Array.from({ length: wizardData.totalSteps }, (_, i) => (
        <React.Fragment key={i}>
          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${
            i + 1 < wizardData.step ? 'bg-green-600 text-white'
              : i + 1 === wizardData.step ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-600'
          }`}>
            {i + 1 < wizardData.step ? <Check size={14} /> : i + 1}
          </div>
          {i < wizardData.totalSteps - 1 && (
            <div className={`w-8 sm:w-12 h-1 mx-1 sm:mx-2 ${i + 1 < wizardData.step ? 'bg-green-600' : 'bg-gray-200'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  )

  // ============================================================================
  // STEP 1: INFORMAZIONI BASE
  // ============================================================================
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        {getIcon()}
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 mt-2">Informazioni Base</h2>
        <p className="text-gray-600 text-sm">Iniziamo con le informazioni di base</p>
      </div>

      {/* Nome */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Nome *</label>
        <input
          type="text"
          value={wizardData.basicInfo?.name || ''}
          onChange={(e) => setWizardData((prev) => ({ ...prev, basicInfo: { ...prev.basicInfo!, name: e.target.value } }))}
          className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-green-500 min-h-[44px] ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
          placeholder={cropKind === 'vineyard' ? 'es. Vigneto Principale' : cropKind === 'oliveGrove' ? 'es. Oliveto Sud' : 'es. Frutteto Nord'}
          style={{ fontSize: '16px' }}
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
      </div>

      {/* Descrizione */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Descrizione</label>
        <textarea
          value={wizardData.basicInfo?.description || ''}
          onChange={(e) => setWizardData((prev) => ({ ...prev, basicInfo: { ...prev.basicInfo!, description: e.target.value } }))}
          className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          rows={2}
          placeholder="Note particolari..."
          style={{ fontSize: '16px' }}
        />
      </div>

      {/* Tipo Coltura */}
      {cropKind !== 'vineyard' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Tipo *</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {orchardTypes
              .filter((t) => (cropKind === 'oliveGrove' ? t.kind === 'oliveGrove' : true))
              .map((type) => (
                <button key={type.value} type="button"
                  onClick={() => {
                    setWizardData((prev) => ({ ...prev, basicInfo: { ...prev.basicInfo!, orchardType: type.value } }))
                    if (type.kind === 'oliveGrove') setCropKind('oliveGrove')
                    else setCropKind('orchard')
                  }}
                  className={`p-3 sm:p-4 border-2 rounded-lg text-center transition-all min-h-[60px] touch-manipulation ${
                    wizardData.basicInfo?.orchardType === type.value ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                  <div className="text-xl sm:text-2xl mb-1">{type.icon}</div>
                  <div className="text-xs sm:text-sm font-medium">{type.label}</div>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Sottotipo Oliveto */}
      {cropKind === 'oliveGrove' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Destinazione Produzione</label>
          <div className="space-y-2">
            {([
              { value: 'OIL' as const, label: '\u{1FAD2} Da Olio', desc: 'Produzione olio' },
              { value: 'TABLE' as const, label: '\u{1FAD2} Da Mensa', desc: 'Consumo diretto' },
              { value: 'DUAL_PURPOSE' as const, label: '\u{1FAD2} Dual-Purpose', desc: 'Olio e mensa' },
            ]).map((opt) => (
              <button key={opt.value} onClick={() => setOliveType(opt.value)}
                className={`w-full p-4 border-2 rounded-lg text-left transition-all ${oliveType === opt.value ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <div className="font-semibold text-gray-900">{opt.label}</div>
                <div className="text-sm text-gray-600">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sottotipo Vigneto */}
      {cropKind === 'vineyard' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Tipo Vigneto</label>
          <div className="space-y-2">
            {([
              { value: 'WINE' as const, label: '\u{1F377} Da Vino', desc: 'Produzione vino' },
              { value: 'TABLE' as const, label: '\u{1F347} Da Tavola', desc: 'Consumo diretto' },
            ]).map((opt) => (
              <button key={opt.value} onClick={() => setVineType(opt.value)}
                className={`w-full p-4 border-2 rounded-lg text-left transition-all ${vineType === opt.value ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <div className="font-semibold text-gray-900">{opt.label}</div>
                <div className="text-sm text-gray-600">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Categoria Botanica */}
      {cropKind === 'orchard' && wizardData.basicInfo?.orchardType !== 'olive' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Categoria Botanica (opzionale)</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {fruitTreeCategories.map((cat) => (
              <button key={cat.id} onClick={() => setFruitCategory(fruitCategory === cat.id ? '' : cat.id)}
                className={`p-4 border-2 rounded-lg text-left transition-all ${fruitCategory === cat.id ? 'border-green-500 bg-green-50 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}>
                <div className="text-2xl mb-1">{cat.icon}</div>
                <div className="font-semibold text-gray-900 text-sm">{cat.label}</div>
                <div className="text-xs text-gray-600">{cat.examples.slice(0, 3).join(', ')}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Data e Superficie */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar size={14} className="inline mr-1" />Data Impianto
          </label>
          <input type="date" value={wizardData.basicInfo?.establishedDate || ''}
            onChange={(e) => setWizardData((prev) => ({ ...prev, basicInfo: { ...prev.basicInfo!, establishedDate: e.target.value } }))}
            className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 min-h-[44px]"
            style={{ fontSize: '16px' }} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Superficie (m\u00b2)</label>
          <input type="number" value={wizardData.basicInfo?.totalAreaSqm || ''}
            onChange={(e) => setWizardData((prev) => ({ ...prev, basicInfo: { ...prev.basicInfo!, totalAreaSqm: parseFloat(e.target.value) || 0 } }))}
            className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 min-h-[44px]"
            placeholder="0" min="0" inputMode="numeric" style={{ fontSize: '16px' }} />
        </div>
      </div>

      {/* Sistema di Impianto */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Sistema di Impianto</label>
        <select value={plantingSystem}
          onChange={(e) => setPlantingSystem(e.target.value as typeof plantingSystem)}
          className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          style={{ fontSize: '16px' }}>
          <option value="TRADITIONAL">{'Tradizionale (<200 piante/ha)'}</option>
          <option value="INTENSIVE">Intensivo (400-600 piante/ha)</option>
          <option value="SUPER_INTENSIVE">Superintensivo (1.600-2.500 piante/ha)</option>
        </select>
      </div>
    </div>
  )

  // ============================================================================
  // STEP 2: LAYOUT E PROGETTAZIONE
  // ============================================================================
  const renderStep2 = () => {
    const rowSpacing = wizardData.layout?.rowSpacingM || 0
    const treeSpacing = wizardData.layout?.treeSpacingM || 0
    const density = rowSpacing > 0 && treeSpacing > 0 ? Math.round(10000 / (rowSpacing * treeSpacing)) : 0
    const totalArea = wizardData.basicInfo?.totalAreaSqm || 0
    const totalPlants = totalArea > 0 && density > 0 ? Math.round((totalArea / 10000) * density) : 0
    const categoryTips = cropKind === 'orchard' && fruitCategory ? getCategoryTips(fruitCategory) : []
    const categoryRecs = cropKind === 'orchard' && fruitCategory ? getCategoryRecommendations(fruitCategory) : null
    const catInfo = fruitCategory ? getCategoryInfo(fruitCategory) : null

    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <Ruler className="mx-auto text-blue-600 mb-4" size={48} />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Layout e Progettazione</h2>
          <p className="text-gray-600 text-sm">Configura le distanze e il sistema di allevamento</p>
        </div>

        {/* Sesto di Impianto */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Distanza tra Filari (m) *</label>
            <input type="number" step="0.1" value={wizardData.layout?.rowSpacingM || ''}
              onChange={(e) => setWizardData((prev) => ({ ...prev, layout: { ...prev.layout!, rowSpacingM: parseFloat(e.target.value) || 0 } }))}
              className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-green-500 min-h-[44px] ${errors.rowSpacing ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="4.0" min="0.1" inputMode="decimal" style={{ fontSize: '16px' }} />
            {errors.rowSpacing && <p className="text-red-500 text-sm mt-1">{errors.rowSpacing}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Distanza tra {getPlantLabel()} (m) *</label>
            <input type="number" step="0.1" value={wizardData.layout?.treeSpacingM || ''}
              onChange={(e) => setWizardData((prev) => ({ ...prev, layout: { ...prev.layout!, treeSpacingM: parseFloat(e.target.value) || 0 } }))}
              className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-green-500 min-h-[44px] ${errors.treeSpacing ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="3.0" min="0.1" inputMode="decimal" style={{ fontSize: '16px' }} />
            {errors.treeSpacing && <p className="text-red-500 text-sm mt-1">{errors.treeSpacing}</p>}
          </div>
        </div>

        {/* Calcolo densita */}
        {density > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="text-blue-600 flex-shrink-0 mt-1" size={20} />
              <div className="text-sm text-blue-800 space-y-1">
                <div>{getPlantLabel()} per ettaro: <strong>{density}</strong></div>
                {totalPlants > 0 && <div>{getPlantLabel()} totali stimate: <strong>{totalPlants}</strong></div>}
              </div>
            </div>
          </div>
        )}

        {/* Sistema di Allevamento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Sistema di Allevamento</label>
          <div className="space-y-2">
            {trainingSystemOptions.map((system) => (
              <label key={system.value} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer min-h-[52px] touch-manipulation">
                <input type="radio" name="trainingSystem" value={system.value}
                  checked={cropKind === 'vineyard' ? vineTrainingSystem === system.value : wizardData.layout?.trainingSystem === system.value}
                  onChange={(e) => {
                    if (cropKind === 'vineyard') setVineTrainingSystem(e.target.value)
                    else setWizardData((prev) => ({ ...prev, layout: { ...prev.layout!, trainingSystem: e.target.value } }))
                  }}
                  className="mt-1 w-4 h-4" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 text-sm">{system.label}</div>
                  <div className="text-xs text-gray-600">{system.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Irrigazione */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Sistema di Irrigazione</label>
          <select value={wizardData.layout?.irrigationSystem || ''}
            onChange={(e) => setWizardData((prev) => ({ ...prev, layout: { ...prev.layout!, irrigationSystem: e.target.value } }))}
            className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            style={{ fontSize: '16px' }}>
            <option value="">Seleziona</option>
            <option value="drip">Goccia</option>
            <option value="micro_sprinkler">Microirrigazione</option>
            <option value="sprinkler">Aspersione</option>
            <option value="flood">Scorrimento</option>
            <option value="none">Nessuno (asciutto)</option>
          </select>
        </div>

        {/* Tips Contestuali */}
        {categoryTips.length > 0 && catInfo && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Lightbulb size={18} className="text-yellow-500" />
              Suggerimenti per {catInfo.label}
            </h4>
            <div className="space-y-2">
              {categoryTips.slice(0, 3).map((tip, index) => {
                const bgColor = tip.type === 'warning' ? 'bg-amber-50 border-amber-200' : tip.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'
                const iconColor = tip.type === 'warning' ? 'text-amber-600' : tip.type === 'success' ? 'text-green-600' : 'text-blue-600'
                const TipIcon = tip.type === 'warning' ? AlertCircle : tip.type === 'success' ? CheckCircle : Info
                return (
                  <div key={index} className={`p-3 rounded-lg border ${bgColor}`}>
                    <div className="flex items-start gap-2">
                      <TipIcon className={iconColor} size={16} />
                      <div>
                        <h5 className="font-medium text-gray-900 text-sm">{tip.icon} {tip.title}</h5>
                        <p className="text-xs text-gray-700">{tip.description}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            {categoryRecs && (
              <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="text-purple-600 flex-shrink-0" size={14} />
                  <div className="text-xs">
                    <span className="font-medium text-purple-900">pH Ideale:</span>{' '}
                    <span className="text-purple-800">{categoryRecs.soilPh.min.toFixed(1)} - {categoryRecs.soilPh.max.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // ============================================================================
  // STEP 3: VARIETA E PORTINNESTI
  // ============================================================================
  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Sprout className="mx-auto text-green-600 mb-4" size={48} />
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{"Variet\u00e0 e Portinnesti"}</h2>
        <p className="text-gray-600 text-sm">
          {"Configura le variet\u00e0 "}
          {cropKind === 'vineyard' ? 'del vigneto' : cropKind === 'oliveGrove' ? "dell'oliveto" : 'del frutteto'}
        </p>
      </div>

      {/* Varieta */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{"Variet\u00e0 Principali"}</h3>
          <button type="button" onClick={addVariety}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
            <Plus size={16} /> Aggiungi
          </button>
        </div>

        {(wizardData.varieties?.mainVarieties?.length || 0) === 0 ? (
          <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
            <Sprout className="mx-auto text-gray-400 mb-2" size={32} />
            <p className="text-gray-600 text-sm">{"Nessuna variet\u00e0 aggiunta (opzionale)"}</p>
            <button type="button" onClick={addVariety} className="mt-2 text-green-600 hover:text-green-700 text-sm">
              {"Aggiungi la prima variet\u00e0"}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {wizardData.varieties!.mainVarieties.map((variety, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900 text-sm">{"Variet\u00e0"} {index + 1}</h4>
                  <button type="button" onClick={() => removeVariety(index)} className="text-red-600 hover:text-red-700"><Trash2 size={16} /></button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Nome *</label>
                    <input type="text" value={variety.variety}
                      onChange={(e) => updateVariety(index, 'variety', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                      placeholder={cropKind === 'vineyard' ? 'es. Sangiovese' : cropKind === 'oliveGrove' ? 'es. Frantoio' : 'es. Golden Delicious'} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Percentuale (%)</label>
                    <input type="number" value={variety.percentage || ''}
                      onChange={(e) => updateVariety(index, 'percentage', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                      min="0" max="100" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Periodo Raccolta</label>
                    <input type="text" value={variety.harvestPeriod || ''}
                      onChange={(e) => updateVariety(index, 'harvestPeriod', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                      placeholder="es. Settembre-Ottobre" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Resa Attesa (kg/{cropKind === 'vineyard' ? 'vite' : 'pianta'})</label>
                    <input type="number" value={variety.expectedYield || ''}
                      onChange={(e) => updateVariety(index, 'expectedYield', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                      min="0" />
                  </div>
                </div>
                <div className="mt-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Note</label>
                  <textarea value={variety.notes || ''}
                    onChange={(e) => updateVariety(index, 'notes', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                    rows={2} placeholder={"Note sulla variet\u00e0..."} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Portinnesti */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Portinnesti</h3>
          <button type="button" onClick={addRootstock}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
            <Plus size={16} /> Aggiungi
          </button>
        </div>

        {(wizardData.varieties?.rootstockTypes?.length || 0) === 0 ? (
          <div className="text-center py-4 border border-gray-200 rounded-lg bg-gray-50">
            <p className="text-gray-600 text-sm">Nessun portinnesto specificato (opzionale)</p>
          </div>
        ) : (
          <div className="space-y-3">
            {wizardData.varieties!.rootstockTypes.map((rootstock, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 bg-blue-50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900 text-sm">Portinnesto {index + 1}</h4>
                  <button type="button" onClick={() => removeRootstock(index)} className="text-red-600 hover:text-red-700"><Trash2 size={16} /></button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Nome</label>
                    <input type="text" value={rootstock.rootstock}
                      onChange={(e) => updateRootstock(index, 'rootstock', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      placeholder="es. M9, M26, Franco" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Percentuale (%)</label>
                    <input type="number" value={rootstock.percentage || ''}
                      onChange={(e) => updateRootstock(index, 'percentage', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      min="0" max="100" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Controllo Vigoria</label>
                    <select value={rootstock.vigorControl}
                      onChange={(e) => updateRootstock(index, 'vigorControl', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500">
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

  // ============================================================================
  // STEP 4: PIANTUMAZIONE
  // ============================================================================
  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <MapPin className="mx-auto text-purple-600 mb-4" size={48} />
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Piantumazione {getPlantLabel()}</h2>
        <p className="text-gray-600 text-sm">Scegli come aggiungere {cropKind === 'vineyard' ? 'le viti' : 'gli alberi'}</p>
      </div>

      <div className="space-y-3">
        {[
          { value: 'manual', label: 'Aggiunta Manuale', desc: `Aggiungi ${cropKind === 'vineyard' ? 'le viti' : 'gli alberi'} uno per uno dopo la creazione`, disabled: false },
          { value: 'bulk', label: 'Creazione Automatica', desc: `Genera automaticamente basandosi sul layout`, disabled: false },
          { value: 'import', label: 'Importazione da File', desc: 'Importa da file CSV/Excel (prossimamente)', disabled: true },
        ].map((opt) => (
          <label key={opt.value}
            className={`flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer min-h-[60px] ${opt.disabled ? 'opacity-50' : ''}`}>
            <input type="radio" name="plantingMethod" value={opt.value} disabled={opt.disabled}
              checked={wizardData.trees?.plantingMethod === opt.value}
              onChange={(e) => setWizardData((prev) => ({ ...prev, trees: { ...prev.trees!, plantingMethod: e.target.value as 'manual' | 'bulk' | 'import' } }))}
              className="mt-1 w-4 h-4" />
            <div>
              <div className="font-medium text-gray-900">{opt.label}</div>
              <div className="text-sm text-gray-600">{opt.desc}</div>
            </div>
          </label>
        ))}
      </div>

      {wizardData.trees?.plantingMethod === 'bulk' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-yellow-600 flex-shrink-0 mt-1" size={20} />
            <p className="text-sm text-yellow-800">Verranno creati automaticamente basandosi sul layout. Potrai modificare i dettagli successivamente.</p>
          </div>
        </div>
      )}
    </div>
  )

  // ============================================================================
  // STEP 5: GESTIONE + RIEPILOGO
  // ============================================================================
  const renderStep5 = () => {
    const orchardTypeLabel =
      cropKind === 'vineyard'
        ? `Vigneto (${vineType === 'WINE' ? 'da Vino' : 'da Tavola'})`
        : cropKind === 'oliveGrove'
          ? `Oliveto (${oliveType === 'OIL' ? 'da Olio' : oliveType === 'TABLE' ? 'da Mensa' : 'Dual'})`
          : orchardTypes.find((t) => t.value === wizardData.basicInfo?.orchardType)?.label || 'Frutteto'
    const catInfo = fruitCategory ? getCategoryInfo(fruitCategory) : null

    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <Settings className="mx-auto text-gray-600 mb-4" size={48} />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Impostazioni e Riepilogo</h2>
        </div>

        {/* Opzioni gestione */}
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg">
            <input type="checkbox" id="organicCertified"
              checked={wizardData.management?.organicCertified || false}
              onChange={(e) => setWizardData((prev) => ({ ...prev, management: { ...prev.management!, organicCertified: e.target.checked } }))}
              className="mt-1" />
            <div>
              <label htmlFor="organicCertified" className="font-medium text-gray-900 cursor-pointer">Certificazione Biologica</label>
              <p className="text-sm text-gray-600">Certificato biologico o in conversione</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg">
            <input type="checkbox" id="precisionMgmt"
              checked={wizardData.management?.precisionManagement || false}
              onChange={(e) => setWizardData((prev) => ({ ...prev, management: { ...prev.management!, precisionManagement: e.target.checked } }))}
              className="mt-1" />
            <div>
              <label htmlFor="precisionMgmt" className="font-medium text-gray-900 cursor-pointer">Gestione di Precisione</label>
              <p className="text-sm text-gray-600">{"Abilita funzionalit\u00e0 avanzate"}</p>
            </div>
          </div>
        </div>

        {/* Clima e Suolo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Zona Climatica</label>
            <select value={wizardData.management?.climateZone || ''}
              onChange={(e) => setWizardData((prev) => ({ ...prev, management: { ...prev.management!, climateZone: e.target.value } }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" style={{ fontSize: '16px' }}>
              <option value="">Seleziona</option>
              <option value="mediterranean">Mediterraneo</option>
              <option value="continental">Continentale</option>
              <option value="alpine">Alpino</option>
              <option value="subtropical">Subtropicale</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo di Suolo</label>
            <select value={wizardData.management?.soilType || ''}
              onChange={(e) => setWizardData((prev) => ({ ...prev, management: { ...prev.management!, soilType: e.target.value } }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" style={{ fontSize: '16px' }}>
              <option value="">Seleziona</option>
              <option value="clay">Argilloso</option>
              <option value="sandy">Sabbioso</option>
              <option value="loamy">Franco</option>
              <option value="rocky">Roccioso</option>
              <option value="mixed">Misto</option>
            </select>
          </div>
        </div>

        {/* pH */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">pH del Suolo (opzionale)</label>
          <input type="number" value={soilPh} onChange={(e) => setSoilPh(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            placeholder="6.5" min="0" max="14" step="0.1" style={{ fontSize: '16px' }} />
        </div>

        {/* Generazione Task */}
        {cropKind === 'orchard' && fruitCategory && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={generateTasksFlag}
                onChange={(e) => setGenerateTasksFlag(e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-600" />
              <div>
                <span className="font-medium text-gray-900">Genera task stagionali automaticamente</span>
                <p className="text-sm text-gray-600 mt-1">{getTasksSummary(fruitCategory)} verranno creati nel calendario.</p>
              </div>
            </label>
          </div>
        )}

        {/* Riepilogo */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Riepilogo Configurazione</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-600">Nome:</span><span className="font-medium">{wizardData.basicInfo?.name}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Tipo:</span><span className="font-medium">{orchardTypeLabel}</span></div>
            {catInfo && <div className="flex justify-between"><span className="text-gray-600">Categoria:</span><span className="font-medium">{catInfo.label}</span></div>}
            <div className="flex justify-between"><span className="text-gray-600">Superficie:</span><span className="font-medium">{wizardData.basicInfo?.totalAreaSqm || 0} {"m\u00b2"}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Sesto impianto:</span><span className="font-medium">{wizardData.layout?.rowSpacingM} × {wizardData.layout?.treeSpacingM} m</span></div>
            <div className="flex justify-between"><span className="text-gray-600">{"Variet\u00e0"}:</span><span className="font-medium">{wizardData.varieties?.mainVarieties?.length || 0}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Biologico:</span><span className="font-medium">{wizardData.management?.organicCertified ? 'Si' : 'No'}</span></div>
          </div>
        </div>

        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{errors.general}</p>
          </div>
        )}
      </div>
    )
  }

  // ============================================================================
  // LAYOUT PRINCIPALE
  // ============================================================================
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-2 sm:p-4">
      <div className="bg-white rounded-lg sm:rounded-2xl shadow-2xl w-full max-w-[95vw] sm:max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getIcon()}
              <div>
                <h1 className="text-lg sm:text-2xl font-bold">{getTitle()}</h1>
                <p className="text-green-100 text-sm">Passo {wizardData.step} di {wizardData.totalSteps}</p>
              </div>
            </div>
            <button onClick={onCancel} className="p-2 hover:bg-white/20 rounded-lg transition-colors" aria-label="Chiudi">
              <X size={20} className="text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {renderStepIndicator()}
          {wizardData.step === 1 && renderStep1()}
          {wizardData.step === 2 && renderStep2()}
          {wizardData.step === 3 && renderStep3()}
          {wizardData.step === 4 && renderStep4()}
          {wizardData.step === 5 && renderStep5()}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-between">
            <div className="flex gap-2 order-2 sm:order-1">
              <button onClick={onCancel} className="flex-1 sm:flex-none px-4 py-3 text-gray-700 hover:bg-gray-200 rounded-lg min-h-[44px]">
                Annulla
              </button>
              {wizardData.step > 1 && (
                <button onClick={prevStep} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 text-gray-700 hover:bg-gray-200 rounded-lg min-h-[44px]">
                  <ArrowLeft size={20} /> <span className="hidden sm:inline">Indietro</span>
                </button>
              )}
            </div>
            <div className="order-1 sm:order-2">
              {wizardData.step < wizardData.totalSteps ? (
                <button onClick={nextStep} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 min-h-[44px]">
                  Avanti <ArrowRight size={20} />
                </button>
              ) : (
                <button onClick={handleComplete} disabled={loading}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 min-h-[44px]">
                  {loading ? 'Creazione...' : `Crea ${cropKind === 'vineyard' ? 'Vigneto' : cropKind === 'oliveGrove' ? 'Oliveto' : 'Frutteto'}`}
                  <Check size={20} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
