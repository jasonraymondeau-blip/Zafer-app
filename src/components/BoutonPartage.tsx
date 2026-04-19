'use client'

import { useState } from 'react'
import { Share2, Check } from 'lucide-react'

interface BoutonPartageProps {
  titre: string
  prix: string
}

export default function BoutonPartage({ titre, prix }: BoutonPartageProps) {
  const [copie, setCopie] = useState(false)

  async function handlePartage() {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title: titre, text: `${titre} — ${prix}`, url })
      } catch {
        // L'utilisateur a annulé — rien à faire
      }
    } else {
      try {
        await navigator.clipboard.writeText(url)
        setCopie(true)
        setTimeout(() => setCopie(false), 2000)
      } catch {
        // Fallback si clipboard non disponible
        setCopie(true)
        setTimeout(() => setCopie(false), 2000)
      }
    }
  }

  return (
    <div className="relative">
      <button
        onClick={handlePartage}
        aria-label="Partager cette annonce"
        className="bg-white/80 backdrop-blur-sm rounded-full p-2 shadow flex items-center justify-center"
        style={{ transition: 'transform 0.15s', transform: copie ? 'scale(0.9)' : 'scale(1)' }}
      >
        {copie
          ? <Check className="w-5 h-5 text-green-600" />
          : <Share2 className="w-5 h-5 text-text-main" />
        }
      </button>

      {/* Toast "Lien copié !" */}
      {copie && (
        <div
          style={{
            position: 'absolute',
            bottom: -34,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.75)',
            color: '#fff',
            fontSize: 12,
            fontWeight: 600,
            padding: '5px 12px',
            borderRadius: 20,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: 20,
          }}
        >
          Lien copié !
        </div>
      )}
    </div>
  )
}
