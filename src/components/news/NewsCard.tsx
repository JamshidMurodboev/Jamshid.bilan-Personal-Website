'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useLocale } from 'next-intl';
import type { NewsPost } from '@/lib/supabase/types';
import { formatDate } from '@/lib/format';
import FavouriteButton from '@/components/shared/FavouriteButton';

export default function NewsCard({ post, locale: localeProp }: { post: NewsPost; locale?: string }) {
  const localeHook = useLocale();
  const locale = localeProp || localeHook;
  const title = (post as any)[`title_${locale}`] || post.title_uz;
  const body = (post as any)[`body_${locale}`] || post.body_uz;
  const coverImage = post.cover_url || (post as any).photo_urls?.[0];
  return (
    <Link
      href={`/${locale}/news/${(post as any).slug ?? post.id}`}
      className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition flex flex-col border border-gray-100 dark:border-gray-700 overflow-hidden"
    >
      <FavouriteButton entityType="news" entityId={post.id} className="absolute top-2 right-2 z-10" />
      {coverImage && (
        <div className="relative w-full aspect-[16/9]">
          <Image src={coverImage} alt={title} fill className="object-cover rounded-t-2xl" />
        </div>
      )}
      <div className="p-5 flex flex-col gap-2 rounded-b-2xl">
        <h3 className="font-semibold text-gray-900 dark:text-white hover:text-teal-700 dark:hover:text-teal-400 transition">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3">{body}</p>
        {post.published_at && <span className="text-xs text-gray-400 dark:text-gray-500">{formatDate(post.published_at)}</span>}
      </div>
    </Link>
  );
}
