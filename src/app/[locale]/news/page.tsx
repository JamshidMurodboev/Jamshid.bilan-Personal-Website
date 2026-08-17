import { setRequestLocale, getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import NewsCard from '@/components/news/NewsCard';
import PageNav from '@/components/shared/PageNav';
import type { NewsPost } from '@/lib/supabase/types';

const SAMPLE_NEWS: NewsPost[] = [
  { id: '1', title_uz: 'Turkiye Burslari 2025 arizalari boshlandi', body_uz: "Turkiye Burslari 2025-yil arizalarini qabul qilishni boshladi. Muddatlarni o'tkazib yubormang.", published: true, published_at: '2024-12-01T00:00:00Z', created_at: '2024-12-01T00:00:00Z', updated_at: '2024-12-01T00:00:00Z' },
];

export default async function NewsPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'nav' });
  const hs = await getTranslations({ locale, namespace: 'homeSections.news' });

  let news: NewsPost[] = SAMPLE_NEWS;
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from('news_posts').select('*').eq('published', true).order('published_at', { ascending: false });
    if (!error && data && data.length > 0) news = data as NewsPost[];
  } catch {}

  return (
    <div className="min-h-screen bg-page">
      {/* Page hero */}
      <section className="pt-10 sm:pt-14 pb-10 sm:pb-14 border-b border-line">
        <div className="container-page">
          <PageNav backHref={`/${locale}#news`} />
          <p className="eyebrow mb-4 mt-4">{hs('title')}</p>
          <h1 className="display text-5xl sm:text-6xl mb-4">{t('news')}</h1>
          <p className="text-lg text-body max-w-2xl">{hs('subtitle')}</p>
        </div>
      </section>

      {/* Articles */}
      <section className="py-12 sm:py-16">
        <div className="container-page">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {news.map((n) => <NewsCard key={n.id} post={n} locale={locale} />)}
          </div>
        </div>
      </section>
    </div>
  );
}
