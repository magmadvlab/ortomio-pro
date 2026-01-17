'use client'

import { useState } from 'react'

export default function SmartHubSimplePage() {
  const [tuyaConfig, setTuyaConfig] = useState({
    clientId: '',
    clientSecret: '',
    deviceId: ''
  })
  const [isConnected, setIsConnected] = useState(false)
  const [deviceStatus, setDeviceStatus] = useState<any>(null)

  const handleConnect = async () => {
    // TODO: Implement Tuya connection
    console.log('Connecting to Tuya...', tuyaConfig)
    setIsConnected(true)
    // Simula device status
    setDeviceStatus({
      name: 'Water Timer RF:433',
      online: true,
      battery: 85,
      isValveOpen: false,
      schedule: '06:00 - 10 min'
    })
  }

  const handleToggleValve = () => {
    setDeviceStatus({
      ...deviceStatus,
      isValveOpen: !deviceStatus.isValveOpen
    })
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          📡 Smart Hub IoT - Tuya Integration
        </h1>
        <p className="text-gray-600 mt-2">
          Configura e controlla il tuo Tuya RF:433 Wireless Water Timer
        </p>
      </div>

      {/* Configuration Card */}
      {!isConnected && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold">🔧 Configurazione Tuya</h2>
            <p className="text-gray-600 mt-1">
              Inserisci le credenziali del tuo account Tuya Cloud
            </p>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 mb-1">
                Client ID
              </label>
              <input
                id="clientId"
                type="text"
                placeholder="es: abc123def456..."
                value={tuyaConfig.clientId}
                onChange={(e) => setTuyaConfig({ ...tuyaConfig, clientId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="clientSecret" className="block text-sm font-medium text-gray-700 mb-1">
                Client Secret
              </label>
              <input
                id="clientSecret"
                type="password"
                placeholder="es: xyz789..."
                value={tuyaConfig.clientSecret}
                onChange={(e) => setTuyaConfig({ ...tuyaConfig, clientSecret: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="deviceId" className="block text-sm font-medium text-gray-700 mb-1">
                Device ID (Water Timer)
              </label>
              <input
                id="deviceId"
                type="text"
                placeholder="es: bf1234567890abcdef"
                value={tuyaConfig.deviceId}
                onChange={(e) => setTuyaConfig({ ...tuyaConfig, deviceId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>Come ottenere le credenziali:</strong>
              </p>
              <ol className="list-decimal ml-4 mt-2 space-y-1 text-sm text-blue-800">
                <li>Vai su <a href="https://iot.tuya.com" target="_blank" rel="noopener noreferrer" className="underline">iot.tuya.com</a></li>
                <li>Crea un Cloud Project</li>
                <li>Copia Client ID e Client Secret</li>
                <li>Aggiungi il tuo dispositivo all'app Tuya Smart</li>
                <li>Trova il Device ID nelle impostazioni del dispositivo</li>
              </ol>
            </div>
            <button
              onClick={handleConnect}
              disabled={!tuyaConfig.clientId || !tuyaConfig.clientSecret || !tuyaConfig.deviceId}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              📡 Connetti a Tuya Cloud
            </button>
          </div>
        </div>
      )}

      {/* Device Status Card */}
      {isConnected && deviceStatus && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  💧 {deviceStatus.name}
                </h2>
                {deviceStatus.online ? (
                  <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                    📡 Online
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-red-600 text-sm font-medium">
                    ⚠️ Offline
                  </span>
                )}
              </div>
              <p className="text-gray-600 mt-1">
                Tuya RF:433 Wireless Water Timer
              </p>
            </div>
            <div className="p-6 space-y-4">
              {/* Battery Status */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">🔋 Batteria</span>
                <span className="text-lg font-bold">{deviceStatus.battery}%</span>
              </div>

              {/* Valve Status */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">💧 Valvola</span>
                <span className={`text-lg font-bold ${deviceStatus.isValveOpen ? 'text-green-600' : 'text-gray-400'}`}>
                  {deviceStatus.isValveOpen ? 'APERTA' : 'CHIUSA'}
                </span>
              </div>

              {/* Schedule */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium flex items-center gap-2">
                  ⏰ Programmazione
                </span>
                <span className="text-sm font-mono">{deviceStatus.schedule}</span>
              </div>

              {/* Control Buttons */}
              <div className="grid grid-cols-2 gap-3 mt-6">
                <button
                  onClick={handleToggleValve}
                  className={`py-2 px-4 rounded-md font-medium ${
                    deviceStatus.isValveOpen
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {deviceStatus.isValveOpen ? '🛑 Chiudi Valvola' : '💧 Apri Valvola'}
                </button>
                <button className="py-2 px-4 rounded-md font-medium border border-gray-300 hover:bg-gray-50">
                  ⚙️ Impostazioni
                </button>
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-900">
              <strong>🚧 Integrazione in Sviluppo</strong>
            </p>
            <p className="mt-2 text-sm text-yellow-800">
              Questa è una versione semplificata per testare la connessione. 
              L'integrazione completa con Tuya Cloud API è in fase di sviluppo secondo la spec in <code className="bg-yellow-100 px-1 rounded">.kiro/specs/tuya-iot-integration/</code>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
