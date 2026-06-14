import { setRequestLocale } from 'next-intl/server';
import NewsCard from '@/components/news/NewsCard';
import type { NewsPost } from '@/types';

const SAMPLE_NEWS: NewsPost[] = [
  { id: '1', title: 'Turkiye Burslari 2025 arizalari boshlandi', slug: 'turkiye-burslari-2025', category: 'deadline_alert', content: '', status: 'published', published_at: '2024-12-01T00:00:00Z', created_by: 'jamshid', created_at: '2024-12-01T00:00:00Z' },
];

export default function NewsPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  return (
    <div className="min-h-screen bg-[#faf7f2] dark:bg-gray-950 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Yangiliklar</h1>
        <div className="grid gap-6 sm:grid-cols-2">
          {SAMPLE_NEWS.map((n) => <NewsCard key={n.id} post={n} />)}
        </div>
      </div>
    </div>
  );
}
