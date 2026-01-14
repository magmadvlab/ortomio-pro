/**
 * Lazy Loader Component
 * Caricamento lazy per componenti pesanti per migliorare le performance
 */

'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Loader2 } from 'lucide-react'

interface LazyLoaderProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  delay?: number
  threshold?: number
}

export default function LazyLoader({ 
  children, 
  fallback, 
  delay = 0,
  threshold = 0.1 
}: LazyLoaderProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [shouldLoad, setShouldLoad] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          
          // Delay opzionale per evitare caricamenti troppo rapidi
          if (delay > 0) {
            setTimeout(() => {
              setShouldLoad(true)
            }, delay)
          } else {
            setShouldLoad(true)
          }
          
          observer.disconnect()
        }
      },
      { threshold }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [delay, threshold])

  const defaultFallback = (
    <div className="flex items-center justify-center p-8">
      <div className="flex items-center gap-3 text-gray-500">
        <Loader2 className="animate-spin" size={20} />
        <span>Caricamento...</span>
      </div>
    </div>
  )

  return (
    <div ref={ref}>
      {shouldLoad ? children : (fallback || defaultFallback)}
    </div>
  )
}