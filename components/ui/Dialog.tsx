'use client'

import React from 'react'

interface DialogProps {
  children: React.ReactNode
  open?: boolean
  onClose?: () => void
}

export function Dialog({ children, open = true, onClose }: DialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}






















