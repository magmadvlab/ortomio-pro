'use client'

import React from 'react'
import { LucideIcon } from 'lucide-react'

interface MobileOptimizedButtonProps {
  children: React.ReactNode
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  fullWidth?: boolean
  icon?: LucideIcon
  iconPosition?: 'left' | 'right'
  className?: string
  ariaLabel?: string
}

export const MobileOptimizedButton: React.FC<MobileOptimizedButtonProps> = ({
  children,
  onClick,
  type = 'button',
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  ariaLabel
}) => {
  // Size classes with mobile-first approach (min 44px touch target)
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[40px]', // Slightly smaller but still accessible
    md: 'px-4 py-3 text-base min-h-[44px]', // Standard mobile touch target
    lg: 'px-6 py-4 text-lg min-h-[48px]', // Larger for primary actions
    xl: 'px-8 py-5 text-xl min-h-[56px]' // Extra large for hero buttons
  }

  // Variant classes
  const variantClasses = {
    primary: `
      bg-green-600 hover:bg-green-700 
      text-white 
      border border-green-600 hover:border-green-700
      focus:ring-2 focus:ring-green-500 focus:ring-offset-2
      disabled:bg-green-300 disabled:border-green-300
    `,
    secondary: `
      bg-blue-600 hover:bg-blue-700 
      text-white 
      border border-blue-600 hover:border-blue-700
      focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
      disabled:bg-blue-300 disabled:border-blue-300
    `,
    outline: `
      bg-white hover:bg-gray-50 
      text-gray-700 hover:text-gray-900
      border border-gray-300 hover:border-gray-400
      focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
      disabled:bg-gray-50 disabled:text-gray-400 disabled:border-gray-200
    `,
    ghost: `
      bg-transparent hover:bg-gray-100 
      text-gray-700 hover:text-gray-900
      border border-transparent
      focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
      disabled:text-gray-400 disabled:hover:bg-transparent
    `,
    danger: `
      bg-red-600 hover:bg-red-700 
      text-white 
      border border-red-600 hover:border-red-700
      focus:ring-2 focus:ring-red-500 focus:ring-offset-2
      disabled:bg-red-300 disabled:border-red-300
    `
  }

  const baseClasses = `
    inline-flex items-center justify-center
    font-medium
    rounded-lg
    transition-all duration-200
    focus:outline-none
    disabled:cursor-not-allowed disabled:opacity-50
    active:scale-95
    ${fullWidth ? 'w-full' : ''}
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${className}
  `

  const iconSize = {
    sm: 16,
    md: 20,
    lg: 24,
    xl: 28
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={baseClasses}
      aria-label={ariaLabel}
    >
      {/* Loading Spinner */}
      {loading && (
        <div className="mr-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
        </div>
      )}

      {/* Left Icon */}
      {Icon && iconPosition === 'left' && !loading && (
        <Icon 
          size={iconSize[size]} 
          className={`${children ? 'mr-2' : ''} flex-shrink-0`} 
        />
      )}

      {/* Button Text */}
      {children && (
        <span className={`${fullWidth ? 'text-center' : ''} truncate`}>
          {children}
        </span>
      )}

      {/* Right Icon */}
      {Icon && iconPosition === 'right' && !loading && (
        <Icon 
          size={iconSize[size]} 
          className={`${children ? 'ml-2' : ''} flex-shrink-0`} 
        />
      )}
    </button>
  )
}

// Icon-only button variant for mobile
interface MobileIconButtonProps {
  icon: LucideIcon
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  ariaLabel: string // Required for accessibility
}

export const MobileIconButton: React.FC<MobileIconButtonProps> = ({
  icon: Icon,
  onClick,
  type = 'button',
  disabled = false,
  loading = false,
  variant = 'ghost',
  size = 'md',
  className = '',
  ariaLabel
}) => {
  // Square button sizes (min 44px for mobile)
  const sizeClasses = {
    sm: 'w-10 h-10 p-2',
    md: 'w-11 h-11 p-2.5', // 44px minimum
    lg: 'w-12 h-12 p-3'
  }

  const variantClasses = {
    primary: `
      bg-green-600 hover:bg-green-700 
      text-white 
      focus:ring-2 focus:ring-green-500 focus:ring-offset-2
    `,
    secondary: `
      bg-blue-600 hover:bg-blue-700 
      text-white 
      focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
    `,
    outline: `
      bg-white hover:bg-gray-50 
      text-gray-700 hover:text-gray-900
      border border-gray-300 hover:border-gray-400
      focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
    `,
    ghost: `
      bg-transparent hover:bg-gray-100 
      text-gray-700 hover:text-gray-900
      focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
    `,
    danger: `
      bg-red-600 hover:bg-red-700 
      text-white 
      focus:ring-2 focus:ring-red-500 focus:ring-offset-2
    `
  }

  const baseClasses = `
    inline-flex items-center justify-center
    rounded-lg
    transition-all duration-200
    focus:outline-none
    disabled:cursor-not-allowed disabled:opacity-50
    active:scale-95
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${className}
  `

  const iconSize = {
    sm: 16,
    md: 20,
    lg: 24
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={baseClasses}
      aria-label={ariaLabel}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
      ) : (
        <Icon size={iconSize[size]} />
      )}
    </button>
  )
}

export default MobileOptimizedButton