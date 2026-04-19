import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'

// Stockage cookie partagé entre Safari et le PWA iOS (même domaine)
// → le verifier PKCE reste accessible quand Google OAuth redirige via Safari
const cookieStorage = {
  getItem(key: string): string | null {
    if (typeof document === 'undefined') return null
    const match = document.cookie.match(new RegExp('(?:^|; )' + key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=([^;]*)'))
    return match ? decodeURIComponent(match[1]) : null
  },
  setItem(key: string, value: string): void {
    if (typeof document === 'undefined') return
    document.cookie = `${key}=${encodeURIComponent(value)};path=/;max-age=3600;SameSite=Lax`
  },
  removeItem(key: string): void {
    if (typeof document === 'undefined') return
    document.cookie = `${key}=;path=/;max-age=0`
  },
}

let client: ReturnType<typeof createBrowserClient<Database>> | null = null

export function createClient() {
  if (!client) {
    client = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { storage: cookieStorage, flowType: 'pkce' } }
    )
  }
  return client
}
