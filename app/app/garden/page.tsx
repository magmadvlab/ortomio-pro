'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { Garden } from '@/types'
import { ArrowLeft, Sprout, Grid3x3, MapPin, Settings } from 'lucide-react'
import Link from 'next/link'

export default function GardenHubPage() {
  const { storageProvider } = useStorage()
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [gardens, setGardens] = useState<Garden[]>([])
  const [selectedGarden, setSelectedGarden] = useState<Garden | null>(null)
  const [loading, setLoading] = useState(true)

  const gardenId = searchParams.get('garden')

  useEffect(() => {
    const loadData = async () => {
      try {
        const allGardens = await storageProvider.getGardens()
        // Filtra: escludi colture specializzate (hanno le loro pagine dedicate)
        const specializedTypes = ['Orchard', 'OliveGrove', 'Vineyard']
        const loadedGardens = allGardens.filter(g => !specializedTypes.includes(g.gardenType || ''))
        setGardens(loadedGardens)
        
        const garden = gardenId 
          ? loadedGardens.find(g => g.id === gardenId)
          : loadedGardens[0]
        
        if (garden) {
          setSelectedGarden(garden)
        }
      } catch (error) {
        console.error('Error loading gardens:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [storageProvider, gardenId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Caricamento...</p>
      </div>
    )
  }

  if (!selectedGarden) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Nessun orto trovato</h2>
          <p className="text-gray-600 mb-6">Crea il tuo primo orto per iniziare</p>
          <Link
            href="/app/settings?section=gardens"
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Crea Orto
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/app"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  🌱 {selectedGarden.name}
                </h1>
                <p className="text-gray-600 mt-1">
                  Gestione Orto Campo Aperto
                </p>
              </div>
            </div>
            <Link
              href="/app/settings?section=gardens"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Impostazioni Orto"
            >
              <Settings size={20} />
            </Link>
          </div>

          {/* Garden Selector */}
          {gardens.length > 1 && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Seleziona Orto:</label>
              <select
                value={selectedGarden.id}
                onChange={(e) => {
                  const newGarden = gardens.find(g => g.id === e.target.value)
                  if (newGarden) {
                    router.push(`/app/garden?garden=${newGarden.id}`)
                  }
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {gardens.map(garden => (
                  <option key={garden.id} value={garden.id}>
                    {garden.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card Filari */}
          <Link
            href={`/app/garden/rows?garden=${selectedGarden.id}`}
            className="group"
          >
            <div className="bg-white rounded-2xl border-2 border-gray-200 hover:border-green-500 hover:shadow-2xl transition-all duration-300 overflow-hidden h-full">
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-8 text-white">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Grid3x3 size={32} />
                </div>
                <h2 className="text-3xl font-bold mb-2">Filari</h2>
                <p className="text-green-100">Campo Aperto</p>
              </div>
              
              <div className="p-8">
                <p className="text-gray-600 mb-6 text-lg">
                  Gestisci i filari del tuo orto: crea, configura irrigazione, monitora le colture
                </p>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Crea e configura filari</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Sistema irrigazione</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Storico rotazione colture</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Predizioni AI</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-green-600 font-semibold group-hover:translate-x-2 transition-transform">
                  <span>Gestisci Filari</span>
                  <span>→</span>
                </div>
              </div>
            </div>
          </Link>

          {/* Card Piante */}
          <Link
            href={`/app/plants?garden=${selectedGarden.id}`}
            className="group"
          >
            <div className="bg-white rounded-2xl border-2 border-gray-200 hover:border-blue-500 hover:shadow-2xl transition-all duration-300 overflow-hidden h-full">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-8 text-white">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Sprout size={32} />
                </div>
                <h2 className="text-3xl font-bold mb-2">Piante</h2>
                <p className="text-blue-100">Monitoraggio Individuale</p>
              </div>
              
              <div className="p-8">
                <p className="text-gray-600 mb-6 text-lg">
                  Monitora ogni singola pianta: salute, crescita, foto, interventi
                </p>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Carta identità pianta</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Foto e analisi salute</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Storico interventi</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Consigli personalizzati</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-blue-600 font-semibold group-hover:translate-x-2 transition-transform">
                  <span>Vedi Piante</span>
                  <span>→</span>
                </div>
              </div>
            </div>
          </Link>

          {/* Card Zone (Opzionale - Avanzato) */}
          <Link
            href={`/app/garden/zones?garden=${selectedGarden.id}`}
            className="group md:col-span-2"
          >
            <div className="bg-white rounded-2xl border-2 border-gray-200 hover:border-purple-500 hover:shadow-2xl transition-all duration-300 overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-8 text-white md:w-1/3">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <MapPin size={32} />
                  </div>
                  <h2 className="text-3xl font-bold mb-2">Zone Terreno</h2>
                  <p className="text-purple-100">Gestione Avanzata</p>
                  <div className="mt-4 inline-block px-3 py-1 bg-purple-400/30 rounded-full text-sm">
                    Opzionale
                  </div>
                </div>
                
                <div className="p-8 md:w-2/3">
                  <p className="text-gray-600 mb-4 text-lg">
                    Dividi il terreno in macro-zone per rotazione professionale e memoria del suolo
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-3 text-gray-700">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>Rotazione pluriennale</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>Memoria del suolo</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>Salute terreno (0-100)</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>Suggerimenti AI</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-purple-600 font-semibold group-hover:translate-x-2 transition-transform">
                    <span>Gestisci Zone (Avanzato)</span>
                    <span>→</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>

        </div>

        {/* Info Box */}
        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Suggerimento</h3>
          <p className="text-blue-800 text-sm">
            <strong>Filari</strong> per gestire la struttura del campo • 
            <strong> Piante</strong> per monitorare ogni singola pianta • 
            <strong> Zone</strong> (opzionale) per rotazione professionale
          </p>
        </div>
      </main>
    </div>
  )
}
