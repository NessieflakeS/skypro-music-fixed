import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  
  const { pathname } = request.nextUrl;
  
  const authPaths = ['/signin', '/signup']
  const isAuthPath = authPaths.includes(pathname)
  
  const protectedPaths = ['/favorites']
  const isProtectedPath = protectedPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  )
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/favorites', '/signin', '/signup']
}