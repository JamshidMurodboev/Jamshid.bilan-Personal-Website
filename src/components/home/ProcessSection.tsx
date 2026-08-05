'use client';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import ContactModal from '@/components/shared/ContactModal';

const STEPS = [
  {
    number: '01',
    icon: '📅',
    titleKey: 'step1Title',
    descKey: 'step1Desc',
    color: 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800',
    numColor: 'text-teal-600 dark:text-teal-400',
  },
  {
    number: '02',
    icon: '📋',
    titleKey: 'step2Title',
    descKey: 'step2Desc',
    color: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
    numColor: 'text-purple-600 dark:text-purple-400',
  },
  {
    number: '03',
    icon: '🎯',
    titleKey: 'step3Title',
    descKey: 'step3Desc',
    color: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    numColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    number: '04',
    icon: '🚀',
    titleKey: 'step4Title',
    descKey: 'step4Desc',
    color: 'bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800',
    numColor: 'text-sky-600 dark:text-sky-400',
  },
];

export default function ProcessSection() {
  const t = useTranslations('process');
  const [open, setOpen] = useState(false);

  return (
    <section className="py-24 px-4 bg-gray-50 dark:bg-[#0d1117]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-bold uppercase tracking-[0.15em] text-teal-600 dark:text-teal-400 mb-3">{t('label')}</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">{t('title')}</h2>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">{t('subtitle')}</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {STEPS.map((step, i) => (
            <div key={step.number} className="relative">
              {i < STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent z-10 -ml-3" />
              )}
              <div className={`relative border-2 ${step.color} rounded-2xl p-6 h-full`}>
                <div className={`text-3xl font-black ${step.numColor} mb-3 font-mono`}>{step.number}</div>
                <div className="text-3xl mb-3">{step.icon}</div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">{t(step.titleKey as any)}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{t(step.descKey as any)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white px-10 py-4 rounded-2xl font-bold text-base shadow-lg shadow-teal-900/20 transition-all hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {t('cta')}
          </button>
        </div>
      </div>
      <ContactModal isOpen={open} onClose={() => setOpen(false)} />
    </section>
  );
}
