'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import type { Scholarship } from '@/lib/supabase/types';
import { translateCountry } from '@/lib/translateCountry';
import FavouriteButton from '@/components/shared/FavouriteButton';

export default function ScholarshipCard({ scholarship: s, locale }: { scholarship: Scholarship; locale?: string }) {
  const t = useTranslations('scholarships');
  const tc = useTranslations('common');
  const currentLocale = useLocale();
  const photos: string[] = (s as any).photo_urls?.length ? (s as any).photo_urls : [];
  const coverPhoto = photos[0] || null;

  return (
    <article className="card-e overflow-hidden group flex flex-col h-full">
      {/* Cover image or serif-letter placeholder */}
      <div className="relative w-full aspect-[16/10] flex-shrink-0 overflow-hidden bg-soft flex items-center justify-center">
        {coverPhoto
          ? <Image src={coverPhoto} alt={s.title} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
          : <span className="font-display text-5xl text-muted-e select-none">{s.title?.charAt(0)?.toUpperCase()}</span>
        }
        <FavouriteButton entityType="scholarship" entityId={s.id} className="absolute top-2 left-2" />
      </div>

      <div className="p-6 flex flex-col justify-between gap-3 flex-1">
        <div className="flex flex-col gap-3">
          <div className="flex items-center flex-wrap gap-2">
            <span className="chip">{tc(s.status)}</span>
            {s.category && (
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-e">
                {t(`fundingType.${s.category}`)}
              </span>
            )}
          </div>

          <div>
            <h3 className="font-display text-xl text-heading leading-snug group-hover:text-accent transition-colors">
              {(s as any)[`title_${locale ?? currentLocale}`] || s.title}
            </h3>
            <p className="text-sm text-muted-e mt-1">{translateCountry(s.country, locale ?? currentLocale)}{s.university ? ` · ${s.university}` : ''}</p>
          </div>

          {/* Degrees available */}
          {(s as any).degrees_available?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {((s as any).degrees_available as string[]).map((d) => (
                <span key={d} className="text-[11px] font-semibold uppercase tracking-wider text-muted-e border border-line rounded-full px-2.5 py-0.5">
                  {t(`degrees.${d}`)}
                </span>
              ))}
            </div>
          )}

          {s.close_date && (
            <p className="text-xs text-muted-e">Deadline: {s.close_date}</p>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          {locale && (
            <Link
              href={`/${locale}/scholarships/${s.slug ?? s.id}`}
              className="flex-1 inline-flex items-center justify-center border border-line text-heading text-center py-2.5 rounded-full text-sm font-semibold hover:border-accent hover:text-accent transition-colors"
            >
              {t('detailBtn')}
            </Link>
          )}
          {s.application_url && (
            <a
              href={s.application_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center bg-ink text-[var(--bg)] text-center py-2.5 rounded-full text-sm font-semibold hover:bg-[var(--accent)] hover:text-[#fffdf8] transition-colors"
            >
              {t('applyBtn')}
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
