import { MetadataRoute } from 'next';

const BASE_URL = 'https://jamshidbilan.uz';
const LOCALES = ['uz', 'ru', 'en'];

const STATIC_PAGES = ['', '/scholarships', '/universities', '/results', '/news', '/services', '/contact'];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  // Root canonical for uz (bare domain)
  entries.push({ url: BASE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 });

  for (const locale of LOCALES) {
    for (const page of STATIC_PAGES) {
      entries.push({
        url: `${BASE_URL}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === '' ? 'weekly' : 'monthly',
        priority: page === '' ? (locale === 'uz' ? 1.0 : 0.9) : 0.8,
      });
    }
  }

  return entries;
}
