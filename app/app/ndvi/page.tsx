'use client'

import NDVIDashboard from '@/components/ndvi/NDVIDashboard'
import { useGarden } from '@/packages/core/hooks/useGarden'

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