import Link from 'next/link'
import { getListings } from '@/lib/listings'
import { formatPrix, formatDate } from '@/lib/mock-data'
import FavoriButton from '@/components/FavoriButton'
import Greeting from '@/components/Greeting'
import HomeChips from '@/components/HomeChips'
import HomePersonalized from '@/components/HomePersonalized'
import HomeCategoryHeader from '@/components/HomeCategoryHeader'
import type { Listing } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// ── Sections par catégorie sur la page d'accueil ──────────────────────────
const SECTIONS = [
  { categorie: 'vehicule'   as const, label: 'Véhicules'          },
  { categorie: 'immobilier' as const, label: 'Immobilier'          },
  { categorie: 'maison'     as const, label: 'Maison & Équipement' },
]

// ── Placeholder coloré quand l'annonce n'a pas de photo ──────────────────
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

// ── Card annonce — image 4/5, tag catégorie + cœur sur image ─────────────
function AnnonceCard({ listing }: { listing: Listing }) {
  const hasPhoto = listing.photos && listing.photos.length > 0

  return (
    <Link href={`/annonce/${listing.id}`} className="block">
      <div style={{ background: '#FFFFFF', borderRadius: 4 }}>

        {/* Image pleine largeur, ratio 4/5 */}
        <div className="relative w-full" style={{ aspectRatio: '4/5', borderRadius: 4, overflow: 'hidden', background: '#F5F5F5' }}>
          {hasPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={listing.photos[0]}
              alt={listing.titre}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <PhotoPlaceholder categorie={listing.categorie} />
          )}

          {/* Bouton cœur — bas droite */}
          <div className="absolute bottom-2 right-2">
            <FavoriButton listingId={listing.id} size="sm" />
          </div>
        </div>

        {/* Texte sous l'image */}
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

// ── Grille 2 colonnes ─────────────────────────────────────────────────────
function GrilleAnnonces({ annonces, max = 4 }: { annonces: Listing[]; max?: number }) {
  if (annonces.length === 0) return null
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 10,
        padding: '0 12px',
      }}
    >
      {annonces.slice(0, max).map((listing) => (
        <AnnonceCard key={listing.id} listing={listing} />
      ))}
    </div>
  )
}

// ── Page principale ───────────────────────────────────────────────────────
export default async function HomePage() {
  const [recentes, vehicules, immobilier, maison] = await Promise.all([
    getListings({ limit: 12 }),
    getListings({ categorie: 'vehicule',   limit: 4 }),
    getListings({ categorie: 'immobilier', limit: 4 }),
    getListings({ categorie: 'maison',     limit: 4 }),
  ])

  const parCategorie: Record<string, Listing[]> = {
    vehicule:   vehicules,
    immobilier: immobilier,
    maison:     maison,
  }

  return (
    <div className="max-w-lg mx-auto bg-white min-h-screen" style={{ paddingBottom: 96 }}>

      {/* ── Header : salutation dynamique ── */}
      <header style={{ padding: '24px 16px 0' }}>
        <Greeting />
      </header>

      {/* ── Chips catégories — scroll horizontal ── */}
      <HomeChips />

      {/* ── Section personnalisée (si connecté + dernière recherche) ── */}
      <HomePersonalized />

      {/* ── Sections annonces ── */}
      <div className="space-y-6 pt-6">

        {/* Section annonces récentes */}
        {recentes.length > 0 && (
          <section>
            <div style={{ padding: '0 16px 12px' }}>
              <span style={{ fontSize: 17, fontWeight: 700, color: '#1A1A1A' }}>Annonces récentes</span>
            </div>
            <GrilleAnnonces annonces={recentes} max={12} />
          </section>
        )}

        {/* Sections par catégorie */}
        {SECTIONS.map(({ categorie, label }) => {
          const annonces = parCategorie[categorie]
          if (annonces.length === 0) return null
          return (
            <section key={categorie}>
              {/* Titre section — ouvre le modal avec la catégorie pré-sélectionnée */}
              <HomeCategoryHeader categorie={categorie} label={label} />

              {/* Grille 2 cols, max 2 rangées */}
              <GrilleAnnonces annonces={annonces} />
            </section>
          )
        })}

        {/* Message si aucune annonce */}
        {vehicules.length === 0 && immobilier.length === 0 && maison.length === 0 && (
          <div style={{ textAlign: 'center', paddingTop: 64 }}>
            <p style={{ fontSize: 40, marginBottom: 12 }}>📭</p>
            <p style={{ color: '#1A1A1A', fontWeight: 600 }}>Aucune annonce pour le moment</p>
            <p style={{ color: '#888888', fontSize: 14, marginTop: 4 }}>
              Soyez le premier à publier !
            </p>
          </div>
        )}
      </div>

    </div>
  )
}
