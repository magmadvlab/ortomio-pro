'use client'

import React, { useState, useEffect } from 'react'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { AICreditsWidget } from '@/components/shared/AICreditsWidget'
import WeatherWidget from '@/components/WeatherWidget'
import GardenOnboarding from '@/components/GardenOnboarding'
import { Garden } from '@/types'
import { Sparkles, Sun, Snowflake, ChefHat, Book, Leaf } from 'lucide-react'

// Placeholder - will be replaced with actual garden coordinates
const DEFAULT_COORDS = { latitude: 40.5, longitude: 16.5 }

export function ConsumerDashboard() {
  const { storageProvider } = useStorage()
  const [gardens, setGardens] = useState<Garden[]>([])
  const [loading, setLoading] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    const loadGardens = async () => {
      try {
        const loadedGardens = await storageProvider.getGardens()
        setGardens(loadedGardens)
        if (loadedGardens.length === 0) {
          setShowOnboarding(true)
        }
      } catch (error) {
        console.error('Error loading gardens:', error)
      } finally {
        setLoading(false)
      }
    }
    loadGardens()
  }, [storageProvider])

  const handleOnboardingComplete = async (garden: Garden) => {
    try {
      await storageProvider.createGarden(garden)
      const updatedGardens = await storageProvider.getGardens()
      setGardens(updatedGardens)
      setShowOnboarding(false)
    } catch (error) {
      console.error('Error creating garden:', error)
      alert('Errore nella creazione dell\'orto. Riprova.')
    }
  }

  const handleOnboardingCancel = () => {
    setShowOnboarding(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Caricamento...</p>
      </div>
    )
  }

  if (showOnboarding || gardens.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
        <GardenOnboarding
          onComplete={handleOnboardingComplete}
          onCancel={handleOnboardingCancel}
        />
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header migliorato */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <h1 className="text-xl md:text-2xl sm:text-3xl font-bold text-green-900 mb-1">
          🌱 Benvenuto nel tuo Orto!
        </h1>
        <p className="text-green-700 text-sm sm:text-base">
          Scopri cosa fare oggi e nuove ricette per i tuoi raccolti
        </p>
      </header>
      
      <main className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
        {/* Widget in grid */}
        <div className="grid md:grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <WeatherWidget 
            latitude={DEFAULT_COORDS.latitude}
            longitude={DEFAULT_COORDS.longitude}
          />
          <AICreditsWidget />
        </div>
        
        {/* Card Resa Totale - Stile arancione */}
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
        
        {/* Ricette suggerite - Card migliorate */}
        <section>
          <h2 className="text-lg md:text-xl sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <ChefHat className="text-orange-500" size={24} />
            Ricette per i tuoi raccolti
          </h2>
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="aspect-video bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg mb-3 flex items-center justify-center">
                <ChefHat className="text-orange-500" size={32} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Pesto di Basilico</h3>
              <p className="text-sm text-gray-600 mb-3">Una ricetta classica per valorizzare il tuo basilico appena raccolto.</p>
              <button className="text-green-600 text-sm font-medium hover:text-green-700">
                Vedi ricetta →
              </button>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="aspect-video bg-gradient-to-br from-green-100 to-green-200 rounded-lg mb-3 flex items-center justify-center">
                <ChefHat className="text-green-500" size={32} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Insalata Mista</h3>
              <p className="text-sm text-gray-600 mb-3">Fresca e croccante con i tuoi raccolti dell'orto.</p>
              <button className="text-green-600 text-sm font-medium hover:text-green-700">
                Vedi ricetta →
              </button>
            </div>
          </div>
        </section>
        
        {/* Guide - Card migliorate */}
        <section>
          <h2 className="text-lg md:text-xl sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <Book className="text-blue-500" size={24} />
            Guide Utili
          </h2>
          <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 rounded-lg p-3">
                  <Book className="text-blue-600" size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">Guida alla Potatura</h3>
                  <p className="text-sm text-gray-600">Impara le tecniche base per potare correttamente le tue piante.</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="bg-green-100 rounded-lg p-3">
                  <Leaf className="text-green-600" size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">Consociazioni</h3>
                  <p className="text-sm text-gray-600">Scopri quali piante crescono meglio insieme.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

