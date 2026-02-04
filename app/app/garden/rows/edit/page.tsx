'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { Garden } from '@/types'
import { ArrowLeft, Save, Droplets, AlertCircle, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { CultivationSelector } from '@/components/settings/CultivationSelector'

export default function EditFieldRowPage() {
  const { storageProvider } = useStorage()
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [garden, setGarden] = useState<Garden | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // URL parameters
  const gardenId = searchParams.get('garden')
  const fieldRowId = searchParams.get('id')
  const isEditing = !!fieldRowId

  // Form state
  const [fieldRowForm, setFieldRowForm] = useState({
    name: '',
    rowNumber: 1,
    lengthMeters: 10,
    distanceFromPreviousRow: 100,
    cultivar: '',
    plantSpacing: 50,
    plantedDate: '',
    orientation: '' as '' | 'N-S' | 'E-W' | 'NE-SW' | 'NW-SE',
    irrigationConfig: {
      enabled: false,
      irrigationType: 'drip' as 'drip' | 'sprinkler' | 'micro_sprinkler' | 'manual',
      tubeLength: 10,
      tubeDiameter: 16,
      emitterSpacing: 30,
      emitterFlowRate: 2.0,
      flowRatePerMeter: 0,
      totalFlowRate: 0,
      pressure: 1.5,
      schedule: {
        frequency: 'daily' as 'daily' | 'every_2_days' | 'every_3_days' | 'weekly',
        times: ['08:00'],
        duration: 30
      }
    }
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!gardenId) {
          setError('ID orto mancante')
          return
        }

        const gardens = await storageProvider.getGardens()
        const selectedGarden = gardens.find(g => g.id === gardenId)
        
        if (!selectedGarden) {
          setError('Orto non trovato')
          return
        }

        setGarden(selectedGarden)

        if (isEditing && fieldRowId) {
          // Load existing field row
          const fieldRows = await storageProvider.getFieldRows(gardenId)
          const existingRow = fieldRows?.find(r => r.id === fieldRowId)
          
          if (existingRow) {
            // Load existing configuration preserving irrigation state
            const existingIrrigationConfig = existingRow.irrigationConfig
            
            // DEBUG: Log per identificare problema persistenza irrigazione
            console.log('🔍 IRRIGATION DEBUG - Existing row:', existingRow)
            console.log('🔍 IRRIGATION DEBUG - Existing config:', existingIrrigationConfig)
            console.log('🔍 IRRIGATION DEBUG - Enabled value:', existingIrrigationConfig?.enabled)
            console.log('🔍 IRRIGATION DEBUG - Type of enabled:', typeof existingIrrigationConfig?.enabled)
            console.log('🔍 IRRIGATION DEBUG - Boolean conversion:', Boolean(existingIrrigationConfig?.enabled))
            
            const irrigationConfig = existingIrrigationConfig ? {
              // CRITICO: Preserva esattamente lo stato enabled esistente
              // Gestisce sia boolean che stringhe ("true"/"false") da localStorage
              enabled: existingIrrigationConfig.enabled === true || existingIrrigationConfig.enabled === 'true',
              irrigationType: existingIrrigationConfig.irrigationType || 'drip' as const,
              tubeLength: existingIrrigationConfig.tubeLength || existingRow.length_meters || 10,
              tubeDiameter: existingIrrigationConfig.tubeDiameter || 16,
              emitterSpacing: existingIrrigationConfig.emitterSpacing || 30,
              emitterFlowRate: existingIrrigationConfig.emitterFlowRate || 2.0,
              flowRatePerMeter: existingIrrigationConfig.flowRatePerMeter || 0,
              totalFlowRate: existingIrrigationConfig.totalFlowRate || 0,
              pressure: existingIrrigationConfig.pressure || 1.5,
              schedule: existingIrrigationConfig.schedule || {
                frequency: 'daily' as const,
                times: ['08:00'],
                duration: 30
              }
            } : {
              enabled: false,
              irrigationType: 'drip' as const,
              tubeLength: existingRow.length_meters || 10,
              tubeDiameter: 16,
              emitterSpacing: 30,
              emitterFlowRate: 2.0,
              flowRatePerMeter: 0,
              totalFlowRate: 0,
              pressure: 1.5,
              schedule: {
                frequency: 'daily' as const,
                times: ['08:00'],
                duration: 30
              }
            }

            setFieldRowForm({
              name: existingRow.name || '',
              rowNumber: existingRow.row_number || existingRow.rowNumber || 1,
              lengthMeters: existingRow.length_meters || existingRow.lengthMeters || 10,
              distanceFromPreviousRow: existingRow.distance_from_previous_row || existingRow.distanceFromPreviousRow || 100,
              cultivar: existingRow.cultivar || '',
              plantSpacing: existingRow.plant_spacing || existingRow.plantSpacing || 50,
              plantedDate: existingRow.planted_date || existingRow.plantedDate || '',
              orientation: (existingRow.orientation || '') as '' | 'N-S' | 'E-W' | 'NE-SW' | 'NW-SE',
              irrigationConfig
            })
          } else {
            setError('Filare non trovato')
          }
        } else {
          // New field row - get next row number
          const fieldRows = await storageProvider.getFieldRows(gardenId)
          const nextRowNumber = (fieldRows?.length || 0) + 1
          setFieldRowForm(prev => ({
            ...prev,
            name: `Filare ${nextRowNumber}`,
            rowNumber: nextRowNumber
          }))
        }
      } catch (error) {
        console.error('Error loading data:', error)
        setError('Errore nel caricamento dei dati')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [storageProvider, gardenId, fieldRowId, isEditing])

  // Calculate irrigation parameters automatically
  const calculateIrrigationParameters = (
    lengthMeters: number,
    emitterSpacing: number,
    emitterFlowRate: number,
    irrigationType: string
  ) => {
    if (irrigationType === 'drip') {
      const lengthCm = lengthMeters * 100
      const emitterCount = Math.floor(lengthCm / emitterSpacing)
      const totalFlowRate = emitterCount * emitterFlowRate
      const flowRatePerMeter = lengthMeters > 0 ? totalFlowRate / lengthMeters : 0
      
      return {
        emitterCount,
        totalFlowRate: Math.round(totalFlowRate * 10) / 10,
        flowRatePerMeter: Math.round(flowRatePerMeter * 10) / 10
      }
    }
    
    return { emitterCount: 0, totalFlowRate: 0, flowRatePerMeter: 0 }
  }

  // Update calculations when parameters change
  const updateIrrigationCalculations = (newForm: typeof fieldRowForm) => {
    if (newForm.irrigationConfig.enabled && newForm.irrigationConfig.irrigationType === 'drip') {
      const calculated = calculateIrrigationParameters(
        newForm.lengthMeters,
        newForm.irrigationConfig.emitterSpacing,
        newForm.irrigationConfig.emitterFlowRate,
        newForm.irrigationConfig.irrigationType
      )
      
      return {
        ...newForm,
        irrigationConfig: {
          ...newForm.irrigationConfig,
          tubeLength: newForm.lengthMeters,
          flowRatePerMeter: calculated.flowRatePerMeter,
          totalFlowRate: calculated.totalFlowRate
        }
      }
    }
    
    return newForm
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      if (!garden) {
        setError('Orto non selezionato')
        return
      }

      if (!fieldRowForm.name.trim()) {
        setError('Il nome del filare è obbligatorio')
        return
      }

      if (fieldRowForm.lengthMeters <= 0) {
        setError('La lunghezza deve essere maggiore di 0')
        return
      }

      // DEBUG: Verifica metodi storageProvider
      console.log('💾 SAVE DEBUG - StorageProvider inspection:')
      console.log('- storageProvider object:', storageProvider)
      console.log('- storageProvider type:', typeof storageProvider)
      console.log('- storageProvider constructor:', storageProvider?.constructor?.name)
      console.log('- createFieldRow exists:', typeof storageProvider.createFieldRow === 'function')
      console.log('- updateFieldRow exists:', typeof storageProvider.updateFieldRow === 'function')
      console.log('- getFieldRows exists:', typeof storageProvider.getFieldRows === 'function')
      
      // Check if storageProvider is properly initialized
      if (!storageProvider) {
        throw new Error('Storage provider is null or undefined')
      }
      
      if (typeof storageProvider !== 'object') {
        throw new Error(`Storage provider is not an object, got: ${typeof storageProvider}`)
      }

      // Validazione aggiuntiva
      if (!storageProvider.createFieldRow || !storageProvider.updateFieldRow) {
        throw new Error('Storage provider methods not available. Check storage provider initialization.')
      }

      if (!garden || !garden.id) {
        throw new Error('Garden not found or invalid garden ID')
      }

      const fieldRowData = {
        name: fieldRowForm.name.trim(),
        rowNumber: fieldRowForm.rowNumber,
        lengthMeters: fieldRowForm.lengthMeters,
        distanceFromPreviousRow: fieldRowForm.distanceFromPreviousRow || undefined,
        cultivar: fieldRowForm.cultivar || undefined,
        plantSpacing: fieldRowForm.plantSpacing || undefined,
        plantedDate: fieldRowForm.plantedDate || undefined,
        orientation: fieldRowForm.orientation || undefined,
        // Converti irrigationConfig in irrigation_line (JSONB)
        irrigationLine: fieldRowForm.irrigationConfig.enabled ? fieldRowForm.irrigationConfig : undefined,
        // Assicurati che zoneId sia definito (può essere null)
        zoneId: null, // Per ora null, in futuro potresti collegarlo a una zona specifica
        isActive: true
      }

      // DEBUG: Log per verificare salvataggio irrigazione
      console.log('💾 SAVE DEBUG - Form irrigation config:', fieldRowForm.irrigationConfig)
      console.log('💾 SAVE DEBUG - Enabled value:', fieldRowForm.irrigationConfig.enabled)
      console.log('💾 SAVE DEBUG - Final data to save:', fieldRowData)
      console.log('💾 SAVE DEBUG - Is editing:', isEditing)
      console.log('💾 SAVE DEBUG - Field row ID:', fieldRowId)
      console.log('💾 SAVE DEBUG - Garden ID:', garden.id)

      if (isEditing && fieldRowId) {
        console.log('💾 SAVE DEBUG - Calling updateFieldRow...')
        try {
          const result = await storageProvider.updateFieldRow(fieldRowId, fieldRowData)
          console.log('💾 SAVE DEBUG - updateFieldRow result:', result)
          console.log('💾 SAVE DEBUG - updateFieldRow completed successfully')
          setSuccess('✅ Filare aggiornato con successo')
        } catch (updateError) {
          console.error('💾 SAVE DEBUG - updateFieldRow failed:', updateError)
          throw updateError
        }
      } else {
        console.log('💾 SAVE DEBUG - Calling createFieldRow...')
        try {
          const createData = {
            gardenId: garden.id,
            ...fieldRowData,
            isActive: true
          }
          console.log('💾 SAVE DEBUG - createFieldRow data:', createData)
          const result = await storageProvider.createFieldRow(createData)
          console.log('💾 SAVE DEBUG - createFieldRow result:', result)
          console.log('💾 SAVE DEBUG - createFieldRow completed successfully')
          setSuccess('✅ Filare creato con successo')
        } catch (createError) {
          console.error('💾 SAVE DEBUG - createFieldRow failed:', createError)
          throw createError
        }
      }

      // Redirect after success
      setTimeout(() => {
        router.push(`/app/garden/rows?garden=${garden.id}`)
      }, 1500)

    } catch (error) {
      // Enhanced error logging to capture all possible error details
      console.error('💾 SAVE ERROR - Raw error:', error)
      console.error('💾 SAVE ERROR - Error type:', typeof error)
      console.error('💾 SAVE ERROR - Error constructor:', error?.constructor?.name)
      console.error('💾 SAVE ERROR - Error toString:', error?.toString?.())
      console.error('💾 SAVE ERROR - Error JSON:', JSON.stringify(error, Object.getOwnPropertyNames(error)))
      
      if (error instanceof Error) {
        console.error('💾 SAVE ERROR - Error message:', error.message)
        console.error('💾 SAVE ERROR - Error stack:', error.stack)
        console.error('💾 SAVE ERROR - Error name:', error.name)
        console.error('💾 SAVE ERROR - Error cause:', error.cause)
      }
      
      // Check if it's a storage provider specific error
      if (error && typeof error === 'object') {
        console.error('💾 SAVE ERROR - Object keys:', Object.keys(error))
        console.error('💾 SAVE ERROR - Object values:', Object.values(error))
        
        // Check for common error properties
        if ('code' in error) console.error('💾 SAVE ERROR - Error code:', error.code)
        if ('status' in error) console.error('💾 SAVE ERROR - Error status:', error.status)
        if ('statusText' in error) console.error('💾 SAVE ERROR - Error statusText:', error.statusText)
        if ('response' in error) console.error('💾 SAVE ERROR - Error response:', error.response)
        if ('data' in error) console.error('💾 SAVE ERROR - Error data:', error.data)
      }
      
      // Try to extract meaningful error message
      let errorMessage = 'Errore sconosciuto durante il salvataggio'
      
      if (error instanceof Error && error.message) {
        errorMessage = error.message
      } else if (error && typeof error === 'object') {
        if ('message' in error && error.message) {
          errorMessage = String(error.message)
        } else if ('error' in error && error.error) {
          errorMessage = String(error.error)
        } else if ('statusText' in error && error.statusText) {
          errorMessage = String(error.statusText)
        } else if (error.toString && error.toString() !== '[object Object]') {
          errorMessage = error.toString()
        }
      } else if (typeof error === 'string') {
        errorMessage = error
      }
      
      console.error('💾 SAVE ERROR - Final error message:', errorMessage)
      setError(`❌ Errore durante il salvataggio del filare: ${errorMessage}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Caricamento...</p>
      </div>
    )
  }

  if (!garden) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Orto non trovato</h2>
          <Link
            href="/app/garden/rows"
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Torna ai Filari
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <Link
              href={`/app/garden/rows?garden=${garden.id}`}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {isEditing ? '✏️ Modifica Filare' : '➕ Nuovo Filare'}
              </h1>
              <p className="text-gray-600 mt-1">
                {garden.name} • URL: /app/garden/rows/edit?garden={garden.id}{fieldRowId && `&id=${fieldRowId}`}
              </p>
              {/* DEBUG INFO */}
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                <p><strong>DEBUG INFO (Server: 3002):</strong></p>
                <p>Garden ID: {garden.id}</p>
                <p>Field Row ID: {fieldRowId || 'NEW'}</p>
                <p>Is Editing: {isEditing ? 'YES' : 'NO'}</p>
                <p>Current URL: {typeof window !== 'undefined' ? window.location.href : 'SSR'}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto p-4">
        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="text-red-600" size={20} />
            <span className="text-red-800">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle className="text-green-600" size={20} />
            <span className="text-green-800">{success}</span>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nome Filare</label>
                <input
                  type="text"
                  value={fieldRowForm.name}
                  onChange={(e) => setFieldRowForm({ ...fieldRowForm, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Es. Filare Pomodori 1"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Numero Filare</label>
                <input
                  type="number"
                  min={1}
                  value={fieldRowForm.rowNumber}
                  onChange={(e) => setFieldRowForm({ ...fieldRowForm, rowNumber: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Lunghezza (metri)</label>
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={fieldRowForm.lengthMeters}
                  onChange={(e) => {
                    const newForm = { ...fieldRowForm, lengthMeters: parseFloat(e.target.value) || 0 }
                    setFieldRowForm(updateIrrigationCalculations(newForm))
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Distanza dal precedente (cm)</label>
                <input
                  type="number"
                  min={0}
                  value={fieldRowForm.distanceFromPreviousRow}
                  onChange={(e) => setFieldRowForm({ ...fieldRowForm, distanceFromPreviousRow: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Es. 100"
                />
              </div>
            </div>

            {/* Cultivation */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Coltura (opzionale)</label>
              <CultivationSelector
                gardenId={garden.id}
                value={fieldRowForm.cultivar}
                onChange={(value) => setFieldRowForm({ ...fieldRowForm, cultivar: value })}
                placeholder="Es. Pomodoro San Marzano"
              />
            </div>

            {/* Advanced Fields */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Configurazione Avanzata</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Spaziatura piante (cm)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={fieldRowForm.plantSpacing}
                    onChange={(e) => {
                      const newForm = { ...fieldRowForm, plantSpacing: parseInt(e.target.value) || 0 }
                      setFieldRowForm(updateIrrigationCalculations(newForm))
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Es. 50"
                  />
                  {fieldRowForm.plantSpacing > 0 && fieldRowForm.lengthMeters > 0 && (
                    <p className="text-sm text-green-600 mt-1">
                      ≈ {Math.floor((fieldRowForm.lengthMeters * 100) / fieldRowForm.plantSpacing)} piante
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Data semina/trapianto</label>
                  <input
                    type="date"
                    value={fieldRowForm.plantedDate}
                    onChange={(e) => setFieldRowForm({ ...fieldRowForm, plantedDate: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Orientamento filare</label>
                  <select
                    value={fieldRowForm.orientation}
                    onChange={(e) => setFieldRowForm({ ...fieldRowForm, orientation: e.target.value as any })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Non specificato</option>
                    <option value="N-S">Nord-Sud (N-S)</option>
                    <option value="E-W">Est-Ovest (E-W)</option>
                    <option value="NE-SW">Nord-Est / Sud-Ovest</option>
                    <option value="NW-SE">Nord-Ovest / Sud-Est</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Irrigation Configuration */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Droplets className="text-blue-600" size={20} />
                  Sistema di Irrigazione
                </h3>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={fieldRowForm.irrigationConfig.enabled}
                    onChange={(e) => {
                      const newForm = {
                        ...fieldRowForm,
                        irrigationConfig: {
                          ...fieldRowForm.irrigationConfig,
                          enabled: e.target.checked
                        }
                      }
                      setFieldRowForm(updateIrrigationCalculations(newForm))
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Abilita irrigazione</span>
                </label>
              </div>

              {fieldRowForm.irrigationConfig.enabled && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-4">
                  {/* Irrigation Type */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-blue-800 mb-2">Tipo Sistema</label>
                      <select
                        value={fieldRowForm.irrigationConfig.irrigationType}
                        onChange={(e) => {
                          const newForm = {
                            ...fieldRowForm,
                            irrigationConfig: {
                              ...fieldRowForm.irrigationConfig,
                              irrigationType: e.target.value as any
                            }
                          }
                          setFieldRowForm(updateIrrigationCalculations(newForm))
                        }}
                        className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="drip">Goccia a Goccia</option>
                        <option value="sprinkler">Aspersione</option>
                        <option value="micro_sprinkler">Micro-aspersione</option>
                        <option value="manual">Manuale</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-blue-800 mb-2">Diametro Tubo</label>
                      <select
                        value={fieldRowForm.irrigationConfig.tubeDiameter}
                        onChange={(e) => setFieldRowForm({
                          ...fieldRowForm,
                          irrigationConfig: {
                            ...fieldRowForm.irrigationConfig,
                            tubeDiameter: parseInt(e.target.value)
                          }
                        })}
                        className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="12">12 mm</option>
                        <option value="16">16 mm</option>
                        <option value="20">20 mm</option>
                        <option value="25">25 mm</option>
                      </select>
                    </div>
                  </div>

                  {/* Drip Configuration */}
                  {fieldRowForm.irrigationConfig.irrigationType === 'drip' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-blue-800 mb-2">Passo Gocciolatori (cm)</label>
                        <input
                          type="number"
                          min={10}
                          max={100}
                          step={5}
                          value={fieldRowForm.irrigationConfig.emitterSpacing}
                          onChange={(e) => {
                            const newForm = {
                              ...fieldRowForm,
                              irrigationConfig: {
                                ...fieldRowForm.irrigationConfig,
                                emitterSpacing: parseInt(e.target.value) || 30
                              }
                            }
                            setFieldRowForm(updateIrrigationCalculations(newForm))
                          }}
                          className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-blue-800 mb-2">Portata Gocciolatore (L/h)</label>
                        <select
                          value={fieldRowForm.irrigationConfig.emitterFlowRate}
                          onChange={(e) => {
                            const newForm = {
                              ...fieldRowForm,
                              irrigationConfig: {
                                ...fieldRowForm.irrigationConfig,
                                emitterFlowRate: parseFloat(e.target.value)
                              }
                            }
                            setFieldRowForm(updateIrrigationCalculations(newForm))
                          }}
                          className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="1.0">1.0 L/h</option>
                          <option value="2.0">2.0 L/h</option>
                          <option value="4.0">4.0 L/h</option>
                          <option value="8.0">8.0 L/h</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-blue-800 mb-2">Pressione (bar)</label>
                        <input
                          type="number"
                          min={0.5}
                          max={5}
                          step={0.1}
                          value={fieldRowForm.irrigationConfig.pressure}
                          onChange={(e) => setFieldRowForm({
                            ...fieldRowForm,
                            irrigationConfig: {
                              ...fieldRowForm.irrigationConfig,
                              pressure: parseFloat(e.target.value) || 1.5
                            }
                          })}
                          className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* Automatic Calculations */}
                  {fieldRowForm.irrigationConfig.irrigationType === 'drip' && fieldRowForm.irrigationConfig.totalFlowRate > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-green-800 mb-2">📊 Calcoli Automatici</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-green-700">
                        <div>
                          <span className="font-medium">Gocciolatori:</span>
                          <br />
                          {Math.floor((fieldRowForm.lengthMeters * 100) / fieldRowForm.irrigationConfig.emitterSpacing)} unità
                        </div>
                        <div>
                          <span className="font-medium">Portata Totale:</span>
                          <br />
                          {fieldRowForm.irrigationConfig.totalFlowRate} L/h
                        </div>
                        <div>
                          <span className="font-medium">Portata per Metro:</span>
                          <br />
                          {fieldRowForm.irrigationConfig.flowRatePerMeter} L/h/m
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Schedule */}
                  <div className="border-t border-blue-200 pt-4">
                    <h4 className="text-sm font-semibold text-blue-800 mb-3">⏰ Programmazione Base</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-blue-700 mb-1">Frequenza</label>
                        <select
                          value={fieldRowForm.irrigationConfig.schedule.frequency}
                          onChange={(e) => setFieldRowForm({
                            ...fieldRowForm,
                            irrigationConfig: {
                              ...fieldRowForm.irrigationConfig,
                              schedule: {
                                ...fieldRowForm.irrigationConfig.schedule,
                                frequency: e.target.value as any
                              }
                            }
                          })}
                          className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="daily">Giornaliera</option>
                          <option value="every_2_days">Ogni 2 giorni</option>
                          <option value="every_3_days">Ogni 3 giorni</option>
                          <option value="weekly">Settimanale</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-blue-700 mb-1">Orario</label>
                        <input
                          type="time"
                          value={fieldRowForm.irrigationConfig.schedule.times[0] || '08:00'}
                          onChange={(e) => setFieldRowForm({
                            ...fieldRowForm,
                            irrigationConfig: {
                              ...fieldRowForm.irrigationConfig,
                              schedule: {
                                ...fieldRowForm.irrigationConfig.schedule,
                                times: [e.target.value]
                              }
                            }
                          })}
                          className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-blue-700 mb-1">Durata (min)</label>
                        <input
                          type="number"
                          min={1}
                          max={120}
                          value={fieldRowForm.irrigationConfig.schedule.duration}
                          onChange={(e) => setFieldRowForm({
                            ...fieldRowForm,
                            irrigationConfig: {
                              ...fieldRowForm.irrigationConfig,
                              schedule: {
                                ...fieldRowForm.irrigationConfig.schedule,
                                duration: parseInt(e.target.value) || 30
                              }
                            }
                          })}
                          className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-200">
            <Link
              href={`/app/garden/rows?garden=${garden.id}`}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annulla
            </Link>
            <button
              onClick={handleSave}
              disabled={saving || !fieldRowForm.name.trim() || fieldRowForm.lengthMeters <= 0}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Salvataggio...
                </>
              ) : (
                <>
                  <Save size={16} />
                  {isEditing ? 'Aggiorna Filare' : 'Crea Filare'}
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}