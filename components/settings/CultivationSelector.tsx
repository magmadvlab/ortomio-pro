'use client'

import React, { useState, useEffect } from 'react'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { SeedlingBatch } from '@/services/seedlingService'
import { SeedPacket } from '@/types'
import { Sprout, Package, Plus, ExternalLink } from 'lucide-react'

interface CultivationSelectorProps {
  gardenId: string
  value: string
  onChange: (value: string) => void
  onSeedlingBatchSelect?: (batch: SeedlingBatch) => void
  onSeedPacketSelect?: (packet: SeedPacket) => void
  placeholder?: string
}

export function CultivationSelector({
  gardenId,
  value,
  onChange,
  onSeedlingBatchSelect,
  onSeedPacketSelect,
  placeholder = "Es. Pomodoro Datterino"
}: CultivationSelectorProps) {
  const { storageProvider } = useStorage()
  const [seedlingBatches, setSeedlingBatches] = useState<SeedlingBatch[]>([])
  const [seedPackets, setSeedPackets] = useState<SeedPacket[]>([])
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Carica dati dal vivaio
  useEffect(() => {
    const loadVivaioData = async () => {
      if (!gardenId) return
      
      setLoading(true)
      try {
        const [batches, packets] = await Promise.all([
          storageProvider.getSeedlingBatches(gardenId).catch(() => []),
          storageProvider.getSeedPackets(gardenId).catch(() => [])
        ])
        
        setSeedlingBatches(batches || [])
        setSeedPackets(packets || [])
      } catch (error) {
        console.error('Error loading vivaio data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadVivaioData()
  }, [gardenId, storageProvider])

  // Filtra suggerimenti basati su input
  const filteredBatches = seedlingBatches.filter(batch => 
    batch.plantName.toLowerCase().includes(value.toLowerCase()) ||
    batch.variety?.toLowerCase().includes(value.toLowerCase())
  )

  const filteredPackets = seedPackets.filter(packet =>
    packet.plantName.toLowerCase().includes(value.toLowerCase()) ||
    packet.variety?.toLowerCase().includes(value.toLowerCase())
  )

  const handleBatchSelect = (batch: SeedlingBatch) => {
    const cultivarName = batch.variety ? `${batch.plantName} ${batch.variety}` : batch.plantName
    onChange(cultivarName)
    setShowSuggestions(false)
    onSeedlingBatchSelect?.(batch)
  }

  const handlePacketSelect = (packet: SeedPacket) => {
    const cultivarName = packet.variety ? `${packet.plantName} ${packet.variety}` : packet.plantName
    onChange(cultivarName)
    setShowSuggestions(false)
    onSeedPacketSelect?.(packet)
  }

  const readyBatches = filteredBatches.filter(b => b.currentPhase === 'ready')
  const availablePackets = filteredPackets.filter(p => (p.remainingSeeds || 0) > 0)

  return (
    <div className="relative">
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value)
            setShowSuggestions(true)
          }}
          onFocus={() => setShowSuggestions(true)}
          className="flex-1 px-4 py-3 text-base border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder={placeholder}
        />
        
        {/* Pulsante per aprire vivaio */}
        <button
          type="button"
          onClick={() => window.open('/app/semenzaio', '_blank')}
          className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center gap-2"
          title="Apri Vivaio"
        >
          <ExternalLink size={16} />
        </button>
      </div>

      {/* Suggerimenti dal vivaio */}
      {showSuggestions && (readyBatches.length > 0 || availablePackets.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          {/* Piantine pronte per trapianto */}
          {readyBatches.length > 0 && (
            <div>
              <div className="px-3 py-2 bg-green-50 border-b text-xs font-semibold text-green-800 flex items-center gap-2">
                <Sprout size={14} />
                Piantine Pronte ({readyBatches.length})
              </div>
              {readyBatches.map((batch) => (
                <button
                  key={batch.id}
                  type="button"
                  onClick={() => handleBatchSelect(batch)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b last:border-b-0 flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium text-sm">
                      {batch.variety ? `${batch.plantName} ${batch.variety}` : batch.plantName}
                    </div>
                    <div className="text-xs text-gray-600">
                      {batch.survivingQuantity} piantine • Pronte per trapianto
                    </div>
                  </div>
                  <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                    Pronto
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Semi disponibili */}
          {availablePackets.length > 0 && (
            <div>
              <div className="px-3 py-2 bg-blue-50 border-b text-xs font-semibold text-blue-800 flex items-center gap-2">
                <Package size={14} />
                Semi Disponibili ({availablePackets.length})
              </div>
              {availablePackets.map((packet) => (
                <button
                  key={packet.id}
                  type="button"
                  onClick={() => handlePacketSelect(packet)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b last:border-b-0 flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium text-sm">
                      {packet.variety ? `${packet.plantName} ${packet.variety}` : packet.plantName}
                    </div>
                    <div className="text-xs text-gray-600">
                      {packet.remainingSeeds} semi disponibili
                    </div>
                  </div>
                  <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                    Semi
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Link per creare nuovo batch */}
          <div className="p-2 border-t bg-gray-50">
            <button
              type="button"
              onClick={() => {
                const params = new URLSearchParams({
                  plant: value || '',
                  from: 'field-row'
                })
                window.open(`/app/semenzaio?${params.toString()}`, '_blank')
              }}
              className="w-full px-3 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 rounded flex items-center gap-2"
            >
              <Plus size={14} />
              Crea nuovo batch nel vivaio
            </button>
          </div>
        </div>
      )}

      {/* Click outside per chiudere */}
      {showSuggestions && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowSuggestions(false)}
        />
      )}

      {/* Indicatore stato vivaio */}
      {!loading && (readyBatches.length > 0 || availablePackets.length > 0) && (
        <div className="mt-1 text-xs text-gray-600 flex items-center gap-2">
          <div className="flex items-center gap-1">
            {readyBatches.length > 0 && (
              <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded">
                {readyBatches.length} piantine pronte
              </span>
            )}
            {availablePackets.length > 0 && (
              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                {availablePackets.length} tipi di semi
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}