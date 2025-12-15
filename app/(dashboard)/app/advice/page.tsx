'use client'

import React, { useState, useEffect } from 'react'
import Advice from '@/components/Advice'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { useTier } from '@/packages/core/hooks/useTier'
import { ProFeatureGate } from '@/components/shared/ProFeatureGate'
import { AIRequestModal } from '@/components/shared/AIRequestModal'
import { useAICredits } from '@/hooks/useAICredits'
import { useSearchParams } from 'next/navigation'

export default function AdvicePage() {
  const { storageProvider } = useStorage()
  const { tier, isFree } = useTier()
  const { credits } = useAICredits()
  const [garden, setGarden] = React.useState<any>(null)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<'chat' | 'diagnose' | 'recipe'>('chat')
  const searchParams = useSearchParams()
  const [initialTab, setInitialTab] = useState<'diagnosis' | 'consultations' | 'agronomists'>('diagnosis')
  
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'consultations' || tab === 'agronomists') {
      setInitialTab(tab)
    }
  }, [searchParams])
  
  React.useEffect(() => {
    const loadData = async () => {
      const gardens = await storageProvider.getGardens()
      if (gardens.length > 0) {
        setGarden(gardens[0])
      }
    }
    loadData()
  }, [storageProvider])
  
  if (!garden) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Caricamento...</p>
      </div>
    )
  }
  
  // LOCALE PRO: Accesso completo senza limitazioni FREE/PRO
  // In produzione, ripristinare i gate FREE/PRO se necessario
  return (
    <div className="min-h-screen">
      {showModal && (
        <AIRequestModal
          type={modalType}
          onConfirm={() => {
            setShowModal(false)
            // Proceed with AI request
          }}
          onCancel={() => setShowModal(false)}
          credits={credits}
        />
      )}
      
      <Advice
        onAddToJournal={(title, notes, date) => {
          // Implementation
        }}
        initialTab={initialTab}
      />
    </div>
  )
}

