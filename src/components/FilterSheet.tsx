'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SlidersHorizontal, X, MapPin, Loader, Check } from 'lucide-react'
import CityInput from './CityInput'

interface FilterValues {
  prix_min: string
  prix_max: string
  km_min: string
  km_max: string
  boite_vitesse: string        // single : '' | 'automatique' | 'manuelle'
  carburant: string            // multi  : comma-separated
  annee_min: string
  annee_max: string
  // Location professionnelle
  location_type: string        // single : '' | 'court' | 'long'
  vehicule_type: string        // single : '' | 'voiture' | 'moto' | 'scooter'
  // Immobilier
  type_bien: string            // multi  : comma-separated
  surface_min: string
  surface_max: string
  meuble: string               // single : '' | 'oui' | 'non'
  nb_chambres: string          // multi  : comma-separated
  type_transaction: string     // single : '' | 'vente' | 'location'
  // Maison
  etat: string                 // multi  : comma-separated
  piece: string                // multi  : comma-separated
  type_electromenager: string  // multi  : comma-separated
  // Commun
  ville: string
  // Géolocalisation
  lat: string
  lng: string
}

interface FilterSheetProps {
  categorie: string
  sousCategorie: string
  q: string
  current: FilterValues
}

// Champs actifs selon la catégorie ET la sous-catégorie
function getChampsActifs(categorie: string, sousCategorie: string): string[] {
  const sc = sousCategorie.toLowerCase()

  if (categorie === 'vehicule') {
    if (sc === 'voiture') return ['prix', 'annee', 'km', 'boite', 'carburant']
    if (sc === 'moto' || sc === 'scooter') return ['prix', 'km']
    if (sc === 'bateau') return ['prix']
    if (sc.includes('location') || sc.includes('professionnel'))
      return ['prix_max_only', 'location_type', 'vehicule_type']
    return ['prix', 'km', 'boite', 'carburant']
  }

  if (categorie === 'maison') {
    if (sc === 'ameublement') return ['prix', 'etat', 'piece']
    if (sc.includes('lectrom') || sc.includes('electromenager') || sc.includes('électroménager'))
      return ['prix', 'etat', 'type_electromenager']
    return ['prix', 'etat']
  }

  if (categorie === 'immobilier') {
    if (sc === 'location') return ['type_bien', 'loyer', 'meuble', 'nb_chambres', 'ville']
    if (sc === 'vente') return ['type_bien', 'prix', 'surface', 'nb_chambres', 'ville']
    if (sc.includes('saisonni')) return ['prix_nuit', 'nb_chambres', 'ville']
    if (sc === 'terrain') return ['prix', 'surface', 'ville']
    return ['type_bien', 'prix', 'surface', 'ville']
  }

  return ['prix']
}

// Compte les filtres actifs (chaque champ rempli = 1, peu importe combien de valeurs)
function countFiltresActifs(values: FilterValues, categorie: string, sousCategorie: string): number {
  const champs = getChampsActifs(categorie, sousCategorie)
  let count = 0
  const hasPrix = champs.some((c) => ['prix', 'loyer', 'prix_nuit'].includes(c))
  if (hasPrix && (values.prix_min || values.prix_max)) count++
  if (champs.includes('prix_max_only') && values.prix_max) count++
  if (champs.includes('km') && (values.km_min || values.km_max)) count++
  if (champs.includes('boite') && values.boite_vitesse) count++
  if (champs.includes('carburant') && values.carburant) count++
  if (champs.includes('annee') && (values.annee_min || values.annee_max)) count++
  if (champs.includes('location_type') && values.location_type) count++
  if (champs.includes('vehicule_type') && values.vehicule_type) count++
  if (champs.includes('type_bien') && values.type_bien) count++
  if (champs.includes('surface') && (values.surface_min || values.surface_max)) count++
  if (champs.includes('etat') && values.etat) count++
  if (champs.includes('piece') && values.piece) count++
  if (champs.includes('type_electromenager') && values.type_electromenager) count++
  if (champs.includes('meuble') && values.meuble) count++
  if (champs.includes('nb_chambres') && values.nb_chambres) count++
  if (champs.includes('ville') && values.ville) count++
  if (values.type_transaction) count++
  if (values.lat && values.lng) count++
  return count
}

