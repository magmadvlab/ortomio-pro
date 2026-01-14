'use client'

import { useState } from 'react'
import { Settings, User, Bell, Shield, Database, Palette } from 'lucide-react'

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('profile')

  const sections = [
    { id: 'profile', label: 'Profilo', icon: User },
    { id: 'notifications', label: 'Notifiche', icon: Bell },
    { id: 'security', label: 'Sicurezza', icon: Shield },
    { id: 'data', label: 'Dati', icon: Database },
    { id: 'appearance', label: 'Aspetto', icon: Palette },
  ]

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Settings className="text-gray-600" size={28} />
          Impostazioni
        </h1>
        <p className="text-gray-600 mt-1">Configura la tua esperienza OrtoMio</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Sezioni */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <nav className="space-y-2">
              {sections.map((section) => {
                const Icon = section.icon
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeSection === section.id
                        ? 'bg-green-100 text-green-900 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={18} />
                    {section.label}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Contenuto Principale */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {activeSection === 'profile' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Profilo Utente</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Il tuo nome"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="la-tua-email@esempio.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo di Coltivazione</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                      <option>Orto domestico</option>
                      <option>Agricoltura professionale</option>
                      <option>Vivaio</option>
                      <option>Ricerca</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'notifications' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Notifiche</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Promemoria Irrigazione</h3>
                      <p className="text-sm text-gray-600">Ricevi notifiche quando è ora di innaffiare</p>
                    </div>
                    <input type="checkbox" className="rounded" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Allerte Meteo</h3>
                      <p className="text-sm text-gray-600">Avvisi per condizioni meteorologiche avverse</p>
                    </div>
                    <input type="checkbox" className="rounded" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Suggerimenti AI</h3>
                      <p className="text-sm text-gray-600">Consigli personalizzati dall'intelligenza artificiale</p>
                    </div>
                    <input type="checkbox" className="rounded" defaultChecked />
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'security' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Sicurezza</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Cambia Password</h3>
                    <div className="space-y-3">
                      <input
                        type="password"
                        placeholder="Password attuale"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <input
                        type="password"
                        placeholder="Nuova password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <input
                        type="password"
                        placeholder="Conferma nuova password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'data' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Gestione Dati</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-medium text-blue-900 mb-2">Backup Automatico</h3>
                    <p className="text-sm text-blue-700 mb-3">I tuoi dati vengono salvati automaticamente nel cloud</p>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                      Scarica Backup
                    </button>
                  </div>
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h3 className="font-medium text-red-900 mb-2">Elimina Account</h3>
                    <p className="text-sm text-red-700 mb-3">Elimina permanentemente il tuo account e tutti i dati</p>
                    <button className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors">
                      Elimina Account
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'appearance' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Aspetto</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Tema</h3>
                    <div className="grid grid-cols-3 gap-3">
                      <button className="p-3 border-2 border-green-500 rounded-lg bg-white">
                        <div className="w-full h-8 bg-gradient-to-r from-green-400 to-green-600 rounded mb-2"></div>
                        <span className="text-sm font-medium">Chiaro</span>
                      </button>
                      <button className="p-3 border-2 border-gray-300 rounded-lg bg-white">
                        <div className="w-full h-8 bg-gradient-to-r from-gray-700 to-gray-900 rounded mb-2"></div>
                        <span className="text-sm font-medium">Scuro</span>
                      </button>
                      <button className="p-3 border-2 border-gray-300 rounded-lg bg-white">
                        <div className="w-full h-8 bg-gradient-to-r from-blue-400 to-purple-600 rounded mb-2"></div>
                        <span className="text-sm font-medium">Auto</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-gray-200">
              <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
                Salva Modifiche
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}