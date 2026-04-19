'use client'

import { GridFourIcon, HouseIcon, CarIcon, ArmchairIcon } from '@phosphor-icons/react/dist/ssr'
import { useSearchModal } from '@/contexts/SearchModalContext'

const CHIPS = [
  { label: 'Voir tout',   categorie: '',           Icon: GridFourIcon, bg: '#E8F0F3', iconColor: '#404040' },
  { label: 'Immobilier',  categorie: 'immobilier', Icon: HouseIcon,    bg: '#E8F3EE', iconColor: '#2D7A57' },
  { label: 'Véhicule',    categorie: 'vehicule',   Icon: CarIcon,      bg: '#FFF0E8', iconColor: '#C05C1A' },
  { label: 'Maison',      categorie: 'maison',     Icon: ArmchairIcon, bg: '#F0EEFF', iconColor: '#5B3FD4' },
]

// Chips de catégories — "Voir tout" navigue directement, les autres ouvrent le modal
export default function HomeChips() {
  const { open } = useSearchModal()

  return (
    <div
      className="flex gap-2 overflow-x-auto px-4 pb-1"
      style={{ scrollbarWidth: 'none', marginTop: 20 }}
    >
      {CHIPS.map(({ label, categorie, Icon, bg, iconColor }) => {
        const chipStyle = {
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
        }

        const iconCircle = (
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: '50%',
              background: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon size={14} color={iconColor} weight="fill" />
          </div>
        )

        const labelEl = (
          <span style={{ fontSize: 12, fontWeight: 600, color: '#1A1A1A' }}>{label}</span>
        )

        // "Voir tout" — ouvre le modal sans catégorie pré-sélectionnée
        if (!categorie) {
          return (
            <button key={label} onClick={() => open('')} style={chipStyle}>
              {iconCircle}
              {labelEl}
            </button>
          )
        }

        // Chips de catégorie — ouvrent le modal avec la catégorie pré-sélectionnée
        return (
          <button key={label} onClick={() => open(categorie)} style={chipStyle}>
            {iconCircle}
            {labelEl}
          </button>
        )
      })}
    </div>
  )
}
