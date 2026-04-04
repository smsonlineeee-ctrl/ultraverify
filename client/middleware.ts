import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const userCookie = request.cookies.get('user-auth');
  const adminCookie = request.cookies.get('admin-auth');

  // Protect User Dashboard routes
  if (pathname.startsWith('/dashboard')) {
    if (!userCookie) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Redirect to dashboard if logged in user visits login/signup
  if ((pathname === '/login' || pathname === '/signup') && userCookie) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Protect Admin routes (skip /admin/login)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    if (!adminCookie) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Handle user logout
  if (pathname === '/logout') {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('user-auth');
    return response;
  }

  // Handle admin logout
  if (pathname === '/admin/logout') {
    const response = NextResponse.redirect(new URL('/admin/login', request.url));
    response.cookies.delete('admin-auth');
    return response;
  }

  // Redirect to admin dashboard if logged in admin visits admin/login
  if (pathname === '/admin/login' && adminCookie) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/login', '/signup', '/logout', '/admin/logout'],
};
