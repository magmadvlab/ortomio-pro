'use client'

import React, { useState, useEffect } from 'react'
import { Key, Plus, Trash2, TestTube, Check, X, AlertCircle, Info } from 'lucide-react'
import { 
  getUserAPIConfigurations, 
  saveAPIConfiguration, 
  updateAPIConfiguration, 
  deleteAPIConfiguration,
  testAPIConfiguration,
  type APIConfiguration,
  type ServiceType 
} from '@/services/apiConfigurationService'

const AI_PROVIDERS: Array<{ value: ServiceType; label: string; description: string; defaultModel?: string }> = [
  { 
    value: 'ai_gemini', 
    label: 'Google Gemini', 
    description: 'Default AI provider di OrtoMio. Gratuito con limiti.',
    defaultModel: 'gemini-2.5-flash'
  },
  { 
    value: 'ai_openai', 
    label: 'OpenAI (GPT-4, GPT-3.5)', 
    description: 'Richiede API key OpenAI. A pagamento.',
    defaultModel: 'gpt-4'
  },
  { 
    value: 'ai_anthropic', 
    label: 'Anthropic (Claude)', 
    description: 'Richiede API key Anthropic. A pagamento.',
    defaultModel: 'claude-3-opus'
  },
  { 
    value: 'ai_ollama', 
    label: 'Ollama (Open Source)', 
    description: 'AI locale open source. Richiede Ollama installato localmente.',
    defaultModel: 'llama3'
  },
  { 
    value: 'ai_local', 
    label: 'AI Locale Custom', 
    description: 'Servizio AI personalizzato con API compatibile OpenAI.',
    defaultModel: 'custom'
  },
]

const WEATHER_PROVIDERS: Array<{ value: ServiceType; label: string; description: string }> = [
  { 
    value: 'weather_openmeteo', 
    label: 'Open-Meteo (Default)', 
    description: 'Gratuito, no API key richiesta. Previsioni accurate.'
  },
  { 
    value: 'weather_weatherapi', 
    label: 'WeatherAPI.com', 
    description: 'Richiede API key. Previsioni dettagliate e storiche.'
  },
  { 
    value: 'weather_openweathermap', 
    label: 'OpenWeatherMap', 
    description: 'Richiede API key. Previsioni e dati meteo avanzati.'
  },
  { 
    value: 'weather_custom', 
    label: 'Servizio Meteo Custom', 
    description: 'Servizio meteo personalizzato con API compatibile.'
  },
]

