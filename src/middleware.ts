import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers'; // Import cookies

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const cookieStore = cookies(); // Get cookie store

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll(); // Use the correct cookies API
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            // Use `request.cookies.set` method available in Next.js 13+ middleware
            // response.cookies.set(name, value, options) // This causes issues in newer Next.js versions with App Router
            // Instead, let the server components handle setting cookies via the response object passed back
          });
          // The session update happens implicitly via the Supabase client interactions below
        },
      },
    }
  );

  // Attempt to get the session to refresh it if needed
  const { data: { session } } = await supabase.auth.getSession();

  // Define protected and public routes
  const { pathname } = request.nextUrl;
  const protectedRoutes = ['/', '/items']; // Add other routes that need protection
  const isProtectedRoute = protectedRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`));
  const isAuthRoute = pathname === '/login' || pathname.startsWith('/auth/');

  // Redirect logic
  if (!session && isProtectedRoute) {
    // Redirect unauthenticated users trying to access protected routes to login
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set(`next`, pathname); // Optional: redirect back after login
    return NextResponse.redirect(redirectUrl);
  }

  if (session && isAuthRoute && pathname !== '/auth/callback') {
    // Redirect authenticated users trying to access login/auth routes back to home
    // Avoid redirecting from the callback route itself
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/';
    return NextResponse.redirect(redirectUrl);
  }

  // Important: The response object must be returned for cookie handling to work correctly
  // The createServerClient wrapper handles setting the cookies on the response object
  // by potentially modifying the response passed through NextResponse.next()
  // In Next.js 14+, managing response cookies directly in middleware is tricky,
  // rely on the server client's integration with the request/response cycle.

  // Re-create the server client *with the response object* to allow it to set cookies
  const supabaseWithResponse = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  // Refresh session - this client instance *can* set cookies on the response
  await supabaseWithResponse.auth.getSession();

  return response;
}

// Configure the middleware matcher
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more exceptions.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}; 