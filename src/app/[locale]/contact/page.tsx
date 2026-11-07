import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import ContactForm from '@/components/shared/ContactForm';
import PageNav from '@/components/shared/PageNav';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const titles: Record<string, string> = {
    uz: "Bog'lanish — Jamshid Murodboev",
    ru: "Контакт — Jamshid Murodboev",
    en: "Contact — Jamshid Murodboev",
  };
  const descriptions: Record<string, string> = {
    uz: "Jamshid Murodboev bilan bog'laning va grant bo'yicha konsultatsiya oling.",
    ru: "Свяжитесь с Jamshid Murodboev и получите консультацию по грантам.",
    en: "Contact Jamshid Murodboev and get a consultation about scholarships.",
  };
  return { title: titles[locale] ?? titles.uz, description: descriptions[locale] ?? descriptions.uz };
}

export default async function ContactPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'contact' });
  return (
    <div className="min-h-screen bg-[#f0f9f8] dark:bg-[#0d1117] py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageNav backHref={`/${locale}`} />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('title')}</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">{t('autoNote')}</p>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
