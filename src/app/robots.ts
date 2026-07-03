import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api'],
      },
    ],
    sitemap: 'https://jamshidbilan.uz/sitemap.xml',
    host: 'https://jamshidbilan.uz',
  };
}
