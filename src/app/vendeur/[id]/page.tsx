import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import type { Profile, Listing } from '@/lib/supabase'
import VendeurPageContent from '@/components/VendeurPageContent'

interface Avis {
  id: string
  acheteur_id: string
  note: number
  commentaire: string | null
  created_at: string
  prenom?: string
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { global: { fetch: (url, opts) => fetch(url as string, { ...(opts as RequestInit), cache: 'no-store' }) } }
)

export default async function VendeurPage({ params }: { params: { id: string } }) {
  const [profilRes, avisRes, listingsRes] = await Promise.all([
    supabase.from('profiles').select('id, prenom, nom, telephone, avatar_url, created_at').eq('id', params.id).single(),
    supabase.from('avis').select('*').eq('vendeur_id', params.id).order('created_at', { ascending: false }),
    supabase.from('listings').select('*').eq('user_id', params.id).eq('actif', true).order('created_at', { ascending: false }).limit(30),
  ])

  if (profilRes.error || !profilRes.data) notFound()

  const profil = profilRes.data as Profile
  let avis: Avis[] = avisRes.data ?? []
  const listings: Listing[] = (listingsRes.data ?? []) as Listing[]

  // Enrichit les avis avec le prénom de l'acheteur
  const ids = [...new Set(avis.map(a => a.acheteur_id))]
  if (ids.length > 0) {
    const { data: profils } = await supabase.from('profiles').select('id, prenom').in('id', ids)
    const map = Object.fromEntries((profils ?? []).map(p => [p.id, p.prenom]))
    avis = avis.map(a => ({ ...a, prenom: map[a.acheteur_id] ?? undefined }))
  }

  return <VendeurPageContent profil={profil} avis={avis} listings={listings} />
}
