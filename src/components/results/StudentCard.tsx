'use client';
import Image from 'next/image';
import Link from 'next/link';
import type { StudentResult } from '@/lib/supabase/types';
import FavouriteButton from '@/components/shared/FavouriteButton';

const DEGREE_LABELS = { bachelor: 'Bakalavriat', master: 'Magistratura', phd: 'PhD' };
const CATEGORY_LABELS = { scholarship_winner: "Grant g'olibi", tuition_based: 'Kontrakt asosida' };

export default function StudentCard({ result: r, locale }: { result: StudentResult; locale?: string }) {
  const photos: string[] = (r as any).photo_urls?.length
    ? (r as any).photo_urls
    : r.photo_url ? [r.photo_url] : [];

  const card = (
    <div className="relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition flex flex-col">
      <FavouriteButton entityType="result" entityId={r.id} className="absolute top-2 right-2 z-10" />

      {/* Text content at top */}
      <div className="p-5 flex flex-col gap-2 flex-1">
        <div className="font-semibold text-gray-900 dark:text-white pr-8">{r.student_name}</div>
        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400">
            {DEGREE_LABELS[r.degree_level]}
          </span>
          {(r as any).category && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
              {CATEGORY_LABELS[(r as any).category as keyof typeof CATEGORY_LABELS]}
            </span>
          )}
        </div>
        {r.testimonial && (
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">&ldquo;{r.testimonial}&rdquo;</p>
        )}
        <div className="flex items-center justify-between mt-auto pt-1">
          <span className="text-xs text-gray-400 dark:text-gray-500">{r.country} · {r.year}</span>
          {locale && <span className="text-xs text-teal-700 dark:text-teal-400 font-medium">Batafsil →</span>}
        </div>
      </div>

      {/* Small photo at bottom */}
      {photos.length > 0 ? (
        <div className="relative w-full h-32 flex-shrink-0">
          <Image src={photos[0]} alt={r.student_name} fill className="object-cover" />
        </div>
      ) : (
        <div className="w-full h-16 bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center text-teal-700 dark:text-teal-400 font-bold text-sm">
            {r.student_name[0]}
          </div>
        </div>
      )}
    </div>
  );

  if (locale) {
    return <Link href={`/${locale}/results/${(r as any).slug ?? r.id}`}>{card}</Link>;
  }
  return card;
}
