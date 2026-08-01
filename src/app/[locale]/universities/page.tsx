import { setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import UniversityList from '@/components/universities/UniversityList';
import PageNav from '@/components/shared/PageNav';
import type { University } from '@/lib/supabase/types';

export default async function UniversitiesPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);

  let universities: University[] = [];
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from('universities').select('*').order('name');
    if (!error && data) universities = data as University[];
  } catch {}

  return (
    <div className="min-h-screen bg-[#f0f9f8] dark:bg-[#0d1117] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageNav />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Universitetlar</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">To&apos;lov asosida xorijiy universitetlar katalogi</p>
        <UniversityList universities={universities} locale={locale} />
      </div>
    </div>
  );
}
