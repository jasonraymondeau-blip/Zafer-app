'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, ArrowLeft, Check, MapPin, Loader } from 'lucide-react'
import { CarIcon, HouseIcon, ArmchairIcon } from '@phosphor-icons/react/dist/ssr'
import CityInput from '@/components/CityInput'

const CATEGORIES = [
  {
    id: 'vehicule',
    label: 'Véhicule',
    Icon: CarIcon,
    sousCats: ['Voiture', 'Scooter', 'Moto', 'Bateau'],
  },
  {
    id: 'immobilier',
    label: 'Immobilier',
    Icon: HouseIcon,
    sousCats: ['Location', 'Vente', 'Location Saisonnière'],
  },
  {
    id: 'maison',
    label: 'Maison & Équipement',
    Icon: ArmchairIcon,
    sousCats: ['Ameublement', 'Électroménager'],
  },
]

// ── Champs actifs selon catégorie + sous-catégorie ────────────────────────
function getChampsActifs(categorie: string, sousCategorie: string): string[] {
  const sc = sousCategorie.toLowerCase()
  if (categorie === 'vehicule') {
    if (sc === 'voiture')                return ['prix', 'annee', 'km', 'boite', 'carburant']
    if (sc === 'moto' || sc === 'scooter') return ['prix', 'km']
    if (sc === 'bateau')                 return ['prix']
    return ['prix', 'km']
  }
  if (categorie === 'maison') {
    if (sc === 'ameublement')            return ['prix', 'etat', 'piece']
    if (sc.includes('lectrom') || sc.includes('électroménager')) return ['prix', 'etat', 'type_electromenager']
    return ['prix', 'etat']
  }
  if (categorie === 'immobilier') {
    if (sc === 'location')              return ['type_bien', 'loyer', 'meuble', 'nb_chambres', 'ville']
    if (sc === 'vente')                 return ['type_bien', 'prix', 'surface', 'nb_chambres', 'ville']
    if (sc.includes('saisonni'))        return ['prix_nuit', 'nb_chambres', 'ville']
    return ['type_bien', 'prix', 'surface', 'ville']
  }
  return ['prix']
}

type FilterValues = {
  prix_min: string; prix_max: string
  km_min: string; km_max: string
  boite_vitesse: string; carburant: string
  annee_min: string; annee_max: string
  type_bien: string; surface_min: string; surface_max: string
  meuble: string; nb_chambres: string; type_transaction: string
  etat: string; piece: string; type_electromenager: string
  ville: string; lat: string; lng: string
}

const FILTRES_VIDES: FilterValues = {
  prix_min: '', prix_max: '', km_min: '', km_max: '',
  boite_vitesse: '', carburant: '', annee_min: '', annee_max: '',
  type_bien: '', surface_min: '', surface_max: '',
  meuble: '', nb_chambres: '', type_transaction: '',
  etat: '', piece: '', type_electromenager: '',
  ville: '', lat: '', lng: '',
}

