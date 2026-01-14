'use client'

import { useState, useEffect } from 'react'
import { Settings, User, Bell, Shield, Database, Palette, MapPin, Edit, Trash2, Plus } from 'lucide-react'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { Garden } from '@/types'
import Link from 'next/link'

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('profile')
  const { storageProvider } = useStorage()
  const [gardens, setGardens] = useState<Garden[]>([])
  const [loadingGardens, setLoadingGardens] = useState(false)

  useEffect(() => {
    const loadGardens = async () => {
      if (activeSection === 'data') {
        setLoadingGardens(true)
        try {
          const loadedGardens = await storageProvider.getGardens()
          console.log('📍 Settings: Gardens loaded:', loadedGardens.length, loadedGardens)
          setGardens(loadedGardens)
        } catch (error) {
          console.error('❌ Settings: Error loading gardens:', error)
        } finally {
          setLoadingGardens(false)
        }
      }
    }
    loadGardens()
  }, [activeSection, storageProvider])

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
                <div className="space-y-6">
                  {/* Sezione Orti */}
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-green-900 flex items-center gap-2">
                        <MapPin size={18} />
                        I Tuoi Orti
                      </h3>
                      <Link
                        href="/app/garden"
                        className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700 transition-colors flex items-center gap-2"
                      >
                        <Plus size={16} />
                        Nuovo Orto
                      </Link>
                    </div>
                    
                    {loadingGardens ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
                        <p className="text-sm text-gray-600 mt-2">Caricamento orti...</p>
                      </div>
                    ) : gardens.length === 0 ? (
                      <div className="text-center py-4">
                        <p className="text-sm text-gray-600 mb-2">Nessun orto trovato</p>
                        <Link
                          href="/app/garden"
                          className="text-green-600 hover:text-green-700 text-sm font-medium"
                        >
                          Crea il tuo primo orto →
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {gardens.map((garden) => (
                          <div
                            key={garden.id}
                            className="bg-white p-3 rounded-lg border border-green-200 flex items-center justify-between"
                          >
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{garden.name}</h4>
                              <div className="flex items-center gap-4 mt-1">
                                <p className="text-sm text-gray-600">
                                  {garden.sizeSqMeters || 0} m²
                                </p>
                                {garden.coordinates && (
                                  <p className="text-xs text-gray-500">
                                    📍 {garden.coordinates.latitude.toFixed(4)}, {garden.coordinates.longitude.toFixed(4)}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Link
                                href="/app/garden"
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Modifica"
                              >
                                <Edit size={16} />
                              </Link>
                              <button
                                onClick={async () => {
                                  if (confirm(`Sei sicuro di voler eliminare "${garden.name}"?`)) {
                                    try {
                                      await storageProvider.deleteGarden(garden.id)
                                      setGardens(gardens.filter(g => g.id !== garden.id))
                                    } catch (error) {
                                      console.error('Error deleting garden:', error)
                                      alert('Errore durante l\'eliminazione dell\'orto')
                                    }
                                  }
                                }}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Elimina"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Backup */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-medium text-blue-900 mb-2">Backup Automatico</h3>
                    <p className="text-sm text-blue-700 mb-3">I tuoi dati vengono salvati automaticamente nel cloud</p>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                      Scarica Backup
                    </button>
                  </div>

                  {/* Elimina Account */}
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