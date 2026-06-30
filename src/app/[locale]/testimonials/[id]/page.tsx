import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import type { Testimonial, Scholarship, University } from '@/lib/supabase/types';

const CATEGORY_LABELS = { scholarship_winner: "Grant g'olibi", tuition_based: 'Kontrakt asosida' };

export default async function TestimonialDetailPage({ params: { locale, id } }: { params: { locale: string; id: string } }) {
  setRequestLocale(locale);

  const supabase = await createClient();
  const { data } = await supabase.from('testimonials').select('*').eq('id', id).single();
  const t = data as Testimonial | null;
  if (!t) notFound();

  const quote = (t as any)[`quote_${locale}`] || t.quote_uz;
  const outcome = (t as any)[`outcome_${locale}`] || t.outcome_uz;

  let scholarship: Scholarship | null = null;
  let university: University | null = null;
  if (t.scholarship_id) {
    const { data: s } = await supabase.from('scholarships').select('id,title,country').eq('id', t.scholarship_id).single();
    scholarship = s as Scholarship | null;
  }
  if (t.university_id) {
    const { data: u } = await supabase.from('universities').select('id,name,country').eq('id', t.university_id).single();
    university = u as University | null;
  }

  const photos: string[] = t.photo_urls?.length ? t.photo_urls : t.photo_url ? [t.photo_url] : [];

  return (
    <div className="min-h-screen bg-[#f0f9f8] dark:bg-[#0d1117] py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href={`/${locale}/#testimonials`} className="text-sm text-teal-700 dark:text-teal-400 hover:underline">&larr; Barcha fikrlar</Link>

        {/* Student identity */}
        <div className="mt-8 flex items-center gap-4 mb-6">
          {photos.length > 0 ? (
            <Image src={photos[0]} alt={t.student_name} width={72} height={72} className="w-18 h-18 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center text-teal-700 dark:text-teal-400 font-bold text-2xl flex-shrink-0">
              {t.student_name[0]}
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t.student_name}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              {t.category && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400">
                  {CATEGORY_LABELS[t.category]}
                </span>
              )}
              <span className="text-sm text-gray-500 dark:text-gray-400">{outcome}</span>
            </div>
          </div>
        </div>

        {/* Clean blockquote card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 mb-6">
          <div className="flex gap-3">
            <div className="w-1 bg-teal-500 rounded-full flex-shrink-0" />
            <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">{quote}</p>
          </div>

          {/* Metadata tags inline at bottom */}
          {(scholarship || university) && (
            <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
              {scholarship && (
                <Link
                  href={`/${locale}/scholarships/${scholarship.id}`}
                  className="inline-flex items-center gap-1.5 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 text-xs px-3 py-1.5 rounded-full hover:bg-teal-100 dark:hover:bg-teal-900/50 transition"
                >
                  <span className="opacity-60">Grant:</span>
                  <span className="font-medium">{scholarship.title}</span>
                </Link>
              )}
              {university && (
                <Link
                  href={`/${locale}/universities/${university.id}`}
                  className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs px-3 py-1.5 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50 transition"
                >
                  <span className="opacity-60">Universitet:</span>
                  <span className="font-medium">{university.name}</span>
                </Link>
              )}
            </div>
          )}
        </div>

        {photos.length > 1 && (
          <div className="space-y-4">
            {photos.slice(1).map((url, i) => (
              <div key={i} className="relative w-full rounded-xl overflow-hidden">
                <Image src={url} alt={`${t.student_name} ${i + 2}`} width={800} height={600} className="w-full h-auto object-contain" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
