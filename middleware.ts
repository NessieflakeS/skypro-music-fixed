import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  const { pathname } = request.nextUrl

  const publicPaths = ['/', '/playlist']
  const isPublicPath = publicPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  )

  const authPaths = ['/signin', '/signup']
  const isAuthPath = authPaths.includes(pathname)

  const protectedPaths = ['/favorites'] 
  const isProtectedPath = protectedPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  )

  if (!token && isProtectedPath) {
    console.log('No token for protected path, redirecting to signin');
    return NextResponse.redirect(new URL('/signin', request.url))
  }

  if (token && isAuthPath) {
    console.log('Token exists for auth page, redirecting to home');
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (isPublicPath) {
    return NextResponse.next()
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