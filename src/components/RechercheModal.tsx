'use client'

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { X, Search } from 'lucide-react'
import Link from 'next/link'
import { useRechercheModal } from '@/contexts/RechercheModalContext'
import { createClient } from '@/lib/supabase-browser'
import { formatPrix, formatDate } from '@/lib/mock-data'
import FavoriButton from './FavoriButton'
import { toThumbUrl } from '@/lib/r2-upload'
import type { Listing } from '@/lib/supabase'

// Mini carte annonce pour la grille du modal
function MiniCard({ listing, onClose }: { listing: Listing; onClose: () => void }) {
  const hasPhoto = listing.photos && listing.photos.length > 0
  const emoji = listing.categorie === 'vehicule' ? '🚗' : listing.categorie === 'immobilier' ? '🏠' : '🛋️'
  const bg = listing.categorie === 'vehicule' ? '#EBF3FF' : listing.categorie === 'immobilier' ? '#E8F5E9' : '#FFF3E0'

  return (
    <Link href={`/annonce/${listing.id}`} onClick={onClose} className="block">
      <div>
        {/* Image */}
        <div className="relative w-full" style={{ borderRadius: 8, overflow: 'hidden', background: '#F5F5F5', aspectRatio: '4/5' }}>
          {hasPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={toThumbUrl(listing.photos[0])}
              alt={listing.titre}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ background: bg, position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="text-3xl">{emoji}</span>
            </div>
          )}
          <div className="absolute bottom-2 right-2">
            <FavoriButton listingId={listing.id} size="sm" />
          </div>
        </div>

        {/* Texte */}
        <div style={{ padding: '8px 2px 4px' }}>
          <p className="truncate" style={{ fontSize: 13, fontWeight: 500, color: '#1A1A1A' }}>{listing.titre}</p>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#404040', marginTop: 2 }}>{formatPrix(listing.prix)}</p>
          <p style={{ fontSize: 11, color: '#888888', marginTop: 2 }}>{listing.ville || 'Maurice'} · {formatDate(listing.created_at)}</p>
        </div>
      </div>
    </Link>
  )
}

export default function RechercheModal() {
  const { isOpen, close } = useRechercheModal()
  const [mounted, setMounted] = useState(false)
  const [q, setQ] = useState('')
  const [annonces, setAnnonces] = useState<Listing[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const fetchAnnonces = useCallback(async (recherche: string) => {
    setLoading(true)
    const supabase = createClient()
    let query = supabase
      .from('listings')
      .select('*')
      .eq('actif', true)
      .order('created_at', { ascending: false })
      .limit(40)

    if (recherche.trim()) query = query.ilike('titre', `%${recherche.trim()}%`)

    const { data } = await query
    setAnnonces(data ?? [])
    setLoading(false)
  }, [])

  // Charge les annonces à l'ouverture
  useEffect(() => {
    if (isOpen) {
      setQ('')
      fetchAnnonces('')
    }
  }, [isOpen, fetchAnnonces])

  // Debounce la recherche textuelle
  useEffect(() => {
    if (!isOpen) return
    const timer = setTimeout(() => fetchAnnonces(q), 400)
    return () => clearTimeout(timer)
  }, [q, isOpen, fetchAnnonces])

  if (!mounted || !isOpen) return null

  return createPortal(
    <>
      {/* Fond sombre */}
      <div className="fixed inset-0 bg-black/50 z-[60]" onClick={close} />

      {/* Bottom sheet 80vh */}
      <div className="fixed bottom-0 left-0 right-0 z-[61] flex justify-center pointer-events-none">
        <div
          className="w-full max-w-lg bg-white rounded-t-[20px] shadow-xl pointer-events-auto flex flex-col"
          style={{ height: '80vh' }}
        >
          {/* Poignée */}
          <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
            <div className="w-10 h-1 bg-gray-200 rounded-full" />
          </div>

          {/* Header + input */}
          <div className="px-4 pt-2 pb-3 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 flex-1 bg-[#F5F5F5] rounded-[12px] px-3 py-2.5">
                <Search className="w-4 h-4 flex-shrink-0" style={{ color: '#888888' }} />
                <input
                  autoFocus
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  placeholder="Recherche sur Zafer"
                  className="flex-1 bg-transparent text-sm outline-none"
                  style={{ color: '#1A1A1A' }}
                />
                {q && (
                  <button onClick={() => setQ('')}>
                    <X className="w-4 h-4" style={{ color: '#888888' }} />
                  </button>
                )}
              </div>
              <button
                onClick={close}
                className="flex-shrink-0"
                style={{ color: '#888888', fontSize: 14, fontWeight: 500 }}
              >
                Annuler
              </button>
            </div>
          </div>

          {/* Résultats */}
          <div className="overflow-y-auto flex-1 px-3 pb-8">
            {loading ? (
              <div className="flex justify-center pt-12">
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  border: '3px solid rgba(73,105,119,0.2)',
                  borderTopColor: '#496977',
                  animation: 'zafer-spin 0.8s linear infinite',
                }} />
              </div>
            ) : annonces.length === 0 ? (
              <div style={{ textAlign: 'center', paddingTop: 48 }}>
                <p style={{ fontSize: 36, marginBottom: 12 }}>🔍</p>
                <p style={{ color: '#1A1A1A', fontWeight: 600, fontSize: 15 }}>Aucun résultat</p>
                <p style={{ color: '#888888', fontSize: 13, marginTop: 4 }}>Essayez un autre mot-clé</p>
              </div>
            ) : (
              <>
                <p style={{ fontSize: 12, color: '#888888', marginBottom: 12 }}>
                  {annonces.length} annonce{annonces.length !== 1 ? 's' : ''}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {annonces.map(listing => (
                    <MiniCard key={listing.id} listing={listing} onClose={close} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>,
    document.body
  )
}
