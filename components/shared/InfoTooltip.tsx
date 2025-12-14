'use client'

import React, { useState } from 'react'
import { HelpCircle, X } from 'lucide-react'

interface InfoTooltipProps {
  content: string | React.ReactNode
  title?: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function InfoTooltip({
  content,
  title,
  position = 'top',
  size = 'md',
  className = '',
}: InfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false)

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-800 border-l-transparent border-r-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-800 border-l-transparent border-r-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-800 border-t-transparent border-b-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-gray-800 border-t-transparent border-b-transparent border-l-transparent',
  }

  const sizeClasses = {
    sm: 'text-xs max-w-xs',
    md: 'text-sm max-w-sm',
    lg: 'text-base max-w-md',
  }

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        className="inline-flex items-center justify-center text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 rounded-full transition-colors"
        aria-label="Mostra informazioni"
        aria-expanded={isOpen}
      >
        <HelpCircle size={size === 'sm' ? 14 : size === 'md' ? 16 : 18} />
      </button>

      {isOpen && (
        <>
          {/* Overlay per chiudere cliccando fuori */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Tooltip */}
          <div
            className={`absolute z-50 ${positionClasses[position]} ${sizeClasses[size]} bg-gray-800 text-white rounded-lg shadow-xl p-3 pointer-events-auto`}
            role="tooltip"
          >
            {/* Arrow */}
            <div
              className={`absolute w-0 h-0 border-4 ${arrowClasses[position]}`}
            />
            
            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-1 right-1 text-gray-400 hover:text-white transition-colors"
              aria-label="Chiudi"
            >
              <X size={14} />
            </button>
            
            {/* Content */}
            <div className="pr-4">
              {title && (
                <h4 className="font-semibold mb-1 text-white">{title}</h4>
              )}
              <div className="text-gray-200">
                {typeof content === 'string' ? (
                  <p className="whitespace-pre-line">{content}</p>
                ) : (
                  content
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

/**
 * Variante compatta per uso inline nel testo
 */
export function InlineInfoTooltip({
  content,
  title,
  size = 'sm',
}: Omit<InfoTooltipProps, 'position' | 'className'>) {
  return (
    <InfoTooltip
      content={content}
      title={title}
      size={size}
      position="top"
      className="ml-1"
    />
  )
}

