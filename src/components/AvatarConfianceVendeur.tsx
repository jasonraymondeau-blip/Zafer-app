'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import type { Profile } from '@/lib/supabase'

const COULEUR = '#d58F62'

const SIZE = 96
const CENTER = SIZE / 2
const RADIUS = 42
const STROKE_WIDTH = 5
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const INNER_DIAM = (RADIUS - STROKE_WIDTH / 2 - 2) * 2
const INNER_OFFSET = CENTER - INNER_DIAM / 2

export default function AvatarConfianceVendeur({ profil }: { profil: Profile }) {
  const supabase = createClient()
  const [score, setScore] = useState<number | null>(null)

  useEffect(() => {
    async function charger() {
      const [listingsRes, avisRes] = await Promise.all([
        supabase.from('listings').select('id', { count: 'exact', head: true }).eq('user_id', profil.id),
        supabase.from('avis').select('id', { count: 'exact', head: true }).eq('acheteur_id', profil.id),
      ])
      const liste = [
        !!profil.telephone,
        !!(profil.prenom && profil.nom),
        (listingsRes.count ?? 0) > 0,
        !avisRes.error && (avisRes.count ?? 0) > 0,
      ]
      // Compte existant = 20pts de base + critères
      setScore(20 + liste.filter(Boolean).length * 20)
    }
    charger()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profil.id])

  const initiale = profil.prenom?.[0]?.toUpperCase() ?? 'V'
  const dashoffset = score !== null ? CIRCUMFERENCE * (1 - score / 100) : CIRCUMFERENCE

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: SIZE, height: SIZE }}>
        {/* Anneau SVG */}
        <svg
          width={SIZE}
          height={SIZE}
          style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}
        >
          <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none" stroke="#EFEFEF" strokeWidth={STROKE_WIDTH} />
          {score !== null && (
            <circle
              cx={CENTER} cy={CENTER} r={RADIUS}
              fill="none"
              stroke={COULEUR}
              strokeWidth={STROKE_WIDTH}
              strokeLinecap="round"
              strokeDasharray={`${CIRCUMFERENCE}`}
              strokeDashoffset={dashoffset}
              style={{ transition: 'stroke-dashoffset 0.6s ease' }}
            />
          )}
        </svg>

        {/* Rond noir avec initiale ou photo */}
        <div
          style={{
            position: 'absolute',
            top: INNER_OFFSET,
            left: INNER_OFFSET,
            width: INNER_DIAM,
            height: INNER_DIAM,
            borderRadius: '50%',
            overflow: 'hidden',
            background: '#1A1A1A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {profil.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profil.avatar_url}
              alt={profil.prenom ?? ''}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <span style={{ color: '#FFFFFF', fontSize: 34, fontWeight: 700 }}>{initiale}</span>
          )}
        </div>
      </div>

      {/* Score sous le rond */}
      {score !== null && (
        <span style={{ fontSize: 13, fontWeight: 600, color: COULEUR, marginTop: 6, lineHeight: 1 }}>
          {score}
          <span style={{ fontSize: 11, fontWeight: 400, color: '#AAAAAA' }}>/100</span>
        </span>
      )}
    </div>
  )
}
