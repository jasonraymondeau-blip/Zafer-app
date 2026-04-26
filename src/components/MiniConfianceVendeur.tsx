'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

const COULEUR = '#d58F62'
const POINTS_PAR_CRITERE = 20

const SIZE = 36
const CENTER = SIZE / 2
const RADIUS = 15
const STROKE_WIDTH = 3
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const INNER_DIAM = (RADIUS - STROKE_WIDTH / 2 - 1) * 2
const INNER_OFFSET = CENTER - INNER_DIAM / 2

export default function MiniConfianceVendeur({ userId }: { userId: string }) {
  const supabase = createClient()
  const [score, setScore] = useState<number | null>(null)
  const [initiale, setInitiale] = useState('?')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    async function charger() {
      const [profileRes, listingsRes, avisRes] = await Promise.all([
        supabase.from('profiles').select('prenom, nom, telephone, avatar_url').eq('id', userId).single(),
        supabase.from('listings').select('id', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('avis').select('id', { count: 'exact', head: true }).eq('acheteur_id', userId),
      ])
      const p = profileRes.data
      if (p?.avatar_url) setAvatarUrl(p.avatar_url)
      if (p?.prenom) setInitiale(p.prenom.charAt(0).toUpperCase())
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

  if (score === null) return <div style={{ width: SIZE, height: SIZE + 14 }} />

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
            overflow: 'hidden',
            background: '#1A1A1A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ color: '#FFFFFF', fontSize: 11, fontWeight: 700 }}>{initiale}</span>
          )}
        </div>
      </div>

      <span style={{ fontSize: 10, fontWeight: 600, color: COULEUR, marginTop: 2, lineHeight: 1 }}>
        {score}
        <span style={{ fontSize: 9, fontWeight: 400, color: '#AAAAAA' }}>/100</span>
      </span>
    </div>
  )
}
