import Link from 'next/link';
import { useLocale } from 'next-intl';
import type { NewsPost } from '@/types';

const CATEGORY_LABELS: Record<string, string> = {
  deadline_alert: 'Muddat ogohlantirishisi',
  personal_update: 'Shaxsiy yangilik',
  study_abroad_news: 'Xorijda tahsil',
  winner_announcement: "G'olib e'loni",
};

export default function NewsCard({ post }: { post: NewsPost }) {
  const locale = useLocale();
  return (
    <Link
      href={`/${locale}/news/${post.slug}`}
      className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col gap-2 border border-gray-100 dark:border-gray-700"
    >
      <span className="text-xs bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 px-2 py-0.5 rounded-full w-fit">
        {CATEGORY_LABELS[post.category]}
      </span>
      <h3 className="font-semibold text-gray-900 dark:text-white hover:text-teal-700 dark:hover:text-teal-400 transition">{post.title}</h3>
      {post.published_at && (
        <p className="text-xs text-gray-400 dark:text-gray-500">{new Date(post.published_at).toLocaleDateString()}</p>
      )}
    </Link>
  );
}
