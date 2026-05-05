import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');
  const isProtectedPage =
    pathname.startsWith('/decks') ||
    pathname.startsWith('/quiz') ||
    pathname.startsWith('/review') ||
    pathname.startsWith('/daily') ||
    pathname.startsWith('/profile');

  const authCookie = request.cookies.get('sb-access-token');

  if (!authCookie && isProtectedPage) {
    return NextResponse.next();
  }

  if (authCookie && isAuthPage) {
    return NextResponse.redirect(new URL('/decks', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/login', '/signup', '/decks/:path*', '/quiz/:path*', '/review', '/daily', '/profile'],
};
