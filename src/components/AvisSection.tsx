'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

interface Avis {
  id: string
  acheteur_id: string
  note: number
  commentaire: string | null
  created_at: string
  prenom?: string
}

interface Props {
  vendeurId: string
  listingId: string
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

function EtoilesInteractives({ valeur, onChange }: { valeur: number; onChange: (n: number) => void }) {
  const [survol, setSurvol] = useState(0)
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          onMouseEnter={() => setSurvol(i)}
          onMouseLeave={() => setSurvol(0)}
          onClick={() => onChange(i)}
          style={{ background: 'none', border: 'none', padding: 2, cursor: 'pointer' }}
        >
          <svg width="28" height="28" viewBox="0 0 14 14" fill="none">
            <path
              d="M7 1l1.545 3.13L12 4.635l-2.5 2.435.59 3.43L7 8.885l-3.09 1.615L4.5 7.07 2 4.635l3.455-.505L7 1z"
              fill={(survol || valeur) >= i ? '#FBB13C' : '#E8E8E8'}
              style={{ transition: 'fill 0.1s' }}
            />
          </svg>
        </button>
      ))}
    </div>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function AvisSection({ vendeurId, listingId }: Props) {
  const supabase = createClient()

  const [avis, setAvis] = useState<Avis[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [dejaAvis, setDejaAvis] = useState(false)

  // Formulaire
  const [note, setNote] = useState(0)
  const [commentaire, setCommentaire] = useState('')
  const [envoi, setEnvoi] = useState(false)
  const [erreur, setErreur] = useState('')
  const [succes, setSucces] = useState(false)

  async function charger() {
    const [sessionRes, avisRes] = await Promise.all([
      supabase.auth.getSession(),
      supabase.from('avis').select('*').eq('vendeur_id', vendeurId).order('created_at', { ascending: false }).limit(20),
    ])

    const uid = sessionRes.data.session?.user?.id ?? null
    setUserId(uid)

    const liste: Avis[] = avisRes.data ?? []

    // Récupère les prénoms des acheteurs
    const ids = [...new Set(liste.map(a => a.acheteur_id))]
    if (ids.length > 0) {
      const { data: profils } = await supabase.from('profiles').select('id, prenom').in('id', ids)
      const map = Object.fromEntries((profils ?? []).map(p => [p.id, p.prenom]))
      liste.forEach(a => { a.prenom = map[a.acheteur_id] ?? undefined })
    }

    setAvis(liste)

    if (uid) {
      const deja = liste.some(a => a.acheteur_id === uid)
      setDejaAvis(deja)
    }

    setLoading(false)
  }

  useEffect(() => { charger() }, [vendeurId]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSoumettre(e: React.FormEvent) {
    e.preventDefault()
    if (note === 0) { setErreur('Sélectionnez une note.'); return }
    setErreur('')
    setEnvoi(true)

    const { error } = await supabase.from('avis').insert({
      vendeur_id: vendeurId,
      acheteur_id: userId!,
      listing_id: listingId,
      note,
      commentaire: commentaire.trim() || null,
    })

    if (error) {
      setErreur("Erreur lors de l'envoi. Réessayez.")
    } else {
      setSucces(true)
      setNote(0)
      setCommentaire('')
      await charger()
    }
    setEnvoi(false)
  }

  if (loading) return null

  const moyenne = avis.length > 0
    ? Math.round((avis.reduce((s, a) => s + a.note, 0) / avis.length) * 10) / 10
    : null

  const peutLaisserAvis = userId && userId !== vendeurId && !dejaAvis && !succes

  return (
    <div style={{ marginTop: 24 }}>

      {/* En-tête */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>
          Avis acheteurs
        </h2>
        {moyenne !== null && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Etoiles note={Math.round(moyenne)} taille={13} />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A' }}>{moyenne}</span>
            <span style={{ fontSize: 12, color: '#AAAAAA' }}>({avis.length})</span>
          </div>
        )}
      </div>

      {/* Formulaire */}
      {peutLaisserAvis && (
        <form
          onSubmit={handleSoumettre}
          style={{
            background: '#FAFAFA',
            border: '1.5px solid #F0F0F0',
            borderRadius: 12,
            padding: 14,
            marginBottom: 16,
          }}
        >
          <p style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', marginBottom: 10 }}>
            Laisser un avis
          </p>
          <EtoilesInteractives valeur={note} onChange={setNote} />
          <textarea
            value={commentaire}
            onChange={e => setCommentaire(e.target.value)}
            placeholder="Partagez votre expérience avec ce vendeur... (optionnel)"
            rows={3}
            style={{
              width: '100%',
              marginTop: 10,
              border: '1.5px solid #EEEEEE',
              borderRadius: 8,
              padding: '10px 12px',
              fontSize: 13,
              color: '#1A1A1A',
              background: '#fff',
              outline: 'none',
              resize: 'none',
              boxSizing: 'border-box',
            }}
          />
          {erreur && <p style={{ fontSize: 12, color: '#ef4444', marginTop: 6 }}>{erreur}</p>}
          <button
            type="submit"
            disabled={envoi}
            style={{
              marginTop: 10,
              width: '100%',
              background: '#1A1A1A',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '11px 0',
              fontSize: 13,
              fontWeight: 600,
              cursor: envoi ? 'not-allowed' : 'pointer',
              opacity: envoi ? 0.5 : 1,
            }}
          >
            {envoi ? '...' : 'Publier mon avis'}
          </button>
        </form>
      )}

      {succes && (
        <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>
          <p style={{ fontSize: 13, color: '#16a34a', fontWeight: 500, margin: 0 }}>Avis publié — merci !</p>
        </div>
      )}

      {/* Liste des avis */}
      {avis.length === 0 ? (
        <p style={{ fontSize: 13, color: '#AAAAAA', textAlign: 'center', padding: '16px 0' }}>
          Aucun avis pour ce vendeur pour l&apos;instant.
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
                  {/* Avatar initiale */}
                  <div style={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    background: '#E8E8E8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#888' }}>
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
                <span style={{ fontSize: 11, color: '#BBBBBB' }}>{formatDate(a.created_at)}</span>
              </div>
              {a.commentaire && (
                <p style={{ fontSize: 13, color: '#555', margin: 0, lineHeight: 1.5 }}>
                  {a.commentaire}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
