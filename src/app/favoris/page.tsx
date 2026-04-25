'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase-browser'
import FavoriListItem from '@/components/FavoriListItem'
import type { Listing } from '@/lib/supabase'

export default function FavorisPage() {
  const supabase = createClient()
  const router = useRouter()

  const [user, setUser] = useState<User | null>(null)
  const [favoris, setFavoris] = useState<Listing[]>([])
  const [chargement, setChargement] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const currentUser = data.session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        chargerFavoris(currentUser.id)
      } else {
        // Redirection directe vers la connexion avec retour sur /favoris
        router.replace('/compte?redirect=/favoris')
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function chargerFavoris(userId: string) {
    const { data, error } = await supabase
      .from('favoris')
      .select('listing_id, listings(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (!error && data) {
      // Extrait les objets listing depuis le join
      const annonces = data
        .map((f) => (Array.isArray(f.listings) ? f.listings[0] : f.listings))
        .filter(Boolean) as Listing[]
      setFavoris(annonces)
    }
    setChargement(false)
  }

  if (chargement) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }


  return (
    <div className="max-w-lg mx-auto pb-24">
      <header className="px-4 pb-3 border-b border-gray-100" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}>
        <h1 className="text-lg font-bold text-text-main">Mes favoris</h1>
        {favoris.length > 0 && (
          <p className="text-text-muted text-xs mt-0.5">{favoris.length} annonce{favoris.length > 1 ? 's' : ''}</p>
        )}
      </header>

      {favoris.length === 0 ? (
        // État vide — style inspiré screenshot
        <div className="flex flex-col items-center justify-center px-8 text-center" style={{ paddingTop: 80 }}>
          <svg viewBox="0 0 24 24" style={{ width: 28, height: 28, fill: '#404040', marginBottom: 20 }}>
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <p style={{ fontSize: 26, fontWeight: 500, color: '#404040', lineHeight: 1.25, marginBottom: 12 }}>
            Votre liste de favoris est vide
          </p>
          <p style={{ fontSize: 15, color: '#888888', lineHeight: 1.5, marginBottom: 40 }}>
            Ajoutez vos coups de cœur pour ne plus jamais les perdre&nbsp;!
          </p>
          <Link
            href="/"
            style={{
              display: 'block',
              width: '100%',
              background: '#404040',
              color: '#FFFFFF',
              fontWeight: 600,
              fontSize: 15,
              textAlign: 'center',
              padding: '16px 0',
              borderRadius: 6,
              textDecoration: 'none',
            }}
          >
            Parcourir les annonces
          </Link>
        </div>
      ) : (
        // Liste des favoris — 1 colonne comme Vinted
        <div className="px-4 py-4 flex flex-col gap-3">
          {favoris.map((annonce) => (
            <FavoriListItem
              key={annonce.id}
              annonce={annonce}
              userId={user!.id}
              onRetirer={(id) => setFavoris((prev) => prev.filter((f) => f.id !== id))}
            />
          ))}
        </div>
      )}
    </div>
  )
}
