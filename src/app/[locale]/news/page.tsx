import { setRequestLocale, getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import NewsCard from '@/components/news/NewsCard';
import type { NewsPost } from '@/lib/supabase/types';

const SAMPLE_NEWS: NewsPost[] = [
  { id: '1', title_uz: 'Turkiye Burslari 2025 arizalari boshlandi', body_uz: "Turkiye Burslari 2025-yil arizalarini qabul qilishni boshladi. Muddatlarni o'tkazib yubormang.", published: true, published_at: '2024-12-01T00:00:00Z', created_at: '2024-12-01T00:00:00Z', updated_at: '2024-12-01T00:00:00Z' },
];

export default async function NewsPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'nav' });

  let news: NewsPost[] = SAMPLE_NEWS;
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from('news_posts').select('*').eq('published', true).order('published_at', { ascending: false });
    if (!error && data && data.length > 0) news = data as NewsPost[];
  } catch {}

  return (
    <div className="min-h-screen bg-[#f0f9f8] dark:bg-[#0d1117] py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">{t('news')}</h1>
        <div className="grid gap-6 sm:grid-cols-2">
          {news.map((n) => <NewsCard key={n.id} post={n} />)}
        </div>
      </div>
    </div>
  );
}
