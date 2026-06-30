import { setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import StudentCard from '@/components/results/StudentCard';
import type { StudentResult } from '@/lib/supabase/types';

const SAMPLE_RESULTS: StudentResult[] = [
  { id: '1', student_name: 'Aziz Karimov', degree_level: 'bachelor', year: 2023, country: 'Turkiya', testimonial: 'Jamshid akaning yordami bilan orzuimga yetdim!', created_at: '2024-01-01T00:00:00Z' },
  { id: '2', student_name: 'Malika Yusupova', degree_level: 'master', year: 2022, country: 'Turkiya', testimonial: 'Grant olish mumkin ekan!', created_at: '2024-01-01T00:00:00Z' },
];

export default async function ResultsPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);

  let results: StudentResult[] = SAMPLE_RESULTS;
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from('student_results').select('*').order('created_at', { ascending: false });
    if (!error && data && data.length > 0) results = data as StudentResult[];
  } catch {}

  const studentsHelped = results.length;
  const countriesCount = new Set(results.map((r) => r.country)).size;
  const years = results.map((r) => r.year);
  const yearsActive = years.length > 0 ? Math.max(1, new Date().getFullYear() - Math.min(...years) + 1) : 1;

  return (
    <div className="min-h-screen bg-[#f0f9f8] dark:bg-[#0d1117] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Talaba', value: studentsHelped },
            { label: 'Mamlakat', value: countriesCount },
            { label: 'Yil', value: yearsActive },
          ].map((s) => (
            <div key={s.label} className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="text-4xl font-bold text-teal-700 dark:text-teal-400">{s.value}+</div>
              <div className="text-gray-600 dark:text-gray-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Muvaffaqiyat tarihlari</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((r) => <StudentCard key={r.id} result={r} locale={locale} />)}
        </div>
      </div>
    </div>
  );
}
