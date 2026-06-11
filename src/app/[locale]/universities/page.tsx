import { setRequestLocale } from 'next-intl/server';
import UniversityCard from '@/components/universities/UniversityCard';
import UniversityFilters from '@/components/universities/UniversityFilters';
import type { University } from '@/types';

const SAMPLE_UNIVERSITIES: University[] = [
  {
    id: '1',
    name: 'Istanbul University',
    country: 'Turkiya',
    city: 'Istanbul',
    tuition_min: 500,
    tuition_max: 2000,
    currency: 'USD',
    programs: ['Tibbiyot', 'Muhandislik', 'Iqtisodiyot', 'Huquq'],
    language_of_instruction: 'Turk tili',
    requirements: 'YLS/SAT natijasi, til sertifikati',
    deadline: '2025-05-01',
    website_url: 'https://istanbul.edu.tr',
    status: 'accepting',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

export default function UniversitiesPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Universitetlar</h1>
        <p className="text-gray-600 mb-8">Tolov asosida xorijiy universitetlar katalogi</p>
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 flex-shrink-0"><UniversityFilters /></aside>
          <div className="flex-1 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {SAMPLE_UNIVERSITIES.map((u) => <UniversityCard key={u.id} university={u} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
