'use client'

import Link from 'next/link'
import { GridFourIcon, HouseIcon, CarIcon, ArmchairIcon } from '@phosphor-icons/react/dist/ssr'

const CATEGORIES = [
  { label: 'Immobilier', categorie: 'immobilier', Icon: HouseIcon,    bg: '#E8F3EE', iconColor: '#2D7A57' },
  { label: 'Véhicule',   categorie: 'vehicule',   Icon: CarIcon,      bg: '#FFF0E8', iconColor: '#C05C1A' },
  { label: 'Maison',     categorie: 'maison',     Icon: ArmchairIcon, bg: '#F0EEFF', iconColor: '#5B3FD4' },
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
      {/* Voir tout — navigue vers la page recherche (modale) */}
      <Link href="/recherche" style={chipStyle('#E8F0F3')}>
        <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <GridFourIcon size={14} color="#404040" weight="fill" />
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
            <Icon size={14} color={iconColor} weight="fill" />
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#1A1A1A' }}>{label}</span>
        </Link>
      ))}
    </div>
  )
}
