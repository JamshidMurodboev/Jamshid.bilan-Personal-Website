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
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h2>
      <div className="space-y-2">
        {faqs.map((item) => {
          const isOpen = openId === item.id;
          return (
            <div key={item.id} className="bg-gray-50 dark:bg-[#161b22] border border-[#e2e8f0] dark:border-[#21262d] rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenId(isOpen ? null : item.id)}
                className="w-full flex items-center justify-between text-left px-5 py-4 text-gray-900 dark:text-gray-100 font-medium text-sm"
              >
                <span>{field(item, 'question')}</span>
                <span className={`transition-transform duration-200 text-gray-400 dark:text-gray-500 ml-3 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}>⌄</span>
              </button>
              <div
                className="px-5 overflow-hidden transition-all duration-300 ease-in-out text-gray-600 dark:text-gray-400 text-sm"
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
