'use client';
import { useState, useMemo, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import ScholarshipCard from '@/components/scholarships/ScholarshipCard';
import ScholarshipFilters from '@/components/scholarships/ScholarshipFilters';
import PageNav from '@/components/shared/PageNav';
import type { Scholarship } from '@/lib/supabase/types';

export default function ScholarshipsPage() {
  const locale = useLocale();
  const t = useTranslations('scholarships');
  const tc = useTranslations('common');
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    Promise.resolve(
      createClient().from('scholarships').select('*').order('home_order', { ascending: true, nullsFirst: false }).order('created_at', { ascending: false })
    )
      .then(({ data, error }) => {
        if (!error && data) setScholarships(data as Scholarship[]);
        else setFetchError(true);
        setLoading(false);
      })
      .catch(() => {
        setFetchError(true);
        setLoading(false);
      });
  }, []);

  const countries = useMemo(() =>
    Array.from(new Set(scholarships.map(s => s.country).filter(Boolean))).sort(),
    [scholarships]
  );

  const filtered = useMemo(() => scholarships.filter((s) => {
    const matchSearch = s.title.toLowerCase().includes(search.toLowerCase()) || s.country.toLowerCase().includes(search.toLowerCase());
    const matchCountry = !country || s.country === country;
    const matchStatus = !status || s.status === status;
    const matchCategory = !category || (s as any).category === category;
    return matchSearch && matchCountry && matchStatus && matchCategory;
  }), [scholarships, search, country, status, category]);

  return (
    <div className="min-h-screen bg-[#f0f9f8] dark:bg-[#0d1117] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageNav backHref={`/${locale}#scholarships`} />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('pageTitle')}</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">{t('pageSubtitle')}</p>
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="lg:w-60 flex-shrink-0">
            <ScholarshipFilters
              search={search} onSearch={setSearch}
              country={country} onCountry={setCountry}
              status={status} onStatus={setStatus}
              category={category} onCategory={setCategory}
              countries={countries}
            />
          </aside>
          <div className="flex-1">
            {loading ? (
              <div className="text-teal-700 dark:text-teal-400 animate-pulse">{tc('loading')}</div>
            ) : fetchError ? (
              <p className="text-red-500 dark:text-red-400">{tc('error')}</p>
            ) : filtered.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">{tc('noResults')}</p>
            ) : (
              <>
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((s) => <ScholarshipCard key={s.id} scholarship={s} locale={locale} />)}
                </div>
                <div className="mt-8 flex items-center gap-3 rounded-2xl border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-900/20 px-5 py-4 text-sm text-teal-700 dark:text-teal-300">
                  <span className="text-lg">🚀</span>
                  {t('moreComing')}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
