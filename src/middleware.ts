import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session')
  const { pathname } = request.nextUrl

  // Define public paths that don't require authentication
  const publicPaths = ['/login', '/api/auth/login', '/favicon.ico']
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path)) || pathname.startsWith('/_next') || pathname.match(/\.(svg|png|jpg|jpeg|gif|webp)$/)

  if (!session && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (session && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (except auth/login which is handled manually above, but we can exclude general api if needed, strictly we want to protect api too)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
