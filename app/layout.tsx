import '../index.css'
import type { Metadata, Viewport } from 'next'
import { DM_Sans, Inter, JetBrains_Mono } from 'next/font/google'
import { AuthProvider } from '@/packages/core/hooks/useAuth'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['500', '700', '800'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-jb-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'OrtoMio Agricoltura',
  description: 'Centro operativo per gestione agricola, appezzamenti e coltivazioni',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'OrtoMio',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#1b7a6b',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it" suppressHydrationWarning className={`${dmSans.variable} ${inter.variable} ${jetBrainsMono.variable}`}>
      <body className="bg-gray-50">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
