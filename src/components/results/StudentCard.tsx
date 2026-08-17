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
    <div className="card-e overflow-hidden group relative flex flex-col h-full">
      <FavouriteButton entityType="result" entityId={r.id} className="absolute top-3 right-3 z-10" />

      {/* Photo */}
      {!hidePhoto && (photos.length > 0 ? (
        <div className="relative w-full aspect-square overflow-hidden bg-soft flex-shrink-0">
          <Image src={photos[0]} alt={r.student_name} fill className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]" />
        </div>
      ) : (
        <div className="w-full aspect-square bg-soft border-b border-line flex items-center justify-center flex-shrink-0" aria-hidden="true">
          <span className="font-display text-5xl text-muted-e">{r.student_name[0]}</span>
        </div>
      ))}

      <div className="p-5 flex flex-col gap-1.5 flex-1">
        {(() => {
          const scholarshipTitle = (r as any).scholarships?.title || '';
          const isScholarship = (r as any).category === 'scholarship_winner';
          const major = (r as any)[`major_${locale ?? 'uz'}`] || r.major || '';
          return (
            <>
              <p className="font-display text-lg text-heading leading-snug group-hover:text-accent transition-colors">
                {isScholarship && scholarshipTitle ? `${r.student_name} — ${scholarshipTitle}` : r.student_name}
              </p>
              <p className="text-xs text-body line-clamp-1">
                {uniName && major ? `${uniName} — ${major}` : uniName || major || ''}
              </p>
              <div className="flex items-center gap-2 mt-auto pt-2 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-e">{r.year}</span>
                <div className="flex items-center gap-1.5 ml-auto flex-wrap">
                  {r.language && (
                    <span className="chip">{translateLanguage(r.language, locale ?? 'uz')}</span>
                  )}
                  {r.degree_level && (
                    <span className="text-xs text-muted-e">
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