export default function FilterSheet({ categorie, sousCategorie, q, current }: FilterSheetProps) {
  const router = useRouter()
  const [ouvert, setOuvert] = useState(false)
  const [valeurs, setValeurs] = useState<FilterValues>({ ...current })
  const [geoLoading, setGeoLoading] = useState(false)

  const champs = getChampsActifs(categorie, sousCategorie)
  const nbFiltres = countFiltresActifs(current, categorie, sousCategorie)

  // ── Helpers ────────────────────────────────────────────────────────────────

  function set(key: keyof FilterValues, value: string) {
    setValeurs((v) => ({ ...v, [key]: value }))
  }

  // Toggle single-select (un seul à la fois)
  function toggle(key: keyof FilterValues, value: string) {
    setValeurs((v) => ({ ...v, [key]: v[key] === value ? '' : value }))
  }

  // Toggle multi-select (comma-separated, plusieurs valeurs possibles)
  function toggleMulti(key: keyof FilterValues, value: string) {
    setValeurs((v) => {
      const actifs = v[key] ? v[key].split(',') : []
      const idx = actifs.indexOf(value)
      if (idx === -1) actifs.push(value)
      else actifs.splice(idx, 1)
      return { ...v, [key]: actifs.join(',') }
    })
  }

  // Vérifie si une valeur multi-select est active
  function isMultiActive(key: keyof FilterValues, value: string): boolean {
    return valeurs[key] ? valeurs[key].split(',').includes(value) : false
  }

  // Demande la géolocalisation du navigateur
  function demanderPosition() {
    if (!navigator.geolocation) return
    setGeoLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setValeurs((v) => ({
          ...v,
          lat: String(pos.coords.latitude),
          lng: String(pos.coords.longitude),
        }))
        setGeoLoading(false)
      },
      () => setGeoLoading(false),
      { timeout: 8000 }
    )
  }

  function handleAppliquer() {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (categorie) params.set('categorie', categorie)
    if (sousCategorie) params.set('sous_categorie', sousCategorie)
    if (valeurs.prix_min) params.set('prix_min', valeurs.prix_min)
    if (valeurs.prix_max) params.set('prix_max', valeurs.prix_max)
    if (valeurs.km_min) params.set('km_min', valeurs.km_min)
    if (valeurs.km_max) params.set('km_max', valeurs.km_max)
    if (valeurs.boite_vitesse) params.set('boite_vitesse', valeurs.boite_vitesse)
    if (valeurs.carburant) params.set('carburant', valeurs.carburant)
    if (valeurs.annee_min) params.set('annee_min', valeurs.annee_min)
    if (valeurs.annee_max) params.set('annee_max', valeurs.annee_max)
    if (valeurs.location_type) params.set('location_type', valeurs.location_type)
    if (valeurs.vehicule_type) params.set('vehicule_type', valeurs.vehicule_type)
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
    if (valeurs.lat && valeurs.lng) {
      params.set('lat', valeurs.lat)
      params.set('lng', valeurs.lng)
    }
    router.push(`/recherche?${params.toString()}`)
    setOuvert(false)
  }

  function handleReinitialiser() {
    const vide: FilterValues = {
      prix_min: '', prix_max: '', km_min: '', km_max: '',
      boite_vitesse: '', carburant: '', annee_min: '', annee_max: '',
      location_type: '', vehicule_type: '',
      type_bien: '', surface_min: '', surface_max: '',
      etat: '', piece: '', type_electromenager: '',
      meuble: '', nb_chambres: '', ville: '', type_transaction: '',
      lat: '', lng: '',
    }
    setValeurs(vide)
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (categorie) params.set('categorie', categorie)
    if (sousCategorie) params.set('sous_categorie', sousCategorie)
    router.push(`/recherche?${params.toString()}`)
    setOuvert(false)
  }

  const prixLabel = champs.includes('loyer')
    ? 'Loyer mensuel (RS)'
    : champs.includes('prix_nuit')
    ? 'Prix par nuit (RS)'
    : 'Prix (RS)'

  return (
    <>
      {/* Bouton filtres */}
      <button
        onClick={() => { setValeurs({ ...current }); setOuvert(true) }}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium bg-white relative ${
          nbFiltres > 0 ? 'border-[#1A1A1A] text-[#1A1A1A]' : 'border-gray-200 text-text-main'
        }`}
      >
        <SlidersHorizontal className="w-4 h-4" />
        Filtres
        {nbFiltres > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#1A1A1A] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {nbFiltres}
          </span>
        )}
      </button>

      {/* Overlay + bottom sheet */}
      {ouvert && (
        <>
          <div className="fixed inset-0 bg-black/50 z-[60]" onClick={() => setOuvert(false)} />

          <div className="fixed bottom-0 left-0 right-0 z-[61] flex justify-center pointer-events-none">
            <div className="w-full max-w-lg bg-white rounded-t-[20px] shadow-xl flex flex-col h-[80vh] pointer-events-auto">

              {/* Poignée */}
              <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
                <div className="w-10 h-1 bg-gray-200 rounded-full" />
              </div>

              {/* Titre */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
                <h2 className="font-bold text-text-main">Filtres</h2>
                <button onClick={() => setOuvert(false)}>
                  <X className="w-5 h-5 text-text-muted" />
                </button>
              </div>

              {/* Champs — scrollable */}
              <div className="px-4 py-4 space-y-6 overflow-y-auto flex-1">

                {/* ── AUTOUR DE MOI (toutes catégories) ──────────── */}
                <div>
                  <label className="block text-sm font-semibold text-text-main mb-2">Localisation</label>
                  {valeurs.lat && valeurs.lng ? (
                    <button
                      onClick={() => setValeurs((v) => ({ ...v, lat: '', lng: '' }))}
                      className="flex items-center gap-2 w-full px-4 py-2.5 rounded-[12px] border border-[#496977] text-sm font-medium text-[#496977]"
                      style={{ background: 'rgba(73,105,119,0.07)' }}
                    >
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="flex-1 text-left">Position activée — annonces à 10 km</span>
                      <X className="w-4 h-4 flex-shrink-0" />
                    </button>
                  ) : (
                    <button
                      onClick={demanderPosition}
                      disabled={geoLoading}
                      className="flex items-center gap-2 w-full px-4 py-2.5 rounded-[12px] border border-gray-200 text-sm font-medium text-text-main disabled:opacity-60"
                    >
                      {geoLoading
                        ? <Loader className="w-4 h-4 animate-spin flex-shrink-0" />
                        : <MapPin className="w-4 h-4 flex-shrink-0" />
                      }
                      {geoLoading ? 'Localisation en cours…' : 'Autour de moi (10 km)'}
                    </button>
                  )}
                </div>

                {/* ── VÉHICULE — VOITURE ─────────────────────────── */}

                {champs.includes('prix') && (
                  <FilterPrixMinMax
                    label={prixLabel}
                    min={valeurs.prix_min}
                    max={valeurs.prix_max}
                    onMin={(v) => set('prix_min', v)}
                    onMax={(v) => set('prix_max', v)}
                  />
                )}

                {champs.includes('annee') && (
                  <div>
                    <label className="block text-sm font-semibold text-text-main mb-2">Année</label>
                    <div className="flex gap-2">
                      <input type="number" placeholder="De" value={valeurs.annee_min}
                        onChange={(e) => set('annee_min', e.target.value)}
                        className="flex-1 min-w-0 bg-white border border-gray-400 rounded-[12px] px-3 py-2.5 text-sm outline-none focus:border-[#1A1A1A]" />
                      <input type="number" placeholder="À" value={valeurs.annee_max}
                        onChange={(e) => set('annee_max', e.target.value)}
                        className="flex-1 min-w-0 bg-white border border-gray-400 rounded-[12px] px-3 py-2.5 text-sm outline-none focus:border-[#1A1A1A]" />
                    </div>
                  </div>
                )}

                {champs.includes('km') && (
                  <div>
                    <label className="block text-sm font-semibold text-text-main mb-2">Kilométrage</label>
                    <div className="flex gap-2">
                      <input type="number" placeholder="Min km" value={valeurs.km_min}
                        onChange={(e) => set('km_min', e.target.value)}
                        className="flex-1 min-w-0 bg-white border border-gray-400 rounded-[12px] px-3 py-2.5 text-sm outline-none focus:border-[#1A1A1A]" />
                      <input type="number" placeholder="Max km" value={valeurs.km_max}
                        onChange={(e) => set('km_max', e.target.value)}
                        className="flex-1 min-w-0 bg-white border border-gray-400 rounded-[12px] px-3 py-2.5 text-sm outline-none focus:border-[#1A1A1A]" />
                    </div>
                  </div>
                )}

                {/* Boîte de vitesse — single select */}
                {champs.includes('boite') && (
                  <div>
                    <label className="block text-sm font-semibold text-text-main mb-2">Boîte de vitesse</label>
                    <div className="flex gap-2">
                      {['automatique', 'manuelle'].map((b) => (
                        <ChipButton key={b} label={b} active={valeurs.boite_vitesse === b}
                          onClick={() => toggle('boite_vitesse', b)} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Carburant — multi select checkboxes */}
                {champs.includes('carburant') && (
                  <div>
                    <label className="block text-sm font-semibold text-text-main mb-2">Carburant</label>
                    <div className="space-y-1">
                      {['essence', 'diesel', 'hybride', 'électrique'].map((c) => (
                        <CheckboxItem key={c} label={c} active={isMultiActive('carburant', c)}
                          onClick={() => toggleMulti('carburant', c)} />
                      ))}
                    </div>
                  </div>
                )}

                {/* ── VÉHICULE — LOCATION PROFESSIONNELLE ────────── */}

                {champs.includes('prix_max_only') && (
                  <div>
                    <label className="block text-sm font-semibold text-text-main mb-2">Prix max (RS)</label>
                    <input type="number" placeholder="Prix maximum" value={valeurs.prix_max}
                      onChange={(e) => set('prix_max', e.target.value)}
                      className="w-full bg-white border border-gray-400 rounded-[12px] px-3 py-2.5 text-sm outline-none focus:border-[#1A1A1A]" />
                  </div>
                )}

                {champs.includes('location_type') && (
                  <div>
                    <label className="block text-sm font-semibold text-text-main mb-2">Durée</label>
                    <div className="flex gap-2">
                      <ChipButton label="Court terme (< 1 mois)" active={valeurs.location_type === 'court'}
                        onClick={() => toggle('location_type', 'court')} />
                      <ChipButton label="Long terme (> 1 mois)" active={valeurs.location_type === 'long'}
                        onClick={() => toggle('location_type', 'long')} />
                    </div>
                  </div>
                )}

                {champs.includes('vehicule_type') && (
                  <div>
                    <label className="block text-sm font-semibold text-text-main mb-2">Type de véhicule</label>
                    <div className="flex gap-2">
                      {['voiture', 'moto', 'scooter'].map((t) => (
                        <ChipButton key={t} label={t} active={valeurs.vehicule_type === t}
                          onClick={() => toggle('vehicule_type', t)} />
                      ))}
                    </div>
                    {/* Boîte — uniquement si voiture sélectionnée */}
                    {valeurs.vehicule_type === 'voiture' && (
                      <div className="mt-3">
                        <label className="block text-xs font-semibold text-text-muted mb-2 uppercase tracking-wide">Boîte de vitesse</label>
                        <div className="flex gap-2">
                          {['automatique', 'manuelle'].map((b) => (
                            <ChipButton key={b} label={b} active={valeurs.boite_vitesse === b}
                              onClick={() => toggle('boite_vitesse', b)} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── IMMOBILIER LOCATION ────────────────────────── */}

                {champs.includes('loyer') && (
                  <FilterPrixMinMax
                    label={prixLabel}
                    min={valeurs.prix_min}
                    max={valeurs.prix_max}
                    onMin={(v) => set('prix_min', v)}
                    onMax={(v) => set('prix_max', v)}
                  />
                )}

                {champs.includes('meuble') && (
                  <div>
                    <label className="block text-sm font-semibold text-text-main mb-2">Meublé</label>
                    <div className="flex gap-2">
                      <ChipButton label="Meublé" active={valeurs.meuble === 'oui'}
                        onClick={() => toggle('meuble', 'oui')} />
                      <ChipButton label="Non meublé" active={valeurs.meuble === 'non'}
                        onClick={() => toggle('meuble', 'non')} />
                    </div>
                  </div>
                )}

                {/* ── IMMOBILIER SAISONNIÈRE ─────────────────────── */}

                {champs.includes('prix_nuit') && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-semibold text-text-main">Prix par nuit</label>
                      <span className="text-sm font-semibold text-text-main">
                        {valeurs.prix_max ? `≤ Rs ${Number(valeurs.prix_max).toLocaleString('fr-FR')}` : 'Illimité'}
                      </span>
                    </div>
                    <input type="range" min={0} max={10000} step={250}
                      value={valeurs.prix_max || '10000'}
                      onChange={(e) => set('prix_max', e.target.value === '10000' ? '' : e.target.value)}
                      className="w-full accent-[#1A1A1A]"
                    />
                    <div className="flex justify-between text-xs text-text-muted mt-1">
                      <span>Rs 0</span><span>Rs 10 000</span>
                    </div>
                  </div>
                )}

                {/* ── IMMOBILIER PARTAGÉ ─────────────────────────── */}

                {/* Type de bien — multi select checkboxes */}
                {champs.includes('type_bien') && (
                  <div>
                    <label className="block text-sm font-semibold text-text-main mb-2">Type de bien</label>
                    <div className="space-y-1">
                      {['maison', 'appartement', 'commerce'].map((t) => (
                        <CheckboxItem key={t} label={t} active={isMultiActive('type_bien', t)}
                          onClick={() => toggleMulti('type_bien', t)} />
                      ))}
                    </div>
                    {/* Sous-filtre Commerce */}
                    {isMultiActive('type_bien', 'commerce') && (
                      <div className="mt-3">
                        <label className="block text-xs font-semibold text-text-muted mb-2 uppercase tracking-wide">Transaction</label>
                        <div className="flex gap-2">
                          <ChipButton label="À vendre" active={valeurs.type_transaction === 'vente'}
                            onClick={() => toggle('type_transaction', 'vente')} />
                          <ChipButton label="À louer" active={valeurs.type_transaction === 'location'}
                            onClick={() => toggle('type_transaction', 'location')} />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {champs.includes('surface') && (
                  <div>
                    <label className="block text-sm font-semibold text-text-main mb-2">Surface (m²)</label>
                    <div className="flex gap-2">
                      <input type="number" placeholder="Min m²" value={valeurs.surface_min}
                        onChange={(e) => set('surface_min', e.target.value)}
                        className="flex-1 min-w-0 bg-white border border-gray-400 rounded-[12px] px-3 py-2.5 text-sm outline-none focus:border-[#1A1A1A]" />
                      <input type="number" placeholder="Max m²" value={valeurs.surface_max}
                        onChange={(e) => set('surface_max', e.target.value)}
                        className="flex-1 min-w-0 bg-white border border-gray-400 rounded-[12px] px-3 py-2.5 text-sm outline-none focus:border-[#1A1A1A]" />
                    </div>
                  </div>
                )}

                {/* Chambres — multi select checkboxes */}
                {champs.includes('nb_chambres') && (
                  <div>
                    <label className="block text-sm font-semibold text-text-main mb-2">Chambres</label>
                    <div className="space-y-1">
                      {['1', '2', '3', '4+'].map((n) => (
                        <CheckboxItem key={n} label={`${n} chambre${n === '1' ? '' : 's'}`} active={isMultiActive('nb_chambres', n)}
                          onClick={() => toggleMulti('nb_chambres', n)} />
                      ))}
                    </div>
                  </div>
                )}

                {champs.includes('ville') && (
                  <div>
                    <label className="block text-sm font-semibold text-text-main mb-2">Ville</label>
                    <CityInput
                      value={valeurs.ville}
                      onChange={(v) => set('ville', v)}
                      className="w-full bg-white border border-gray-400 rounded-[12px] px-3 py-2.5 text-sm outline-none focus:border-[#1A1A1A]"
                    />
                  </div>
                )}

                {/* ── MAISON — COMMUN ────────────────────────────── */}

                {/* État — multi select checkboxes */}
                {champs.includes('etat') && (
                  <div>
                    <label className="block text-sm font-semibold text-text-main mb-2">État</label>
                    <div className="space-y-1">
                      {['neuf', 'bon état', 'à réparer'].map((e) => (
                        <CheckboxItem key={e} label={e} active={isMultiActive('etat', e)}
                          onClick={() => toggleMulti('etat', e)} />
                      ))}
                    </div>
                  </div>
                )}

                {/* ── MAISON — AMEUBLEMENT ────────────────────────── */}

                {/* Pièce — multi select checkboxes */}
                {champs.includes('piece') && (
                  <div>
                    <label className="block text-sm font-semibold text-text-main mb-2">Pièce</label>
                    <div className="space-y-1">
                      {['cuisine', 'salle à manger', 'salon', 'bureau', 'chambre', 'salle de bain'].map((p) => (
                        <CheckboxItem key={p} label={p} active={isMultiActive('piece', p)}
                          onClick={() => toggleMulti('piece', p)} />
                      ))}
                    </div>
                  </div>
                )}

                {/* ── MAISON — ÉLECTROMÉNAGER ─────────────────────── */}

                {/* Type électroménager — multi select checkboxes */}
                {champs.includes('type_electromenager') && (
                  <div>
                    <label className="block text-sm font-semibold text-text-main mb-2">Type</label>
                    <div className="space-y-1">
                      {['cuisine', 'entretien de la maison', 'beauté'].map((t) => (
                        <CheckboxItem key={t} label={t} active={isMultiActive('type_electromenager', t)}
                          onClick={() => toggleMulti('type_electromenager', t)} />
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Actions — fixe en bas */}
              <div className="flex gap-3 px-4 py-4 border-t border-gray-100 flex-shrink-0">
                <button onClick={handleReinitialiser}
                  className="flex-1 py-3 rounded-[12px] border border-gray-200 text-sm font-semibold text-text-main">
                  Réinitialiser
                </button>
                <button onClick={handleAppliquer}
                  className="flex-1 py-3 rounded-[12px] bg-[#1A1A1A] text-white text-sm font-semibold">
                  Appliquer
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}

// ── Sous-composants ─────────────────────────────────────────────────────────────

// Single-select — chip classique (un seul actif à la fois)
function ChipButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 rounded-[12px] text-sm font-medium border transition-colors capitalize flex-1 ${
        active ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' : 'bg-white text-text-main border-gray-200'
      }`}
    >
      {label}
    </button>
  )
}

