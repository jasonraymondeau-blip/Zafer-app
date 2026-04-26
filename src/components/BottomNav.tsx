'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Home, Search, Plus, Heart, User } from 'lucide-react'
import { useSearchModal } from '@/contexts/SearchModalContext'
import { useRechercheModal } from '@/contexts/RechercheModalContext'
import { useAuthModal } from '@/contexts/AuthModalContext'
import { createClient } from '@/lib/supabase-browser'

const ICON_SIZE = 24

// Hauteur de la nav + dimensions du bouton Vendre
const NAV_HEIGHT = 60
const VENDRE_CIRCLE = 36
const VENDRE_OVERHANG = 6 // px qui dépassent au-dessus de la navbar

// Couleur unique pour tous les icônes et labels
const COULEUR_NAV = '#404040'

export default function BottomNav() {
  const pathname = usePathname()
  const { isOpen } = useSearchModal()
  const { isOpen: isRechercheOpen } = useRechercheModal()
  const { openAuthModal } = useAuthModal()
  const [connecte, setConnecte] = useState<boolean | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => {
      setConnecte(!!data.session?.user)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setConnecte(!!session?.user)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Masquer sur la page détail annonce, la page vendre, et quand un modal est ouvert
  if (isOpen || isRechercheOpen || pathname.startsWith('/annonce/') || pathname === '/vendre') return null

  // Intercepte les clics sur pages protégées si non connecté → ouvre le modal de connexion
  const protect = (e: React.MouseEvent, dest: string) => {
    if (connecte === false) {
      e.preventDefault()
      openAuthModal(dest)
    }
  }

  // Actif selon la route
  const rechercheActive = pathname.startsWith('/categories') || pathname.startsWith('/recherche')
  const accueilActive   = pathname === '/'
  const vendreActive    = pathname === '/vendre'
  const favorisActive   = pathname === '/favoris'
  const compteActive    = pathname.startsWith('/compte')

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 32px)',
        maxWidth: 358,
        background: '#FFFFFF',
        borderRadius: 28,
        boxShadow: '0 2px 20px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.04)',
        height: NAV_HEIGHT,
        paddingLeft: 8,
        paddingRight: 8,
        zIndex: 50,
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'space-around',
        overflow: 'visible', // permet au bouton Vendre de dépasser
      }}
    >

      {/* ── Accueil ── */}
      <Link href="/" aria-label="Accueil" style={itemStyle()}>
        <Home
          size={ICON_SIZE}
          color={COULEUR_NAV}
          fill={accueilActive ? COULEUR_NAV : 'none'}
        />
        <span style={labelStyle(accueilActive)}>Accueil</span>
      </Link>

      {/* ── Recherche — mène à la page catégories ── */}
      <Link href="/categories" aria-label="Recherche" style={itemStyle()}>
        <Search
          size={ICON_SIZE}
          color={COULEUR_NAV}
          fill={rechercheActive ? COULEUR_NAV : 'none'}
        />
        <span style={labelStyle(rechercheActive)}>Recherche</span>
      </Link>

      {/* ── Vendre — bouton qui dépasse de la navbar ── */}
      <Link
        href="/vendre"
        aria-label="Vendre"
        onClick={(e) => protect(e, '/vendre')}
        style={{ ...itemStyle(), position: 'relative', justifyContent: 'flex-end' }}
      >
        {/* Cercle qui dépasse */}
        <div
          style={{
            position: 'absolute',
            top: -VENDRE_OVERHANG,
            left: '50%',
            transform: 'translateX(-50%)',
            width: VENDRE_CIRCLE,
            height: VENDRE_CIRCLE,
            borderRadius: '50%',
            background: '#b85c38',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Plus size={20} color="#FFFFFF" strokeWidth={2.5} />
        </div>
        <span style={labelStyle(vendreActive, true)}>Vendre</span>
      </Link>

      {/* ── Favoris ── */}
      <Link href="/favoris" aria-label="Favoris" onClick={(e) => protect(e, '/favoris')} style={itemStyle()}>
        <Heart
          size={ICON_SIZE}
          color={COULEUR_NAV}
          fill={favorisActive ? COULEUR_NAV : 'none'}
        />
        <span style={labelStyle(favorisActive)}>Favoris</span>
      </Link>

      {/* ── Compte ── */}
      <Link href="/compte" aria-label="Compte" onClick={(e) => protect(e, '/compte')} style={itemStyle()}>
        <User
          size={ICON_SIZE}
          color={COULEUR_NAV}
          fill={compteActive ? COULEUR_NAV : 'none'}
        />
        <span style={labelStyle(compteActive)}>Compte</span>
      </Link>

    </nav>
  )
}

// Styles partagés pour aligner icônes et labels
function itemStyle(): React.CSSProperties {
  return {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
    paddingBottom: 10,
    gap: 3,
    textDecoration: 'none',
  }
}

function labelStyle(isActive: boolean, isVendre = false): React.CSSProperties {
  return {
    fontSize: isVendre ? 11 : 10,
    fontWeight: isActive ? 700 : 400,
    color: isActive && isVendre ? '#b85c38' : '#404040',
    lineHeight: 1,
  }
}
