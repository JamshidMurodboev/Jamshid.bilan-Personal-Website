'use client';
import { useState, useMemo, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import ScholarshipCard from '@/components/scholarships/ScholarshipCard';
import ScholarshipFilters from '@/components/scholarships/ScholarshipFilters';
import type { Scholarship } from '@/lib/supabase/types';

const SAMPLE_SCHOLARSHIPS: Scholarship[] = [
  { id: '1', title: 'Turkiye Burslari', country: 'Turkiya', university: 'Barcha davlat universitetlari', coverage: ['tuition', 'housing', 'stipend', 'flights'], eligibility: '18-30 yosh', deadline: '2025-02-20', difficulty: 4, tip: "Motivatsiya xatiga alohida e'tibor bering.", application_url: 'https://turkiyeburslari.gov.tr', status: 'open', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: '2', title: 'Chevening Scholarship', country: 'Buyuk Britaniya', coverage: ['tuition', 'housing', 'stipend', 'flights'], eligibility: '2+ yil ish tajribasi', deadline: '2024-11-05', difficulty: 5, tip: 'Liderlik tajribangizni aniq misollar bilan ifodalang.', application_url: 'https://chevening.org', status: 'closed', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: '3', title: 'DAAD Scholarship', country: 'Germaniya', coverage: ['tuition', 'stipend'], eligibility: 'Bakalavriat yoki magistratura', deadline: '2025-10-15', difficulty: 3, tip: "Nemis tili sertifikati bo'lsa kuchli ustunlik.", application_url: 'https://daad.de', status: 'open', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
];

export default function ScholarshipsPage() {
  const locale = useLocale();
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('');
  const [status, setStatus] = useState('');
  const [scholarships, setScholarships] = useState<Scholarship[]>(SAMPLE_SCHOLARSHIPS);

  useEffect(() => {
    createClient().from('scholarships').select('*').then(({ data, error }) => {
      if (!error && data && data.length > 0) setScholarships(data as Scholarship[]);
    });
  }, []);

  const filtered = useMemo(() => scholarships.filter((s) => {
    const matchSearch = s.title.toLowerCase().includes(search.toLowerCase()) || s.country.toLowerCase().includes(search.toLowerCase());
    const matchCountry = !country || s.country === country;
    const matchStatus = !status || s.status === status;
    return matchSearch && matchCountry && matchStatus;
  }), [scholarships, search, country, status]);

  return (
    <div className="min-h-screen bg-[#f0f9f8] dark:bg-[#0d1117] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Grantlar</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">To'liq moliyalashtirilgan grant dasturlari katalogi</p>
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 flex-shrink-0">
            <ScholarshipFilters search={search} onSearch={setSearch} country={country} onCountry={setCountry} status={status} onStatus={setStatus} />
          </aside>
          <div className="flex-1">
            {filtered.length === 0
              ? <p className="text-gray-500 dark:text-gray-400">Hech narsa topilmadi.</p>
              : <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">{filtered.map((s) => <ScholarshipCard key={s.id} scholarship={s} locale={locale} />)}</div>
            }
          </div>
        </div>
      </div>
    </div>
  );
}
