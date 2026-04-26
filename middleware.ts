import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — required for Server Components to read up-to-date auth state
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const isAuthenticated = !!session;

  // Authenticated users hitting /login or /signup → redirect to /dashboard
  // Exception: /onboarding is for newly-authenticated Google users who have no profile yet
  if (
    isAuthenticated &&
    (pathname === '/login' || pathname === '/signup' || pathname === '/forgot-password')
  ) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Unauthenticated users hitting /onboarding → redirect to /login
  if (!isAuthenticated && pathname === '/onboarding') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Unauthenticated users hitting /dashboard or /admin → redirect to /login
  if (!isAuthenticated && (pathname.startsWith('/dashboard') || pathname.startsWith('/admin'))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     *   - _next/static (static files)
     *   - _next/image (image optimisation)
     *   - favicon.ico
     *   - /api/webhooks/** (Paystack webhook must not be blocked by auth)
     *   - /api/auth/callback (Supabase PKCE code exchange — password reset)
     *   - /auth/callback (Google OAuth code exchange)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/webhooks|api/auth/callback|auth/callback).*)',
  ],
};
