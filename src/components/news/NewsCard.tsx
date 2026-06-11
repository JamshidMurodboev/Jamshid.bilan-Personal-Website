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
    <Link href={`/${locale}/news/${post.slug}`}
      className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col gap-2">
      <span className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full w-fit">
        {CATEGORY_LABELS[post.category]}
      </span>
      <h3 className="font-semibold text-gray-900 hover:text-teal-700 transition">{post.title}</h3>
      {post.published_at && (
        <p className="text-xs text-gray-400">{new Date(post.published_at).toLocaleDateString()}</p>
      )}
    </Link>
  );
}
