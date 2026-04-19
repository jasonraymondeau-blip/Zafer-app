import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'

// Client Supabase singleton typé pour les composants navigateur
// Utilise @supabase/ssr pour stocker le verifier PKCE dans un cookie
// → compatible avec le Route Handler côté serveur et avec Safari
let client: ReturnType<typeof createBrowserClient<Database>> | null = null

export function createClient() {
  if (!client) {
    client = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return client
}
