import SearchModal from '@/components/SearchModal'
import FilterSheet from '@/components/FilterSheet'
import CategoryModal from '@/components/CategoryModal'
import BoutonRetour from '@/components/BoutonRetour'
import ResultatsInfinisGrid from '@/components/ResultatsInfinisGrid'
import SearchTracker from '@/components/SearchTracker'
import { getListings } from '@/lib/listings'

// Forcer le rendu dynamique pour toujours avoir les données fraîches
export const dynamic = 'force-dynamic'

interface RecherchePageProps {
  searchParams: {
    q?: string
    categorie?: string
    sous_categorie?: string
    prix_min?: string
    prix_max?: string
    km_min?: string
    km_max?: string
    boite_vitesse?: string
    carburant?: string
    annee_min?: string
    annee_max?: string
    location_type?: string
    vehicule_type?: string
    type_bien?: string
    surface_min?: string
    surface_max?: string
    etat?: string
    piece?: string
    type_electromenager?: string
    meuble?: string
    nb_chambres?: string
    ville?: string
    type_transaction?: string
    lat?: string
    lng?: string
  }
}


export default async function RecherchePage({ searchParams }: RecherchePageProps) {
  const {
    q = '',
    categorie = '',
    sous_categorie = '',
    prix_min,
    prix_max,
    km_min,
    km_max,
    boite_vitesse,
    carburant,
    annee_min,
    annee_max,
    location_type,
    vehicule_type,
    type_bien,
    surface_min,
    surface_max,
    etat,
    piece,
    type_electromenager,
    meuble,
    nb_chambres,
    ville,
    type_transaction,
    lat,
    lng,
  } = searchParams

  // Récupère la première page de résultats (20 annonces)
  const resultats = await getListings({
    categorie:           categorie || undefined,
    sous_categorie:      sous_categorie || undefined,
    q:                   q || undefined,
    prix_min:            prix_min ? Number(prix_min) : undefined,
    prix_max:            prix_max ? Number(prix_max) : undefined,
    km_min:              km_min ? Number(km_min) : undefined,
    km_max:              km_max ? Number(km_max) : undefined,
    boite_vitesse:       boite_vitesse || undefined,
    carburant:           carburant || undefined,
    annee_min:           annee_min ? Number(annee_min) : undefined,
    annee_max:           annee_max ? Number(annee_max) : undefined,
    location_type:       location_type || undefined,
    vehicule_type:       vehicule_type || undefined,
    type_bien:           type_bien || undefined,
    surface_min:         surface_min ? Number(surface_min) : undefined,
    surface_max:         surface_max ? Number(surface_max) : undefined,
    etat:                etat || undefined,
    piece:               piece || undefined,
    type_electromenager: type_electromenager || undefined,
    meuble:              meuble || undefined,
    nb_chambres:         nb_chambres || undefined,
    ville:               ville || undefined,
    type_transaction:    type_transaction || undefined,
    lat:                 lat ? Number(lat) : undefined,
    lng:                 lng ? Number(lng) : undefined,
    limit: 20,
    offset: 0,
  })

  // Valeurs actuelles des filtres passées au FilterSheet
  const currentFilters = {
    prix_min:            prix_min ?? '',
    prix_max:            prix_max ?? '',
    km_min:              km_min ?? '',
    km_max:              km_max ?? '',
    boite_vitesse:       boite_vitesse ?? '',
    carburant:           carburant ?? '',
    annee_min:           annee_min ?? '',
    annee_max:           annee_max ?? '',
    location_type:       location_type ?? '',
    vehicule_type:       vehicule_type ?? '',
    type_bien:           type_bien ?? '',
    surface_min:         surface_min ?? '',
    surface_max:         surface_max ?? '',
    etat:                etat ?? '',
    piece:               piece ?? '',
    type_electromenager: type_electromenager ?? '',
    meuble:              meuble ?? '',
    nb_chambres:         nb_chambres ?? '',
    ville:               ville ?? '',
    type_transaction:    type_transaction ?? '',
    lat:                 lat ?? '',
    lng:                 lng ?? '',
  }

  return (
    <div className="max-w-lg mx-auto">

      {/* Sauvegarde la catégorie en localStorage pour la section personnalisée de l'accueil */}
      <SearchTracker categorie={categorie || undefined} />

      {/* Header — titre + flèche retour + barre recherche */}
      <header className="sticky top-0 bg-white z-40 px-4 pt-4 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <BoutonRetour />
          <div className="flex-1">
            <SearchModal />
          </div>
        </div>
      </header>

      {/* Filtres */}
      <div className="px-4 pt-4 pb-4 mt-2 border-b border-gray-100 flex items-center justify-between gap-2">
        <p style={{ fontSize: 12, color: '#888888' }}>
          {resultats.length} annonce{resultats.length !== 1 ? 's' : ''}
          {q ? ` · "${q}"` : ''}
        </p>

        <div className="flex items-center gap-2 flex-shrink-0">
          {categorie && (
            <CategoryModal
              categorie={categorie}
              sousCategorie={sous_categorie}
              q={q}
            />
          )}
          <FilterSheet
            categorie={categorie}
            sousCategorie={sous_categorie}
            q={q}
            current={currentFilters}
          />
        </div>
      </div>

      {/* Résultats — grille 2 colonnes + scroll infini */}
      {/* La clé force un re-mount complet à chaque changement de filtres */}
      <div className="px-3 pt-4 pb-28">
        <ResultatsInfinisGrid
          key={[categorie, sous_categorie, q, prix_min, prix_max, km_min, km_max,
            boite_vitesse, carburant, annee_min, annee_max, etat, piece,
            type_electromenager, location_type, vehicule_type, type_bien,
            surface_min, surface_max, meuble, nb_chambres, ville,
            type_transaction, lat, lng].join('|')}
          initial={resultats}
          filters={{
            categorie:           categorie || undefined,
            sous_categorie:      sous_categorie || undefined,
            q:                   q || undefined,
            prix_min:            prix_min || undefined,
            prix_max:            prix_max || undefined,
            km_min:              km_min || undefined,
            km_max:              km_max || undefined,
            boite_vitesse:       boite_vitesse || undefined,
            carburant:           carburant || undefined,
            annee_min:           annee_min || undefined,
            annee_max:           annee_max || undefined,
            location_type:       location_type || undefined,
            vehicule_type:       vehicule_type || undefined,
            type_bien:           type_bien || undefined,
            surface_min:         surface_min || undefined,
            surface_max:         surface_max || undefined,
            etat:                etat || undefined,
            piece:               piece || undefined,
            type_electromenager: type_electromenager || undefined,
            meuble:              meuble || undefined,
            nb_chambres:         nb_chambres || undefined,
            ville:               ville || undefined,
            type_transaction:    type_transaction || undefined,
            lat:                 lat || undefined,
            lng:                 lng || undefined,
          }}
        />
      </div>

    </div>
  )
}
