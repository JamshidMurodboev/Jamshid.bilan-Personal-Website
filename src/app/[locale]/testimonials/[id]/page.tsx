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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href={`/${locale}/#testimonials`} className="text-sm text-teal-700 dark:text-teal-400 hover:underline">&larr; Barcha fikrlar</Link>

        <div className="mt-8 flex items-center gap-4 mb-6">
          {photos.length > 0 ? (
            <Image src={photos[0]} alt={t.student_name} width={80} height={80} className="w-20 h-20 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center text-teal-700 dark:text-teal-400 font-bold text-3xl flex-shrink-0">
              {t.student_name[0]}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.student_name}</h1>
            <div className="flex flex-wrap gap-2 mt-1">
              {t.category && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400">
                  {CATEGORY_LABELS[t.category]}
                </span>
              )}
              <span className="text-xs text-gray-500 dark:text-gray-400">{outcome}</span>
            </div>
          </div>
        </div>

        <blockquote className="border-l-4 border-teal-500 pl-4 my-6 text-gray-700 dark:text-gray-300 italic text-lg leading-relaxed">
          &ldquo;{quote}&rdquo;
        </blockquote>

        {scholarship && (
          <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Grant</div>
              <div className="font-medium text-gray-900 dark:text-white">{scholarship.title}</div>
              <div className="text-xs text-gray-500">{scholarship.country}</div>
            </div>
            <Link href={`/${locale}/scholarships/${scholarship.id}`} className="text-sm text-teal-700 dark:text-teal-400 hover:underline">Batafsil →</Link>
          </div>
        )}
        {university && (
          <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Universitet</div>
              <div className="font-medium text-gray-900 dark:text-white">{university.name}</div>
              <div className="text-xs text-gray-500">{university.country}</div>
            </div>
            <Link href={`/${locale}/universities/${university.id}`} className="text-sm text-teal-700 dark:text-teal-400 hover:underline">Batafsil →</Link>
          </div>
        )}

        {photos.length > 1 && (
          <div className="space-y-4 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Rasmlar</h2>
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