// Multi-select — ligne avec checkbox carrée à gauche
function CheckboxItem({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-[12px] text-sm text-left transition-colors hover:bg-gray-50"
    >
      {/* Checkbox visuelle */}
      <div className={`w-5 h-5 rounded-[5px] border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
        active ? 'bg-[#1A1A1A] border-[#1A1A1A]' : 'border-gray-300 bg-white'
      }`}>
        {active && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
      </div>
      <span className={`capitalize ${active ? 'font-semibold text-[#1A1A1A]' : 'text-text-main font-normal'}`}>
        {label}
      </span>
    </button>
  )
}

function FilterPrixMinMax({
  label, min, max, onMin, onMax,
}: {
  label: string; min: string; max: string
  onMin: (v: string) => void; onMax: (v: string) => void
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-text-main mb-2">{label}</label>
      <div className="flex gap-2">
        <input type="number" placeholder="Min" value={min} onChange={(e) => onMin(e.target.value)}
          className="flex-1 min-w-0 bg-white border border-gray-400 rounded-[12px] px-3 py-2.5 text-sm outline-none focus:border-[#1A1A1A]" />
        <input type="number" placeholder="Max" value={max} onChange={(e) => onMax(e.target.value)}
          className="flex-1 min-w-0 bg-white border border-gray-400 rounded-[12px] px-3 py-2.5 text-sm outline-none focus:border-[#1A1A1A]" />
      </div>
    </div>
  )
}
