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
import ShareButton from '@/components/shared/ShareButton';
import ResultPhotoGallery from '@/components/results/ResultPhotoGallery';

export default async function ResultDetailPage({ params: { locale, id } }: { params: { locale: string; id: string } }) {
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'results' });
  const tc = await getTranslations({ locale, namespace: 'common' });

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

  const metaRows = [
    { label: tc('university'), value: uniName },
    { label: tc('major'), value: major },
    { label: tc('educationLanguage'), value: r.language ? translateLanguage(r.language, locale) : '' },
    { label: tc('ranking'), value: r.university_ranking ? `#${r.university_ranking}` : '' },
  ].filter((row) => row.value);

  return (
    <div className="min-h-screen bg-page">
      <div className="container-page pt-10 sm:pt-14 pb-20 sm:pb-24">
        <PageNav backHref={`/${locale}/results`} />
        <ActivityTracker entityType="result" entityId={r.id} entityName={r.student_name} />

        {/* Main: photos left half, info right half */}
        <div className="mt-8 flex flex-col lg:flex-row gap-10 items-start">

          {/* Left: photos */}
          <div className="w-full lg:w-1/2 flex-shrink-0">
            {photos.length > 0 ? (
              <ResultPhotoGallery photos={photos} name={r.student_name} />
            ) : (
              <div className="w-full aspect-[4/3] rounded-2xl border border-line bg-soft flex items-center justify-center" aria-hidden="true">
                <span className="font-display text-7xl text-muted-e">{r.student_name[0]}</span>
              </div>
            )}
          </div>

          {/* Right: info */}
          <div className="w-full lg:w-1/2 min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-e mb-3">
              {r.year} · {translateCountry(r.country, locale)}
            </p>

            <div className="flex items-start gap-3 mb-5">
              <h1 className="display text-3xl sm:text-4xl flex-1">{r.student_name}</h1>
              <div className="flex items-center gap-2 pt-1">
                <FavouriteButton entityType="result" entityId={r.id} />
                <ShareButton url={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://jamshidbilan.uz'}/${locale}/results/${r.slug ?? r.id}`} title={r.student_name} entityType="result" entityId={r.id} entityName={r.student_name} />
              </div>
            </div>

            {(r.degree_level || r.category) && (
              <div className="flex flex-wrap gap-2 mb-6">
                {r.degree_level && <span className="chip">{degreeLabel[r.degree_level] ?? r.degree_level}</span>}
                {r.category && <span className="chip">{categoryLabel[r.category] ?? r.category}</span>}
              </div>
            )}

            {/* Metadata */}
            {metaRows.length > 0 && (
              <dl className="rule mb-8">
                {metaRows.map((row) => (
                  <div key={row.label} className="flex items-baseline justify-between gap-4 py-3 border-b border-line">
                    <dt className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-e flex-shrink-0">{row.label}</dt>
                    <dd className="text-sm font-medium text-heading text-right">{row.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            {testimonial && (
              <blockquote className="border-l-2 border-[var(--accent)] pl-5 mb-8">
                <p className="font-display italic text-lg text-heading leading-relaxed">&ldquo;{testimonial}&rdquo;</p>
              </blockquote>
            )}

            {(scholarship || university) && (
              <div className="space-y-3">
                {scholarship && (
                  <Link
                    href={`/${locale}/scholarships/${(scholarship as any).slug ?? scholarship.id}`}
                    className="card-e group p-4 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-e mb-1">Grant</div>
                      <div className="font-display text-heading group-hover:text-accent transition-colors truncate">{scholarship.title}</div>
                    </div>
                    <span className="arrow-link flex-shrink-0" aria-hidden="true"><span className="arr">→</span></span>
                  </Link>
                )}
                {university && (
                  <Link
                    href={`/${locale}/universities/${(university as any).slug ?? university.id}`}
                    className="card-e group p-4 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-e mb-1">{tc('university')}</div>
                      <div className="font-display text-heading group-hover:text-accent transition-colors truncate">{university.name}</div>
                    </div>
                    <span className="arrow-link flex-shrink-0" aria-hidden="true"><span className="arr">→</span></span>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Media links */}
        {mediaLinks.length > 0 && (
          <div className="mt-14 rule pt-10">
            <MediaLinksSection links={mediaLinks} locale={locale} heading={t('mediaLinks')} />
          </div>
        )}
      </div>
    </div>
  );
}
