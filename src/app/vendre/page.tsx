'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Camera, X } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'
import { uploadPhotoR2 } from '@/lib/r2-upload'
import CityInput from '@/components/CityInput'

const sousCategories: Record<string, string[]> = {
  vehicule: ['Voiture', 'Scooter', 'Moto', 'Bateau'],
  immobilier: ['Location', 'Vente', 'Location Saisonnière', 'Commerce'],
  maison: ['Ameublement', 'Électroménager'],
}

export default function VendrePage() {
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Champs du formulaire — tous en state contrôlé
  const [titre, setTitre] = useState('')
  const [description, setDescription] = useState('')
  const [categorie, setCategorie] = useState('')
  const [sousCategorie, setSousCategorie] = useState('')
  const [prix, setPrix] = useState('')         // valeur brute (chiffres uniquement)
  const [prixDisplay, setPrixDisplay] = useState('') // valeur affichée avec séparateurs
  const [ville, setVille] = useState('')
  const [kilometrage, setKilometrage] = useState('')
  const [boiteVitesse, setBoiteVitesse] = useState('')
  const [carburant, setCarburant] = useState('')
  const [annee, setAnnee] = useState('')
  const [typeBien, setTypeBien] = useState('')
  const [surface, setSurface] = useState('')
  const [etat, setEtat] = useState('')
  const [meuble, setMeuble] = useState<boolean | null>(null)
  const [nbChambres, setNbChambres] = useState('')
  // Champs location professionnelle
  const [locationType, setLocationType] = useState('')
  const [vehiculeType, setVehiculeType] = useState('')
  // Champs maison spécifiques
  const [piece, setPiece] = useState('')
  const [typeElectromenager, setTypeElectromenager] = useState('')

  // Photos
  const [photos, setPhotos] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])

  // UI
  const [loading, setLoading] = useState(false)
  const [erreur, setErreur] = useState('')
  const [avertissementIA, setAvertissementIA] = useState('')
  const [authCheck, setAuthCheck] = useState(true)

  // Redirige immédiatement vers /compte si non connecté
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session?.user) {
        router.replace('/compte?redirect=/vendre')
      } else {
        setAuthCheck(false)
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Recadre au centre en 4:5, redimensionne à max 1200px de large, convertit en WebP
  async function convertirEnWebP(fichier: File): Promise<File> {
    return new Promise((resolve) => {
      const img = new Image()
      const urlTemp = URL.createObjectURL(fichier)

      img.onload = () => {
        URL.revokeObjectURL(urlTemp)

        const RATIO = 4 / 5
        const LARGEUR_MAX = 1200

        const natW = img.naturalWidth
        const natH = img.naturalHeight

        // Recadrage centré au ratio 4:5
        let srcX = 0, srcY = 0, srcW = natW, srcH = natH
        if (natW / natH > RATIO) {
          srcW = Math.round(natH * RATIO)
          srcX = Math.round((natW - srcW) / 2)
        } else {
          srcH = Math.round(natW / RATIO)
          srcY = Math.round((natH - srcH) / 2)
        }

        // Redimensionnement si largeur > 1200px
        let destW = srcW
        let destH = srcH
        if (destW > LARGEUR_MAX) {
          destH = Math.round(destH * LARGEUR_MAX / destW)
          destW = LARGEUR_MAX
        }

        const canvas = document.createElement('canvas')
        canvas.width = destW
        canvas.height = destH
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, destW, destH)

        canvas.toBlob(
          (blob) => {
            if (!blob) { resolve(fichier); return }
            const nomBase = fichier.name.replace(/\.[^.]+$/, '')
            resolve(new File([blob], `${nomBase}.webp`, { type: 'image/webp' }))
          },
          'image/webp',
          0.85
        )
      }

      img.onerror = () => { URL.revokeObjectURL(urlTemp); resolve(fichier) }
      img.src = urlTemp
    })
  }

  async function handlePhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    const restantes = 3 - photos.length
    const nouvelles = files.slice(0, restantes)

    // Conversion WebP de chaque image avant stockage
    const converties = await Promise.all(nouvelles.map(convertirEnWebP))

    setPhotos((prev) => [...prev, ...converties])
    setPreviews((prev) => [...prev, ...converties.map((f) => URL.createObjectURL(f))])
  }

  function supprimerPhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErreur('')
    setLoading(true)

    try {
      // Vérifie que l'utilisateur est connecté
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setErreur('Vous devez être connecté pour publier une annonce.')
        setLoading(false)
        return
      }

      // Upload des photos vers Cloudflare R2 (resize WebP auto)
      const photoUrls = await Promise.all(photos.map(uploadPhotoR2))

      // Insertion de l'annonce
      const { error: insertError } = await supabase
        .from('listings')
        .insert({
          user_id: user.id,
          titre,
          description: description || null,
          prix: Number(prix),
          categorie: categorie as 'vehicule' | 'immobilier' | 'maison',
          sous_categorie: sousCategorie,
          ville: ville || null,
          photos: photoUrls,
          boite_vitesse: (boiteVitesse || null) as 'automatique' | 'manuelle' | null,
          kilometrage: kilometrage ? Number(kilometrage) : null,
          carburant: (carburant || null) as 'essence' | 'diesel' | 'hybride' | 'électrique' | null,
          annee: annee ? Number(annee) : null,
          type_bien: (typeBien || null) as 'maison' | 'appartement' | 'commerce' | null,
          surface: surface ? Number(surface) : null,
          etat: (etat || null) as 'neuf' | 'bon état' | 'à réparer' | null,
          meuble: meuble,
          nb_chambres: nbChambres ? Number(nbChambres) : null,
          location_type: (locationType || null) as 'court' | 'long' | null,
          vehicule_type: (vehiculeType || null) as 'voiture' | 'moto' | 'scooter' | null,
          piece: piece || null,
          type_electromenager: typeElectromenager || null,
        })

      if (insertError) throw insertError

      // Vérification IA des photos — non bloquante
      if (photoUrls.length > 0) {
        try {
          const verif = await fetch('/api/verifier-annonce', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ photos: photoUrls, categorie, sousCategorie, titre }),
          })
          const data = await verif.json()
          if (!data.ok && !data.skipped) {
            setAvertissementIA(data.message ?? 'Images inappropriées pour cette catégorie.')
            setLoading(false)
            // Redirige quand même après 4 s
            setTimeout(() => router.replace('/compte/mes-annonces'), 4000)
            return
          }
        } catch { /* ignore — la vérif est facultative */ }
      }

      router.replace('/compte/mes-annonces')

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Une erreur est survenue'
      setErreur(message)
    } finally {
      setLoading(false)
    }
  }

  // Affiche un spinner pendant la vérification auth (puis redirect si non connecté)
  if (authCheck) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const scLower = sousCategorie.toLowerCase()
  const isVoiture = scLower === 'voiture'
  const isLocationPro = scLower === 'location professionnelle'
  const isAmeublement = scLower === 'ameublement'
  const isElectromenager = scLower === 'électroménager'
  const isVehiculeAvecKm = ['voiture', 'scooter', 'moto'].includes(scLower)

  return (
    <div className="max-w-lg mx-auto" style={{ paddingBottom: 96 }}>
      <header className="sticky top-0 bg-white z-40 px-4 pb-3 border-b border-gray-100 flex items-center gap-3" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}>
        <Link href="/"><ArrowLeft className="w-5 h-5 text-text-main" /></Link>
        <h1 className="font-bold text-lg text-text-main">Déposer une annonce</h1>
      </header>

      <form onSubmit={handleSubmit} className="px-4 py-4 space-y-5">

        {erreur && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-[12px] px-4 py-3">
            {erreur}
          </div>
        )}

        {avertissementIA && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-[12px] px-4 py-3">
            <p className="font-semibold mb-1">⚠️ Vérification IA</p>
            <p>{avertissementIA}</p>
            <p className="mt-2 text-xs text-amber-600">Votre annonce a été publiée. Redirection dans quelques secondes…</p>
          </div>
        )}

        {/* Photos */}
        <div>
          <label className="block text-sm font-semibold text-text-main mb-2">
            Photos <span className="text-text-muted font-normal">(max 3)</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {previews.map((src, i) => (
              <div key={i} className="relative aspect-square rounded-[12px] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => supprimerPhoto(i)}
                  className="absolute top-1 right-1 bg-black/50 rounded-full p-0.5">
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
            {photos.length < 3 && (
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-[12px] border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 bg-card">
                <Camera className="w-5 h-5 text-text-muted" />
                <span className="text-xs text-text-muted">Ajouter</span>
              </button>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotos} />
        </div>

        {/* Titre */}
        <div>
          <label className="block text-sm font-semibold text-text-main mb-1.5">Titre *</label>
          <input value={titre} onChange={(e) => setTitre(e.target.value)}
            type="text" placeholder="Ex: Toyota Corolla 2019" required
            className="w-full border border-gray-200 rounded-[12px] px-4 py-3 text-sm outline-none focus:border-primary transition-colors" />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-text-main mb-1.5">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="Décrivez votre article..." rows={4}
            className="w-full border border-gray-200 rounded-[12px] px-4 py-3 text-sm outline-none focus:border-primary transition-colors resize-none" />
        </div>

        {/* Catégorie */}
        <div>
          <label className="block text-sm font-semibold text-text-main mb-1.5">Catégorie *</label>
          <select value={categorie} onChange={(e) => { setCategorie(e.target.value); setSousCategorie('') }} required
            className="w-full border border-gray-200 rounded-[12px] px-4 py-3 text-sm outline-none focus:border-primary transition-colors bg-white">
            <option value="">Choisir une catégorie</option>
            <option value="vehicule">Véhicule</option>
            <option value="immobilier">Immobilier</option>
            <option value="maison">Maison</option>
          </select>
        </div>

        {/* Sous-catégorie */}
        {categorie && (
          <div>
            <label className="block text-sm font-semibold text-text-main mb-1.5">Sous-catégorie *</label>
            <select value={sousCategorie} onChange={(e) => setSousCategorie(e.target.value)} required
              className="w-full border border-gray-200 rounded-[12px] px-4 py-3 text-sm outline-none focus:border-primary transition-colors bg-white">
              <option value="">Choisir une sous-catégorie</option>
              {sousCategories[categorie].map((sc) => (
                <option key={sc} value={sc}>{sc}</option>
              ))}
            </select>
          </div>
        )}

        {/* Champs véhicule standard (voiture, moto, scooter) */}
        {categorie === 'vehicule' && isVehiculeAvecKm && (
          <div>
            <label className="block text-sm font-semibold text-text-main mb-1.5">Kilométrage</label>
            <input value={kilometrage} onChange={(e) => setKilometrage(e.target.value)}
              type="number" placeholder="Ex: 45000"
              className="w-full border border-gray-200 rounded-[12px] px-4 py-3 text-sm outline-none focus:border-primary transition-colors" />
          </div>
        )}

        {/* Année — uniquement pour voiture */}
        {categorie === 'vehicule' && isVoiture && (
          <div>
            <label className="block text-sm font-semibold text-text-main mb-1.5">Année</label>
            <input value={annee} onChange={(e) => setAnnee(e.target.value)}
              type="number" placeholder="Ex: 2019" min="1950" max={new Date().getFullYear()}
              className="w-full border border-gray-200 rounded-[12px] px-4 py-3 text-sm outline-none focus:border-primary transition-colors" />
          </div>
        )}

        {/* Boîte de vitesse — voiture ou location pro avec voiture sélectionnée */}
        {categorie === 'vehicule' && (isVoiture || (isLocationPro && vehiculeType === 'voiture')) && (
          <div>
            <label className="block text-sm font-semibold text-text-main mb-2">Boîte de vitesse</label>
            <div className="flex gap-2">
              {(['automatique', 'manuelle'] as const).map((bv) => (
                <button
                  key={bv}
                  type="button"
                  onClick={() => setBoiteVitesse(boiteVitesse === bv ? '' : bv)}
                  style={{
                    padding: '9px 16px', borderRadius: 12, fontSize: 14, fontWeight: 500,
                    border: boiteVitesse === bv ? '1px solid #1A1A1A' : '1px solid #E5E5E5',
                    background: boiteVitesse === bv ? '#1A1A1A' : '#FAFAFA',
                    color: boiteVitesse === bv ? '#FFFFFF' : '#1A1A1A',
                    cursor: 'pointer', textTransform: 'capitalize',
                  }}
                >
                  {bv}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Carburant — voiture uniquement */}
        {categorie === 'vehicule' && isVoiture && (
          <div>
            <label className="block text-sm font-semibold text-text-main mb-1.5">Carburant</label>
            <select value={carburant} onChange={(e) => setCarburant(e.target.value)}
              className="w-full border border-gray-200 rounded-[12px] px-4 py-3 text-sm outline-none focus:border-primary transition-colors bg-white">
              <option value="">Choisir</option>
              <option value="essence">Essence</option>
              <option value="diesel">Diesel</option>
              <option value="hybride">Hybride</option>
              <option value="électrique">Électrique</option>
            </select>
          </div>
        )}

        {/* Champs location professionnelle */}
        {categorie === 'vehicule' && isLocationPro && (
          <>
            <div>
              <label className="block text-sm font-semibold text-text-main mb-2">Durée de location</label>
              <div className="flex gap-2">
                {([{ label: 'Court terme', val: 'court' }, { label: 'Long terme', val: 'long' }] as const).map(({ label, val }) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setLocationType(locationType === val ? '' : val)}
                    style={{
                      padding: '9px 16px', borderRadius: 12, fontSize: 14, fontWeight: 500,
                      border: locationType === val ? '1px solid #1A1A1A' : '1px solid #E5E5E5',
                      background: locationType === val ? '#1A1A1A' : '#FAFAFA',
                      color: locationType === val ? '#FFFFFF' : '#1A1A1A',
                      cursor: 'pointer',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-main mb-2">Type de véhicule</label>
              <div className="flex gap-2">
                {([{ label: 'Voiture', val: 'voiture' }, { label: 'Moto', val: 'moto' }, { label: 'Scooter', val: 'scooter' }] as const).map(({ label, val }) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => { setVehiculeType(vehiculeType === val ? '' : val); setBoiteVitesse('') }}
                    style={{
                      padding: '9px 16px', borderRadius: 12, fontSize: 14, fontWeight: 500,
                      border: vehiculeType === val ? '1px solid #1A1A1A' : '1px solid #E5E5E5',
                      background: vehiculeType === val ? '#1A1A1A' : '#FAFAFA',
                      color: vehiculeType === val ? '#FFFFFF' : '#1A1A1A',
                      cursor: 'pointer',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Champs immobilier */}
        {categorie === 'immobilier' && sousCategorie !== 'Commerce' && (
          <>
            <div>
              <label className="block text-sm font-semibold text-text-main mb-1.5">Type de bien</label>
              <select value={typeBien} onChange={(e) => setTypeBien(e.target.value)}
                className="w-full border border-gray-200 rounded-[12px] px-4 py-3 text-sm outline-none focus:border-primary transition-colors bg-white">
                <option value="">Choisir</option>
                <option value="maison">Maison</option>
                <option value="appartement">Appartement</option>
                {sousCategorie === 'Vente' && <option value="terrain">Terrain</option>}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-main mb-1.5">Surface (m²)</label>
              <input value={surface} onChange={(e) => setSurface(e.target.value)}
                type="number" placeholder="Ex: 85"
                className="w-full border border-gray-200 rounded-[12px] px-4 py-3 text-sm outline-none focus:border-primary transition-colors" />
            </div>
            {/* Chambres — non applicable pour un terrain */}
            {typeBien !== 'terrain' && (
            <div>
              <label className="block text-sm font-semibold text-text-main mb-1.5">Nombre de chambres</label>
              <input value={nbChambres} onChange={(e) => setNbChambres(e.target.value)}
                type="number" placeholder="Ex: 3" min="0"
                className="w-full border border-gray-200 rounded-[12px] px-4 py-3 text-sm outline-none focus:border-primary transition-colors" />
            </div>
            )}
            {(sousCategorie === 'Location' || sousCategorie === 'Location Saisonnière') && (
              <div>
                <label className="block text-sm font-semibold text-text-main mb-2">Meublé</label>
                <div className="flex gap-2">
                  {([{ label: 'Meublé', val: true }, { label: 'Non meublé', val: false }] as const).map(({ label, val }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setMeuble(meuble === val ? null : val)}
                      style={{
                        padding: '9px 16px', borderRadius: 12, fontSize: 14, fontWeight: 500,
                        border: meuble === val ? '1px solid #1A1A1A' : '1px solid #E5E5E5',
                        background: meuble === val ? '#1A1A1A' : '#FAFAFA',
                        color: meuble === val ? '#FFFFFF' : '#1A1A1A',
                        cursor: 'pointer',
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Champs maison communs (état) */}
        {categorie === 'maison' && (
          <div>
            <label className="block text-sm font-semibold text-text-main mb-2">État</label>
            <div className="flex gap-2 flex-wrap">
              {(['neuf', 'bon état', 'à réparer'] as const).map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setEtat(etat === val ? '' : val)}
                  style={{
                    padding: '9px 16px',
                    borderRadius: 12,
                    fontSize: 14,
                    fontWeight: 500,
                    border: etat === val ? '1px solid #1A1A1A' : '1px solid #E5E5E5',
                    background: etat === val ? '#1A1A1A' : '#FAFAFA',
                    color: etat === val ? '#FFFFFF' : '#1A1A1A',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Pièce — uniquement pour ameublement */}
        {categorie === 'maison' && isAmeublement && (
          <div>
            <label className="block text-sm font-semibold text-text-main mb-1.5">Pièce</label>
            <select value={piece} onChange={(e) => setPiece(e.target.value)}
              className="w-full border border-gray-200 rounded-[12px] px-4 py-3 text-sm outline-none focus:border-primary transition-colors bg-white">
              <option value="">Choisir une pièce</option>
              <option value="cuisine">Cuisine</option>
              <option value="salle à manger">Salle à manger</option>
              <option value="salon">Salon</option>
              <option value="bureau">Bureau</option>
              <option value="chambre">Chambre</option>
              <option value="salle de bain">Salle de bain</option>
            </select>
          </div>
        )}

        {/* Type électroménager — uniquement pour électroménager */}
        {categorie === 'maison' && isElectromenager && (
          <div>
            <label className="block text-sm font-semibold text-text-main mb-1.5">Type</label>
            <select value={typeElectromenager} onChange={(e) => setTypeElectromenager(e.target.value)}
              className="w-full border border-gray-200 rounded-[12px] px-4 py-3 text-sm outline-none focus:border-primary transition-colors bg-white">
              <option value="">Choisir un type</option>
              <option value="cuisine">Cuisine</option>
              <option value="entretien de la maison">Entretien de la maison</option>
              <option value="beauté">Beauté</option>
            </select>
          </div>
        )}

        {/* Prix */}
        <div>
          <label className="block text-sm font-semibold text-text-main mb-1.5">
            {isLocationPro ? 'Prix max (RS / jour)' : 'Prix (RS)'} *
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-text-muted font-medium">Rs</span>
            <input
              value={prixDisplay}
              onChange={(e) => {
                const brut = e.target.value.replace(/[^\d]/g, '')
                setPrix(brut)
                setPrixDisplay(brut ? Number(brut).toLocaleString('fr-FR') : '')
              }}
              type="text"
              inputMode="numeric"
              placeholder="0"
              required
              className="w-full border border-gray-200 rounded-[12px] pl-10 pr-4 py-3 text-sm outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        {/* Ville — avec autocomplétion sur les villes de l'île Maurice */}
        <div>
          <label className="block text-sm font-semibold text-text-main mb-1.5">Ville <span className="text-red-500">*</span></label>
          <CityInput
            value={ville}
            onChange={setVille}
            className="w-full border border-gray-200 rounded-[12px] px-4 py-3 text-sm outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Bouton publier */}
        <button type="submit" disabled={loading || !categorie || !sousCategorie || !titre || !prix || !ville}
          style={{ width:'100%', background:'#b85c38', color:'#FFFFFF', fontWeight:600, padding:'16px 0', borderRadius:6, border:'none', fontSize:14, cursor:'pointer', opacity: (loading || !categorie || !sousCategorie || !titre || !prix || !ville) ? 0.5 : 1 }}>
          {loading ? 'Publication en cours...' : "Publier l'annonce"}
        </button>
      </form>
    </div>
  )
}
