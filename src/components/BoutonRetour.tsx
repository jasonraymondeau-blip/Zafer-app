'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

// Bouton retour qui utilise router.back() plutôt qu'un lien fixe
export default function BoutonRetour() {
  const router = useRouter()

  return (
    <button
      onClick={() => router.back()}
      aria-label="Retour"
      className="bg-white/80 rounded-full p-2"
    >
      <ArrowLeft className="w-5 h-5" style={{ color: '#404040' }} />
    </button>
  )
}
