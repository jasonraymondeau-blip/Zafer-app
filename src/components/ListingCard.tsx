'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShieldCheck } from 'lucide-react'
import { Listing } from '@/lib/supabase'
import { formatPrix, formatDate } from '@/lib/mock-data'
import { toThumbUrl } from '@/lib/r2-upload'
import FavoriButton from './FavoriButton'
import MiniConfianceVendeur from './MiniConfianceVendeur'

interface ListingCardProps {
  listing: Listing
  className?: string
  compact?: boolean  // mode 2-colonnes : ratio portrait 4/5, texte compact
}

// Placeholder coloré selon la catégorie — cohérent avec la page d'accueil
function CategoryPlaceholder({ categorie }: { categorie: string }) {
  const map: Record<string, { bg: string; emoji: string }> = {
    vehicule:   { bg: '#EBF3FF', emoji: '🚗' },
    immobilier: { bg: '#E8F5E9', emoji: '🏠' },
    maison:     { bg: '#FFF3E0', emoji: '🛋️' },
  }
  const { bg, emoji } = map[categorie] ?? { bg: '#F5F5F5', emoji: '📦' }
  return (
    <div style={{ background: bg, position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span className="text-3xl">{emoji}</span>
    </div>
  )
}

// Ligne de détails spécifiques à la catégorie
// compact=true : labels abrégés, une seule ligne tronquée
function DetailsCategorie({ listing, compact = false }: { listing: Listing; compact?: boolean }) {
  if (listing.categorie === 'vehicule') {
    const parts: string[] = []
    if (listing.kilometrage != null) parts.push(`${listing.kilometrage.toLocaleString()} km`)
    if (listing.boite_vitesse) {
      parts.push(compact
        ? (listing.boite_vitesse === 'automatique' ? 'Auto' : 'Manu')
        : (listing.boite_vitesse.charAt(0).toUpperCase() + listing.boite_vitesse.slice(1)))
    }
    if (listing.carburant) parts.push(listing.carburant.charAt(0).toUpperCase() + listing.carburant.slice(1))
    if (parts.length === 0) return null
    return (
      <p className="truncate" style={{ fontSize: 11, color: '#404040', marginTop: 2 }}>
        {parts.join(' · ')}
      </p>
    )
  }
  if (listing.categorie === 'immobilier') {
    const parts: string[] = []
    if (listing.surface != null) parts.push(`${listing.surface} m²`)
    if (listing.type_bien) parts.push(listing.type_bien.charAt(0).toUpperCase() + listing.type_bien.slice(1))
    if (parts.length === 0) return null
    return (
      <p className="truncate" style={{ fontSize: 11, color: '#404040', marginTop: 2 }}>
        {parts.join(' · ')}
      </p>
    )
  }
  if (listing.categorie === 'maison' && listing.etat) {
    return (
      <p style={{ fontSize: 11, color: '#404040', marginTop: 2 }}>
        {listing.etat.charAt(0).toUpperCase() + listing.etat.slice(1)}
      </p>
    )
  }
  return null
}

// Supporte deux modes :
// - défaut (1 colonne) : ratio 16/9, texte normal
// - compact (2 colonnes) : ratio 4/5 portrait, texte plus petit
export default function ListingCard({ listing, className = '', compact = false }: ListingCardProps) {
  const hasPhoto = listing.photos && listing.photos.length > 0
  const [superVendeur, setSuperVendeur] = useState(false)
  const router = useRouter()

  return (
    <Link href={`/annonce/${listing.id}`} className={`block ${className}`}>
      <div>
        <div
          className="relative w-full"
          style={{ borderRadius: 4, overflow: 'hidden', background: '#F5F5F5', aspectRatio: compact ? '4/5' : '16/9' }}
        >
          {hasPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={toThumbUrl(listing.photos[0])}
              alt={listing.titre}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <CategoryPlaceholder categorie={listing.categorie} />
          )}

          {/* Badge SuperVendeur — haut gauche */}
          {superVendeur && (
            <div className="absolute top-2 left-2">
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
                background: 'rgba(255,255,255,0.93)',
                borderRadius: 20,
                padding: '3px 7px 3px 5px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
              }}>
                <ShieldCheck size={11} color="#d58F62" strokeWidth={2.5} />
                <span style={{ fontSize: 10, fontWeight: 700, color: '#d58F62', letterSpacing: 0.2 }}>
                  SuperVendeur
                </span>
              </div>
            </div>
          )}

          {/* Bouton cœur — bas droite */}
          <div className="absolute bottom-2 right-2">
            <FavoriButton listingId={listing.id} size="sm" />
          </div>
        </div>

        {/* Texte sous l'image */}
        <div style={{ padding: compact ? '8px 4px 6px' : '9px 2px 6px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
            {/* Titre + prix à gauche */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p className="truncate" style={{ fontSize: compact ? 11 : 12, fontWeight: 600, color: '#1A1A1A', lineHeight: 1.3 }}>
                {listing.titre}
              </p>
              <p className="truncate" style={{ fontSize: compact ? 12 : 13, fontWeight: 700, color: '#1A1A1A', marginTop: 1 }}>
                {formatPrix(listing.prix)}
              </p>
            </div>
            {/* Badge indice de confiance — cliquable vers profil vendeur */}
            <div
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push(`/vendeur/${listing.user_id}`) }}
              style={{ cursor: 'pointer', flexShrink: 0 }}
            >
              <MiniConfianceVendeur userId={listing.user_id} onScore={(s) => setSuperVendeur(s === 100)} />
            </div>
          </div>
          {/* Détails spécifiques à la catégorie — toujours affichés */}
          <DetailsCategorie listing={listing} compact={compact} />
          <p style={{ fontSize: 11, color: '#888888', marginTop: 2 }}>
            {listing.ville || 'Maurice'} · {formatDate(listing.created_at)}
          </p>
        </div>
      </div>
    </Link>
  )
}
