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

const TYPE_COLORS = {
  public: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400',
  private: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400',
};
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
    <div className="min-h-screen bg-[#f0f9f8] dark:bg-[#0d1117] py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageNav backHref={`/${locale}/universities`} />
        <ActivityTracker entityType="university" entityId={u.id} entityName={u.name} />

        {photos.length > 0 && <UniversityGallery photos={photos} name={u.name} />}

        <div className="lg:grid lg:grid-cols-[1fr_260px] lg:gap-10 lg:items-start mt-6">
          {/* Main column */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${TYPE_COLORS[u.type]}`}>
                {TYPE_LABELS[u.type]}
              </span>
              {u.ranking && (
                <span className="text-xs px-2 py-1 rounded-full font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                  #{u.ranking} reyting
                </span>
              )}
            </div>

            <div className="flex items-start gap-3">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1 flex-1">{u.name}</h1>
              <FavouriteButton entityType="university" entityId={u.id} />
              <ShareButton url={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://jamshidbilan.uz'}/${locale}/universities/${u.slug ?? u.id}`} title={u.name} entityType="university" entityId={u.id} entityName={u.name} />
            </div>
            <p className="text-gray-500 dark:text-gray-400 mb-6">{u.city ? `${u.city}, ` : ''}{translateCountry(u.country, locale)}</p>

            {description && (
              <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line mb-8 leading-relaxed text-base">
                {description}
              </div>
            )}

            {/* Our Results */}
            {linkedResults.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('ourResults')}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {linkedResults.map(r => {
                    const photos = r.photo_urls?.length ? r.photo_urls : r.photo_url ? [r.photo_url] : [];
                    const uniName = (r as any)[`university_name_${locale}`] || r.university_name || '';
                    const major = (r as any)[`major_${locale}`] || r.major || '';
                    return (
                      <Link href={`/${locale}/results/${r.slug ?? r.id}`} key={r.id}
                        className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-teal-400 transition shadow-sm flex flex-col">
                        {photos.length > 0 ? (
                          <div className="relative w-full aspect-[4/3]">
                            <Image src={photos[0]} alt={r.student_name} fill className="object-cover" />
                          </div>
                        ) : (
                          <div className="w-full aspect-[4/3] bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center">
                            <span className="text-3xl font-bold text-teal-600">{r.student_name?.[0]}</span>
                          </div>
                        )}
                        <div className="p-3 flex flex-col gap-1 flex-1">
                          <p className="font-semibold text-gray-900 dark:text-white text-sm leading-snug">
                            {r.student_name}{uniName ? ` — ${uniName}` : ''}
                          </p>
                          {major && <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{major}</p>}
                          <div className="flex items-center gap-2 mt-auto pt-1 flex-wrap">
                            {r.language && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400">
                                {translateLanguage(r.language, locale)}
                              </span>
                            )}
                            <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">{r.year}</span>
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
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('requiredDocuments')}</h2>
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                  {requiredDocs.map((doc, i) => (
                    <div key={i} className={`flex items-center gap-3 px-5 py-3.5 ${i > 0 ? 'border-t border-gray-100 dark:border-gray-700' : ''}`}>
                      <span className="text-base flex-shrink-0">{(doc as any).icon || '📄'}</span>
                      <span className="text-sm text-gray-800 dark:text-gray-200 flex-1">{docLocale(doc)}</span>
                      {(doc as any).mandatory === false ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 flex-shrink-0">{t('optional')}</span>
                      ) : (doc as any).mandatory === true ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex-shrink-0">{t('mandatory')}</span>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Linked News */}
            {linkedNews.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {t('latestNews')}
                </h2>
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

            {/* Linked Services */}
            {(linkedServices ?? []).length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('relatedServices')}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(linkedServices ?? []).map((svc: any) => {
                    const svcName = svc[`name_${locale}`] || svc.name_uz;
                    const svcDesc = svc[`description_${locale}`] || svc.description_uz || '';
                    const svcPrice = svc.currency === 'FREE' ? t('free') : svc.price ? `${svc.price.toLocaleString()} ${svc.currency === 'OTHER' ? svc.currency_custom : svc.currency}` : '';
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

            {(u as any).tuition_estimated && (
              <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800/40">
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  <span className="font-medium">(taxminiy)</span>{' '}
                  {(u as any)[`tuition_note_${locale}`] || (u as any).tuition_note_uz || ''}
                </p>
              </div>
            )}

            {/* Media Links */}
            <MediaLinksSection links={mediaLinks} locale={locale} heading={t('mediaLinks')} />

            {majors.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {t('tableHeaders.program')}
                </h2>
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden overflow-x-auto">
                  <table className="w-full text-sm min-w-[400px]">
                    <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                      <tr>
                        <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-300 font-medium">
                          {t('tableHeaders.program')}
                        </th>
                        <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-300 font-medium hidden sm:table-cell">
                          {t('tableHeaders.degree')}
                        </th>
                        <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-300 font-medium hidden sm:table-cell">
                          {t('tableHeaders.language')}
                        </th>
                        <th className="text-right px-4 py-3 text-gray-600 dark:text-gray-300 font-medium">
                          {t('tableHeaders.tuition')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {majors.map((m) => (
                        <tr key={m.id} className="border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                          <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{(m as any)[`name_${locale}`] || m.name}</td>
                          <td className="px-4 py-3 text-gray-500 dark:text-gray-400 hidden sm:table-cell text-xs">
                            {m.degree ? (DEGREE_LABELS[m.degree] ?? m.degree) : '—'}
                          </td>
                          <td className="px-4 py-3 text-gray-500 dark:text-gray-400 hidden sm:table-cell">{m.language ? translateLanguage(m.language, locale) : '—'}</td>
                          <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                            <div className="text-right">
                              <div>{m.tuition ? `${m.tuition.toLocaleString()} ${m.currency}` : '—'}</div>
                              {(m as any).tuition_estimated && (
                                <div className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
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
            />
          </div>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-6 space-y-4 mt-6 lg:mt-0">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 space-y-4">
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">
                  {t('sidebar.type')}
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${TYPE_COLORS[u.type]}`}>
                  {TYPE_LABELS[u.type]}
                </span>
              </div>
              {u.ranking && (
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">
                    {t('sidebar.ranking')}
                  </div>
                  <div className="text-2xl font-extrabold text-gray-900 dark:text-white">#{u.ranking}</div>
                </div>
              )}
              {u.city && (
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">
                    {t('sidebar.location')}
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{u.city}, {translateCountry(u.country, locale)}</div>
                </div>
              )}
              {majors.length > 0 && (
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">
                    {t('sidebar.programs')}
                  </div>
                  <div className="text-2xl font-extrabold text-gray-900 dark:text-white">{majors.length}</div>
                </div>
              )}
              {(u as any).admission_start_type && (u as any).admission_start && (
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">
                    {t('sidebar.admissionPeriod')}
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatAdmissionDate((u as any).admission_start, (u as any).admission_start_type, locale)}
                    {(u as any).admission_end_type && (u as any).admission_end
                      ? ` — ${formatAdmissionDate((u as any).admission_end, (u as any).admission_end_type, locale)}`
                      : null}
                  </div>
                </div>
              )}
              {(u as any).results_date_type && (u as any).results_date && (
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">
                    {t('sidebar.resultsDate')}
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
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
                className="block w-full text-center border border-teal-700 dark:border-teal-500 text-teal-700 dark:text-teal-400 px-6 py-3 rounded-xl font-semibold hover:bg-teal-50 dark:hover:bg-teal-900/20 transition"
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
