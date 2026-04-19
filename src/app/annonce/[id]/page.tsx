import { notFound } from 'next/navigation'
import dynamic from 'next/dynamic'
import { MapPin, Calendar } from 'lucide-react'
import { getListing, getProfile } from '@/lib/listings'
import { formatPrix, formatDate } from '@/lib/mock-data'
import { getCoordsVille } from '@/lib/cities'
import AnnonceHero from '@/components/AnnonceHero'
import FavoriButton from '@/components/FavoriButton'
import BoutonRetour from '@/components/BoutonRetour'
import BoutonPartage from '@/components/BoutonPartage'

// Import dynamique pour éviter les erreurs SSR de Leaflet
const MapAnnonce = dynamic(() => import('@/components/MapAnnonce'), { ssr: false })

interface AnnoncePageProps {
  params: { id: string }
}

const categorieLabels: Record<string, string> = {
  vehicule: 'Véhicule',
  immobilier: 'Immobilier',
  maison: 'Maison',
}

export default async function AnnoncePage({ params }: AnnoncePageProps) {
  const annonce = await getListing(params.id)
  if (!annonce) notFound()

  // Fetch du profil vendeur pour récupérer son numéro et son prénom
  const vendeur = await getProfile(annonce.user_id)

  const whatsappMessage = encodeURIComponent(
    `Bonjour, je suis intéressé(e) par votre annonce "${annonce.titre}" sur Zafer.`
  )
  // Utilise le vrai numéro du vendeur, sinon désactive le bouton
  const telephone = vendeur?.telephone?.replace(/\s+/g, '') ?? null
  const whatsappUrl = telephone
    ? `https://wa.me/${telephone}?text=${whatsappMessage}`
    : null

  // "Membre depuis" basé sur la date réelle du profil
  const membreSince = vendeur?.created_at
    ? new Date(vendeur.created_at).getFullYear()
    : null

  return (
    <div className="max-w-lg mx-auto relative">

      {/* Carrousel photos + badge VENDU + bouton propriétaire */}
      <div className="relative">
        <AnnonceHero
          photos={annonce.photos}
          titre={annonce.titre}
          categorie={annonce.categorie}
          initialActif={annonce.actif}
        />
        <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
          <BoutonRetour />
          <div className="flex gap-2">
            <BoutonPartage titre={annonce.titre} prix={formatPrix(annonce.prix)} />
            <FavoriButton listingId={annonce.id} size="md" />
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="px-4 pt-4 pb-32">
        <p style={{ fontSize: 22, fontWeight: 500, color: '#404040' }}>Rs {annonce.prix.toLocaleString('fr-FR')}</p>
        <h1 className="text-lg font-bold text-text-main mt-1">{annonce.titre}</h1>

        <div className="flex items-center gap-3 mt-2 text-text-muted text-sm">
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>{annonce.ville || 'Maurice'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(annonce.created_at)}</span>
          </div>
        </div>

        {/* Informations clés */}
        <div className="mt-4 bg-card rounded-[6px] p-4">
          <h2 className="font-semibold text-text-main text-sm mb-3">Informations clés</h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-text-muted">Catégorie</span>
              <p className="font-medium">{categorieLabels[annonce.categorie]}</p>
            </div>
            <div>
              <span className="text-text-muted">Sous-catégorie</span>
              <p className="font-medium">{annonce.sous_categorie}</p>
            </div>
            {annonce.kilometrage && (
              <div>
                <span className="text-text-muted">Kilométrage</span>
                <p className="font-medium">{annonce.kilometrage.toLocaleString()} km</p>
              </div>
            )}
            {annonce.boite_vitesse && (
              <div>
                <span className="text-text-muted">Boîte</span>
                <p className="font-medium capitalize">{annonce.boite_vitesse}</p>
              </div>
            )}
            {annonce.carburant && (
              <div>
                <span className="text-text-muted">Carburant</span>
                <p className="font-medium capitalize">{annonce.carburant}</p>
              </div>
            )}
            {annonce.type_bien && (
              <div>
                <span className="text-text-muted">Type de bien</span>
                <p className="font-medium capitalize">{annonce.type_bien}</p>
              </div>
            )}
            {annonce.surface && (
              <div>
                <span className="text-text-muted">Surface</span>
                <p className="font-medium">{annonce.surface} m²</p>
              </div>
            )}
            {annonce.nb_chambres != null && (
              <div>
                <span className="text-text-muted">Chambres</span>
                <p className="font-medium">{annonce.nb_chambres}</p>
              </div>
            )}
            {annonce.meuble != null && (
              <div>
                <span className="text-text-muted">Meublé</span>
                <p className="font-medium">{annonce.meuble ? 'Oui' : 'Non'}</p>
              </div>
            )}
            {annonce.etat && (
              <div>
                <span className="text-text-muted">État</span>
                <p className="font-medium capitalize">{annonce.etat}</p>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {annonce.description && (
          <div className="mt-4">
            <h2 className="font-semibold text-text-main text-sm mb-2">Description</h2>
            <p className="text-text-main text-base leading-relaxed">{annonce.description}</p>
          </div>
        )}

        {/* Carte Leaflet — coordonnées GPS ou fallback par nom de ville */}
        {(() => {
          const lat = annonce.localisation_lat ?? getCoordsVille(annonce.ville)?.lat
          const lng = annonce.localisation_lng ?? getCoordsVille(annonce.ville)?.lng
          if (!lat || !lng) return null
          return <MapAnnonce lat={lat} lng={lng} titre={annonce.titre} />
        })()}

        {/* Section vendeur */}
        <div className="mt-4 bg-card rounded-[6px] p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-primary font-bold text-sm">
              {vendeur?.prenom?.[0]?.toUpperCase() ?? 'V'}
            </span>
          </div>
          <div>
            <p className="font-semibold text-text-main text-sm">
              {vendeur?.prenom ?? 'Vendeur'}
            </p>
            <p className="text-text-muted text-xs">
              {membreSince ? `Membre depuis ${membreSince}` : 'Membre Zafer'}
            </p>
          </div>
        </div>
      </div>

      {/* Bouton WhatsApp — limité à max-w-lg */}
      <div className="fixed left-0 right-0 pointer-events-none" style={{ zIndex: 1000, bottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)' }}>
        <div className="max-w-lg mx-auto px-4 pb-3 pt-6 bg-gradient-to-t from-white via-white/95 to-transparent pointer-events-auto">
          {whatsappUrl ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, width:'100%', background:'#404040', color:'#FFFFFF', fontWeight:600, padding:'14px 0', borderRadius:6, textDecoration:'none', fontSize:14 }}
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Contacter sur WhatsApp
            </a>
          ) : (
            <button disabled className="flex items-center justify-center gap-2 w-full bg-gray-300 text-gray-500 font-semibold py-3.5 rounded-[6px] cursor-not-allowed">
              Numéro non disponible
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
