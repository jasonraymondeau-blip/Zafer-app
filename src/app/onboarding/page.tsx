'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'

// Page d'onboarding — demande le numéro WhatsApp après inscription Google
// Le numéro est indispensable pour vendre et acheter sur Zafer
export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()

  const [prenom, setPrenom] = useState('')
  const [telephone, setTelephone] = useState('')
  const [loading, setLoading] = useState(false)
  const [erreur, setErreur] = useState('')

  // Pré-remplit le prénom depuis les metadata Google si disponible
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.replace('/compte'); return }
      const fullName = user.user_metadata?.full_name || user.user_metadata?.name || ''
      if (fullName) setPrenom(fullName.split(' ')[0])
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!telephone.trim()) { setErreur('Le numéro WhatsApp est requis.'); return }
    setErreur('')
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.replace('/compte'); return }

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      prenom: prenom || null,
      telephone: telephone.trim(),
    })

    if (error) {
      setErreur('Une erreur est survenue, veuillez réessayer.')
      setLoading(false)
      return
    }

    router.replace('/')
  }

  async function handlePlusTard() {
    router.replace('/')
  }

  return (
    <div className="max-w-lg mx-auto min-h-screen bg-white flex flex-col" style={{ paddingBottom: 40 }}>

      {/* Header */}
      <div style={{ padding: '48px 24px 32px', textAlign: 'center' }}>
        <h1
          style={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: 28,
            fontWeight: 800,
            color: '#404040',
            letterSpacing: 3,
            marginBottom: 32,
          }}
        >
          ZAFER
        </h1>

        {/* Icône WhatsApp */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: '#E8F5E9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
          }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="#25D366">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </div>

        <p style={{ fontSize: 20, fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }}>
          Votre numéro WhatsApp
        </p>
        <p style={{ fontSize: 14, color: '#888888', lineHeight: 1.5 }}>
          Sur Zafer, les acheteurs et vendeurs se contactent via WhatsApp. Ajoutez votre numéro pour commencer.
        </p>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} style={{ padding: '0 24px', flex: 1 }} className="space-y-4">

        {/* Prénom */}
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1A1A1A', marginBottom: 6 }}>
            Votre prénom
          </label>
          <input
            type="text"
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
            placeholder="Prénom"
            className="w-full border border-gray-200 rounded-[12px] px-4 py-3 text-sm outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Téléphone WhatsApp */}
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1A1A1A', marginBottom: 6 }}>
            Numéro WhatsApp *
          </label>
          <input
            type="tel"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            placeholder="+230 5XXX XXXX"
            required
            className="w-full border border-gray-200 rounded-[12px] px-4 py-3 text-sm outline-none focus:border-primary transition-colors"
          />
          <p style={{ fontSize: 11, color: '#888888', marginTop: 6 }}>
            Ex : +230 5712 3456 (Maurice) — Ce numéro sera visible par les acheteurs
          </p>
        </div>

        {erreur && (
          <p style={{ fontSize: 13, color: '#ef4444' }}>{erreur}</p>
        )}

        {/* Bouton principal */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-semibold py-4 rounded-[12px] text-sm transition-colors"
          style={{ marginTop: 8 }}
        >
          {loading ? 'Enregistrement...' : 'Continuer'}
        </button>

        {/* Lien passer plus tard */}
        <button
          type="button"
          onClick={handlePlusTard}
          style={{
            display: 'block',
            width: '100%',
            textAlign: 'center',
            fontSize: 13,
            color: '#888888',
            padding: '12px 0',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Passer pour l&apos;instant
        </button>
      </form>
    </div>
  )
}
