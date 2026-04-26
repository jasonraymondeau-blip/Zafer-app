'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'
import { useAuthModal } from '@/contexts/AuthModalContext'

type Mode = 'connexion' | 'inscription' | 'mot-de-passe-oublie'

export default function AuthModal() {
  const { isOpen, destination, closeAuthModal } = useAuthModal()
  const router = useRouter()
  const supabase = createClient()

  const [mode, setMode] = useState<Mode>('connexion')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [prenom, setPrenom] = useState('')
  const [telephone, setTelephone] = useState('')
  const [erreur, setErreur] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  function reset() {
    setEmail(''); setPassword(''); setPrenom(''); setTelephone(''); setErreur('')
  }

  async function handleConnexion(e: React.FormEvent) {
    e.preventDefault()
    setErreur(''); setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setErreur('Email ou mot de passe incorrect.')
    } else {
      reset(); closeAuthModal(); router.push(destination)
    }
    setLoading(false)
  }

  async function handleInscription(e: React.FormEvent) {
    e.preventDefault()
    setErreur(''); setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { prenom } },
    })
    if (error) {
      setErreur(error.message)
    } else {
      if (data.user) {
        await supabase.from('profiles').upsert({ id: data.user.id, prenom: prenom || null, telephone: telephone || null })
      }
      setErreur('Vérifiez votre email pour confirmer votre compte.')
    }
    setLoading(false)
  }

  async function handleMdpOublie(e: React.FormEvent) {
    e.preventDefault()
    setErreur(''); setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    setErreur(error ? "Impossible d'envoyer l'email." : 'Email envoyé ! Vérifiez votre boîte mail.')
    setLoading(false)
  }

  async function handleGoogle() {
    setErreur(''); setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) { setErreur('Connexion Google échouée.'); setLoading(false) }
  }

  return (
    <>
      {/* Overlay */}
      <div
        onClick={closeAuthModal}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200 }}
      />

      {/* Bottom sheet */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: '#FFFFFF',
        borderRadius: '20px 20px 0 0',
        zIndex: 201,
        maxHeight: '92vh',
        overflowY: 'auto',
        padding: '16px 24px',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 32px)',
      }}>

        {/* Bouton fermer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
          <button onClick={closeAuthModal} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <X size={22} color="#1A1A1A" />
          </button>
        </div>

        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
          <img src="/logo-titre.svg" alt="Zafer" style={{ height: 80, width: 'auto' }} />
        </div>

        <p style={{ fontSize: 13, color: '#888888', textAlign: 'center', marginBottom: 16, lineHeight: 1.45 }}>
          Connectez-vous pour accéder à cette fonctionnalité.
        </p>

        {/* Mode : mot de passe oublié */}
        {mode === 'mot-de-passe-oublie' ? (
          <>
            <button type="button" onClick={() => { setMode('connexion'); setErreur('') }}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 14px', fontSize: 13, color: '#888888' }}>
              <ArrowLeft size={14} /> Retour à la connexion
            </button>
            <form onSubmit={handleMdpOublie} className="space-y-3">
              <input type="email" placeholder="exemple@email.com" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-[6px] px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors" required />
              {erreur && <p className={`text-sm ${erreur.includes('envoyé') ? 'text-green-600' : 'text-red-500'}`}>{erreur}</p>}
              <button type="submit" disabled={loading}
                style={{ width: '100%', background: '#404040', color: '#FFFFFF', border: 'none', borderRadius: 6, padding: '13px 0', fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: loading ? 0.5 : 1 }}>
                {loading ? '...' : 'Envoyer le lien'}
              </button>
            </form>
          </>
        ) : (
          <>
            {/* Onglets */}
            <div style={{ display: 'flex', borderBottom: '1.5px solid #EEEEEE', marginBottom: 16 }}>
              {(['connexion', 'inscription'] as Mode[]).map(m => (
                <button key={m} type="button" onClick={() => { setMode(m); setErreur('') }}
                  style={{ flex: 1, padding: '9px 0', background: 'none', border: 'none', borderBottom: mode === m ? '2px solid #1A1A1A' : '2px solid transparent', marginBottom: -1.5, fontSize: 14, fontWeight: mode === m ? 700 : 400, color: mode === m ? '#1A1A1A' : '#BBBBBB', cursor: 'pointer', transition: 'all 0.15s' }}>
                  {m === 'connexion' ? 'Connexion' : 'Inscription'}
                </button>
              ))}
            </div>

            <form onSubmit={mode === 'connexion' ? handleConnexion : handleInscription} className="space-y-3">
              {mode === 'inscription' && (
                <>
                  <input type="text" placeholder="Prénom" value={prenom} onChange={e => setPrenom(e.target.value)}
                    className="w-full border border-gray-200 rounded-[6px] px-4 py-2.5 text-sm outline-none focus:border-primary" required />
                  <input type="tel" placeholder="+230 5XXX XXXX" value={telephone} onChange={e => setTelephone(e.target.value)}
                    className="w-full border border-gray-200 rounded-[6px] px-4 py-2.5 text-sm outline-none focus:border-primary" required />
                </>
              )}
              <input type="email" placeholder="exemple@email.com" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-[6px] px-4 py-2.5 text-sm outline-none focus:border-primary" required />
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: '#888888' }}>Mot de passe</span>
                  {mode === 'connexion' && (
                    <button type="button" onClick={() => { setMode('mot-de-passe-oublie'); setErreur('') }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: '#888888', padding: 0 }}>
                      Mot de passe oublié ?
                    </button>
                  )}
                </div>
                <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full border border-gray-200 rounded-[6px] px-4 py-2.5 text-sm outline-none focus:border-primary" required minLength={6} />
              </div>
              {erreur && <p className={`text-sm ${erreur.includes('Vérifiez') ? 'text-green-600' : 'text-red-500'}`}>{erreur}</p>}
              <button type="submit" disabled={loading}
                style={{ width: '100%', background: '#404040', color: '#FFFFFF', border: 'none', borderRadius: 6, padding: '13px 0', fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: loading ? 0.5 : 1, transition: 'opacity 0.2s' }}>
                {loading ? '...' : mode === 'connexion' ? 'Se connecter' : "S'inscrire"}
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '14px 0' }}>
              <div style={{ flex: 1, height: 1, background: '#EEEEEE' }} />
              <span style={{ fontSize: 12, color: '#BBBBBB' }}>ou</span>
              <div style={{ flex: 1, height: 1, background: '#EEEEEE' }} />
            </div>

            <button type="button" onClick={handleGoogle} disabled={loading}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, border: '1.5px solid #E5E7EB', borderRadius: 6, padding: '12px 0', fontSize: 14, fontWeight: 600, color: '#1A1A1A', background: '#FFFFFF', cursor: 'pointer', opacity: loading ? 0.5 : 1 }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              Continuer avec Google
            </button>
          </>
        )}
      </div>
    </>
  )
}
