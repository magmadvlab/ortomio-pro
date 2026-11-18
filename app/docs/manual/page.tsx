import type { Metadata } from 'next'
import ManualIndex from '@/components/help/ManualIndex'
import { getManualChapters } from '@/lib/manual/content'

export const metadata: Metadata = { title: 'Manuale passo per passo | OrtoMio' }

export default function ManualPage() {
  return <main className="min-h-screen bg-gray-50"><ManualIndex chapters={getManualChapters()} /></main>
}
