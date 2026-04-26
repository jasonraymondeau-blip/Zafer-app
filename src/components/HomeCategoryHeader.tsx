'use client'

import { ChevronRight } from 'lucide-react'
import { CarFront, Home, Sofa } from 'lucide-react'
import { useRouter } from 'next/navigation'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ICON_MAP: Record<string, React.ComponentType<any>> = {
  vehicule:   CarFront,
  immobilier: Home,
  maison:     Sofa,
}

interface Props {
  categorie: string
  label: string
}

// En-tête de section catégorie — navigue vers la page catégorie pré-sélectionnée
export default function HomeCategoryHeader({ categorie, label }: Props) {
  const router = useRouter()
  const Icon = ICON_MAP[categorie]

  return (
    <button
      onClick={() => router.push(`/categories?categorie=${categorie}`)}
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
        {Icon && <Icon size={18} color="#404040" />}
        <span style={{ fontSize: 17, fontWeight: 700, color: '#1A1A1A' }}>
          {label}
        </span>
      </div>
      <ChevronRight size={16} color="#CCCCCC" />
    </button>
  )
}
