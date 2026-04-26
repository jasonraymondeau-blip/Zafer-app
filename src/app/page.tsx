import { getListings } from '@/lib/listings'
import Greeting from '@/components/Greeting'
import HomeChips from '@/components/HomeChips'
import HomePersonalized from '@/components/HomePersonalized'
import HomeCategoryHeader from '@/components/HomeCategoryHeader'
import ListingCard from '@/components/ListingCard'
import type { Listing } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// ── Sections par catégorie sur la page d'accueil ──────────────────────────
const SECTIONS = [
  { categorie: 'vehicule'   as const, label: 'Véhicules'          },
  { categorie: 'immobilier' as const, label: 'Immobilier'          },
  { categorie: 'maison'     as const, label: 'Maison & Équipement' },
]

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
        <ListingCard key={listing.id} listing={listing} compact />
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
      <header style={{ padding: 'calc(env(safe-area-inset-top, 0px) + 24px) 16px 0' }}>
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
