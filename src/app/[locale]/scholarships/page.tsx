'use client';
import { useState, useMemo } from 'react';
import ScholarshipCard from '@/components/scholarships/ScholarshipCard';
import type { Scholarship } from '@/types';

const SAMPLE_SCHOLARSHIPS: Scholarship[] = [
  {
    id: '1',
    title: 'Turkiye Bursları',
    country: 'Turkiya',
    university: 'Barcha davlat universitetlari',
    coverage: ['tuition', 'housing', 'stipend', 'flights'],
    eligibility: '18-30 yosh, bakalavriat yoki magistratura',
    deadline: '2025-02-20',
    difficulty: 4,
    tip: "Motivatsiya xatiga alohida e'tibor bering. Turkiyaga muhabbatingizni ko'rsating.",
    application_url: 'https://turkiyeburslari.gov.tr',
    status: 'open',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'Chevening Scholarship',
    country: 'Buyuk Britaniya',
    coverage: ['tuition', 'housing', 'stipend', 'flights'],
    eligibility: '2+ yil ish tajribasi, magistratura',
    deadline: '2024-11-05',
    difficulty: 5,
    tip: 'Liderlik tajribangizni aniq misollar bilan ifodalang.',
    application_url: 'https://chevening.org',
    status: 'closed',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    title: 'Daad Scholarship',
    country: 'Germaniya',
    university: 'Nemis universitetlari',
    coverage: ['tuition', 'stipend'],
    eligibility: 'Bakalavriat bitiruvchilari',
    deadline: '2025-10-15',
    difficulty: 3,
    tip: "Nemis tili sertifikatini erta boshlang.",
    application_url: 'https://daad.de',
    status: 'open',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '4',
    title: 'Fulbright Scholarship',
    country: 'AQSh',
    university: 'Amerika universitetlari',
    coverage: ['tuition', 'housing', 'stipend', 'flights'],
    eligibility: 'Magistratura, 3+ yil tajriba',
    deadline: '2025-09-01',
    difficulty: 5,
    tip: "Shaxsiy maqsadlaringizni aniq ifodalang.",
    application_url: 'https://fulbrightprogram.org',
    status: 'open',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

const COUNTRIES = Array.from(new Set(SAMPLE_SCHOLARSHIPS.map((s) => s.country)));

export default function ScholarshipsPage() {
  const [search, setSearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const filtered = useMemo(() => {
    return SAMPLE_SCHOLARSHIPS.filter((s) => {
      const matchSearch =
        !search ||
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.country.toLowerCase().includes(search.toLowerCase());
      const matchCountry = !selectedCountry || s.country === selectedCountry;
      const matchStatus = !selectedStatus || s.status === selectedStatus;
      return matchSearch && matchCountry && matchStatus;
    });
  }, [search, selectedCountry, selectedStatus]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Grantlar</h1>
        <p className="text-gray-600 mb-8">To&#39;liq moliyalashtirilgan grant dasturlari katalogi</p>
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 flex-shrink-0 space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4">Qidirish</h3>
              <input
                type="text"
                placeholder="Grant nomi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4">Davlat</h3>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Barchasi</option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4">Holat</h3>
              <div className="space-y-2">
                {[['', 'Barchasi'], ['open', 'Ochiq'], ['closed', 'Yopiq']].map(([val, label]) => (
                  <label key={val} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value={val}
                      checked={selectedStatus === val}
                      onChange={() => setSelectedStatus(val)}
                      className="accent-teal-600"
                    />
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>
          <div className="flex-1">
            {filtered.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <p className="text-lg">Hech narsa topilmadi</p>
                <p className="text-sm mt-1">Filtlarni o&#39;zgartiring</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((s) => (
                  <ScholarshipCard key={s.id} scholarship={s} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
