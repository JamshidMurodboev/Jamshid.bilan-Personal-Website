import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['uz', 'ru', 'en'],
  defaultLocale: 'uz',
  localePrefix: 'always',
});

export const config = {
  matcher: ['/((?!_next|_vercel|api|.*\\..*).*)']
};
