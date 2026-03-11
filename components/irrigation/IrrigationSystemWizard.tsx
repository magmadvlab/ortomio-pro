'use client'

import React, { useState, useEffect } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { IrrigationSystem } from '@/types/irrigation'
import { GardenBed, GardenRow } from '@/types'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { X, ChevronLeft, ChevronRight, MapPin, Sprout, TreePine, Grape, Leaf, Layers } from 'lucide-react'

interface IrrigationSystemWizardProps {
  gardenId: string
  onComplete: (system: Omit<IrrigationSystem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  onCancel: () => void
}

type CultivationType = 'orto' | 'frutteto' | 'uliveto' | 'vigneto' | 'serra' | 'giardino'

interface CultivationConfig {
  icon: React.ReactNode
  label: string
  description: string
  recommendedTypes: Array<{
    type: IrrigationSystem['type']
    label: string
    description: string
    efficiency: 'Alta' | 'Media' | 'Bassa'
  }>
  specificFields: string[]
  usesRows: boolean // Se usa filari/rows
}

const cultivationConfigs: Record<CultivationType, CultivationConfig> = {
  orto: {
    icon: <Sprout className="text-green-600" size={24} />,
    label: 'Orto',
    description: 'Verdure, ortaggi, erbe aromatiche',
    recommendedTypes: [
      { type: 'Drip', label: 'Goccia', description: 'Ideale per risparmio idrico e precisione', efficiency: 'Alta' },
      { type: 'Micro', label: 'Micro-irrigazione', description: 'Perfetto per aiuole e filari', efficiency: 'Alta' },
      { type: 'Soaker', label: 'Tubo poroso', description: 'Economico per piccole aree', efficiency: 'Media' }
    ],
    specificFields: ['aiuole', 'filari', 'settori'],
    usesRows: true
  },
  frutteto: {
    icon: <TreePine className="text-orange-600" size={24} />,
    label: 'Frutteto',
    description: 'Alberi da frutto, agrumi',
    recommendedTypes: [
      { type: 'Drip', label: 'Goccia', description: 'Ottimale per alberi adulti', efficiency: 'Alta' },
      { type: 'Micro', label: 'Micro-irrigazione', description: 'Ideale per giovani piante', efficiency: 'Alta' },
      { type: 'Sprinkler', label: 'Irrigatori', description: 'Per grandi superfici', efficiency: 'Media' }
    ],
    specificFields: ['settori', 'filari', 'varietà'],
    usesRows: true
  },
  uliveto: {
    icon: <Leaf className="text-gray-600" size={24} />,
    label: 'Uliveto',
    description: 'Olivi, oliveti tradizionali e intensivi',
    recommendedTypes: [
      { type: 'Drip', label: 'Goccia', description: 'Standard per olivicoltura moderna', efficiency: 'Alta' },
      { type: 'Micro', label: 'Micro-irrigazione', description: 'Per oliveti intensivi', efficiency: 'Alta' },
      { type: 'Manual', label: 'Manuale', description: 'Per oliveti tradizionali', efficiency: 'Bassa' }
    ],
    specificFields: ['settori', 'filari', 'età_piante'],
    usesRows: true
  },
  vigneto: {
    icon: <Grape className="text-purple-600" size={24} />,
    label: 'Vigneto',
    description: 'Viti da vino, uva da tavola',
    recommendedTypes: [
      { type: 'Drip', label: 'Goccia', description: 'Standard per viticoltura di qualità', efficiency: 'Alta' },
      { type: 'Micro', label: 'Micro-irrigazione', description: 'Per controllo preciso', efficiency: 'Alta' },
      { type: 'Soaker', label: 'Tubo poroso', description: 'Economico per piccoli vigneti', efficiency: 'Media' }
    ],
    specificFields: ['filari', 'varietà', 'esposizione'],
    usesRows: true
  },
  serra: {
    icon: <div className="text-blue-600">🏠</div>,
    label: 'Serra',
    description: 'Coltivazioni protette, tunnel',
    recommendedTypes: [
      { type: 'Drip', label: 'Goccia', description: 'Controllo preciso umidità', efficiency: 'Alta' },
      { type: 'Micro', label: 'Micro-irrigazione', description: 'Ideale per vasi e bancali', efficiency: 'Alta' },
      { type: 'Manual', label: 'Manuale', description: 'Per serre piccole', efficiency: 'Media' }
    ],
    specificFields: ['bancali', 'settori', 'tipo_coltura'],
    usesRows: false
  },
  giardino: {
    icon: <div className="text-green-500">🌺</div>,
    label: 'Giardino',
    description: 'Prato, aiuole ornamentali, siepi',
    recommendedTypes: [
      { type: 'Sprinkler', label: 'Irrigatori', description: 'Ideale per prato e grandi aree', efficiency: 'Media' },
      { type: 'Drip', label: 'Goccia', description: 'Per aiuole e siepi', efficiency: 'Alta' },
      { type: 'Manual', label: 'Manuale', description: 'Per piccoli giardini', efficiency: 'Bassa' }
    ],
    specificFields: ['zone', 'aiuole', 'tipo_piante'],
    usesRows: false
  }
}

export function IrrigationSystemWizard({ gardenId, onComplete, onCancel }: IrrigationSystemWizardProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [beds, setBeds] = useState<GardenBed[]>([])
  const [rows, setRows] = useState<GardenRow[]>([])
  const [loadingData, setLoadingData] = useState(false)
  const { storageProvider } = useStorage()
  
  const [formData, setFormData] = useState({
    name: '',
    cultivationType: undefined as CultivationType | undefined,
    location: '', // Dove si trova (es. "Settore Nord", "Filare 3-5", "Aiuola principale")
    area: '', // Superficie o dettagli area
    selectedBedIds: [] as string[], // Aiuole selezionate
    selectedRowIds: [] as string[], // Filari selezionati
    type: 'Drip' as IrrigationSystem['type'],
    waterSource: undefined as IrrigationSystem['waterSource'],
    pressureBar: undefined as number | undefined,
    hasTimer: false,
    hasValve: false,
    notes: ''
  })

  // Carica aiuole e filari quando cambia il tipo di coltivazione
  useEffect(() => {
    const loadGardenData = async () => {
      if (!formData.cultivationType || !storageProvider) return
      
      setLoadingData(true)
      try {
        // Carica sempre le aiuole
        const bedsData = await storageProvider.getGardenBeds(gardenId)
        setBeds(bedsData)
        
        // Se usa filari, carica anche i filari per tutte le aiuole
        if (cultivationConfigs[formData.cultivationType].usesRows) {
          const allRows: GardenRow[] = []
          for (const bed of bedsData) {
            const bedRows = await storageProvider.getGardenRows(bed.id)
            allRows.push(...bedRows)
          }
          setRows(allRows)
        } else {
          setRows([])
        }
      } catch (error) {
        console.error('Error loading garden data:', error)
      } finally {
        setLoadingData(false)
      }
    }

    loadGardenData()
  }, [formData.cultivationType, gardenId, storageProvider])

  const totalSteps = 4

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1)
  }

  const handlePrev = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      // Costruisci nome completo se non specificato
      const finalName = formData.name || 
        `${cultivationConfigs[formData.cultivationType!].label} ${formData.location}`.trim()

      // Costruisci note con informazioni sui filari/aiuole selezionati
      const selectedInfo = []
      if (formData.selectedBedIds.length > 0) {
        const selectedBeds = beds.filter(b => formData.selectedBedIds.includes(b.id))
        selectedInfo.push(`Aiuole: ${selectedBeds.map(b => b.name).join(', ')}`)
      }
      if (formData.selectedRowIds.length > 0) {
        const selectedRows = rows.filter(r => formData.selectedRowIds.includes(r.id))
        selectedInfo.push(`Filari: ${selectedRows.map(r => r.name).join(', ')}`)
      }

      const systemData: Omit<IrrigationSystem, 'id' | 'createdAt' | 'updatedAt'> = {
        gardenId,
        name: finalName,
        type: formData.type,
        waterSource: formData.waterSource,
        pressureBar: formData.pressureBar,
        hasTimer: formData.hasTimer,
        hasValve: formData.hasValve,
        cultivationType: formData.cultivationType,
        notes: [
          formData.notes,
          `Tipo coltivazione: ${cultivationConfigs[formData.cultivationType!].label}`,
          formData.location && `Posizione: ${formData.location}`,
          formData.area && `Area: ${formData.area}`,
          ...selectedInfo
        ].filter(Boolean).join('\n'),
        // Include optional fields directly in the object
        bedIds: formData.selectedBedIds.length > 0 ? formData.selectedBedIds : undefined,
        rowIds: formData.selectedRowIds.length > 0 ? formData.selectedRowIds : undefined
      }

      await onComplete(systemData)
    } catch (error) {
      console.error('Error creating irrigation system:', error)
      alert('Errore durante la creazione del sistema')
    } finally {
      setLoading(false)
    }
  }

  const canProceed = () => {
    if (step === 1) return formData.cultivationType && formData.location.length > 0
    if (step === 2) return formData.type
    if (step === 3) return true // Fonte acqua opzionale
    if (step === 4) return true
    return false
  }

  const selectedConfig = formData.cultivationType ? cultivationConfigs[formData.cultivationType] : null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onCancel}>
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="border-b px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-900">Nuovo Sistema Irrigazione</h2>
              <p className="text-sm text-gray-600">Step {step} di {totalSteps} - Configura il tuo impianto</p>
            </div>
            <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>

          {/* Progress bar */}
          <div className="px-6 pt-4">
            <div className="flex gap-3">
              {[1, 2, 3, 4].map(s => (
                <div
                  key={s}
                  className={`h-2 flex-1 rounded-full ${
                    s <= step ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Dove</span>
              <span>Tipo</span>
              <span>Acqua</span>
              <span>Extra</span>
            </div>
          </div>

          <div className="p-6 min-h-[400px]">
            {/* Step 1: Tipo di Coltivazione e Posizione */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-3">
                    <MapPin className="text-blue-600" size={20} />
                    Dove stai installando il sistema?
                  </h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Seleziona il tipo di coltivazione e specifica la posizione esatta
                  </p>

                  {/* Tipo Coltivazione */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Tipo di Coltivazione *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-3 gap-3">
                      {Object.entries(cultivationConfigs).map(([key, config]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setFormData(prev => ({ 
                            ...prev, 
                            cultivationType: key as CultivationType,
                            // Reset tipo irrigazione quando cambia coltivazione
                            type: config.recommendedTypes[0].type
                          }))}
                          className={`p-4 border-2 rounded-lg text-left transition-all ${
                            formData.cultivationType === key
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            {config.icon}
                            <span className="font-medium">{config.label}</span>
                          </div>
                          <p className="text-xs text-gray-600">{config.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Posizione Specifica */}
                  {formData.cultivationType && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Posizione Specifica *
                        </label>
                        <Input
                          placeholder={`es. ${
                            formData.cultivationType === 'orto' ? 'Aiuola Nord, Settore A' :
                            formData.cultivationType === 'frutteto' ? 'Filare 1-3, Settore Meli' :
                            formData.cultivationType === 'uliveto' ? 'Settore Nord, Filari 5-8' :
                            formData.cultivationType === 'vigneto' ? 'Filari 10-15, Varietà Sangiovese' :
                            formData.cultivationType === 'serra' ? 'Serra 1, Bancali A-C' :
                            'Zona prato, Aiuole perimetrali'
                          }`}
                          value={formData.location}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                          autoFocus
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Specifica esattamente dove verrà installato il sistema
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Area/Superficie (opzionale)
                        </label>
                        <Input
                          placeholder="es. 50 mq, 200 piante, 15 filari"
                          value={formData.area}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, area: e.target.value }))}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nome Sistema (opzionale)
                        </label>
                        <Input
                          placeholder={`Lascia vuoto per auto-generare: "${cultivationConfigs[formData.cultivationType].label} ${formData.location}"`}
                          value={formData.name}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>

                      {/* Selezione Filari/Aiuole */}
                      {loadingData ? (
                        <div className="text-center py-4">
                          <div className="text-sm text-gray-500">Caricamento aiuole e filari...</div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* Aiuole */}
                          {beds.length > 0 && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Aiuole da irrigare (opzionale)
                              </label>
                              <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-md p-3 space-y-1">
                                {beds.map(bed => (
                                  <label key={bed.id} className="flex items-center gap-3 text-sm">
                                    <input
                                      type="checkbox"
                                      checked={formData.selectedBedIds.includes(bed.id)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setFormData(prev => ({
                                            ...prev,
                                            selectedBedIds: [...prev.selectedBedIds, bed.id]
                                          }))
                                        } else {
                                          setFormData(prev => ({
                                            ...prev,
                                            selectedBedIds: prev.selectedBedIds.filter(id => id !== bed.id)
                                          }))
                                        }
                                      }}
                                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span>{bed.name}</span>
                                    <span className="text-xs text-gray-500">
                                      {bed.lengthCm && bed.widthCm ? 
                                        `(${(bed.lengthCm/100).toFixed(1)}×${(bed.widthCm/100).toFixed(1)}m)` : 
                                        bed.areaSqMeters ? `(${bed.areaSqMeters}m²)` : ''
                                      }
                                    </span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Filari (solo se il tipo di coltivazione li usa) */}
                          {selectedConfig?.usesRows && rows.length > 0 && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-3">
                                <Layers size={16} />
                                Filari da irrigare (opzionale)
                              </label>
                              <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-md p-3 space-y-1">
                                {rows.map(row => {
                                  const bed = beds.find(b => b.id === row.bedId)
                                  return (
                                    <label key={row.id} className="flex items-center gap-3 text-sm">
                                      <input
                                        type="checkbox"
                                        checked={formData.selectedRowIds.includes(row.id)}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setFormData(prev => ({
                                              ...prev,
                                              selectedRowIds: [...prev.selectedRowIds, row.id]
                                            }))
                                          } else {
                                            setFormData(prev => ({
                                              ...prev,
                                              selectedRowIds: prev.selectedRowIds.filter(id => id !== row.id)
                                            }))
                                          }
                                        }}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                      />
                                      <span>{row.name}</span>
                                      <span className="text-xs text-gray-500">
                                        ({bed?.name} - {row.lengthMeters}m)
                                      </span>
                                      {row.irrigationLine?.flowRatePerMeterLph && (
                                        <span className="text-xs text-green-600">
                                          ✓ {row.irrigationLine.flowRatePerMeterLph}L/h/m
                                        </span>
                                      )}
                                    </label>
                                  )
                                })}
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                I filari con ✓ hanno già configurazione irrigazione
                              </p>
                            </div>
                          )}

                          {/* Messaggio se non ci sono aiuole/filari */}
                          {beds.length === 0 && (
                            <div className="text-center py-4 text-sm text-gray-500">
                              Nessuna aiuola trovata. Crea prima le aiuole per questo giardino.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Tipo Sistema Irrigazione */}
            {step === 2 && selectedConfig && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-3">
                    {selectedConfig.icon}
                    Tipo di Irrigazione per {selectedConfig.label}
                  </h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Sistemi consigliati per <strong>{formData.location}</strong>
                  </p>

                  <div className="space-y-3">
                    {selectedConfig.recommendedTypes.map((recType) => (
                      <button
                        key={recType.type}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, type: recType.type }))}
                        className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                          formData.type === recType.type
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="text-xl md:text-2xl">
                              {recType.type === 'Drip' && '💦'}
                              {recType.type === 'Sprinkler' && '🌧️'}
                              {recType.type === 'Micro' && '🌊'}
                              {recType.type === 'Soaker' && '🚿'}
                              {recType.type === 'Manual' && '💧'}
                            </span>
                            <div>
                              <span className="font-medium">{recType.label}</span>
                              <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                                recType.efficiency === 'Alta' ? 'bg-green-100 text-green-700' :
                                recType.efficiency === 'Media' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                Efficienza {recType.efficiency}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{recType.description}</p>
                      </button>
                    ))}
                  </div>

                  {/* Altri tipi disponibili */}
                  <details className="mt-6">
                    <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-3">
                      Altri tipi disponibili
                    </summary>
                    <div className="space-y-2">
                      {(['Manual', 'Drip', 'Sprinkler', 'Micro', 'Soaker'] as const)
                        .filter(type => !selectedConfig.recommendedTypes.some(r => r.type === type))
                        .map(type => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, type }))}
                            className={`w-full p-3 border rounded-lg text-left text-sm ${
                              formData.type === type
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {type === 'Manual' && '💧 Manuale (tubo/annaffiatoio)'}
                            {type === 'Drip' && '💦 Goccia (drip irrigation)'}
                            {type === 'Sprinkler' && '🌧️ Irrigatori (sprinkler)'}
                            {type === 'Micro' && '🌊 Micro-irrigazione'}
                            {type === 'Soaker' && '🚿 Tubo poroso (soaker hose)'}
                          </button>
                        ))}
                    </div>
                  </details>
                </div>
              </div>
            )}

            {/* Step 3: Fonte Acqua e Pressione */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Fonte Acqua e Caratteristiche</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fonte Acqua
                      </label>
                      <Select
                        value={formData.waterSource || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, waterSource: e.target.value as any || undefined }))}
                      >
                        <option value="">Seleziona fonte acqua...</option>
                        <option value="Municipal">🏙️ Acquedotto comunale</option>
                        <option value="Consortium">🚜 Consorzio di Bonifica</option>
                        <option value="Well">🕳️ Pozzo privato</option>
                        <option value="Rainwater">🌧️ Raccolta acqua piovana</option>
                        <option value="River">🌊 Fiume/Canale</option>
                        <option value="Pond">🏞️ Laghetto/Cisterna</option>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pressione Sistema (bar)
                      </label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder="es. 2.5"
                        value={formData.pressureBar || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({
                          ...prev,
                          pressureBar: parseFloat(e.target.value) || undefined
                        }))}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.type === 'Drip' && 'Consigliato: 1.5-3 bar per sistemi a goccia'}
                        {formData.type === 'Sprinkler' && 'Consigliato: 2-4 bar per irrigatori'}
                        {formData.type === 'Micro' && 'Consigliato: 1-2.5 bar per micro-irrigazione'}
                        {formData.type === 'Manual' && 'Non applicabile per sistemi manuali'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Automazione e Note */}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Automazione e Note Finali</h3>

                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Riepilogo Sistema</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>Tipo:</strong> {cultivationConfigs[formData.cultivationType!].label}</p>
                        <p><strong>Posizione:</strong> {formData.location}</p>
                        {formData.area && <p><strong>Area:</strong> {formData.area}</p>}
                        <p><strong>Irrigazione:</strong> {
                          formData.type === 'Drip' ? 'Goccia' :
                          formData.type === 'Sprinkler' ? 'Irrigatori' :
                          formData.type === 'Micro' ? 'Micro-irrigazione' :
                          formData.type === 'Soaker' ? 'Tubo poroso' :
                          'Manuale'
                        }</p>
                        {formData.waterSource && <p><strong>Fonte acqua:</strong> {
                          formData.waterSource === 'Municipal' ? 'Acquedotto' :
                          formData.waterSource === 'Well' ? 'Pozzo' :
                          formData.waterSource === 'Consortium' ? 'Consorzio' :
                          formData.waterSource
                        }</p>}
                        
                        {/* Aiuole selezionate */}
                        {formData.selectedBedIds.length > 0 && (
                          <p><strong>Aiuole:</strong> {
                            beds.filter(b => formData.selectedBedIds.includes(b.id))
                              .map(b => b.name).join(', ')
                          }</p>
                        )}
                        
                        {/* Filari selezionati */}
                        {formData.selectedRowIds.length > 0 && (
                          <p><strong>Filari:</strong> {
                            rows.filter(r => formData.selectedRowIds.includes(r.id))
                              .map(r => r.name).join(', ')
                          } ({formData.selectedRowIds.length} filari)</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="hasTimer"
                          checked={formData.hasTimer}
                          onChange={(e) => setFormData(prev => ({ ...prev, hasTimer: e.target.checked }))}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="hasTimer" className="text-sm font-medium text-gray-700">
                          Sistema con timer/centralina programmabile
                        </label>
                      </div>

                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="hasValve"
                          checked={formData.hasValve}
                          onChange={(e) => setFormData(prev => ({ ...prev, hasValve: e.target.checked }))}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="hasValve" className="text-sm font-medium text-gray-700">
                          Sistema con elettrovalvole smart
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Note aggiuntive
                      </label>
                      <textarea
                        className="w-full px-4 py-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={4}
                        placeholder="Marca componenti, dettagli installazione, particolarità del terreno..."
                        value={formData.notes}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="border-t px-6 py-4 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrev}
              disabled={step === 1}
            >
              <ChevronLeft size={16} className="mr-1" />
              Indietro
            </Button>

            <div className="flex gap-3">
              <Button variant="ghost" onClick={onCancel}>
                Annulla
              </Button>

              {step < totalSteps ? (
                <Button onClick={handleNext} disabled={!canProceed()}>
                  Avanti
                  <ChevronRight size={16} className="ml-1" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={loading || !canProceed()}>
                  {loading ? 'Creazione...' : 'Crea Sistema'}
                </Button>
              )}
            </div>
        </div>
      </div>
    </div>
  )
}
