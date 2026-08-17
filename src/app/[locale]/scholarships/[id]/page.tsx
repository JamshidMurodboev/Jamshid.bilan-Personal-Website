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
import ScholarshipFAQ from '@/components/scholarships/ScholarshipFAQ';

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

  const [{ data: linkedResultsData }, { data: linkedNewsData }, { data: serviceLinks }, { data: scholarshipFaqsData }] = await Promise.all([
    supabase.from('student_results').select('id, student_name, degree_level, year, country, slug, photo_url, photo_urls, university_name, major').eq('scholarship_id', s.id).order('year', { ascending: false }),
    supabase.from('news_posts').select('id, title_uz, title_ru, title_en, cover_url, photo_urls, published_at, slug').eq('scholarship_id', s.id).eq('published', true).order('published_at', { ascending: false }).limit(3),
    supabase.from('service_scholarships').select('service_id').eq('scholarship_id', s.id),
    supabase.from('scholarship_faqs').select('*').eq('scholarship_id', s.id).order('display_order'),
  ]);
  const scholarshipFaqs = (scholarshipFaqsData ?? []) as unknown as Array<{ id: string; question_uz: string; question_ru?: string; question_en?: string; answer_uz: string; answer_ru?: string; answer_en?: string; display_order: number }>;
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
  const processSteps: Array<{ key: string; label: string; value: string; description?: string }> = (() => {
    const sp: Array<{ key: string; type: string; value: string; description_uz?: string; description_ru?: string; description_en?: string }> = (s as any).scholarship_process ?? [];
    if (sp.length > 0) {
      return sp.filter(step => step.value).map((step) => {
        const labelKey: Record<string, string> = { application: t('applicationPeriod'), interview_exam: t('interviewExamPeriod'), results: t('resultsPeriod'), admission: t('admissionDeadline') };
        const customLabel = (step as any)[`label_${locale}`] || (step as any).label_uz || (step as any).label || '';
        const formattedValue = formatDateValue(step.value, step.type, locale)
        return { key: step.key, label: labelKey[step.key] || customLabel || step.key, value: formattedValue || step.value, description: (step as any)[`description_${locale}`] || step.description_uz || '' };
      });
    }
    // fallback: old flat fields
    const fallback = [
      { key: 'admission', label: t('admissionDeadline'), value: [s.open_date, s.close_date].filter(Boolean).join(' – ') },
      { key: 'application', label: t('applicationPeriod'), value: (s as any).application_period as string || '' },
      { key: 'interview_exam', label: t('interviewExamPeriod'), value: (s as any).interview_exam_period as string || '' },
      { key: 'results', label: t('resultsPeriod'), value: (s as any).results_period as string || '' },
    ];
    return fallback.filter(step => step.value).map(step => ({ ...step, description: '' }));
  })();

  const description = (s as any)[`description_${locale}`] || s.description_uz || '';
  const degreesAvailable: string[] = (s as any).degrees_available ?? [];

  return (
    <div className="min-h-screen bg-page py-10 sm:py-14">
      <div className="container-page">
        <PageNav backHref={`/${locale}/scholarships`} />
        <ActivityTracker entityType="scholarship" entityId={s.id} entityName={(s as any)[`title_${locale}`] || s.title} />

        {s.photo_urls && s.photo_urls.length > 0 && (
          <div className="relative w-full h-64 sm:h-80 rounded-3xl mt-6 overflow-hidden border border-line bg-soft">
            <Image src={s.photo_urls[0]} alt={s.title} fill className="object-cover" />
          </div>
        )}

        <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-12 lg:items-start mt-8 sm:mt-10">
          {/* Main column */}
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-5 anim-fade-up">
              <span className="chip">{tc(s.status)}</span>
              {s.category && (
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-e">
                  {t(`fundingType.${s.category}`)}
                </span>
              )}
            </div>

            <div className="flex items-start gap-3 anim-fade-up anim-delay-1">
              <h1 className="display text-4xl sm:text-5xl flex-1">{(s as any)[`title_${locale}`] || s.title}</h1>
              <FavouriteButton entityType="scholarship" entityId={s.id} />
              <ShareButton url={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://jamshidbilan.uz'}/${locale}/scholarships/${s.slug ?? s.id}`} title={(s as any)[`title_${locale}`] || s.title} entityType="scholarship" entityId={s.id} entityName={s.title} />
            </div>
            <p className="text-muted-e mt-4 mb-10 pb-8 border-b border-line">{translateCountry(s.country, locale)}{s.university ? ` · ${s.university}` : ''}</p>

            {description && (
              <div className="text-body whitespace-pre-line mb-12 leading-relaxed text-base sm:text-lg max-w-2xl">
                {description}
              </div>
            )}

            {/* Our Results */}
            {results.length > 0 && (
              <div className="mb-12">
                <h2 className="font-display text-2xl sm:text-3xl text-heading mb-6">{t('ourResults')}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {results.map(r => (
                    <Link href={`/${locale}/results/${r.slug ?? r.id}`} key={r.id}
                      className="card-e overflow-hidden group">
                      {(r.photo_urls?.[0] || r.photo_url) ? (
                        <div className="relative h-40 overflow-hidden bg-soft">
                          <Image src={r.photo_urls?.[0] || r.photo_url!} alt={r.student_name} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                        </div>
                      ) : (
                        <div className="h-24 flex items-center justify-center bg-soft">
                          <span className="font-display text-3xl text-muted-e select-none">{r.student_name?.[0]}</span>
                        </div>
                      )}
                      <div className="p-3">
                        <p className="font-semibold text-heading text-sm group-hover:text-accent transition-colors">{r.student_name}</p>
                        {r.university_name && <p className="text-xs text-muted-e mt-0.5">{r.university_name}</p>}
                        {r.major && <p className="text-xs text-muted-e">{r.major}</p>}
                        <p className="text-xs text-accent font-semibold mt-1">{r.year}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Scholarship Process */}
            {processSteps.length > 0 && (
              <div className="mb-12">
                <h2 className="font-display text-2xl sm:text-3xl text-heading mb-6">{t('scholarshipProcess')}</h2>
                <div className="space-y-0">
                  {processSteps.map((step, idx, arr) => (
                    <div key={step.key} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-9 h-9 rounded-full border border-line bg-card flex items-center justify-center font-display text-sm text-heading flex-shrink-0">
                          {idx + 1}
                        </div>
                        {idx < arr.length - 1 && <div className="w-px bg-[var(--line)] flex-1 my-1.5" style={{ minHeight: '1.25rem' }} />}
                      </div>
                      <div className={`flex-1 pt-1 ${idx < arr.length - 1 ? 'pb-7' : ''}`}>
                        <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-e mb-1">{step.label}</div>
                        <div className="text-sm font-semibold text-heading">{step.value}</div>
                        {step.description && <p className="text-sm text-body mt-1.5 leading-relaxed">{step.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Required Documents */}
            {requiredDocs.length > 0 && (
              <div className="mb-12">
                <h2 className="font-display text-2xl sm:text-3xl text-heading mb-6">{t('requiredDocuments')}</h2>
                <div className="bg-card rounded-2xl border border-card overflow-hidden">
                  {requiredDocs.map((doc, i) => (
                    <div key={i} className={`flex items-center gap-4 px-5 py-3.5 ${i > 0 ? 'border-t border-line' : ''}`}>
                      <span className="font-display text-sm text-muted-e w-5 text-center flex-shrink-0">{i + 1}</span>
                      <span className="text-sm text-body flex-1">{docLocale(doc)}</span>
                      {doc.mandatory === false ? (
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-e border border-line rounded-full px-2.5 py-0.5 flex-shrink-0">{tu('optional')}</span>
                      ) : doc.mandatory === true ? (
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-accent border border-line rounded-full px-2.5 py-0.5 flex-shrink-0">{tu('mandatory')}</span>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Scholarship FAQs */}
            <ScholarshipFAQ faqs={scholarshipFaqs} locale={locale} title={t('faqTitle')} />

            {/* Linked News */}
            {linkedNews.length > 0 && (
              <div className="mb-12">
                <h2 className="font-display text-2xl sm:text-3xl text-heading mb-6">So'nggi yangiliklar</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {linkedNews.map(post => {
                    const newsTitle = (post as any)[`title_${locale}`] || post.title_uz;
                    const thumb = post.cover_url || post.photo_urls?.[0];
                    return (
                      <Link key={post.id} href={`/${locale}/news/${post.slug ?? post.id}`}
                        className="card-e overflow-hidden group flex flex-col">
                        {thumb ? (
                          <div className="relative aspect-[16/9] w-full overflow-hidden bg-soft">
                            <Image src={thumb} alt={newsTitle} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                          </div>
                        ) : (
                          <div className="aspect-[16/9] w-full bg-soft flex items-center justify-center">
                            <span className="font-display text-3xl text-muted-e select-none">{newsTitle?.charAt(0)}</span>
                          </div>
                        )}
                        <div className="p-4 flex flex-col gap-1">
                          <p className="text-sm font-semibold text-heading line-clamp-2 group-hover:text-accent transition-colors">{newsTitle}</p>
                          {post.published_at && <span className="text-xs text-muted-e">{formatDate(post.published_at)}</span>}
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
              <div className="mb-12">
                <h2 className="font-display text-2xl sm:text-3xl text-heading mb-6">{t('relatedServices')}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(linkedServices ?? []).map((svc: any) => {
                    const svcName = svc[`name_${locale}`] || svc.name_uz;
                    const svcDesc = svc[`description_${locale}`] || svc.description_uz || '';
                    const svcPrice = svc.currency === 'FREE' ? 'Bepul' : svc.price ? `${svc.price.toLocaleString()} ${svc.currency === 'OTHER' ? svc.currency_custom : svc.currency}` : '';
                    return (
                      <Link key={svc.id} href={`/${locale}/services/${svc.slug ?? svc.id}`}
                        className="card-e overflow-hidden group">
                        {svc.photo_url && (
                          <div className="relative w-full h-40 overflow-hidden bg-soft">
                            <Image src={svc.photo_url} alt={svcName} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                          </div>
                        )}
                        <div className="p-5">
                          <h3 className="font-display text-lg text-heading mb-1 group-hover:text-accent transition-colors">{svcName}</h3>
                          {svcPrice && <p className="text-accent font-semibold text-sm mb-2">{svcPrice}</p>}
                          {svcDesc && <p className="text-body text-sm line-clamp-2">{svcDesc}</p>}
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
              <div className="grid grid-cols-2 gap-3 mb-12">
                {s.photo_urls.slice(1).map((url, i) => (
                  <div key={i} className="relative aspect-video rounded-2xl overflow-hidden border border-line bg-soft">
                    <Image src={url} alt={`${s.title} ${i + 2}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar — hairline-divided meta rows */}
          <aside className="lg:sticky lg:top-6 space-y-4 mt-10 lg:mt-0">
            <div className="bg-card rounded-2xl border border-card p-6">
              <div className="flex items-center justify-between gap-3 pb-4">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-e">{t('statusLabel')}</span>
                <span className="chip">{tc(s.status)}</span>
              </div>

              {/* Grant benefits — coverage + degrees */}
              {((s.coverage && s.coverage.length > 0) || degreesAvailable.length > 0) && (
                <div className="py-4 border-t border-line">
                  <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-e mb-3">
                    {t('benefitsHeading')}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(((s as any)[`coverage_${locale}`] as string[] | undefined)?.length
                      ? (s as any)[`coverage_${locale}`] as string[]
                      : s.coverage ?? []
                    ).map((c: string) => (
                      <span key={c} className="text-xs text-body border border-line rounded-full px-2.5 py-1">{c}</span>
                    ))}
                  </div>
                  {degreesAvailable.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {degreesAvailable.map(d => (
                        <span key={d} className="text-[11px] font-semibold uppercase tracking-wider text-muted-e border border-line rounded-full px-2.5 py-1">
                          {t(`degrees.${d}`)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {(s.open_date || s.close_date || s.results_date) && (
                <div className="pt-4 border-t border-line">
                  <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-e mb-1">{t('datesHeading')}</div>
                  {s.open_date && (
                    <div className="flex justify-between gap-3 text-sm py-2 border-b border-line last:border-b-0">
                      <span className="text-muted-e">{t('openDate')}</span>
                      <span className="font-semibold text-heading text-right">{s.open_date}</span>
                    </div>
                  )}
                  {s.close_date && (
                    <div className="flex justify-between gap-3 text-sm py-2 border-b border-line last:border-b-0">
                      <span className="text-muted-e">{t('closeDate')}</span>
                      <span className="font-semibold text-heading text-right">{s.close_date}</span>
                    </div>
                  )}
                  {s.results_date && (
                    <div className="flex justify-between gap-3 text-sm py-2 border-b border-line last:border-b-0">
                      <span className="text-muted-e">{t('resultsDateLabel')}</span>
                      <span className="font-semibold text-heading text-right">{formatDateValue(s.results_date, s.results_date_type ?? 'exact', locale)}</span>
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
                className="btn-ghost w-full"
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
