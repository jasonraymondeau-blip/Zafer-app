import type { Metadata, Viewport } from 'next'
import './globals.css'
import Providers from './Providers'

export const metadata: Metadata = {
  title: 'Zafer — Petites annonces île Maurice',
  description: "Achetez et vendez facilement à l'île Maurice",
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Zafer',
  },
  icons: {
    apple: '/icon-192.png',
  },
}

// Empêche le zoom automatique d'iOS sur les inputs (font-size < 16px)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-white text-text-main antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
