import { setRequestLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import type { University, UniversityMajor, RequiredDocument } from '@/lib/supabase/types';
import UniversityGallery from '@/components/universities/UniversityGallery';
import { translateCountry } from '@/lib/translateCountry';
import PageNav from '@/components/shared/PageNav';
import { translateLanguage } from '@/lib/translateLanguage';
import { formatDate } from '@/lib/format';

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
  const [{ data }, { data: majorsData }, { data: resultsData }, { data: newsData }, t] = await Promise.all([
    supabase.from('universities').select('*').eq('id', id).single(),
    supabase.from('university_majors').select('*').eq('university_id', id).order('sort_order'),
    supabase.from('student_results').select('id, student_name, degree_level, year, country').eq('university_id', id).order('year', { ascending: false }),
    supabase.from('news_posts').select('id, title_uz, title_ru, title_en, cover_url, photo_urls, published_at').eq('university_id', id).eq('published', true).order('published_at', { ascending: false }).limit(3),
    getTranslations({ locale, namespace: 'universities' }),
  ]);

  const u = data as University | null;
  if (!u) notFound();

  const majors = (majorsData ?? []) as UniversityMajor[];
  const linkedResults = (resultsData ?? []) as { id: string; student_name: string; degree_level: string; year: number; country: string }[];
  const linkedNews = (newsData ?? []) as { id: string; title_uz: string; title_ru?: string; title_en?: string; cover_url?: string; photo_urls?: string[]; published_at?: string }[];
  const description = (u as any)[`description_${locale}`] || u.description_uz || '';
  const photos = u.photo_urls ?? [];
  const requiredDocs: RequiredDocument[] = (u as any).required_documents ?? [];
  const docLocale = (d: RequiredDocument) => (d as any)[locale] || d.uz;

  return (
    <div className="min-h-screen bg-[#f0f9f8] dark:bg-[#0d1117] py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageNav />

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
                <div className="flex flex-wrap gap-2">
                  {linkedResults.map(r => (
                    <Link key={r.id} href={`/${locale}/results/${r.id}`}
                      className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-teal-400 dark:hover:border-teal-500 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white hover:text-teal-700 dark:hover:text-teal-400 transition shadow-sm">
                      <span className="w-7 h-7 rounded-full bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-teal-700 dark:text-teal-400 font-bold text-xs flex-shrink-0">
                        {r.student_name[0]}
                      </span>
                      <span>{r.student_name}</span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">· {r.year}</span>
                    </Link>
                  ))}
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
                      <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400 flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
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
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">So'nggi yangiliklar</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {linkedNews.map(post => {
                    const newsTitle = (post as any)[`title_${locale}`] || post.title_uz;
                    const thumb = post.cover_url || post.photo_urls?.[0];
                    return (
                      <Link key={post.id} href={`/${locale}/news/${post.id}`}
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
                          <td className="px-4 py-3 text-gray-500 dark:text-gray-400 hidden sm:table-cell">{m.language ? translateLanguage(m.language, locale) : '—'}</td>
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
                {t('officialWebsite')}
              </a>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
