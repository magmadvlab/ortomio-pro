'use client'

import { useState, useEffect } from 'react'

interface AICreditsData {
  total: number
  used: number
  resetDate: string | null
  remaining: number
}

export function useAICredits() {
  const [credits, setCredits] = useState<AICreditsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
  const fetchCredits = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/credits/status')
      
      if (!response.ok) {
        // Handle 401 (Unauthorized) gracefully - user is not authenticated
        if (response.status === 401) {
          setCredits({ total: 0, used: 0, resetDate: null, remaining: 0 })
          setError(null)
          setIsLoading(false)
          return
        }
        throw new Error('Failed to fetch credits')
      }
      
      const data = await response.json()
      setCredits({
        ...data,
        remaining: data.total - data.used,
      })
      setError(null)
    } catch (err) {
      // Only set error for non-401 errors
      if (err instanceof Error && !err.message.includes('401')) {
        setError(err)
      } else {
        setError(null)
      }
      // Set default credits on error
      setCredits({ total: 0, used: 0, resetDate: null, remaining: 0 })
    } finally {
      setIsLoading(false)
    }
  }
  
  useEffect(() => {
    fetchCredits()
    
    // Refetch every 30 seconds
    const interval = setInterval(fetchCredits, 30000)
    
    return () => clearInterval(interval)
  }, [])
  
  const remaining = credits ? credits.remaining : 0
  const percentage = credits && credits.total > 0 
    ? (credits.used / credits.total) * 100 
    : 0
  
  return {
    credits: credits || { total: 0, used: 0, resetDate: null, remaining: 0 },
    remaining,
    percentage,
    isLoading,
    error,
    refetch: fetchCredits,
  }
}








