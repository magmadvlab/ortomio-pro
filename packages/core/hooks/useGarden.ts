/**
 * useGarden Hook
 * Gestisce il giardino attivo usando useStorage
 * Persiste l'ultimo orto usato per il meteo e altre funzionalità
 */

import { useState, useEffect, useCallback } from 'react'
import { useStorage } from './useStorage'
import { Garden } from '@/types'

const ACTIVE_GARDEN_KEY = 'ortoActiveGardenId'
const LAST_USED_GARDEN_KEY = 'ortoLastUsedGardenId'

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
  const [activeGarden, setActiveGardenState] = useState<Garden | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const normalizeGarden = (garden: Garden): Garden => {
    if (garden.primaryCrop) return garden
    return {
      ...garden,
      primaryCrop: {
        archetypeId: 'MIX',
        label: 'Orto misto',
        canonicalPlantName: 'orto',
        createdFrom: 'suggested',
      },
    }
  }

  // Wrapper per setActiveGarden che persiste la selezione
  const setActiveGarden = useCallback((garden: Garden | null) => {
    setActiveGardenState(garden)
    
    // Persisti l'orto attivo in localStorage
    if (garden) {
      try {
        localStorage.setItem(ACTIVE_GARDEN_KEY, garden.id)
        localStorage.setItem(LAST_USED_GARDEN_KEY, garden.id)
        console.log('✅ Orto attivo salvato:', garden.name, garden.id)
      } catch (e) {
        console.error('Errore nel salvare orto attivo:', e)
      }
    } else {
      try {
        localStorage.removeItem(ACTIVE_GARDEN_KEY)
      } catch (e) {
        // Ignora
      }
    }
  }, [])

  const loadGardens = async () => {
    try {
      setLoading(true)
      setError(null)
      const loadedGardens = (await storageProvider.getGardens()).map(normalizeGarden)
      setGardens(loadedGardens)
      
      // Recupera l'ultimo orto usato da localStorage
      let savedGardenId: string | null = null
      try {
        savedGardenId = localStorage.getItem(ACTIVE_GARDEN_KEY) || localStorage.getItem(LAST_USED_GARDEN_KEY)
      } catch (e) {
        // Ignora errori localStorage
      }
      
      if (loadedGardens.length > 0) {
        // Cerca l'orto salvato
        const savedGarden = savedGardenId 
          ? loadedGardens.find(g => g.id === savedGardenId)
          : null
        
        if (savedGarden) {
          // Usa l'orto salvato
          console.log('✅ Ripristinato ultimo orto usato:', savedGarden.name)
          setActiveGardenState(savedGarden)
        } else if (!activeGarden) {
          // Se non c'è orto salvato e nessuno attivo, usa il primo
          console.log('ℹ️ Nessun orto salvato, uso il primo:', loadedGardens[0].name)
          setActiveGarden(loadedGardens[0])
        } else {
          // Aggiorna l'orto attivo se esiste ancora
          const updatedActiveGarden = loadedGardens.find(g => g.id === activeGarden.id)
          if (updatedActiveGarden) {
            setActiveGardenState(updatedActiveGarden)
          } else {
            // Se l'orto attivo non esiste più, usa il primo disponibile
            setActiveGarden(loadedGardens[0])
          }
        }
      } else {
        setActiveGardenState(null)
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
