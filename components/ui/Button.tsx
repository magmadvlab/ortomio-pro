import React from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'outline' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'default', ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50'
    
    const variantClasses = {
      default: 'bg-blue-600 text-white hover:bg-blue-700',
      primary: 'bg-green-600 text-white hover:bg-green-700',
      outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
      ghost: 'text-gray-700 hover:bg-gray-100',
      link: 'text-blue-600 underline-offset-4 hover:underline'
    }
    
    const sizeClasses = {
      default: 'h-10 px-4 py-2',
      sm: 'h-8 px-3 text-sm',
      lg: 'h-12 px-8',
      icon: 'h-10 w-10'
    }
    
    const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`
    
    return (
      <button
        ref={ref}
        className={classes}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'
