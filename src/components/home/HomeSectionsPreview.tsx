import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { getTranslations } from 'next-intl/server';
import { formatDate } from '@/lib/format';
import type { Scholarship, University, StudentResult, NewsPost, Service } from '@/lib/supabase/types';
import { translateCountry } from '@/lib/translateCountry';
import { translateLanguage } from '@/lib/translateLanguage';

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
const TYPE_COLORS = {
  public: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400',
  private: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400',
};

function SectionHeader({ title, href, label }: { title: string; href: string; label: string }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
      <Link href={href} className="text-sm font-semibold text-teal-700 dark:text-teal-400 hover:underline">
        {label} →
      </Link>
    </div>
  );
}

export default async function HomeSectionsPreview({ locale }: { locale: string }) {
  const supabase = createClient();
  const [t, tS, tC] = await Promise.all([
    getTranslations({ locale, namespace: 'homeSections' }),
    getTranslations({ locale, namespace: 'scholarships' }),
    getTranslations({ locale, namespace: 'common' }),
  ]);

  const [scholarshipsRes, universitiesRes, resultsRes, newsRes, servicesRes] = await Promise.allSettled([
    supabase.from('scholarships').select('id,title,country,status,category,close_date,photo_urls,degrees_available,home_order,slug').order('home_order', { ascending: true, nullsFirst: false }).order('created_at', { ascending: false }).limit(3),
    supabase.from('universities').select('id,name,country,city,type,status,tuition_usd,photo_urls,home_order,slug').order('home_order', { ascending: true, nullsFirst: false }).order('created_at', { ascending: false }).limit(3),
    supabase.from('student_results').select('id,student_name,photo_url,photo_urls,degree_level,year,country,testimonial,home_order,slug,university_name,university_name_ru,university_name_en,major,major_ru,major_en,language,category,scholarships(title)').order('home_order', { ascending: true, nullsFirst: false }).order('created_at', { ascending: false }).limit(3),
    supabase.from('news_posts').select('id,title_uz,title_ru,title_en,body_uz,body_ru,body_en,published_at,cover_url,photo_urls,slug').eq('published', true).order('published_at', { ascending: false }).limit(3),
    supabase.from('services').select('id,name_uz,name_ru,name_en,photo_url,price,currency,currency_custom,slug,home_order').eq('status', 'active').not('home_order', 'is', null).order('home_order', { ascending: true }).limit(4),
  ]);

  const scholarships: Scholarship[] = scholarshipsRes.status === 'fulfilled' && scholarshipsRes.value.data?.length ? scholarshipsRes.value.data as Scholarship[] : [];
  const universities: University[] = universitiesRes.status === 'fulfilled' && universitiesRes.value.data?.length ? universitiesRes.value.data as University[] : [];
  const results: StudentResult[] = resultsRes.status === 'fulfilled' && resultsRes.value.data?.length ? resultsRes.value.data as StudentResult[] : [];
  const news: NewsPost[] = newsRes.status === 'fulfilled' && newsRes.value.data?.length ? newsRes.value.data as NewsPost[] : [];
  const services: Service[] = servicesRes.status === 'fulfilled' && servicesRes.value.data?.length ? servicesRes.value.data as Service[] : [];

  const statusLabel = (s: string) => ({ open: tC('open'), closed: tC('closed'), upcoming: tC('upcoming') })[s as 'open' | 'closed' | 'upcoming'] ?? s;
  const uniTypeLabel = (type: string) => ({ public: 'Davlat', private: 'Xususiy' })[type] ?? type;

  return (
    <div className="bg-white dark:bg-[#0d1117]">
      {/* Scholarships */}
      {scholarships.length > 0 && (
        <section className="py-14 px-4 border-b border-gray-100 dark:border-gray-800">
          <div className="max-w-6xl mx-auto">
            <SectionHeader title={`🎓 ${t('scholarships.title')}`} href={`/${locale}/scholarships`} label={t('scholarships.viewAll')} />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {scholarships.map(s => {
                const photos: string[] = (s as any).photo_urls?.length ? (s as any).photo_urls : [];
                const degrees: string[] = (s as any).degrees_available ?? [];
                const href = `/${locale}/scholarships/${(s as any).slug ?? s.id}`;
                return (
                  <Link key={s.id} href={href} className="bg-[#f0f9f8] dark:bg-[#161b22] rounded-2xl overflow-hidden border border-[#e2e8f0] dark:border-[#21262d] hover:shadow-md transition flex flex-col">
                    {photos.length > 0 ? (
                      <div className="relative w-full aspect-[4/3]">
                        <Image src={photos[0]} alt={s.title} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-full aspect-[4/3] bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center text-5xl">🎓</div>
                    )}
                    <div className="p-4 flex flex-col gap-2 flex-1">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white leading-snug">{s.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${STATUS_COLORS[s.status]}`}>{statusLabel(s.status)}</span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{translateCountry(s.country, locale)}</p>
                      {s.category && (
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium w-fit ${FUNDING_COLORS[s.category]}`}>
                          {tS(`fundingType.${s.category}`)}
                        </span>
                      )}
                      {degrees.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {degrees.map(d => (
                            <span key={d} className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 text-xs px-2 py-0.5 rounded-full">
                              {tS(`degrees.${d}`, { fallback: d })}
                            </span>
                          ))}
                        </div>
                      )}
                      {s.close_date && <p className="text-xs text-gray-400 dark:text-gray-500 mt-auto">{t('scholarships.deadline')}: {s.close_date}</p>}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Universities */}
      {universities.length > 0 && (
        <section className="py-14 px-4 border-b border-gray-100 dark:border-gray-800">
          <div className="max-w-6xl mx-auto">
            <SectionHeader title={`🏫 ${t('universities.title')}`} href={`/${locale}/universities`} label={t('universities.viewAll')} />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {universities.map(u => {
                const photos: string[] = (u as any).photo_urls?.length ? (u as any).photo_urls : [];
                const href = `/${locale}/universities/${(u as any).slug ?? u.id}`;
                return (
                  <Link key={u.id} href={href} className="bg-[#f0f9f8] dark:bg-[#161b22] rounded-2xl overflow-hidden border border-[#e2e8f0] dark:border-[#21262d] hover:shadow-md transition flex flex-col">
                    {photos.length > 0 ? (
                      <div className="relative w-full aspect-[4/3]">
                        <Image src={photos[0]} alt={u.name} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-full aspect-[4/3] bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-5xl">🏫</div>
                    )}
                    <div className="p-4 flex flex-col gap-2 flex-1">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white leading-snug">{u.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{u.city ? `${u.city}, ` : ''}{translateCountry(u.country, locale)}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[u.type]}`}>{uniTypeLabel(u.type)}</span>
                          {u.status && <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[u.status]}`}>{statusLabel(u.status)}</span>}
                        </div>
                      </div>
                      {u.tuition_usd != null && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-auto"><span className="font-medium">{t('universities.tuition')}:</span> ${u.tuition_usd.toLocaleString()}/yil</p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Results */}
      {results.length > 0 && (
        <section className="py-14 px-4 border-b border-gray-100 dark:border-gray-800">
          <div className="max-w-6xl mx-auto">
            <SectionHeader title={`🏆 ${t('results.title')}`} href={`/${locale}/results`} label={t('results.viewAll')} />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {results.map(r => {
                const photos: string[] = (r as any).photo_urls?.length ? (r as any).photo_urls : r.photo_url ? [r.photo_url] : [];
                const href = `/${locale}/results/${(r as any).slug ?? r.id}`;
                const uniName = (r as any)[`university_name_${locale}`] || (r as any).university_name || '';
                const major = (r as any)[`major_${locale}`] || (r as any).major || '';
                const lang = (r as any).language;
                return (
                  <Link key={r.id} href={href} className="bg-[#f0f9f8] dark:bg-[#161b22] rounded-2xl overflow-hidden border border-[#e2e8f0] dark:border-[#21262d] hover:shadow-md transition flex flex-col">
                    {photos.length > 0 ? (
                      <div className="relative w-full aspect-[4/3]">
                        <Image src={photos[0]} alt={r.student_name} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-full aspect-[4/3] bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center">
                        <span className="w-14 h-14 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center text-teal-700 dark:text-teal-400 font-bold text-2xl">{r.student_name[0]}</span>
                      </div>
                    )}
                    <div className="p-4 flex flex-col gap-1 flex-1">
                      {(() => {
                        const scholarshipTitle = (r as any).scholarships?.title || '';
                        const isScholarship = (r as any).category === 'scholarship_winner';
                        const degLabel: Record<string, string> = { bachelor: 'Bakalavr', master: 'Magistr', phd: 'PhD' };
                        return (
                          <>
                            <p className="font-semibold text-gray-900 dark:text-white text-sm leading-snug">
                              {isScholarship && scholarshipTitle ? `${r.student_name} — ${scholarshipTitle}` : r.student_name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                              {uniName && major ? `${uniName} — ${major}` : uniName || major || ''}
                            </p>
                            <div className="flex items-center gap-2 mt-auto pt-1 flex-wrap">
                              <span className="text-xs text-gray-400 dark:text-gray-500">{r.year}</span>
                              <div className="flex gap-1.5 ml-auto flex-wrap">
                                {lang && (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400">
                                    {translateLanguage(lang, locale)}
                                  </span>
                                )}
                                {r.degree_level && (
                                  <span className="text-xs text-gray-400 dark:text-gray-500">
                                    {degLabel[r.degree_level] ?? r.degree_level}
                                  </span>
                                )}
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* News */}
      {news.length > 0 && (
        <section className="py-14 px-4 border-b border-gray-100 dark:border-gray-800">
          <div className="max-w-6xl mx-auto">
            <SectionHeader title={`📰 ${t('news.title')}`} href={`/${locale}/news`} label={t('news.viewAll')} />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {news.map(post => {
                const title = (post as any)[`title_${locale}`] || post.title_uz;
                const body = (post as any)[`body_${locale}`] || post.body_uz;
                const thumb = post.cover_url || post.photo_urls?.[0];
                const href = `/${locale}/news/${(post as any).slug ?? post.id}`;
                return (
                  <Link key={post.id} href={href} className="bg-[#f0f9f8] dark:bg-[#161b22] rounded-2xl overflow-hidden border border-[#e2e8f0] dark:border-[#21262d] hover:shadow-md transition flex flex-col">
                    {thumb ? (
                      <div className="relative w-full aspect-[16/9]">
                        <Image src={thumb} alt={title} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-full aspect-[16/9] bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-4xl">📰</div>
                    )}
                    <div className="p-4 flex flex-col gap-1 flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">{title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 flex-1">{body}</p>
                      {post.published_at && <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">{formatDate(post.published_at)}</span>}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Services */}
      {services.length > 0 && (
        <section className="py-14 px-4">
          <div className="max-w-6xl mx-auto">
            <SectionHeader title={`🎯 ${t('services.title')}`} href={`/${locale}/services`} label={t('services.viewAll')} />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {services.map(svc => {
                const svcName = (svc as any)[`name_${locale}`] || svc.name_uz;
                const href = `/${locale}/services/${svc.slug ?? svc.id}`;
                let priceLabel = '';
                if (svc.currency === 'FREE') priceLabel = locale === 'ru' ? 'Бесплатно' : locale === 'en' ? 'Free' : 'Bepul';
                else if (svc.price) {
                  const cur = svc.currency === 'OTHER' ? (svc.currency_custom || '') : (svc.currency || '');
                  priceLabel = `${svc.price.toLocaleString()} ${cur}`;
                }
                return (
                  <Link key={svc.id} href={href} className="bg-[#f0f9f8] dark:bg-[#161b22] rounded-2xl overflow-hidden border border-[#e2e8f0] dark:border-[#21262d] hover:shadow-md transition flex flex-col">
                    {svc.photo_url ? (
                      <div className="relative w-full aspect-[4/3]">
                        <Image src={svc.photo_url} alt={svcName} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-full aspect-[4/3] bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center text-5xl">🎯</div>
                    )}
                    <div className="p-4 flex flex-col gap-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white leading-snug line-clamp-2">{svcName}</h3>
                      {priceLabel && <p className="text-sm font-medium text-teal-700 dark:text-teal-400">{priceLabel}</p>}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
