'use client'

import { useState, useEffect } from 'react'
import { SearchModalProvider } from '@/contexts/SearchModalContext'
import { RechercheModalProvider } from '@/contexts/RechercheModalContext'
import { AuthModalProvider } from '@/contexts/AuthModalContext'
import GlobalSearchModal from '@/components/GlobalSearchModal'
import RechercheModal from '@/components/RechercheModal'
import AuthModal from '@/components/AuthModal'
import BottomNav from '@/components/BottomNav'

// Splash screen — fond blanc, logo + titre + spinner
function SplashScreen() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      <img
        src="/logo-titre.svg"
        alt="Zafer"
        style={{ width: 460, height: 230, marginBottom: 24, objectFit: 'contain' }}
      />

      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          border: '3px solid rgba(73,105,119,0.2)',
          borderTopColor: '#496977',
          animation: 'zafer-spin 0.8s linear infinite',
        }}
      />

      <style>{`
        @keyframes zafer-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

// Wrapper client pour le layout — nécessaire pour utiliser les contextes dans le Server Component layout.tsx
// Vérifie si une nouvelle version est dispo et recharge le PWA automatiquement
function useAutoUpdate() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }

    const KEY = 'zafer_version'
    fetch('/version.json?t=' + Date.now(), { cache: 'no-store' })
      .then(r => r.json())
      .then(({ v }) => {
        const saved = localStorage.getItem(KEY)
        if (saved && saved !== String(v)) {
          localStorage.setItem(KEY, String(v))
          window.location.reload()
        } else {
          localStorage.setItem(KEY, String(v))
        }
      })
      .catch(() => {})
  }, [])
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [splash, setSplash] = useState(true)
  useAutoUpdate()

  useEffect(() => {
    const t = setTimeout(() => setSplash(false), 2000)
    return () => clearTimeout(t)
  }, [])

  return (
    <SearchModalProvider>
      <RechercheModalProvider>
        <AuthModalProvider>
          {splash && <SplashScreen />}
          <main className="min-h-screen pb-20">
            {children}
          </main>
          <BottomNav />
          <GlobalSearchModal />
          <RechercheModal />
          <AuthModal />
        </AuthModalProvider>
      </RechercheModalProvider>
    </SearchModalProvider>
  )
}
