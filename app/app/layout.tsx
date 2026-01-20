'use client'

import React from 'react'
import { TierProvider } from '@/packages/core/context/TierContext'
import { StorageProvider } from '@/packages/core/context/StorageContext'
import { AuthProvider } from '@/packages/core/hooks/useAuth'
import { AppTier } from '@/packages/core/config/tiers'
import { ProfessionalSidebar } from '@/components/professional/Sidebar'
import GlobalAIChat from '@/components/ai/GlobalAIChat'
import TopBar from '@/components/shared/TopBar'
import AuthGuard from '@/components/auth/AuthGuard'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <AuthGuard>
        <StorageProvider>
          <TierProvider defaultTier={AppTier.PRO}>
            <div className="flex min-h-screen bg-gray-50">
              <ProfessionalSidebar />
              <div className="flex-1 flex flex-col overflow-hidden">
                <TopBar />
                <main className="flex-1 overflow-auto">
                  {children}
                </main>
                {/* Footer con credits */}
                <footer className="bg-white border-t border-gray-200 py-2 px-4 text-center">
                  <p className="text-xs text-gray-500">
                    OrtoMio © 2024-2026 | Sviluppato da <span className="font-medium">Roberto Lalinga</span> |
                    <a href="mailto:roberto.lalinga@gmail.com" className="text-blue-600 hover:underline ml-1">
                      roberto.lalinga@gmail.com
                    </a>
                  </p>
                </footer>
              </div>
              {/* Chat AI Globale */}
              <GlobalAIChat />
            </div>
          </TierProvider>
        </StorageProvider>
      </AuthGuard>
    </AuthProvider>
  )
}