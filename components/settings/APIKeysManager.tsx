'use client'

import { useState, useEffect } from 'react'
import { Key, Plus, Edit2, Trash2, Eye, EyeOff, TestTube, Check, X, AlertCircle } from 'lucide-react'
import { APIKey, APIService, API_SERVICES, APIKeyTestResult } from '@/types/apiKeys'
import {
  getUserAPIKeys,
  createAPIKey,
  updateAPIKey,
  deleteAPIKey,
  toggleAPIKeyStatus,
  testAPIKey,
  getServiceConfig
} from '@/services/apiKeysService'

export default function APIKeysManager() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingKey, setEditingKey] = useState<APIKey | null>(null)
  const [showKeyValue, setShowKeyValue] = useState<Record<string, boolean>>({})
  const [testResults, setTestResults] = useState<Record<string, APIKeyTestResult>>({})

  useEffect(() => {
    loadAPIKeys()
  }, [])

  const loadAPIKeys = async () => {
    try {
      setLoading(true)
      // TODO: Get actual user ID
      const userId = 'current-user-id'
      const keys = await getUserAPIKeys(userId)
      setApiKeys(keys)
    } catch (error) {
      console.error('Error loading API keys:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (keyId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questa API key?')) return

    try {
      await deleteAPIKey(keyId)
      await loadAPIKeys()
    } catch (error) {
      console.error('Error deleting API key:', error)
      alert('Errore durante l\'eliminazione della chiave')
    }
  }

  const handleToggleStatus = async (keyId: string) => {
    try {
      await toggleAPIKeyStatus(keyId)
      await loadAPIKeys()
    } catch (error) {
      console.error('Error toggling API key status:', error)
      alert('Errore durante l\'aggiornamento dello stato')
    }
  }

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeyValue(prev => ({ ...prev, [keyId]: !prev[keyId] }))
  }

  const maskKey = (key: string): string => {
    if (key.length <= 8) return '••••••••'
    return key.substring(0, 4) + '••••••••' + key.substring(key.length - 4)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Key size={24} className="text-green-600" />
            API Keys
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Gestisci le tue chiavi API per servizi esterni
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus size={18} />
          Aggiungi API Key
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">Perché configurare le tue API keys?</p>
            <ul className="list-disc list-inside space-y-1 text-blue-800">
              <li>Usa i tuoi account personali per servizi AI (OpenAI, Anthropic, etc.)</li>
              <li>Nessun limite di utilizzo imposto da OrtoMio</li>
              <li>Controllo completo sui costi e sull'utilizzo</li>
              <li>Le chiavi sono criptate e sicure</li>
            </ul>
          </div>
        </div>
      </div>

      {/* API Keys List */}
      {apiKeys.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Key size={48} className="mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600 font-medium mb-2">Nessuna API key configurata</p>
          <p className="text-sm text-gray-500 mb-4">
            Aggiungi le tue chiavi API per utilizzare servizi esterni
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus size={18} />
            Aggiungi Prima API Key
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {apiKeys.map((key) => {
            const serviceConfig = getServiceConfig(key.service)
            const testResult = testResults[key.id]

            return (
              <div
                key={key.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{serviceConfig.icon}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900">{key.name}</h3>
                        <p className="text-sm text-gray-600">{serviceConfig.displayName}</p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          key.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {key.isActive ? 'Attiva' : 'Disattivata'}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">Chiave:</span>
                        <code className="bg-gray-100 px-2 py-1 rounded font-mono text-xs">
                          {showKeyValue[key.id] ? key.keyValue : maskKey(key.keyValue)}
                        </code>
                        <button
                          onClick={() => toggleKeyVisibility(key.id)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          {showKeyValue[key.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>

                      {key.usageCount > 0 && (
                        <div className="text-gray-600">
                          Utilizzi: {key.usageCount}
                          {key.lastUsed && (
                            <span className="ml-2">
                              • Ultimo uso: {new Date(key.lastUsed).toLocaleDateString('it-IT')}
                            </span>
                          )}
                        </div>
                      )}

                      {testResult && (
                        <div
                          className={`flex items-center gap-2 ${
                            testResult.success ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {testResult.success ? <Check size={14} /> : <X size={14} />}
                          <span>{testResult.message}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {serviceConfig.testable && (
                      <button
                        onClick={async () => {
                          try {
                            const result = await testAPIKey(key.service, key.keyValue, key.config)
                            setTestResults(prev => ({ ...prev, [key.id]: result }))
                          } catch (error) {
                            console.error('Test failed:', error)
                          }
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Testa chiave"
                      >
                        <TestTube size={18} />
                      </button>
                    )}
                    <button
                      onClick={() => handleToggleStatus(key.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        key.isActive
                          ? 'text-orange-600 hover:bg-orange-50'
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                      title={key.isActive ? 'Disattiva' : 'Attiva'}
                    >
                      {key.isActive ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    <button
                      onClick={() => setEditingKey(key)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Modifica"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(key.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Elimina"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || editingKey) && (
        <APIKeyModal
          apiKey={editingKey}
          onClose={() => {
            setShowAddModal(false)
            setEditingKey(null)
          }}
          onSave={async () => {
            await loadAPIKeys()
            setShowAddModal(false)
            setEditingKey(null)
          }}
        />
      )}
    </div>
  )
}

// API Key Modal Component
function APIKeyModal({
  apiKey,
  onClose,
  onSave
}: {
  apiKey: APIKey | null
  onClose: () => void
  onSave: () => void
}) {
  const [selectedService, setSelectedService] = useState<APIService>(apiKey?.service || 'OpenAI')
  const [name, setName] = useState(apiKey?.name || '')
  const [formData, setFormData] = useState<Record<string, string>>(apiKey?.config || {})
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<APIKeyTestResult | null>(null)

  const serviceConfig = getServiceConfig(selectedService)

  const handleTest = async () => {
    setTesting(true)
    setTestResult(null)

    try {
      const keyValue = formData[serviceConfig.fields.find(f => f.type === 'password')?.name || 'apiKey'] || ''
      const result = await testAPIKey(selectedService, keyValue, formData)
      setTestResult(result)
    } catch (error) {
      console.error('Test failed:', error)
    } finally {
      setTesting(false)
    }
  }

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Inserisci un nome per la chiave')
      return
    }

    const keyField = serviceConfig.fields.find(f => f.type === 'password')
    const keyValue = formData[keyField?.name || 'apiKey']

    if (!keyValue) {
      alert('Inserisci la chiave API')
      return
    }

    try {
      // TODO: Get actual user ID
      const userId = 'current-user-id'

      if (apiKey) {
        await updateAPIKey(apiKey.id, { name, config: formData })
      } else {
        await createAPIKey(userId, selectedService, name, keyValue, formData)
      }

      onSave()
    } catch (error) {
      console.error('Error saving API key:', error)
      alert('Errore durante il salvataggio')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {apiKey ? 'Modifica API Key' : 'Aggiungi API Key'}
          </h2>

          <div className="space-y-4">
            {/* Service Selection */}
            {!apiKey && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Servizio
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.values(API_SERVICES).map((service) => (
                    <button
                      key={service.service}
                      onClick={() => setSelectedService(service.service)}
                      className={`p-4 border-2 rounded-lg text-left transition-colors ${
                        selectedService === service.service
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{service.icon}</span>
                        <span className="font-semibold text-gray-900">{service.displayName}</span>
                      </div>
                      <p className="text-xs text-gray-600">{service.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome Identificativo
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Es: Account Personale OpenAI"
              />
            </div>

            {/* Dynamic Fields */}
            {serviceConfig.fields.map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {field.type === 'select' ? (
                  <select
                    value={formData[field.name] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {field.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    value={formData[field.name] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder={field.placeholder}
                  />
                )}
                {field.helpText && (
                  <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>
                )}
              </div>
            ))}

            {/* Test Result */}
            {testResult && (
              <div
                className={`p-3 rounded-lg ${
                  testResult.success
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  {testResult.success ? (
                    <Check size={18} className="text-green-600" />
                  ) : (
                    <X size={18} className="text-red-600" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      testResult.success ? 'text-green-900' : 'text-red-900'
                    }`}
                  >
                    {testResult.message}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-200">
            {serviceConfig.testable && (
              <button
                onClick={handleTest}
                disabled={testing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <TestTube size={18} />
                {testing ? 'Test in corso...' : 'Testa Chiave'}
              </button>
            )}
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Salva
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Annulla
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
