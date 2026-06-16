import { setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import NewsCard from '@/components/news/NewsCard';
import type { NewsPost } from '@/types';

const SAMPLE_NEWS: NewsPost[] = [
  { id: '1', title: 'Turkiye Burslari 2025 arizalari boshlandi', slug: 'turkiye-burslari-2025', category: 'deadline_alert', content: '', status: 'published', published_at: '2024-12-01T00:00:00Z', created_by: 'jamshid', created_at: '2024-12-01T00:00:00Z' },
];

// Maps a DB row from `news_posts` into the legacy NewsPost shape expected by NewsCard.
// Uses locale-specific title_${locale}/body_${locale} columns, falling back to the uz columns.
// DB has no slug/category/created_by columns: a slug is synthesized from the id since NewsCard
// links to /news/{slug}, and category defaults to 'personal_update' (closest generic label).
function mapDbNewsPost(row: any, locale: string): NewsPost {
  const title = row[`title_${locale}`] || row.title_uz;
  const body = row[`body_${locale}`] || row.body_uz || '';
  return {
    id: String(row.id),
    title,
    slug: String(row.id),
    cover_image_url: row.cover_url ?? undefined,
    category: 'personal_update',
    content: body,
    status: 'published',
    published_at: row.published_at ?? undefined,
    created_by: 'jamshid',
    created_at: row.created_at,
  };
}

export default async function NewsPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);

  let news: NewsPost[] = SAMPLE_NEWS;
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('news_posts')
      .select('*')
      .eq('published', true)
      .order('published_at', { ascending: false });
    if (!error && data && data.length > 0) {
      news = data.map((row) => mapDbNewsPost(row, locale));
    }
  } catch {
    // keep sample fallback
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] dark:bg-gray-950 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Yangiliklar</h1>
        <div className="grid gap-6 sm:grid-cols-2">
          {news.map((n) => <NewsCard key={n.id} post={n} />)}
        </div>
      </div>
    </div>
  );
}
