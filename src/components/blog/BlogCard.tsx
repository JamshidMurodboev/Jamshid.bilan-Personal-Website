import Link from 'next/link';
import { useLocale } from 'next-intl';
import type { BlogPost } from '@/lib/supabase/types';

export default function BlogCard({ post }: { post: BlogPost }) {
  const locale = useLocale();
  const title = (post as any)[`title_${locale}`] || post.title_uz;
  const excerpt = (post as any)[`excerpt_${locale}`] || post.excerpt_uz;
  return (
    <Link
      href={`/${locale}/blog/${post.slug}`}
      className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col gap-2 border border-gray-100 dark:border-gray-700"
    >
      <h3 className="font-semibold text-gray-900 dark:text-white hover:text-teal-700 dark:hover:text-teal-400 transition">{title}</h3>
      {excerpt && <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{excerpt}</p>}
      {post.published_at && <span className="text-xs text-gray-400 dark:text-gray-500">{new Date(post.published_at).toLocaleDateString()}</span>}
    </Link>
  );
}
