'use client'

import React, { useState, useEffect } from 'react'
import { 
  Satellite, 
  CheckCircle, 
  AlertCircle, 
  Settings, 
  ExternalLink,
  Copy,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react'

interface ConfigStatus {
  configured: boolean
  clientIdPresent: boolean
  clientSecretPresent: boolean
  instanceIdPresent: boolean
  lastTest?: Date
  testResult?: 'success' | 'error' | 'pending'
  errorMessage?: string
}

export default function SatelliteConfigStatus() {
  const [status, setStatus] = useState<ConfigStatus>({
    configured: false,
    clientIdPresent: false,
    clientSecretPresent: false,
    instanceIdPresent: false
  })
  const [showCredentials, setShowCredentials] = useState(false)
  const [testing, setTesting] = useState(false)

  useEffect(() => {
    checkConfiguration()
  }, [])

  const checkConfiguration = async () => {
    try {
      const response = await fetch('/api/ndvi/config-status')
      if (response.ok) {
        const data = await response.json()
        setStatus(data)
      }
    } catch (error) {
      console.error('Error checking satellite config:', error)
    }
  }

  const testConnection = async () => {
    setTesting(true)
    setStatus(prev => ({ ...prev, testResult: 'pending' }))
    
    try {
      const response = await fetch('/api/ndvi/sentinel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bbox: { north: 42.0, south: 41.9, east: 12.6, west: 12.5 },
          dateFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          dateTo: new Date().toISOString().split('T')[0],
          cloudCoverage: 20
        })
      })

      const data = await response.json()
      
      setStatus(prev => ({
        ...prev,
        lastTest: new Date(),
        testResult: data.simulated ? 'error' : 'success',
        errorMessage: data.simulated ? 'Credenziali non configurate - usando dati simulati' : undefined
      }))
    } catch (error: any) {
      setStatus(prev => ({
        ...prev,
        lastTest: new Date(),
        testResult: 'error',
        errorMessage: error.message
      }))
    } finally {
      setTesting(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getStatusColor = () => {
    if (status.configured && status.testResult === 'success') return 'green'
    if (status.configured && status.testResult === 'error') return 'yellow'
    return 'red'
  }

  const statusColor = getStatusColor()

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <div className={`p-6 rounded-xl border-2 ${
        statusColor === 'green' ? 'bg-green-50 border-green-200' :
        statusColor === 'yellow' ? 'bg-yellow-50 border-yellow-200' :
        'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            statusColor === 'green' ? 'bg-green-100' :
            statusColor === 'yellow' ? 'bg-yellow-100' :
            'bg-red-100'
          }`}>
            <Satellite className={`w-6 h-6 ${
              statusColor === 'green' ? 'text-green-600' :
              statusColor === 'yellow' ? 'text-yellow-600' :
              'text-red-600'
            }`} />
          </div>
          
          <div className="flex-1">
            <h3 className={`text-lg font-semibold mb-2 ${
              statusColor === 'green' ? 'text-green-900' :
              statusColor === 'yellow' ? 'text-yellow-900' :
              'text-red-900'
            }`}>
              {status.configured && status.testResult === 'success' ? 'Dati Satellitari Attivi' :
               status.configured ? 'Configurazione Parziale' :
               'Configurazione Richiesta'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center gap-2">
                {status.clientIdPresent ? 
                  <CheckCircle className="w-4 h-4 text-green-600" /> :
                  <AlertCircle className="w-4 h-4 text-red-600" />
                }
                <span className="text-sm">Client ID</span>
              </div>
              
              <div className="flex items-center gap-2">
                {status.clientSecretPresent ? 
                  <CheckCircle className="w-4 h-4 text-green-600" /> :
                  <AlertCircle className="w-4 h-4 text-red-600" />
                }
                <span className="text-sm">Client Secret</span>
              </div>
              
              <div className="flex items-center gap-2">
                {status.instanceIdPresent ? 
                  <CheckCircle className="w-4 h-4 text-green-600" /> :
                  <AlertCircle className="w-4 h-4 text-red-600" />
                }
                <span className="text-sm">Instance ID</span>
              </div>
            </div>

            {status.lastTest && (
              <p className="text-sm text-gray-600">
                Ultimo test: {status.lastTest.toLocaleString('it-IT')} - 
                <span className={`ml-1 font-medium ${
                  status.testResult === 'success' ? 'text-green-600' :
                  status.testResult === 'error' ? 'text-red-600' :
                  'text-yellow-600'
                }`}>
                  {status.testResult === 'success' ? 'Successo' :
                   status.testResult === 'error' ? 'Errore' : 'In corso...'}
                </span>
              </p>
            )}

            {status.errorMessage && (
              <p className="text-sm text-red-600 mt-2 font-mono">
                {status.errorMessage}
              </p>
            )}
          </div>

          <button
            onClick={testConnection}
            disabled={testing}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              testing ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
              'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${testing ? 'animate-spin' : ''}`} />
            {testing ? 'Testing...' : 'Test'}
          </button>
        </div>
      </div>

      {/* Configuration Details */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900">Configurazione Copernicus</h4>
          <button
            onClick={() => setShowCredentials(!showCredentials)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
          >
            {showCredentials ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showCredentials ? 'Nascondi' : 'Mostra'} Dettagli
          </button>
        </div>

        {showCredentials && (
          <div className="space-y-4">
            {/* Account Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-medium text-blue-900 mb-2">Account Rilevato</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Email:</span>
                  <span className="font-mono">roberto.lalinga@gmail.com</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Configuration:</span>
                  <span className="font-mono">OrtoMio NDVI</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-700">Instance ID:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs">a9646191-f172-4e6e-a965-670c4a222898</span>
                    <button
                      onClick={() => copyToClipboard('a9646191-f172-4e6e-a965-670c4a222898')}
                      className="p-1 hover:bg-blue-100 rounded"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Setup Instructions */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-3">Setup Automatico</h5>
              <div className="space-y-3">
                <div className="bg-gray-800 text-green-400 p-3 rounded font-mono text-sm">
                  <div>$ node setup-satellite-credentials.js</div>
                </div>
                <p className="text-sm text-gray-600">
                  Esegui questo comando per configurare automaticamente le credenziali
                </p>
                <button
                  onClick={() => {
                    // Trigger automatic setup
                    fetch('/api/ndvi/setup-credentials', { method: 'POST' })
                      .then(res => res.json())
                      .then(data => {
                        if (data.success) {
                          alert('Configurazione completata! Ricarica la pagina.')
                          checkConfiguration()
                        } else {
                          alert('Errore durante la configurazione: ' + data.error)
                        }
                      })
                      .catch(err => alert('Errore: ' + err.message))
                  }}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Configura Automaticamente
                </button>
              </div>
            </div>

            {/* Manual Setup */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-3">Setup Manuale</h5>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client ID
                  </label>
                  <input
                    type="text"
                    placeholder="Inserisci il tuo Client ID"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client Secret
                  </label>
                  <input
                    type="password"
                    placeholder="Inserisci il tuo Client Secret"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instance ID
                  </label>
                  <input
                    type="text"
                    value="a9646191-f172-4e6e-a965-670c4a222898"
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                  />
                </div>
                
                <button
                  onClick={() => {
                    // Save manual configuration
                    const clientId = (document.querySelector('input[placeholder="Inserisci il tuo Client ID"]') as HTMLInputElement)?.value
                    const clientSecret = (document.querySelector('input[placeholder="Inserisci il tuo Client Secret"]') as HTMLInputElement)?.value
                    
                    if (!clientId || !clientSecret) {
                      alert('Inserisci Client ID e Client Secret')
                      return
                    }
                    
                    fetch('/api/ndvi/save-credentials', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        clientId,
                        clientSecret,
                        instanceId: 'a9646191-f172-4e6e-a965-670c4a222898'
                      })
                    })
                    .then(res => res.json())
                    .then(data => {
                      if (data.success) {
                        alert('Credenziali salvate! Ricarica la pagina.')
                        checkConfiguration()
                      } else {
                        alert('Errore durante il salvataggio: ' + data.error)
                      }
                    })
                    .catch(err => alert('Errore: ' + err.message))
                  }}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Salva Configurazione
                </button>
              </div>
            </div>

            {/* Links */}
            <div className="flex flex-wrap gap-3">
              <a
                href="https://sh.dataspace.copernicus.eu/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                Copernicus Dashboard
              </a>
              
              <a
                href="https://docs.sentinel-hub.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                Documentazione
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Layer Information */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Layer Disponibili</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { name: 'Vegetation Index - NDVI', primary: true },
            { name: 'Agriculture', primary: false },
            { name: 'Color Infrared (vegetation)', primary: false },
            { name: 'Moisture Index', primary: false },
            { name: 'Natural color (true color)', primary: false },
            { name: 'SWIR', primary: false }
          ].map((layer, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border ${
                layer.primary 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                {layer.primary && <CheckCircle className="w-4 h-4 text-green-600" />}
                <span className={`text-sm font-medium ${
                  layer.primary ? 'text-green-900' : 'text-gray-700'
                }`}>
                  {layer.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}