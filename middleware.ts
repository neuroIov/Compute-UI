import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Define protected routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/profile',
  '/settings',
  '/admin',
  '/wallet',
  '/gpu-marketplace'
];

// Define auth routes (login/register pages)
const AUTH_ROUTES = [
  '/signin',
  '/signup',
];

// Define public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/about',
  '/contact',
  '/',
  '/api/auth'
];

export async function middleware(request: NextRequest) {
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  const path = request.nextUrl.pathname;

  // Check if it's an API route (except auth routes)
  if (path.startsWith('/api') && !path.startsWith('/api/auth')) {
    if (!token) {
      return new NextResponse(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { 'content-type': 'application/json' } }
      );
    }
    return NextResponse.next();
  }

  // Allow public routes
  if (PUBLIC_ROUTES.some(route => path.startsWith(route))) {
    return NextResponse.next();
  }

  // Redirect authenticated users away from auth pages
  if (token && AUTH_ROUTES.some(route => path.startsWith(route))) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Check protected routes
  if (PROTECTED_ROUTES.some(route => path.startsWith(route))) {
    if (!token) {
      const signInUrl = new URL('/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', path);
      return NextResponse.redirect(signInUrl);
    }
    
    // Check for admin routes
    if (path.startsWith('/admin') && token.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

// Configure matcher for middleware
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};