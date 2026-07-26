'use client'

import React from 'react'

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
  children,
}: ProFeatureGateProps) {
  return <>{children}</>
}

