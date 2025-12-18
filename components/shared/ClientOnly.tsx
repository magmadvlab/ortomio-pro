'use client'

import { useEffect, useState } from 'react'

/**
 * ClientOnly - Wrapper per componenti che devono renderizzare solo lato client
 * Previene hydration mismatch in Next.js SSR
 * 
 * @example
 * <ClientOnly>
 *   <ComponenteCheUsaWindow />
 * </ClientOnly>
 */
export default function ClientOnly({ 
  children, 
  fallback = null 
}: { 
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted) return <>{fallback}</>
  
  return <>{children}</>
}

