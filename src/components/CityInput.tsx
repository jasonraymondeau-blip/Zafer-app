'use client'

import { useState, useRef, useEffect } from 'react'
import { VILLES_MAURICE, normaliseVille, suggererVilles } from '@/lib/cities'

interface CityInputProps {
  value: string
  onChange: (ville: string) => void
  placeholder?: string
  className?: string
}

// Cherche la ville canonique la plus proche d'une saisie libre
// Retourne le nom exact (ex: "Grand-Baie") ou null si aucune correspondance
function trouverVilleCanonique(saisie: string): string | null {
  if (!saisie.trim()) return null
  const nq = normaliseVille(saisie)

  // 1. Correspondance normalisée exacte
  const exact = VILLES_MAURICE.find((v) => normaliseVille(v) === nq)
  if (exact) return exact

  // 2. La saisie normalisée est contenue dans le nom de ville normalisé
  const contient = VILLES_MAURICE.find((v) => normaliseVille(v).includes(nq))
  if (contient) return contient

  // 3. Le nom de ville normalisé commence par la saisie normalisée (min 4 chars)
  if (nq.length >= 4) {
    const prefixe = VILLES_MAURICE.find((v) => normaliseVille(v).startsWith(nq.slice(0, 4)))
    if (prefixe) return prefixe
  }

  return null
}

// Champ ville avec autocomplétion et validation — standardise les noms de ville à l'île Maurice
export default function CityInput({ value, onChange, placeholder = 'Ex: Grand-Baie', className = '' }: CityInputProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [open, setOpen] = useState(false)
  const [erreur, setErreur] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  // Ferme la liste si on clique en dehors
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    onChange(val)
    setErreur('')
    const s = suggererVilles(val)
    setSuggestions(s)
    setOpen(s.length > 0)
  }

  function handleSelect(ville: string) {
    onChange(ville)
    setSuggestions([])
    setOpen(false)
    setErreur('')
  }

  // Validation au blur : auto-corrige si possible, sinon signale l'erreur
  function handleBlur() {
    setOpen(false)
    if (!value.trim()) return

    const canonique = trouverVilleCanonique(value)
    if (canonique) {
      // Auto-correction silencieuse vers le nom officiel
      onChange(canonique)
      setErreur('')
    } else {
      setErreur('Ville non reconnue — choisissez dans la liste')
      onChange('')
    }
  }

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onFocus={() => { if (suggestions.length > 0) setOpen(true) }}
        onBlur={handleBlur}
        placeholder={placeholder}
        autoComplete="off"
        className={className}
        style={erreur ? { borderColor: '#ef4444' } : undefined}
      />

      {erreur && (
        <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{erreur}</p>
      )}

      {open && (
        <ul
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            background: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: 12,
            boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
            zIndex: 100,
            padding: '4px 0',
            margin: 0,
            listStyle: 'none',
            maxHeight: 220,
            overflowY: 'auto',
          }}
        >
          {suggestions.map((ville) => (
            <li key={ville}>
              <button
                type="button"
                onMouseDown={() => handleSelect(ville)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 16px',
                  fontSize: 14,
                  color: '#1A1A1A',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#F5F5F5')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                {ville}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
