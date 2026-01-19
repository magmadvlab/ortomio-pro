'use client'

import React, { useState } from 'react'
import { Garden, GardenTask } from '@/types'
import { Sprout, Calendar, ShoppingBasket, X } from 'lucide-react'
import { AddCropWizard } from '../crops/AddCropWizard'
import { useRouter } from 'next/navigation'
import { useTier } from '@/packages/core/hooks/useTier'
import { getAllArchetypes } from '@/services/archetypeService'

interface AddItemModalProps {
  garden: Garden
  isOpen: boolean
  onClose: () => void
  onAddTask?: (task: GardenTask) => void
  selectedDate?: Date | null
}

export function AddItemModal({ garden, isOpen, onClose, onAddTask, selectedDate }: AddItemModalProps) {
  const router = useRouter()
  const { isPro } = useTier()
  const [selectedOption, setSelectedOption] = useState<'plant' | 'task' | 'harvest' | null>(null)
  const [showCropWizard, setShowCropWizard] = useState(false)

  if (!isOpen) return null

  const handleOptionSelect = (option: 'plant' | 'task' | 'harvest') => {
    setSelectedOption(option)
    
    if (option === 'plant' || option === 'task') {
      setShowCropWizard(true)
    } else if (option === 'harvest') {
      router.push('/app/progress?tab=harvests&action=add')
      onClose()
    }
  }

  // Suggerimenti basati su archetipi (stagionali)
  const allArchetypes = getAllArchetypes();
  const suggestions = [
    { emoji: '🥬', name: 'Fave', archetypeId: 'A5' },
    { emoji: '🫛', name: 'Piselli', archetypeId: 'A5' },
    { emoji: '🧄', name: 'Aglio', archetypeId: 'A6' },
    { emoji: '🧅', name: 'Cipolla', archetypeId: 'A6' },
    { emoji: '🥦', name: 'Broccoli', archetypeId: 'A7' },
  ].map(suggestion => {
    const archetype = allArchetypes.find(a => a.id === suggestion.archetypeId);
    return {
      ...suggestion,
      emoji: archetype?.icon || suggestion.emoji
    };
  });

  if (showCropWizard) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3 sm:p-4">
        <div className="bg-white rounded-xl w-full max-w-[90vw] sm:max-w-2xl max-h-[85vh] sm:max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-3 sm:p-4 flex items-center justify-between">
            <h2 className="text-base sm:text-lg md:text-xl font-bold">
              {selectedOption === 'plant' ? 'Nuova Pianta' : 'Nuovo Task'}
            </h2>
            <button
              onClick={() => {
                setShowCropWizard(false)
                setSelectedOption(null)
              }}
              className="text-gray-500 hover:text-gray-700 p-1 touch-manipulation"
            >
              <X size={20} />
            </button>
          </div>
          <div className="p-3 sm:p-4">
            <AddCropWizard
              garden={garden}
              selectedDate={selectedDate}
              onComplete={(taskData: GardenTask) => {
                if (onAddTask) {
                  onAddTask(taskData)
                }
                setShowCropWizard(false)
                setSelectedOption(null)
                onClose()
              }}
              onCancel={() => {
                setShowCropWizard(false)
                setSelectedOption(null)
              }}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-[380px] sm:max-w-[420px] max-h-[85vh] sm:max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 sm:py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl sm:rounded-t-3xl">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">➕ Aggiungi</h2>
            {selectedDate && (
              <p className="text-xs text-gray-600 mt-1">
                📅 {selectedDate.toLocaleDateString('it-IT', { 
                  day: 'numeric', 
                  month: 'short' 
                })}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors shadow-sm border border-gray-200 touch-manipulation"
            aria-label="Chiudi"
          >
            <X size={16} className="text-gray-700" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-sm text-gray-600 mb-4">Cosa vuoi aggiungere?</p>

          {/* Action Grid - Mobile Optimized */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Prima riga: Nuova Pianta e Semenzaio */}
            <button
              onClick={() => handleOptionSelect('plant')}
              className={`flex flex-col items-center justify-center p-3 sm:p-4 bg-gray-50 rounded-xl border-2 transition-all touch-manipulation ${
                selectedOption === 'plant'
                  ? 'bg-green-50 border-green-500'
                  : 'border-transparent hover:bg-green-50 hover:border-green-200'
              }`}
            >
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mb-2 shadow-lg text-2xl">
                🌱
              </div>
              <div className="font-semibold text-xs mb-1">Nuova Pianta</div>
              <div className="text-xs text-gray-500 text-center">Trapianto diretto</div>
            </button>

            <button
              onClick={() => {
                router.push('/app/pianifica?from=modal')
                onClose()
              }}
              className="flex flex-col items-center justify-center p-3 sm:p-4 bg-gray-50 rounded-xl border-2 border-transparent hover:bg-orange-50 hover:border-orange-200 transition-all touch-manipulation"
            >
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mb-2 shadow-lg text-2xl">
                🌰
              </div>
              <div className="font-semibold text-xs mb-1">Semenzaio</div>
              <div className="text-xs text-gray-500 text-center">Pianifica da seme</div>
            </button>
          </div>

          {/* Seconda riga: Task e Raccolto */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={() => handleOptionSelect('task')}
              className={`flex flex-col items-center justify-center p-3 sm:p-4 bg-gray-50 rounded-xl border-2 transition-all touch-manipulation ${
                selectedOption === 'task'
                  ? 'bg-green-50 border-green-500'
                  : 'border-transparent hover:bg-green-50 hover:border-green-200'
              }`}
            >
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mb-2 shadow-lg text-2xl">
                📋
              </div>
              <div className="font-semibold text-xs mb-1">Nuovo Task</div>
              <div className="text-xs text-gray-500 text-center">Pianifica attività</div>
            </button>

            <button
              onClick={() => handleOptionSelect('harvest')}
              className={`flex flex-col items-center justify-center p-3 sm:p-4 bg-gray-50 rounded-xl border-2 transition-all touch-manipulation ${
                selectedOption === 'harvest'
                  ? 'bg-green-50 border-green-500'
                  : 'border-transparent hover:bg-green-50 hover:border-green-200'
              }`}
            >
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mb-2 shadow-lg text-2xl">
                🛒
              </div>
              <div className="font-semibold text-xs mb-1">Raccolto</div>
              <div className="text-xs text-gray-500 text-center">Registra raccolto</div>
            </button>
          </div>

          {/* Suggestions Section */}
          <div className="bg-gray-50 rounded-xl p-3 sm:p-4 mb-4">
            <div className="flex items-center gap-2 mb-3 text-xs font-medium text-gray-700">
              🌡️ Suggerimenti per la tua zona
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.name}
                  onClick={() => {
                    router.push(`/app/pianifica?plant=${encodeURIComponent(suggestion.name)}&from=suggestion`)
                    onClose()
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-full text-xs hover:bg-green-50 hover:border-green-300 transition-all touch-manipulation"
                >
                  <span className="text-sm">{suggestion.emoji}</span>
                  <span>{suggestion.name}</span>
                </button>
              ))}
            </div>
            
            {/* Quick Semenzaio Access */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <button
                onClick={() => {
                  router.push('/app/semenzaio?action=create')
                  onClose()
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-orange-50 border border-orange-200 rounded-lg text-xs font-medium text-orange-700 hover:bg-orange-100 transition-all touch-manipulation"
              >
                <span className="text-sm">🌰</span>
                <span>Vai al Semenzaio</span>
              </button>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors touch-manipulation"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  )
}
