'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { X, ChevronDown, ChevronRight } from 'lucide-react'
import { CarIcon, HouseIcon, ArmchairIcon } from '@phosphor-icons/react/dist/ssr'
import { useSearchModal } from '@/contexts/SearchModalContext'

// Catégories centralisées — source unique de vérité pour le modal
const CATEGORIES = [
  {
    id: 'vehicule',
    label: 'Véhicule',
    Icon: CarIcon,
    sousCats: ['Voiture', 'Scooter', 'Moto', 'Bateau'],
  },
  {
    id: 'immobilier',
    label: 'Immobilier',
    Icon: HouseIcon,
    sousCats: ['Location', 'Vente', 'Location Saisonnière'],
  },
  {
    id: 'maison',
    label: 'Maison & Équipement',
    Icon: ArmchairIcon,
    sousCats: ['Ameublement', 'Électroménager'],
  },
]

export default function GlobalSearchModal() {
  const { isOpen, initialCategorie, close } = useSearchModal()
  const router = useRouter()
  const [openCats, setOpenCats] = useState<Set<string>>(new Set())
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  // Ouvre la catégorie active à chaque ouverture du modal (sans fermer les autres)
  useEffect(() => {
    if (isOpen && initialCategorie) {
      setOpenCats(new Set([initialCategorie]))
    }
    if (isOpen && !initialCategorie) {
      setOpenCats(new Set())
    }
  }, [isOpen, initialCategorie])

  function naviguer(url: string) {
    close()
    router.push(url)
  }

  if (!mounted || !isOpen) return null

  return createPortal(
    <>
      {/* Fond sombre */}
      <div className="fixed inset-0 bg-black/50 z-[60]" onClick={close} />

      {/* Bottom sheet — 80vh */}
      <div className="fixed bottom-0 left-0 right-0 z-[61] flex justify-center pointer-events-none">
        <div
          className="w-full max-w-lg bg-white rounded-t-[20px] shadow-xl pointer-events-auto flex flex-col"
          style={{ height: '80vh' }}
        >
          {/* Poignée */}
          <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
            <div className="w-10 h-1 bg-gray-200 rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
            <h2 className="font-bold text-base" style={{ color: '#1A1A1A' }}>
              Choisir une catégorie
            </h2>
            <button onClick={close}>
              <X className="w-5 h-5" style={{ color: '#888888' }} />
            </button>
          </div>

          {/* Liste des catégories — scrollable */}
          <div className="overflow-y-auto flex-1 px-4 py-2 pb-10">
            {CATEGORIES.map(({ id, label, Icon, sousCats }) => {
              const isExpanded = openCats.has(id)
              return (
                <div key={id}>

                  {/* Ligne catégorie parente */}
                  <button
                    onClick={() => setOpenCats(prev => {
                      const next = new Set(prev)
                      if (next.has(id)) next.delete(id)
                      else next.add(id)
                      return next
                    })}
                    className="w-full flex items-center gap-3 py-3"
                  >
                    {/* Icône neutre grise */}
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: '#F4F4F4' }}
                    >
                      <Icon size={18} color="#4E4E4E" weight="regular" />
                    </div>
                    <span
                      className="flex-1 text-left text-sm"
                      style={{ color: '#1A1A1A', fontWeight: isExpanded ? 700 : 500 }}
                    >
                      {label}
                    </span>
                    {isExpanded
                      ? <ChevronDown size={16} color="#404040" />
                      : <ChevronRight size={16} color="#BBBBBB" />
                    }
                  </button>

                  {/* Sous-catégories — visibles si expandé */}
                  {isExpanded && (
                    <div className="pl-12 border-l border-gray-100 ml-[18px] mb-2">
                      {sousCats.map((sc) => (
                        <button
                          key={sc}
                          onClick={() =>
                            naviguer(`/recherche?categorie=${id}&sous_categorie=${encodeURIComponent(sc)}`)
                          }
                          className="w-full text-left py-2.5 px-2 text-sm rounded-[8px] hover:bg-gray-50"
                          style={{ color: '#888888', fontWeight: 400 }}
                        >
                          {sc}
                        </button>
                      ))}
                    </div>
                  )}

                </div>
              )
            })}
          </div>
        </div>
      </div>
    </>,
    document.body
  )
}
