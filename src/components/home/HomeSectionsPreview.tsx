import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { getTranslations } from 'next-intl/server';
import { formatDate } from '@/lib/format';
import type { Scholarship, University, StudentResult, NewsPost, Service } from '@/lib/supabase/types';
import { translateCountry } from '@/lib/translateCountry';
import { translateLanguage } from '@/lib/translateLanguage';

function SectionHeader({ number, title, href, label }: { number: string; title: string; href: string; label: string }) {
  return (
    <div className="flex items-end justify-between gap-6 mb-10">
      <div>
        <p className="eyebrow mb-4">{number}</p>
        <h2 className="display text-3xl sm:text-4xl">{title}</h2>
      </div>
      <Link href={href} className="arrow-link whitespace-nowrap mb-1">
        {label}<span className="arr">→</span>
      </Link>
    </div>
  );
}

function PlaceholderCover({ initial, ratio }: { initial: string; ratio: string }) {
  return (
    <div className={`w-full ${ratio} bg-soft flex items-center justify-center`} aria-hidden="true">
      <span className="font-display text-5xl text-muted-e">{initial}</span>
    </div>
  );
}

export default async function HomeSectionsPreview({ locale }: { locale: string }) {
  const supabase = createClient();
  const [t, tS, tC, tF, tR] = await Promise.all([
    getTranslations({ locale, namespace: 'homeSections' }),
    getTranslations({ locale, namespace: 'scholarships' }),
    getTranslations({ locale, namespace: 'common' }),
    getTranslations({ locale, namespace: 'filters' }),
    getTranslations({ locale, namespace: 'results' }),
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
  const results: StudentResult[] = resultsRes.status === 'fulfilled' && resultsRes.value.data?.length ? resultsRes.value.data as unknown as StudentResult[] : [];
  const news: NewsPost[] = newsRes.status === 'fulfilled' && newsRes.value.data?.length ? newsRes.value.data as NewsPost[] : [];
  const services: Service[] = servicesRes.status === 'fulfilled' && servicesRes.value.data?.length ? servicesRes.value.data as Service[] : [];

  const statusLabel = (s: string) => ({ open: tC('open'), closed: tC('closed'), upcoming: tC('upcoming') })[s as 'open' | 'closed' | 'upcoming'] ?? s;
  const uniTypeLabel = (type: string) => ({ public: tF('publicType'), private: tF('privateType') })[type as 'public' | 'private'] ?? type;

  return (
    <div>
      {/* Scholarships */}
      {scholarships.length > 0 && (
        <section id="scholarships" className="py-16 sm:py-20 border-t border-line">
          <div className="container-page">
            <SectionHeader number="06" title={t('scholarships.title')} href={`/${locale}/scholarships`} label={t('scholarships.viewAll')} />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {scholarships.map(s => {
                const photos: string[] = (s as any).photo_urls?.length ? (s as any).photo_urls : [];
                const degrees: string[] = (s as any).degrees_available ?? [];
                const href = `/${locale}/scholarships/${(s as any).slug ?? s.id}`;
                return (
                  <Link key={s.id} href={href} className="card-e overflow-hidden group flex flex-col">
                    {photos.length > 0 ? (
                      <div className="relative w-full aspect-[16/10] overflow-hidden bg-soft">
                        <Image src={photos[0]} alt={s.title} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                      </div>
                    ) : (
                      <PlaceholderCover initial={s.title?.[0] ?? 'S'} ratio="aspect-[16/10]" />
                    )}
                    <div className="p-6 flex flex-col gap-2.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="chip">{statusLabel(s.status)}</span>
                        <span className="text-xs text-muted-e">{translateCountry(s.country, locale)}</span>
                      </div>
                      <h3 className="font-display text-xl text-heading leading-snug group-hover:text-accent transition-colors">{s.title}</h3>
                      {s.category && (
                        <span className="text-xs font-semibold uppercase tracking-widest text-muted-e">
                          {tS(`fundingType.${s.category}`)}
                        </span>
                      )}
                      {degrees.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {degrees.map(d => (
                            <span key={d} className="text-xs px-2.5 py-0.5 rounded-full border border-line text-muted-e">
                              {tS(`degrees.${d}`, { fallback: d })}
                            </span>
                          ))}
                        </div>
                      )}
                      {s.close_date && <p className="text-xs text-muted-e mt-auto pt-2">{t('scholarships.deadline')}: {s.close_date}</p>}
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
        <section id="universities" className="py-16 sm:py-20 border-t border-line">
          <div className="container-page">
            <SectionHeader number="07" title={t('universities.title')} href={`/${locale}/universities`} label={t('universities.viewAll')} />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {universities.map(u => {
                const photos: string[] = (u as any).photo_urls?.length ? (u as any).photo_urls : [];
                const href = `/${locale}/universities/${(u as any).slug ?? u.id}`;
                return (
                  <Link key={u.id} href={href} className="card-e overflow-hidden group flex flex-col">
                    {photos.length > 0 ? (
                      <div className="relative w-full aspect-[16/10] overflow-hidden bg-soft">
                        <Image src={photos[0]} alt={u.name} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                      </div>
                    ) : (
                      <PlaceholderCover initial={u.name?.[0] ?? 'U'} ratio="aspect-[16/10]" />
                    )}
                    <div className="p-6 flex flex-col gap-2.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="chip">{uniTypeLabel(u.type)}</span>
                        {u.status && <span className="text-xs text-muted-e">{statusLabel(u.status)}</span>}
                      </div>
                      <h3 className="font-display text-xl text-heading leading-snug group-hover:text-accent transition-colors">{u.name}</h3>
                      <p className="text-sm text-muted-e">{u.city ? `${u.city}, ` : ''}{translateCountry(u.country, locale)}</p>
                      {u.tuition_usd != null && (
                        <p className="text-sm text-body mt-auto pt-2"><span className="font-semibold text-heading">{t('universities.tuition')}:</span> ${u.tuition_usd.toLocaleString()}/yil</p>
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
        <section id="results" className="py-16 sm:py-20 border-t border-line">
          <div className="container-page">
            <SectionHeader number="08" title={t('results.title')} href={`/${locale}/results`} label={t('results.viewAll')} />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {results.map(r => {
                const photos: string[] = (r as any).photo_urls?.length ? (r as any).photo_urls : r.photo_url ? [r.photo_url] : [];
                const href = `/${locale}/results/${(r as any).slug ?? r.id}`;
                const uniName = (r as any)[`university_name_${locale}`] || (r as any).university_name || '';
                const major = (r as any)[`major_${locale}`] || (r as any).major || '';
                const lang = (r as any).language;
                return (
                  <Link key={r.id} href={href} className="card-e overflow-hidden group flex flex-col">
                    {photos.length > 0 ? (
                      <div className="relative w-full aspect-[16/10] overflow-hidden bg-soft">
                        <Image src={photos[0]} alt={r.student_name} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                      </div>
                    ) : (
                      <PlaceholderCover initial={r.student_name[0]} ratio="aspect-[16/10]" />
                    )}
                    <div className="p-6 flex flex-col gap-1.5 flex-1">
                      {(() => {
                        const scholarshipTitle = (r as any).scholarships?.title || '';
                        const isScholarship = (r as any).category === 'scholarship_winner';
                        const degLabel: Record<string, string> = { bachelor: tR('degrees.bachelor'), master: tR('degrees.master'), phd: tR('degrees.phd') };
                        return (
                          <>
                            <h3 className="font-display text-lg text-heading leading-snug group-hover:text-accent transition-colors">
                              {isScholarship && scholarshipTitle ? `${r.student_name} — ${scholarshipTitle}` : r.student_name}
                            </h3>
                            <p className="text-sm text-body line-clamp-1">
                              {uniName && major ? `${uniName} — ${major}` : uniName || major || ''}
                            </p>
                            <div className="flex items-center gap-2 mt-auto pt-2 flex-wrap">
                              <span className="text-xs text-muted-e">{r.year}</span>
                              <div className="flex gap-2 ml-auto flex-wrap items-center">
                                {lang && (
                                  <span className="chip">{translateLanguage(lang, locale)}</span>
                                )}
                                {r.degree_level && (
                                  <span className="text-xs text-muted-e">
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
        <section id="news" className="py-16 sm:py-20 border-t border-line">
          <div className="container-page">
            <SectionHeader number="09" title={t('news.title')} href={`/${locale}/news`} label={t('news.viewAll')} />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {news.map(post => {
                const title = (post as any)[`title_${locale}`] || post.title_uz;
                const body = (post as any)[`body_${locale}`] || post.body_uz;
                const thumb = post.cover_url || post.photo_urls?.[0];
                const href = `/${locale}/news/${(post as any).slug ?? post.id}`;
                return (
                  <Link key={post.id} href={href} className="card-e overflow-hidden group flex flex-col">
                    {thumb ? (
                      <div className="relative w-full aspect-[16/10] overflow-hidden bg-soft">
                        <Image src={thumb} alt={title} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                      </div>
                    ) : (
                      <PlaceholderCover initial={title?.[0] ?? 'N'} ratio="aspect-[16/10]" />
                    )}
                    <div className="p-6 flex flex-col gap-2 flex-1">
                      {post.published_at && <span className="text-xs text-muted-e">{formatDate(post.published_at)}</span>}
                      <h3 className="font-display text-xl text-heading leading-snug line-clamp-2 group-hover:text-accent transition-colors">{title}</h3>
                      <p className="text-sm text-body line-clamp-2 flex-1">{body}</p>
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
        <section id="services" className="py-16 sm:py-20 border-t border-line">
          <div className="container-page">
            <SectionHeader number="10" title={t('services.title')} href={`/${locale}/services`} label={t('services.viewAll')} />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {services.map(svc => {
                const svcName = (svc as any)[`name_${locale}`] || svc.name_uz;
                const href = `/${locale}/services/${svc.slug ?? svc.id}`;
                let priceLabel = '';
                if (svc.currency === 'FREE') priceLabel = tC('free');
                else if (svc.price) {
                  const cur = svc.currency === 'OTHER' ? (svc.currency_custom || '') : (svc.currency || '');
                  priceLabel = `${svc.price.toLocaleString()} ${cur}`;
                }
                return (
                  <Link key={svc.id} href={href} className="card-e overflow-hidden group flex flex-col">
                    {svc.photo_url ? (
                      <div className="relative w-full aspect-[16/10] overflow-hidden bg-soft">
                        <Image src={svc.photo_url} alt={svcName} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                      </div>
                    ) : (
                      <PlaceholderCover initial={svcName?.[0] ?? 'S'} ratio="aspect-[16/10]" />
                    )}
                    <div className="p-5 flex flex-col gap-1.5">
                      <h3 className="font-display text-lg text-heading leading-snug line-clamp-2 group-hover:text-accent transition-colors">{svcName}</h3>
                      {priceLabel && <p className="text-sm font-semibold text-accent">{priceLabel}</p>}
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