export default function APIConfigurationForm() {
  const [configurations, setConfigurations] = useState<APIConfiguration[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<{
    service_type: ServiceType | ''
    provider_name: string
    api_key: string
    config: {
      model?: string
      base_url?: string
      temperature?: number
    }
    is_default: boolean
  }>({
    service_type: '',
    provider_name: '',
    api_key: '',
    config: {},
    is_default: false,
  })

  useEffect(() => {
    loadConfigurations()
  }, [])

  const loadConfigurations = async () => {
    try {
      setLoading(true)
      const configs = await getUserAPIConfigurations()
      setConfigurations(configs)
    } catch (error) {
      console.error('Errore caricamento configurazioni API:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.service_type || !formData.provider_name || !formData.api_key) {
      alert('Compila tutti i campi obbligatori')
      return
    }

    // Validazione tipo servizio
    const serviceType = formData.service_type as ServiceType
    if (!serviceType) {
      alert('Seleziona un tipo servizio valido')
      return
    }

    try {
      setSaving(true)
      
      if (editingId) {
        await updateAPIConfiguration(editingId, {
          service_type: serviceType,
          provider_name: formData.provider_name,
          api_key: formData.api_key,
          config: formData.config,
          is_default: formData.is_default,
        })
      } else {
        await saveAPIConfiguration({
          user_id: '', // Verrà aggiunto dal servizio
          service_type: serviceType,
          provider_name: formData.provider_name,
          api_key: formData.api_key,
          config: formData.config,
          is_default: formData.is_default,
        })
      }

      await loadConfigurations()
      resetForm()
    } catch (error: any) {
      alert(`Errore salvataggio: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questa configurazione?')) {
      return
    }

    try {
      await deleteAPIConfiguration(id)
      await loadConfigurations()
    } catch (error: any) {
      alert(`Errore eliminazione: ${error.message}`)
    }
  }

  const handleTest = async (id: string) => {
    try {
      setTesting(id)
      const result = await testAPIConfiguration(id)
      if (result.success) {
        alert('Test riuscito! La configurazione funziona.')
      } else {
        alert(`Test fallito: ${result.error}`)
      }
    } catch (error: any) {
      alert(`Errore test: ${error.message}`)
    } finally {
      setTesting(null)
    }
  }

  const resetForm = () => {
    setFormData({
      service_type: '',
      provider_name: '',
      api_key: '',
      config: {},
      is_default: false,
    })
    setShowAddForm(false)
    setEditingId(null)
  }

  const startEdit = (config: APIConfiguration) => {
    setFormData({
      service_type: config.service_type,
      provider_name: config.provider_name,
      api_key: config.api_key,
      config: config.config || {},
      is_default: config.is_default || false,
    })
    setEditingId(config.id || null)
    setShowAddForm(true)
  }

  const getProviderInfo = (serviceType: ServiceType) => {
    if (serviceType.startsWith('ai_')) {
      return AI_PROVIDERS.find(p => p.value === serviceType)
    }
    return WEATHER_PROVIDERS.find(p => p.value === serviceType)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Key size={24} />
          Configurazioni API
        </h2>
        <p className="text-gray-600">Caricamento configurazioni...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Key size={24} />
          Configurazioni API
        </h2>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus size={20} />
            Aggiungi Configurazione
          </button>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="text-blue-600 flex-shrink-0 mt-1" size={20} />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Configura API Keys Personalizzate</p>
            <p className="mb-2">
              Puoi configurare API keys personalizzate per usare servizi AI diversi da Gemini o servizi meteo alternativi.
              Le API keys sono salvate in modo sicuro e utilizzate solo per le tue richieste.
            </p>
            <p className="text-xs">
              <strong>Nota:</strong> Se non configuri API keys personalizzate, il sistema userà le configurazioni di default (Gemini per AI, Open-Meteo per meteo).
            </p>
          </div>
        </div>
      </div>

      {/* Form Aggiunta/Modifica */}
      {showAddForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {editingId ? 'Modifica Configurazione' : 'Nuova Configurazione API'}
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo Servizio *
            </label>
            <select
              value={formData.service_type}
              onChange={(e) => {
                const serviceType = e.target.value as ServiceType
                const provider = getProviderInfo(serviceType)
                const providerWithModel = provider as typeof AI_PROVIDERS[0] | undefined
                setFormData({
                  ...formData,
                  service_type: serviceType,
                  provider_name: provider?.label || '',
                  config: {
                    ...formData.config,
                    model: providerWithModel?.defaultModel || '',
                  },
                })
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">Seleziona tipo servizio</option>
              <optgroup label="Servizi AI">
                {AI_PROVIDERS.map((provider) => (
                  <option key={provider.value} value={provider.value}>
                    {provider.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Servizi Meteo">
                {WEATHER_PROVIDERS.map((provider) => (
                  <option key={provider.value} value={provider.value}>
                    {provider.label}
                  </option>
                ))}
              </optgroup>
            </select>
            {formData.service_type && (
              <p className="text-xs text-gray-500 mt-1">
                {getProviderInfo(formData.service_type as ServiceType)?.description}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome Provider *
            </label>
            <input
              type="text"
              value={formData.provider_name}
              onChange={(e) => setFormData({ ...formData, provider_name: e.target.value })}
              placeholder="es. Gemini Flash, GPT-4, Ollama Llama 3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API Key *
            </label>
            <input
              type="password"
              value={formData.api_key}
              onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
              placeholder="Inserisci la tua API key"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              La chiave sarà salvata in modo sicuro e utilizzata solo per le tue richieste.
            </p>
          </div>

          {/* Configurazioni aggiuntive per AI */}
          {formData.service_type.startsWith('ai_') && (
            <div className="space-y-3 border-t border-gray-200 pt-4">
              <h4 className="font-medium text-gray-900">Configurazioni Avanzate</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Modello
                </label>
                <input
                  type="text"
                  value={formData.config.model || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    config: { ...formData.config, model: e.target.value }
                  })}
                  placeholder="es. gpt-4, gemini-2.5-flash, llama3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              {(formData.service_type === 'ai_ollama' || formData.service_type === 'ai_local') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Base URL
                  </label>
                  <input
                    type="text"
                    value={formData.config.base_url || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      config: { ...formData.config, base_url: e.target.value }
                    })}
                    placeholder="es. http://localhost:11434"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_default"
              checked={formData.is_default}
              onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
              className="w-4 h-4 text-green-600 rounded"
            />
            <label htmlFor="is_default" className="text-sm text-gray-700">
              Usa come provider di default per questo tipo servizio
            </label>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? 'Salvataggio...' : editingId ? 'Aggiorna' : 'Salva'}
            </button>
            <button
              onClick={resetForm}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Annulla
            </button>
          </div>
        </div>
      )}

      {/* Lista Configurazioni */}
      <div className="space-y-4">
        {configurations.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <p className="text-gray-600 mb-2">Nessuna configurazione API salvata</p>
            <p className="text-sm text-gray-500">
              Aggiungi una configurazione per usare servizi AI o meteo personalizzati
            </p>
          </div>
        ) : (
          configurations.map((config) => {
            const providerInfo = getProviderInfo(config.service_type)
            return (
              <div
                key={config.id}
                className="bg-white border border-gray-200 rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{config.provider_name}</h4>
                      {config.is_default && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                          Default
                        </span>
                      )}
                      {!config.is_active && (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                          Inattiva
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {providerInfo?.label || config.service_type}
                    </p>
                    {config.config?.model && (
                      <p className="text-xs text-gray-500 mt-1">
                        Modello: {config.config.model}
                      </p>
                    )}
                    {config.last_error && (
                      <div className="flex items-center gap-2 mt-2 text-xs text-red-600">
                        <AlertCircle size={14} />
                        <span>Ultimo errore: {config.last_error}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleTest(config.id!)}
                      disabled={testing === config.id}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50"
                      title="Testa configurazione"
                    >
                      {testing === config.id ? (
                        <TestTube size={18} className="animate-pulse" />
                      ) : (
                        <TestTube size={18} />
                      )}
                    </button>
                    <button
                      onClick={() => startEdit(config)}
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                      title="Modifica"
                    >
                      <Key size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(config.id!)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Elimina"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

