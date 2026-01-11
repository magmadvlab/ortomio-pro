'use client'

import React, { useState, useEffect } from 'react'
import { Garden } from '@/types'
import { SaplingBatch, isReadyToOrchard } from '@/services/saplingService'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { TreePine, Calendar, ChevronRight, AlertCircle } from 'lucide-react'
import { format, differenceInDays } from 'date-fns'
import { it } from 'date-fns/locale'
import SaplingManager from '@/components/SaplingManager'

interface SaplingReadyWidgetProps {
  garden: Garden
  onOpenManager?: () => void
  onCreateOrchard?: (batch: SaplingBatch) => void
}

export function SaplingReadyWidget({ garden, onOpenManager, onCreateOrchard }: SaplingReadyWidgetProps) {
  const { storageProvider } = useStorage()
  const [batches, setBatches] = useState<SaplingBatch[]>([])
  const [loading, setLoading] = useState(true)
  const [showManager, setShowManager] = useState(false)

  useEffect(() => {
    const loadBatches = async () => {
      try {
        const allBatches = await storageProvider.getSaplingBatches(garden.id)
        setBatches(allBatches)
      } catch (error) {
        console.error('Error loading sapling batches:', error)
        setBatches([])
      } finally {
        setLoading(false)
      }
    }
    loadBatches()
  }, [garden.id, storageProvider])

  const readyBatches = batches.filter(batch => {
    const ready = isReadyToOrchard(batch, garden)
    return ready.ready && !batch.specializedCropId
  })

  const plantedBatches = batches.filter(batch => batch.plantingDate && !batch.specializedCropId)

  const handleOpenManager = () => {
    if (onOpenManager) {
      onOpenManager()
    } else {
      setShowManager(true)
    }
  }

  const handleBatchUpdate = async (batch: SaplingBatch) => {
    try {
      await storageProvider.updateSaplingBatch(batch.id, batch)
      // Ricarica i batch
      const allBatches = await storageProvider.getSaplingBatches(garden.id)
      setBatches(allBatches)
    } catch (error) {
      console.error('Error updating batch:', error)
      alert('Errore durante l\'aggiornamento del batch')
    }
  }

  const handleBatchCreate = async (batch: SaplingBatch) => {
    try {
      await storageProvider.createSaplingBatch(batch)
      // Ricarica i batch
      const allBatches = await storageProvider.getSaplingBatches(garden.id)
      setBatches(allBatches)
    } catch (error) {
      console.error('Error creating batch:', error)
      alert('Errore durante la creazione del batch')
    }
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <TreePine size={24} className="text-amber-100" />
          <div>
            <h3 className="font-bold text-lg">Alberelli</h3>
            <p className="text-sm opacity-90">Caricamento...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden min-h-[140px] flex flex-col justify-between">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <TreePine size={24} className="text-amber-100" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Alberelli</h3>
                <p className="text-sm opacity-90">Crea nuovi impianti</p>
              </div>
            </div>
            <button
              onClick={handleOpenManager}
              className="bg-white text-amber-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-amber-50 transition-colors flex items-center gap-3"
            >
              Apri
              <ChevronRight size={16} />
            </button>
          </div>

          {batches.length === 0 ? (
            <div className="mt-4">
              <p className="text-sm opacity-90">
                Nessun alberello registrato. Crea un nuovo impianto per iniziare!
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 rounded-lg px-4 py-3 text-base">
                  <p className="text-xl md:text-2xl font-bold">{readyBatches.length}</p>
                  <p className="text-xs opacity-90">Pronti</p>
                </div>
                <div className="bg-white/20 rounded-lg px-4 py-3 text-base">
                  <p className="text-xl md:text-2xl font-bold">{plantedBatches.length}</p>
                  <p className="text-xs opacity-90">Piantati</p>
                </div>
                <div className="bg-white/20 rounded-lg px-4 py-3 text-base">
                  <p className="text-xl md:text-2xl font-bold">{batches.length}</p>
                  <p className="text-xs opacity-90">Totali</p>
                </div>
              </div>

              {readyBatches.length > 0 && (
                <div className="mt-3 space-y-1">
                  <p className="text-xs font-semibold opacity-90 mb-1">Pronti per impianto:</p>
                  {readyBatches.slice(0, 3).map((batch) => (
                    <div 
                      key={batch.id} 
                      className="bg-white/10 rounded-lg p-3 flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <TreePine size={14} />
                        <span className="font-medium">{batch.plantName}</span>
                        {batch.variety && (
                          <span className="opacity-75">({batch.variety})</span>
                        )}
                      </div>
                      {onCreateOrchard && (
                        <button
                          onClick={() => onCreateOrchard(batch)}
                          className="bg-white/20 hover:bg-white/30 px-2 py-1 rounded text-xs font-semibold"
                        >
                          Crea
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <TreePine size={120} className="absolute -right-4 -bottom-10 text-white opacity-10" />
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
            <SaplingManager
              garden={garden}
              batches={batches}
              onBatchUpdate={handleBatchUpdate}
              onBatchCreate={handleBatchCreate}
              onCreateOrchard={onCreateOrchard}
            />
          </div>
        </div>
      )}
    </>
  )
}

