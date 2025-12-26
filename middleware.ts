import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Check for Supabase auth token in cookies
  const accessToken = req.cookies.get('sb-access-token')?.value || 
                     req.cookies.get('supabase-auth-token')?.value

  // Simple check - if no token and trying to access protected route, redirect to login
  // Note: This is a basic check. Full auth validation happens in page components
  if (!accessToken && !req.nextUrl.pathname.startsWith('/auth') && 
      !req.nextUrl.pathname.startsWith('/_next') && 
      req.nextUrl.pathname !== '/') {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}

