import Link from 'next/link';
import { useLocale } from 'next-intl';
import type { BlogPost } from '@/types';

export default function BlogCard({ post }: { post: BlogPost }) {
  const locale = useLocale();
  return (
    <Link href={`/${locale}/blog/${post.slug}`}
      className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col gap-2">
      <h3 className="font-semibold text-gray-900 hover:text-teal-700 transition">{post.title}</h3>
      <div className="flex gap-3 text-xs text-gray-400">
        <span>{post.reading_time_minutes} daqiqa o'qish</span>
        {post.published_at && <span>{new Date(post.published_at).toLocaleDateString()}</span>}
      </div>
    </Link>
  );
}
