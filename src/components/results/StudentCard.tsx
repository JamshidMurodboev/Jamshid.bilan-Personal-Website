'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { StudentResult } from '@/lib/supabase/types';
import FavouriteButton from '@/components/shared/FavouriteButton';
import { translateLanguage } from '@/lib/translateLanguage';

export default function StudentCard({ result: r, locale, hidePhoto }: { result: StudentResult; locale?: string; hidePhoto?: boolean }) {
  const t = useTranslations('results');
  const photos: string[] = (r as any).photo_urls?.length
    ? (r as any).photo_urls
    : r.photo_url ? [r.photo_url] : [];

  const uniName = (r as any)[`university_name_${locale ?? 'uz'}`] || r.university_name || '';

  const card = (
    <div className="relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition flex flex-col">
      <FavouriteButton entityType="result" entityId={r.id} className="absolute top-2 right-2 z-10" />

      {/* Photo */}
      {!hidePhoto && (photos.length > 0 ? (
        <div className="relative w-full aspect-square flex-shrink-0">
          <Image src={photos[0]} alt={r.student_name} fill className="object-cover object-top" />
        </div>
      ) : (
        <div className="w-full aspect-square bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center flex-shrink-0">
          <div className="w-14 h-14 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center text-teal-700 dark:text-teal-400 font-bold text-2xl">
            {r.student_name[0]}
          </div>
        </div>
      ))}

      <div className="p-3 flex flex-col gap-1 flex-1">
        {(() => {
          const scholarshipTitle = (r as any).scholarships?.title || '';
          const isScholarship = (r as any).category === 'scholarship_winner';
          const major = (r as any)[`major_${locale ?? 'uz'}`] || r.major || '';
          return (
            <>
              <p className="font-semibold text-gray-900 dark:text-white text-sm leading-snug">
                {isScholarship && scholarshipTitle ? `${r.student_name} — ${scholarshipTitle}` : r.student_name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                {uniName && major ? `${uniName} — ${major}` : uniName || major || ''}
              </p>
              <div className="flex items-center gap-2 mt-auto pt-1 flex-wrap">
                <span className="text-xs text-gray-400 dark:text-gray-500">{r.year}</span>
                <div className="flex gap-1.5 ml-auto flex-wrap">
                  {r.language && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400">
                      {translateLanguage(r.language, locale ?? 'uz')}
                    </span>
                  )}
                  {r.degree_level && (
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {(['bachelor','master','phd'].includes(r.degree_level) ? t(`degrees.${r.degree_level}`) : null) ?? r.degree_level}
                    </span>
                  )}
                </div>
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );

  if (locale) {
    return <Link href={`/${locale}/results/${(r as any).slug ?? r.id}`}>{card}</Link>;
  }
  return card;
}
