import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Clone the request headers
  const requestHeaders = new Headers(request.headers);
  
  // Add the Accept header if it's a request to Supabase
  if (request.nextUrl.href.includes('supabase.co')) {
    requestHeaders.set('Accept', 'application/json');
  }

  // Return the response with the modified headers
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    // Match all API routes
    '/api/:path*',
    // Match all Supabase requests (client-side)
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 