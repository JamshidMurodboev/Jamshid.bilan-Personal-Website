'use client';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { University } from '@/lib/supabase/types';
import { translateCountry } from '@/lib/translateCountry';
import FavouriteButton from '@/components/shared/FavouriteButton';

const TYPE_COLORS = {
  public: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400',
  private: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400',
};

const STATUS_COLORS = {
  open: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
  closed: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400',
  upcoming: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400',
};

export default function UniversityCard({ university: u, locale = 'uz' }: { university: University; locale?: string }) {
  const t = useTranslations();
  const TYPE_LABELS = { public: t('filters.publicType'), private: t('filters.privateType') };
  const STATUS_LABELS = { open: t('common.open'), closed: t('common.closed'), upcoming: t('common.upcoming') };
  return (
    <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between gap-3 border border-gray-100 dark:border-gray-700 h-full">
      <FavouriteButton entityType="university" entityId={u.id} className="absolute top-2 right-2" />
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-start gap-2">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white leading-snug">{u.name}</h3>
            {u.ranking != null && (
              <span className="inline-block mt-0.5 mb-0.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400">
                #{u.ranking}
              </span>
            )}
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{u.city ? `${u.city}, ` : ''}{translateCountry(u.country, locale)}</p>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${TYPE_COLORS[u.type]}`}>
              {TYPE_LABELS[u.type]}
            </span>
            {u.status && (
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[u.status]}`}>
                {STATUS_LABELS[u.status]}
              </span>
            )}
          </div>
        </div>
        {u.tuition_usd != null && (
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-medium">{t('universities.tuitionLabel')}</span> ${u.tuition_usd.toLocaleString()}/yil
          </div>
        )}
        {u.programs.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {u.programs.slice(0, 3).map((p) => (
              <span key={p} className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-0.5 rounded-full">{p}</span>
            ))}
          </div>
        )}
      </div>
      <div className="flex gap-2 pt-2">
        {locale && (
          <Link
            href={`/${locale}/universities/${u.slug ?? u.id}`}
            className="flex-1 border border-teal-700 dark:border-teal-500 text-teal-700 dark:text-teal-400 text-center py-2 rounded-xl text-sm font-semibold hover:bg-teal-50 dark:hover:bg-teal-900/20 transition"
          >
            {t('universities.detailsBtn')}
          </Link>
        )}
        {u.website_url && (
          <a
            href={u.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-center py-2 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            {t('universities.officialSite')}
          </a>
        )}
      </div>
    </div>
  );
}
