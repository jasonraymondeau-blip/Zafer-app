'use client'

import { X } from 'lucide-react'
import { useSearchModal } from '@/contexts/SearchModalContext'

const CATEGORIES = [
  { value: 'vehicule',   label: 'Véhicule'   },
  { value: 'immobilier', label: 'Immobilier'  },
  { value: 'maison',     label: 'Maison'      },
]

interface CategoryModalProps {
  categorie: string
  sousCategorie: string
  q: string
}

// Badge de catégorie active — ouvre le modal global avec la catégorie pré-ouverte
export default function CategoryModal({ categorie, sousCategorie }: CategoryModalProps) {
  const { open } = useSearchModal()

  const cat = CATEGORIES.find((c) => c.value === categorie)
  const badgeLabel = sousCategorie || cat?.label || categorie

  return (
    <button
      onClick={() => open(categorie)}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium flex-shrink-0"
      style={{ background: '#404040', color: '#fff' }}
    >
      <X className="w-3.5 h-3.5 flex-shrink-0" />
      {badgeLabel}
    </button>
  )
}