export default function CategoriesPage() {
  const router = useRouter()

  // ── Step : 'list' | 'filtres' ─────────────────────────────────────────
  const [step, setStep] = useState<'list' | 'filtres'>('list')
  const [selectedCat, setSelectedCat] = useState('')
  const [selectedSousCat, setSelectedSousCat] = useState('')
  const [valeurs, setValeurs] = useState<FilterValues>({ ...FILTRES_VIDES })
  const [geoLoading, setGeoLoading] = useState(false)

  function ouvrirFiltres(catId: string, sousCat: string) {
    setSelectedCat(catId)
    setSelectedSousCat(sousCat)
    setValeurs({ ...FILTRES_VIDES })
    setStep('filtres')
  }

  function retourListe() {
    setStep('list')
  }

  // ── Helpers filtres ───────────────────────────────────────────────────
  function set(key: keyof FilterValues, value: string) {
    setValeurs((v) => ({ ...v, [key]: value }))
  }
  function toggle(key: keyof FilterValues, value: string) {
    setValeurs((v) => ({ ...v, [key]: v[key] === value ? '' : value }))
  }
  function toggleMulti(key: keyof FilterValues, value: string) {
    setValeurs((v) => {
      const actifs = v[key] ? v[key].split(',') : []
      const idx = actifs.indexOf(value)
      if (idx === -1) actifs.push(value)
      else actifs.splice(idx, 1)
      return { ...v, [key]: actifs.join(',') }
    })
  }
  function isMultiActive(key: keyof FilterValues, value: string) {
    return valeurs[key] ? valeurs[key].split(',').includes(value) : false
  }
  function demanderPosition() {
    if (!navigator.geolocation) return
    setGeoLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setValeurs((v) => ({ ...v, lat: String(pos.coords.latitude), lng: String(pos.coords.longitude) }))
        setGeoLoading(false)
      },
      () => setGeoLoading(false),
      { timeout: 8000 }
    )
  }

  function handleValider() {
    const params = new URLSearchParams()
    params.set('categorie', selectedCat)
    params.set('sous_categorie', selectedSousCat)
    if (valeurs.prix_min) params.set('prix_min', valeurs.prix_min)
    if (valeurs.prix_max) params.set('prix_max', valeurs.prix_max)
    if (valeurs.km_min) params.set('km_min', valeurs.km_min)
    if (valeurs.km_max) params.set('km_max', valeurs.km_max)
    if (valeurs.boite_vitesse) params.set('boite_vitesse', valeurs.boite_vitesse)
    if (valeurs.carburant) params.set('carburant', valeurs.carburant)
    if (valeurs.annee_min) params.set('annee_min', valeurs.annee_min)
    if (valeurs.annee_max) params.set('annee_max', valeurs.annee_max)
    if (valeurs.type_bien) params.set('type_bien', valeurs.type_bien)
    if (valeurs.surface_min) params.set('surface_min', valeurs.surface_min)
    if (valeurs.surface_max) params.set('surface_max', valeurs.surface_max)
    if (valeurs.etat) params.set('etat', valeurs.etat)
    if (valeurs.piece) params.set('piece', valeurs.piece)
    if (valeurs.type_electromenager) params.set('type_electromenager', valeurs.type_electromenager)
    if (valeurs.meuble) params.set('meuble', valeurs.meuble)
    if (valeurs.nb_chambres) params.set('nb_chambres', valeurs.nb_chambres)
    if (valeurs.ville) params.set('ville', valeurs.ville)
    if (valeurs.type_transaction) params.set('type_transaction', valeurs.type_transaction)
    if (valeurs.lat && valeurs.lng) { params.set('lat', valeurs.lat); params.set('lng', valeurs.lng) }
    router.push(`/recherche?${params.toString()}`)
  }

  const champs = getChampsActifs(selectedCat, selectedSousCat)
  const prixLabel = champs.includes('loyer') ? 'Loyer mensuel (RS)' : champs.includes('prix_nuit') ? 'Prix par nuit (RS)' : 'Prix (RS)'

  // ══════════════════════════════════════════════════════════════════════
  // ÉTAPE 2 — Page filtres
  // ══════════════════════════════════════════════════════════════════════
  if (step === 'filtres') {
    return (
      <div className="max-w-lg mx-auto bg-white min-h-screen flex flex-col" style={{ paddingBottom: 96 }}>

        {/* Header sticky */}
        <div
          className="flex-shrink-0"
          style={{
            position: 'sticky', top: 0, background: '#FFFFFF', zIndex: 10,
            borderBottom: '1px solid #F0F0F0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 16px 14px' }}>
            <button
              onClick={retourListe}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, marginLeft: -4 }}
            >
              <ArrowLeft size={22} color="#1A1A1A" />
            </button>
            <div>
              <p style={{ fontSize: 12, color: '#888888', marginBottom: 1 }}>
                {CATEGORIES.find(c => c.id === selectedCat)?.label}
              </p>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>
                {selectedSousCat}
              </h2>
            </div>
          </div>
        </div>

        {/* Filtres — scrollable */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Localisation */}
          <div>
            <label style={labelStyle}>Localisation</label>
            {valeurs.lat && valeurs.lng ? (
              <button
                onClick={() => setValeurs((v) => ({ ...v, lat: '', lng: '' }))}
                style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #496977', background: 'rgba(73,105,119,0.07)', cursor: 'pointer', fontSize: 14, color: '#496977', fontWeight: 500 }}
              >
                <MapPin size={16} />
                <span style={{ flex: 1, textAlign: 'left' }}>Position activée — annonces à 10 km</span>
              </button>
            ) : (
              <button
                onClick={demanderPosition}
                disabled={geoLoading}
                style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #E5E5E5', background: '#FAFAFA', cursor: 'pointer', fontSize: 14, color: '#1A1A1A', fontWeight: 500, opacity: geoLoading ? 0.6 : 1 }}
              >
                {geoLoading ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <MapPin size={16} />}
                {geoLoading ? 'Localisation en cours…' : 'Autour de moi (10 km)'}
              </button>
            )}
          </div>

          {/* Prix */}
          {(champs.includes('prix') || champs.includes('loyer')) && (
            <div>
              <label style={labelStyle}>{prixLabel}</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="number" placeholder="Min" value={valeurs.prix_min} onChange={(e) => set('prix_min', e.target.value)} style={inputStyle} />
                <input type="number" placeholder="Max" value={valeurs.prix_max} onChange={(e) => set('prix_max', e.target.value)} style={inputStyle} />
              </div>
            </div>
          )}

          {/* Prix nuit — slider */}
          {champs.includes('prix_nuit') && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <label style={labelStyle}>Prix par nuit</label>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>
                  {valeurs.prix_max ? `≤ Rs ${Number(valeurs.prix_max).toLocaleString('fr-FR')}` : 'Illimité'}
                </span>
              </div>
              <input type="range" min={0} max={10000} step={250}
                value={valeurs.prix_max || '10000'}
                onChange={(e) => set('prix_max', e.target.value === '10000' ? '' : e.target.value)}
                style={{ width: '100%', accentColor: '#1A1A1A' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#888888', marginTop: 4 }}>
                <span>Rs 0</span><span>Rs 10 000</span>
              </div>
            </div>
          )}

          {/* Année */}
          {champs.includes('annee') && (
            <div>
              <label style={labelStyle}>Année</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="number" placeholder="De" value={valeurs.annee_min} onChange={(e) => set('annee_min', e.target.value)} style={inputStyle} />
                <input type="number" placeholder="À" value={valeurs.annee_max} onChange={(e) => set('annee_max', e.target.value)} style={inputStyle} />
              </div>
            </div>
          )}

          {/* Kilométrage */}
          {champs.includes('km') && (
            <div>
              <label style={labelStyle}>Kilométrage</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="number" placeholder="Min km" value={valeurs.km_min} onChange={(e) => set('km_min', e.target.value)} style={inputStyle} />
                <input type="number" placeholder="Max km" value={valeurs.km_max} onChange={(e) => set('km_max', e.target.value)} style={inputStyle} />
              </div>
            </div>
          )}

          {/* Boîte de vitesse */}
          {champs.includes('boite') && (
            <div>
              <label style={labelStyle}>Boîte de vitesse</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {['automatique', 'manuelle'].map((b) => (
                  <ChipButton key={b} label={b} active={valeurs.boite_vitesse === b} onClick={() => toggle('boite_vitesse', b)} />
                ))}
              </div>
            </div>
          )}

          {/* Carburant */}
          {champs.includes('carburant') && (
            <div>
              <label style={labelStyle}>Carburant</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {['essence', 'diesel', 'hybride', 'électrique'].map((c) => (
                  <CheckboxItem key={c} label={c} active={isMultiActive('carburant', c)} onClick={() => toggleMulti('carburant', c)} />
                ))}
              </div>
            </div>
          )}

          {/* Type de bien */}
          {champs.includes('type_bien') && (
            <div>
              <label style={labelStyle}>Type de bien</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {['maison', 'appartement', 'commerce'].map((t) => (
                  <CheckboxItem key={t} label={t} active={isMultiActive('type_bien', t)} onClick={() => toggleMulti('type_bien', t)} />
                ))}
              </div>
              {isMultiActive('type_bien', 'commerce') && (
                <div style={{ marginTop: 12 }}>
                  <label style={{ ...labelStyle, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#888888' }}>Transaction</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <ChipButton label="À vendre" active={valeurs.type_transaction === 'vente'} onClick={() => toggle('type_transaction', 'vente')} />
                    <ChipButton label="À louer" active={valeurs.type_transaction === 'location'} onClick={() => toggle('type_transaction', 'location')} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Surface */}
          {champs.includes('surface') && (
            <div>
              <label style={labelStyle}>Surface (m²)</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="number" placeholder="Min m²" value={valeurs.surface_min} onChange={(e) => set('surface_min', e.target.value)} style={inputStyle} />
                <input type="number" placeholder="Max m²" value={valeurs.surface_max} onChange={(e) => set('surface_max', e.target.value)} style={inputStyle} />
              </div>
            </div>
          )}

          {/* Meublé */}
          {champs.includes('meuble') && (
            <div>
              <label style={labelStyle}>Meublé</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <ChipButton label="Meublé" active={valeurs.meuble === 'oui'} onClick={() => toggle('meuble', 'oui')} />
                <ChipButton label="Non meublé" active={valeurs.meuble === 'non'} onClick={() => toggle('meuble', 'non')} />
              </div>
            </div>
          )}

          {/* Chambres */}
          {champs.includes('nb_chambres') && (
            <div>
              <label style={labelStyle}>Chambres</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {['1', '2', '3', '4+'].map((n) => (
                  <CheckboxItem key={n} label={`${n} chambre${n === '1' ? '' : 's'}`} active={isMultiActive('nb_chambres', n)} onClick={() => toggleMulti('nb_chambres', n)} />
                ))}
              </div>
            </div>
          )}

          {/* Ville */}
          {champs.includes('ville') && (
            <div>
              <label style={labelStyle}>Ville</label>
              <CityInput
                value={valeurs.ville}
                onChange={(v) => set('ville', v)}
                className="w-full border border-gray-200 rounded-[12px] px-3 py-2.5 text-sm outline-none focus:border-[#1A1A1A]"
              />
            </div>
          )}

          {/* État */}
          {champs.includes('etat') && (
            <div>
              <label style={labelStyle}>État</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {['neuf', 'bon état', 'à réparer'].map((e) => (
                  <CheckboxItem key={e} label={e} active={isMultiActive('etat', e)} onClick={() => toggleMulti('etat', e)} />
                ))}
              </div>
            </div>
          )}

          {/* Pièce */}
          {champs.includes('piece') && (
            <div>
              <label style={labelStyle}>Pièce</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {['cuisine', 'salle à manger', 'salon', 'bureau', 'chambre', 'salle de bain'].map((p) => (
                  <CheckboxItem key={p} label={p} active={isMultiActive('piece', p)} onClick={() => toggleMulti('piece', p)} />
                ))}
              </div>
            </div>
          )}

          {/* Type électroménager */}
          {champs.includes('type_electromenager') && (
            <div>
              <label style={labelStyle}>Type</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {['cuisine', 'entretien de la maison', 'beauté'].map((t) => (
                  <CheckboxItem key={t} label={t} active={isMultiActive('type_electromenager', t)} onClick={() => toggleMulti('type_electromenager', t)} />
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Bouton valider — fixe en bas */}
        <div style={{ position: 'fixed', bottom: 80, left: 0, right: 0, display: 'flex', justifyContent: 'center', padding: '0 16px', zIndex: 10 }}>
          <button
            onClick={handleValider}
            style={{
              width: '100%', maxWidth: 448,
              padding: '15px 24px',
              borderRadius: 14,
              background: '#1A1A1A',
              color: '#FFFFFF',
              fontSize: 15,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Voir les annonces
          </button>
        </div>

      </div>
    )
  }

  // ══════════════════════════════════════════════════════════════════════
  // ÉTAPE 1 — Liste des catégories
  // ══════════════════════════════════════════════════════════════════════
  return (
    <div className="max-w-lg mx-auto bg-white min-h-screen" style={{ paddingBottom: 96 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 16px 8px' }}>
        <button
          onClick={() => router.push('/')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, marginLeft: -4 }}
        >
          <ArrowLeft size={22} color="#1A1A1A" />
        </button>
        <span style={{ fontSize: 17, fontWeight: 700, color: '#1A1A1A' }}>Catégories</span>
      </div>
      <div>
        {CATEGORIES.map(({ id, label, Icon, sousCats }) => (
          <div key={id}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px 10px' }}>
              <Icon size={18} color="#404040" weight="regular" />
              <span style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A' }}>{label}</span>
            </div>
            <div style={{ borderBottom: '1px solid #F0F0F0' }}>
              {sousCats.map((sc) => (
                <button
                  key={sc}
                  onClick={() => ouvrirFiltres(id, sc)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center',
                    padding: '12px 20px 12px 32px',
                    background: 'transparent', border: 'none',
                    borderTop: '1px solid #F5F5F5', cursor: 'pointer', textAlign: 'left', gap: 10,
                  }}
                >
                  <span style={{ flex: 1, fontSize: 14, fontWeight: 400, color: '#404040' }}>{sc}</span>
                  <ChevronRight size={14} color="#CCCCCC" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Sous-composants ───────────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 600, color: '#1A1A1A', marginBottom: 8,
}

const inputStyle: React.CSSProperties = {
  flex: 1, minWidth: 0, border: '1px solid #E5E5E5', borderRadius: 12,
  padding: '10px 12px', fontSize: 14, outline: 'none', background: '#FAFAFA',
}

function ChipButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1, padding: '10px 14px', borderRadius: 12, fontSize: 14, fontWeight: 500,
        border: active ? '1px solid #1A1A1A' : '1px solid #E5E5E5',
        background: active ? '#1A1A1A' : '#FAFAFA',
        color: active ? '#FFFFFF' : '#1A1A1A',
        cursor: 'pointer', textTransform: 'capitalize',
      }}
    >
      {label}
    </button>
  )
}

function CheckboxItem({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, width: '100%',
        padding: '10px 12px', borderRadius: 12, background: 'transparent',
        border: 'none', cursor: 'pointer', textAlign: 'left',
      }}
    >
      <div style={{
        width: 20, height: 20, borderRadius: 5, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: active ? '2px solid #1A1A1A' : '2px solid #D5D5D5',
        background: active ? '#1A1A1A' : '#FFFFFF',
      }}>
        {active && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
      </div>
      <span style={{ fontSize: 14, fontWeight: active ? 600 : 400, color: '#1A1A1A', textTransform: 'capitalize' }}>
        {label}
      </span>
    </button>
  )
}
