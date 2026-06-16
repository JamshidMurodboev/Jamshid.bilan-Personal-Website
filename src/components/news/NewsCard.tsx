import { useLocale } from 'next-intl';
import type { NewsPost } from '@/lib/supabase/types';

export default function NewsCard({ post }: { post: NewsPost }) {
  const locale = useLocale();
  const title = (post as any)[`title_${locale}`] || post.title_uz;
  const body = (post as any)[`body_${locale}`] || post.body_uz;
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col gap-2">
      <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3">{body}</p>
      {post.published_at && <span className="text-xs text-gray-400 dark:text-gray-500">{new Date(post.published_at).toLocaleDateString()}</span>}
    </div>
  );
}
