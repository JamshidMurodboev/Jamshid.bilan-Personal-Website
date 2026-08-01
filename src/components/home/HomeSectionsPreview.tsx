import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { formatDate } from '@/lib/format';
import type { Scholarship, University, StudentResult, NewsPost } from '@/lib/supabase/types';

const STATUS_COLORS = {
  open: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
  closed: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400',
  upcoming: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400',
};
const STATUS_UZ = { open: 'Ochiq', closed: 'Yopiq', upcoming: 'Kelayotgan' };
const UNI_STATUS_UZ = { open: 'Ochiq', closed: 'Yopiq', upcoming: 'Tez orada' };
const FUNDING_COLORS: Record<string, string> = {
  fully_funded: 'bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-400',
  partially_funded: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400',
  self_funded: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
};
const FUNDING_UZ: Record<string, string> = {
  fully_funded: "To'liq moliyalashtirilgan",
  partially_funded: 'Qisman moliyalashtirilgan',
  self_funded: 'Kontrakt asosida',
};
const TYPE_COLORS = {
  public: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400',
  private: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400',
};
const TYPE_UZ = { public: 'Davlat', private: 'Xususiy' };

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

  const [scholarshipsRes, universitiesRes, resultsRes, newsRes] = await Promise.allSettled([
    supabase.from('scholarships').select('id,title,country,status,category,close_date,photo_urls,degrees_available').order('created_at', { ascending: false }).limit(3),
    supabase.from('universities').select('id,name,country,city,type,status,tuition_usd,photo_urls').order('created_at', { ascending: false }).limit(3),
    supabase.from('student_results').select('id,student_name,photo_url,photo_urls,degree_level,year,country,testimonial').order('created_at', { ascending: false }).limit(3),
    supabase.from('news_posts').select('id,title_uz,title_ru,title_en,body_uz,body_ru,body_en,published_at').eq('published', true).order('published_at', { ascending: false }).limit(3),
  ]);

  const scholarships: Scholarship[] = scholarshipsRes.status === 'fulfilled' && scholarshipsRes.value.data?.length ? scholarshipsRes.value.data as Scholarship[] : [];
  const universities: University[] = universitiesRes.status === 'fulfilled' && universitiesRes.value.data?.length ? universitiesRes.value.data as University[] : [];
  const results: StudentResult[] = resultsRes.status === 'fulfilled' && resultsRes.value.data?.length ? resultsRes.value.data as StudentResult[] : [];
  const news: NewsPost[] = newsRes.status === 'fulfilled' && newsRes.value.data?.length ? newsRes.value.data as NewsPost[] : [];

  return (
    <div className="bg-white dark:bg-[#0d1117]">
      {/* Scholarships */}
      {scholarships.length > 0 && (
        <section className="py-14 px-4 border-b border-gray-100 dark:border-gray-800">
          <div className="max-w-6xl mx-auto">
            <SectionHeader title="🎓 Grantlar" href={`/${locale}/scholarships`} label="Barcha grantlar" />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {scholarships.map(s => {
                const photos: string[] = (s as any).photo_urls?.length ? (s as any).photo_urls : [];
                const degrees: string[] = (s as any).degrees_available ?? [];
                const DEGREE_UZ: Record<string, string> = { bachelor: 'Bakalavriat', master: 'Magistratura', phd: 'PhD' };
                return (
                  <Link key={s.id} href={`/${locale}/scholarships/${s.id}`} className="bg-[#f0f9f8] dark:bg-[#161b22] rounded-2xl overflow-hidden border border-[#e2e8f0] dark:border-[#21262d] hover:shadow-md transition flex flex-col">
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
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${STATUS_COLORS[s.status]}`}>{STATUS_UZ[s.status]}</span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{s.country}</p>
                      {s.category && (
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium w-fit ${FUNDING_COLORS[s.category]}`}>{FUNDING_UZ[s.category]}</span>
                      )}
                      {degrees.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {degrees.map(d => (
                            <span key={d} className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 text-xs px-2 py-0.5 rounded-full">{DEGREE_UZ[d] ?? d}</span>
                          ))}
                        </div>
                      )}
                      {s.close_date && <p className="text-xs text-gray-400 dark:text-gray-500 mt-auto">Muddati: {s.close_date}</p>}
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
            <SectionHeader title="🏫 Universitetlar" href={`/${locale}/universities`} label="Barcha universitetlar" />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {universities.map(u => {
                const photos: string[] = (u as any).photo_urls?.length ? (u as any).photo_urls : [];
                return (
                  <Link key={u.id} href={`/${locale}/universities/${u.id}`} className="bg-[#f0f9f8] dark:bg-[#161b22] rounded-2xl overflow-hidden border border-[#e2e8f0] dark:border-[#21262d] hover:shadow-md transition flex flex-col">
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
                          <p className="text-sm text-gray-500 dark:text-gray-400">{u.city ? `${u.city}, ` : ''}{u.country}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[u.type]}`}>{TYPE_UZ[u.type]}</span>
                          {u.status && <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[u.status]}`}>{UNI_STATUS_UZ[u.status]}</span>}
                        </div>
                      </div>
                      {u.tuition_usd != null && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-auto"><span className="font-medium">O&apos;qish narxi:</span> ${u.tuition_usd.toLocaleString()}/yil</p>
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
            <SectionHeader title="🏆 Muvaffaqiyat tarihlari" href={`/${locale}/results`} label="Barcha natijalar" />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {results.map(r => {
                const photos: string[] = (r as any).photo_urls?.length ? (r as any).photo_urls : r.photo_url ? [r.photo_url] : [];
                return (
                  <Link key={r.id} href={`/${locale}/results/${r.id}`} className="bg-[#f0f9f8] dark:bg-[#161b22] rounded-2xl overflow-hidden border border-[#e2e8f0] dark:border-[#21262d] hover:shadow-md transition flex flex-col">
                    {photos.length > 0 ? (
                      <div className="relative w-full aspect-[4/3]">
                        <Image src={photos[0]} alt={r.student_name} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-full aspect-[4/3] bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center">
                        <span className="w-14 h-14 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center text-teal-700 dark:text-teal-400 font-bold text-2xl">{r.student_name[0]}</span>
                      </div>
                    )}
                    <div className="p-4 flex flex-col gap-1">
                      <p className="font-semibold text-gray-900 dark:text-white">{r.student_name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{r.country} · {r.year}</p>
                      {r.testimonial && <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mt-1">&ldquo;{r.testimonial}&rdquo;</p>}
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
        <section className="py-14 px-4">
          <div className="max-w-6xl mx-auto">
            <SectionHeader title="📰 So'nggi yangiliklar" href={`/${locale}/news`} label="Barcha yangiliklar" />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {news.map(post => {
                const title = (post as any)[`title_${locale}`] || post.title_uz;
                const body = (post as any)[`body_${locale}`] || post.body_uz;
                return (
                  <Link key={post.id} href={`/${locale}/news/${post.id}`} className="bg-[#f0f9f8] dark:bg-[#161b22] rounded-2xl p-5 border border-[#e2e8f0] dark:border-[#21262d] hover:shadow-md transition flex flex-col gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">{title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 flex-1">{body}</p>
                    {post.published_at && <span className="text-xs text-gray-400 dark:text-gray-500">{formatDate(post.published_at)}</span>}
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
