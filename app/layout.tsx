import '../index.css'
import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'OrtoMio AI',
  description: 'Il tuo assistente intelligente per l\'orto',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'OrtoMio',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#10b981',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-screen" style={{
        background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 25%, #a7f3d0 50%, #d1fae5 75%, #ecfdf5 100%)',
        backgroundAttachment: 'fixed'
      }}>{children}</body>
    </html>
  )
}


