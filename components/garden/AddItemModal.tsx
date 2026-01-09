'use client'

import React, { useState } from 'react'
import { Garden, GardenTask } from '@/types'
import { Sprout, Calendar, ShoppingBasket, X, Camera } from 'lucide-react'
import { AddCropWizard } from '../crops/AddCropWizard'
import { useRouter } from 'next/navigation'
import { useTier } from '@/packages/core/hooks/useTier'
import { getAllArchetypes } from '@/services/archetypeService'

interface AddItemModalProps {
  garden: Garden
  isOpen: boolean
  onClose: () => void
  onAddTask?: (task: GardenTask) => void
}

export function AddItemModal({ garden, isOpen, onClose, onAddTask }: AddItemModalProps) {
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

  const handleAIDiagnosis = () => {
    if (!isPro) {
      // Mostra upgrade prompt o redirect
      router.push('/app/upgrade')
      return
    }
    // Apri camera per diagnosi AI
    router.push('/app/advice?action=diagnosis')
    onClose()
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
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">
              {selectedOption === 'plant' ? 'Nuova Pianta' : 'Nuovo Task'}
            </h2>
            <button
              onClick={() => {
                setShowCropWizard(false)
                setSelectedOption(null)
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>
          <div className="p-4">
            <AddCropWizard
              garden={garden}
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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-[500px] shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">➕ Aggiungi</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
            aria-label="Chiudi"
          >
            <X size={18} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-[15px] text-gray-600 mb-5">Cosa vuoi aggiungere?</p>

          {/* Action Grid */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Prima riga: Nuova Pianta e Semenzaio */}
            <button
              onClick={() => handleOptionSelect('plant')}
              className={`flex flex-col items-center justify-center p-6 bg-gray-50 rounded-2xl border-2 transition-all ${
                selectedOption === 'plant'
                  ? 'bg-green-50 border-green-500'
                  : 'border-transparent hover:bg-green-50 hover:border-green-200'
              }`}
            >
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-3 shadow-lg text-3xl">
                🌱
              </div>
              <div className="font-semibold text-sm mb-1">Nuova Pianta</div>
              <div className="text-xs text-gray-500 text-center">Trapianto diretto</div>
            </button>

            <button
              onClick={() => {
                router.push('/app/pianifica?from=modal')
                onClose()
              }}
              className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-2xl border-2 border-transparent hover:bg-orange-50 hover:border-orange-200 transition-all"
            >
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-3 shadow-lg text-3xl">
                🌰
              </div>
              <div className="font-semibold text-sm mb-1">Semenzaio</div>
              <div className="text-xs text-gray-500 text-center">Pianifica da seme</div>
            </button>
          </div>

          {/* Seconda riga: Task e Raccolto */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => handleOptionSelect('task')}
              className={`flex flex-col items-center justify-center p-6 bg-gray-50 rounded-2xl border-2 transition-all ${
                selectedOption === 'task'
                  ? 'bg-green-50 border-green-500'
                  : 'border-transparent hover:bg-green-50 hover:border-green-200'
              }`}
            >
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-3 shadow-lg text-3xl">
                📋
              </div>
              <div className="font-semibold text-sm mb-1">Nuovo Task</div>
              <div className="text-xs text-gray-500 text-center">Pianifica attività</div>
            </button>

            <button
              onClick={() => handleOptionSelect('harvest')}
              className={`flex flex-col items-center justify-center p-6 bg-gray-50 rounded-2xl border-2 transition-all ${
                selectedOption === 'harvest'
                  ? 'bg-green-50 border-green-500'
                  : 'border-transparent hover:bg-green-50 hover:border-green-200'
              }`}
            >
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-3 shadow-lg text-3xl">
                🛒
              </div>
              <div className="font-semibold text-sm mb-1">Raccolto</div>
              <div className="text-xs text-gray-500 text-center">Registra raccolto</div>
            </button>
          </div>

          {/* Suggestions Section */}
          <div className="bg-gray-50 rounded-2xl p-5 mb-5">
            <div className="flex items-center gap-2 mb-4 text-sm font-medium text-gray-700">
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
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-gray-200 rounded-full text-sm hover:bg-green-50 hover:border-green-300 transition-all"
                >
                  <span className="text-lg">{suggestion.emoji}</span>
                  <span>{suggestion.name}</span>
                </button>
              ))}
            </div>
            
            {/* Quick Semenzaio Access */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  router.push('/app/semenzaio?action=create')
                  onClose()
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-50 border border-orange-200 rounded-xl text-sm font-medium text-orange-700 hover:bg-orange-100 transition-all"
              >
                <span className="text-lg">🌰</span>
                <span>Vai al Semenzaio</span>
              </button>
            </div>
          </div>

          {/* AI Diagnosis Camera Button */}
          <div className="pt-5 border-t border-gray-200">
            <button
              onClick={handleAIDiagnosis}
              className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-gradient-to-r from-purple-100 to-purple-50 border-2 border-dashed border-purple-300 rounded-xl text-[15px] font-medium text-purple-600 hover:bg-purple-100 hover:border-solid transition-all"
            >
              <span className="text-2xl">📸</span>
              <span>Scatta foto per diagnosi AI</span>
              {!isPro && (
                <span className="bg-purple-500 text-white text-[10px] px-2 py-0.5 rounded font-semibold">
                  PRO
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
