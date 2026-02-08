import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  const { pathname } = request.nextUrl

  const authPaths = ['/signin', '/signup']
  const isAuthPath = authPaths.includes(pathname)

  const protectedPaths = ['/favorites'] 
  const isProtectedPath = protectedPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  )

  if (!token && isProtectedPath) {
    return NextResponse.redirect(new URL('/signin', request.url))
  }

  if (token && isAuthPath) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}