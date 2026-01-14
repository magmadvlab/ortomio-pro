'use client'

import React from 'react'
import { TierProvider } from '@/packages/core/context/TierContext'
import { StorageProvider } from '@/packages/core/context/StorageContext'
import { AuthProvider } from '@/packages/core/hooks/useAuth'
import { AppTier } from '@/packages/core/config/tiers'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  console.log('🔍 Dashboard Layout with providers loading...')
  
  return (
    <AuthProvider>
      <StorageProvider>
        <TierProvider defaultTier={AppTier.PRO}>
          <div style={{ 
            minHeight: '100vh', 
            backgroundColor: '#f9fafb'
          }}>
            {children}
          </div>
        </TierProvider>
      </StorageProvider>
    </AuthProvider>
  )
}