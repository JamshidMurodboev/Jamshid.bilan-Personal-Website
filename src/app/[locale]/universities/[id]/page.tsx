import { setRequestLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import type { University, UniversityMajor, RequiredDocument } from '@/lib/supabase/types';
import UniversityGallery from '@/components/universities/UniversityGallery';
import { translateCountry } from '@/lib/translateCountry';
import PageNav from '@/components/shared/PageNav';
import ActivityTracker from '@/components/shared/ActivityTracker';
import { translateLanguage } from '@/lib/translateLanguage';
import { formatDate } from '@/lib/format';
import MediaLinksSection from '@/components/shared/MediaLinksSection';
import { isUUID } from '@/lib/slugify';
import FavouriteButton from '@/components/shared/FavouriteButton';
import ShareButton from '@/components/shared/ShareButton';
import ServiceContactButtons from '@/components/services/ServiceContactButtons';

function formatAdmissionDate(value: string, type: string, locale: string): string {
  if (!value) return '';
  if (type === 'period') return value;
  if (type === 'month') {
    const [year, month] = value.split('-');
    const monthIdx = parseInt(month, 10) - 1;
    const names: Record<string, string[]> = {
      uz: ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr'],
      ru: ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
      en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
    };
    return `${(names[locale] || names.uz)[monthIdx]} ${year}`;
  }
  if (type === 'exact') {
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleDateString(locale === 'ru' ? 'ru-RU' : locale === 'en' ? 'en-US' : 'uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  return value;
}

// DEGREE_LABELS replaced with t('universities.degreeMap.*') below

export default async function UniversityDetailPage({ params: { locale, id } }: { params: { locale: string; id: string } }) {
  setRequestLocale(locale);

  const supabase = await createClient();

  let uniData: University | null = null;
  if (isUUID(id)) {
    const { data } = await supabase.from('universities').select('*').eq('id', id).single();
    uniData = data as University | null;
  } else {
    const { data } = await supabase.from('universities').select('*').eq('slug', id).single();
    uniData = data as University | null;
  }
  const u = uniData;
  if (!u) notFound();

  const [{ data: majorsData }, { data: resultsData }, { data: newsData }, t, { data: serviceLinks }] = await Promise.all([
    supabase.from('university_majors').select('*').eq('university_id', u.id).order('sort_order'),
    supabase.from('student_results').select('id, student_name, degree_level, year, country, slug, photo_url, photo_urls, university_name, university_name_ru, university_name_en, major, major_ru, major_en, language').eq('university_id', u.id).order('year', { ascending: false }),
    supabase.from('news_posts').select('id, title_uz, title_ru, title_en, cover_url, photo_urls, published_at, slug').eq('university_id', u.id).eq('published', true).order('published_at', { ascending: false }).limit(3),
    getTranslations({ locale, namespace: 'universities' }),
    supabase.from('service_universities').select('service_id').eq('university_id', u.id),
  ]);
  const DEGREE_LABELS: Record<string, string> = {
    bachelor: t('degreeMap.bachelor'),
    master_thesis: t('degreeMap.master_thesis'),
    master_coursework: t('degreeMap.master_coursework'),
    master_no_thesis: t('degreeMap.master_thesis'),
    phd: t('degreeMap.phd'),
    associate: t('degreeMap.associate'),
    certificate: t('degreeMap.certificate'),
    diploma: t('degreeMap.diploma'),
  };
  const serviceIds = (serviceLinks ?? []).map((r: { service_id: string }) => r.service_id);
  const { data: linkedServices } = serviceIds.length > 0
    ? await supabase.from('services').select('id,name_uz,name_ru,name_en,description_uz,description_ru,description_en,photo_url,price,currency,currency_custom,slug').in('id', serviceIds).eq('status', 'active')
    : { data: [] };

  const majors = (majorsData ?? []) as UniversityMajor[];
  const linkedResults = (resultsData ?? []) as { id: string; slug?: string; student_name: string; degree_level: string; year: number; country: string; photo_url?: string; photo_urls?: string[]; university_name?: string; university_name_ru?: string; university_name_en?: string; major?: string; major_ru?: string; major_en?: string; language?: string }[];
  const linkedNews = (newsData ?? []) as { id: string; slug?: string; title_uz: string; title_ru?: string; title_en?: string; cover_url?: string; photo_urls?: string[]; published_at?: string }[];
  const description = (u as any)[`description_${locale}`] || u.description_uz || '';
  const photos = u.photo_urls ?? [];
  const requiredDocs: RequiredDocument[] = (u as any).required_documents ?? [];
  const docLocale = (d: RequiredDocument) => (d as any)[locale] || d.uz;
  const mediaLinks = u.media_links ?? [];

  const TYPE_LABELS = {
    public: t('publicType'),
    private: t('privateType'),
  };

  return (
    <div className="min-h-screen bg-page py-10 sm:py-14">
      <div className="container-page">
        <PageNav backHref={`/${locale}/universities`} />
        <ActivityTracker entityType="university" entityId={u.id} entityName={u.name} />

        {/* Editorial header */}
        <header className="mt-8 mb-10">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="chip">{TYPE_LABELS[u.type]}</span>
            {u.ranking && (
              <span className="text-[11px] font-bold uppercase tracking-widest text-muted-e">
                #{u.ranking} reyting
              </span>
            )}
          </div>

          <div className="flex items-start gap-3">
            <h1 className="display text-4xl sm:text-5xl flex-1">{u.name}</h1>
            <FavouriteButton entityType="university" entityId={u.id} />
            <ShareButton url={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://jamshidbilan.uz'}/${locale}/universities/${u.slug ?? u.id}`} title={u.name} entityType="university" entityId={u.id} entityName={u.name} />
          </div>
          <p className="text-muted-e mt-3">{u.city ? `${u.city}, ` : ''}{translateCountry(u.country, locale)}</p>
        </header>

        {photos.length > 0 && <UniversityGallery photos={photos} name={u.name} />}

        <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-12 lg:items-start mt-8">
          {/* Main column */}
          <div>
            {description && (
              <div className="text-body whitespace-pre-line mb-12 leading-relaxed text-base sm:text-lg">
                {description}
              </div>
            )}

            {/* Our Results */}
            {linkedResults.length > 0 && (
              <div className="mb-12">
                <h2 className="font-display text-2xl sm:text-3xl text-heading mb-6">{t('ourResults')}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {linkedResults.map(r => {
                    const photos = r.photo_urls?.length ? r.photo_urls : r.photo_url ? [r.photo_url] : [];
                    const uniName = (r as any)[`university_name_${locale}`] || r.university_name || '';
                    const major = (r as any)[`major_${locale}`] || r.major || '';
                    return (
                      <Link href={`/${locale}/results/${r.slug ?? r.id}`} key={r.id}
                        className="card-e overflow-hidden group flex flex-col">
                        {photos.length > 0 ? (
                          <div className="relative w-full aspect-[4/3] overflow-hidden bg-soft">
                            <Image src={photos[0]} alt={r.student_name} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                          </div>
                        ) : (
                          <div className="w-full aspect-[4/3] bg-soft flex items-center justify-center">
                            <span className="font-display text-3xl text-muted-e select-none">{r.student_name?.[0]}</span>
                          </div>
                        )}
                        <div className="p-4 flex flex-col gap-1 flex-1">
                          <p className="font-semibold text-heading text-sm leading-snug group-hover:text-accent transition-colors">
                            {r.student_name}{uniName ? ` — ${uniName}` : ''}
                          </p>
                          {major && <p className="text-xs text-muted-e line-clamp-1">{major}</p>}
                          <div className="flex items-center gap-2 mt-auto pt-1 flex-wrap">
                            {r.language && (
                              <span className="chip">
                                {translateLanguage(r.language, locale)}
                              </span>
                            )}
                            <span className="text-xs text-muted-e ml-auto">{r.year}</span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Required Documents */}
            {requiredDocs.length > 0 && (
              <div className="mb-12">
                <h2 className="font-display text-2xl sm:text-3xl text-heading mb-6">{t('requiredDocuments')}</h2>
                <div className="bg-card rounded-2xl border border-card overflow-hidden">
                  {requiredDocs.map((doc, i) => (
                    <div key={i} className={`flex items-center gap-4 px-6 py-4 ${i > 0 ? 'border-t border-line' : ''}`}>
                      <span className="font-display text-sm text-muted-e w-6 flex-shrink-0 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                      <span className="text-sm text-body flex-1">{docLocale(doc)}</span>
                      {(doc as any).mandatory === false ? (
                        <span className="text-[11px] font-bold uppercase tracking-widest text-muted-e flex-shrink-0">{t('optional')}</span>
                      ) : (doc as any).mandatory === true ? (
                        <span className="text-[11px] font-bold uppercase tracking-widest text-accent flex-shrink-0">{t('mandatory')}</span>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Linked News */}
            {linkedNews.length > 0 && (
              <div className="mb-12">
                <h2 className="font-display text-2xl sm:text-3xl text-heading mb-6">
                  {t('latestNews')}
                </h2>
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
                          <div className="aspect-[16/9] w-full bg-soft" aria-hidden="true" />
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

            {/* Linked Services */}
            {(linkedServices ?? []).length > 0 && (
              <div className="mb-12">
                <h2 className="font-display text-2xl sm:text-3xl text-heading mb-6">{t('relatedServices')}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(linkedServices ?? []).map((svc: any) => {
                    const svcName = svc[`name_${locale}`] || svc.name_uz;
                    const svcDesc = svc[`description_${locale}`] || svc.description_uz || '';
                    const svcPrice = svc.currency === 'FREE' ? t('free') : svc.price ? `${svc.price.toLocaleString()} ${svc.currency === 'OTHER' ? svc.currency_custom : svc.currency}` : '';
                    return (
                      <Link key={svc.id} href={`/${locale}/services/${svc.slug ?? svc.id}`}
                        className="card-e overflow-hidden group">
                        {svc.photo_url && (
                          <div className="relative w-full h-40 overflow-hidden bg-soft">
                            <Image src={svc.photo_url} alt={svcName} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                          </div>
                        )}
                        <div className="p-5">
                          <h3 className="font-display text-lg text-heading mb-1 leading-snug group-hover:text-accent transition-colors">{svcName}</h3>
                          {svcPrice && <p className="text-sm font-semibold text-heading mb-2">{svcPrice}</p>}
                          {svcDesc && <p className="text-sm text-body line-clamp-2">{svcDesc}</p>}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {(u as any).tuition_estimated && (
              <div className="mb-6 border-l-2 border-[var(--accent)] pl-4 py-1">
                <p className="text-sm text-body italic">
                  <span className="font-semibold not-italic">(taxminiy)</span>{' '}
                  {(u as any)[`tuition_note_${locale}`] || (u as any).tuition_note_uz || ''}
                </p>
              </div>
            )}

            {/* Media Links */}
            <MediaLinksSection links={mediaLinks} locale={locale} heading={t('mediaLinks')} />

            {majors.length > 0 && (
              <div className="mb-12">
                <h2 className="font-display text-2xl sm:text-3xl text-heading mb-6">
                  {t('tableHeaders.program')}
                </h2>
                <div className="bg-card rounded-2xl border border-card overflow-hidden overflow-x-auto">
                  <table className="w-full text-sm min-w-[400px]">
                    <thead className="border-b border-line">
                      <tr>
                        <th className="text-left px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-muted-e">
                          {t('tableHeaders.program')}
                        </th>
                        <th className="text-left px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-muted-e whitespace-nowrap">
                          {t('tableHeaders.degree')}
                        </th>
                        <th className="text-left px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-muted-e whitespace-nowrap">
                          {t('tableHeaders.language')}
                        </th>
                        <th className="text-right px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-muted-e">
                          {t('tableHeaders.tuition')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {majors.map((m) => (
                        <tr key={m.id} className="border-b border-line last:border-0">
                          <td className="px-5 py-3.5 text-heading">{(m as any)[`name_${locale}`] || m.name}</td>
                          <td className="px-5 py-3.5 text-muted-e whitespace-nowrap text-xs">
                            {m.degree ? (DEGREE_LABELS[m.degree] ?? m.degree) : '—'}
                          </td>
                          <td className="px-5 py-3.5 text-muted-e whitespace-nowrap">{m.language ? translateLanguage(m.language, locale) : '—'}</td>
                          <td className="px-5 py-3.5 text-right text-body">
                            <div className="text-right">
                              <div className="tabular-nums">{m.tuition ? `${m.tuition.toLocaleString()} ${m.currency}` : '—'}</div>
                              {(m as any).tuition_estimated && (
                                <div className="text-xs text-muted-e italic mt-0.5">
                                  {t('tableHeaders.prevTuition')}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <ServiceContactButtons
              serviceContext={u.name}
              applyLabel={t('applyLabel')}
              askLabel={t('askLabel')}
              preselectedTarget={`Universitet: ${u.name} (${u.country})`}
            />
          </div>

          {/* Sidebar — hairline-divided meta rows */}
          <aside className="lg:sticky lg:top-24 space-y-4 mt-10 lg:mt-0">
            <div className="bg-card rounded-2xl border border-card overflow-hidden">
              <div className="px-6 py-4 border-t border-line first:border-t-0">
                <div className="text-[11px] font-bold uppercase tracking-widest text-muted-e mb-1.5">
                  {t('sidebar.type')}
                </div>
                <span className="chip">{TYPE_LABELS[u.type]}</span>
              </div>
              {u.ranking && (
                <div className="px-6 py-4 border-t border-line first:border-t-0">
                  <div className="text-[11px] font-bold uppercase tracking-widest text-muted-e mb-1.5">
                    {t('sidebar.ranking')}
                  </div>
                  <div className="font-display text-3xl text-heading">#{u.ranking}</div>
                </div>
              )}
              {u.city && (
                <div className="px-6 py-4 border-t border-line first:border-t-0">
                  <div className="text-[11px] font-bold uppercase tracking-widest text-muted-e mb-1.5">
                    {t('sidebar.location')}
                  </div>
                  <div className="text-sm font-medium text-heading">{u.city}, {translateCountry(u.country, locale)}</div>
                </div>
              )}
              {majors.length > 0 && (
                <div className="px-6 py-4 border-t border-line first:border-t-0">
                  <div className="text-[11px] font-bold uppercase tracking-widest text-muted-e mb-1.5">
                    {t('sidebar.programs')}
                  </div>
                  <div className="font-display text-3xl text-heading">{majors.length}</div>
                </div>
              )}
              {(u as any).admission_start_type && (u as any).admission_start && (
                <div className="px-6 py-4 border-t border-line first:border-t-0">
                  <div className="text-[11px] font-bold uppercase tracking-widest text-muted-e mb-1.5">
                    {t('sidebar.admissionPeriod')}
                  </div>
                  <div className="text-sm font-medium text-heading">
                    {formatAdmissionDate((u as any).admission_start, (u as any).admission_start_type, locale)}
                    {(u as any).admission_end_type && (u as any).admission_end
                      ? ` — ${formatAdmissionDate((u as any).admission_end, (u as any).admission_end_type, locale)}`
                      : null}
                  </div>
                </div>
              )}
              {(u as any).results_date_type && (u as any).results_date && (
                <div className="px-6 py-4 border-t border-line first:border-t-0">
                  <div className="text-[11px] font-bold uppercase tracking-widest text-muted-e mb-1.5">
                    {t('sidebar.resultsDate')}
                  </div>
                  <div className="text-sm font-medium text-heading">
                    {formatAdmissionDate((u as any).results_date, (u as any).results_date_type, locale)}
                  </div>
                </div>
              )}
            </div>
            {u.website_url && (
              <a
                href={u.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost w-full"
              >
                {t('officialWebsite')}
              </a>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
