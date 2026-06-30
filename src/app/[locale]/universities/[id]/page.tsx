import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import type { University, UniversityMajor } from '@/lib/supabase/types';
import UniversityGallery from '@/components/universities/UniversityGallery';

const TYPE_LABELS = { public: 'Davlat', private: 'Xususiy' };
const TYPE_COLORS = {
  public: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400',
  private: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400',
};
const DEGREE_LABELS: Record<string, string> = {
  bachelor: 'Bakalavriat',
  master_thesis: 'Magistratura (dissertatsiya bilan)',
  master_no_thesis: 'Magistratura (dissertatsiyasiz)',
  phd: 'PhD / Doktorantura',
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
  const photos = u.photo_urls ?? [];

  return (
    <div className="min-h-screen bg-[#f0f9f8] dark:bg-[#0d1117] py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href={`/${locale}/universities`} className="text-sm text-teal-700 dark:text-teal-400 hover:underline">&larr; Barcha universitetlar</Link>

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

            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{u.name}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-6">{u.city ? `${u.city}, ` : ''}{u.country}</p>

            {description && (
              <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line mb-8 leading-relaxed text-base">
                {description}
              </div>
            )}

            {majors.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Mutaxassisliklar</h2>
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                      <tr>
                        <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-300 font-medium">Mutaxassislik</th>
                        <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-300 font-medium hidden sm:table-cell">Daraja</th>
                        <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-300 font-medium hidden sm:table-cell">Til</th>
                        <th className="text-right px-4 py-3 text-gray-600 dark:text-gray-300 font-medium">Narx</th>
                      </tr>
                    </thead>
                    <tbody>
                      {majors.map((m) => (
                        <tr key={m.id} className="border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                          <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{m.name}</td>
                          <td className="px-4 py-3 text-gray-500 dark:text-gray-400 hidden sm:table-cell text-xs">
                            {m.degree ? (DEGREE_LABELS[m.degree] ?? m.degree) : '—'}
                          </td>
                          <td className="px-4 py-3 text-gray-500 dark:text-gray-400 hidden sm:table-cell">{m.language || '—'}</td>
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
          </div>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-6 space-y-4 mt-6 lg:mt-0">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 space-y-4">
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">Turi</div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${TYPE_COLORS[u.type]}`}>
                  {TYPE_LABELS[u.type]}
                </span>
              </div>
              {u.ranking && (
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">Dunyo reytingi</div>
                  <div className="text-2xl font-extrabold text-gray-900 dark:text-white">#{u.ranking}</div>
                </div>
              )}
              {u.city && (
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">Joylashuv</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{u.city}, {u.country}</div>
                </div>
              )}
              {majors.length > 0 && (
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">Yo'nalishlar</div>
                  <div className="text-2xl font-extrabold text-gray-900 dark:text-white">{majors.length}</div>
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
                Rasmiy sayt →
              </a>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
