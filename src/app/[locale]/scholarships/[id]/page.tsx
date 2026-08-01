import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import type { Scholarship } from '@/lib/supabase/types';
import TelegramContactButton from '@/components/contact/TelegramContactButton';
import PageNav from '@/components/shared/PageNav';
import { translateCountry } from '@/lib/translateCountry';

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

  const [supabase, t, tc] = await Promise.all([
    createClient(),
    getTranslations({ locale, namespace: 'scholarships' }),
    getTranslations({ locale, namespace: 'common' }),
  ]);

  const { data } = await supabase.from('scholarships').select('*').eq('id', id).single();
  const s = data as Scholarship | null;
  if (!s) notFound();

  const description = (s as any)[`description_${locale}`] || s.description_uz || '';
  const degreesAvailable: string[] = (s as any).degrees_available ?? [];

  return (
    <div className="min-h-screen bg-[#f0f9f8] dark:bg-[#0d1117] py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageNav />

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

            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{s.title}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-6">{translateCountry(s.country, locale)}{s.university ? ` · ${s.university}` : ''}</p>

            {description && (
              <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line mb-6 leading-relaxed text-base max-w-2xl">
                {description}
              </div>
            )}

            {/* CTA buttons below description */}
            <div className="flex flex-wrap gap-3 mb-8">
              <TelegramContactButton
                platform="telegram"
                scholarshipContext={s.title}
                className="inline-flex items-center gap-2 bg-[#0088cc] hover:bg-[#0077b5] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition shadow-sm"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.04 9.613c-.152.678-.554.843-1.123.524l-3.1-2.284-1.497 1.44c-.165.165-.304.304-.624.304l.223-3.165 5.757-5.197c.25-.223-.054-.347-.389-.124L6.838 14.04l-3.054-.953c-.664-.208-.678-.664.138-.982l11.931-4.6c.554-.2 1.04.138.709.743z"/></svg>
                {t('contactTelegram')}
              </TelegramContactButton>
              <TelegramContactButton
                platform="whatsapp"
                scholarshipContext={s.title}
                className="inline-flex items-center gap-2 bg-[#25d366] hover:bg-[#20b956] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition shadow-sm"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                {t('contactWhatsApp')}
              </TelegramContactButton>
            </div>

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
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide font-medium">Holat</div>
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
                    {s.coverage?.map(c => (
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
                  <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium pt-1">Sanalar</div>
                  {s.open_date && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Ochilish</span>
                      <span className="font-medium text-gray-900 dark:text-white">{s.open_date}</span>
                    </div>
                  )}
                  {s.close_date && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Yopilish</span>
                      <span className="font-medium text-gray-900 dark:text-white">{s.close_date}</span>
                    </div>
                  )}
                  {s.results_date && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Natijalar</span>
                      <span className="font-medium text-gray-900 dark:text-white">{s.results_date}</span>
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
                className="block w-full text-center bg-teal-700 hover:bg-teal-800 text-white px-6 py-3 rounded-xl font-semibold transition"
              >
                Hujjat topshirish →
              </a>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
