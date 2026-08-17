'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import type { NewsPost } from '@/lib/supabase/types';
import { formatDate } from '@/lib/format';
import FavouriteButton from '@/components/shared/FavouriteButton';

export default function NewsCard({ post, locale: localeProp }: { post: NewsPost; locale?: string }) {
  const localeHook = useLocale();
  const t = useTranslations('common');
  const locale = localeProp || localeHook;
  const title = (post as any)[`title_${locale}`] || post.title_uz;
  const body = (post as any)[`body_${locale}`] || post.body_uz;
  const coverImage = post.cover_url || (post as any).photo_urls?.[0];
  return (
    <Link
      href={`/${locale}/news/${(post as any).slug ?? post.id}`}
      className="card-e overflow-hidden group relative flex flex-col"
    >
      <FavouriteButton entityType="news" entityId={post.id} className="absolute top-3 right-3 z-10" />
      {coverImage && (
        <div className="relative aspect-[16/10] overflow-hidden bg-soft">
          <Image src={coverImage} alt={title} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
        </div>
      )}
      <div className="p-6 flex flex-col flex-1">
        {post.published_at && (
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-e mb-3">{formatDate(post.published_at)}</p>
        )}
        <h3 className="font-display text-xl text-heading mb-2 leading-snug group-hover:text-accent transition-colors">{title}</h3>
        <p className="text-sm text-body line-clamp-3 mb-5">{body}</p>
        <span className="arrow-link text-xs uppercase tracking-widest mt-auto">
          {t('readMore')}<span className="arr">→</span>
        </span>
      </div>
    </Link>
  );
}
