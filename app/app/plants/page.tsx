'use client'

import { useState, useEffect } from 'react'
import { FeatureGate } from '@/components/shared/FeatureGate'
import SmartPlantManager from '@/components/plants/SmartPlantManager'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { Garden } from '@/types'
import { TreePine } from 'lucide-react'

/**
 * Plants Page - Gestione Piante Individuali
 * 
 * Modulo: INDIVIDUAL_PLANTS
 * Componente: SmartPlantManager.tsx
 * Servizio: individualPlantService.ts
 * 
 * Funzionalità:
 * - Tracciamento piante individuali (alberi, viti, olivi)
 * - Storico operazioni per pianta
 * - Health score e monitoraggio
 * - Operazioni bulk su multiple piante
 * - Heatmap salute piante
 * - Integrazione con sistema zone/filari
 */
export default function PlantsPage() {
  const { storageProvider } = useStorage()
  const [activeGarden, setActiveGarden] = useState<Garden | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadActiveGarden()
  }, [storageProvider])

  const loadActiveGarden = async () => {
    try {
      setLoading(true)
      const gardens = await storageProvider.getGardens()
      if (gardens.length > 0) {
        // Prendi il primo giardino
        setActiveGarden(gardens[0])
      }
    } catch (error) {
      console.error('Error loading garden:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Caricamento...</p>
      </div>
    )
  }

  if (!activeGarden) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-md text-center">
          <TreePine className="mx-auto text-gray-400 mb-4" size={48} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Nessun Giardino
          </h2>
          <p className="text-gray-600 mb-4">
            Crea un giardino dalla Dashboard per iniziare a tracciare le tue piante.
          </p>
        </div>
      </div>
    )
  }

  return (
    <FeatureGate 
      feature="INDIVIDUAL_PLANTS"
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-md text-center">
            <div className="text-6xl mb-4">🌳</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Piante Individuali
            </h2>
            <p className="text-gray-600 mb-4">
              Questa funzionalità non è ancora disponibile.
            </p>
            <p className="text-sm text-gray-500">
              Contatta l'amministratore per attivarla.
            </p>
          </div>
        </div>
      }
    >
      <SmartPlantManager garden={activeGarden} />
    </FeatureGate>
  )
}
