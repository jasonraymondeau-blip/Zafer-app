'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Heart } from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'

interface FavoriButtonProps {
  listingId: string
  // 'sm' pour ListingCard, 'md' pour la page détail
  size?: 'sm' | 'md'
  className?: string
}

export default function FavoriButton({ listingId, size = 'sm', className = '' }: FavoriButtonProps) {
  const supabase = createClient()
  const router = useRouter()

  const [estFavori, setEstFavori] = useState(false)
  const [count, setCount] = useState(0)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Vérifie l'auth, l'état favori et charge le compteur au montage
  useEffect(() => {
    // Compteur visible par tous — pas besoin d'être connecté
    supabase
      .from('favoris')
      .select('*', { count: 'exact', head: true })
      .eq('listing_id', listingId)
      .then(({ count: c }) => setCount(c ?? 0))

    // État favori personnel si connecté
    supabase.auth.getSession().then(async ({ data }) => {
      const uid = data.session?.user?.id ?? null
      setUserId(uid)

      if (uid) {
        const { data: favori } = await supabase
          .from('favoris')
          .select('id')
          .eq('user_id', uid)
          .eq('listing_id', listingId)
          .maybeSingle()

        setEstFavori(!!favori)
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingId])

  async function handleToggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    // Non connecté → page compte
    if (!userId) {
      router.push(`/compte?redirect=/annonce/${listingId}`)
      return
    }

    setLoading(true)

    if (estFavori) {
      await supabase.from('favoris').delete().eq('user_id', userId).eq('listing_id', listingId)
      setEstFavori(false)
      setCount((c) => Math.max(0, c - 1))
    } else {
      await supabase.from('favoris').insert({ user_id: userId, listing_id: listingId })
      setEstFavori(true)
      setCount((c) => c + 1)
    }

    setLoading(false)
  }

  const iconSize = size === 'md' ? 'w-5 h-5' : 'w-4 h-4'
  const btnSize = size === 'md' ? 'p-2' : 'p-1.5'
  const textSize = size === 'md' ? 'text-xs' : 'text-[10px]'

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      aria-label={estFavori ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      className={`flex items-center gap-1 bg-white rounded-full ${btnSize} shadow transition-transform active:scale-90 disabled:opacity-50 ${className}`}
    >
      <Heart
        className={`${iconSize} transition-colors`}
        style={estFavori ? { fill: '#b85c38', color: '#b85c38' } : { color: '#AAAAAA' }}
      />
      {count > 0 && (
        <span
          className={`${textSize} font-semibold leading-none`}
          style={{ color: estFavori ? '#b85c38' : '#888888' }}
        >
          {count}
        </span>
      )}
    </button>
  )
}
