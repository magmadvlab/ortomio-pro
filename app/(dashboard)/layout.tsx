'use client'

import React from 'react'
import { TierProvider } from '@/packages/core/context/TierContext'
import { StorageProvider } from '@/packages/core/context/StorageContext'
import { AuthProvider } from '@/packages/core/hooks/useAuth'
import { getDefaultStorageProvider } from '@/packages/core/storage/factory'
import { useTier } from '@/packages/core/hooks/useTier'
import { AppTier } from '@/packages/core/config/tiers'
import { ConsumerSidebar } from '@/components/consumer/Sidebar'
import { ProfessionalSidebar } from '@/components/professional/Sidebar'
import { FreeSidebar } from '@/components/shared/FreeSidebar'
import GlobalSearch from '@/components/shared/GlobalSearch'
import AuthStatus from '@/components/shared/AuthStatus'
import InstallPrompt from '@/components/shared/InstallPrompt'

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isProfessional, isConsumer } = useTier()
  
  const getSidebar = () => {
    if (isProfessional) {
      return <ProfessionalSidebar />
    }
    if (isConsumer) {
      return <ConsumerSidebar />
    }
    return <FreeSidebar />
  }
  
  return (
    <div className="flex min-h-screen" style={{
      background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 25%, #a7f3d0 50%, #d1fae5 75%, #ecfdf5 100%)',
      backgroundAttachment: 'fixed'
    }}>
      {getSidebar()}
      <div className="flex-1 flex flex-col">
        {/* Header with Global Search and Auth Status */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-green-200 shadow-sm">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex-1 max-w-md">
              <GlobalSearch />
            </div>
            <div className="ml-4">
              <AuthStatus />
            </div>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <InstallPrompt />
      </div>
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const storageProvider = getDefaultStorageProvider()
  
  // LOCALE: Sblocca tutte le feature impostando PRO_PROFESSIONAL di default
  // In produzione, ripristinare AppTier.FREE
  const isLocalDev = process.env.NODE_ENV === 'development' || typeof window !== 'undefined' && window.location.hostname === 'localhost'
  const defaultTier = isLocalDev ? AppTier.PRO_PROFESSIONAL : AppTier.FREE
  
  return (
    <AuthProvider>
      <StorageProvider initialProvider={storageProvider}>
        <TierProvider defaultTier={defaultTier}>
          <DashboardContent>{children}</DashboardContent>
        </TierProvider>
      </StorageProvider>
    </AuthProvider>
  )
}

