'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import type { User } from '@supabase/supabase-js'

const COULEUR = '#d58F62'
const POINTS_PAR_CRITERE = 20

export default function AvatarConfiance({ user }: { user: User }) {
  const supabase = createClient()
  const [score, setScore] = useState<number | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    async function charger() {
      const [profileRes, listingsRes, avisRes] = await Promise.all([
        supabase.from('profiles').select('prenom, nom, telephone, avatar_url').eq('id', user.id).single(),
        supabase.from('listings').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('avis').select('id', { count: 'exact', head: true }).eq('acheteur_id', user.id),
      ])
      const p = profileRes.data
      if (p?.avatar_url) setAvatarUrl(p.avatar_url)
      const liste = [
        !!p?.telephone,
        !!user.email_confirmed_at,
        !!(p?.prenom && p?.nom),
        (listingsRes.count ?? 0) > 0,
        !avisRes.error && (avisRes.count ?? 0) > 0,
      ]
      setScore(liste.filter(Boolean).length * POINTS_PAR_CRITERE)
    }
    charger()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id])

  const prenom = user.user_metadata?.prenom || ''
  const initiale = prenom.charAt(0).toUpperCase() || '?'

  const SIZE = 80
  const CENTER = SIZE / 2
  const RADIUS = 34
  const STROKE_WIDTH = 5
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS
  const dashoffset = score !== null ? CIRCUMFERENCE * (1 - score / 100) : CIRCUMFERENCE

  // Diamètre du rond intérieur (dans le trait du ring)
  const innerDiam = (RADIUS - STROKE_WIDTH / 2 - 2) * 2
  const innerOffset = CENTER - innerDiam / 2

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
      <div style={{ position: 'relative', width: SIZE, height: SIZE }}>
        {/* Anneau SVG pivoté pour partir à midi */}
        <svg
          width={SIZE}
          height={SIZE}
          style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}
        >
          {/* Piste grise */}
          <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none" stroke="#EFEFEF" strokeWidth={STROKE_WIDTH} />
          {/* Arc coloré */}
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
            top: innerOffset,
            left: innerOffset,
            width: innerDiam,
            height: innerDiam,
            borderRadius: '50%',
            overflow: 'hidden',
            background: '#1A1A1A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt={prenom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ color: '#FFFFFF', fontSize: 22, fontWeight: 700 }}>{initiale}</span>
          )}
        </div>
      </div>

      {/* Score sous le rond */}
      {score !== null && (
        <span style={{ fontSize: 12, fontWeight: 600, color: COULEUR, marginTop: 4, lineHeight: 1 }}>
          {score}
          <span style={{ fontSize: 10, fontWeight: 400, color: '#AAAAAA' }}>/100</span>
        </span>
      )}
    </div>
  )
}
