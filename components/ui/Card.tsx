'use client'

import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'elevated' | 'interactive'
  status?: 'success' | 'warning' | 'error'
  onClick?: () => void
}

export function Card({ 
  children, 
  className = '',
  variant = 'default',
  status,
  onClick
}: CardProps) {
  const baseClasses = 'bg-white rounded-lg border border-gray-200'
  
  const variantClasses = {
    default: 'shadow-sm',
    elevated: 'shadow-md',
    interactive: 'shadow-sm transition-all duration-200 cursor-pointer hover:shadow-md hover:-translate-y-0.5'
  }
  
  const statusClasses = {
    success: 'border-l-4 border-semantic-success',
    warning: 'border-l-4 border-semantic-warning',
    error: 'border-l-4 border-semantic-error'
  }
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${status ? statusClasses[status] : ''} ${className}`
  
  if (onClick || variant === 'interactive') {
    return (
      <div 
        className={classes}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={onClick ? (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onClick()
          }
        } : undefined}
      >
        {children}
      </div>
    )
  }
  
  return (
    <div className={classes}>
      {children}
    </div>
  )
}

