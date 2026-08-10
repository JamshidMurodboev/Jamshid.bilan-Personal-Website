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
      ? supabase.from('student_results').select('id,student_name,slug,photo_url,photo_urls,country,year,degree_level,major,major_uz,major_ru,major_en,language,category,university_name,university_name_uz,university_name_ru,university_name_en').in('id', resultIds)
      : Promise.resolve({ data: [] }),
  ]);

  return (
    <div className="min-h-screen bg-[#f0f9f8] dark:bg-[#0d1117] py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageNav backHref={`/${locale}/services`} />
        <ActivityTracker entityType="service" entityId={svc.id} entityName={name} />

        {svc.photo_url && (
          <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden mb-6 mt-4">
            <Image src={svc.photo_url} alt={name} fill className="object-cover" />
          </div>
        )}

        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{name}</h1>
          <FavouriteButton entityType="service" entityId={svc.id} />
        </div>

        {price && (
          <div className="inline-block mb-6 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 px-4 py-2 rounded-xl font-semibold text-lg">
            {price}
          </div>
        )}

        {description && (
          <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line mb-8 leading-relaxed text-base">{description}</div>
        )}

        {(scholarships?.length ?? 0) > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('linkedScholarships')}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(scholarships ?? []).map((sch: any) => (
                <Link key={sch.id} href={`/${locale}/scholarships/${sch.slug ?? sch.id}`}
                  className="bg-white dark:bg-[#161b22] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-md transition flex flex-col">
                  <div className="p-3">
                    <p className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2">{sch.title}</p>
                    {sch.country && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{sch.country}</p>}
                    {sch.status && <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400">{sch.status}</span>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {(universities?.length ?? 0) > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('linkedUniversities')}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(universities ?? []).map((u: any) => (
                <Link key={u.id} href={`/${locale}/universities/${u.slug ?? u.id}`}
                  className="bg-white dark:bg-[#161b22] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-md transition flex flex-col">
                  <div className="p-3">
                    <p className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2">{u.name}</p>
                    {u.country && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{u.city ? `${u.city}, ` : ''}{u.country}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {(results?.length ?? 0) > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('linkedResults')}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(results ?? []).map((r: any) => (
                <StudentCard key={r.id} result={r} locale={locale} hidePhoto={true} />
              ))}
            </div>
          </div>
        )}

        <ServiceContactButtons
          serviceContext={svc.name_uz}
          applyLabel={t('applyNow')}
          askLabel={t('askQuestion')}
        />
      </div>
    </div>
  );
}
