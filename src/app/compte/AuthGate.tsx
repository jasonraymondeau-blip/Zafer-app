'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, ArrowLeft } from 'lucide-react'
import {
  UserIcon,
  ClipboardTextIcon,
  HeartIcon,
  GearSixIcon,
  SignOutIcon,
} from '@phosphor-icons/react/dist/ssr'
import { createClient } from '@/lib/supabase-browser'
import type { User } from '@supabase/supabase-js'
import IndiceConfiance from '@/components/IndiceConfiance'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const menuItems: { href: string; Icon: any; label: string }[] = [
  { href: '/compte/profil',       Icon: UserIcon,          label: 'Mon profil'    },
  { href: '/compte/mes-annonces', Icon: ClipboardTextIcon, label: 'Mes annonces'  },
  { href: '/favoris',             Icon: HeartIcon,         label: 'Mes favoris'   },
  { href: '/compte/parametres',   Icon: GearSixIcon,       label: 'Paramètres'    },
]

type Mode = 'connexion' | 'inscription' | 'mot-de-passe-oublie'

export default function AuthGate() {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/'

  const [user, setUser] = useState<User | null>(null)
  const [chargement, setChargement] = useState(true)
  const [mode, setMode] = useState<Mode>('connexion')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [prenom, setPrenom] = useState('')
  const [telephone, setTelephone] = useState('')
  const [erreur, setErreur] = useState('')
  const [loading, setLoading] = useState(false)

  // Vérifie si l'utilisateur est connecté au chargement
  useEffect(() => {
    const timeout = setTimeout(() => setChargement(false), 3000)

    supabase.auth.getSession().then(({ data }) => {
      clearTimeout(timeout)
      setUser(data.session?.user ?? null)
      setChargement(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setChargement(false)
    })

    // Quand le PWA reprend le focus après Google OAuth dans Safari,
    // les cookies partagés (même domaine) contiennent la session → on la lit
    const handleVisibilite = () => {
      if (document.visibilityState === 'visible') {
        supabase.auth.getSession().then(({ data }) => {
          if (data.session?.user) {
            setUser(data.session.user)
            router.push(redirectTo)
          }
        })
      }
    }
    document.addEventListener('visibilitychange', handleVisibilite)

    return () => {
      clearTimeout(timeout)
      subscription.unsubscribe()
      document.removeEventListener('visibilitychange', handleVisibilite)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleConnexion(e: React.FormEvent) {
    e.preventDefault()
    setErreur('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setErreur('Email ou mot de passe incorrect.')
    } else {
      router.push(redirectTo)
    }
    setLoading(false)
  }

  async function handleInscription(e: React.FormEvent) {
    e.preventDefault()
    setErreur('')
    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { prenom } },
    })

    if (error) {
      setErreur(error.message)
    } else {
      // Crée le profil avec prénom + téléphone dès l'inscription
      if (data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          prenom: prenom || null,
          telephone: telephone || null,
        })
      }
      setErreur('Vérifiez votre email pour confirmer votre compte.')
    }
    setLoading(false)
  }

  async function handleMotDePasseOublie(e: React.FormEvent) {
    e.preventDefault()
    setErreur('')
    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      setErreur('Impossible d\'envoyer l\'email. Vérifiez votre adresse.')
    } else {
      setErreur('Email envoyé ! Vérifiez votre boîte mail pour réinitialiser votre mot de passe.')
    }
    setLoading(false)
  }

  async function handleGoogle() {
    setErreur('')
    setLoading(true)

    // Laisser Supabase gérer la redirection directement.
    // Il stocke le verifier PKCE de façon synchrone puis appelle window.location.assign()
    // ce qui fonctionne correctement sur Safari (contrairement aux popups window.open()).
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setErreur('Connexion Google échouée.')
      setLoading(false)
    }
    // Si succès, Supabase redirige automatiquement — pas besoin de setLoading(false)
  }

  async function handleDeconnexion() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (chargement) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Utilisateur connecté
  if (user) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="pt-6 pb-4 border-b border-gray-100" style={{ paddingLeft: 4 }}>
          <div className="flex items-end" style={{ gap: 2 }}>
            {/* height only → width auto pour éviter le letterboxing côté gauche/droite */}
            <img src="/logo.png" alt="Zafer" style={{ height: 58, width: 'auto', flexShrink: 0 }} />

            <div style={{ paddingTop: 18 }}>
              <p className="font-bold text-text-main text-lg">
                {user.user_metadata?.prenom || 'Mon compte'}
              </p>
              <p className="text-text-muted text-sm">{user.email}</p>
            </div>
          </div>
        </div>

        <IndiceConfiance user={user} />

        <div className="px-4 py-2">
          {menuItems.map(({ href, Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0"
            >
              <div className="flex items-center gap-3">
                <Icon size={20} color="#404040" weight="regular" />
                <span className="text-text-main text-sm font-medium">{label}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-text-muted" />
            </Link>
          ))}

          <button
            onClick={handleDeconnexion}
            className="flex items-center gap-3 py-4 w-full"
          >
            <SignOutIcon size={20} color="#ef4444" weight="regular" />
            <span className="text-red-500 text-sm font-medium">Se déconnecter</span>
          </button>
        </div>
      </div>
    )
  }

  // Formulaire connexion / inscription — design style Selency, compact mobile-first
  return (
    <div className="max-w-lg mx-auto px-6 pb-8" style={{ background: '#FFFFFF', minHeight: '100vh' }}>

      {/* Ligne haut : flèche retour à gauche + logo centré */}
      <div style={{ paddingTop: 'calc(env(safe-area-inset-top) + 0px)', display: 'flex', alignItems: 'center', marginBottom: 4 }}>
        <button
          type="button"
          onClick={() => router.back()}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0 }}
        >
          <ArrowLeft size={22} color="#1A1A1A" />
        </button>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', paddingRight: 30 }}>
          <img src="/logo-titre.svg" alt="Zafer" style={{ height: 130, width: 'auto' }} />
        </div>
      </div>

      {/* Tagline */}
      <p style={{ fontSize: 13, fontWeight: 400, color: '#888888', lineHeight: 1.45, margin: 0, marginBottom: 10 }}>
        Connectez-vous ou inscrivez-vous, achetez, vendez aussi facilement qu&apos;au marché.
      </p>

      {/* --- État : mot de passe oublié --- */}
      {mode === 'mot-de-passe-oublie' ? (
        <>
          <button
            type="button"
            onClick={() => { setMode('connexion'); setErreur('') }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 16px', fontSize: 13, color: '#888888' }}
          >
            <ArrowLeft size={14} /> Retour à la connexion
          </button>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A', marginBottom: 4 }}>Mot de passe oublié ?</p>
          <p style={{ fontSize: 13, color: '#888888', marginBottom: 16, lineHeight: 1.45 }}>
            Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
          </p>
          <form onSubmit={handleMotDePasseOublie} className="space-y-3">
            <div>
              <label style={{ fontSize: 11, fontWeight: 500, color: '#888888', display: 'block', marginBottom: 4 }}>Adresse e-mail</label>
              <input
                type="email"
                placeholder="exemple@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-[6px] px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                required
              />
            </div>
            {erreur && <p className={`text-sm ${erreur.includes('envoyé') ? 'text-green-600' : 'text-red-500'}`}>{erreur}</p>}
            <button type="submit" disabled={loading} style={{ width: '100%', background: '#404040', color: '#FFFFFF', border: 'none', borderRadius: 6, padding: '13px 0', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1 }}>
              {loading ? '...' : 'Envoyer le lien'}
            </button>
          </form>
        </>
      ) : (
        <>
          {/* Onglets Connexion / Inscription */}
          <div style={{ display: 'flex', borderBottom: '1.5px solid #EEEEEE', marginBottom: 16 }}>
            {(['connexion', 'inscription'] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setErreur('') }}
                style={{ flex: 1, padding: '9px 0', background: 'none', border: 'none', borderBottom: mode === m ? '2px solid #1A1A1A' : '2px solid transparent', marginBottom: -1.5, fontSize: 14, fontWeight: mode === m ? 700 : 400, color: mode === m ? '#1A1A1A' : '#BBBBBB', cursor: 'pointer', transition: 'all 0.15s' }}
              >
                {m === 'connexion' ? 'Connexion' : 'Inscription'}
              </button>
            ))}
          </div>

          <form onSubmit={mode === 'connexion' ? handleConnexion : handleInscription} className="space-y-3">

            {/* Champs inscription uniquement */}
            {mode === 'inscription' && (
              <>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 500, color: '#888888', display: 'block', marginBottom: 4 }}>Prénom</label>
                  <input type="text" placeholder="Votre prénom" value={prenom} onChange={(e) => setPrenom(e.target.value)}
                    className="w-full border border-gray-200 rounded-[6px] px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors" required />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 500, color: '#888888', display: 'block', marginBottom: 4 }}>Numéro WhatsApp</label>
                  <input type="tel" placeholder="+230 5XXX XXXX" value={telephone} onChange={(e) => setTelephone(e.target.value)}
                    className="w-full border border-gray-200 rounded-[6px] px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors" required />
                </div>
              </>
            )}

            {/* Email */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 500, color: '#888888', display: 'block', marginBottom: 4 }}>Adresse e-mail</label>
              <input type="email" placeholder="exemple@email.com" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-[6px] px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors" required />
            </div>

            {/* Mot de passe */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                <label style={{ fontSize: 11, fontWeight: 500, color: '#888888' }}>Mot de passe</label>
                {mode === 'connexion' && (
                  <button type="button" onClick={() => { setMode('mot-de-passe-oublie'); setErreur('') }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: '#888888', padding: 0 }}>
                    Mot de passe oublié ?
                  </button>
                )}
              </div>
              <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-[6px] px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors" required minLength={6} />
            </div>

            {erreur && <p className={`text-sm ${erreur.includes('Vérifiez') ? 'text-green-600' : 'text-red-500'}`}>{erreur}</p>}

            <button type="submit" disabled={loading}
              style={{ width: '100%', background: '#404040', color: '#FFFFFF', border: 'none', borderRadius: 6, padding: '13px 0', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1, transition: 'opacity 0.2s' }}>
              {loading ? '...' : mode === 'connexion' ? 'Se connecter' : "S'inscrire"}
            </button>
          </form>

          {/* Séparateur */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '14px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#EEEEEE' }} />
            <span style={{ fontSize: 12, color: '#BBBBBB' }}>ou</span>
            <div style={{ flex: 1, height: 1, background: '#EEEEEE' }} />
          </div>

          {/* Bouton Google */}
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
  )
}
