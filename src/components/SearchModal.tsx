'use client'

import Link from 'next/link'
import { Search } from 'lucide-react'

// Barre de recherche — mène à la page catégories complète
export default function SearchModal() {
  return (
    <Link
      href="/categories"
      className="w-full flex items-center gap-2 bg-white border border-gray-200 rounded-[6px] px-4 py-2.5 text-left"
      style={{ textDecoration: 'none' }}
    >
      <Search className="w-4 h-4 flex-shrink-0" style={{ color: '#888888' }} />
      <span className="text-sm" style={{ color: '#888888' }}>Recherche sur Zafer</span>
    </Link>
  )
}
