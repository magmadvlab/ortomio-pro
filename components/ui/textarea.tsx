'use client'

import React from 'react'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string
  variant?: 'default' | 'error' | 'success'
}

export function Textarea({ 
  className = '', 
  variant = 'default',
  ...props 
}: TextareaProps) {
  const baseClasses = 'w-full px-3 py-2 rounded-lg focus:ring-2 focus:outline-none transition-colors resize-vertical min-h-[80px]'
  
  const variantClasses = {
    default: 'border border-gray-300 focus:ring-green-500 focus:border-transparent',
    error: 'border border-red-500 focus:ring-red-500 focus:border-transparent',
    success: 'border border-green-500 focus:ring-green-500 focus:border-transparent'
  }
  
  const textareaClasses = `${baseClasses} ${variantClasses[variant]} ${className}`
  
  return (
    <textarea
      className={textareaClasses}
      {...props}
    />
  )
}