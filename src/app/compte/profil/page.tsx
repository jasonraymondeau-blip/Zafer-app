'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'
import type { Profile } from '@/lib/supabase'

export default function ProfilPage() {
  const supabase = createClient()
  const router = useRouter()

  const [userId, setUserId] = useState<string>('')
  const [profil, setProfil] = useState<Partial<Profile>>({})
  const [chargement, setChargement] = useState(true)
  const [sauvegarde, setSauvegarde] = useState(false)
  const [succes, setSucces] = useState(false)
  const [erreur, setErreur] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const user = data.session?.user
      if (!user) {
        router.replace('/compte')
        return
      }

      setUserId(user.id)

      // Charge le profil existant
      const { data: p } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      setProfil(p ?? {})
      setChargement(false)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSauvegarder(e: React.FormEvent) {
    e.preventDefault()
    setSauvegarde(true)
    setErreur('')
    setSucces(false)

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        prenom: profil.prenom ?? null,
        nom: profil.nom ?? null,
        telephone: profil.telephone ?? null,
      })

    if (error) {
      setErreur('Erreur lors de la sauvegarde.')
    } else {
      setSucces(true)
    }
    setSauvegarde(false)
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
        <h1 className="text-lg font-bold text-text-main">Mon profil</h1>
      </header>

      <form onSubmit={handleSauvegarder} className="px-4 py-5 space-y-4">
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">Prénom</label>
          <input
            type="text"
            value={profil.prenom ?? ''}
            onChange={(e) => setProfil({ ...profil, prenom: e.target.value })}
            placeholder="Votre prénom"
            className="w-full border border-gray-200 rounded-[6px] px-4 py-3 text-sm outline-none focus:border-primary transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">Nom</label>
          <input
            type="text"
            value={profil.nom ?? ''}
            onChange={(e) => setProfil({ ...profil, nom: e.target.value })}
            placeholder="Votre nom"
            className="w-full border border-gray-200 rounded-[6px] px-4 py-3 text-sm outline-none focus:border-primary transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">
            Numéro WhatsApp
          </label>
          <input
            type="tel"
            value={profil.telephone ?? ''}
            onChange={(e) => setProfil({ ...profil, telephone: e.target.value })}
            placeholder="+230 5XXX XXXX"
            className="w-full border border-gray-200 rounded-[6px] px-4 py-3 text-sm outline-none focus:border-primary transition-colors"
          />
          <p className="text-text-muted text-xs mt-1 px-1">
            Ce numéro sera utilisé pour les contacts WhatsApp sur vos annonces.
          </p>
        </div>

        {erreur && <p className="text-red-500 text-sm px-1">{erreur}</p>}
        {succes && <p className="text-green-600 text-sm px-1">Profil mis à jour ✓</p>}

        <button
          type="submit"
          disabled={sauvegarde}
          style={{ width:'100%', background:'#404040', color:'#FFFFFF', fontWeight:600, padding:'14px 0', borderRadius:6, fontSize:14, border:'none', cursor:'pointer', opacity: sauvegarde ? 0.5 : 1 }}
        >
          {sauvegarde ? '...' : 'Sauvegarder'}
        </button>
      </form>
    </div>
  )
}
