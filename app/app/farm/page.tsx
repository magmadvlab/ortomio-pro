'use client'

import dynamic from 'next/dynamic'

const FarmCommandCenter = dynamic(() =>
  import('@/components/farm/FarmCommandCenter').then((module) => module.FarmCommandCenter), {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[360px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-b-2 border-emerald-700" />
          <p className="text-sm text-gray-600">Caricamento centro operativo...</p>
        </div>
      </div>
    ),
  }
)

export default function AppFarmPage() {
  return (
    <main className="h-[calc(100vh-4rem)] p-3 sm:p-4">
      <FarmCommandCenter />
    </main>
  )
}
