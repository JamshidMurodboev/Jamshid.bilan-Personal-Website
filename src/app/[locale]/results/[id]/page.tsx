import { setRequestLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import type { StudentResult, Scholarship, University } from '@/lib/supabase/types';
import { translateCountry } from '@/lib/translateCountry';
import PageNav from '@/components/shared/PageNav';
import ActivityTracker from '@/components/shared/ActivityTracker';
import { translateLanguage } from '@/lib/translateLanguage';
import MediaLinksSection from '@/components/shared/MediaLinksSection';
import { isUUID } from '@/lib/slugify';
import FavouriteButton from '@/components/shared/FavouriteButton';
import ResultPhotoGallery from '@/components/results/ResultPhotoGallery';

export default async function ResultDetailPage({ params: { locale, id } }: { params: { locale: string; id: string } }) {
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'results' });

  const supabase = await createClient();

  let r: StudentResult | null = null;
  if (isUUID(id)) {
    const { data } = await supabase.from('student_results').select('*').eq('id', id).single();
    r = data as StudentResult | null;
  } else {
    const { data } = await supabase.from('student_results').select('*').eq('slug', id).single();
    r = data as StudentResult | null;
  }
  if (!r) notFound();

  let scholarship: Scholarship | null = null;
  let university: University | null = null;
  if ((r as any).scholarship_id) {
    const { data: s } = await supabase.from('scholarships').select('id,title,country,slug').eq('id', (r as any).scholarship_id).single();
    scholarship = s as Scholarship | null;
  }
  if ((r as any).university_id) {
    const { data: u } = await supabase.from('universities').select('id,name,country,slug').eq('id', (r as any).university_id).single();
    university = u as University | null;
  }

  const photos: string[] = r.photo_urls?.length ? r.photo_urls : r.photo_url ? [r.photo_url] : [];
  const testimonial = (r as any)[`testimonial_${locale}`] || r.testimonial;
  const mediaLinks = r.media_links ?? [];

  const degreeLabel = t.raw('degrees') as Record<string, string>;
  const categoryLabel = t.raw('categories') as Record<string, string>;

  const uniName = (r as any)[`university_name_${locale}`] || r.university_name || '';
  const major = (r as any)[`major_${locale}`] || r.major || '';

  return (
    <div className="min-h-screen bg-[#f0f9f8] dark:bg-[#0d1117] py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageNav backHref={`/${locale}/results`} />
        <ActivityTracker entityType="result" entityId={r.id} entityName={r.student_name} />

        {/* Main: photos left half, info right half */}
        <div className="mt-6 flex flex-col lg:flex-row gap-6 items-start">

          {/* Left: photos */}
          <div className="w-full lg:w-1/2 flex-shrink-0">
            {photos.length > 0 ? (
              <ResultPhotoGallery photos={photos} name={r.student_name} />
            ) : (
              <div className="w-full aspect-[4/3] rounded-2xl bg-teal-100 dark:bg-teal-900 flex items-center justify-center text-teal-700 dark:text-teal-400 font-bold text-6xl">
                {r.student_name[0]}
              </div>
            )}
          </div>

          {/* Right: info */}
          <div className="w-full lg:w-1/2 min-w-0">
            <div className="flex items-start gap-2 mb-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex-1">{r.student_name}</h1>
              <FavouriteButton entityType="result" entityId={r.id} />
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {r.degree_level && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400">
                  {degreeLabel[r.degree_level] ?? r.degree_level}
                </span>
              )}
              {r.category && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                  {categoryLabel[r.category] ?? r.category}
                </span>
              )}
              <span className="text-xs text-gray-500 dark:text-gray-400">{r.year} · {translateCountry(r.country, locale)}</span>
            </div>

            {/* Metadata */}
            <div className="space-y-2 mb-4">
              {uniName && (
                <div className="flex gap-2 text-sm">
                  <span className="text-gray-500 dark:text-gray-400 flex-shrink-0">Universitet:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{uniName}</span>
                </div>
              )}
              {major && (
                <div className="flex gap-2 text-sm">
                  <span className="text-gray-500 dark:text-gray-400 flex-shrink-0">Mutaxassislik:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{major}</span>
                </div>
              )}
              {r.language && (
                <div className="flex gap-2 text-sm">
                  <span className="text-gray-500 dark:text-gray-400 flex-shrink-0">Ta&apos;lim tili:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{translateLanguage(r.language!, locale)}</span>
                </div>
              )}
              {r.university_ranking && (
                <div className="flex gap-2 text-sm">
                  <span className="text-gray-500 dark:text-gray-400 flex-shrink-0">Reyting:</span>
                  <span className="font-medium text-gray-900 dark:text-white">#{r.university_ranking}</span>
                </div>
              )}
            </div>

            {testimonial && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 mb-4">
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">&ldquo;{testimonial}&rdquo;</p>
              </div>
            )}

            {(scholarship || university) && (
              <div className="space-y-2">
                {scholarship && (
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Grant</div>
                      <div className="font-medium text-gray-900 dark:text-white text-sm truncate">{scholarship.title}</div>
                    </div>
                    <Link href={`/${locale}/scholarships/${(scholarship as any).slug ?? scholarship.id}`} className="text-sm text-teal-700 dark:text-teal-400 hover:underline flex-shrink-0">→</Link>
                  </div>
                )}
                {university && (
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Universitet</div>
                      <div className="font-medium text-gray-900 dark:text-white text-sm truncate">{university.name}</div>
                    </div>
                    <Link href={`/${locale}/universities/${(university as any).slug ?? university.id}`} className="text-sm text-teal-700 dark:text-teal-400 hover:underline flex-shrink-0">→</Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Media links */}
        {mediaLinks.length > 0 && (
          <div className="mt-8">
            <MediaLinksSection links={mediaLinks} locale={locale} heading={t('mediaLinks')} />
          </div>
        )}
      </div>
    </div>
  );
}
