import PhotoCarousel from './PhotoCarousel'

interface AnnonceHeroProps {
  photos: string[]
  titre: string
  categorie: string
  initialActif: boolean
}

// Regroupe le carousel + badge VENDU si l'annonce est inactive
export default function AnnonceHero({
  photos,
  titre,
  categorie,
  initialActif,
}: AnnonceHeroProps) {
  return (
    <div className="relative">
      <PhotoCarousel photos={photos} titre={titre} categorie={categorie} />

      {/* Badge VENDU — affiché si l'annonce est inactive */}
      {!initialActif && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.35)',
            pointerEvents: 'none',
          }}
        >
          <span
            style={{
              background: '#1A1A1A',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: 18,
              letterSpacing: 3,
              padding: '8px 20px',
              borderRadius: 4,
              textTransform: 'uppercase',
            }}
          >
            VENDU
          </span>
        </div>
      )}
    </div>
  )
}
