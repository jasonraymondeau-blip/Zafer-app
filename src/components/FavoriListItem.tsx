'use client'

import Link from 'next/link'
import { Heart } from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import type { Listing } from '@/lib/supabase'

interface FavoriListItemProps {
  annonce: Listing
  userId: string
  // Callback pour retirer l'item de la liste parente après suppression
  onRetirer: (id: string) => void
}

export default function FavoriListItem({ annonce, userId, onRetirer }: FavoriListItemProps) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  // Formate la date en "il y a X jours" ou "aujourd'hui"
  function formatDate(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const jours = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (jours === 0) return "Aujourd'hui"
    if (jours === 1) return 'Hier'
    return `Il y a ${jours} jours`
  }

  async function handleRetirer(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setLoading(true)

    await supabase
      .from('favoris')
      .delete()
      .eq('user_id', userId)
      .eq('listing_id', annonce.id)

    onRetirer(annonce.id)
    setLoading(false)
  }

  const photoUrl = annonce.photos?.[0] ?? null

  return (
    <Link
      href={`/annonce/${annonce.id}`}
      className="flex items-center gap-3 bg-white rounded-[12px] border border-gray-100 p-3 active:bg-gray-50 transition-colors"
    >
      {/* Miniature 100×100 */}
      <div className="w-[100px] h-[100px] rounded-[10px] overflow-hidden bg-gray-100 shrink-0">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt={annonce.titre}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">
            📷
          </div>
        )}
      </div>

      {/* Infos au centre — flex-1 pour prendre l'espace restant */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-text-main text-sm leading-snug line-clamp-2">
          {annonce.titre}
        </p>
        <p style={{ fontSize: 15, fontWeight: 500, color: '#404040', marginTop: 4 }}>
          Rs {annonce.prix.toLocaleString('fr-FR')}
        </p>
        <div className="flex items-center gap-1.5 mt-1">
          {annonce.ville && (
            <span className="text-text-muted text-xs">{annonce.ville}</span>
          )}
          {annonce.ville && (
            <span className="text-text-muted text-xs">·</span>
          )}
          <span className="text-text-muted text-xs">{formatDate(annonce.created_at)}</span>
        </div>
      </div>

      {/* Bouton ❤️ rouge pour retirer */}
      <button
        onClick={handleRetirer}
        disabled={loading}
        aria-label="Retirer des favoris"
        className="shrink-0 p-2 rounded-full hover:bg-red-50 transition-colors disabled:opacity-50"
      >
        <Heart className="w-5 h-5 fill-red-500 text-red-500" />
      </button>
    </Link>
  )
}
