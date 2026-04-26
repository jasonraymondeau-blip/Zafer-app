'use client'

import Link from 'next/link'
import { Grid2X2, Home, CarFront, Sofa } from 'lucide-react'

const CATEGORIES = [
  { label: 'Immobilier', categorie: 'immobilier', Icon: Home,     bg: '#E8F3EE', iconColor: '#2D7A57' },
  { label: 'Véhicule',   categorie: 'vehicule',   Icon: CarFront, bg: '#FFF0E8', iconColor: '#C05C1A' },
  { label: 'Maison',     categorie: 'maison',     Icon: Sofa, bg: '#F0EEFF', iconColor: '#5B3FD4' },
]

const chipStyle = (bg: string) => ({
  background: bg,
  borderRadius: 30,
  padding: '7px 11px 7px 8px',
  textDecoration: 'none',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  flexShrink: 0,
  whiteSpace: 'nowrap' as const,
  cursor: 'pointer',
  border: 'none',
})

// Chips de catégories — "Voir tout" → /recherche, catégories → /categories
export default function HomeChips() {
  return (
    <div
      className="flex gap-2 overflow-x-auto px-4 pb-1"
      style={{ scrollbarWidth: 'none', marginTop: 20 }}
    >
      {/* Voir tout — navigue vers la page catégories (même que navbar Recherche) */}
      <Link href="/categories" style={chipStyle('#E8F0F3')}>
        <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Grid2X2 size={14} color="#404040" />
        </div>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#1A1A1A' }}>Voir tout</span>
      </Link>

      {/* Catégories → page /categories */}
      {CATEGORIES.map(({ label, categorie, Icon, bg, iconColor }) => (
        <Link
          key={categorie}
          href={`/categories?categorie=${categorie}`}
          style={chipStyle(bg)}
        >
          <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon size={14} color={iconColor} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#1A1A1A' }}>{label}</span>
        </Link>
      ))}
    </div>
  )
}
