'use client'

import React from 'react'
import { useTier } from '@/packages/core/hooks/useTier'
import { AppTier } from '@/packages/core/config/tiers'
import { UpgradeCard } from './UpgradeCard'

interface ProFeatureGateProps {
  feature: string
  title?: string
  description?: string
  benefits?: string[]
  children: React.ReactNode
  showPreview?: boolean
  requiredTier?: 'PLUS' | 'PRO' | 'PRO_CONSUMER' | 'PRO_PROFESSIONAL' | string // Legacy tiers supported for backward compatibility
}

export function ProFeatureGate({ 
  feature, 
  title, 
  description,
  benefits,
  children,
  showPreview = false,
  requiredTier = 'PRO'
}: ProFeatureGateProps) {
  const { tier, isPro, isPlus } = useTier()
  
  // LOCALE: Bypassa tutti i controlli in sviluppo locale
  const isLocalDev = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' ||
    process.env.NODE_ENV === 'development'
  )
  
  // Check if user has required tier
  const hasAccess = () => {
    // LOCALE: Permetti sempre accesso in sviluppo
    if (isLocalDev) {
      return true
    }
    
    // New tier system
    if (requiredTier === 'PRO') {
      return tier === AppTier.PRO
    }
    if (requiredTier === 'PLUS') {
      return tier === AppTier.PLUS || tier === AppTier.PRO
    }
    
    // Legacy tier support (backward compatibility)
    if (requiredTier === 'PRO_PROFESSIONAL') {
      return tier === AppTier.PRO
    }
    if (requiredTier === 'PRO_CONSUMER') {
      return tier === AppTier.PLUS || tier === AppTier.PRO
    }
    
    // Default: any PRO tier (PLUS or PRO)
    return isPro
  }
  
  if (hasAccess()) {
    return <>{children}</>
  }
  
  return (
    <div className="relative">
      {showPreview && (
        <div className="blur-sm pointer-events-none opacity-50">
          {children}
        </div>
      )}
      
      <UpgradeCard
        feature={title || feature || 'Feature Pro'}
        description={description}
        benefits={benefits}
        requiredTier={requiredTier as any}
      />
    </div>
  )
}


