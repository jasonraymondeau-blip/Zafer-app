'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import type { User } from '@supabase/supabase-js'

const COULEUR = '#d58F62'
const POINTS_PAR_CRITERE = 20
const NB_CRITERES = 5

export default function IndiceConfiance({ user }: { user: User }) {
  const supabase = createClient()
  const router = useRouter()
  const [score, setScore] = useState<number | null>(null)
  const [atteints, setAtteints] = useState<boolean[]>([])

  useEffect(() => {
    async function charger() {
      const [profileRes, listingsRes, avisRes] = await Promise.all([
        supabase.from('profiles').select('prenom, nom, telephone').eq('id', user.id).single(),
        supabase.from('listings').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('avis').select('id', { count: 'exact', head: true }).eq('acheteur_id', user.id),
      ])
      const p = profileRes.data
      const liste = [
        !!p?.telephone,
        !!user.email_confirmed_at,
        !!(p?.prenom && p?.nom),
        (listingsRes.count ?? 0) > 0,
        !avisRes.error && (avisRes.count ?? 0) > 0,
      ]
      setAtteints(liste)
      setScore(liste.filter(Boolean).length * POINTS_PAR_CRITERE)
    }
    charger()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id])

  if (score === null) return null

  return (
    <button
      onClick={() => router.push('/compte/confiance')}
      style={{
        display: 'block',
        width: '100%',
        textAlign: 'left',
        background: 'none',
        border: 'none',
        borderBottom: '1px solid #F0F0F0',
        padding: '16px 16px 18px',
        cursor: 'pointer',
      }}
    >
      {/* En-tête score + chevron */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A' }}>Indice de confiance</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: COULEUR }}>
            {score}<span style={{ fontSize: 11, fontWeight: 500, color: '#AAAAAA' }}>/100</span>
          </span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M5 3l4 4-4 4" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Barre segmentée */}
      <div style={{ display: 'flex', gap: 3 }}>
        {Array.from({ length: NB_CRITERES }).map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 6,
              borderRadius: 99,
              background: atteints[i] ? COULEUR : '#EFEFEF',
              transition: 'background 0.4s ease',
            }}
          />
        ))}
      </div>
    </button>
  )
}
