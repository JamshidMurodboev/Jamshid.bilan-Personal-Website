import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
    ],
  },
  async redirects() {
    const pages = ['scholarships', 'universities', 'results', 'blog', 'contact'];
    return pages.map(page => ({
      source: `/${page}`,
      destination: `/uz/${page}`,
      permanent: true,
    }));
  },
};

export default withNextIntl(nextConfig);
