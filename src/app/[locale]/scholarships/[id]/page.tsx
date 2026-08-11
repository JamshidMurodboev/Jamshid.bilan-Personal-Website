import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import type { Scholarship } from '@/lib/supabase/types';
import PageNav from '@/components/shared/PageNav';
import ActivityTracker from '@/components/shared/ActivityTracker';
import MediaLinksSection from '@/components/shared/MediaLinksSection';
import { isUUID } from '@/lib/slugify';
import { translateCountry } from '@/lib/translateCountry';
import ApplyNowCTA from '@/components/scholarships/ApplyNowCTA';
import FavouriteButton from '@/components/shared/FavouriteButton';
import ShareButton from '@/components/shared/ShareButton';
import { formatDate } from '@/lib/format';

const MONTHS = {
  uz: ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr'],
  ru: ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
  en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
}

function formatMonthName(mo: string, locale: string): string {
  const idx = parseInt(mo) - 1
  const months = MONTHS[locale as keyof typeof MONTHS] || MONTHS.uz
  return months[idx] || mo
}

function formatSingleDate(value: string, locale: string): string {
  if (!value) return ''
  const d = new Date(value + 'T00:00:00')
  if (isNaN(d.getTime())) return value
  const months = MONTHS[locale as keyof typeof MONTHS] || MONTHS.uz
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

function formatDateValue(value: string, type: string, locale: string): string {
  if (!value) return ''
  if (type === 'exact') {
    if (value.includes('|')) {
      const [start, end] = value.split('|')
      const s = formatSingleDate(start, locale)
      const e = formatSingleDate(end, locale)
      return s && e ? `${s} – ${e}` : s || e
    }
    return formatSingleDate(value, locale)
  }
  if (type === 'month') {
    // new format: "03" (just month), legacy: "2025-03"
    if (/^\d{1,2}$/.test(value)) return formatMonthName(value.padStart(2, '0'), locale)
    const parts = value.split('-')
    if (parts.length === 2) {
      const months = MONTHS[locale as keyof typeof MONTHS] || MONTHS.uz
      return `${months[parseInt(parts[1]) - 1] || value} ${parts[0]}`
    }
    return value
  }
  if (type === 'period') {
    if (value.includes('|')) {
      const [start, end] = value.split('|')
      // new format: "02|04" (month numbers), legacy: "2025-02|2025-04"
      const startFmt = /^\d{1,2}$/.test(start) ? formatMonthName(start.padStart(2, '0'), locale) : (() => { const p = start.split('-'); return p.length === 2 ? `${(MONTHS[locale as keyof typeof MONTHS]||MONTHS.uz)[parseInt(p[1])-1]} ${p[0]}` : start })()
      const endFmt = /^\d{1,2}$/.test(end) ? formatMonthName(end.padStart(2, '0'), locale) : (() => { const p = end.split('-'); return p.length === 2 ? `${(MONTHS[locale as keyof typeof MONTHS]||MONTHS.uz)[parseInt(p[1])-1]} ${p[0]}` : end })()
      return `${startFmt} – ${endFmt}`
    }
    return value // legacy free-text period
  }
  return value
}

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

export default async function ScholarshipDetailPage({ params: { locale, id } }: { params: { locale: string; id: string } }) {
  setRequestLocale(locale);

  const [supabase, t, tc, tu] = await Promise.all([
    createClient(),
    getTranslations({ locale, namespace: 'scholarships' }),
    getTranslations({ locale, namespace: 'common' }),
    getTranslations({ locale, namespace: 'universities' }),
  ]);

  let sData: Scholarship | null = null;
  if (isUUID(id)) {
    const { data } = await supabase.from('scholarships').select('*').eq('id', id).single();
    sData = data as Scholarship | null;
  } else {
    const { data } = await supabase.from('scholarships').select('*').eq('slug', id).single();
    sData = data as Scholarship | null;
  }
  const s = sData;
  if (!s) notFound();

  const [{ data: linkedResultsData }, { data: linkedNewsData }, { data: serviceLinks }] = await Promise.all([
    supabase.from('student_results').select('id, student_name, degree_level, year, country, slug, photo_url, photo_urls, university_name, major').eq('scholarship_id', s.id).order('year', { ascending: false }),
    supabase.from('news_posts').select('id, title_uz, title_ru, title_en, cover_url, photo_urls, published_at, slug').eq('scholarship_id', s.id).eq('published', true).order('published_at', { ascending: false }).limit(3),
    supabase.from('service_scholarships').select('service_id').eq('scholarship_id', s.id),
  ]);
  const serviceIds = (serviceLinks ?? []).map((r: { service_id: string }) => r.service_id);
  const { data: linkedServices } = serviceIds.length > 0
    ? await supabase.from('services').select('id,name_uz,name_ru,name_en,description_uz,description_ru,description_en,photo_url,price,currency,currency_custom,slug').in('id', serviceIds).eq('status', 'active')
    : { data: [] };
  const results = (linkedResultsData ?? []) as { id: string; slug?: string; student_name: string; degree_level: string; year: number; country: string; photo_url?: string; photo_urls?: string[]; university_name?: string; major?: string }[];
  const linkedNews = (linkedNewsData ?? []) as { id: string; slug?: string; title_uz: string; title_ru?: string; title_en?: string; cover_url?: string; photo_urls?: string[]; published_at?: string }[];
  const mediaLinks = s.media_links ?? [];
  const requiredDocs: Array<{ uz: string; ru: string; en: string; mandatory?: boolean }> = (s as any).required_documents ?? [];
  const docLocale = (d: { uz: string; ru: string; en: string }) => (d as any)[locale] || d.uz;

  // scholarship_process overrides the old flat period fields when present
  const processSteps: Array<{ key: string; label: string; value: string; description?: string; color: string; textColor: string; bgColor: string; borderColor: string }> = (() => {
    const sp: Array<{ key: string; type: string; value: string; description_uz?: string; description_ru?: string; description_en?: string }> = (s as any).scholarship_process ?? [];
    const COLORS = [
      { color: 'bg-teal-500', textColor: 'text-teal-700 dark:text-teal-400', bgColor: 'bg-teal-50 dark:bg-teal-900/20', borderColor: 'border-teal-200 dark:border-teal-800/40' },
      { color: 'bg-blue-500', textColor: 'text-blue-700 dark:text-blue-400', bgColor: 'bg-blue-50 dark:bg-blue-900/20', borderColor: 'border-blue-200 dark:border-blue-800/40' },
      { color: 'bg-purple-500', textColor: 'text-purple-700 dark:text-purple-400', bgColor: 'bg-purple-50 dark:bg-purple-900/20', borderColor: 'border-purple-200 dark:border-purple-800/40' },
      { color: 'bg-orange-500', textColor: 'text-orange-700 dark:text-orange-400', bgColor: 'bg-orange-50 dark:bg-orange-900/20', borderColor: 'border-orange-200 dark:border-orange-800/40' },
    ];
    if (sp.length > 0) {
      return sp.filter(step => step.value).map((step, i) => {
        const c = COLORS[i % COLORS.length];
        const labelKey: Record<string, string> = { application: t('applicationPeriod'), interview_exam: t('interviewExamPeriod'), results: t('resultsPeriod'), admission: t('admissionDeadline') };
        const customLabel = (step as any)[`label_${locale}`] || (step as any).label_uz || (step as any).label || '';
        const formattedValue = formatDateValue(step.value, step.type, locale)
        return { key: step.key, label: labelKey[step.key] || customLabel || step.key, value: formattedValue || step.value, description: (step as any)[`description_${locale}`] || step.description_uz || '', ...c };
      });
    }
    // fallback: old flat fields
    const fallback = [
      { key: 'admission', label: t('admissionDeadline'), value: [s.open_date, s.close_date].filter(Boolean).join(' – '), ...COLORS[0] },
      { key: 'application', label: t('applicationPeriod'), value: (s as any).application_period as string || '', ...COLORS[1] },
      { key: 'interview_exam', label: t('interviewExamPeriod'), value: (s as any).interview_exam_period as string || '', ...COLORS[2] },
      { key: 'results', label: t('resultsPeriod'), value: (s as any).results_period as string || '', ...COLORS[3] },
    ];
    return fallback.filter(step => step.value).map(step => ({ ...step, description: '' }));
  })();

  const description = (s as any)[`description_${locale}`] || s.description_uz || '';
  const degreesAvailable: string[] = (s as any).degrees_available ?? [];

  return (
    <div className="min-h-screen bg-[#f0f9f8] dark:bg-[#0d1117] py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageNav backHref={`/${locale}/scholarships`} />
        <ActivityTracker entityType="scholarship" entityId={s.id} entityName={(s as any)[`title_${locale}`] || s.title} />

        {s.photo_urls && s.photo_urls.length > 0 && (
          <div className="relative w-full h-64 rounded-2xl mt-4 mb-0 overflow-hidden">
            <Image src={s.photo_urls[0]} alt={s.title} fill className="object-cover" />
          </div>
        )}

        <div className="lg:grid lg:grid-cols-[1fr_260px] lg:gap-10 lg:items-start mt-6">
          {/* Main column */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[s.status]}`}>
                {tc(s.status)}
              </span>
              {s.category && (
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${FUNDING_COLORS[s.category] ?? FUNDING_COLORS.self_funded}`}>
                  {t(`fundingType.${s.category}`)}
                </span>
              )}
            </div>

            <div className="flex items-start gap-3">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1 flex-1">{(s as any)[`title_${locale}`] || s.title}</h1>
              <FavouriteButton entityType="scholarship" entityId={s.id} />
              <ShareButton url={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://jamshidbilan.uz'}/${locale}/scholarships/${s.slug ?? s.id}`} title={(s as any)[`title_${locale}`] || s.title} entityType="scholarship" entityId={s.id} entityName={s.title} />
            </div>
            <p className="text-gray-500 dark:text-gray-400 mb-6">{translateCountry(s.country, locale)}{s.university ? ` · ${s.university}` : ''}</p>

            {description && (
              <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line mb-6 leading-relaxed text-base max-w-2xl">
                {description}
              </div>
            )}

            {/* Our Results */}
            {results.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('ourResults')}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {results.map(r => (
                    <Link href={`/${locale}/results/${r.slug ?? r.id}`} key={r.id}
                      className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-teal-400 transition shadow-sm group">
                      {(r.photo_urls?.[0] || r.photo_url) ? (
                        <div className="relative h-40 overflow-hidden">
                          <Image src={r.photo_urls?.[0] || r.photo_url!} alt={r.student_name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                        </div>
                      ) : (
                        <div className="h-20 flex items-center justify-center bg-teal-50 dark:bg-teal-900/20">
                          <span className="text-3xl font-bold text-teal-600">{r.student_name?.[0]}</span>
                        </div>
                      )}
                      <div className="p-3">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{r.student_name}</p>
                        {r.university_name && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{r.university_name}</p>}
                        {r.major && <p className="text-xs text-gray-500 dark:text-gray-400">{r.major}</p>}
                        <p className="text-xs text-teal-600 dark:text-teal-400 font-medium mt-1">{r.year}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Scholarship Process */}
            {processSteps.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">{t('scholarshipProcess')}</h2>
                <div className="space-y-0">
                  {processSteps.map((step, idx, arr) => (
                    <div key={step.key} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full ${step.color} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                          {idx + 1}
                        </div>
                        {idx < arr.length - 1 && <div className="w-0.5 bg-gray-200 dark:bg-gray-700 flex-1 my-1.5" style={{ minHeight: '1.25rem' }} />}
                      </div>
                      <div className={`flex-1 ${step.bgColor} border ${step.borderColor} rounded-xl p-4 ${idx < arr.length - 1 ? 'mb-2' : ''}`}>
                        <div className={`text-xs font-semibold uppercase tracking-wide mb-1 ${step.textColor}`}>{step.label}</div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{step.value}</div>
                        {step.description && <p className="text-xs text-gray-600 dark:text-gray-400 mt-1.5 leading-relaxed">{step.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Required Documents */}
            {requiredDocs.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('requiredDocuments')}</h2>
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                  {requiredDocs.map((doc, i) => (
                    <div key={i} className={`flex items-center gap-3 px-5 py-3.5 ${i > 0 ? 'border-t border-gray-100 dark:border-gray-700' : ''}`}>
                      <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400 flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                      <span className="text-sm text-gray-800 dark:text-gray-200 flex-1">{docLocale(doc)}</span>
                      {doc.mandatory === false ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 flex-shrink-0">{tu('optional')}</span>
                      ) : doc.mandatory === true ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex-shrink-0">{tu('mandatory')}</span>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Linked News */}
            {linkedNews.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">So'nggi yangiliklar</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {linkedNews.map(post => {
                    const newsTitle = (post as any)[`title_${locale}`] || post.title_uz;
                    const thumb = post.cover_url || post.photo_urls?.[0];
                    return (
                      <Link key={post.id} href={`/${locale}/news/${post.slug ?? post.id}`}
                        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition flex flex-col">
                        {thumb ? (
                          <div className="relative aspect-[16/9] w-full">
                            <Image src={thumb} alt={newsTitle} fill className="object-cover" />
                          </div>
                        ) : (
                          <div className="aspect-[16/9] w-full bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center text-3xl">📰</div>
                        )}
                        <div className="p-3 flex flex-col gap-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">{newsTitle}</p>
                          {post.published_at && <span className="text-xs text-gray-400 dark:text-gray-500">{formatDate(post.published_at)}</span>}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Media Links */}
            <MediaLinksSection links={mediaLinks} locale={locale} heading={t('mediaLinks')} />

            {/* Linked Services */}
            {(linkedServices ?? []).length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('relatedServices')}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(linkedServices ?? []).map((svc: any) => {
                    const svcName = svc[`name_${locale}`] || svc.name_uz;
                    const svcDesc = svc[`description_${locale}`] || svc.description_uz || '';
                    const svcPrice = svc.currency === 'FREE' ? 'Bepul' : svc.price ? `${svc.price.toLocaleString()} ${svc.currency === 'OTHER' ? svc.currency_custom : svc.currency}` : '';
                    return (
                      <Link key={svc.id} href={`/${locale}/services/${svc.slug ?? svc.id}`}
                        className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-teal-400 dark:hover:border-teal-500 transition shadow-sm group">
                        {svc.photo_url && (
                          <div className="relative w-full h-40 overflow-hidden">
                            <Image src={svc.photo_url} alt={svcName} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                          </div>
                        )}
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{svcName}</h3>
                          {svcPrice && <p className="text-teal-700 dark:text-teal-400 font-bold text-sm mb-2">{svcPrice}</p>}
                          {svcDesc && <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">{svcDesc}</p>}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Apply Now CTA */}
            <ApplyNowCTA scholarshipTitle={s.title} />

            {s.photo_urls && s.photo_urls.length > 1 && (
              <div className="grid grid-cols-2 gap-3 mb-8">
                {s.photo_urls.slice(1).map((url, i) => (
                  <div key={i} className="relative aspect-video rounded-xl overflow-hidden">
                    <Image src={url} alt={`${s.title} ${i + 2}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-6 space-y-4 mt-6 lg:mt-0">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 space-y-5">
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide font-medium">{t('statusLabel')}</div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[s.status]}`}>
                  {tc(s.status)}
                </span>
              </div>

              {/* Grant Imtiyozlari — coverage + degrees */}
              {((s.coverage && s.coverage.length > 0) || degreesAvailable.length > 0) && (
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide font-medium">
                    {t('benefitsHeading')}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(((s as any)[`coverage_${locale}`] as string[] | undefined)?.length
                      ? (s as any)[`coverage_${locale}`] as string[]
                      : s.coverage ?? []
                    ).map((c: string) => (
                      <span key={c} className="bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 text-xs px-2.5 py-1 rounded-full">{c}</span>
                    ))}
                  </div>
                  {degreesAvailable.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {degreesAvailable.map(d => (
                        <span key={d} className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 text-xs px-2.5 py-1 rounded-full">
                          {t(`degrees.${d}`)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {(s.open_date || s.close_date || s.results_date) && (
                <div className="space-y-3 pt-1 border-t border-gray-100 dark:border-gray-700">
                  <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium pt-1">{t('datesHeading')}</div>
                  {s.open_date && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">{t('openDate')}</span>
                      <span className="font-medium text-gray-900 dark:text-white">{s.open_date}</span>
                    </div>
                  )}
                  {s.close_date && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">{t('closeDate')}</span>
                      <span className="font-medium text-gray-900 dark:text-white">{s.close_date}</span>
                    </div>
                  )}
                  {s.results_date && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">{t('resultsDateLabel')}</span>
                      <span className="font-medium text-gray-900 dark:text-white">{formatDateValue(s.results_date, s.results_date_type ?? 'exact', locale)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {s.application_url && (
              <a
                href={s.application_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center border border-teal-700 dark:border-teal-500 text-teal-700 dark:text-teal-400 px-6 py-3 rounded-xl font-semibold hover:bg-teal-50 dark:hover:bg-teal-900/20 transition"
              >
                {tu('officialWebsite')}
              </a>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
