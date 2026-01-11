'use client'

import React, { useState, useEffect } from 'react'
import { X, Lightbulb, AlertCircle } from 'lucide-react'

interface ContextualTipProps {
  id: string
  title: string
  message: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  onDismiss?: () => void
}

export function ContextualTip({
  id,
  title,
  message,
  position = 'bottom',
  onDismiss
}: ContextualTipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Controlla se il tip è già stato mostrato
    const storageKey = `tip_${id}_shown`
    const hasBeenShown = localStorage.getItem(storageKey) === 'true'
    
    if (!hasBeenShown && !isDismissed) {
      setIsVisible(true)
    }
  }, [id, isDismissed])

  const handleDismiss = (permanently: boolean = false) => {
    setIsVisible(false)
    setIsDismissed(true)
    
    if (permanently) {
      localStorage.setItem(`tip_${id}_shown`, 'true')
    }
    
    if (onDismiss) {
      onDismiss()
    }
  }

  if (!isVisible) return null

  const positionClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2'
  }

  return (
    <div className={`absolute ${positionClasses[position]} z-50 animate-in fade-in slide-in-from-bottom-2`}>
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-full max-w-sm shadow-xl p-4 max-w-xs">
        <div className="flex items-start gap-3 mb-2">
          <Lightbulb size={20} className="text-yellow-full max-w-sm flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-gray-900 text-sm mb-1">{title}</h4>
            <p className="text-xs text-gray-700">{message}</p>
          </div>
          <button
            onClick={() => handleDismiss(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
            aria-label="Chiudi"
          >
            <X size={16} />
          </button>
        </div>
        
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-yellow-full max-w-sm">
          <label className="flex items-center gap-3 text-xs text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              onChange={(e) => {
                if (e.target.checked) {
                  handleDismiss(true)
                }
              }}
              className="w-3 h-3 rounded border-gray-300 text-yellow-full max-w-sm focus:ring-yellow-500"
            />
            <span>Non mostrare più questo suggerimento</span>
          </label>
        </div>
      </div>
      
      {/* Arrow */}
      <div className={`absolute ${
        position === 'bottom' ? 'top-0 -translate-y-full' :
        position === 'top' ? 'bottom-0 translate-y-full' :
        position === 'left' ? 'right-0 translate-x-full' :
        'left-0 -translate-x-full'
      }`}>
        <div className={`w-0 h-0 border-8 ${
          position === 'bottom' ? 'border-t-yellow-300 border-l-transparent border-r-transparent border-b-transparent' :
          position === 'top' ? 'border-b-yellow-300 border-l-transparent border-r-transparent border-t-transparent' :
          position === 'left' ? 'border-r-yellow-300 border-t-transparent border-b-transparent border-l-transparent' :
          'border-l-yellow-300 border-t-transparent border-b-transparent border-r-transparent'
        }`} />
      </div>
    </div>
  )
}

