import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import type { NewsPost } from '@/lib/supabase/types';
import { formatDate } from '@/lib/format';
import PageNav from '@/components/shared/PageNav';
import MediaLinksSection from '@/components/shared/MediaLinksSection';
import { isUUID } from '@/lib/slugify';

export default async function NewsPostPage({ params: { locale, id } }: { params: { locale: string; id: string } }) {
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'common' });

  const supabase = createClient();
  let post: NewsPost | null = null;

  if (isUUID(id)) {
    const { data } = await supabase.from('news_posts').select('*').eq('id', id).eq('published', true).single();
    post = data as NewsPost | null;
  } else {
    const { data } = await supabase.from('news_posts').select('*').eq('slug', id).eq('published', true).single();
    post = data as NewsPost | null;
  }

  if (!post) notFound();

  const title = (post as any)[`title_${locale}`] || post.title_uz;
  const body = (post as any)[`body_${locale}`] || post.body_uz;
  const photos: string[] = post.photo_urls ?? [];
  const mediaLinks = post.media_links ?? [];

  return (
    <div className="min-h-screen bg-[#f0f9f8] dark:bg-[#0d1117] py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageNav />
        {post.cover_url && (
          <div className="relative w-full h-64 rounded-2xl mt-4 mb-6 overflow-hidden">
            <Image src={post.cover_url} alt={title} fill className="object-cover" />
          </div>
        )}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-4 mb-2">{title}</h1>
        {post.published_at && (
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">{formatDate(post.published_at)}</p>
        )}
        <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-line mb-8">{body}</div>

        {/* Photo gallery */}
        {photos.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('photos')}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {photos.map((url, i) => (
                <div key={i} className="relative aspect-[4/3] w-full rounded-xl overflow-hidden">
                  <Image src={url} alt={`${title} ${i + 1}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        <MediaLinksSection links={mediaLinks} locale={locale} heading={t('mediaLinks')} />
      </div>
    </div>
  );
}
