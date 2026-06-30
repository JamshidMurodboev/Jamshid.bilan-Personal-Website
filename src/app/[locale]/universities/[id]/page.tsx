import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import type { University, UniversityMajor } from '@/lib/supabase/types';

const TYPE_LABELS = { public: 'Davlat', private: 'Xususiy' };
const TYPE_COLORS = {
  public: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400',
  private: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400',
};

export default async function UniversityDetailPage({ params: { locale, id } }: { params: { locale: string; id: string } }) {
  setRequestLocale(locale);

  const supabase = await createClient();
  const [{ data }, { data: majorsData }] = await Promise.all([
    supabase.from('universities').select('*').eq('id', id).single(),
    supabase.from('university_majors').select('*').eq('university_id', id).order('sort_order'),
  ]);

  const u = data as University | null;
  if (!u) notFound();

  const majors = (majorsData ?? []) as UniversityMajor[];
  const description = (u as any)[`description_${locale}`] || u.description_uz || '';

  return (
    <div className="min-h-screen bg-[#f0f9f8] dark:bg-[#0d1117] py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href={`/${locale}/universities`} className="text-sm text-teal-700 dark:text-teal-400 hover:underline">&larr; Barcha universitetlar</Link>

        {/* Hero image */}
        {u.photo_urls && u.photo_urls.length > 0 && (
          <div className="relative w-full h-64 rounded-2xl mt-4 mb-6 overflow-hidden">
            <Image src={u.photo_urls[0]} alt={u.name} fill className="object-cover" />
          </div>
        )}

        <div className="mt-6 mb-2 flex flex-wrap items-center gap-2">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${TYPE_COLORS[u.type]}`}>
            {TYPE_LABELS[u.type]}
          </span>
          {u.ranking && (
            <span className="text-xs px-2 py-1 rounded-full font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
              #{u.ranking} reyting
            </span>
          )}
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{u.name}</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">{u.city ? `${u.city}, ` : ''}{u.country}</p>

        {description && (
          <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-line mb-8">{description}</div>
        )}

        {/* Majors table */}
        {majors.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Mutaxassisliklar</h2>
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                  <tr>
                    <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-300 font-medium">Mutaxassislik</th>
                    <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-300 font-medium">Til</th>
                    <th className="text-right px-4 py-3 text-gray-600 dark:text-gray-300 font-medium">Narx</th>
                  </tr>
                </thead>
                <tbody>
                  {majors.map(m => (
                    <tr key={m.id} className="border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{m.name}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{m.language || '—'}</td>
                      <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                        {m.tuition ? `${m.tuition.toLocaleString()} ${m.currency}` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Extra photos */}
        {u.photo_urls && u.photo_urls.length > 1 && (
          <div className="grid grid-cols-2 gap-3 mb-8">
            {u.photo_urls.slice(1).map((url, i) => (
              <div key={i} className="relative aspect-video rounded-xl overflow-hidden">
                <Image src={url} alt={`${u.name} ${i + 2}`} fill className="object-cover" />
              </div>
            ))}
          </div>
        )}

        {u.website_url && (
          <a
            href={u.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block border border-teal-700 dark:border-teal-500 text-teal-700 dark:text-teal-400 px-8 py-3 rounded-xl font-semibold hover:bg-teal-50 dark:hover:bg-teal-900/20 transition"
          >
            Rasmiy sayt →
          </a>
        )}
      </div>
    </div>
  );
}
