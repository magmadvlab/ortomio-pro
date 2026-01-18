/**
 * MobileResponsiveButtonGroup - Componente per gestire gruppi di bottoni responsive
 * Risolve automaticamente i problemi di layout mobile con più bottoni
 */

'use client'

import React from 'react'

interface ButtonConfig {
  id: string
  icon?: React.ReactNode
  label: string
  shortLabel?: string
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'outline'
  disabled?: boolean
  className?: string
}

interface MobileResponsiveButtonGroupProps {
  buttons: ButtonConfig[]
  layout?: 'horizontal' | 'vertical' | 'auto'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  maxButtonsPerRow?: number
}

export function MobileResponsiveButtonGroup({
  buttons,
  layout = 'auto',
  size = 'md',
  className = '',
  maxButtonsPerRow = 3
}: MobileResponsiveButtonGroupProps) {
  
  const getButtonClasses = (variant: string = 'primary', buttonSize: string = 'md') => {
    const baseClasses = 'flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
    
    // Size classes
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm md:text-base',
      lg: 'px-6 py-3 text-base md:text-lg'
    }
    
    // Variant classes
    const variantClasses = {
      primary: 'bg-green-600 text-white hover:bg-green-700',
      secondary: 'bg-purple-600 text-white hover:bg-purple-700',
      outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50'
    }
    
    return `${baseClasses} ${sizeClasses[buttonSize as keyof typeof sizeClasses]} ${variantClasses[variant as keyof typeof variantClasses]}`
  }

  const getLayoutClasses = () => {
    if (layout === 'vertical') {
      return 'flex flex-col gap-3'
    } else if (layout === 'horizontal') {
      return 'flex flex-row gap-2 overflow-x-auto pb-2'
    } else {
      // Auto layout: vertical on mobile, horizontal on desktop
      if (buttons.length > maxButtonsPerRow) {
        return 'flex flex-col gap-3 sm:grid sm:grid-cols-2 lg:flex lg:flex-row lg:gap-2'
      } else {
        return 'flex flex-col gap-3 sm:flex-row sm:gap-2'
      }
    }
  }

  return (
    <div className={`${getLayoutClasses()} ${className}`}>
      {buttons.map((button) => (
        <button
          key={button.id}
          onClick={button.onClick}
          disabled={button.disabled}
          className={`${getButtonClasses(button.variant, size)} ${button.className || ''} ${
            layout === 'horizontal' ? 'flex-shrink-0 whitespace-nowrap' : ''
          }`}
        >
          {button.icon && (
            <span className="w-4 h-4 md:w-5 md:h-5">
              {button.icon}
            </span>
          )}
          
          {/* Responsive text */}
          <span className="hidden sm:inline">
            {button.label}
          </span>
          <span className="sm:hidden">
            {button.shortLabel || button.label}
          </span>
        </button>
      ))}
    </div>
  )
}

export default MobileResponsiveButtonGroup