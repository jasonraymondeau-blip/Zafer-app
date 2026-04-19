'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import ListingCard from './ListingCard'
import type { Listing } from '@/lib/supabase'

const LIMIT = 20

interface Filters {
  categorie?: string
  sous_categorie?: string
  q?: string
  prix_min?: string
  prix_max?: string
  km_min?: string
  km_max?: string
  boite_vitesse?: string
  carburant?: string
  annee_min?: string
  annee_max?: string
  location_type?: string
  vehicule_type?: string
  type_bien?: string
  surface_min?: string
  surface_max?: string
  etat?: string
  piece?: string
  type_electromenager?: string
  meuble?: string
  nb_chambres?: string
  ville?: string
  type_transaction?: string
  lat?: string
  lng?: string
}

interface Props {
  initial: Listing[]
  filters: Filters
}

export default function ResultatsInfinisGrid({ initial, filters }: Props) {
  const [annonces, setAnnonces] = useState<Listing[]>(initial)
  const [loading, setLoading] = useState(false)
  const [fini, setFini] = useState(initial.length < LIMIT)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const offsetRef = useRef(initial.length)
  const loadingRef = useRef(false)
  const finiRef = useRef(initial.length < LIMIT)

  const chargerPlus = useCallback(async () => {
    if (loadingRef.current || finiRef.current) return
    loadingRef.current = true
    setLoading(true)

    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, val]) => {
        if (val) params.set(key, val)
      })
      params.set('offset', String(offsetRef.current))
      params.set('limit', String(LIMIT))

      const res = await fetch(`/api/listings?${params}`)
      const nouvelles: Listing[] = await res.json()

      offsetRef.current += nouvelles.length
      setAnnonces((prev) => [...prev, ...nouvelles])

      if (nouvelles.length < LIMIT) {
        finiRef.current = true
        setFini(true)
      }
    } catch (err) {
      console.error('Erreur chargement annonces:', err)
    } finally {
      loadingRef.current = false
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || fini) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) chargerPlus()
      },
      { rootMargin: '300px' }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [chargerPlus, fini])

  if (annonces.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-3">🔍</p>
        <p className="text-text-main font-semibold">Aucune annonce trouvée</p>
        <p className="text-text-muted text-sm mt-1">
          Essayez d&apos;autres termes ou modifiez les filtres
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Grille 2 colonnes */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10,
        }}
      >
        {annonces.map((listing) => (
          <ListingCard key={listing.id} listing={listing} compact />
        ))}
      </div>

      {/* Sentinel pour l'infinite scroll */}
      {!fini && <div ref={sentinelRef} style={{ height: 1 }} />}

      {/* Spinner chargement */}
      {loading && (
        <div className="flex justify-center py-6">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}
