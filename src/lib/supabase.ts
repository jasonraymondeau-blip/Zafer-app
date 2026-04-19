import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

// Types pour la base de données Zafer
export type Listing = {
  id: string
  user_id: string
  titre: string
  description: string | null
  prix: number
  categorie: 'vehicule' | 'immobilier' | 'maison'
  sous_categorie: string
  ville: string | null
  localisation_lat: number | null
  localisation_lng: number | null
  photos: string[]
  actif: boolean
  created_at: string
  // Véhicule
  boite_vitesse: 'automatique' | 'manuelle' | null
  kilometrage: number | null
  carburant: 'essence' | 'diesel' | 'hybride' | 'électrique' | null
  annee: number | null
  // Location professionnelle
  location_type: 'court' | 'long' | null
  vehicule_type: 'voiture' | 'moto' | 'scooter' | null
  // Immobilier
  type_bien: 'maison' | 'appartement' | 'commerce' | null
  surface: number | null
  // Maison/équipement
  etat: 'neuf' | 'bon état' | 'à réparer' | null
  piece: string | null
  type_electromenager: string | null
  // Immobilier — champs supplémentaires
  meuble: boolean | null
  nb_chambres: number | null
}

export type Profile = {
  id: string
  prenom: string | null
  nom: string | null
  telephone: string | null
  avatar_url: string | null
  created_at: string
}

export type Favori = {
  id: string
  user_id: string
  listing_id: string
  created_at: string
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
