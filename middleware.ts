import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  const { pathname } = request.nextUrl

  const protectedPaths = ['/', '/favorites', '/playlist']
  const isProtectedPath = protectedPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  )

  if (pathname === '/signin' || pathname === '/signup') {
    return NextResponse.next()
  }

  if (!token && isProtectedPath) {
    return NextResponse.redirect(new URL('/signin', request.url))
  }

  if (token && (pathname === '/signin' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/signin',
    '/signup',
    '/favorites',
    '/playlist/:path*',
  ]
}