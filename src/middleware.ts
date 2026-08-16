import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { createServerClient } from '@supabase/ssr';

const intlMiddleware = createIntlMiddleware({
  locales: ['uz', 'ru', 'en'],
  defaultLocale: 'uz',
  localePrefix: 'always',
  localeDetection: false,
});

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin route protection (skip login page itself)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(_cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
            // Read-only in middleware — handled by response below
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Apply i18n middleware for non-admin, non-api routes
  if (!pathname.startsWith('/admin') && !pathname.startsWith('/api')) {
    // Issue a 308 permanent redirect for bare root so Google passes ranking credit
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/uz', request.url), 308);
    }
    return intlMiddleware(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|_vercel|.*\..*).*)'],
};
