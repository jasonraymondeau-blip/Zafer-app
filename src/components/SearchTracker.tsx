'use client'

import { useEffect } from 'react'

// Sauvegarde la catégorie recherchée dans localStorage pour la section personnalisée
export default function SearchTracker({ categorie }: { categorie?: string }) {
  useEffect(() => {
    if (categorie) {
      localStorage.setItem('zafer_last_categorie', categorie)
    }
  }, [categorie])

  return null
}
