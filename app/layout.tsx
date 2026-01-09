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
    <html lang="it" suppressHydrationWarning>
      <body className="bg-gray-50">
        {children}
      </body>
    </html>
  )
}