'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import type { University } from '@/lib/supabase/types';
import { translateCountry } from '@/lib/translateCountry';
import FavouriteButton from '@/components/shared/FavouriteButton';

export default function UniversityCard({ university: u, locale = 'uz' }: { university: University; locale?: string }) {
  const t = useTranslations();
  const TYPE_LABELS = { public: t('filters.publicType'), private: t('filters.privateType') };
  const STATUS_LABELS = { open: t('common.open'), closed: t('common.closed'), upcoming: t('common.upcoming') };
  const photos: string[] = (u as any).photo_urls?.length ? (u as any).photo_urls : [];
  const coverPhoto = photos[0] || null;
  return (
    <article className="card-e overflow-hidden group relative flex flex-col h-full">
      {/* Cover image or serif-initial placeholder */}
      <div className="relative w-full aspect-[16/10] flex-shrink-0 overflow-hidden bg-soft flex items-center justify-center">
        {coverPhoto
          ? <Image src={coverPhoto} alt={u.name} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
          : <span className="font-display text-5xl text-muted-e select-none">{u.name?.charAt(0)?.toUpperCase()}</span>
        }
        <FavouriteButton entityType="university" entityId={u.id} className="absolute top-3 left-3" />
      </div>
      <div className="p-6 flex flex-col justify-between gap-4 flex-1">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="chip">{TYPE_LABELS[u.type]}</span>
            {u.status && (
              <span className={`text-[11px] font-bold uppercase tracking-widest ${u.status === 'open' ? 'text-accent' : 'text-muted-e'}`}>
                {STATUS_LABELS[u.status]}
              </span>
            )}
            {u.ranking != null && (
              <span className="text-xs font-semibold text-muted-e ml-auto">#{u.ranking}</span>
            )}
          </div>
          <div>
            <h3 className="font-display text-xl text-heading leading-snug transition-colors group-hover:text-accent">{u.name}</h3>
            <p className="text-sm text-muted-e mt-1">{u.city ? `${u.city}, ` : ''}{translateCountry(u.country, locale)}</p>
          </div>
          {u.tuition_usd != null && (
            <div className="text-sm text-body">
              <span className="font-semibold text-heading">{t('universities.tuitionLabel')}</span> ${u.tuition_usd.toLocaleString()}/yil
            </div>
          )}
          {u.programs.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {u.programs.slice(0, 3).map((p) => (
                <span key={p} className="text-xs text-muted-e border border-line px-2.5 py-0.5 rounded-full">{p}</span>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-2 pt-1">
          {locale && (
            <Link
              href={`/${locale}/universities/${u.slug ?? u.id}`}
              className="flex-1 text-center py-2.5 rounded-full text-sm font-semibold bg-ink text-[var(--bg)] hover:bg-[var(--accent)] hover:text-[#fffdf8] transition-colors"
            >
              {t('universities.detailsBtn')}
            </Link>
          )}
          {u.website_url && (
            <a
              href={u.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center py-2.5 rounded-full text-sm font-semibold border border-line text-body hover:border-[var(--accent)] hover:text-accent transition-colors"
            >
              {t('universities.officialSite')}
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
