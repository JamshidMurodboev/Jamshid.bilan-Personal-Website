import { setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import UniversityCard from '@/components/universities/UniversityCard';
import UniversityFilters from '@/components/universities/UniversityFilters';
import type { University } from '@/lib/supabase/types';

const SAMPLE_UNIVERSITIES: University[] = [
  { id: '1', name: 'Istanbul University', country: 'Turkiya', city: 'Istanbul', website_url: 'https://istanbul.edu.tr', tuition_usd: 1200, type: 'public', ranking: 450, programs: ['Tibbiyot', 'Muhandislik', 'Iqtisodiyot', 'Huquq'], created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
];

export default async function UniversitiesPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);

  let universities: University[] = SAMPLE_UNIVERSITIES;
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from('universities').select('*');
    if (!error && data && data.length > 0) universities = data as University[];
  } catch {}

  return (
    <div className="min-h-screen bg-[#f0f9f8] dark:bg-[#0d1117] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Universitetlar</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">To'lov asosida xorijiy universitetlar katalogi</p>
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="lg:w-60 flex-shrink-0"><UniversityFilters /></aside>
          <div className="flex-1 grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {universities.map((u) => <UniversityCard key={u.id} university={u} locale={locale} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
