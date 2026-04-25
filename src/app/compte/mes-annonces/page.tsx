'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Pencil } from 'lucide-react'
import { Eye, EyeOff, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'
import { formatPrix, formatDate } from '@/lib/mock-data'
import type { Listing } from '@/lib/supabase'

export default function MesAnnoncesPage() {
  const supabase = createClient()
  const router = useRouter()

  const [annonces, setAnnonces] = useState<Listing[]>([])
  const [chargement, setChargement] = useState(true)
  // Suivi des annonces en cours de traitement (pour éviter double-clic)
  const [enCours, setEnCours] = useState<Set<string>>(new Set())

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const user = data.session?.user
      if (!user) {
        router.replace('/compte')
        return
      }

      const { data: listings } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(200)

      setAnnonces((listings as Listing[]) ?? [])
      setChargement(false)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Toggle actif / inactif ────────────────────────────────────────────────
  async function toggleActif(annonce: Listing) {
    if (enCours.has(annonce.id)) return

    // Confirmation uniquement pour la désactivation
    if (annonce.actif) {
      const ok = window.confirm('Masquer cette annonce ? Elle ne sera plus visible par les acheteurs.')
      if (!ok) return
    }

    setEnCours((prev) => new Set(prev).add(annonce.id))

    const { error } = await supabase
      .from('listings')
      .update({ actif: !annonce.actif })
      .eq('id', annonce.id)

    if (!error) {
      setAnnonces((prev) =>
        prev.map((a) => a.id === annonce.id ? { ...a, actif: !annonce.actif } : a)
      )
    }

    setEnCours((prev) => { const s = new Set(prev); s.delete(annonce.id); return s })
  }

  // ── Suppression avec photos Storage ──────────────────────────────────────
  async function supprimerAnnonce(annonce: Listing) {
    const ok = window.confirm('Supprimer définitivement cette annonce ? Cette action est irréversible.')
    if (!ok) return

    setEnCours((prev) => new Set(prev).add(annonce.id))

    // Supprime les photos (R2 pour les nouvelles, Supabase Storage pour les anciennes)
    if (annonce.photos && annonce.photos.length > 0) {
      const photosR2 = annonce.photos.filter(u => u.includes('r2.dev') || u.includes('zafer.mu'))
      const photosSupabase = annonce.photos.filter(u => u.includes('supabase.co'))

      if (photosR2.length > 0) {
        await fetch('/api/upload/delete', {
          method: 'DELETE',
          body: JSON.stringify({ urls: photosR2 }),
          headers: { 'content-type': 'application/json' },
        })
      }

      if (photosSupabase.length > 0) {
        const chemins = photosSupabase
          .map(url => { const m = url.match(/annonces-photos\/(.+)$/); return m ? m[1] : null })
          .filter(Boolean) as string[]
        if (chemins.length > 0) await supabase.storage.from('annonces-photos').remove(chemins)
      }
    }

    // Supprime l'annonce en base
    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', annonce.id)

    if (!error) {
      setAnnonces((prev) => prev.filter((a) => a.id !== annonce.id))
    }

    setEnCours((prev) => { const s = new Set(prev); s.delete(annonce.id); return s })
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
      {/* Header */}
      <header className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-gray-100">
        <button onClick={() => router.back()} className="p-1 -ml-1">
          <ArrowLeft className="w-5 h-5 text-text-main" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-text-main">Mes annonces</h1>
          {annonces.length > 0 && (
            <p className="text-text-muted text-xs">{annonces.length} annonce{annonces.length > 1 ? 's' : ''}</p>
          )}
        </div>
      </header>

      {annonces.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
          <p className="text-5xl mb-4">📋</p>
          <p className="font-semibold text-text-main text-lg">Aucune annonce</p>
          <p className="text-text-muted text-sm mt-2 mb-6">
            Vous n&apos;avez pas encore déposé d&apos;annonce
          </p>
          <Link
            href="/vendre"
            className="bg-primary text-white font-semibold px-6 py-3 rounded-[6px] text-sm"
          >
            Déposer une annonce
          </Link>
        </div>
      ) : (
        <div className="px-4 py-4 flex flex-col gap-3">
          {annonces.map((annonce) => (
            <div
              key={annonce.id}
              className="bg-white rounded-[6px] overflow-hidden shadow-sm border border-gray-100"
            >
              {/* Ligne principale — cliquable vers le détail */}
              <Link
                href={`/annonce/${annonce.id}`}
                className="flex gap-3 p-3 block"
              >
                {/* Miniature */}
                <div className="w-20 h-20 rounded-[6px] overflow-hidden bg-card flex-shrink-0">
                  {annonce.photos?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={annonce.photos[0]}
                      alt={annonce.titre}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">
                      {annonce.categorie === 'vehicule' ? '🚗' : annonce.categorie === 'immobilier' ? '🏠' : '🛋️'}
                    </div>
                  )}
                </div>

                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: 14, fontWeight: 500, color: '#404040' }}>{formatPrix(annonce.prix)}</p>
                  <p className="text-text-main text-sm mt-0.5 line-clamp-1">{annonce.titre}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-text-muted flex-shrink-0" />
                    <span className="text-text-muted text-xs truncate">
                      {annonce.ville || 'Maurice'} · {formatDate(annonce.created_at)}
                    </span>
                  </div>
                  {/* Badge statut */}
                  <span className={`inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full ${
                    annonce.actif ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {annonce.actif ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </Link>

              {/* Barre d'actions — séparée du lien */}
              <div className="flex items-center border-t border-gray-100">

                {/* Modifier */}
                <Link
                  href={`/compte/mes-annonces/${annonce.id}/modifier`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-text-muted hover:text-text-main transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Modifier
                </Link>

                <div className="w-px h-5 bg-gray-100" />

                {/* Toggle actif / inactif */}
                <button
                  onClick={() => toggleActif(annonce)}
                  disabled={enCours.has(annonce.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-text-muted hover:text-text-main transition-colors disabled:opacity-40"
                >
                  {annonce.actif
                    ? <EyeOff className="w-3.5 h-3.5" />
                    : <Eye className="w-3.5 h-3.5" />
                  }
                  {annonce.actif ? 'Masquer' : 'Activer'}
                </button>

                <div className="w-px h-5 bg-gray-100" />

                {/* Supprimer */}
                <button
                  onClick={() => supprimerAnnonce(annonce)}
                  disabled={enCours.has(annonce.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-red-400 hover:text-red-600 transition-colors disabled:opacity-40"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Supprimer
                </button>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
