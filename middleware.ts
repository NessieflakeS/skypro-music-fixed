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
  
  console.log('Middleware проверка:', { 
    pathname, 
    token: token ? 'есть' : 'нет', 
    isProtectedPath,
    cookies: Array.from(request.cookies.getAll()).map(c => c.name)
  })
  
  if (!token && isProtectedPath) {
    console.log('Редирект на /signin - нет токена')
    const signinUrl = new URL('/signin', request.url);
    signinUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(signinUrl);
  }
  
  if (token && isAuthPath) {
    console.log('Редирект на / - уже авторизован')
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/favorites', '/signin', '/signup']
}