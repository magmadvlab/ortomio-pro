'use client'

import { useState, useEffect } from 'react'
import { 
  Satellite, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  Save,
  HelpCircle,
  Info,
  Globe,
  Key,
  Shield,
  Zap
} from 'lucide-react'

interface SatelliteConfig {
  configured: boolean
  clientIdPresent: boolean
  clientSecretPresent: boolean
  instanceIdPresent: boolean
  lastTest?: Date
  testResult?: 'success' | 'error' | 'pending'
  errorMessage?: string
  isTestCredentials?: boolean
}

export default function SatelliteCredentialsManager() {
  const [config, setConfig] = useState<SatelliteConfig>({
    configured: false,
    clientIdPresent: false,
    clientSecretPresent: false,
    instanceIdPresent: false
  })
  
  const [formData, setFormData] = useState({
    clientId: '',
    clientSecret: '',
    instanceId: ''
  })
  
  const [showCredentials, setShowCredentials] = useState(false)
  const [testing, setTesting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showGuide, setShowGuide] = useState(false)

  useEffect(() => {
    checkConfiguration()
  }, [])

  const checkConfiguration = async () => {
    try {
      const response = await fetch('/api/ndvi/config-status')
      if (response.ok) {
        const data = await response.json()
        setConfig(data)
      }
    } catch (error) {
      console.error('Error checking satellite config:', error)
    }
  }

  const testConnection = async () => {
    setTesting(true)
    setConfig(prev => ({ ...prev, testResult: 'pending' }))
    
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
      
      setConfig(prev => ({
        ...prev,
        lastTest: new Date(),
        testResult: data.simulated ? 'error' : 'success',
        errorMessage: data.simulated ? 'Usando credenziali di test - configura le tue per dati reali' : undefined,
        isTestCredentials: data.simulated
      }))
    } catch (error: any) {
      setConfig(prev => ({
        ...prev,
        lastTest: new Date(),
        testResult: 'error',
        errorMessage: error.message
      }))
    } finally {
      setTesting(false)
    }
  }

  const saveCredentials = async () => {
    if (!formData.clientId || !formData.clientSecret) {
      alert('Inserisci Client ID e Client Secret')
      return
    }

    setSaving(true)
    
    try {
      const response = await fetch('/api/ndvi/save-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: formData.clientId,
          clientSecret: formData.clientSecret,
          instanceId: formData.instanceId || 'a9646191-f172-4e6e-a965-670c4a222898'
        })
      })

      const data = await response.json()
      
      if (data.success) {
        alert('Credenziali salvate con successo! La pagina si ricaricherà per applicare le modifiche.')
        window.location.reload()
      } else {
        alert('Errore durante il salvataggio: ' + data.error)
      }
    } catch (error: any) {
      alert('Errore: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copiato negli appunti!')
  }

  const getStatusColor = () => {
    if (config.configured && config.testResult === 'success' && !config.isTestCredentials) return 'green'
    if (config.configured && config.testResult === 'success' && config.isTestCredentials) return 'yellow'
    if (config.configured && config.testResult === 'error') return 'orange'
    return 'red'
  }

  const statusColor = getStatusColor()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Configurazione Satellitare</h2>
          <p className="text-gray-600 mt-1">Configura l'accesso ai dati NDVI di Copernicus</p>
        </div>
        <button
          onClick={() => setShowGuide(!showGuide)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <HelpCircle className="w-4 h-4" />
          Guida Setup
        </button>
      </div>

      {/* Status Overview */}
      <div className={`p-6 rounded-xl border-2 ${
        statusColor === 'green' ? 'bg-green-50 border-green-200' :
        statusColor === 'yellow' ? 'bg-yellow-50 border-yellow-200' :
        statusColor === 'orange' ? 'bg-orange-50 border-orange-200' :
        'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            statusColor === 'green' ? 'bg-green-100' :
            statusColor === 'yellow' ? 'bg-yellow-100' :
            statusColor === 'orange' ? 'bg-orange-100' :
            'bg-red-100'
          }`}>
            <Satellite className={`w-6 h-6 ${
              statusColor === 'green' ? 'text-green-600' :
              statusColor === 'yellow' ? 'text-yellow-600' :
              statusColor === 'orange' ? 'text-orange-600' :
              'text-red-600'
            }`} />
          </div>
          
          <div className="flex-1">
            <h3 className={`text-lg font-semibold mb-2 ${
              statusColor === 'green' ? 'text-green-900' :
              statusColor === 'yellow' ? 'text-yellow-900' :
              statusColor === 'orange' ? 'text-orange-900' :
              'text-red-900'
            }`}>
              {config.configured && config.testResult === 'success' && !config.isTestCredentials ? 'Dati Satellitari Personali Attivi' :
               config.configured && config.testResult === 'success' && config.isTestCredentials ? 'Credenziali di Test Attive' :
               config.configured ? 'Configurazione Parziale' :
               'Configurazione Richiesta'}
            </h3>
            
            {config.isTestCredentials && (
              <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-800">
                  <Info className="w-4 h-4" />
                  <span className="font-medium">Stai usando credenziali di test</span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  Per accedere ai tuoi dati satellitari reali, configura le tue credenziali Copernicus personali.
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center gap-2">
                {config.clientIdPresent ? 
                  <CheckCircle className="w-4 h-4 text-green-600" /> :
                  <AlertCircle className="w-4 h-4 text-red-600" />
                }
                <span className="text-sm">Client ID</span>
              </div>
              
              <div className="flex items-center gap-2">
                {config.clientSecretPresent ? 
                  <CheckCircle className="w-4 h-4 text-green-600" /> :
                  <AlertCircle className="w-4 h-4 text-red-600" />
                }
                <span className="text-sm">Client Secret</span>
              </div>
              
              <div className="flex items-center gap-2">
                {config.instanceIdPresent ? 
                  <CheckCircle className="w-4 h-4 text-green-600" /> :
                  <AlertCircle className="w-4 h-4 text-red-600" />
                }
                <span className="text-sm">Instance ID</span>
              </div>
            </div>

            {config.lastTest && (
              <p className="text-sm text-gray-600">
                Ultimo test: {config.lastTest.toLocaleString('it-IT')} - 
                <span className={`ml-1 font-medium ${
                  config.testResult === 'success' ? 'text-green-600' :
                  config.testResult === 'error' ? 'text-red-600' :
                  'text-yellow-600'
                }`}>
                  {config.testResult === 'success' ? 'Successo' :
                   config.testResult === 'error' ? 'Errore' : 'In corso...'}
                </span>
              </p>
            )}

            {config.errorMessage && (
              <p className="text-sm text-red-600 mt-2">
                {config.errorMessage}
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

      {/* Setup Guide */}
      {showGuide && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-blue-900 mb-4">
            🛰️ Guida Setup Copernicus Dataspace
          </h4>
          
          <div className="space-y-4 text-sm">
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <h5 className="font-medium text-blue-900 mb-2">1. Crea Account Copernicus</h5>
              <p className="text-blue-800 mb-3">
                Registrati gratuitamente su Copernicus Dataspace per accedere ai dati satellitari ESA.
              </p>
              <a
                href="https://shapps.dataspace.copernicus.eu/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                Vai a Copernicus Dataspace
              </a>
            </div>

            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <h5 className="font-medium text-blue-900 mb-2">2. Crea OAuth Client</h5>
              <div className="space-y-2 text-blue-800">
                <p>• Vai su <strong>Account Settings → OAuth clients</strong></p>
                <p>• Clicca <strong>"Create New Client"</strong></p>
                <p>• <strong>Name</strong>: "OrtoMio NDVI" (o nome a tua scelta)</p>
                <p>• <strong>Grant Type</strong>: Client Credentials</p>
                <p>• <strong>Scopes</strong>: Seleziona tutti disponibili</p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <h5 className="font-medium text-blue-900 mb-2">3. Ottieni Credenziali</h5>
              <div className="space-y-2 text-blue-800">
                <p>Dopo aver creato il client, otterrai:</p>
                <p>• <strong>Client ID</strong>: sh-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx</p>
                <p>• <strong>Client Secret</strong>: stringa alfanumerica</p>
                <p>• <strong>Instance ID</strong>: (opzionale, usa quello predefinito)</p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <h5 className="font-medium text-blue-900 mb-2">4. Configura in OrtoMio</h5>
              <p className="text-blue-800">
                Inserisci le credenziali nel modulo qui sotto e clicca "Salva Configurazione".
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Configuration Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-semibold text-gray-900">Configurazione Credenziali</h4>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCredentials(!showCredentials)}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
            >
              {showCredentials ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showCredentials ? 'Nascondi' : 'Mostra'} Campi
            </button>
          </div>
        </div>

        {showCredentials && (
          <div className="space-y-6">
            {/* Client ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Key className="w-4 h-4 inline mr-2" />
                Client ID
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.clientId}
                  onChange={(e) => setFormData(prev => ({ ...prev, clientId: e.target.value }))}
                  placeholder="sh-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={() => copyToClipboard(formData.clientId)}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={!formData.clientId}
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Formato: sh-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
              </p>
            </div>

            {/* Client Secret */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Shield className="w-4 h-4 inline mr-2" />
                Client Secret
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={formData.clientSecret}
                  onChange={(e) => setFormData(prev => ({ ...prev, clientSecret: e.target.value }))}
                  placeholder="Inserisci il Client Secret"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={() => copyToClipboard(formData.clientSecret)}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={!formData.clientSecret}
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Stringa alfanumerica fornita da Copernicus
              </p>
            </div>

            {/* Instance ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Globe className="w-4 h-4 inline mr-2" />
                Instance ID (Opzionale)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.instanceId}
                  onChange={(e) => setFormData(prev => ({ ...prev, instanceId: e.target.value }))}
                  placeholder="a9646191-f172-4e6e-a965-670c4a222898"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={() => setFormData(prev => ({ ...prev, instanceId: 'a9646191-f172-4e6e-a965-670c4a222898' }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                >
                  Default
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Lascia vuoto per usare l'Instance ID predefinito di OrtoMio
              </p>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                <Shield className="w-4 h-4 inline mr-1" />
                Le credenziali sono salvate in modo sicuro e non condivise
              </div>
              <button
                onClick={saveCredentials}
                disabled={saving || !formData.clientId || !formData.clientSecret}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${
                  saving || !formData.clientId || !formData.clientSecret
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? 'Salvando...' : 'Salva Configurazione'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Benefits */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          🚀 Vantaggi dei Dati Satellitari Personali
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <h5 className="font-medium text-gray-900">Dati Reali</h5>
              <p className="text-sm text-gray-600">
                Accesso diretto ai dati Sentinel-2 per il tuo orto specifico
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Globe className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h5 className="font-medium text-gray-900">Copertura Globale</h5>
              <p className="text-sm text-gray-600">
                Funziona ovunque nel mondo con risoluzione 10m
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <RefreshCw className="w-5 h-5 text-purple-600 mt-0.5" />
            <div>
              <h5 className="font-medium text-gray-900">Aggiornamenti Frequenti</h5>
              <p className="text-sm text-gray-600">
                Nuove immagini ogni 5 giorni da satelliti ESA
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-indigo-600 mt-0.5" />
            <div>
              <h5 className="font-medium text-gray-900">Gratuito</h5>
              <p className="text-sm text-gray-600">
                Dati Copernicus completamente gratuiti per uso personale
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Current Status */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Stato Attuale Sistema</h4>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium">Fonte Dati NDVI</span>
            <span className={`text-sm px-2 py-1 rounded ${
              config.isTestCredentials 
                ? 'bg-yellow-100 text-yellow-800' 
                : config.configured 
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
            }`}>
              {config.isTestCredentials ? 'Credenziali Test' : 
               config.configured ? 'Credenziali Personali' : 'Non Configurato'}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium">Risoluzione Dati</span>
            <span className="text-sm text-gray-600">10m per pixel (Sentinel-2)</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium">Frequenza Aggiornamenti</span>
            <span className="text-sm text-gray-600">Ogni 5 giorni</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium">Copertura Storica</span>
            <span className="text-sm text-gray-600">Dal 2015 ad oggi</span>
          </div>
        </div>
      </div>
    </div>
  )
}