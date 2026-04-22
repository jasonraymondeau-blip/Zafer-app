'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import type { User } from '@supabase/supabase-js'

const COULEUR = '#b85c38'

interface Critere {
  label: string
  atteint: boolean
}

const POINTS_PAR_CRITERE = 20

export default function IndiceConfiance({ user }: { user: User }) {
  const supabase = createClient()
  const [criteres, setCriteres] = useState<Critere[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function charger() {
      const [profileRes, listingsRes] = await Promise.all([
        supabase.from('profiles').select('prenom, nom, telephone').eq('id', user.id).single(),
        supabase.from('listings').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      ])

      const profile = profileRes.data

      setCriteres([
        { label: 'Numéro de téléphone ajouté', atteint: !!profile?.telephone },
        { label: 'Email confirmé', atteint: !!user.email_confirmed_at },
        { label: 'Prénom & Nom renseignés', atteint: !!(profile?.prenom && profile?.nom) },
        { label: 'Première annonce publiée', atteint: (listingsRes.count ?? 0) > 0 },
        { label: 'Premier commentaire laissé', atteint: false },
      ])
      setLoading(false)
    }
    charger()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id])

  if (loading) return null

  const score = criteres.filter(c => c.atteint).length * POINTS_PAR_CRITERE

  return (
    <div style={{ padding: '16px 16px 20px', borderBottom: '1px solid #F0F0F0' }}>

      {/* En-tête score */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A' }}>Indice de confiance</span>
        <span style={{ fontSize: 15, fontWeight: 700, color: COULEUR }}>{score}<span style={{ fontSize: 11, fontWeight: 500, color: '#AAAAAA' }}>/100</span></span>
      </div>

      {/* Barre de progression segmentée */}
      <div style={{ display: 'flex', gap: 3, marginBottom: 14 }}>
        {criteres.map((c, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 6,
              borderRadius: 99,
              background: c.atteint ? COULEUR : '#EFEFEF',
              transition: 'background 0.4s ease',
            }}
          />
        ))}
      </div>

      {/* Liste des critères */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {criteres.map((c, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Pastille check / vide */}
            <div style={{
              width: 18,
              height: 18,
              borderRadius: '50%',
              flexShrink: 0,
              background: c.atteint ? COULEUR : '#F0F0F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {c.atteint && (
                <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                  <path d="M1.5 4.5l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span style={{ fontSize: 12, color: c.atteint ? '#1A1A1A' : '#AAAAAA', flex: 1 }}>{c.label}</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: c.atteint ? COULEUR : '#CCCCCC' }}>
              +{POINTS_PAR_CRITERE} pts
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
