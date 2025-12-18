'use client'

import React, { useState, useEffect } from 'react'
import { Garden } from '@/types'
import { SeedlingBatch } from '@/services/seedlingService'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { 
  getAllReadyBatches, 
  getNextReadyBatches, 
  countReadySeedlings 
} from '@/services/seedlingBatchHelper'
import { Sprout, Calendar, ChevronRight, AlertCircle } from 'lucide-react'
import { format, differenceInDays } from 'date-fns'
import { it } from 'date-fns/locale'
import SeedlingManager from '@/components/SeedlingManager'

interface SeedlingReadyWidgetProps {
  garden: Garden
  onOpenManager?: () => void
}

export function SeedlingReadyWidget({ garden, onOpenManager }: SeedlingReadyWidgetProps) {
  const { storageProvider } = useStorage()
  const [batches, setBatches] = useState<SeedlingBatch[]>([])
  const [loading, setLoading] = useState(true)
  const [showManager, setShowManager] = useState(false)

  useEffect(() => {
    const loadBatches = async () => {
      try {
        const allBatches = await storageProvider.getSeedlingBatches(garden.id)
        setBatches(allBatches)
      } catch (error) {
        console.error('Error loading seedling batches:', error)
      } finally {
        setLoading(false)
      }
    }
    loadBatches()
  }, [storageProvider, garden.id])

  const readyBatches = getAllReadyBatches(batches, garden)
  const nextBatches = getNextReadyBatches(batches, 3, garden)
  const totalReady = countReadySeedlings(batches, garden)

  const handleOpenManager = () => {
    if (onOpenManager) {
      onOpenManager()
    } else {
      setShowManager(true)
    }
  }

  const handleBatchUpdate = async (batch: SeedlingBatch) => {
    try {
      await storageProvider.updateSeedlingBatch(batch.id, batch)
      const updatedBatches = await storageProvider.getSeedlingBatches(garden.id)
      setBatches(updatedBatches)
    } catch (error) {
      console.error('Error updating batch:', error)
    }
  }

  const handleBatchCreate = async (batch: SeedlingBatch) => {
    try {
      await storageProvider.createSeedlingBatch(batch)
      const updatedBatches = await storageProvider.getSeedlingBatches(garden.id)
      setBatches(updatedBatches)
    } catch (error) {
      console.error('Error creating batch:', error)
    }
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex items-center gap-2">
          <Sprout size={24} className="text-green-100" />
          <div>
            <h3 className="font-bold text-lg">Piantine Pronte</h3>
            <p className="text-sm opacity-90">Caricamento...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden min-h-[140px] flex flex-col justify-between">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Sprout size={24} className="text-green-100" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Piantine Pronte</h3>
                <p className="text-sm opacity-90">Gestisci i tuoi semenzai</p>
              </div>
            </div>
            <button
              onClick={handleOpenManager}
              className="bg-white text-green-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-green-50 transition-colors flex items-center gap-2"
            >
              Apri
              <ChevronRight size={16} />
            </button>
          </div>

          {readyBatches.length === 0 ? (
            <div className="mt-4">
              <p className="text-sm opacity-90">
                Nessuna piantina pronta al momento. Crea un batch semenzai per iniziare!
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 rounded-lg px-3 py-2">
                  <p className="text-2xl font-bold">{readyBatches.length}</p>
                  <p className="text-xs opacity-90">Batch pronti</p>
                </div>
                <div className="bg-white/20 rounded-lg px-3 py-2">
                  <p className="text-2xl font-bold">{totalReady}</p>
                  <p className="text-xs opacity-90">Piantine totali</p>
                </div>
              </div>

              {nextBatches.length > 0 && (
                <div className="mt-3 space-y-1">
                  <p className="text-xs font-semibold opacity-90 mb-1">Prossimi trapianti:</p>
                  {nextBatches.map((batch) => {
                    const transplantDate = batch.expectedTransplantDate 
                      ? new Date(batch.expectedTransplantDate)
                      : null
                    const daysUntil = transplantDate 
                      ? differenceInDays(transplantDate, new Date())
                      : null

                    return (
                      <div 
                        key={batch.id} 
                        className="bg-white/10 rounded-lg p-2 flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <Sprout size={14} />
                          <span className="font-medium">{batch.plantName}</span>
                          {batch.variety && (
                            <span className="opacity-75">({batch.variety})</span>
                          )}
                        </div>
                        {transplantDate && (
                          <div className="flex items-center gap-2">
                            <Calendar size={12} />
                            <span className="text-xs">
                              {format(transplantDate, 'dd MMM', { locale: it })}
                              {daysUntil !== null && daysUntil >= 0 && (
                                <span className="ml-1 opacity-75">
                                  ({daysUntil === 0 ? 'oggi' : `tra ${daysUntil}gg`})
                                </span>
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
        <Sprout size={120} className="absolute -right-4 -bottom-10 text-white opacity-10" />
      </div>

      {showManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full relative h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowManager(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 z-10"
            >
              ✕
            </button>
            <SeedlingManager
              garden={garden}
              batches={batches}
              onBatchUpdate={handleBatchUpdate}
              onBatchCreate={handleBatchCreate}
            />
          </div>
        </div>
      )}
    </>
  )
}







