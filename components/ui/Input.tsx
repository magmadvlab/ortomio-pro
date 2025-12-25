'use client'

import React from 'react'
import { CheckCircle, AlertCircle } from 'lucide-react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string
  variant?: 'default' | 'error' | 'success'
  errorMessage?: string
  successMessage?: string
}

export function Input({ 
  className = '', 
  variant = 'default',
  errorMessage,
  successMessage,
  ...props 
}: InputProps) {
  const baseClasses = 'w-full px-3 py-2 rounded-lg focus:ring-2 focus:outline-none transition-colors'
  
  const variantClasses = {
    default: 'border border-gray-300 focus:ring-ortomio-green-500 focus:border-transparent',
    error: 'border border-semantic-error focus:ring-red-500 focus:border-transparent',
    success: 'border border-semantic-success focus:ring-ortomio-green-500 focus:border-transparent'
  }
  
  const inputClasses = `${baseClasses} ${variantClasses[variant]} ${className}`
  
  return (
    <div className="w-full">
      <div className="relative">
        <input
          className={inputClasses}
          {...props}
        />
        {variant === 'success' && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <CheckCircle className="w-5 h-5 text-semantic-success" />
          </div>
        )}
        {variant === 'error' && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <AlertCircle className="w-5 h-5 text-semantic-error" />
          </div>
        )}
      </div>
      {errorMessage && (
        <p className="mt-1 text-sm text-semantic-error flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {errorMessage}
        </p>
      )}
      {successMessage && (
        <p className="mt-1 text-sm text-semantic-success flex items-center gap-1">
          <CheckCircle className="w-4 h-4" />
          {successMessage}
        </p>
      )}
    </div>
  )
}
















