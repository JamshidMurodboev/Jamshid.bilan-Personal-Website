'use client';
import { useTranslations, useLocale } from 'next-intl';
import { useState, useEffect } from 'react';
import ContactModal from '@/components/shared/ContactModal';
import { createClient } from '@/lib/supabase/client';

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
  { number: '01', titleKey: 'step1Title', descKey: 'step1Desc' },
  { number: '02', titleKey: 'step2Title', descKey: 'step2Desc' },
  { number: '03', titleKey: 'step3Title', descKey: 'step3Desc' },
  { number: '04', titleKey: 'step4Title', descKey: 'step4Desc' },
];

export default function ProcessSection() {
  const t = useTranslations('process');
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [dbSteps, setDbSteps] = useState<ProcessStep[] | null>(null);

  useEffect(() => {
    createClient()
      .from('process_steps')
      .select('*')
      .order('sort_order', { ascending: true })
      .then(({ data }) => {
        setDbSteps(data && data.length > 0 ? data as ProcessStep[] : []);
      });
  }, []);

  const steps = dbSteps !== null && dbSteps.length > 0
    ? dbSteps.map(s => ({
        number: s.number,
        title: (s as any)[`title_${locale}`] || s.title_uz || '',
        desc: (s as any)[`desc_${locale}`] || s.desc_uz || '',
      }))
    : FALLBACK.map(s => ({
        number: s.number,
        title: t(s.titleKey as any),
        desc: t(s.descKey as any),
      }));

  return (
    <section className="section-pad bg-soft border-y border-line">
      <div className="container-page">
        <div className="mb-14">
          <p className="eyebrow mb-4">03 — {t('label')}</p>
          <h2 className="display text-4xl sm:text-5xl mb-4">{t('title')}</h2>
          <p className="text-lg text-body max-w-2xl">{t('subtitle')}</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-12 mb-16">
          {steps.map(step => (
            <div key={step.number} className="border-t border-line pt-6">
              <div className="font-display text-6xl text-accent leading-none mb-5">{step.number}</div>
              <h3 className="font-display text-xl text-heading mb-2 leading-snug">{step.title}</h3>
              <p className="text-sm text-body leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button onClick={() => setOpen(true)} className="btn-ink">
            {t('cta')}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </div>
      <ContactModal isOpen={open} onClose={() => setOpen(false)} />
    </section>
  );
}
