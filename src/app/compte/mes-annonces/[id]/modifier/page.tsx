'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Camera, X } from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'
import CityInput from '@/components/CityInput'
import type { Listing } from '@/lib/supabase'

const sousCategories: Record<string, string[]> = {
  vehicule: ['Voiture', 'Scooter', 'Moto', 'Bateau'],
  immobilier: ['Location', 'Vente', 'Location Saisonnière', 'Commerce'],
  maison: ['Ameublement', 'Électroménager'],
}

export default function ModifierAnnoncePage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Chargement / auth
  const [chargement, setChargement] = useState(true)
  const [loading, setLoading] = useState(false)
  const [erreur, setErreur] = useState('')

  // Champs du formulaire
  const [titre, setTitre] = useState('')
  const [description, setDescription] = useState('')
  const [categorie, setCategorie] = useState('')
  const [sousCategorie, setSousCategorie] = useState('')
  const [prix, setPrix] = useState('')
  const [ville, setVille] = useState('')
  const [kilometrage, setKilometrage] = useState('')
  const [boiteVitesse, setBoiteVitesse] = useState('')
  const [carburant, setCarburant] = useState('')
  const [typeBien, setTypeBien] = useState('')
  const [surface, setSurface] = useState('')
  const [etat, setEtat] = useState('')
  const [meuble, setMeuble] = useState<boolean | null>(null)
  const [nbChambres, setNbChambres] = useState('')

  // Photos existantes (URLs Supabase) + nouvelles (File)
  const [photosExistantes, setPhotosExistantes] = useState<string[]>([])   // URLs conservées
  const [photosSuppr, setPhotosSuppr] = useState<string[]>([])             // URLs à supprimer du Storage
  const [nouvellesPhotos, setNouvellesPhotos] = useState<File[]>([])       // Nouveaux fichiers
  const [nouveauxPreviews, setNouveauxPreviews] = useState<string[]>([])   // Previews des nouveaux fichiers

  // Charge l'annonce et vérifie que l'utilisateur en est propriétaire
  useEffect(() => {
    async function charger() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/compte'); return }

      const { data: annonce, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)   // RLS côté client aussi — rejette si pas propriétaire
        .single()

      if (error || !annonce) {
        // Annonce introuvable ou pas propriétaire
        router.replace('/compte/mes-annonces')
        return
      }

      const a = annonce as Listing
      setTitre(a.titre)
      setDescription(a.description ?? '')
      setCategorie(a.categorie)
      setSousCategorie(a.sous_categorie)
      setPrix(String(a.prix))
      setVille(a.ville ?? '')
      setKilometrage(a.kilometrage ? String(a.kilometrage) : '')
      setBoiteVitesse(a.boite_vitesse ?? '')
      setCarburant(a.carburant ?? '')
      setTypeBien(a.type_bien ?? '')
      setSurface(a.surface ? String(a.surface) : '')
      setEtat(a.etat ?? '')
      setMeuble(a.meuble ?? null)
      setNbChambres(a.nb_chambres ? String(a.nb_chambres) : '')
      setPhotosExistantes(a.photos ?? [])
      setChargement(false)
    }
    charger()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // Convertit en WebP avant upload (même logique que /vendre)
  async function convertirEnWebP(fichier: File): Promise<File> {
    return new Promise((resolve) => {
      const img = new Image()
      const urlTemp = URL.createObjectURL(fichier)
      img.onload = () => {
        URL.revokeObjectURL(urlTemp)
        const LARGEUR_MAX = 1200
        let largeur = img.naturalWidth
        let hauteur = img.naturalHeight
        if (largeur > LARGEUR_MAX) {
          hauteur = Math.round((hauteur * LARGEUR_MAX) / largeur)
          largeur = LARGEUR_MAX
        }
        const canvas = document.createElement('canvas')
        canvas.width = largeur
        canvas.height = hauteur
        canvas.getContext('2d')!.drawImage(img, 0, 0, largeur, hauteur)
        canvas.toBlob((blob) => {
          if (!blob) { resolve(fichier); return }
          const nomBase = fichier.name.replace(/\.[^.]+$/, '')
          resolve(new File([blob], `${nomBase}.webp`, { type: 'image/webp' }))
        }, 'image/webp', 0.85)
      }
      img.onerror = () => { URL.revokeObjectURL(urlTemp); resolve(fichier) }
      img.src = urlTemp
    })
  }

  async function handlePhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    const totalActuel = photosExistantes.length + nouvellesPhotos.length
    const restantes = 3 - totalActuel
    const nouvelles = files.slice(0, restantes)
    const converties = await Promise.all(nouvelles.map(convertirEnWebP))
    setNouvellesPhotos((prev) => [...prev, ...converties])
    setNouveauxPreviews((prev) => [...prev, ...converties.map((f) => URL.createObjectURL(f))])
  }

  // Retire une photo existante (sera supprimée du Storage au submit)
  function retirerPhotoExistante(url: string) {
    setPhotosExistantes((prev) => prev.filter((u) => u !== url))
    setPhotosSuppr((prev) => [...prev, url])
  }

  // Retire une nouvelle photo pas encore uploadée
  function retirerNouvellePhoto(index: number) {
    setNouvellesPhotos((prev) => prev.filter((_, i) => i !== index))
    setNouveauxPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErreur('')
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setErreur('Session expirée, reconnectez-vous.'); setLoading(false); return }

      // 1. Supprime les photos retirées du Storage
      if (photosSuppr.length > 0) {
        const chemins = photosSuppr
          .map((url) => url.match(/annonces-photos\/(.+)$/)?.[1])
          .filter(Boolean) as string[]
        if (chemins.length > 0) {
          await supabase.storage.from('annonces-photos').remove(chemins)
        }
      }

      // 2. Upload des nouvelles photos
      const nouvellesUrls: string[] = []
      for (const photo of nouvellesPhotos) {
        const ext = photo.name.split('.').pop()
        const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('annonces-photos')
          .upload(path, photo, { upsert: false })
        if (uploadError) throw uploadError
        const { data: urlData } = supabase.storage.from('annonces-photos').getPublicUrl(path)
        nouvellesUrls.push(urlData.publicUrl)
      }

      // 3. Tableau final des photos (conservées + nouvelles)
      const photosFinal = [...photosExistantes, ...nouvellesUrls]

      // 4. UPDATE de l'annonce — WHERE id = id AND user_id = user.id (RLS)
      const { error: updateError } = await supabase
        .from('listings')
        .update({
          titre,
          description: description || null,
          prix: Number(prix),
          categorie: categorie as 'vehicule' | 'immobilier' | 'maison',
          sous_categorie: sousCategorie,
          ville: ville || null,
          photos: photosFinal,
          boite_vitesse: (boiteVitesse || null) as 'automatique' | 'manuelle' | null,
          kilometrage: kilometrage ? Number(kilometrage) : null,
          carburant: (carburant || null) as 'essence' | 'diesel' | 'hybride' | 'électrique' | null,
          type_bien: (typeBien || null) as 'maison' | 'appartement' | 'commerce' | null,
          surface: surface ? Number(surface) : null,
          etat: (etat || null) as 'neuf' | 'bon état' | 'à réparer' | null,
          meuble: meuble,
          nb_chambres: nbChambres ? Number(nbChambres) : null,
        })
        .eq('id', id)
        .eq('user_id', user.id)

      if (updateError) throw updateError

      router.push(`/annonce/${id}`)
    } catch (err: unknown) {
      setErreur(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const totalPhotos = photosExistantes.length + nouvellesPhotos.length

  if (chargement) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto" style={{ paddingBottom: 96 }}>
      <header className="sticky top-0 bg-white z-40 px-4 pt-4 pb-3 border-b border-gray-100 flex items-center gap-3">
        <button onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5 text-text-main" />
        </button>
        <h1 className="font-bold text-lg text-text-main">Modifier l&apos;annonce</h1>
      </header>

      <form onSubmit={handleSubmit} className="px-4 py-4 space-y-5">

        {erreur && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-[6px] px-4 py-3">
            {erreur}
          </div>
        )}

        {/* Photos */}
        <div>
          <label className="block text-sm font-semibold text-text-main mb-2">
            Photos <span className="text-text-muted font-normal">(max 3)</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {/* Photos existantes conservées */}
            {photosExistantes.map((url) => (
              <div key={url} className="relative aspect-square rounded-[6px] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => retirerPhotoExistante(url)}
                  className="absolute top-1 right-1 bg-black/50 rounded-full p-0.5">
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
            {/* Nouvelles photos */}
            {nouveauxPreviews.map((src, i) => (
              <div key={`new-${i}`} className="relative aspect-square rounded-[6px] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => retirerNouvellePhoto(i)}
                  className="absolute top-1 right-1 bg-black/50 rounded-full p-0.5">
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
            {/* Bouton ajouter si < 3 photos */}
            {totalPhotos < 3 && (
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-[6px] border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 bg-card">
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
            className="w-full border border-gray-200 rounded-[6px] px-4 py-3 text-sm outline-none focus:border-primary transition-colors" />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-text-main mb-1.5">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="Décrivez votre article..." rows={4}
            className="w-full border border-gray-200 rounded-[6px] px-4 py-3 text-sm outline-none focus:border-primary transition-colors resize-none" />
        </div>

        {/* Catégorie */}
        <div>
          <label className="block text-sm font-semibold text-text-main mb-1.5">Catégorie *</label>
          <select value={categorie} onChange={(e) => { setCategorie(e.target.value); setSousCategorie('') }} required
            className="w-full border border-gray-200 rounded-[6px] px-4 py-3 text-sm outline-none focus:border-primary transition-colors bg-white">
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
              className="w-full border border-gray-200 rounded-[6px] px-4 py-3 text-sm outline-none focus:border-primary transition-colors bg-white">
              <option value="">Choisir une sous-catégorie</option>
              {sousCategories[categorie].map((sc) => (
                <option key={sc} value={sc}>{sc}</option>
              ))}
            </select>
          </div>
        )}

        {/* Champs véhicule */}
        {categorie === 'vehicule' && (
          <>
            <div>
              <label className="block text-sm font-semibold text-text-main mb-1.5">Kilométrage</label>
              <input value={kilometrage} onChange={(e) => setKilometrage(e.target.value)}
                type="number" placeholder="Ex: 45000"
                className="w-full border border-gray-200 rounded-[6px] px-4 py-3 text-sm outline-none focus:border-primary transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-main mb-2">Boîte de vitesse</label>
              <div className="flex gap-4">
                {['automatique', 'manuelle'].map((bv) => (
                  <label key={bv} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={boiteVitesse === bv} onChange={() => setBoiteVitesse(bv)} className="accent-primary" />
                    <span className="text-sm capitalize">{bv}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-main mb-1.5">Carburant</label>
              <select value={carburant} onChange={(e) => setCarburant(e.target.value)}
                className="w-full border border-gray-200 rounded-[6px] px-4 py-3 text-sm outline-none focus:border-primary transition-colors bg-white">
                <option value="">Choisir</option>
                <option value="essence">Essence</option>
                <option value="diesel">Diesel</option>
                <option value="hybride">Hybride</option>
                <option value="électrique">Électrique</option>
              </select>
            </div>
          </>
        )}

        {/* Champs immobilier */}
        {categorie === 'immobilier' && sousCategorie !== 'Commerce' && (
          <>
            <div>
              <label className="block text-sm font-semibold text-text-main mb-1.5">Type de bien</label>
              <select value={typeBien} onChange={(e) => setTypeBien(e.target.value)}
                className="w-full border border-gray-200 rounded-[6px] px-4 py-3 text-sm outline-none focus:border-primary transition-colors bg-white">
                <option value="">Choisir</option>
                <option value="maison">Maison</option>
                <option value="appartement">Appartement</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-main mb-1.5">Surface (m²)</label>
              <input value={surface} onChange={(e) => setSurface(e.target.value)}
                type="number" placeholder="Ex: 85"
                className="w-full border border-gray-200 rounded-[6px] px-4 py-3 text-sm outline-none focus:border-primary transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-main mb-1.5">Nombre de chambres</label>
              <input value={nbChambres} onChange={(e) => setNbChambres(e.target.value)}
                type="number" placeholder="Ex: 3" min="0"
                className="w-full border border-gray-200 rounded-[6px] px-4 py-3 text-sm outline-none focus:border-primary transition-colors" />
            </div>
            {(sousCategorie === 'Location' || sousCategorie === 'Location Saisonnière') && (
              <div>
                <label className="block text-sm font-semibold text-text-main mb-2">Meublé</label>
                <div className="flex gap-4">
                  {[{ label: 'Meublé', val: true }, { label: 'Non meublé', val: false }].map(({ label, val }) => (
                    <label key={label} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" checked={meuble === val} onChange={() => setMeuble(val)} className="accent-primary" />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Champs maison */}
        {categorie === 'maison' && (
          <div>
            <label className="block text-sm font-semibold text-text-main mb-2">État</label>
            <div className="flex gap-4 flex-wrap">
              {['neuf', 'bon état', 'à réparer'].map((e) => (
                <label key={e} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={etat === e} onChange={() => setEtat(e)} className="accent-primary" />
                  <span className="text-sm capitalize">{e}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Prix */}
        <div>
          <label className="block text-sm font-semibold text-text-main mb-1.5">Prix (RS) *</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-text-muted font-medium">Rs</span>
            <input value={prix} onChange={(e) => setPrix(e.target.value)}
              type="number" placeholder="0" required min="0"
              className="w-full border border-gray-200 rounded-[6px] pl-10 pr-4 py-3 text-sm outline-none focus:border-primary transition-colors" />
          </div>
        </div>

        {/* Ville */}
        <div>
          <label className="block text-sm font-semibold text-text-main mb-1.5">Ville</label>
          <CityInput
            value={ville}
            onChange={setVille}
            className="w-full border border-gray-200 rounded-[6px] px-4 py-3 text-sm outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Bouton enregistrer */}
        <button type="submit" disabled={loading || !categorie || !sousCategorie || !titre || !prix}
          className="w-full bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-[6px] transition-colors text-sm mt-2">
          {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </button>

      </form>
    </div>
  )
}
