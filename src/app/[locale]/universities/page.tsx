import { setRequestLocale, getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import UniversityList from '@/components/universities/UniversityList';
import PageNav from '@/components/shared/PageNav';
import type { University } from '@/lib/supabase/types';

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
    <div className="min-h-screen bg-page">
      {/* Page hero */}
      <section className="pt-10 sm:pt-14 pb-10 sm:pb-14 border-b border-line">
        <div className="container-page">
          <PageNav backHref={`/${locale}#universities`} />
          <h1 className="display text-4xl sm:text-6xl mt-8 mb-4">{t('pageTitle')}</h1>
          <p className="text-lg text-body max-w-2xl">{t('pageSubtitle')}</p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="container-page">
          <UniversityList universities={universities} locale={locale} />
          <div className="mt-14 rounded-2xl border border-line bg-card px-6 py-5">
            <p className="text-sm text-body">{t('moreComing')}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
