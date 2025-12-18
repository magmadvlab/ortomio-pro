'use client'

import React, { useState } from 'react'
import { useTier } from '@/packages/core/hooks/useTier'
import { Settings, User, Bell, Palette, Shield, CreditCard, LogOut, Crown, Cloud } from 'lucide-react'
import Link from 'next/link'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { useGarden } from '@/packages/core/hooks/useGarden'
import { CloudSyncStatus } from '@/components/settings/CloudSyncStatus'
import { AutoSyncSettings } from '@/components/settings/AutoSyncSettings'
import BackupSettings from '@/components/BackupSettings'

export default function SettingsPage() {
  const { tier, isFree, isPro, setTier } = useTier()
  const { storageProvider } = useStorage()
  const { activeGarden } = useGarden()
  const [activeSection, setActiveSection] = useState<string>('profile')

  const sections = [
    { id: 'profile', label: 'Profilo', icon: User },
    { id: 'notifications', label: 'Notifiche', icon: Bell },
    { id: 'preferences', label: 'Preferenze', icon: Palette },
    { id: 'cloud-sync', label: 'Cloud Sync', icon: Cloud },
    { id: 'account', label: 'Account', icon: Shield },
  ]

  return (
    <div className="min-h-screen p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <Settings className="text-gray-600" size={32} />
          Impostazioni
        </h1>
        <p className="text-gray-600">
          Gestisci le tue preferenze e impostazioni account
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Sezioni */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-4">
            <nav className="space-y-2">
              {sections.map((section) => {
                const Icon = section.icon
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeSection === section.id
                        ? 'bg-gray-100 text-gray-900 font-semibold'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{section.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Contenuto Sezione */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-md p-6">
            {activeSection === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Profilo</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome
                    </label>
                    <input
                      type="text"
                      placeholder="Il tuo nome"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="tua@email.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Piano Attuale
                    </label>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <Crown className="text-yellow-500" size={24} />
                      <div>
                        <p className="font-semibold text-gray-900">{tier || 'FREE'}</p>
                        {isFree && (
                          <Link
                            href="/pricing"
                            className="text-sm text-green-600 hover:text-green-700"
                          >
                            Upgrade a PRO →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Notifiche</h2>
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
                    <div>
                      <p className="font-medium text-gray-900">Notifiche Email</p>
                      <p className="text-sm text-gray-600">Ricevi aggiornamenti via email</p>
                    </div>
                    <input type="checkbox" className="w-5 h-5 text-green-600 rounded" defaultChecked />
                  </label>
                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
                    <div>
                      <p className="font-medium text-gray-900">Promemoria Task</p>
                      <p className="text-sm text-gray-600">Notifiche per task in scadenza</p>
                    </div>
                    <input type="checkbox" className="w-5 h-5 text-green-600 rounded" defaultChecked />
                  </label>
                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
                    <div>
                      <p className="font-medium text-gray-900">Alert Meteo</p>
                      <p className="text-sm text-gray-600">Avvisi per condizioni meteo critiche</p>
                    </div>
                    <input type="checkbox" className="w-5 h-5 text-green-600 rounded" defaultChecked />
                  </label>
                </div>
              </div>
            )}

            {activeSection === 'preferences' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Preferenze</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lingua
                    </label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                      <option>Italiano</option>
                      <option>English</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unità di Misura
                    </label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                      <option>Metrico (kg, m²)</option>
                      <option>Imperiale (lb, ft²)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Formato Data
                    </label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                      <option>DD/MM/YYYY</option>
                      <option>MM/DD/YYYY</option>
                      <option>YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'cloud-sync' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Cloud size={24} />
                  Cloud Sync e Backup
                </h2>
                
                <div className="space-y-6">
                  {/* Cloud Sync Status */}
                  <CloudSyncStatus />
                  
                  {/* Auto Sync Settings */}
                  <AutoSyncSettings />
                  
                  {/* Backup Settings */}
                  {activeGarden && storageProvider && (
                    <BackupSettings
                      garden={activeGarden}
                      storage={storageProvider}
                      onRestoreComplete={(garden) => {
                        // Refresh data dopo restore
                        window.location.reload()
                      }}
                    />
                  )}
                  
                  {!activeGarden && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                      <p className="text-sm text-gray-600">
                        Crea un giardino per utilizzare le funzionalità di backup.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeSection === 'account' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Account</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">
                      Gestione account e sicurezza
                    </p>
                    <p className="text-xs text-gray-500">
                      Funzionalità in sviluppo. In futuro potrai cambiare password, gestire dispositivi connessi e altro.
                    </p>
                  </div>
                  {isFree && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Crown className="text-green-600 flex-shrink-0 mt-1" size={20} />
                        <div>
                          <p className="font-medium text-green-900 mb-1">
                            Sblocca tutte le funzionalità
                          </p>
                          <p className="text-sm text-green-800 mb-3">
                            Upgrade a PRO per accesso completo a tutte le feature avanzate
                          </p>
                          <Link
                            href="/pricing"
                            className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                          >
                            Vedi Piani PRO
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Pulsante Salva (placeholder) */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Salva Modifiche
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}






