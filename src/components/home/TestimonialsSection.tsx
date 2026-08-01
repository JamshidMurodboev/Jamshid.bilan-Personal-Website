'use client';
import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import type { Testimonial } from '@/lib/supabase/types';

const FALLBACK: Testimonial[] = [
  {
    id: 'f1',
    quote_uz: "Jamshid akaning yordami bilan motivatsiya xatimni qaytadan yozdim va grantga o'tdim.",
    quote_ru: 'С помощью Джамшида ака я переписала мотивационное письмо и выиграла грант.',
    quote_en: "With Jamshid's help I rewrote my motivation letter and won the scholarship.",
    student_name: 'Aziza',
    outcome_uz: "Türkiye Burslari granti g'olibi",
    outcome_ru: 'Победитель гранта Türkiye Bursları',
    outcome_en: 'Türkiye Bursları scholarship winner',
    sort_order: 1,
    created_at: '', updated_at: '',
  },
  {
    id: 'f2',
    quote_uz: "Hujjatlarni tayyorlashda har bir bosqichda yo'l-yo'riq ko'rsatdi.",
    quote_ru: 'Он направлял меня на каждом этапе подготовки документов.',
    quote_en: 'He guided me through every step of preparing my documents.',
    student_name: 'Bekzod',
    outcome_uz: 'Istanbul University, 2024',
    outcome_ru: 'Istanbul University, 2024',
    outcome_en: 'Istanbul University, 2024',
    sort_order: 2,
    created_at: '', updated_at: '',
  },
  {
    id: 'f3',
    quote_uz: "Konsultatsiya va hujjat tayyorlashda juda katta yordam ko'rsatdi. Minnatdorman!",
    quote_ru: 'Оказал большую помощь в консультации и подготовке документов. Очень благодарен!',
    quote_en: 'Provided great help with consultation and document preparation. Very grateful!',
    student_name: 'Malika',
    outcome_uz: 'DAAD granti, Germaniya',
    outcome_ru: 'Грант DAAD, Германия',
    outcome_en: 'DAAD grant, Germany',
    sort_order: 3,
    created_at: '', updated_at: '',
  },
];

export default function TestimonialsSection() {
  const locale = useLocale();
  const t = useTranslations('testimonials');
  const [items, setItems] = useState<Testimonial[]>(FALLBACK);

  useEffect(() => {
    createClient()
      .from('testimonials')
      .select('*')
      .order('sort_order', { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) setItems(data as Testimonial[]);
      });
  }, []);

  function field(item: Testimonial, base: 'quote' | 'outcome') {
    return (item as any)[`${base}_${locale}`] || (item as any)[`${base}_uz`];
  }

  const preview = items.slice(0, 3);

  return (
    <section id="testimonials" className="py-16 px-4 bg-gray-50 dark:bg-[#161b22]">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-[2rem] font-bold text-[#0f172a] dark:text-[#e6edf3] text-center mb-2">{t('title')}</h2>
        <p className="text-[#64748b] dark:text-[#8b949e] text-center mb-10">{t('subtitle')}</p>

        {/* Mobile: horizontal scroll */}
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 sm:hidden -mx-4 px-4">
          {preview.map((item) => (
            <TestimonialCard key={item.id} item={item} locale={locale} quote={field(item, 'quote')} outcome={field(item, 'outcome')} className="min-w-[85%] snap-start" />
          ))}
        </div>

        {/* Desktop: 3-column grid */}
        <div className="hidden sm:grid sm:grid-cols-3 gap-6">
          {preview.map((item) => (
            <TestimonialCard key={item.id} item={item} locale={locale} quote={field(item, 'quote')} outcome={field(item, 'outcome')} />
          ))}
        </div>

        <div className="flex justify-center mt-8">
          <Link
            href={`/${locale}/testimonials`}
            className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-teal-700 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 px-6 py-2.5 rounded-xl text-sm font-semibold transition shadow-sm"
          >
            {t('viewAll')}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ item, locale, quote, outcome, className = '' }: { item: Testimonial; locale: string; quote: string; outcome: string; className?: string }) {
  const isFallback = item.id.startsWith('f');
  const inner = (
    <div className={`bg-white dark:bg-[#0d1117] rounded-2xl p-6 shadow-sm border border-[#e2e8f0] dark:border-[#21262d] hover:shadow-md transition h-full flex flex-col justify-between ${className}`}>
      <p className="text-[#334155] dark:text-[#8b949e] leading-relaxed mb-4 line-clamp-5">&ldquo;{quote}&rdquo;</p>
      <div className="flex items-center gap-3 mt-auto">
        {item.photo_url ? (
          <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
            <Image src={item.photo_url} alt={item.student_name} fill className="object-cover" />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-[#ccfbf1] dark:bg-[#0d2d2a] text-[#0f766e] dark:text-[#2dd4bf] flex items-center justify-center font-bold flex-shrink-0">
            {item.student_name[0]}
          </div>
        )}
        <div>
          <div className="font-semibold text-[#0f172a] dark:text-[#e6edf3] text-sm">{item.student_name}</div>
          <div className="text-xs text-[#64748b] dark:text-[#8b949e]">{outcome}</div>
        </div>
      </div>
    </div>
  );

  if (!isFallback) {
    return <Link href={`/${locale}/testimonials/${item.id}`} className="block h-full">{inner}</Link>;
  }
  return inner;
}
