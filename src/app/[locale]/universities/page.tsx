import { setRequestLocale, getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import UniversityList from '@/components/universities/UniversityList';
import PageNav from '@/components/shared/PageNav';
import type { University } from '@/lib/supabase/types';
import AuthGuard from '@/components/auth/AuthGuard';

export default async function UniversitiesPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'universities' });

  let universities: University[] = [];
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from('universities').select('*').order('home_order', { ascending: true, nullsFirst: false }).order('name', { ascending: true });
    if (!error && data) universities = data as University[];
  } catch {}

  return (
    <AuthGuard>
    <div className="min-h-screen bg-[#f0f9f8] dark:bg-[#0d1117] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageNav backHref={`/${locale}#universities`} />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('pageTitle')}</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">{t('pageSubtitle')}</p>
        <UniversityList universities={universities} locale={locale} />
        <div className="mt-8 flex items-center gap-3 rounded-2xl border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-900/20 px-5 py-4 text-sm text-teal-700 dark:text-teal-300">
          <span className="text-lg">🚀</span>
          {t('moreComing')}
        </div>
      </div>
    </div>
    </AuthGuard>
  );
}
