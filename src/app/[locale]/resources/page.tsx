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
    <main className="min-h-screen bg-page">
      <section className="pt-16 sm:pt-24 pb-10 sm:pb-14 border-b border-line">
        <div className="container-page">
          <h1 className="display text-5xl sm:text-6xl mb-4">{t('pageTitle')}</h1>
          <p className="text-lg text-body max-w-2xl">{t('pageSubtitle')}</p>
        </div>
      </section>

      <section className="container-page pt-4 pb-20 sm:pb-28">
        {resources.length === 0 ? (
          <p className="text-muted-e text-center py-16">{t('noResources')}</p>
        ) : (
          <div>
            {resources.map((resource) => {
              const title = getField(resource, 'title');
              const description = getField(resource, 'description');
              return (
                <div key={resource.id} className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 py-7 sm:py-8 border-b border-line">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-1.5">
                      <h3 className="font-display text-lg sm:text-xl text-heading leading-snug">{title}</h3>
                      {resource.category && (
                        <span className="chip flex-shrink-0">{resource.category}</span>
                      )}
                    </div>
                    {description && (
                      <p className="text-sm text-muted-e">{description}</p>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    <DownloadButton fileUrl={resource.file_url} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
