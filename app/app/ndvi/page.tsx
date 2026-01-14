'use client'

import dynamic from 'next/dynamic'
import { useGarden } from '@/packages/core/hooks/useGarden'

const NDVIDashboard = dynamic(() => import('@/components/ndvi/NDVIDashboard'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-12">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Caricamento dashboard NDVI...</p>
      </div>
    </div>
  )
})

export default function NDVIPage() {
  const { activeGarden } = useGarden()

  if (!activeGarden) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">Seleziona un orto per visualizzare i dati NDVI</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">🛰️ NDVI Satellitare</h1>
        <p className="text-gray-600 mt-1">Monitoraggio satellitare della vegetazione</p>
      </div>
      <NDVIDashboard garden={activeGarden} />
    </div>
  )
}