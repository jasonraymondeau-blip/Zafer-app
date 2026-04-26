'use client'

import { useState, useEffect } from 'react'
import { Flame } from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'
import ListingCard from '@/components/ListingCard'
import type { Listing } from '@/lib/supabase'

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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .eq('categorie', lastCat as any)
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
          <ListingCard key={listing.id} listing={listing} compact />
        ))}
      </div>
    </section>
  )
}
