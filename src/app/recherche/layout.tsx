'use client'

import Link from 'next/link'

// Enveloppe la page /recherche dans un bottom-sheet modal à 80%
// Un clic sur le backdrop ramène à l'accueil
export default function RechercheLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop semi-transparent — clic → accueil */}
      <Link href="/" className="absolute inset-0 bg-black/30" aria-label="Fermer" />

      {/* Panel modal 80% depuis le bas */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-white shadow-2xl flex flex-col"
        style={{ height: '80vh', borderRadius: '20px 20px 0 0' }}
      >
        {/* Poignée visuelle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
