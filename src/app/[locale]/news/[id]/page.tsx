import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import type { NewsPost } from '@/lib/supabase/types';

export default async function NewsPostPage({ params: { locale, id } }: { params: { locale: string; id: string } }) {
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'common' });

  const supabase = createClient();
  const { data } = await supabase.from('news_posts').select('*').eq('id', id).eq('published', true).single();
  const post = data as NewsPost | null;

  if (!post) notFound();

  const title = (post as any)[`title_${locale}`] || post.title_uz;
  const body = (post as any)[`body_${locale}`] || post.body_uz;

  return (
    <div className="min-h-screen bg-[#faf7f2] dark:bg-gray-950 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href={`/${locale}/news`} className="text-sm text-teal-700 dark:text-teal-400 hover:underline">&larr; {t('back')}</Link>
        {post.cover_url && (
          <img src={post.cover_url} alt={title} className="w-full h-64 object-cover rounded-2xl mt-4 mb-6" />
        )}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-4 mb-2">{title}</h1>
        {post.published_at && (
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">{new Date(post.published_at).toLocaleDateString()}</p>
        )}
        <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-line">{body}</div>
      </div>
    </div>
  );
}
