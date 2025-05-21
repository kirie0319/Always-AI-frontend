import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  console.log('Middleware executing for path:', request.nextUrl.pathname);
  
  const token = request.cookies.get('access_token');
  console.log('Token in cookies:', token ? 'exists' : 'not found');
  
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                    request.nextUrl.pathname.startsWith('/register');
  console.log('Is auth page:', isAuthPage);

  // If trying to access auth pages while logged in, redirect to home
  if (isAuthPage && token) {
    console.log('Redirecting from auth page to home');
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If trying to access protected pages while logged out, redirect to login
  if (!isAuthPage && !token) {
    console.log('Redirecting to login page');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  console.log('Middleware allowing request to proceed');
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 