'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'

// Composant séparé pour pouvoir utiliser useSearchParams dans un Suspense
function ResetPasswordForm() {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [pret, setPret] = useState(false)        // session recovery établie
  const [erreurSession, setErreurSession] = useState(false)
  const [motDePasse, setMotDePasse] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [erreur, setErreur] = useState('')

  useEffect(() => {
    const code = searchParams.get('code')

    if (code) {
      // Flux PKCE : échange le code contre une session de type recovery
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) {
          setErreurSession(true)
        } else {
          setPret(true)
        }
      })
    } else {
      // Flux legacy : écoute l'événement PASSWORD_RECOVERY (token dans le hash)
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
        if (event === 'PASSWORD_RECOVERY') {
          setPret(true)
          subscription.unsubscribe()
        }
      })

      // Si aucun code et aucun événement en 4s → lien invalide
      const timeout = setTimeout(() => setErreurSession(true), 4000)
      return () => {
        clearTimeout(timeout)
        subscription.unsubscribe()
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleReinitialiser(e: React.FormEvent) {
    e.preventDefault()
    setErreur('')

    if (motDePasse !== confirmation) {
      setErreur('Les mots de passe ne correspondent pas.')
      return
    }
    if (motDePasse.length < 6) {
      setErreur('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: motDePasse })

    if (error) {
      setErreur('Impossible de mettre à jour le mot de passe. Réessayez.')
    } else {
      setMessage('Mot de passe mis à jour ! Redirection...')
      setTimeout(() => router.replace('/compte'), 2000)
    }
    setLoading(false)
  }

  // Lien expiré ou invalide
  if (erreurSession) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <p className="text-text-main font-semibold mb-2">Lien invalide ou expiré</p>
        <p className="text-text-muted text-sm mb-6">
          Demandez un nouveau lien de réinitialisation depuis la page de connexion.
        </p>
        <button
          onClick={() => router.replace('/compte')}
          style={{ background: '#404040', color: '#fff', border: 'none', borderRadius: 6, padding: '12px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
        >
          Retour à la connexion
        </button>
      </div>
    )
  }

  // Attente de l'établissement de la session
  if (!pret) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-gray-100">
        <button onClick={() => router.replace('/compte')} className="p-1 -ml-1">
          <ArrowLeft className="w-5 h-5 text-text-main" />
        </button>
        <h1 className="text-lg font-bold text-text-main">Nouveau mot de passe</h1>
      </header>

      <form onSubmit={handleReinitialiser} className="px-4 py-5 space-y-4">
        <p className="text-text-muted text-sm">
          Choisissez un nouveau mot de passe pour votre compte Zafer.
        </p>

        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">
            Nouveau mot de passe
          </label>
          <input
            type="password"
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            placeholder="Au moins 6 caractères"
            minLength={6}
            required
            className="w-full border border-gray-200 rounded-[6px] px-4 py-3 text-sm outline-none focus:border-primary transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">
            Confirmer le mot de passe
          </label>
          <input
            type="password"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            placeholder="Répétez le mot de passe"
            minLength={6}
            required
            className="w-full border border-gray-200 rounded-[6px] px-4 py-3 text-sm outline-none focus:border-primary transition-colors"
          />
        </div>

        {erreur && <p className="text-red-500 text-sm px-1">{erreur}</p>}
        {message && <p className="text-green-600 text-sm px-1">{message}</p>}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            background: '#404040',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 6,
            padding: '14px 0',
            fontSize: 14,
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.5 : 1,
          }}
        >
          {loading ? '...' : 'Enregistrer le mot de passe'}
        </button>
      </form>
    </div>
  )
}

// Wrapper Suspense requis par Next.js pour useSearchParams dans un Server Component tree
export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  )
}
