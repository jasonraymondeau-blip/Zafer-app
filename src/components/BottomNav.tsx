'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  HouseIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  HeartIcon,
  UserIcon,
} from '@phosphor-icons/react/dist/ssr'
import { useSearchModal } from '@/contexts/SearchModalContext'
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

  // Masquer sur les pages détail annonce et quand le modal de recherche est ouvert
  if (isOpen || pathname.startsWith('/annonce/')) return null

  // Sur /compte, masquer si non connecté (affiche le formulaire de connexion)
  if (pathname === '/compte' && connecte !== true) return null

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
        bottom: 4,
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
        <HouseIcon
          size={ICON_SIZE}
          color={COULEUR_NAV}
          weight={accueilActive ? 'fill' : 'light'}
        />
        <span style={labelStyle(accueilActive)}>Accueil</span>
      </Link>

      {/* ── Recherche — mène à la page catégories ── */}
      <Link href="/categories" aria-label="Recherche" style={itemStyle()}>
        <MagnifyingGlassIcon
          size={ICON_SIZE}
          color={COULEUR_NAV}
          weight={rechercheActive ? 'fill' : 'light'}
        />
        <span style={labelStyle(rechercheActive)}>Recherche</span>
      </Link>

      {/* ── Vendre — bouton qui dépasse de la navbar ── */}
      <Link
        href="/vendre"
        aria-label="Vendre"
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
          <PlusIcon size={20} color="#FFFFFF" weight="bold" />
        </div>
        <span style={labelStyle(vendreActive, true)}>Vendre</span>
      </Link>

      {/* ── Favoris ── */}
      <Link href="/favoris" aria-label="Favoris" style={itemStyle()}>
        <HeartIcon
          size={ICON_SIZE}
          color={COULEUR_NAV}
          weight={favorisActive ? 'fill' : 'light'}
        />
        <span style={labelStyle(favorisActive)}>Favoris</span>
      </Link>

      {/* ── Compte ── */}
      <Link href="/compte" aria-label="Compte" style={itemStyle()}>
        <UserIcon
          size={ICON_SIZE}
          color={COULEUR_NAV}
          weight={compteActive ? 'fill' : 'light'}
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
