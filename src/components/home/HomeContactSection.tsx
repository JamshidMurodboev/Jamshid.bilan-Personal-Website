'use client';
import { useTranslations } from 'next-intl';
import ContactForm from '@/components/shared/ContactForm';

export default function HomeContactSection() {
  const t = useTranslations('contact');
  return (
    <section className="py-16 px-4 bg-[#0d9488] dark:bg-[#0D1F3C]" id="contact">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-2 text-center">{t('title')}</h2>
        <p className="text-white/70 text-center mb-8">{t('autoNote')}</p>
        <div className="bg-white dark:bg-[#161b22] rounded-2xl shadow-sm border border-white/20 dark:border-[#21262d] p-6">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
