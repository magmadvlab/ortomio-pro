'use client'

import React, { useState } from 'react'
import { TierProvider } from '@/packages/core/context/TierContext'
import { StorageProvider } from '@/packages/core/context/StorageContext'
import { AuthProvider } from '@/packages/core/hooks/useAuth'
import { useTier } from '@/packages/core/hooks/useTier'
import { AppTier } from '@/packages/core/config/tiers'
import { ConsumerSidebar } from '@/components/consumer/Sidebar'
import { ProfessionalSidebar } from '@/components/professional/Sidebar'
import { FreeSidebar } from '@/components/shared/FreeSidebar'
import { MobileHeader } from '@/components/shared/MobileHeader'
import { MobileBottomNav } from '@/components/shared/MobileBottomNav'
import { MobileMenu } from '@/components/shared/MobileMenu'
import GlobalSearch from '@/components/shared/GlobalSearch'
import AuthStatus from '@/components/shared/AuthStatus'
import InstallPrompt from '@/components/shared/InstallPrompt'

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { tier, isPro, isPlus } = useTier()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  const getSidebar = () => {
    const safeTier = tier || 'FREE'
    if (safeTier === 'PRO') {
      return <ProfessionalSidebar />
    }
    if (isPlus || safeTier === 'PLUS') {
      return <ConsumerSidebar />
    }
    return <FreeSidebar />
  }
  
  return (
    <div className="flex min-h-screen" style={{
      background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 25%, #a7f3d0 50%, #d1fae5 75%, #ecfdf5 100%)',
      backgroundAttachment: 'fixed'
    }}>
      {/* Sidebar - solo desktop */}
      {getSidebar()}
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full lg:w-auto">
        {/* Mobile Header - solo mobile */}
        <MobileHeader onMenuClick={() => setIsMobileMenuOpen(true)} />
        
        {/* Desktop Header - solo desktop */}
        <header className="hidden lg:block sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-green-200 shadow-sm">
          <div className="px-6 py-3 flex items-center justify-between">
            <div className="flex-1 max-w-md">
              <GlobalSearch />
            </div>
            <div className="ml-4">
              <AuthStatus />
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="flex-1 px-4 py-2 lg:px-6 lg:py-4 pb-20 lg:pb-0">
          {children}
        </main>
        
        {/* Bottom Nav - solo mobile */}
        <MobileBottomNav onMenuClick={() => setIsMobileMenuOpen(true)} />
        
        <InstallPrompt />
      </div>
      
      {/* Mobile Menu Drawer */}
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // LOCALE: Sblocca tutte le feature impostando PRO di default
  // In produzione, ripristinare AppTier.FREE
  const isLocalDev = process.env.NODE_ENV === 'development' || typeof window !== 'undefined' && window.location.hostname === 'localhost'
  const defaultTier = isLocalDev ? AppTier.PRO : AppTier.FREE
  
  return (
    <AuthProvider>
      <StorageProvider>
        <TierProvider defaultTier={defaultTier}>
          <DashboardContent>{children}</DashboardContent>
        </TierProvider>
      </StorageProvider>
    </AuthProvider>
  )
}

