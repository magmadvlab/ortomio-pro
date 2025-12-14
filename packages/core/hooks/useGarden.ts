/**
 * useGarden Hook
 * Gestisce il giardino attivo usando useStorage
 */

import { useState, useEffect } from 'react'
import { useStorage } from './useStorage'
import { Garden } from '@/types'

export interface UseGardenReturn {
  activeGarden: Garden | null
  gardens: Garden[]
  loading: boolean
  error: string | null
  refreshGardens: () => Promise<void>
  setActiveGarden: (garden: Garden | null) => void
}

export function useGarden(): UseGardenReturn {
  const { storageProvider } = useStorage()
  const [gardens, setGardens] = useState<Garden[]>([])
  const [activeGarden, setActiveGarden] = useState<Garden | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadGardens = async () => {
    try {
      setLoading(true)
      setError(null)
      const loadedGardens = await storageProvider.getGardens()
      setGardens(loadedGardens)
      
      // Seleziona il primo giardino come attivo se non c'è già uno selezionato
      if (loadedGardens.length > 0 && !activeGarden) {
        setActiveGarden(loadedGardens[0])
      } else if (loadedGardens.length > 0 && activeGarden) {
        // Aggiorna il giardino attivo se esiste ancora
        const updatedActiveGarden = loadedGardens.find(g => g.id === activeGarden.id)
        if (updatedActiveGarden) {
          setActiveGarden(updatedActiveGarden)
        } else {
          // Se il giardino attivo non esiste più, usa il primo disponibile
          setActiveGarden(loadedGardens[0])
        }
      } else {
        setActiveGarden(null)
      }
    } catch (err: any) {
      console.error('Error loading gardens:', err)
      setError(err.message || 'Errore nel caricamento dei giardini')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadGardens()
  }, [storageProvider])

  const refreshGardens = async () => {
    await loadGardens()
  }

  return {
    activeGarden,
    gardens,
    loading,
    error,
    refreshGardens,
    setActiveGarden,
  }
}


