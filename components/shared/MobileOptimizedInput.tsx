'use client'

import React from 'react'
import { LucideIcon } from 'lucide-react'

interface MobileOptimizedInputProps {
  id?: string
  name?: string
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'
  placeholder?: string
  value?: string | number
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void
  disabled?: boolean
  required?: boolean
  autoComplete?: string
  autoFocus?: boolean
  min?: number
  max?: number
  step?: number
  pattern?: string
  maxLength?: number
  icon?: LucideIcon
  error?: string
  label?: string
  helperText?: string
  className?: string
  inputClassName?: string
  size?: 'sm' | 'md' | 'lg'
}

export const MobileOptimizedInput: React.FC<MobileOptimizedInputProps> = ({
  id,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  disabled = false,
  required = false,
  autoComplete,
  autoFocus = false,
  min,
  max,
  step,
  pattern,
  maxLength,
  icon: Icon,
  error,
  label,
  helperText,
  className = '',
  inputClassName = '',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base', // Mobile-friendly default
    lg: 'px-4 py-4 text-lg'
  }

  const baseInputClasses = `
    w-full
    border border-gray-300 
    rounded-lg 
    transition-all duration-200
    focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
    ${sizeClasses[size]}
    ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
    ${Icon ? 'pl-10 sm:pl-12' : ''}
    ${inputClassName}
  `

  return (
    <div className={`space-y-1 ${className}`}>
      {/* Label */}
      {label && (
        <label 
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Icon */}
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon 
              size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} 
              className={`text-gray-400 ${error ? 'text-red-400' : ''}`} 
            />
          </div>
        )}

        {/* Input */}
        <input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          min={min}
          max={max}
          step={step}
          pattern={pattern}
          maxLength={maxLength}
          className={baseInputClasses}
          // Mobile optimizations
          inputMode={type === 'number' ? 'numeric' : type === 'tel' ? 'tel' : type === 'email' ? 'email' : 'text'}
          // Prevent zoom on iOS
          style={{ fontSize: size === 'sm' ? '14px' : '16px' }}
        />
      </div>

      {/* Helper Text */}
      {helperText && !error && (
        <p className="text-xs text-gray-500 mt-1">
          {helperText}
        </p>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-xs text-red-600 mt-1 flex items-center gap-3">
          <span>⚠️</span>
          {error}
        </p>
      )}
    </div>
  )
}

interface MobileOptimizedTextareaProps {
  id?: string
  name?: string
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void
  onFocus?: (e: React.FocusEvent<HTMLTextAreaElement>) => void
  disabled?: boolean
  required?: boolean
  rows?: number
  maxLength?: number
  error?: string
  label?: string
  helperText?: string
  className?: string
  textareaClassName?: string
  resize?: boolean
}

export const MobileOptimizedTextarea: React.FC<MobileOptimizedTextareaProps> = ({
  id,
  name,
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  disabled = false,
  required = false,
  rows = 3,
  maxLength,
  error,
  label,
  helperText,
  className = '',
  textareaClassName = '',
  resize = true
}) => {
  const baseTextareaClasses = `
    w-full
    px-4 py-3 
    text-base
    border border-gray-300 
    rounded-lg 
    transition-all duration-200
    focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
    ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
    ${resize ? 'resize-y' : 'resize-none'}
    ${textareaClassName}
  `

  return (
    <div className={`space-y-1 ${className}`}>
      {/* Label */}
      {label && (
        <label 
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Textarea */}
      <textarea
        id={id}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        disabled={disabled}
        required={required}
        rows={rows}
        maxLength={maxLength}
        className={baseTextareaClasses}
        // Prevent zoom on iOS
        style={{ fontSize: '16px' }}
      />

      {/* Character Count */}
      {maxLength && (
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>{helperText}</span>
          <span>{(value?.length || 0)}/{maxLength}</span>
        </div>
      )}

      {/* Helper Text (without character count) */}
      {helperText && !maxLength && !error && (
        <p className="text-xs text-gray-500 mt-1">
          {helperText}
        </p>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-xs text-red-600 mt-1 flex items-center gap-3">
          <span>⚠️</span>
          {error}
        </p>
      )}
    </div>
  )
}

export default MobileOptimizedInput