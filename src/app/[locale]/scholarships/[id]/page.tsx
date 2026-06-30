import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import type { Scholarship } from '@/lib/supabase/types';

const STATUS_COLORS = {
  open: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
  closed: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400',
  upcoming: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400',
};
const STATUS_LABELS = { open: 'Ochiq', closed: 'Yopiq', upcoming: 'Kelayotgan' };
const CATEGORY_LABELS = {
  fully_funded: "To'liq moliyalashtirilgan",
  partially_funded: 'Qisman moliyalashtirilgan',
  self_funded: 'Kontrakt asosida',
};

export default async function ScholarshipDetailPage({ params: { locale, id } }: { params: { locale: string; id: string } }) {
  setRequestLocale(locale);

  const supabase = await createClient();
  const { data } = await supabase.from('scholarships').select('*').eq('id', id).single();
  const s = data as Scholarship | null;
  if (!s) notFound();

  const description = (s as any)[`description_${locale}`] || s.description_uz || '';

  return (
    <div className="min-h-screen bg-[#f0f9f8] dark:bg-[#0d1117] py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href={`/${locale}/scholarships`} className="text-sm text-teal-700 dark:text-teal-400 hover:underline">&larr; Barcha grantlar</Link>

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
                {STATUS_LABELS[s.status]}
              </span>
              {s.category && (
                <span className="text-xs px-2 py-1 rounded-full font-medium bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-400">
                  {CATEGORY_LABELS[s.category]}
                </span>
              )}
            </div>

            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{s.title}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-6">{s.country}{s.university ? ` · ${s.university}` : ''}</p>

            {description && (
              <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line mb-8 leading-relaxed text-base max-w-2xl">
                {description}
              </div>
            )}

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
                  {STATUS_LABELS[s.status]}
                </span>
              </div>

              {s.coverage && s.coverage.length > 0 && (
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide font-medium">Qamrov</div>
                  <div className="flex flex-wrap gap-1.5">
                    {s.coverage.map(c => (
                      <span key={c} className="bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 text-xs px-2.5 py-1 rounded-full">{c}</span>
                    ))}
                  </div>
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
