'use client';
import { useState } from 'react';

interface FAQ {
  id: string;
  question_uz: string;
  question_ru?: string;
  question_en?: string;
  answer_uz: string;
  answer_ru?: string;
  answer_en?: string;
  display_order: number;
}

interface Props {
  faqs: FAQ[];
  locale: string;
  title: string;
}

export default function ScholarshipFAQ({ faqs, locale, title }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);

  if (faqs.length === 0) return null;

  function field(item: FAQ, base: 'question' | 'answer') {
    return (item as any)[`${base}_${locale}`] || (item as any)[`${base}_uz`] || '';
  }

  return (
    <div className="mb-12">
      <h2 className="font-display text-2xl sm:text-3xl text-heading mb-6">{title}</h2>
      <div className="bg-card border border-card rounded-2xl overflow-hidden">
        {faqs.map((item, i) => {
          const isOpen = openId === item.id;
          return (
            <div key={item.id} className={i > 0 ? 'border-t border-line' : ''}>
              <button
                onClick={() => setOpenId(isOpen ? null : item.id)}
                aria-expanded={isOpen}
                className="w-full flex items-center justify-between text-left px-5 py-4 text-heading font-semibold text-sm hover:text-accent transition-colors"
              >
                <span>{field(item, 'question')}</span>
                <svg
                  className={`w-4 h-4 ml-3 flex-shrink-0 text-muted-e transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              <div
                className="px-5 overflow-hidden transition-all duration-300 ease-in-out text-body text-sm leading-relaxed"
                style={{ maxHeight: isOpen ? '20rem' : '0px', paddingBottom: isOpen ? '1rem' : '0px' }}
              >
                {field(item, 'answer')}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
