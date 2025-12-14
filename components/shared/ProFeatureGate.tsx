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
  requiredTier?: 'PRO_CONSUMER' | 'PRO_PROFESSIONAL' | 'PRO'
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
  const { tier, isPro, isConsumer, isProfessional } = useTier()
  
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
    
    if (requiredTier === 'PRO_PROFESSIONAL') {
      return isProfessional
    }
    if (requiredTier === 'PRO_CONSUMER') {
      return isConsumer || tier === AppTier.PRO
    }
    // PRO (legacy) or any PRO tier
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
        feature={title || feature}
        description={description}
        benefits={benefits}
        requiredTier={requiredTier}
      />
    </div>
  )
}


