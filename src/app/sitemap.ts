import { MetadataRoute } from 'next';

const BASE_URL = 'https://jamshidbilan.uz';
const LOCALES = ['uz', 'ru', 'en'];

const STATIC_PAGES = ['', '/scholarships', '/universities', '/results', '/blog', '/contact'];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    for (const page of STATIC_PAGES) {
      entries.push({
        url: `${BASE_URL}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === '' ? 'weekly' : 'monthly',
        priority: page === '' ? 1.0 : 0.8,
      });
    }
  }

  return entries;
}
