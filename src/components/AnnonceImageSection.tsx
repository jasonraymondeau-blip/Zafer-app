'use client'

import { useEffect, useRef, useState } from 'react'
import AnnonceHero from './AnnonceHero'
import BoutonRetour from './BoutonRetour'
import BoutonPartage from './BoutonPartage'
import FavoriButton from './FavoriButton'

interface AnnonceImageSectionProps {
  photos: string[]
  titre: string
  categorie: string
  initialActif: boolean
  listingId: string
  prix: string
}

export default function AnnonceImageSection({
  photos,
  titre,
  categorie,
  initialActif,
  listingId,
  prix,
}: AnnonceImageSectionProps) {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [showBar, setShowBar] = useState(false)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      ([entry]) => setShowBar(!entry.isIntersecting),
      // Déclenche 20px avant que le sentinel ne quitte le haut du viewport
      { threshold: 0, rootMargin: '-20px 0px 0px 0px' }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      {/* Bandeau fixe blanc — apparaît quand l'image est couverte par le panneau contenu */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: '#FFFFFF',
          borderBottom: '1px solid #F0F0F0',
          transform: showBar ? 'translateY(0)' : 'translateY(-100%)',
          transition: 'transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          paddingTop: 'env(safe-area-inset-top, 0px)',
        }}
      >
        <div
          style={{
            maxWidth: 448,
            margin: '0 auto',
            padding: '10px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <BoutonRetour />
          <div style={{ display: 'flex', gap: 8 }}>
            <BoutonPartage titre={titre} prix={prix} ghost />
            <FavoriButton listingId={listingId} size="md" ghost />
          </div>
        </div>
      </div>

      {/* Image sticky */}
      <div style={{ position: 'sticky', top: 0, zIndex: 0 }}>
        <AnnonceHero
          photos={photos}
          titre={titre}
          categorie={categorie}
          initialActif={initialActif}
        />
        {/* Boutons flottants sur l'image */}
        <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
          <BoutonRetour />
          <div className="flex gap-2">
            <BoutonPartage titre={titre} prix={prix} />
            <FavoriButton listingId={listingId} size="md" />
          </div>
        </div>
      </div>

      {/* Sentinel — en flux normal, déclenche le bandeau quand il quitte le haut du viewport */}
      <div ref={sentinelRef} style={{ height: 1 }} />
    </>
  )
}
