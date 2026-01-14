'use client'

import React, { useState, useRef, useEffect } from 'react'

interface DropdownMenuProps {
  children: React.ReactNode
}

export function DropdownMenu({ children }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <div className="relative inline-block text-left">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { 
            isOpen, 
            setIsOpen,
            ...child.props 
          } as any)
        }
        return child
      })}
    </div>
  )
}

interface DropdownMenuTriggerProps {
  children: React.ReactNode
  isOpen?: boolean
  setIsOpen?: (open: boolean) => void
}

export function DropdownMenuTrigger({ 
  children, 
  isOpen, 
  setIsOpen 
}: DropdownMenuTriggerProps) {
  return (
    <div onClick={() => setIsOpen?.(!isOpen)}>
      {children}
    </div>
  )
}

interface DropdownMenuContentProps {
  children: React.ReactNode
  isOpen?: boolean
  setIsOpen?: (open: boolean) => void
  className?: string
}

export function DropdownMenuContent({ 
  children, 
  isOpen, 
  setIsOpen,
  className = ''
}: DropdownMenuContentProps) {
  const ref = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen?.(false)
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, setIsOpen])
  
  if (!isOpen) return null
  
  return (
    <div 
      ref={ref}
      className={`absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50 ${className}`}
    >
      <div className="py-1">
        {children}
      </div>
    </div>
  )
}

interface DropdownMenuItemProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}

export function DropdownMenuItem({ 
  children, 
  onClick,
  className = ''
}: DropdownMenuItemProps) {
  return (
    <button
      className={`block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

interface DropdownMenuSeparatorProps {
  className?: string
}

export function DropdownMenuSeparator({ className = '' }: DropdownMenuSeparatorProps) {
  return <div className={`border-t border-gray-100 my-1 ${className}`} />
}