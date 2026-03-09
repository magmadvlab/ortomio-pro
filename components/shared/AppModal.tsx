'use client'

import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { UI_LAYERS } from '@/components/shared/uiLayers'

interface AppModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  closeOnBackdrop?: boolean
  backdropClassName?: string
  panelClassName?: string
  fullScreenOnMobile?: boolean
}

export function AppModal({
  isOpen,
  onClose,
  children,
  closeOnBackdrop = true,
  backdropClassName = '',
  panelClassName = '',
  fullScreenOnMobile = false,
}: AppModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isOpen) return

    const originalOverflow = document.body.style.overflow
    const originalPaddingRight = document.body.style.paddingRight
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

    document.body.style.overflow = 'hidden'
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', onEscape)
    return () => {
      document.removeEventListener('keydown', onEscape)
      document.body.style.overflow = originalOverflow
      document.body.style.paddingRight = originalPaddingRight
    }
  }, [isOpen, onClose])

  if (!isOpen || !mounted) return null

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 ${backdropClassName}`}
      style={{ zIndex: UI_LAYERS.modalBackdrop }}
      onClick={(event) => {
        if (closeOnBackdrop && event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        className={[
          'w-full overflow-y-auto',
          fullScreenOnMobile
            ? 'h-[100dvh] max-h-[100dvh] rounded-none sm:h-auto sm:max-h-[90vh] sm:rounded-2xl'
            : 'max-h-[90vh] rounded-2xl',
          panelClassName,
        ].join(' ')}
        style={{ zIndex: UI_LAYERS.modal }}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  )
}
