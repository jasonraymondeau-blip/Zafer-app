'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'

// Salutation dynamique — affiche le prénom si l'utilisateur est connecté
export default function Greeting() {
  const [prenom, setPrenom] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(async ({ data }) => {
      const user = data.session?.user
      if (!user) return

      // Prénom depuis user_metadata (Google) ou table profiles
      const metaPrenom = user.user_metadata?.prenom as string | undefined
      if (metaPrenom) {
        setPrenom(metaPrenom)
        return
      }

      // Sinon récupère depuis la table profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('prenom')
        .eq('id', user.id)
        .single()

      if (profile?.prenom) setPrenom(profile.prenom)
    })
  }, [])

  return (
    <div>
      <p style={{ fontSize: 26, fontWeight: 500, color: '#1A1A1A', lineHeight: 1.2 }}>
        Bonjour{prenom ? ` ${prenom},` : ','}
      </p>
      <p style={{ fontSize: 18, fontWeight: 400, color: '#888888', marginTop: 6, marginBottom: 16, lineHeight: 1.4 }}>
        Achetez, vendez simplement<br />avec Zafer&nbsp;🇲🇺
      </p>
    </div>
  )
}
