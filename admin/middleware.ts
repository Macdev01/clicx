import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/shared/config/firebase'

export async function middleware(request: NextRequest) {
  // Get the current path
  const path = request.nextUrl.pathname

  // Paths that don't require authentication
  const isPublicPath = path.startsWith('/auth/')

  // Get the token from the session cookie
  const token = request.cookies.get('__session')?.value

  // If the user is not authenticated and trying to access a protected route
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  // If the user is authenticated and trying to access auth pages
  if (token && isPublicPath) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

// Configure which paths the middleware should run on
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