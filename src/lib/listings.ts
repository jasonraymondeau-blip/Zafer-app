import { createClient } from '@supabase/supabase-js'
import type { Listing, Profile } from './supabase'

// Client Supabase pour les Server Components — cache désactivé pour données fraîches
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    global: {
      fetch: (url, options) => fetch(url, { ...options, cache: 'no-store' }),
    },
  }
)

// Récupère toutes les annonces actives, triées par date décroissante
export async function getListings(options?: {
  categorie?: string
  sous_categorie?: string
  q?: string
  limit?: number
  // Filtres prix
  prix_min?: number
  prix_max?: number
  // Filtres véhicule
  km_min?: number
  km_max?: number
  boite_vitesse?: string
  carburant?: string
  annee_min?: number          // année mini (voiture)
  annee_max?: number          // année maxi (voiture)
  // Filtres location professionnelle
  location_type?: string      // 'court' | 'long'
  vehicule_type?: string      // 'voiture' | 'moto' | 'scooter'
  // Filtres immobilier
  type_bien?: string
  surface_min?: number
  surface_max?: number
  meuble?: string             // 'oui' | 'non'
  nb_chambres?: string        // '1' | '2' | '3' | '4+'
  ville?: string
  type_transaction?: string   // 'vente' | 'location'
  // Filtre maison
  etat?: string
  piece?: string              // pièce pour ameublement
  type_electromenager?: string // type pour électroménager
  // Géolocalisation
  lat?: number
  lng?: number
  // Pagination
  offset?: number
}): Promise<Listing[]> {
  let query = supabase
    .from('listings')
    .select('*')
    .eq('actif', true)
    .order('created_at', { ascending: false })

  if (options?.categorie) query = query.eq('categorie', options.categorie)
  if (options?.sous_categorie) query = query.ilike('sous_categorie', options.sous_categorie)
  if (options?.q) query = query.ilike('titre', `%${options.q}%`)
  // Utilise range() si offset est fourni, sinon limit() simple
  if (options?.offset !== undefined) {
    const limit = options.limit ?? 20
    query = query.range(options.offset, options.offset + limit - 1)
  } else if (options?.limit) {
    query = query.limit(options.limit)
  }
  if (options?.prix_min) query = query.gte('prix', options.prix_min)
  if (options?.prix_max) query = query.lte('prix', options.prix_max)
  if (options?.km_min) query = query.gte('kilometrage', options.km_min)
  if (options?.km_max) query = query.lte('kilometrage', options.km_max)
  if (options?.boite_vitesse) query = query.eq('boite_vitesse', options.boite_vitesse)
  // Carburant — multi-valeurs comma-separated (ex: "essence,diesel")
  if (options?.carburant) {
    const vals = options.carburant.split(',').filter(Boolean)
    if (vals.length === 1) query = query.eq('carburant', vals[0])
    else query = query.in('carburant', vals)
  }
  if (options?.annee_min) query = query.gte('annee', options.annee_min)
  if (options?.annee_max) query = query.lte('annee', options.annee_max)
  if (options?.location_type) query = query.eq('location_type', options.location_type)
  if (options?.vehicule_type) query = query.eq('vehicule_type', options.vehicule_type)
  // Type de bien — multi-valeurs
  if (options?.type_bien) {
    const vals = options.type_bien.split(',').filter(Boolean)
    if (vals.length === 1) query = query.eq('type_bien', vals[0])
    else query = query.in('type_bien', vals)
  }
  if (options?.surface_min) query = query.gte('surface', options.surface_min)
  if (options?.surface_max) query = query.lte('surface', options.surface_max)
  // État — multi-valeurs
  if (options?.etat) {
    const vals = options.etat.split(',').filter(Boolean)
    if (vals.length === 1) query = query.eq('etat', vals[0])
    else query = query.in('etat', vals)
  }
  // Pièce — multi-valeurs
  if (options?.piece) {
    const vals = options.piece.split(',').filter(Boolean)
    if (vals.length === 1) query = query.eq('piece', vals[0])
    else query = query.in('piece', vals)
  }
  // Type électroménager — multi-valeurs
  if (options?.type_electromenager) {
    const vals = options.type_electromenager.split(',').filter(Boolean)
    if (vals.length === 1) query = query.eq('type_electromenager', vals[0])
    else query = query.in('type_electromenager', vals)
  }
  // Géolocalisation — bounding box ~10 km autour de la position
  if (options?.lat && options?.lng) {
    const delta = 10 / 111 // 10 km en degrés (1 degré ≈ 111 km)
    query = query
      .gte('localisation_lat', options.lat - delta)
      .lte('localisation_lat', options.lat + delta)
      .gte('localisation_lng', options.lng - delta)
      .lte('localisation_lng', options.lng + delta)
  }
  if (options?.meuble === 'oui') query = query.eq('meuble', true)
  else if (options?.meuble === 'non') query = query.eq('meuble', false)
  // Chambres — multi-valeurs, gère le cas spécial '4+'
  if (options?.nb_chambres) {
    const vals = options.nb_chambres.split(',').filter(Boolean)
    const has4plus = vals.includes('4+')
    const numVals = vals.filter((v) => v !== '4+').map(Number)
    if (has4plus && numVals.length === 0) {
      query = query.gte('nb_chambres', 4)
    } else if (!has4plus && numVals.length === 1) {
      query = query.eq('nb_chambres', numVals[0])
    } else if (!has4plus && numVals.length > 1) {
      query = query.in('nb_chambres', numVals)
    } else if (has4plus && numVals.length > 0) {
      // Combine: nb_chambres IN (1,2,3) OR nb_chambres >= 4
      query = query.or(`nb_chambres.gte.4,nb_chambres.in.(${numVals.join(',')})`)
    }
  }
  if (options?.ville) query = query.ilike('ville', `%${options.ville}%`)
  if (options?.type_transaction === 'vente') query = query.ilike('sous_categorie', 'vente')
  else if (options?.type_transaction === 'location') query = query.ilike('sous_categorie', 'location')

  const { data, error } = await query

  if (error) {
    console.error('Erreur chargement annonces:', error)
    return []
  }

  return data as Listing[]
}

// Récupère le profil d'un vendeur par son user_id
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, prenom, nom, telephone, avatar_url, created_at')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Erreur chargement profil vendeur:', error)
    return null
  }

  return data as Profile
}

// Récupère une annonce par son id
export async function getListing(id: string): Promise<Listing | null> {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('id', id)
    .eq('actif', true)
    .single()

  if (error) {
    console.error('Erreur chargement annonce:', error)
    return null
  }

  return data as Listing
}
