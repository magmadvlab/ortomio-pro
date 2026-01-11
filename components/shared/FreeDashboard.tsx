'use client'

import React, { useState, useEffect } from 'react'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { useTier } from '@/packages/core/hooks/useTier'
import { Garden, GardenTask } from '@/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Sparkles, Leaf, Lock, Plus, Home, Sun, Snowflake } from 'lucide-react'
import Link from 'next/link'
import AlmanaccoWidget from '@/components/almanacco/AlmanaccoWidget'
import ChallengeWidget from '@/components/challenges/ChallengeWidget'

export function FreeDashboard() {
  const { storageProvider } = useStorage()
  const { tier, limit, checkLimit } = useTier()
  const [gardens, setGardens] = useState<Garden[]>([])
  const [tasks, setTasks] = useState<GardenTask[]>([])
  const [activeGardenId, setActiveGardenId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const loadedGardens = await storageProvider.getGardens()
        setGardens(loadedGardens)
        
        if (loadedGardens.length > 0) {
          setActiveGardenId(loadedGardens[0].id)
          const loadedTasks = await storageProvider.getTasks(loadedGardens[0].id)
          setTasks(loadedTasks)
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [storageProvider])

  const activeGarden = gardens.find(g => g.id === activeGardenId)
  const pendingTasks = tasks.filter(t => !t.completed).length

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Caricamento...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header migliorato */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-xl md:text-2xl sm:text-3xl font-bold text-gray-900">
              {activeGarden?.name || 'Il Mio Orto'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {activeGarden ? 'Localizzato' : 'Crea il tuo primo orto'}
            </p>
          </div>
          {activeGarden && (
            <div className="text-right text-sm text-gray-600">
              <p className="font-semibold">{activeGarden.sizeSqMeters} m²</p>
              <p className="text-xs">4h sole (Ombra parziale)</p>
            </div>
          )}
        </div>
      </header>
      
      <main className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
        {gardens.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 sm:p-32 text-center">
            <div className="max-w-md mx-auto">
              <Home className="mx-auto mb-6 text-green-500" size={64} />
              <h2 className="text-xl md:text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Crea il tuo primo orto
              </h2>
              <p className="text-gray-600 mb-8 text-lg">
                Inizia creando il tuo primo orto per gestire le tue piante e ricevere consigli personalizzati.
              </p>
              <Button 
                onClick={() => window.location.href = '/app'}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
              >
                <Plus size={24} className="mr-2" />
                Crea il mio primo orto
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Card Resa Totale - Stile arancione come nell'originale */}
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-orange-100 text-sm font-medium mb-1">Resa Totale (Stimata)</p>
                  <p className="text-4xl font-bold">0.0 kg</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3">
                  <Sparkles className="text-white" size={24} />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button className="bg-white text-orange-600 px-4 py-2 rounded-lg font-semibold text-sm">
                  TUTTI
                </button>
                <button className="bg-white/20 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-3">
                  <Sun size={16} />
                  ESTIVO
                </button>
                <button className="bg-white/20 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-3">
                  <Snowflake size={16} />
                  INVERNALE
                </button>
              </div>
            </div>

            {/* Sezione Aggiungi Raccolto */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-green-100 rounded-lg p-3">
                  <Plus className="text-green-600" size={20} />
                </div>
                <h3 className="font-semibold text-gray-900">Aggiungi Raccolto a...</h3>
              </div>
              <p className="text-gray-500 text-sm ml-12">Nessuna coltura attiva disponibile.</p>
            </div>

            {/* Almanacco Widget */}
            <AlmanaccoWidget />

            {/* Challenge Widget */}
            <ChallengeWidget 
              userId={activeGardenId || undefined}
              onComplete={(challengeId, points) => {
                console.log('Challenge completed:', challengeId, points);
                // TODO: Update UI, show notification
              }}
            />

            {/* Widget Funzionalità Free */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <Leaf className="text-green-500" size={24} />
                Le tue funzionalità Free
              </h2>
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span>1 Orto</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-yellow-full max-w-sm rounded-full mr-3"></div>
                  <span>Wizard consigli pre-generati</span>
                </div>
                <div className="flex items-center text-gray-500">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
                  <span>Accesso limitato a {limit('maxTasksPerGarden')} task e {limit('maxSeedPackets')} semi</span>
                </div>
              </div>
              <Link href="/pricing">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-3">
                  <Sparkles size={20} className="mr-2" />
                  Scopri OrtoMio PRO
                </Button>
              </Link>
            </div>

            {/* Card AI Credits - Stile migliorato */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl shadow-sm border-2 border-yellow-full max-w-sm p-6">
              <div className="flex items-start gap-4">
                <div className="bg-yellow-full max-w-sm rounded-full p-3">
                  <Sparkles className="text-white" size={24} />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                    🎁 3 AI Credits Gratuiti!
                  </h2>
                  <p className="text-gray-700 mb-4">
                    Usa i tuoi crediti per provare la potenza dell'AI di OrtoMio e ricevere diagnosi personalizzate.
                  </p>
                  <Link href="/app/advice">
                    <Button className="bg-yellow-full max-w-sm hover:bg-yellow-700 text-white">
                      Inizia la tua prima richiesta AI
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

