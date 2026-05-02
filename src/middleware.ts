import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Middleware Supabase — rafraîchit la session à chaque requête
// Nécessaire pour que les cookies de session restent valides (Safari inclus)
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Met à jour les cookies sur la requête et la réponse
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Rafraîchit le token si expiré — ne pas supprimer cette ligne
  await supabase.auth.getUser()

  return supabaseResponse
}

export const config = {
  matcher: [
    // Exclut les fichiers statiques, images, la route OAuth callback, et les pages marketing
    // Important : le middleware ne doit PAS intercepter /auth/callback car
    // getUser() peut interférer avec l'échange du code PKCE (bug Safari)
    '/((?!_next/static|_next/image|favicon.ico|auth/callback|waitlist|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
