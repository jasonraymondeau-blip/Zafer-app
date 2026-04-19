'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'

export default function ParametresPage() {
  const supabase = createClient()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [chargement, setChargement] = useState(true)
  const [motDePasse, setMotDePasse] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [erreur, setErreur] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user
      if (!user) {
        router.replace('/compte')
        return
      }
      setEmail(user.email ?? '')
      setChargement(false)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleChangerMotDePasse(e: React.FormEvent) {
    e.preventDefault()
    setErreur('')
    setMessage('')

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
      setErreur('Erreur lors du changement de mot de passe.')
    } else {
      setMessage('Mot de passe mis à jour ✓')
      setMotDePasse('')
      setConfirmation('')
    }
    setLoading(false)
  }

  if (chargement) {
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
        <button onClick={() => router.back()} className="p-1 -ml-1">
          <ArrowLeft className="w-5 h-5 text-text-main" />
        </button>
        <h1 className="text-lg font-bold text-text-main">Paramètres</h1>
      </header>

      <div className="px-4 py-5 space-y-6">
        {/* Email — lecture seule */}
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">Adresse email</label>
          <div className="w-full border border-gray-100 rounded-[6px] px-4 py-3 text-sm text-text-muted bg-card">
            {email}
          </div>
        </div>

        {/* Changement de mot de passe */}
        <div>
          <h2 className="font-semibold text-text-main text-sm mb-3">Changer le mot de passe</h2>
          <form onSubmit={handleChangerMotDePasse} className="space-y-3">
            <input
              type="password"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              placeholder="Nouveau mot de passe"
              minLength={6}
              required
              className="w-full border border-gray-200 rounded-[6px] px-4 py-3 text-sm outline-none focus:border-primary transition-colors"
            />
            <input
              type="password"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder="Confirmer le mot de passe"
              minLength={6}
              required
              className="w-full border border-gray-200 rounded-[6px] px-4 py-3 text-sm outline-none focus:border-primary transition-colors"
            />

            {erreur && <p className="text-red-500 text-sm px-1">{erreur}</p>}
            {message && <p className="text-green-600 text-sm px-1">{message}</p>}

            <button
              type="submit"
              disabled={loading}
              style={{ width:'100%', background:'#404040', color:'#FFFFFF', fontWeight:600, padding:'14px 0', borderRadius:6, fontSize:14, border:'none', cursor:'pointer', opacity: loading ? 0.5 : 1 }}
            >
              {loading ? '...' : 'Mettre à jour'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
