/**
 * Mobile Optimized Modal
 * Sistema di modal completamente ottimizzato per dispositivi mobili
 */

import React, { useEffect, useRef } from 'react'
import { X, ChevronDown } from 'lucide-react'

interface MobileOptimizedModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  position?: 'center' | 'bottom' | 'top'
  showCloseButton?: boolean
  closeOnBackdrop?: boolean
  className?: string
  headerActions?: React.ReactNode
  style?: React.CSSProperties
}

export default function MobileOptimizedModal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  position = 'center',
  showCloseButton = true,
  closeOnBackdrop = true,
  className = '',
  headerActions,
  style
}: MobileOptimizedModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      // Add padding to prevent layout shift
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      document.body.style.paddingRight = `${scrollbarWidth}px`
    } else {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }

    return () => {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  // Size configurations
  const sizeClasses = {
    sm: 'max-w-[95vw] sm:max-w-sm',
    md: 'max-w-[95vw] sm:max-w-md',
    lg: 'max-w-[95vw] sm:max-w-2xl',
    xl: 'max-w-[95vw] sm:max-w-4xl',
    full: 'max-w-full'
  }

  // Position configurations
  const getPositionClasses = () => {
    switch (position) {
      case 'bottom':
        return 'items-end justify-center pb-4'
      case 'top':
        return 'items-start justify-center pt-4'
      case 'center':
      default:
        return 'items-center justify-center'
    }
  }

  // Mobile-specific classes
  const mobileClasses = `
    ${position === 'bottom' ? 'rounded-t-2xl rounded-b-none' : 'rounded-2xl'}
    ${size === 'full' ? 'h-full' : 'max-h-[95vh]'}
  `

  return (
    <div
      className={`
        fixed inset-0 z-50 flex ${getPositionClasses()}
        bg-black/50 backdrop-blur-sm
        p-4 sm:p-6
        transition-all duration-300 ease-out
      `}
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className={`
          bg-white shadow-2xl w-full
          ${sizeClasses[size]}
          ${mobileClasses}
          ${className}
          transform transition-all duration-300 ease-out
          overflow-hidden flex flex-col
        `}
        style={style}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 px-4 sm:px-6 py-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                {title}
              </h2>
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              {headerActions}
              
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="
                    p-2 rounded-full hover:bg-gray-100 
                    transition-colors duration-200
                    touch-manipulation
                    min-w-[44px] min-h-[44px]
                    flex items-center justify-center
                  "
                  aria-label="Chiudi modal"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              )}
            </div>
          </div>
          
          {/* Mobile drag indicator for bottom sheets */}
          {position === 'bottom' && (
            <div className="flex justify-center mt-2">
              <div className="w-12 h-1 bg-gray-300 rounded-full" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="p-4 sm:p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Mobile Optimized Bottom Sheet
 * Variante ottimizzata per mobile che si apre dal basso
 */
interface MobileBottomSheetProps extends Omit<MobileOptimizedModalProps, 'position'> {
  snapPoints?: number[] // Percentuali di altezza (es. [50, 90])
  defaultSnap?: number
}

export function MobileBottomSheet({
  snapPoints = [50, 90],
  defaultSnap = 0,
  ...props
}: MobileBottomSheetProps) {
  const [currentSnap, setCurrentSnap] = React.useState(defaultSnap)
  
  return (
    <MobileOptimizedModal
      {...props}
      position="bottom"
      className={`
        ${props.className}
        transition-transform duration-300 ease-out
      `}
      style={{
        height: `${snapPoints[currentSnap]}vh`,
        transform: props.isOpen ? 'translateY(0)' : 'translateY(100%)'
      }}
    />
  )
}

/**
 * Mobile Optimized Confirmation Dialog
 * Dialog di conferma ottimizzato per mobile
 */
interface MobileConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'danger' | 'warning'
}

export function MobileConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Conferma',
  cancelText = 'Annulla',
  variant = 'default'
}: MobileConfirmDialogProps) {
  const variantClasses = {
    default: 'bg-green-600 hover:bg-green-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    warning: 'bg-yellow-600 hover:bg-yellow-700 text-white'
  }

  return (
    <MobileOptimizedModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      showCloseButton={false}
    >
      <div className="space-y-6">
        <p className="text-gray-700 leading-relaxed">
          {message}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            onClick={onClose}
            className="
              flex-1 px-4 py-3 border border-gray-300 rounded-lg
              text-gray-700 font-medium
              hover:bg-gray-50 transition-colors
              min-h-[44px] touch-manipulation
            "
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className={`
              flex-1 px-4 py-3 rounded-lg font-medium
              transition-colors min-h-[44px] touch-manipulation
              ${variantClasses[variant]}
            `}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </MobileOptimizedModal>
  )
}

/**
 * Mobile Optimized Action Sheet
 * Menu di azioni ottimizzato per mobile
 */
interface ActionSheetAction {
  id: string
  label: string
  icon?: React.ReactNode
  variant?: 'default' | 'danger' | 'primary'
  disabled?: boolean
}

interface MobileActionSheetProps {
  isOpen: boolean
  onClose: () => void
  onAction: (actionId: string) => void
  title?: string
  actions: ActionSheetAction[]
}

export function MobileActionSheet({
  isOpen,
  onClose,
  onAction,
  title,
  actions
}: MobileActionSheetProps) {
  const getActionClasses = (variant: ActionSheetAction['variant'] = 'default') => {
    switch (variant) {
      case 'danger':
        return 'text-red-600 hover:bg-red-50'
      case 'primary':
        return 'text-green-600 hover:bg-green-50'
      default:
        return 'text-gray-900 hover:bg-gray-50'
    }
  }

  return (
    <MobileOptimizedModal
      isOpen={isOpen}
      onClose={onClose}
      title={title || 'Azioni'}
      position="bottom"
      size="full"
    >
      <div className="space-y-2">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => {
              if (!action.disabled) {
                onAction(action.id)
                onClose()
              }
            }}
            disabled={action.disabled}
            className={`
              w-full flex items-center gap-4 p-4 rounded-lg
              transition-colors min-h-[56px] touch-manipulation
              disabled:opacity-50 disabled:cursor-not-allowed
              ${getActionClasses(action.variant)}
            `}
          >
            {action.icon && (
              <div className="flex-shrink-0">
                {action.icon}
              </div>
            )}
            <span className="flex-1 text-left font-medium">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </MobileOptimizedModal>
  )
}