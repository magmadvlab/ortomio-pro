'use client'

import React from 'react'
import { TierProvider } from '@/packages/core/context/TierContext'
import { StorageProvider } from '@/packages/core/context/StorageContext'
import { AuthProvider } from '@/packages/core/hooks/useAuth'
import { AppTier } from '@/packages/core/config/tiers'
import { ProfessionalSidebar } from '@/components/professional/Sidebar'
import GlobalAIChat from '@/components/ai/GlobalAIChat'
import TopBar from '@/components/shared/TopBar'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <StorageProvider>
        <TierProvider defaultTier={AppTier.PRO}>
          <div className="flex min-h-screen bg-gray-50">
            <ProfessionalSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <TopBar />
              <main className="flex-1 overflow-auto">
                {children}
              </main>
            </div>
            {/* Chat AI Globale */}
            <GlobalAIChat />
          </div>
        </TierProvider>
      </StorageProvider>
    </AuthProvider>
  )
}