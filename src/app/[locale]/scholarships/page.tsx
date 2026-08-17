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
    <div className="min-h-screen bg-page">
      {/* Page hero */}
      <section className="pt-10 sm:pt-14 pb-10 sm:pb-14 border-b border-line">
        <div className="container-page">
          <PageNav backHref={`/${locale}#scholarships`} />
          <h1 className="display text-5xl sm:text-6xl mt-6 mb-4 anim-fade-up">{t('pageTitle')}</h1>
          <p className="text-lg text-body max-w-2xl anim-fade-up anim-delay-1">{t('pageSubtitle')}</p>
        </div>
      </section>

      <section className="py-10 sm:py-14">
        <div className="container-page">
          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="lg:w-64 flex-shrink-0">
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
                <div className="text-muted-e animate-pulse">{tc('loading')}</div>
              ) : fetchError ? (
                <p className="text-accent">{tc('error')}</p>
              ) : filtered.length === 0 ? (
                <p className="text-muted-e">{tc('noResults')}</p>
              ) : (
                <>
                  <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((s) => <ScholarshipCard key={s.id} scholarship={s} locale={locale} />)}
                  </div>
                  <p className="mt-12 pt-6 rule text-sm text-muted-e">
                    {t('moreComing')}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
