import { setRequestLocale, getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import DownloadButton from '@/components/resources/DownloadButton';

interface Resource {
  id: string;
  title_uz: string;
  title_ru?: string;
  title_en?: string;
  description_uz?: string;
  description_ru?: string;
  description_en?: string;
  file_url: string;
  category: string;
}

const SAMPLE_RESOURCES: Resource[] = [
  {
    id: 'sample-1',
    title_uz: "CV namunasi (Türkiye Burslari uchun)",
    title_ru: "Образец CV (для Türkiye Bursları)",
    title_en: "CV Template (for Türkiye Bursları)",
    description_uz: "Grant ariza jarayonida ishlatish uchun tayyor CV shabloni",
    description_ru: "Готовый шаблон резюме для процесса подачи заявки на грант",
    description_en: "Ready-to-use CV template for the grant application process",
    file_url: "#",
    category: "cv",
  },
  {
    id: 'sample-2',
    title_uz: "Motivatsion xat namunasi",
    title_ru: "Образец мотивационного письма",
    title_en: "Motivation Letter Sample",
    description_uz: "Muvaffaqiyatli motivatsion xat yozish uchun namuna",
    description_ru: "Образец для написания успешного мотивационного письма",
    description_en: "Sample for writing a successful motivation letter",
    file_url: "#",
    category: "letter",
  },
];

export default async function ResourcesPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'resources' });

  let resources: Resource[] = SAMPLE_RESOURCES;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('resources').select('*').order('created_at', { ascending: false });
    if (!error && data && data.length > 0) {
      resources = data as Resource[];
    }
  } catch {
    // table may not exist yet — use sample data
  }

  function getField(item: Resource, base: 'title' | 'description'): string {
    return (item as any)[`${base}_${locale}`] || (item as any)[`${base}_uz`] || '';
  }

  return (
    <main className="min-h-screen bg-[#f0f9f8] dark:bg-[#0d1117] py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('pageTitle')}</h1>
          <p className="text-gray-600 dark:text-gray-400">{t('pageSubtitle')}</p>
        </div>

        {resources.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-12">{t('noResources')}</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {resources.map((resource) => {
              const title = getField(resource, 'title');
              const description = getField(resource, 'description');
              return (
                <div key={resource.id} className="bg-white dark:bg-[#161b22] rounded-xl border border-[#e2e8f0] dark:border-[#21262d] p-5 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
                    {resource.category && (
                      <span className="flex-shrink-0 text-xs px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400">
                        {resource.category}
                      </span>
                    )}
                  </div>
                  {description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
                  )}
                  <div className="mt-auto pt-1">
                    <DownloadButton fileUrl={resource.file_url} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
