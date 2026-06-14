import Link from 'next/link';
import { useLocale } from 'next-intl';
import type { BlogPost } from '@/types';

export default function BlogCard({ post }: { post: BlogPost }) {
  const locale = useLocale();
  return (
    <Link
      href={`/${locale}/blog/${post.slug}`}
      className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col gap-2 border border-gray-100 dark:border-gray-700"
    >
      <h3 className="font-semibold text-gray-900 dark:text-white hover:text-teal-700 dark:hover:text-teal-400 transition">{post.title}</h3>
      <div className="flex gap-3 text-xs text-gray-400 dark:text-gray-500">
        <span>{post.reading_time_minutes} daqiqa o&apos;qish</span>
        {post.published_at && <span>{new Date(post.published_at).toLocaleDateString()}</span>}
      </div>
    </Link>
  );
}
