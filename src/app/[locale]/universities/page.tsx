import { setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import UniversityCard from '@/components/universities/UniversityCard';
import UniversityFilters from '@/components/universities/UniversityFilters';
import type { University } from '@/types';

const SAMPLE_UNIVERSITIES: University[] = [
  { id: '1', name: 'Istanbul University', country: 'Turkiya', city: 'Istanbul', tuition_min: 500, tuition_max: 2000, currency: 'USD', programs: ['Tibbiyot', 'Muhandislik', 'Iqtisodiyot', 'Huquq'], language_of_instruction: 'Turk tili', requirements: 'YLS/SAT natijasi, til sertifikati', deadline: '2025-05-01', website_url: 'https://istanbul.edu.tr', status: 'accepting', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
];

// Maps a DB row from `universities` table into the legacy University shape expected by UniversityCard.
// The DB schema has no language_of_instruction/requirements/deadline/status columns, so those are
// filled with sensible defaults since UniversityCard requires them for rendering.
function mapDbUniversity(row: any): University {
  return {
    id: String(row.id),
    name: row.name,
    country: row.country,
    city: row.city ?? '',
    tuition_min: row.tuition_usd ?? 0,
    tuition_max: row.tuition_usd ?? 0,
    currency: 'USD',
    programs: row.programs ?? [],
    language_of_instruction: 'Ingliz tili',
    requirements: '',
    deadline: '',
    website_url: row.website_url ?? '',
    status: 'accepting',
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export default async function UniversitiesPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);

  let universities: University[] = SAMPLE_UNIVERSITIES;
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from('universities').select('*');
    if (!error && data && data.length > 0) {
      universities = data.map(mapDbUniversity);
    }
  } catch {
    // keep sample fallback
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] dark:bg-gray-950 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Universitetlar</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Tolov asosida xorijiy universitetlar katalogi</p>
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 flex-shrink-0"><UniversityFilters /></aside>
          <div className="flex-1 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {universities.map((u) => <UniversityCard key={u.id} university={u} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
