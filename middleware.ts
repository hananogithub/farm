import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Refresh session if expired - this ensures cookies are synced
  const { data: { session }, error: authError } = await supabase.auth.getSession()
  const pathname = req.nextUrl.pathname
  
  // Log for debugging (only in development)
  if (process.env.NODE_ENV === 'development') {
    const cookieNames = req.cookies.getAll().map(c => c.name).join(', ')
    console.log('Middleware - Path:', pathname, 'Session:', session ? 'exists' : 'none', 'Error:', authError?.message, 'Cookies:', cookieNames)
  }

  // Define public routes that don't require authentication
  const publicRoutes = ['/auth/login', '/auth/signup']

  // Redirect to login if no session and not on a public route
  if (!session && !publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}

