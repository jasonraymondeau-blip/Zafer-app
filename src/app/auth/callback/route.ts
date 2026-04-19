import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { NextRequest } from 'next/server'
import type { Database } from '@/lib/database.types'
import type { CookieOptions } from '@supabase/ssr'

// Route Handler OAuth — reçoit le code PKCE de Supabase/Google
// Compatible Safari, Chrome, Firefox (flux PKCE via cookies)
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    // Collecte les cookies à définir pour les appliquer sur la réponse redirect
    const cookiesToApply: Array<{ name: string; value: string; options: CookieOptions }> = []

    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            // Lit le verifier PKCE depuis les cookies de la requête entrante
            return request.cookies.getAll()
          },
          setAll(incoming) {
            // Collecte les cookies de session — on les appliquera sur le redirect
            incoming.forEach(c => cookiesToApply.push(c))
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.session) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('telephone')
        .eq('id', data.session.user.id)
        .maybeSingle()

      const redirectPath = !profile?.telephone ? '/onboarding' : '/'
      const response = NextResponse.redirect(`${origin}${redirectPath}`)

      // Attache tous les cookies de session sur la réponse redirect
      cookiesToApply.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options)
      })

      return response
    }
  }

  // Fallback en cas d'erreur
  return NextResponse.redirect(`${origin}/compte`)
}
