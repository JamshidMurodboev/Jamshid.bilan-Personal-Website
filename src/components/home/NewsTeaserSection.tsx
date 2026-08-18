import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { formatDate } from '@/lib/format';
import type { NewsPost } from '@/lib/supabase/types';

export default async function NewsTeaserSection({ locale: localeProp }: { locale?: string }) {
  const locale = localeProp ?? await getLocale();
  const t = await getTranslations({ locale, namespace: 'homeSections' });

  let news: NewsPost[] = [];
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from('news_posts')
      .select('id,title_uz,title_ru,title_en,body_uz,body_ru,body_en,published_at')
      .eq('published', true)
      .order('published_at', { ascending: false })
      .limit(3);
    if (data && data.length > 0) news = data as NewsPost[];
  } catch {}

  if (news.length === 0) return null;

  return (
    <section className="py-16 px-4 bg-white dark:bg-[#0d1117]">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('news.title')}</h2>
          <Link
            href={`/${locale}/news`}
            className="text-sm font-semibold text-teal-700 dark:text-teal-400 hover:underline"
          >
            {t('news.viewAll')} →
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {news.map(post => {
            const title = (post as any)[`title_${locale}`] || post.title_uz;
            const body = (post as any)[`body_${locale}`] || post.body_uz;
            return (
              <Link
                key={post.id}
                href={`/${locale}/news/${post.id}`}
                className="bg-[#f0f9f8] dark:bg-[#161b22] rounded-2xl p-5 flex flex-col gap-2 border border-[#e2e8f0] dark:border-[#21262d] hover:shadow-md transition"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 hover:text-teal-700 dark:hover:text-teal-400 transition">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 flex-1">{body}</p>
                {post.published_at && (
                  <span className="text-xs text-gray-400 dark:text-gray-500">{formatDate(post.published_at)}</span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
