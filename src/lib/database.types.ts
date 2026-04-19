// Types manuels compatibles avec @supabase/supabase-js 2.x
export type Database = {
  public: {
    Tables: {
      listings: {
        Row: {
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
          boite_vitesse: 'automatique' | 'manuelle' | null
          kilometrage: number | null
          carburant: 'essence' | 'diesel' | 'hybride' | 'électrique' | null
          annee: number | null
          type_bien: 'maison' | 'appartement' | 'commerce' | null
          surface: number | null
          etat: 'neuf' | 'bon état' | 'à réparer' | null
          meuble: boolean | null
          nb_chambres: number | null
          location_type: 'court' | 'long' | null
          vehicule_type: 'voiture' | 'moto' | 'scooter' | null
          piece: string | null
          type_electromenager: string | null
        }
        Insert: {
          id?: string
          user_id: string
          titre: string
          description?: string | null
          prix: number
          categorie: 'vehicule' | 'immobilier' | 'maison'
          sous_categorie: string
          ville?: string | null
          localisation_lat?: number | null
          localisation_lng?: number | null
          photos?: string[]
          actif?: boolean
          created_at?: string
          boite_vitesse?: 'automatique' | 'manuelle' | null
          kilometrage?: number | null
          carburant?: 'essence' | 'diesel' | 'hybride' | 'électrique' | null
          annee?: number | null
          type_bien?: 'maison' | 'appartement' | 'commerce' | null
          surface?: number | null
          etat?: 'neuf' | 'bon état' | 'à réparer' | null
          meuble?: boolean | null
          nb_chambres?: number | null
          location_type?: 'court' | 'long' | null
          vehicule_type?: 'voiture' | 'moto' | 'scooter' | null
          piece?: string | null
          type_electromenager?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          titre?: string
          description?: string | null
          prix?: number
          categorie?: 'vehicule' | 'immobilier' | 'maison'
          sous_categorie?: string
          ville?: string | null
          localisation_lat?: number | null
          localisation_lng?: number | null
          photos?: string[]
          actif?: boolean
          created_at?: string
          boite_vitesse?: 'automatique' | 'manuelle' | null
          kilometrage?: number | null
          carburant?: 'essence' | 'diesel' | 'hybride' | 'électrique' | null
          annee?: number | null
          type_bien?: 'maison' | 'appartement' | 'commerce' | null
          surface?: number | null
          etat?: 'neuf' | 'bon état' | 'à réparer' | null
          meuble?: boolean | null
          nb_chambres?: number | null
          location_type?: 'court' | 'long' | null
          vehicule_type?: 'voiture' | 'moto' | 'scooter' | null
          piece?: string | null
          type_electromenager?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          prenom: string | null
          nom: string | null
          telephone: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          prenom?: string | null
          nom?: string | null
          telephone?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          prenom?: string | null
          nom?: string | null
          telephone?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Relationships: []
      }
      favoris: {
        Row: {
          id: string
          user_id: string
          listing_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          listing_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          listing_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "favoris_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
