import { setRequestLocale, getTranslations } from 'next-intl/server';
import ContactForm from '@/components/shared/ContactForm';

export default async function ContactPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'contact' });
  return (
    <div className="min-h-screen bg-[#f0f9f8] dark:bg-[#0d1117] py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('title')}</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">{t('autoNote')}</p>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
