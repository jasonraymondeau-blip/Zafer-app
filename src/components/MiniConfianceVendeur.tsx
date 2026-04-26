'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

const COULEUR = '#d58F62'
const POINTS_PAR_CRITERE = 20

const SIZE = 40
const CENTER = SIZE / 2
const RADIUS = 17
const STROKE_WIDTH = 3
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const INNER_DIAM = (RADIUS - STROKE_WIDTH / 2 - 1) * 2
const INNER_OFFSET = CENTER - INNER_DIAM / 2

export default function MiniConfianceVendeur({ userId }: { userId: string }) {
  const supabase = createClient()
  const [score, setScore] = useState<number | null>(null)

  useEffect(() => {
    async function charger() {
      const [profileRes, listingsRes, avisRes] = await Promise.all([
        supabase.from('profiles').select('prenom, nom, telephone').eq('id', userId).single(),
        supabase.from('listings').select('id', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('avis').select('id', { count: 'exact', head: true }).eq('acheteur_id', userId),
      ])
      const p = profileRes.data
      const liste = [
        !!p?.telephone,
        !!(p?.prenom && p?.nom),
        (listingsRes.count ?? 0) > 0,
        !avisRes.error && (avisRes.count ?? 0) > 0,
      ]
      setScore(liste.filter(Boolean).length * POINTS_PAR_CRITERE + 20)
    }
    charger()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  if (score === null) return <div style={{ width: SIZE, height: SIZE + 18 }} />

  const dashoffset = CIRCUMFERENCE * (1 - score / 100)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
      <div style={{ position: 'relative', width: SIZE, height: SIZE }}>
        <svg
          width={SIZE}
          height={SIZE}
          style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}
        >
          <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none" stroke="#EFEFEF" strokeWidth={STROKE_WIDTH} />
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
        </svg>

        <div
          style={{
            position: 'absolute',
            top: INNER_OFFSET,
            left: INNER_OFFSET,
            width: INNER_DIAM,
            height: INNER_DIAM,
            borderRadius: '50%',
            background: '#1A1A1A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ color: COULEUR, fontSize: 10, fontWeight: 700, lineHeight: 1 }}>{score}</span>
        </div>
      </div>

      <span style={{ fontSize: 9, fontWeight: 600, color: '#888888', marginTop: 3, lineHeight: 1, letterSpacing: 0.2 }}>
        Confiance
      </span>
    </div>
  )
}
