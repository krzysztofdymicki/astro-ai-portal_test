import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // W TYM MIEJSCU NIE WYKONUJ ŻADNYCH OPERACJI

  // IMPORTANT: DO NOT REMOVE auth.getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Dla niezalogowanych użytkowników: przekieruj na stronę główną, jeśli nie próbują dostać się
  // do strony logowania, rejestracji, resetowania hasła lub strony głównej
  if (
    !user && 
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/register') &&
    !request.nextUrl.pathname.startsWith('/reset-password') &&
    !request.nextUrl.pathname.startsWith('/astrologers') &&
    request.nextUrl.pathname !== '/'
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // Dla zalogowanych użytkowników: przekieruj na dashboard, jeśli próbują dostać się
  // do strony głównej, logowania, rejestracji lub resetowania hasła
  if (
    user && 
    (request.nextUrl.pathname === '/' || 
     request.nextUrl.pathname.startsWith('/login') || 
     request.nextUrl.pathname.startsWith('/register') ||
     request.nextUrl.pathname.startsWith('/reset-password'))
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}