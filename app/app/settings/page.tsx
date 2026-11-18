'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Settings, User, Bell, Shield, Database, Palette, MapPin, Trash2, Plus, Edit2 } from 'lucide-react'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { Garden } from '@/types'
import { GardenTypeWizard } from '@/components/GardenTypeWizard'
import { GardenEditModal } from '@/components/settings/GardenEditModal'
import APIKeysManager from '@/components/settings/APIKeysManager'
import OrganizationManager from '@/components/settings/OrganizationManager'
import SatelliteCredentialsManager from '@/components/settings/SatelliteCredentialsManager'
import DataSettingsPanel from '@/components/settings/DataSettingsPanel'
import UserSettingsPanels from '@/components/settings/UserSettingsPanels'
import { gardenManagementHref } from '@/lib/gardens/navigation'

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('profile')
  const { storageProvider } = useStorage()
  const [gardens, setGardens] = useState<Garden[]>([])
  const [loadingGardens, setLoadingGardens] = useState(false)
  const [showGardenWizard, setShowGardenWizard] = useState(false)
  const [editingGarden, setEditingGarden] = useState<Garden | null>(null)

  useEffect(() => {
    const loadGardens = async () => {
      if (activeSection === 'data' || activeSection === 'gardens') {
        setLoadingGardens(true)
        try {
          const loadedGardens = await storageProvider.getGardens()
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

  const handleGardenCreated = async (garden: Garden) => {
    setShowGardenWizard(false)
    // Reload gardens list
    const loadedGardens = await storageProvider.getGardens()
    setGardens(loadedGardens)
  }

  const handleGardenEdited = async () => {
    console.log('✅ Garden edited')
    // Reload gardens list
    const loadedGardens = await storageProvider.getGardens()
    setGardens(loadedGardens)
  }

  // Check URL params for section
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const section = params.get('section')
    if (section && sections.find(s => s.id === section)) {
      setActiveSection(section)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sections = [
    { id: 'profile', label: 'Profilo', icon: User },
    { id: 'gardens', label: 'I Miei Orti', icon: MapPin },
    { id: 'satellite', label: 'Dati Satellitari', icon: Settings },
    { id: 'apikeys', label: 'API Keys', icon: Settings },
    { id: 'organization', label: 'Organizzazione', icon: Settings },
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
            {activeSection === 'gardens' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">I Miei Orti</h2>
                <div className="space-y-6">
                  {/* Lista Orti */}
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-green-900 flex items-center gap-2">
                        <MapPin size={18} />
                        Orti Configurati
                      </h3>
                      <button
                        onClick={() => setShowGardenWizard(true)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors flex items-center gap-2"
                      >
                        <Plus size={16} />
                        Nuovo Orto
                      </button>
                    </div>
                    
                    {loadingGardens ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                        <p className="text-sm text-gray-600 mt-2">Caricamento orti...</p>
                      </div>
                    ) : gardens.length === 0 ? (
                      <div className="text-center py-8 bg-white rounded-lg border-2 border-dashed border-gray-300">
                        <MapPin size={48} className="mx-auto text-gray-400 mb-3" />
                        <p className="text-gray-600 font-medium mb-2">Nessun orto configurato</p>
                        <p className="text-sm text-gray-500 mb-4">Crea il tuo primo orto per iniziare</p>
                        <button
                          onClick={() => setShowGardenWizard(true)}
                          className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                        >
                          <Plus size={18} />
                          Crea Orto
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {gardens.map((garden) => (
                          <div
                            key={garden.id}
                            className="bg-white p-4 rounded-lg border border-green-200 hover:border-green-400 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="font-semibold text-gray-900 text-lg">{garden.name}</h4>
                                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                                    {garden.gardenType || 'Orto'}
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <span className="font-medium">Dimensione:</span>
                                    <span>{garden.sizeSqMeters || 0} m²</span>
                                  </div>
                                  {garden.coordinates && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                      <MapPin size={14} />
                                      <span className="text-xs">
                                        {garden.coordinates.latitude.toFixed(4)}, {garden.coordinates.longitude.toFixed(4)}
                                      </span>
                                    </div>
                                  )}
                                  {garden.location && (
                                    <div className="flex items-center gap-2 text-gray-600 col-span-2">
                                      <span className="font-medium">Località:</span>
                                      <span>{garden.location}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 ml-4">
                                {(() => {
                                  // Determina link e label in base al tipo di garden
                                  const gardenType = garden.gardenType
                                  let href = `/app/plants?garden=${encodeURIComponent(garden.id)}`
                                  let label = 'Piante'
                                  let icon = '🌱'
                                  
                                  if (gardenType === 'Orchard') {
                                    href = gardenManagementHref(garden)
                                    label = 'Alberi'
                                    icon = '🌳'
                                  } else if (gardenType === 'OliveGrove') {
                                    href = gardenManagementHref(garden)
                                    label = 'Alberi'
                                    icon = '🫒'
                                  } else if (gardenType === 'Vineyard') {
                                    href = gardenManagementHref(garden)
                                    label = 'Viti'
                                    icon = '🍇'
                                  }
                                  
                                  return (
                                    <Link
                                      href={href}
                                      className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm font-medium"
                                      title={`Gestisci ${label.toLowerCase()} di ${garden.name}`}
                                    >
                                      <span>{icon}</span>
                                      {label}
                                    </Link>
                                  )
                                })()}
                                <button
                                  onClick={() => setEditingGarden(garden)}
                                  className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm font-medium"
                                  title={`Modifica impostazioni di ${garden.name}`}
                                >
                                  <Edit2 size={16} />
                                  Gestisci
                                </button>
                                <button
                                  onClick={async () => {
                                    if (confirm(`Sei sicuro di voler eliminare "${garden.name}"?\n\nQuesta azione eliminerà anche tutti i dati associati (piante, task, raccolti, ecc.)`)) {
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
                                  title="Elimina orto"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Tipi di Orto Disponibili */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-medium text-blue-900 mb-3">Tipi di Coltivazione Supportati</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-white p-3 rounded-lg border border-blue-200 text-center">
                        <div className="text-2xl mb-1">🌱</div>
                        <p className="text-sm font-medium text-gray-900">Orto Domestico</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-blue-200 text-center">
                        <div className="text-2xl mb-1">🍎</div>
                        <p className="text-sm font-medium text-gray-900">Frutteto</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-blue-200 text-center">
                        <div className="text-2xl mb-1">🫒</div>
                        <p className="text-sm font-medium text-gray-900">Oliveto</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-blue-200 text-center">
                        <div className="text-2xl mb-1">🍇</div>
                        <p className="text-sm font-medium text-gray-900">Vigneto</p>
                      </div>
                    </div>
                    <p className="text-sm text-blue-700 mt-3">
                      Ogni tipo di coltivazione ha funzionalità specifiche e consigli personalizzati
                    </p>
                  </div>

                  {/* Guida Rapida */}
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-3">Come Gestire i Tuoi Orti</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 font-bold">1.</span>
                        <span>Clicca "Nuovo Orto" per creare un nuovo orto, frutteto, oliveto o vigneto</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 font-bold">2.</span>
                        <span>Configura nome, dimensione, posizione GPS e tipo di coltivazione</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 font-bold">3.</span>
                        <span>Usa il pulsante "Gestisci" per modificare le impostazioni dell'orto</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 font-bold">4.</span>
                        <span>Vai alla dashboard principale per vedere e gestire le tue coltivazioni</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {(['profile', 'notifications', 'security', 'appearance'] as const).map(section => activeSection === section && <UserSettingsPanels key={section} section={section} />)}

            {activeSection === 'data' && <DataSettingsPanel />}

            {activeSection === 'satellite' && (
              <div>
                <SatelliteCredentialsManager />
              </div>
            )}

            {activeSection === 'apikeys' && (
              <div>
                <APIKeysManager />
              </div>
            )}

            {activeSection === 'organization' && (
              <div>
                <OrganizationManager />
              </div>
            )}


          </div>
        </div>
      </div>

      {/* Garden Creation Wizard Modal */}
      {showGardenWizard && (
        <GardenTypeWizard
          onComplete={handleGardenCreated}
          onCancel={() => setShowGardenWizard(false)}
        />
      )}

      {/* Garden Edit Modal */}
      {editingGarden && (
        <GardenEditModal
          garden={editingGarden}
          isOpen={!!editingGarden}
          onClose={() => setEditingGarden(null)}
          onSave={handleGardenEdited}
        />
      )}
    </div>
  )
}
