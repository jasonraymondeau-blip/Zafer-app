'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'
import type { User } from '@supabase/supabase-js'

const COULEUR = '#b85c38'
const COULEUR_BG = '#fdf3ee'
const POINTS_PAR_CRITERE = 20

interface Badge {
  label: string
  description: string
  atteint: boolean
  action?: { label: string; href: string }
  icon: React.ReactNode
}

function IconTelephone({ atteint }: { atteint: boolean }) {
  const c = atteint ? '#fff' : '#BBBBBB'
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IconEmail({ atteint }: { atteint: boolean }) {
  const c = atteint ? '#fff' : '#BBBBBB'
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke={c} strokeWidth="1.8"/>
      <path d="M3 7l9 6 9-6" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}

function IconProfil({ atteint }: { atteint: boolean }) {
  const c = atteint ? '#fff' : '#BBBBBB'
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke={c} strokeWidth="1.8"/>
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}

function IconAnnonce({ atteint }: { atteint: boolean }) {
  const c = atteint ? '#fff' : '#BBBBBB'
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke={c} strokeWidth="1.8"/>
      <path d="M8 8h8M8 12h8M8 16h5" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}

function IconCommentaire({ atteint }: { atteint: boolean }) {
  const c = atteint ? '#fff' : '#BBBBBB'
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export default function ConfiancePage() {
  const supabase = createClient()
  const router = useRouter()

  const [user, setUser] = useState<User | null>(null)
  const [badges, setBadges] = useState<Badge[]>([])
  const [score, setScore] = useState(0)
  const [chargement, setChargement] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const u = data.session?.user
      if (!u) { router.replace('/compte'); return }
      setUser(u)

      const [profileRes, listingsRes] = await Promise.all([
        supabase.from('profiles').select('prenom, nom, telephone').eq('id', u.id).single(),
        supabase.from('listings').select('id', { count: 'exact', head: true }).eq('user_id', u.id),
      ])
      const p = profileRes.data
      const aTelephone = !!p?.telephone
      const aEmail = !!u.email_confirmed_at
      const aProfil = !!(p?.prenom && p?.nom)
      const aAnnonce = (listingsRes.count ?? 0) > 0
      const aCommentaire = false

      const liste: Badge[] = [
        {
          label: 'Numéro de téléphone',
          description: 'Ajoutez votre numéro WhatsApp pour que les acheteurs puissent vous contacter.',
          atteint: aTelephone,
          action: aTelephone ? undefined : { label: 'Ajouter mon numéro', href: '/compte/profil' },
          icon: <IconTelephone atteint={aTelephone} />,
        },
        {
          label: 'Email confirmé',
          description: 'Confirmez votre adresse email via le lien reçu à l\'inscription.',
          atteint: aEmail,
          icon: <IconEmail atteint={aEmail} />,
        },
        {
          label: 'Prénom & Nom renseignés',
          description: 'Complétez votre profil avec votre prénom et votre nom.',
          atteint: aProfil,
          action: aProfil ? undefined : { label: 'Compléter mon profil', href: '/compte/profil' },
          icon: <IconProfil atteint={aProfil} />,
        },
        {
          label: 'Première annonce publiée',
          description: 'Publiez votre première annonce sur Zafer pour gagner en visibilité.',
          atteint: aAnnonce,
          action: aAnnonce ? undefined : { label: 'Déposer une annonce', href: '/vendre' },
          icon: <IconAnnonce atteint={aAnnonce} />,
        },
        {
          label: 'Premier commentaire',
          description: 'Laissez un commentaire sur une annonce. Cette fonctionnalité arrive bientôt.',
          atteint: aCommentaire,
          icon: <IconCommentaire atteint={aCommentaire} />,
        },
      ]

      setBadges(liste)
      setScore(liste.filter(b => b.atteint).length * POINTS_PAR_CRITERE)
      setChargement(false)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (chargement || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const nbAtteints = badges.filter(b => b.atteint).length

  return (
    <div className="max-w-lg mx-auto pb-24">

      {/* Header */}
      <header className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-gray-100">
        <button onClick={() => router.back()} className="p-1 -ml-1">
          <ArrowLeft className="w-5 h-5 text-text-main" />
        </button>
        <h1 className="text-lg font-bold text-text-main">Indice de confiance</h1>
      </header>

      {/* Score + barre */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid #F0F0F0', background: '#FAFAFA' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <p style={{ fontSize: 12, color: '#888', marginBottom: 2 }}>Votre score actuel</p>
            <p style={{ fontSize: 36, fontWeight: 800, color: COULEUR, lineHeight: 1 }}>
              {score}
              <span style={{ fontSize: 16, fontWeight: 500, color: '#AAAAAA' }}> / 100</span>
            </p>
          </div>
          <p style={{ fontSize: 13, color: '#888', fontWeight: 500 }}>
            {nbAtteints}/{badges.length} critères
          </p>
        </div>

        {/* Barre segmentée */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
          {badges.map((b, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 8,
                borderRadius: 99,
                background: b.atteint ? COULEUR : '#E8E8E8',
                transition: 'background 0.4s ease',
              }}
            />
          ))}
        </div>

        <p style={{ fontSize: 12, color: '#888', lineHeight: 1.5 }}>
          Un indice élevé rassure les acheteurs et augmente vos chances de vendre rapidement.
        </p>
      </div>

      {/* Badges */}
      <div style={{ padding: '16px 16px 0' }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: '#AAAAAA', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
          Réussites à débloquer
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {badges.map((badge, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                background: badge.atteint ? COULEUR_BG : '#FAFAFA',
                border: `1.5px solid ${badge.atteint ? '#e8c4b0' : '#EFEFEF'}`,
                borderRadius: 14,
                padding: '14px 14px',
                transition: 'all 0.2s',
              }}
            >
              {/* Badge icon */}
              <div style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                flexShrink: 0,
                background: badge.atteint ? COULEUR : '#E8E8E8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: badge.atteint ? `0 4px 12px ${COULEUR}40` : 'none',
                position: 'relative',
              }}>
                {badge.icon}

                {/* Checkmark overlay pour atteint */}
                {badge.atteint && (
                  <div style={{
                    position: 'absolute',
                    bottom: -2,
                    right: -2,
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: '#22c55e',
                    border: '2px solid #fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <path d="M1.5 4l2 2 3-3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}

                {/* Cadenas pour les non-atteints */}
                {!badge.atteint && (
                  <div style={{
                    position: 'absolute',
                    bottom: -2,
                    right: -2,
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: '#CCCCCC',
                    border: '2px solid #fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                      <rect x="2" y="4.5" width="6" height="4.5" rx="1" fill="#fff"/>
                      <path d="M3.5 4.5V3a1.5 1.5 0 013 0v1.5" stroke="#fff" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                  </div>
                )}
              </div>

              {/* Texte */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: badge.atteint ? '#1A1A1A' : '#888888', margin: 0 }}>
                    {badge.label}
                  </p>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: badge.atteint ? COULEUR : '#CCCCCC',
                    background: badge.atteint ? '#fff' : '#F0F0F0',
                    border: `1px solid ${badge.atteint ? '#e8c4b0' : '#E8E8E8'}`,
                    borderRadius: 99,
                    padding: '2px 8px',
                    flexShrink: 0,
                    marginLeft: 8,
                  }}>
                    +{POINTS_PAR_CRITERE} pts
                  </span>
                </div>
                <p style={{ fontSize: 12, color: '#AAAAAA', margin: 0, lineHeight: 1.45 }}>
                  {badge.description}
                </p>

                {/* Bouton action si non atteint */}
                {badge.action && (
                  <button
                    onClick={() => router.push(badge.action!.href)}
                    style={{
                      marginTop: 8,
                      background: '#1A1A1A',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      padding: '6px 12px',
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {badge.action.label}
                  </button>
                )}

                {/* Tag "Bientôt disponible" pour commentaire */}
                {!badge.atteint && !badge.action && (
                  <span style={{
                    display: 'inline-block',
                    marginTop: 8,
                    fontSize: 10,
                    fontWeight: 600,
                    color: '#AAAAAA',
                    background: '#F0F0F0',
                    borderRadius: 4,
                    padding: '3px 7px',
                    letterSpacing: '0.04em',
                  }}>
                    BIENTÔT DISPONIBLE
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
