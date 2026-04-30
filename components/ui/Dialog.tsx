'use client'

import React from 'react'
import { X } from 'lucide-react'

interface DialogProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  ariaLabelledBy?: string
}

export function Dialog({ children, open = true, onOpenChange, ariaLabelledBy }: DialogProps) {
  if (!open) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" 
      onClick={() => onOpenChange?.(false)}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledBy}
      >
        {children}
      </div>
    </div>
  )
}

interface DialogContentProps {
  children: React.ReactNode
  className?: string
}

export function DialogContent({ children, className = '' }: DialogContentProps) {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  )
}

interface DialogHeaderProps {
  children: React.ReactNode
  className?: string
}

export function DialogHeader({ children, className = '' }: DialogHeaderProps) {
  return (
    <div className={`pb-4 border-b border-gray-200 ${className}`}>
      {children}
    </div>
  )
}

interface DialogTitleProps {
  children: React.ReactNode
  className?: string
  id?: string
}

export function DialogTitle({ children, className = '', id }: DialogTitleProps) {
  return (
    <h2 id={id} className={`text-lg font-semibold text-gray-900 ${className}`}>
      {children}
    </h2>
  )
}
