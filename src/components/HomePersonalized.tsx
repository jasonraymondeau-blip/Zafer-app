'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Flame } from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'
import { formatPrix, formatDate } from '@/lib/mock-data'
import FavoriButton from '@/components/FavoriButton'
import type { Listing } from '@/lib/supabase'

function PhotoPlaceholder({ categorie }: { categorie: string }) {
  const map: Record<string, { bg: string; emoji: string }> = {
    vehicule:   { bg: '#EBF3FF', emoji: '🚗' },
    immobilier: { bg: '#E8F5E9', emoji: '🏠' },
    maison:     { bg: '#FFF3E0', emoji: '🛋️' },
  }
  const { bg, emoji } = map[categorie] ?? { bg: '#F5F5F5', emoji: '📦' }
  return (
    <div style={{ background: bg }} className="w-full h-full flex items-center justify-center">
      <span className="text-4xl">{emoji}</span>
    </div>
  )
}

function AnnonceCard({ listing }: { listing: Listing }) {
  const hasPhoto = listing.photos && listing.photos.length > 0
  return (
    <Link href={`/annonce/${listing.id}`} className="block">
      <div style={{ background: '#FFFFFF', borderRadius: 4 }}>
        <div className="relative w-full" style={{ aspectRatio: '4/5', borderRadius: 4, overflow: 'hidden' }}>
          {hasPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={listing.photos[0]} alt={listing.titre} className="w-full h-full object-cover" />
          ) : (
            <PhotoPlaceholder categorie={listing.categorie} />
          )}
          <div className="absolute bottom-2 right-2">
            <FavoriButton listingId={listing.id} size="sm" />
          </div>
        </div>
        <div style={{ padding: '9px 10px 11px' }}>
          <p className="truncate" style={{ fontSize: 13, fontWeight: 500, color: '#1A1A1A' }}>
            {listing.titre}
          </p>
          <p style={{ fontSize: 15, fontWeight: 500, color: '#404040', marginTop: 2 }}>
            {formatPrix(listing.prix)}
          </p>
          <p style={{ fontSize: 11, color: '#888888', marginTop: 2 }}>
            {listing.ville || 'Maurice'} · {formatDate(listing.created_at)}
          </p>
        </div>
      </div>
    </Link>
  )
}

// Affiche 4 annonces de la dernière catégorie recherchée — uniquement si connecté
export default function HomePersonalized() {
  const [annonces, setAnnonces] = useState<Listing[]>([])

  useEffect(() => {
    const lastCat = localStorage.getItem('zafer_last_categorie')
    if (!lastCat) return

    const supabase = createClient()
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session?.user) return

      const { data: listings } = await supabase
        .from('listings')
        .select('*')
        .eq('actif', true)
        .eq('categorie', lastCat)
        .order('created_at', { ascending: false })
        .limit(4)

      if (listings && listings.length > 0) {
        setAnnonces(listings as Listing[])
      }
    })
  }, [])

  if (annonces.length === 0) return null

  return (
    <section style={{ paddingTop: 24, paddingBottom: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '0 16px 12px' }}>
        <Flame size={18} color="#E05C2A" fill="#E05C2A" />
        <span style={{ fontSize: 17, fontWeight: 700, color: '#1A1A1A' }}>
          Fait pour vous
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '0 12px' }}>
        {annonces.map((listing) => (
          <AnnonceCard key={listing.id} listing={listing} />
        ))}
      </div>
    </section>
  )
}
