'use client';
import { useState, useMemo } from 'react';
import ScholarshipCard from '@/components/scholarships/ScholarshipCard';
import ScholarshipFilters from '@/components/scholarships/ScholarshipFilters';
import { SAMPLE_SCHOLARSHIPS } from '@/lib/data';

export default function ScholarshipsPage() {
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('');
  const [status, setStatus] = useState('');

  const filtered = useMemo(() => {
    return SAMPLE_SCHOLARSHIPS.filter((s) => {
      const matchSearch = s.title.toLowerCase().includes(search.toLowerCase()) || s.country.toLowerCase().includes(search.toLowerCase());
      const matchCountry = !country || s.country === country;
      const matchStatus = !status || s.status === status;
      return matchSearch && matchCountry && matchStatus;
    });
  }, [search, country, status]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Grantlar</h1>
        <p className="text-gray-600 mb-8">To'liq moliyalashtirilgan grant dasturlari katalogi</p>
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 flex-shrink-0">
            <ScholarshipFilters
              search={search} onSearch={setSearch}
              country={country} onCountry={setCountry}
              status={status} onStatus={setStatus}
            />
          </aside>
          <div className="flex-1">
            {filtered.length === 0 ? (
              <p className="text-gray-500">Hech narsa topilmadi.</p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((s) => <ScholarshipCard key={s.id} scholarship={s} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
