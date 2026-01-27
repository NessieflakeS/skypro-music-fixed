import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  const { pathname } = request.nextUrl

  const protectedPaths = ['/', '/favorites', '/playlist']
  const isProtectedPath = protectedPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  )

  const authPaths = ['/signin', '/signup']
  const isAuthPath = authPaths.includes(pathname)

  if (!token && isProtectedPath) {
    console.log('No token, redirecting to signin');
    return NextResponse.redirect(new URL('/signin', request.url))
  }

  if (token && isAuthPath) {
    console.log('Token exists, redirecting to home');
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