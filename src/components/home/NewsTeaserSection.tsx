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
    <section className="section-pad border-t border-line">
      <div className="container-page">
        <div className="flex items-end justify-between gap-6 mb-10">
          <h2 className="display text-3xl sm:text-4xl">{t('news.title')}</h2>
          <Link href={`/${locale}/news`} className="arrow-link whitespace-nowrap mb-1">
            {t('news.viewAll')}<span className="arr">→</span>
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {news.map(post => {
            const title = (post as any)[`title_${locale}`] || post.title_uz;
            const body = (post as any)[`body_${locale}`] || post.body_uz;
            return (
              <Link
                key={post.id}
                href={`/${locale}/news/${post.id}`}
                className="card-e p-6 flex flex-col gap-2 group"
              >
                {post.published_at && (
                  <span className="text-xs text-muted-e">{formatDate(post.published_at)}</span>
                )}
                <h3 className="font-display text-xl text-heading leading-snug line-clamp-2 group-hover:text-accent transition-colors">{title}</h3>
                <p className="text-sm text-body line-clamp-3 flex-1">{body}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
