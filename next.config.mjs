import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
    ],
  },
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        {
          key: 'Content-Security-Policy',
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com",
            "img-src 'self' data: blob: https://*.supabase.co https://supabase.co",
            "connect-src 'self' https://*.supabase.co https://api.telegram.org https://api.groq.com",
            "frame-ancestors 'self'",
          ].join('; '),
        },
      ],
    }];
  },
  async redirects() {
    const pages = ['scholarships', 'universities', 'results', 'contact'];
    const redirects = pages.map(page => ({
      source: `/${page}`,
      destination: `/uz/${page}`,
      permanent: true,
    }));
    // blog → news (blog page does not exist)
    redirects.push({ source: '/blog', destination: '/uz/news', permanent: true });
    return redirects;
  },
};

export default withNextIntl(nextConfig);
