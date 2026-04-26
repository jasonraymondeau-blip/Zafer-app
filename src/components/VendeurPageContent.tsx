'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, CheckCircle2, Circle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Profile, Listing } from '@/lib/supabase'
import { formatPrix, formatDate } from '@/lib/mock-data'
import { toThumbUrl } from '@/lib/r2-upload'
import { createClient } from '@/lib/supabase-browser'
import AvatarConfianceVendeur from './AvatarConfianceVendeur'

interface Avis {
  id: string
  acheteur_id: string
  note: number
  commentaire: string | null
  created_at: string
  prenom?: string
}

function Etoiles({ note, taille = 14 }: { note: number; taille?: number }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width={taille} height={taille} viewBox="0 0 14 14" fill="none">
          <path
            d="M7 1l1.545 3.13L12 4.635l-2.5 2.435.59 3.43L7 8.885l-3.09 1.615L4.5 7.07 2 4.635l3.455-.505L7 1z"
            fill={i <= note ? '#FBB13C' : '#E8E8E8'}
          />
        </svg>
      ))}
    </div>
  )
}

export default function VendeurPageContent({
  profil,
  avis,
  listings,
}: {
  profil: Profile
  avis: Avis[]
  listings: Listing[]
}) {
  const router = useRouter()
  const [onglet, setOnglet] = useState<'annonces' | 'avis'>('annonces')
  const [avisDonnes, setAvisDonnes] = useState(0)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('avis').select('id', { count: 'exact', head: true })
      .eq('acheteur_id', profil.id)
      .then(({ count }) => setAvisDonnes(count ?? 0))
  }, [profil.id])

  const criteres = [
    { label: 'Compte créé',           valide: true,                              pts: 20 },
    { label: 'Nom et prénom',          valide: !!(profil.prenom && profil.nom),   pts: 20 },
    { label: 'Numéro de téléphone',    valide: !!profil.telephone,                pts: 20 },
    { label: 'Annonce publiée',        valide: listings.length > 0,               pts: 20 },
    { label: 'Avis laissé (acheteur)', valide: avisDonnes > 0,                    pts: 20 },
  ]

  const moyenne = avis.length > 0
    ? Math.round((avis.reduce((s, a) => s + a.note, 0) / avis.length) * 10) / 10
    : null

  const anneeMembre = profil.created_at ? new Date(profil.created_at).getFullYear() : null
  const nomComplet = [profil.prenom, profil.nom].filter(Boolean).join(' ')

  return (
    <div className="max-w-lg mx-auto bg-white min-h-screen">

      {/* Header sticky */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 16px',
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)',
          borderBottom: '1px solid #F0F0F0',
          position: 'sticky',
          top: 0,
          background: '#FFFFFF',
          zIndex: 10,
        }}
      >
        <button
          onClick={() => router.back()}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 4px 4px 0', display: 'flex', alignItems: 'center' }}
        >
          <ArrowLeft className="w-5 h-5" style={{ color: '#1A1A1A' }} />
        </button>
        <span style={{ fontSize: 16, fontWeight: 600, color: '#1A1A1A' }}>Profil vendeur</span>
      </div>

      {/* Carte profil */}
      <div style={{ padding: '28px 20px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>

        {/* Avatar avec anneau indice de confiance */}
        <AvatarConfianceVendeur profil={profil} />

        {/* Nom */}
        <p style={{ fontSize: 22, fontWeight: 700, color: '#1A1A1A', margin: 0, textAlign: 'center' }}>
          {nomComplet || 'Vendeur'}
        </p>

        {/* Étoiles + note */}
        {moyenne !== null ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Etoiles note={Math.round(moyenne)} taille={16} />
            <span style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A' }}>{moyenne}</span>
            <span style={{ fontSize: 13, color: '#AAAAAA' }}>({avis.length} avis)</span>
          </div>
        ) : (
          <p style={{ fontSize: 13, color: '#BBBBBB', margin: 0 }}>Aucun avis</p>
        )}

        {/* Membre depuis */}
        {anneeMembre && (
          <p style={{ fontSize: 13, color: '#888888', margin: 0 }}>
            Membre depuis {anneeMembre}
          </p>
        )}
      </div>

      {/* Détail du score de confiance */}
      <div style={{ margin: '0 16px 20px', background: '#FAFAFA', borderRadius: 12, border: '1px solid #F0F0F0', padding: '14px 16px' }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A', marginBottom: 10 }}>
          Indice de confiance
        </p>
        {criteres.map((c) => (
          <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            {c.valide
              ? <CheckCircle2 size={16} color="#22C55E" strokeWidth={2} />
              : <Circle size={16} color="#D1D5DB" strokeWidth={2} />
            }
            <span style={{ flex: 1, fontSize: 13, color: c.valide ? '#1A1A1A' : '#AAAAAA' }}>
              {c.label}
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color: c.valide ? '#d58F62' : '#DDDDDD' }}>
              +{c.pts}
            </span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '2px solid #F0F0F0' }}>
        {(['annonces', 'avis'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setOnglet(tab)}
            style={{
              flex: 1,
              padding: '13px 0',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: onglet === tab ? 700 : 500,
              color: onglet === tab ? '#1A1A1A' : '#888888',
              borderBottom: onglet === tab ? '2px solid #1A1A1A' : '2px solid transparent',
              marginBottom: -2,
              transition: 'all 0.15s',
            }}
          >
            {tab === 'annonces'
              ? `Annonces${listings.length > 0 ? ` (${listings.length})` : ''}`
              : `Avis${avis.length > 0 ? ` (${avis.length})` : ''}`}
          </button>
        ))}
      </div>

      {/* Contenu onglets */}
      <div style={{ padding: '16px 12px', paddingBottom: 40 }}>

        {/* Onglet Annonces */}
        {onglet === 'annonces' && (
          listings.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#AAAAAA', fontSize: 14, paddingTop: 48 }}>
              Aucune annonce active
            </p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {listings.map(listing => (
                <Link key={listing.id} href={`/annonce/${listing.id}`} className="block">
                  <div style={{ background: '#FFFFFF', borderRadius: 4 }}>
                    <div style={{ position: 'relative', aspectRatio: '4/5', borderRadius: 4, overflow: 'hidden', background: '#F5F5F5' }}>
                      {listing.photos && listing.photos.length > 0 ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={toThumbUrl(listing.photos[0])}
                          alt={listing.titre}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: '#F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: 28 }}>
                            {listing.categorie === 'vehicule' ? '🚗' : listing.categorie === 'immobilier' ? '🏠' : '🛋️'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div style={{ padding: '8px 4px 6px' }}>
                      <p className="truncate" style={{ fontSize: 13, fontWeight: 500, color: '#1A1A1A' }}>{listing.titre}</p>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#404040', marginTop: 2 }}>{formatPrix(listing.prix)}</p>
                      <p style={{ fontSize: 11, color: '#888888', marginTop: 2 }}>{listing.ville || 'Maurice'} · {formatDate(listing.created_at)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )
        )}

        {/* Onglet Avis */}
        {onglet === 'avis' && (
          avis.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#AAAAAA', fontSize: 14, paddingTop: 48 }}>
              Aucun avis pour l&apos;instant
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {avis.map(a => (
                <div
                  key={a.id}
                  style={{
                    background: '#FAFAFA',
                    border: '1px solid #F0F0F0',
                    borderRadius: 12,
                    padding: '12px 14px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: '#E8E8E8',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#888' }}>
                          {a.prenom?.[0]?.toUpperCase() ?? 'A'}
                        </span>
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', margin: 0 }}>
                          {a.prenom ?? 'Acheteur'}
                        </p>
                        <Etoiles note={a.note} taille={11} />
                      </div>
                    </div>
                    <span style={{ fontSize: 11, color: '#BBBBBB' }}>
                      {new Date(a.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  {a.commentaire && (
                    <p style={{ fontSize: 13, color: '#555', margin: 0, lineHeight: 1.5 }}>
                      {a.commentaire}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  )
}
