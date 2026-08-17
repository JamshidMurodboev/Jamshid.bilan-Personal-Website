export const dynamic = 'force-dynamic';

import { setRequestLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import type { Service } from '@/lib/supabase/types';
import PageNav from '@/components/shared/PageNav';
import ActivityTracker from '@/components/shared/ActivityTracker';
import FavouriteButton from '@/components/shared/FavouriteButton';
import { isUUID } from '@/lib/slugify';
import ServiceContactButtons from '@/components/services/ServiceContactButtons';
import ShareButton from '@/components/shared/ShareButton';
import StudentCard from '@/components/results/StudentCard';

function priceDisplay(s: Service, freeLabel: string) {
  if (s.currency === 'FREE') return freeLabel;
  if (!s.price) return null;
  const cur = s.currency === 'OTHER' ? (s.currency_custom || '') : (s.currency || '');
  return `${s.price.toLocaleString()} ${cur}`;
}

export default async function ServiceDetailPage({ params: { locale, id } }: { params: { locale: string; id: string } }) {
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'services' });

  const supabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  let svc: Service | null = null;
  if (isUUID(id)) {
    const { data } = await supabase.from('services').select('*').eq('id', id).single();
    svc = data as Service | null;
  } else {
    const { data } = await supabase.from('services').select('*').eq('slug', id).single();
    svc = data as Service | null;
  }
  if (!svc) notFound();

  const name = (svc as any)[`name_${locale}`] || svc.name_uz;
  const description = (svc as any)[`description_${locale}`] || svc.description_uz || '';
  const price = priceDisplay(svc, t('free'));

  const [schLinksRes, uniLinksRes, resLinksRes] = await Promise.all([
    supabase.from('service_scholarships').select('scholarship_id').eq('service_id', svc.id),
    supabase.from('service_universities').select('university_id').eq('service_id', svc.id),
    supabase.from('service_results').select('result_id').eq('service_id', svc.id),
  ]);
  if (schLinksRes.error) console.error('service_scholarships error:', schLinksRes.error);
  if (uniLinksRes.error) console.error('service_universities error:', uniLinksRes.error);
  if (resLinksRes.error) console.error('service_results error:', resLinksRes.error);
  const { data: schLinks } = schLinksRes;
  const { data: uniLinks } = uniLinksRes;
  const { data: resLinks } = resLinksRes;

  const scholarshipIds = (schLinks ?? []).map((r: { scholarship_id: string }) => r.scholarship_id);
  const universityIds = (uniLinks ?? []).map((r: { university_id: string }) => r.university_id);
  const resultIds = (resLinks ?? []).map((r: { result_id: string }) => r.result_id);

  const [{ data: scholarships }, { data: universities }, { data: results }] = await Promise.all([
    scholarshipIds.length > 0
      ? supabase.from('scholarships').select('id,title,slug,photo_urls,country,status').in('id', scholarshipIds)
      : Promise.resolve({ data: [] }),
    universityIds.length > 0
      ? supabase.from('universities').select('id,name,slug,photo_urls,country,city,type').in('id', universityIds)
      : Promise.resolve({ data: [] }),
    resultIds.length > 0
      ? supabase.from('student_results').select('id,student_name,slug,photo_url,photo_urls,country,year,degree_level,major,language,category,university_name').in('id', resultIds)
      : Promise.resolve({ data: [] }),
  ]);

  return (
    <div className="min-h-screen bg-page py-12 sm:py-16">
      <article className="max-w-3xl mx-auto px-5 sm:px-8">
        <PageNav backHref={`/${locale}/services`} />
        <ActivityTracker entityType="service" entityId={svc.id} entityName={name} />

        <header className="mt-8 mb-8">
          <div className="flex items-start justify-between gap-4">
            <h1 className="display text-4xl sm:text-5xl">{name}</h1>
            <div className="flex items-center gap-2 flex-shrink-0 pt-1.5">
              <FavouriteButton entityType="service" entityId={svc.id} />
              <ShareButton url={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://jamshidbilan.uz'}/${locale}/services/${(svc as any).slug ?? svc.id}`} title={name} entityType="service" entityId={svc.id} entityName={svc.name_uz} />
            </div>
          </div>
        </header>

        {svc.photo_url && (
          <div className="relative w-full aspect-[16/9] rounded-3xl overflow-hidden border border-line bg-soft mb-10">
            <Image src={svc.photo_url} alt={name} fill className="object-cover" />
          </div>
        )}

        {description && (
          <div className="text-body whitespace-pre-line mb-12 leading-relaxed text-base sm:text-lg">{description}</div>
        )}

        {(scholarships?.length ?? 0) > 0 && (
          <section className="rule pt-8 mb-12">
            <p className="eyebrow mb-5">{t('linkedScholarships')}</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(scholarships ?? []).map((sch: any) => (
                <Link key={sch.id} href={`/${locale}/scholarships/${sch.slug ?? sch.id}`}
                  className="card-e overflow-hidden group flex flex-col">
                  <div className="p-4">
                    <p className="font-display text-sm text-heading leading-snug line-clamp-2 group-hover:text-accent transition-colors">{sch.title}</p>
                    {sch.country && <p className="text-xs text-muted-e mt-1">{sch.country}</p>}
                    {sch.status && <span className="chip mt-2">{sch.status}</span>}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {(universities?.length ?? 0) > 0 && (
          <section className="rule pt-8 mb-12">
            <p className="eyebrow mb-5">{t('linkedUniversities')}</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(universities ?? []).map((u: any) => (
                <Link key={u.id} href={`/${locale}/universities/${u.slug ?? u.id}`}
                  className="card-e overflow-hidden group flex flex-col">
                  <div className="p-4">
                    <p className="font-display text-sm text-heading leading-snug line-clamp-2 group-hover:text-accent transition-colors">{u.name}</p>
                    {u.country && <p className="text-xs text-muted-e mt-1">{u.city ? `${u.city}, ` : ''}{u.country}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {(results?.length ?? 0) > 0 && (
          <section className="rule pt-8 mb-12">
            <p className="eyebrow mb-5">{t('linkedResults')}</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(results ?? []).map((r: any) => (
                <StudentCard key={r.id} result={r} locale={locale} hidePhoto={true} />
              ))}
            </div>
          </section>
        )}

        <footer className="rule pt-8">
          {price && (
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-e">{t('price')}</span>
              <span className="font-display text-3xl text-heading">{price}</span>
            </div>
          )}
          {(() => { const note = (svc as any)[`price_note_${locale}`] || (svc as any).price_note_uz; return note ? <p className="text-sm text-muted-e mb-6">{note}</p> : null; })()}
          <ServiceContactButtons
            serviceContext={svc.name_uz}
            applyLabel={t('applyNow')}
            askLabel={t('askQuestion')}
            preselectedTarget={`Xizmat: ${(svc as any)[`name_${locale}`] || svc.name_uz}`}
          />
        </footer>
      </article>
    </div>
  );
}
