'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import type { Scholarship } from '@/lib/supabase/types';
import { translateCountry } from '@/lib/translateCountry';
import FavouriteButton from '@/components/shared/FavouriteButton';

const STATUS_COLORS = {
  open: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
  closed: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400',
  upcoming: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400',
};

const FUNDING_COLORS: Record<string, string> = {
  fully_funded: 'bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-400',
  partially_funded: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400',
  self_funded: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
};

export default function ScholarshipCard({ scholarship: s, locale }: { scholarship: Scholarship; locale?: string }) {
  const t = useTranslations('scholarships');
  const tc = useTranslations('common');
  const currentLocale = useLocale();
  const photos: string[] = (s as any).photo_urls?.length ? (s as any).photo_urls : [];
  const coverPhoto = photos[0] || null;

  return (
    <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition flex flex-col border border-gray-100 dark:border-gray-700 h-full overflow-hidden">
      {/* Cover image or gradient placeholder */}
      <div className="relative w-full h-36 flex-shrink-0 bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center">
        {coverPhoto
          ? <Image src={coverPhoto} alt={s.title} fill className="object-cover" />
          : <span className="text-4xl font-bold text-white/60 select-none">{s.title?.charAt(0)?.toUpperCase()}</span>
        }
        <FavouriteButton entityType="scholarship" entityId={s.id} className="absolute top-2 left-2" />
      </div>
      <div className="p-5 flex flex-col justify-between gap-3 flex-1">
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-start gap-2">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white leading-snug">{(s as any)[`title_${locale ?? currentLocale}`] || s.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{translateCountry(s.country, locale ?? currentLocale)}{s.university ? ` · ${s.university}` : ''}</p>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${STATUS_COLORS[s.status]}`}>
            {tc(s.status)}
          </span>
        </div>

        {/* Funding type badge */}
        {s.category && (
          <div>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${FUNDING_COLORS[s.category] ?? FUNDING_COLORS.self_funded}`}>
              {t(`fundingType.${s.category}`)}
            </span>
          </div>
        )}

        {/* Degrees available */}
        {(s as any).degrees_available?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {((s as any).degrees_available as string[]).map((d) => (
              <span key={d} className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 text-xs px-2 py-0.5 rounded-full">
                {t(`degrees.${d}`)}
              </span>
            ))}
          </div>
        )}

        {s.close_date && (
          <p className="text-xs text-gray-500 dark:text-gray-400">Deadline: {s.close_date}</p>
        )}
      </div>

      <div className="flex gap-2 pt-2">
        {locale && (
          <Link
            href={`/${locale}/scholarships/${s.slug ?? s.id}`}
            className="flex-1 border border-teal-700 dark:border-teal-500 text-teal-700 dark:text-teal-400 text-center py-2 rounded-xl text-sm font-semibold hover:bg-teal-50 dark:hover:bg-teal-900/20 transition"
          >
            {t('detailBtn')}
          </Link>
        )}
        {s.application_url && (
          <a
            href={s.application_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-teal-700 hover:bg-teal-800 text-white text-center py-2 rounded-xl text-sm font-semibold transition"
          >
            {t('applyBtn')}
          </a>
        )}
      </div>
      </div>
    </div>
  );
}
