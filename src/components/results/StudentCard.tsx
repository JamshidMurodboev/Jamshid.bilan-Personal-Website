import Image from 'next/image';
import Link from 'next/link';
import type { StudentResult } from '@/lib/supabase/types';

const DEGREE_LABELS = { bachelor: 'Bakalavriat', master: 'Magistratura', phd: 'PhD' };
const CATEGORY_LABELS = { scholarship_winner: "Grant g'olibi", tuition_based: 'Kontrakt asosida' };

export default function StudentCard({ result: r, locale }: { result: StudentResult; locale?: string }) {
  const photos: string[] = (r as any).photo_urls?.length
    ? (r as any).photo_urls
    : r.photo_url ? [r.photo_url] : [];

  const card = (
    <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition flex flex-col">
      {/* Main photo — large, like a document/letter preview */}
      {photos.length > 0 ? (
        <div className="relative w-full aspect-[4/3] bg-gray-100 dark:bg-gray-700">
          <Image src={photos[0]} alt={r.student_name} fill className="object-cover" />
        </div>
      ) : (
        <div className="w-full aspect-[4/3] bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center text-teal-700 dark:text-teal-400 font-bold text-2xl">
            {r.student_name[0]}
          </div>
        </div>
      )}

      <div className="p-5 flex flex-col flex-1 justify-between gap-2">
        <div>
          <div className="font-semibold text-gray-900 dark:text-white">{r.student_name}</div>
          <div className="flex flex-wrap gap-1.5 mt-1">
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
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">&ldquo;{r.testimonial}&rdquo;</p>
          )}
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-400 dark:text-gray-500">{r.country} · {r.year}</span>
          {locale && <span className="text-xs text-teal-700 dark:text-teal-400 font-medium">Batafsil →</span>}
        </div>
      </div>
    </div>
  );

  if (locale) {
    return <Link href={`/${locale}/results/${r.id}`}>{card}</Link>;
  }
  return card;
}
