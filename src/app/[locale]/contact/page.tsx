import { setRequestLocale, getTranslations } from 'next-intl/server';
import ContactForm from '@/components/shared/ContactForm';
import PageNav from '@/components/shared/PageNav';

export default async function ContactPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'contact' });
  return (
    <div className="min-h-screen bg-page py-12 sm:py-16">
      <div className="max-w-2xl mx-auto px-5 sm:px-8">
        <PageNav backHref={`/${locale}`} />
        <h1 className="display text-4xl sm:text-5xl mt-8 mb-4">{t('title')}</h1>
        <p className="text-body mb-10">{t('autoNote')}</p>
        <div className="bg-card border border-card rounded-3xl p-6 sm:p-10">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
