'use client';
import { useTranslations, useLocale } from 'next-intl';
import { useState, useEffect } from 'react';
import ContactModal from '@/components/shared/ContactModal';
import { createClient } from '@/lib/supabase/client';

const COLOR_MAP: Record<string, { card: string; num: string }> = {
  teal:   { card: 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800',     num: 'text-teal-600 dark:text-teal-400' },
  purple: { card: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800', num: 'text-purple-600 dark:text-purple-400' },
  amber:  { card: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',   num: 'text-amber-600 dark:text-amber-400' },
  sky:    { card: 'bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800',           num: 'text-sky-600 dark:text-sky-400' },
};

interface ProcessStep {
  id: string;
  number: string;
  icon: string;
  title_uz?: string; title_ru?: string; title_en?: string;
  desc_uz?: string;  desc_ru?: string;  desc_en?: string;
  color_key?: string;
  sort_order?: number;
}

const FALLBACK = [
  { number: '01', icon: '📅', titleKey: 'step1Title', descKey: 'step1Desc', colorKey: 'teal' },
  { number: '02', icon: '📋', titleKey: 'step2Title', descKey: 'step2Desc', colorKey: 'purple' },
  { number: '03', icon: '🎯', titleKey: 'step3Title', descKey: 'step3Desc', colorKey: 'amber' },
  { number: '04', icon: '🚀', titleKey: 'step4Title', descKey: 'step4Desc', colorKey: 'sky' },
];

export default function ProcessSection() {
  const t = useTranslations('process');
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [dbSteps, setDbSteps] = useState<ProcessStep[]>([]);

  useEffect(() => {
    createClient()
      .from('process_steps')
      .select('*')
      .order('sort_order', { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) setDbSteps(data as ProcessStep[]);
      });
  }, []);

  const steps = dbSteps.length > 0
    ? dbSteps.map(s => ({
        number: s.number,
        icon: s.icon,
        title: (s as any)[`title_${locale}`] || s.title_uz || '',
        desc: (s as any)[`desc_${locale}`] || s.desc_uz || '',
        colorKey: s.color_key || 'teal',
      }))
    : FALLBACK.map(s => ({
        number: s.number,
        icon: s.icon,
        title: t(s.titleKey as any),
        desc: t(s.descKey as any),
        colorKey: s.colorKey,
      }));

  return (
    <section className="py-24 px-4 bg-gray-50 dark:bg-[#0d1117]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-bold uppercase tracking-[0.15em] text-teal-600 dark:text-teal-400 mb-3">{t('label')}</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">{t('title')}</h2>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">{t('subtitle')}</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {steps.map(step => {
            const colors = COLOR_MAP[step.colorKey] || COLOR_MAP.teal;
            return (
              <div key={step.number} className={`border-2 ${colors.card} rounded-2xl p-6 h-full`}>
                <div className={`text-3xl font-black ${colors.num} mb-3 font-mono`}>{step.number}</div>
                <div className="text-3xl mb-3">{step.icon}</div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{step.desc}</p>
              </div>
            );
          })}
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
