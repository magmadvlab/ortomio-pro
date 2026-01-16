'use client'

import React, { useState, useEffect } from 'react'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { Garden } from '@/types'
import CertificationsDashboard from '@/components/certifications/CertificationsDashboard'

export default function CertificationsPage() {
  const { storageProvider } = useStorage()
  const [activeGarden, setActiveGarden] = useState<Garden | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadGarden = async () => {
      try {
        const gardens = await storageProvider.getGardens()
        if (gardens.length > 0) {
          setActiveGarden(gardens[0])
        }
      } catch (error) {
        console.error('Error loading garden:', error)
      } finally {
        setLoading(false)
      }
    }
    loadGarden()
  }, [storageProvider])

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (!activeGarden) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            Nessun orto trovato. Crea un orto per gestire le certificazioni.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <CertificationsDashboard gardenId={activeGarden.id} />
    </div>
  )
}