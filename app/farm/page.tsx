'use client'

import dynamic from 'next/dynamic'

const FarmCommandCenter = dynamic(() =>
  import('@/components/farm/FarmCommandCenter').then(m => m.FarmCommandCenter), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-12">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Caricamento Farm Command Center...</p>
      </div>
    </div>
  )
})

export default function FarmPage() {
  return (
    <main className="p-4 h-[calc(100vh-4rem)]">
      <FarmCommandCenter />
    </main>
  );
}
