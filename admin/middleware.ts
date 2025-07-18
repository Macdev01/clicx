import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const session = request.cookies.get('__session')
  const isSignInPage = request.nextUrl.pathname === '/auth/signin'
  
  // If there's no session and the page is not signin, redirect to signin
  if (!session && !isSignInPage) {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  // If there's a session and user is on signin page, redirect to home
  if (session && isSignInPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 