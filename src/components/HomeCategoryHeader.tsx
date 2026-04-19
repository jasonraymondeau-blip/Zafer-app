'use client'

import { ChevronRight } from 'lucide-react'
import { CarIcon, HouseIcon, ArmchairIcon } from '@phosphor-icons/react/dist/ssr'
import { useSearchModal } from '@/contexts/SearchModalContext'

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; color?: string; weight?: string }>> = {
  vehicule:   CarIcon,
  immobilier: HouseIcon,
  maison:     ArmchairIcon,
}

interface Props {
  categorie: string
  label: string
}

// En-tête de section catégorie — ouvre le modal avec la catégorie pré-sélectionnée
export default function HomeCategoryHeader({ categorie, label }: Props) {
  const { open } = useSearchModal()
  const Icon = ICON_MAP[categorie]

  return (
    <button
      onClick={() => open(categorie)}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px 12px',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {Icon && <Icon size={18} color="#404040" weight="fill" />}
        <span style={{ fontSize: 17, fontWeight: 700, color: '#1A1A1A' }}>
          {label}
        </span>
      </div>
      <ChevronRight size={16} color="#CCCCCC" />
    </button>
  )
}
